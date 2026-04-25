import { randomUUID } from 'crypto'
import { access, mkdir, stat } from 'fs/promises'
import { basename, extname, isAbsolute, join, relative, resolve } from 'path'
import sharp from 'sharp'

import {
  generatePrintableRatiosOptionsSchema,
  imageCardsMetadataSchema,
  sharpValidationResultSchema,
  updateImageCardInputSchema
} from '../../shared/schemas/image-pipeline'
import {
  buildOutputFilename,
  buildRatioSelections,
  detectSourceOrientation,
  getLargestExportSize,
  getOrientationForPreset,
  getPreviewCrop,
  getPrintableRatioPresets,
  normalizeArtworkBaseName,
  pickInitialActiveRatioGroup
} from '../../shared/image-pipeline'
import type {
  GeneratePrintableRatiosOptions,
  GeneratePrintableRatiosResult,
  GeneratedPipelineOutput,
  ImageCard,
  ImageCardsMetadata,
  PrintableExportSize,
  PrintableRatioPreset,
  RatioPresetSettings,
  UpdateImageCardInput
} from '../../shared/image-pipeline'
import type { ArtworkItem, SharpValidationResult } from '../../shared/types/ipc'
import { readJsonFile, writeJsonFile } from './jsonStore'
import { listArtworkFilesInProject } from './artworkService'
import { listProjectsInWorkspace } from './workspaceService'
import { createJob, updateJob } from './jobService'
import { defaultImagePipelineSettings } from '../../shared/image-pipeline/settings'

function assertPathInside(parentPath: string, childPath: string): void {
  const resolvedParent = resolve(parentPath)
  const resolvedChild = resolve(childPath)
  const relation = relative(resolvedParent, resolvedChild)

  if (relation === '' || (!relation.startsWith('..') && !isAbsolute(relation))) return

  throw new Error('Resolved image pipeline path is outside the project')
}

function imageCardsPath(projectPath: string): string {
  return join(projectPath, '.atelier', 'image-cards.json')
}

const ratioSelectionSettings: Partial<RatioPresetSettings> = {
  includeBonusGroups: true
}

function printableRatiosPath(projectPath: string): string {
  return join(projectPath, '03-printable-ratios')
}

async function loadImageCards(projectPath: string): Promise<ImageCardsMetadata> {
  const fallback: ImageCardsMetadata = { items: [] }
  const raw = await readJsonFile(imageCardsPath(projectPath), fallback)
  const parsed = imageCardsMetadataSchema.safeParse(raw)
  return parsed.success ? parsed.data : fallback
}

async function saveImageCards(projectPath: string, metadata: ImageCardsMetadata): Promise<void> {
  await writeJsonFile(imageCardsPath(projectPath), imageCardsMetadataSchema.parse(metadata))
}

async function pathExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath)
    return true
  } catch {
    return false
  }
}

async function getAvailableOutputFilename(
  outputFolderPath: string,
  filename: string
): Promise<string> {
  const extension = extname(filename)
  const nameWithoutExtension = basename(filename, extension)
  let candidate = filename
  let suffix = 2

  while (await pathExists(join(outputFolderPath, candidate))) {
    candidate = `${nameWithoutExtension}-${suffix}${extension}`
    suffix += 1
  }

  return candidate
}

async function resolveProjectPath(workspacePath: string, projectId: string): Promise<string> {
  const project = (await listProjectsInWorkspace(workspacePath)).find(
    (entry) => entry.id === projectId
  )
  if (!project) throw new Error('Project not found')

  const projectPath = join(workspacePath, 'projects', project.slug)
  assertPathInside(join(workspacePath, 'projects'), projectPath)
  return projectPath
}

export async function validateSharp(): Promise<SharpValidationResult> {
  const result = await sharp({
    create: {
      width: 2,
      height: 2,
      channels: 4,
      background: { r: 242, g: 196, b: 77, alpha: 1 }
    }
  })
    .resize(1, 1)
    .png()
    .toBuffer({ resolveWithObject: true })

  return sharpValidationResultSchema.parse({
    sharpVersion: sharp.versions.sharp,
    libvipsVersion: sharp.versions.vips,
    outputFormat: result.info.format,
    width: result.info.width,
    height: result.info.height,
    sizeBytes: result.data.length
  })
}

function shouldResetDerivedCardState(
  existing: ImageCard | undefined,
  width: number,
  height: number
): boolean {
  return !existing || existing.width !== width || existing.height !== height
}

function createImageCardFromArtwork(input: {
  artwork: ArtworkItem
  existing: ImageCard | undefined
  width: number
  height: number
  format: string
  density: number | null
  sizeBytes: number
  metadataScannedAt: string
}): ImageCard {
  const { artwork, existing, width, height, format, density, sizeBytes, metadataScannedAt } = input
  const sourceOrientation = detectSourceOrientation(width, height)
  const outputOrientation = getOrientationForPreset(sourceOrientation, 'print_bundle')
  const resetDerivedState = shouldResetDerivedCardState(existing, width, height)
  const preservedCard = resetDerivedState ? null : existing
  const ratioSelections = resetDerivedState
    ? buildRatioSelections(width, height, outputOrientation, ratioSelectionSettings)
    : (preservedCard?.ratioSelections ??
      buildRatioSelections(width, height, outputOrientation, ratioSelectionSettings))
  const activeRatioGroupKey = resetDerivedState
    ? pickInitialActiveRatioGroup(outputOrientation, ratioSelections, ratioSelectionSettings)
    : preservedCard?.activeRatioGroupKey

  return {
    id: existing?.id ?? randomUUID(),
    artworkId: artwork.id,
    fileName: artwork.filename,
    baseName: existing?.baseName ?? normalizeArtworkBaseName(artwork.filename),
    relativePath: artwork.relativePath,
    width,
    height,
    format,
    density,
    sizeBytes,
    sourceOrientation,
    outputOrientation,
    ratioSelections,
    manualMode: preservedCard?.manualMode ?? false,
    activeRatioGroupKey: activeRatioGroupKey ?? '',
    manualCrops: preservedCard?.manualCrops ?? {},
    upscaledAsset: preservedCard?.upscaledAsset ?? null,
    outputs: preservedCard?.outputs ?? [],
    metadataScannedAt
  }
}

function recalculateCardRatios(
  card: ImageCard,
  outputOrientation: ImageCard['outputOrientation']
): ImageCard {
  const ratioSelections = buildRatioSelections(
    card.width,
    card.height,
    outputOrientation,
    ratioSelectionSettings
  )

  return {
    ...card,
    outputOrientation,
    ratioSelections,
    activeRatioGroupKey: pickInitialActiveRatioGroup(
      outputOrientation,
      ratioSelections,
      ratioSelectionSettings
    ),
    manualMode: false,
    manualCrops: {},
    outputs: []
  }
}

function applyRatioSelectionUpdates(
  card: ImageCard,
  ratioSelections: NonNullable<UpdateImageCardInput['ratioSelections']>
): ImageCard {
  const nextSelections = {
    ...buildRatioSelections(
      card.width,
      card.height,
      card.outputOrientation,
      ratioSelectionSettings
    ),
    ...card.ratioSelections
  }

  for (const [ratioKey, update] of Object.entries(ratioSelections)) {
    if (!nextSelections[ratioKey]) continue

    nextSelections[ratioKey] = {
      ...nextSelections[ratioKey],
      selected: update.selected
    }
  }

  const activeRatioGroupKey =
    nextSelections[card.activeRatioGroupKey]?.selected || !card.activeRatioGroupKey
      ? card.activeRatioGroupKey
      : pickInitialActiveRatioGroup(card.outputOrientation, nextSelections, ratioSelectionSettings)

  return {
    ...card,
    ratioSelections: nextSelections,
    activeRatioGroupKey
  }
}

function getSelectedRatioJobs(
  card: ImageCard,
  options: Required<Pick<GeneratePrintableRatiosOptions, 'exportLargestOnly'>>
): Array<{ preset: PrintableRatioPreset; sizes: PrintableExportSize[] }> {
  return getPrintableRatioPresets(card.outputOrientation, ratioSelectionSettings)
    .filter((preset) => card.ratioSelections[preset.key]?.selected)
    .map((preset) => {
      const largestSize = getLargestExportSize(preset)
      return {
        preset,
        sizes: options.exportLargestOnly ? (largestSize ? [largestSize] : []) : preset.exports
      }
    })
    .filter((job) => job.sizes.length > 0)
}

function toSharpExtractRegion(
  crop: NonNullable<ReturnType<typeof getPreviewCrop>>,
  card: ImageCard
): sharp.Region {
  const left = Math.max(0, Math.floor(crop.x))
  const top = Math.max(0, Math.floor(crop.y))
  const width = Math.max(1, Math.min(card.width - left, Math.round(crop.width)))
  const height = Math.max(1, Math.min(card.height - top, Math.round(crop.height)))

  return {
    left,
    top,
    width,
    height
  }
}

export async function listImageCardsInProject(
  workspacePath: string,
  projectId: string
): Promise<ImageCard[]> {
  const projectPath = await resolveProjectPath(workspacePath, projectId)
  return (await loadImageCards(projectPath)).items
}

export async function scanSourceArtworksInProject(
  workspacePath: string,
  projectId: string
): Promise<ImageCard[]> {
  const projectPath = await resolveProjectPath(workspacePath, projectId)
  const artworks = await listArtworkFilesInProject(workspacePath, projectId)
  const existingCards = await loadImageCards(projectPath)
  const existingByArtworkId = new Map(
    existingCards.items.map((card) => [card.artworkId, card] as const)
  )
  const scannedAt = new Date().toISOString()
  const nextCards: ImageCard[] = []

  for (const artwork of artworks) {
    const filePath = join(projectPath, artwork.relativePath)
    assertPathInside(projectPath, filePath)

    const [metadata, stats] = await Promise.all([sharp(filePath).metadata(), stat(filePath)])
    if (!metadata.width || !metadata.height) {
      throw new Error(`Unable to read image dimensions for ${artwork.filename}`)
    }

    nextCards.push(
      createImageCardFromArtwork({
        artwork,
        existing: existingByArtworkId.get(artwork.id),
        width: metadata.width,
        height: metadata.height,
        format: (metadata.format ?? artwork.extension.replace('.', '')) || 'unknown',
        density: metadata.density ?? null,
        sizeBytes: stats.size,
        metadataScannedAt: scannedAt
      })
    )
  }

  await saveImageCards(projectPath, { items: nextCards })
  return nextCards
}

export async function updateImageCardInProject(
  workspacePath: string,
  projectId: string,
  cardId: string,
  input: UpdateImageCardInput
): Promise<ImageCard> {
  const update = updateImageCardInputSchema.parse(input)
  const projectPath = await resolveProjectPath(workspacePath, projectId)
  const metadata = await loadImageCards(projectPath)
  const cardIndex = metadata.items.findIndex((card) => card.id === cardId)

  if (cardIndex === -1) throw new Error('Image card not found')

  const existingCard = metadata.items[cardIndex]
  const nextOutputOrientation = update.outputOrientation
  const orientationChanged =
    nextOutputOrientation !== undefined && nextOutputOrientation !== existingCard.outputOrientation
  let nextCard = orientationChanged
    ? recalculateCardRatios(existingCard, nextOutputOrientation)
    : existingCard

  if (update.ratioSelections) {
    nextCard = applyRatioSelectionUpdates(nextCard, update.ratioSelections)
  }

  metadata.items[cardIndex] = nextCard
  await saveImageCards(projectPath, metadata)

  return nextCard
}

export async function generatePrintableRatios(
  workspacePath: string,
  projectId: string,
  options: GeneratePrintableRatiosOptions = {}
): Promise<GeneratePrintableRatiosResult> {
  const parsedOptions = generatePrintableRatiosOptionsSchema.parse(options)
  const jpgQuality = parsedOptions.jpgQuality ?? defaultImagePipelineSettings.jpgQuality
  const exportLargestOnly =
    parsedOptions.exportLargestOnly ?? defaultImagePipelineSettings.exportLargestOnly
  const projectPath = await resolveProjectPath(workspacePath, projectId)
  const metadata = await loadImageCards(projectPath)
  const printableRoot = printableRatiosPath(projectPath)
  const job = createJob({
    type: 'printable-ratios',
    title: 'Generate printable ratios',
    message: 'Preparing selected image cards'
  })

  const generationPlan = metadata.items.flatMap((card) =>
    getSelectedRatioJobs(card, { exportLargestOnly }).flatMap((ratioJob) =>
      ratioJob.sizes.map((size) => ({ card, preset: ratioJob.preset, size }))
    )
  )
  const totalOutputs = generationPlan.length
  let completedOutputs = 0
  let generatedCount = 0
  let failedCount = 0
  const generatedAt = new Date().toISOString()

  if (totalOutputs === 0) {
    updateJob(job.id, {
      status: 'completed',
      progress: 100,
      message: 'No selected ratio groups to generate'
    })
    return { cards: metadata.items, generatedCount: 0, failedCount: 0, jobId: job.id }
  }

  updateJob(job.id, {
    status: 'running',
    progress: 1,
    message: `Generating ${totalOutputs} printable files`
  })

  for (const card of metadata.items) {
    const ratioJobs = getSelectedRatioJobs(card, { exportLargestOnly })
    if (ratioJobs.length === 0) continue

    const sourcePath = join(projectPath, card.relativePath)
    assertPathInside(projectPath, sourcePath)
    const nextOutputs: GeneratedPipelineOutput[] = []

    for (const ratioJob of ratioJobs) {
      const crop = getPreviewCrop(
        card.width,
        card.height,
        card.outputOrientation,
        ratioJob.preset.key,
        card.manualCrops,
        ratioSelectionSettings
      )

      if (!crop) {
        failedCount += ratioJob.sizes.length
        completedOutputs += ratioJob.sizes.length
        continue
      }

      const outputFolderPath = join(printableRoot, card.baseName, ratioJob.preset.folderName)
      assertPathInside(printableRoot, outputFolderPath)
      await mkdir(outputFolderPath, { recursive: true })

      for (const size of ratioJob.sizes) {
        try {
          const baseFilename = buildOutputFilename({
            artworkSlug: card.baseName,
            imageSlug: card.baseName,
            ratioKey: ratioJob.preset.key,
            ratioFolderName: ratioJob.preset.folderName,
            sizeLabel: size.label,
            widthPx: size.widthPx,
            heightPx: size.heightPx,
            filenamePattern: defaultImagePipelineSettings.filenamePattern
          })
          const filename = await getAvailableOutputFilename(outputFolderPath, baseFilename)
          const outputPath = join(outputFolderPath, filename)
          assertPathInside(printableRoot, outputPath)

          await sharp(sourcePath)
            .extract(toSharpExtractRegion(crop, card))
            .resize(size.widthPx, size.heightPx, { fit: 'fill' })
            .jpeg({ quality: jpgQuality })
            .withMetadata({ density: 300 })
            .toFile(outputPath)

          const relativePath = relative(projectPath, outputPath)
          nextOutputs.push({
            id: randomUUID(),
            ratioGroupKey: ratioJob.preset.key,
            ratioGroupLabel: ratioJob.preset.label,
            sizeLabel: size.label,
            width: size.widthPx,
            height: size.heightPx,
            filename,
            folderName: ratioJob.preset.folderName,
            relativePath,
            generatedAt
          })
          generatedCount += 1
        } catch {
          failedCount += 1
        } finally {
          completedOutputs += 1
          updateJob(job.id, {
            status: 'running',
            progress: Math.round((completedOutputs / totalOutputs) * 100),
            message: `Generated ${generatedCount} files, ${failedCount} failed`
          })
        }
      }
    }

    card.outputs = nextOutputs
  }

  await saveImageCards(projectPath, metadata)
  updateJob(job.id, {
    status: failedCount > 0 ? 'failed' : 'completed',
    progress: 100,
    message:
      failedCount > 0
        ? `Generated ${generatedCount} files, ${failedCount} failed`
        : `Generated ${generatedCount} printable files`
  })

  return {
    cards: metadata.items,
    generatedCount,
    failedCount,
    jobId: job.id
  }
}

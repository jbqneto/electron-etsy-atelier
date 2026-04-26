import { readdir } from 'fs/promises'
import { join } from 'path'

import { projectSchema } from '../../shared/schemas/project'
import { imageCardsMetadataSchema } from '../../shared/schemas/image-pipeline'
import type {
  DatabaseMigrationPreview,
  DatabaseMigrationResult
} from '../../shared/types/database'
import type { ArtworkItem } from '../../shared/types/ipc'
import { projectFolderPaths } from '../constants/projectFolders'
import { configureDatabaseForWorkspace, getDatabaseConnection } from './DatabaseService'
import { upsertAsset } from './repositories/AssetRepository'
import { replaceImageCards } from './repositories/ImageCardRepository'
import { replaceRatioOutputs } from './repositories/RatioOutputRepository'
import { upsertProject } from './repositories/ProjectRepository'
import { upsertSourceArtwork } from './repositories/SourceArtworkRepository'
import { readJsonFile as readSnapshotJson } from '../services/jsonStore'

type ArtifactCounts = {
  projects: number
  sourceArtworks: number
  imageCards: number
  ratioOutputs: number
  skipped: number
  errors: string[]
}

type ProjectFolder = {
  projectPath: string
}

async function listProjectFolders(workspacePath: string): Promise<ProjectFolder[]> {
  const projectsDir = join(workspacePath, 'projects')
  try {
    const entries = await readdir(projectsDir, { withFileTypes: true })
    return entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => ({
        projectPath: join(projectsDir, entry.name)
      }))
  } catch {
    return []
  }
}

async function collectCounts(workspacePath: string): Promise<ArtifactCounts> {
  const counts: ArtifactCounts = {
    projects: 0,
    sourceArtworks: 0,
    imageCards: 0,
    ratioOutputs: 0,
    skipped: 0,
    errors: []
  }

  for (const folder of await listProjectFolders(workspacePath)) {
    const projectJsonPath = join(folder.projectPath, 'project.json')
    const projectData = await readSnapshotJson<unknown | null>(projectJsonPath, null)
    if (!projectData) {
      counts.skipped += 1
      continue
    }

    const parsedProject = projectSchema.safeParse(projectData)
    if (!parsedProject.success) {
      counts.skipped += 1
      counts.errors.push(`Invalid project.json in ${folder.projectPath}`)
      continue
    }

    counts.projects += 1

    const sourceArtworksPath = join(folder.projectPath, projectFolderPaths.sourceArtworks, '.atelier-artworks.json')
    const artworksData = await readSnapshotJson<{ items?: ArtworkItem[] } | null>(
      sourceArtworksPath,
      null
    )
    const artworks = artworksData?.items ?? []
    counts.sourceArtworks += artworks.length

    const imageCardsPath = join(folder.projectPath, '.atelier', 'image-cards.json')
    const imageCardsData = await readSnapshotJson<unknown | null>(imageCardsPath, null)
    if (!imageCardsData) continue

    const parsedCards = imageCardsMetadataSchema.safeParse(imageCardsData)
    if (!parsedCards.success) {
      counts.errors.push(`Invalid image-cards.json in ${folder.projectPath}`)
      continue
    }

    counts.imageCards += parsedCards.data.items.length
    counts.ratioOutputs += parsedCards.data.items.reduce(
      (total, card) => total + card.outputs.length,
      0
    )
  }

  return counts
}

export async function getJsonToSqliteMigrationPreview(
  workspacePath: string
): Promise<DatabaseMigrationPreview> {
  const counts = await collectCounts(workspacePath)
  return {
    projects: counts.projects,
    sourceArtworks: counts.sourceArtworks,
    imageCards: counts.imageCards,
    ratioOutputs: counts.ratioOutputs,
    skipped: counts.skipped,
    errors: counts.errors
  }
}

export async function migrateJsonToSqlite(
  workspacePath: string
): Promise<DatabaseMigrationResult> {
  configureDatabaseForWorkspace(workspacePath)
  const db = getDatabaseConnection()
  const counts = await collectCounts(workspacePath)

  for (const folder of await listProjectFolders(workspacePath)) {
    const projectJsonPath = join(folder.projectPath, 'project.json')
    const projectData = await readSnapshotJson<unknown | null>(projectJsonPath, null)
    if (!projectData) continue

    const parsedProject = projectSchema.safeParse(projectData)
    if (!parsedProject.success) continue

    const project = parsedProject.data
    upsertProject(db, project)

    const sourceArtworksPath = join(
      folder.projectPath,
      projectFolderPaths.sourceArtworks,
      '.atelier-artworks.json'
    )
    const artworksData = await readSnapshotJson<{ items?: ArtworkItem[] } | null>(
      sourceArtworksPath,
      null
    )
    const artworks = artworksData?.items ?? []

    for (const artwork of artworks) {
      upsertSourceArtwork(db, project.id, artwork, {
        width: null,
        height: null,
        format: artwork.extension.replace('.', '') || null,
        orientation: null,
        metadataScannedAt: null
      })
      upsertAsset(db, {
        id: artwork.id,
        projectId: project.id,
        scope: 'project',
        type: 'source-artwork',
        fileName: artwork.filename,
        baseName: artwork.filename.replace(/\.[^.]+$/, ''),
        extension: artwork.extension,
        relativePath: artwork.relativePath,
        sizeBytes: artwork.sizeBytes,
        width: null,
        height: null,
        format: artwork.extension.replace('.', '') || null,
        createdAt: artwork.importedAt,
        updatedAt: artwork.importedAt
      })
    }

    const imageCardsPath = join(folder.projectPath, '.atelier', 'image-cards.json')
    const imageCardsData = await readSnapshotJson<unknown | null>(imageCardsPath, null)
    const parsedCards = imageCardsMetadataSchema.safeParse(imageCardsData)
    if (!parsedCards.success) continue

    replaceImageCards(db, project.id, parsedCards.data)
    for (const card of parsedCards.data.items) {
      replaceRatioOutputs(db, project.id, card.id, card.artworkId, card.outputs)
    }
  }

  return {
    projectsImported: counts.projects,
    sourceArtworksImported: counts.sourceArtworks,
    imageCardsImported: counts.imageCards,
    ratioOutputsImported: counts.ratioOutputs,
    skipped: counts.skipped,
    errors: counts.errors
  }
}

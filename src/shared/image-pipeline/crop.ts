import { getPrintableRatioPresets } from './ratioPresets'
import { defaultImagePipelineSettings } from './settings'
import type {
  ArtworkOrientation,
  CropRect,
  CropSuitability,
  PrintableRatioPreset,
  RatioPresetSettings,
  RatioSuitability,
  SourceArtworkOrientation
} from './types'

export const cropSuitabilityOrder: CropSuitability[] = [
  'excellent',
  'good',
  'acceptable',
  'aggressive',
  'not_recommended'
]

export function detectSourceOrientation(width: number, height: number): SourceArtworkOrientation {
  if (width === height) return 'square'
  return width > height ? 'landscape' : 'portrait'
}

export function getInitialOrientation(
  sourceOrientation: SourceArtworkOrientation
): ArtworkOrientation {
  return sourceOrientation === 'landscape' ? 'landscape' : 'portrait'
}

export function getOrientationForPreset(
  sourceOrientation: SourceArtworkOrientation,
  workflowPreset: RatioPresetSettings['workflowPreset']
): ArtworkOrientation {
  if (workflowPreset === 'frame_tv') return 'landscape'
  return getInitialOrientation(sourceOrientation)
}

export function calculateAutoCrop(
  sourceWidth: number,
  sourceHeight: number,
  targetRatio: number
): CropRect {
  if (sourceWidth <= 0 || sourceHeight <= 0) {
    throw new Error('Source dimensions must be positive')
  }
  if (targetRatio <= 0) {
    throw new Error('Target ratio must be positive')
  }

  const sourceRatio = sourceWidth / sourceHeight

  if (sourceRatio > targetRatio) {
    const width = sourceHeight * targetRatio
    return {
      x: (sourceWidth - width) / 2,
      y: 0,
      width,
      height: sourceHeight
    }
  }

  const height = sourceWidth / targetRatio
  return {
    x: 0,
    y: (sourceHeight - height) / 2,
    width: sourceWidth,
    height
  }
}

export const calcAutoCrop = calculateAutoCrop

export function getCropCoverage(crop: CropRect, sourceWidth: number, sourceHeight: number): number {
  if (sourceWidth <= 0 || sourceHeight <= 0) {
    throw new Error('Source dimensions must be positive')
  }

  return (crop.width * crop.height) / (sourceWidth * sourceHeight)
}

export function classifyCropSuitability(coverage: number): CropSuitability {
  if (coverage >= 0.9) return 'excellent'
  if (coverage >= 0.8) return 'good'
  if (coverage >= 0.7) return 'acceptable'
  if (coverage >= 0.6) return 'aggressive'
  return 'not_recommended'
}

export const getSuitability = classifyCropSuitability

export function isSelectedByDefault(suitability: CropSuitability): boolean {
  return suitability === 'excellent' || suitability === 'good' || suitability === 'acceptable'
}

export function buildRatioSuitabilityMap(
  width: number,
  height: number,
  orientation: ArtworkOrientation,
  settings: Partial<RatioPresetSettings> = {}
): Record<string, RatioSuitability> {
  const resolvedSettings: RatioPresetSettings = {
    workflowPreset: defaultImagePipelineSettings.workflowPreset,
    includeBonusGroups: defaultImagePipelineSettings.includeBonusGroups,
    ...settings
  }

  return getPrintableRatioPresets(orientation, resolvedSettings).reduce<
    Record<string, RatioSuitability>
  >((acc, preset) => {
    const crop = calculateAutoCrop(width, height, preset.ratio)
    const coverage = getCropCoverage(crop, width, height)
    const suitability = classifyCropSuitability(coverage)
    const selected =
      resolvedSettings.workflowPreset === 'custom'
        ? false
        : resolvedSettings.workflowPreset === 'frame_tv'
          ? true
          : isSelectedByDefault(suitability)

    acc[preset.key] = {
      selected,
      suitability,
      coverage,
      crop
    }

    return acc
  }, {})
}

export const buildRatioSelections = buildRatioSuitabilityMap

export function pickInitialActiveRatioGroup(
  orientation: ArtworkOrientation,
  selections: Record<string, RatioSuitability>,
  settings: Partial<RatioPresetSettings> = {}
): string {
  const groups = getPrintableRatioPresets(orientation, settings)

  return (
    groups.find((group) => selections[group.key]?.selected)?.key ??
    groups.find((group) => !group.isFrameTvBonus)?.key ??
    groups[0]?.key ??
    ''
  )
}

export function getAutoCropForGroup(
  sourceWidth: number,
  sourceHeight: number,
  orientation: ArtworkOrientation,
  ratioGroupKey: string,
  settings: Partial<RatioPresetSettings> = {}
): CropRect | null {
  const group = getPrintableRatioPresets(orientation, settings).find(
    (entry) => entry.key === ratioGroupKey
  )

  if (!group) return null

  return calculateAutoCrop(sourceWidth, sourceHeight, group.ratio)
}

export function getPreviewCrop(
  sourceWidth: number,
  sourceHeight: number,
  orientation: ArtworkOrientation,
  ratioGroupKey: string,
  manualCrops: Record<string, CropRect> = {},
  settings: Partial<RatioPresetSettings> = {}
): CropRect | null {
  return (
    manualCrops[ratioGroupKey] ??
    getAutoCropForGroup(sourceWidth, sourceHeight, orientation, ratioGroupKey, settings)
  )
}

export function getRatioSuitabilityForPreset(
  sourceWidth: number,
  sourceHeight: number,
  preset: PrintableRatioPreset,
  selectedOverride?: boolean
): RatioSuitability {
  const crop = calculateAutoCrop(sourceWidth, sourceHeight, preset.ratio)
  const coverage = getCropCoverage(crop, sourceWidth, sourceHeight)
  const suitability = classifyCropSuitability(coverage)

  return {
    selected: selectedOverride ?? isSelectedByDefault(suitability),
    suitability,
    coverage,
    crop
  }
}

export function formatCoverage(coverage: number): string {
  return `${Math.round(coverage * 100)}% retained`
}

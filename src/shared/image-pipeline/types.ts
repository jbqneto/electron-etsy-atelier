export type ArtworkOrientation = 'portrait' | 'landscape'
export type SourceArtworkOrientation = ArtworkOrientation | 'square'

export type CropSuitability = 'excellent' | 'good' | 'acceptable' | 'aggressive' | 'not_recommended'

export type RatioWorkflowPreset = 'print_bundle' | 'poster_export' | 'frame_tv' | 'custom'
export type ExportStructure = 'group_by_ratio' | 'group_by_image' | 'flat'
export type FilenamePattern = 'prefix_ratio_size' | 'prefix_image_ratio_size' | 'custom_simple'

export type PrintableExportSize = {
  label: string
  widthPx: number
  heightPx: number
}

export type PrintableRatioPreset = {
  key: string
  label: string
  ratio: number
  folderName: string
  exports: PrintableExportSize[]
  isFrameTvBonus?: boolean
}

export type CropRect = {
  x: number
  y: number
  width: number
  height: number
}

export type RatioSuitability = {
  selected: boolean
  suitability: CropSuitability
  coverage: number
  crop: CropRect
}

export type GeneratedPipelineOutput = {
  id: string
  ratioGroupKey: string
  ratioGroupLabel: string
  sizeLabel: string
  width: number
  height: number
  filename: string
  folderName: string
  relativePath: string
  generatedAt: string
}

export type UpscaledPipelineAsset = {
  relativePath: string
  width: number
  height: number
  scale: number
  model: string
  format: 'jpg' | 'png' | 'webp'
  createdAt: string
}

export type ImageCard = {
  id: string
  artworkId: string
  fileName: string
  baseName: string
  relativePath: string
  width: number
  height: number
  format: string
  density: number | null
  sizeBytes: number
  sourceOrientation: SourceArtworkOrientation
  outputOrientation: ArtworkOrientation
  ratioSelections: Record<string, RatioSuitability>
  manualMode: boolean
  activeRatioGroupKey: string
  manualCrops: Record<string, CropRect>
  upscaledAsset: UpscaledPipelineAsset | null
  outputs: GeneratedPipelineOutput[]
  metadataScannedAt: string
}

export type ImageCardsMetadata = {
  items: ImageCard[]
}

export type UpdateImageCardInput = {
  outputOrientation?: ArtworkOrientation
  ratioSelections?: Record<string, { selected: boolean }>
}

export type GeneratePrintableRatiosOptions = {
  jpgQuality?: number
  exportLargestOnly?: boolean
}

export type GeneratePrintableRatiosResult = {
  cards: ImageCard[]
  generatedCount: number
  failedCount: number
  jobId: string
}

export type RatioPresetSettings = {
  workflowPreset: RatioWorkflowPreset
  includeBonusGroups: boolean
}

export type ImagePipelineSettings = RatioPresetSettings & {
  exportStructure: ExportStructure
  filenamePattern: FilenamePattern
  exportLargestOnly: boolean
  jpgQuality: number
  upscaleBeforeCrop: boolean
}

export type PrintableOutputNamingInput = {
  artworkSlug: string
  imageSlug?: string
  ratioKey: string
  ratioFolderName: string
  sizeLabel: string
  widthPx: number
  heightPx: number
  filenamePattern?: FilenamePattern
}

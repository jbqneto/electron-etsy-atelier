import { z } from 'zod'

export const sharpValidationResultSchema = z.object({
  sharpVersion: z.string().min(1),
  libvipsVersion: z.string().min(1),
  outputFormat: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  sizeBytes: z.number().int().positive()
})

export const artworkOrientationSchema = z.enum(['portrait', 'landscape'])
export const sourceArtworkOrientationSchema = z.enum(['portrait', 'landscape', 'square'])
export const cropSuitabilitySchema = z.enum([
  'excellent',
  'good',
  'acceptable',
  'aggressive',
  'not_recommended'
])
export const ratioWorkflowPresetSchema = z.enum([
  'print_bundle',
  'poster_export',
  'frame_tv',
  'custom'
])
export const exportStructureSchema = z.enum(['group_by_ratio', 'group_by_image', 'flat'])
export const filenamePatternSchema = z.enum([
  'prefix_ratio_size',
  'prefix_image_ratio_size',
  'custom_simple'
])

export const cropRectSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number().positive(),
  height: z.number().positive()
})

export const printableExportSizeSchema = z.object({
  label: z.string().min(1),
  widthPx: z.number().int().positive(),
  heightPx: z.number().int().positive()
})

export const printableRatioPresetSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  ratio: z.number().positive(),
  folderName: z.string().min(1),
  exports: z.array(printableExportSizeSchema).min(1),
  isFrameTvBonus: z.boolean().optional()
})

export const imagePipelineSettingsSchema = z.object({
  workflowPreset: ratioWorkflowPresetSchema,
  exportStructure: exportStructureSchema,
  filenamePattern: filenamePatternSchema,
  exportLargestOnly: z.boolean(),
  includeBonusGroups: z.boolean(),
  jpgQuality: z.number().int().min(1).max(100),
  upscaleBeforeCrop: z.boolean()
})

export const ratioSuitabilitySchema = z.object({
  selected: z.boolean(),
  suitability: cropSuitabilitySchema,
  coverage: z.number().min(0).max(1),
  crop: cropRectSchema
})

export const generatedPipelineOutputSchema = z.object({
  id: z.string().min(1),
  ratioGroupKey: z.string().min(1),
  ratioGroupLabel: z.string().min(1),
  sizeLabel: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  filename: z.string().min(1),
  folderName: z.string().min(1),
  relativePath: z.string().min(1),
  generatedAt: z.string().min(1)
})

export const upscaledPipelineAssetSchema = z.object({
  relativePath: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  scale: z.number().positive(),
  model: z.string().min(1),
  format: z.enum(['jpg', 'png', 'webp']),
  createdAt: z.string().min(1)
})

export const imageCardSchema = z.object({
  id: z.string().min(1),
  artworkId: z.string().min(1),
  fileName: z.string().min(1),
  baseName: z.string().min(1),
  relativePath: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  format: z.string().min(1),
  density: z.number().positive().nullable(),
  sizeBytes: z.number().int().nonnegative(),
  sourceOrientation: sourceArtworkOrientationSchema,
  outputOrientation: artworkOrientationSchema,
  ratioSelections: z.record(z.string(), ratioSuitabilitySchema),
  manualMode: z.boolean(),
  activeRatioGroupKey: z.string(),
  manualCrops: z.record(z.string(), cropRectSchema),
  upscaledAsset: upscaledPipelineAssetSchema.nullable(),
  outputs: z.array(generatedPipelineOutputSchema),
  metadataScannedAt: z.string().min(1)
})

export const imageCardsMetadataSchema = z.object({
  items: z.array(imageCardSchema)
})

export const updateImageCardInputSchema = z
  .object({
    outputOrientation: artworkOrientationSchema.optional(),
    ratioSelections: z.record(z.string(), z.object({ selected: z.boolean() })).optional()
  })
  .strict()

export const generatePrintableRatiosOptionsSchema = z
  .object({
    jpgQuality: z.number().int().min(1).max(100).optional(),
    exportLargestOnly: z.boolean().optional()
  })
  .strict()

export const generatePrintableRatiosResultSchema = z.object({
  cards: z.array(imageCardSchema),
  generatedCount: z.number().int().nonnegative(),
  failedCount: z.number().int().nonnegative(),
  jobId: z.string().min(1)
})

import type { ImagePipelineSettings } from './types'

export const defaultImagePipelineSettings: ImagePipelineSettings = {
  workflowPreset: 'print_bundle',
  exportStructure: 'group_by_ratio',
  filenamePattern: 'prefix_ratio_size',
  exportLargestOnly: true,
  includeBonusGroups: false,
  jpgQuality: 92,
  upscaleBeforeCrop: false
}

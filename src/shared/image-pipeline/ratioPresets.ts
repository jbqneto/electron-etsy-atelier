import { defaultImagePipelineSettings } from './settings'
import type {
  ArtworkOrientation,
  PrintableExportSize,
  PrintableRatioPreset,
  RatioPresetSettings
} from './types'

const posterRatioKeys = new Set([
  '2x3',
  '3x4',
  '4x5',
  '11x14',
  'iso',
  '3x2',
  '4x3',
  '5x4',
  '14x11',
  'iso_landscape'
])

export function inchesToExport(
  label: string,
  widthIn: number,
  heightIn: number
): PrintableExportSize {
  return {
    label,
    widthPx: Math.round(widthIn * 300),
    heightPx: Math.round(heightIn * 300)
  }
}

export const isoPortraitSizes: PrintableExportSize[] = [
  { label: 'A5', widthPx: 1748, heightPx: 2480 },
  { label: 'A4', widthPx: 2480, heightPx: 3508 },
  { label: 'A3', widthPx: 3508, heightPx: 4961 },
  { label: 'A2', widthPx: 4961, heightPx: 7016 },
  { label: 'A1', widthPx: 7016, heightPx: 9933 }
]

export const isoLandscapeSizes: PrintableExportSize[] = isoPortraitSizes.map((size) => ({
  label: size.label,
  widthPx: size.heightPx,
  heightPx: size.widthPx
}))

export const printableRatioPresetsByOrientation: Record<
  ArtworkOrientation,
  PrintableRatioPreset[]
> = {
  portrait: [
    {
      key: '2x3',
      label: '2:3',
      ratio: 2 / 3,
      folderName: '01_2x3_RATIO',
      exports: [
        inchesToExport('4x6', 4, 6),
        inchesToExport('8x12', 8, 12),
        inchesToExport('12x18', 12, 18),
        inchesToExport('16x24', 16, 24),
        inchesToExport('20x30', 20, 30),
        inchesToExport('24x36', 24, 36)
      ]
    },
    {
      key: '3x4',
      label: '3:4',
      ratio: 3 / 4,
      folderName: '02_3x4_RATIO',
      exports: [
        inchesToExport('6x8', 6, 8),
        inchesToExport('9x12', 9, 12),
        inchesToExport('12x16', 12, 16),
        inchesToExport('15x20', 15, 20),
        inchesToExport('18x24', 18, 24)
      ]
    },
    {
      key: '4x5',
      label: '4:5',
      ratio: 4 / 5,
      folderName: '03_4x5_RATIO',
      exports: [
        inchesToExport('8x10', 8, 10),
        inchesToExport('11x14', 11, 14),
        inchesToExport('12x15', 12, 15),
        inchesToExport('16x20', 16, 20),
        inchesToExport('20x25', 20, 25),
        inchesToExport('24x30', 24, 30)
      ]
    },
    {
      key: '5x7',
      label: '5:7',
      ratio: 5 / 7,
      folderName: '04_5x7_RATIO',
      exports: [
        inchesToExport('5x7', 5, 7),
        inchesToExport('10x14', 10, 14),
        inchesToExport('15x21', 15, 21),
        inchesToExport('20x28', 20, 28)
      ]
    },
    {
      key: '11x14',
      label: '11:14',
      ratio: 11 / 14,
      folderName: '05_11x14_RATIO',
      exports: [inchesToExport('11x14', 11, 14), inchesToExport('22x28', 22, 28)]
    },
    {
      key: 'iso',
      label: 'ISO',
      ratio: isoPortraitSizes[0].widthPx / isoPortraitSizes[0].heightPx,
      folderName: '06_ISO_SIZES',
      exports: isoPortraitSizes
    }
  ],
  landscape: [
    {
      key: '3x2',
      label: '3:2',
      ratio: 3 / 2,
      folderName: '01_3x2_RATIO',
      exports: [
        inchesToExport('6x4', 6, 4),
        inchesToExport('12x8', 12, 8),
        inchesToExport('18x12', 18, 12),
        inchesToExport('24x16', 24, 16),
        inchesToExport('30x20', 30, 20),
        inchesToExport('36x24', 36, 24)
      ]
    },
    {
      key: '4x3',
      label: '4:3',
      ratio: 4 / 3,
      folderName: '02_4x3_RATIO',
      exports: [
        inchesToExport('8x6', 8, 6),
        inchesToExport('12x9', 12, 9),
        inchesToExport('16x12', 16, 12),
        inchesToExport('20x15', 20, 15),
        inchesToExport('24x18', 24, 18)
      ]
    },
    {
      key: '5x4',
      label: '5:4',
      ratio: 5 / 4,
      folderName: '03_5x4_RATIO',
      exports: [
        inchesToExport('10x8', 10, 8),
        inchesToExport('14x11', 14, 11),
        inchesToExport('15x12', 15, 12),
        inchesToExport('20x16', 20, 16),
        inchesToExport('25x20', 25, 20),
        inchesToExport('30x24', 30, 24)
      ]
    },
    {
      key: '7x5',
      label: '7:5',
      ratio: 7 / 5,
      folderName: '04_7x5_RATIO',
      exports: [
        inchesToExport('7x5', 7, 5),
        inchesToExport('14x10', 14, 10),
        inchesToExport('21x15', 21, 15),
        inchesToExport('28x20', 28, 20)
      ]
    },
    {
      key: '14x11',
      label: '14:11',
      ratio: 14 / 11,
      folderName: '05_14x11_RATIO',
      exports: [inchesToExport('14x11', 14, 11), inchesToExport('28x22', 28, 22)]
    },
    {
      key: 'iso_landscape',
      label: 'ISO landscape',
      ratio: isoLandscapeSizes[0].widthPx / isoLandscapeSizes[0].heightPx,
      folderName: '06_ISO_SIZES',
      exports: isoLandscapeSizes
    },
    {
      key: 'frame-tv',
      label: '16:9 Frame TV bonus',
      ratio: 16 / 9,
      folderName: '07_FrameTV_Bonus',
      isFrameTvBonus: true,
      exports: [
        { label: 'FrameTV_4K', widthPx: 3840, heightPx: 2160 },
        { label: 'FrameTV_2K', widthPx: 2560, heightPx: 1440 }
      ]
    }
  ]
}

export function getPrintableRatioPresets(
  orientation: ArtworkOrientation,
  settings: Partial<RatioPresetSettings> = {}
): PrintableRatioPreset[] {
  const resolved = { ...defaultImagePipelineSettings, ...settings }

  return printableRatioPresetsByOrientation[orientation].filter((preset) => {
    if (preset.isFrameTvBonus) {
      return resolved.workflowPreset === 'frame_tv' || resolved.includeBonusGroups
    }

    if (resolved.workflowPreset === 'frame_tv') return false
    if (resolved.workflowPreset === 'poster_export') return posterRatioKeys.has(preset.key)

    return true
  })
}

export const getRatioGroups = getPrintableRatioPresets

export function getLargestExportSize(preset: PrintableRatioPreset): PrintableExportSize | null {
  return (
    [...preset.exports].sort(
      (left, right) => right.widthPx * right.heightPx - left.widthPx * left.heightPx
    )[0] ?? null
  )
}

import type { PrintableOutputNamingInput } from './types'

export function stripExtension(filename: string): string {
  return filename.replace(/\.[^.]+$/, '')
}

export function stripTrailingRatioSuffix(value: string): string {
  return value.replace(/(?:[_\-\s]+)?\d+x\d+$/i, '')
}

export function slugifyFilenamePart(value: string, fallback = 'image'): string {
  return (
    value
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '') || fallback
  )
}

export const slugify = slugifyFilenamePart

export function normalizeArtworkBaseName(filename: string): string {
  return slugifyFilenamePart(stripTrailingRatioSuffix(stripExtension(filename)))
}

export function buildPrintableOutputFilename(input: PrintableOutputNamingInput): string {
  const groupIndex = input.ratioFolderName.split('_')[0] ?? '01'
  const sizePart = slugifyFilenamePart(input.sizeLabel, 'size')
  const dimensionPart = `${input.widthPx}x${input.heightPx}`

  switch (input.filenamePattern ?? 'prefix_ratio_size') {
    case 'prefix_image_ratio_size':
      return `${input.artworkSlug}_${groupIndex}_${input.imageSlug ?? input.artworkSlug}_${input.ratioKey}_${sizePart}_${dimensionPart}.jpg`
    case 'custom_simple':
      return `${input.artworkSlug}_${groupIndex}_${sizePart}.jpg`
    case 'prefix_ratio_size':
      return `${input.artworkSlug}_${groupIndex}_${input.ratioKey}_${sizePart}_${dimensionPart}.jpg`
  }
}

export const buildOutputFilename = buildPrintableOutputFilename

export function buildArtworkFolderName(artworkSlug: string, index: number): string {
  return `${String(index + 1).padStart(2, '0')}_${artworkSlug}`
}

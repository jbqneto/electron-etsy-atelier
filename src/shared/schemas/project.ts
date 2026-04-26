import { z } from 'zod'

export const projectStatusSchema = z.enum(['draft', 'active', 'archived'])

function canonicalProjectFolderSchema(canonical: string, legacy: string): z.ZodType<string> {
  return z.union([z.literal(canonical), z.literal(legacy)]).transform(() => canonical)
}

export const projectPathsSchema = z.object({
  sourceArtworks: canonicalProjectFolderSchema('source-artworks', '01-source-artworks'),
  upscaled: canonicalProjectFolderSchema('upscaled', '02-upscaled'),
  printableRatios: canonicalProjectFolderSchema('printable-ratios', '03-printable-ratios'),
  mockups: canonicalProjectFolderSchema('mockups', '04-mockups'),
  pdf: canonicalProjectFolderSchema('pdf', '05-pdf'),
  exportPackage: canonicalProjectFolderSchema('export-package', '06-export-package')
})

export const projectSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  status: projectStatusSchema,
  description: z.string(),
  marketplace: z.literal('etsy'),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
  paths: projectPathsSchema
})

export const createProjectInputSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional()
})

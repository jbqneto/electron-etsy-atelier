import { z } from 'zod'

export const projectStatusSchema = z.enum(['draft', 'active', 'archived'])

export const projectPathsSchema = z.object({
  sourceArtworks: z.literal('01-source-artworks'),
  upscaled: z.literal('02-upscaled'),
  printableRatios: z.literal('03-printable-ratios'),
  mockups: z.literal('04-mockups'),
  pdf: z.literal('05-pdf'),
  exportPackage: z.literal('06-export-package')
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

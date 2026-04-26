import { z } from 'zod'

export const databaseMigrationPreviewSchema = z.object({
  projects: z.number().int().nonnegative(),
  sourceArtworks: z.number().int().nonnegative(),
  imageCards: z.number().int().nonnegative(),
  ratioOutputs: z.number().int().nonnegative(),
  skipped: z.number().int().nonnegative(),
  errors: z.array(z.string())
})

export const databaseMigrationResultSchema = z.object({
  projectsImported: z.number().int().nonnegative(),
  sourceArtworksImported: z.number().int().nonnegative(),
  imageCardsImported: z.number().int().nonnegative(),
  ratioOutputsImported: z.number().int().nonnegative(),
  skipped: z.number().int().nonnegative(),
  errors: z.array(z.string())
})


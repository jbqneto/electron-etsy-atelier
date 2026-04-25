import { z } from 'zod'

export const artworkItemSchema = z.object({
  id: z.string().min(1),
  originalName: z.string().min(1),
  filename: z.string().min(1),
  relativePath: z.string().min(1),
  extension: z.string().min(1),
  sizeBytes: z.number().int().nonnegative(),
  importedAt: z.string().min(1)
})

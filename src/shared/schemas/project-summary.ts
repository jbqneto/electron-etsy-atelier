import { z } from 'zod'

export const projectSummarySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  status: z.enum(['draft', 'active', 'archived']),
  description: z.string(),
  marketplace: z.literal('etsy'),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
  fullPath: z.string().min(1),
  folders: z.array(
    z.object({
      key: z.enum([
        'sourceArtworks',
        'upscaled',
        'printableRatios',
        'mockups',
        'pdf',
        'exportPackage'
      ]),
      label: z.string().min(1),
      path: z.string().min(1),
      description: z.string().min(1),
      fileCount: z.number().int().nonnegative()
    })
  )
})

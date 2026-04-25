import { z } from 'zod'

export const workspaceSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  version: z.literal(1),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1)
})

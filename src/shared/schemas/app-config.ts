import { z } from 'zod'

export const appConfigSchema = z.object({
  project: z.string().min(1),
  workspace: z.string().min(1)
})

import { z } from 'zod'

export const appSettingsSchema = z.object({
  lastWorkspacePath: z.string().nullable()
})

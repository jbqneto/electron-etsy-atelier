import { z } from 'zod'

export const databaseStatusSchema = z.object({
  path: z.string().nullable(),
  connected: z.boolean(),
  migrationCount: z.number().int().nonnegative(),
  currentVersion: z.number().int().nonnegative(),
  lastError: z.string().nullable()
})


import { z } from 'zod'

export const appPingResponseSchema = z.object({
  ok: z.literal(true),
  message: z.literal('The Atelier Desktop is running')
})

export type AppPingResponseSchema = z.infer<typeof appPingResponseSchema>

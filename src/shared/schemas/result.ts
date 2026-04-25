import { z } from 'zod'

export const okResultSchema = <T extends z.ZodTypeAny>(data: T): z.ZodTypeAny =>
  z.object({ ok: z.literal(true), data })

export const errorResultSchema = z.object({
  ok: z.literal(false),
  error: z.string().min(1)
})

export const resultSchema = <T extends z.ZodTypeAny>(data: T): z.ZodTypeAny =>
  z.union([okResultSchema(data), errorResultSchema])

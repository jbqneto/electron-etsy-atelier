import { z } from 'zod'

export const jobSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  title: z.string().min(1),
  status: z.enum(['pending', 'running', 'completed', 'failed']),
  progress: z.number().min(0).max(100),
  message: z.string(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1)
})

import { z } from 'zod'

import { workspaceSchema } from './workspace'

export const workspaceStateSchema = z.object({
  path: z.string().min(1),
  workspace: workspaceSchema
})

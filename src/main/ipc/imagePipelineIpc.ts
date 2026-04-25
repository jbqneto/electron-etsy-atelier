import { ipcMain } from 'electron'

import type { GeneratePrintableRatiosResult, ImageCard } from '../../shared/image-pipeline'
import { updateImageCardInputSchema } from '../../shared/schemas/image-pipeline'
import type { Result, SharpValidationResult } from '../../shared/types/ipc'
import {
  generatePrintableRatios,
  listImageCardsInProject,
  scanSourceArtworksInProject,
  updateImageCardInProject,
  validateSharp
} from '../services/imagePipelineService'
import { getCurrentWorkspacePath } from '../services/workspaceService'

function ok<T>(data: T): Result<T> {
  return { ok: true, data }
}

function fail<T>(error: string): Result<T> {
  return { ok: false, error }
}

export function registerImagePipelineIpc(): void {
  ipcMain.handle('imagePipeline:validateSharp', async () => {
    try {
      return ok(await validateSharp())
    } catch (error) {
      return fail<SharpValidationResult>(
        error instanceof Error ? error.message : 'Failed to validate Sharp'
      )
    }
  })

  ipcMain.handle('imagePipeline:scanSourceArtworks', async (_event, projectId: unknown) => {
    if (typeof projectId !== 'string' || !projectId.trim()) {
      return fail<ImageCard[]>('Project id is required')
    }

    const workspacePath = await getCurrentWorkspacePath()
    if (!workspacePath) return fail<ImageCard[]>('No workspace selected')

    try {
      return ok(await scanSourceArtworksInProject(workspacePath, projectId))
    } catch (error) {
      return fail<ImageCard[]>(
        error instanceof Error ? error.message : 'Failed to scan source artworks'
      )
    }
  })

  ipcMain.handle('imagePipeline:listImageCards', async (_event, projectId: unknown) => {
    if (typeof projectId !== 'string' || !projectId.trim()) {
      return fail<ImageCard[]>('Project id is required')
    }

    const workspacePath = await getCurrentWorkspacePath()
    if (!workspacePath) return fail<ImageCard[]>('No workspace selected')

    try {
      return ok(await listImageCardsInProject(workspacePath, projectId))
    } catch (error) {
      return fail<ImageCard[]>(
        error instanceof Error ? error.message : 'Failed to list image cards'
      )
    }
  })

  ipcMain.handle(
    'imagePipeline:updateImageCard',
    async (_event, projectId: unknown, cardId: unknown, input: unknown) => {
      if (typeof projectId !== 'string' || !projectId.trim()) {
        return fail<ImageCard>('Project id is required')
      }
      if (typeof cardId !== 'string' || !cardId.trim()) {
        return fail<ImageCard>('Image card id is required')
      }

      const parsedInput = updateImageCardInputSchema.safeParse(input)
      if (!parsedInput.success) return fail<ImageCard>('Invalid image card update input')

      const workspacePath = await getCurrentWorkspacePath()
      if (!workspacePath) return fail<ImageCard>('No workspace selected')

      try {
        return ok(
          await updateImageCardInProject(workspacePath, projectId, cardId, parsedInput.data)
        )
      } catch (error) {
        return fail<ImageCard>(
          error instanceof Error ? error.message : 'Failed to update image card'
        )
      }
    }
  )

  ipcMain.handle('imagePipeline:generatePrintableRatios', async (_event, projectId: unknown) => {
    if (typeof projectId !== 'string' || !projectId.trim()) {
      return fail<GeneratePrintableRatiosResult>('Project id is required')
    }

    const workspacePath = await getCurrentWorkspacePath()
    if (!workspacePath) return fail<GeneratePrintableRatiosResult>('No workspace selected')

    try {
      return ok(await generatePrintableRatios(workspacePath, projectId))
    } catch (error) {
      return fail<GeneratePrintableRatiosResult>(
        error instanceof Error ? error.message : 'Failed to generate printable ratios'
      )
    }
  })
}

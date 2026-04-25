import { dialog, ipcMain } from 'electron'

import type { ArtworkItem, Result } from '../../shared/types/ipc'
import {
  getArtworkPreviewUrlInProject,
  importArtworkFilesToProject,
  listArtworkFilesInProject,
  revealArtworkInFolderInProject
} from '../services/artworkService'
import { getCurrentWorkspacePath } from '../services/workspaceService'

function ok<T>(data: T): Result<T> {
  return { ok: true, data }
}

function fail<T>(error: string): Result<T> {
  return { ok: false, error }
}

const artworkExtensions = ['.jpg', '.jpeg', '.png', '.webp']

export function registerArtworksIpc(): void {
  ipcMain.handle('artworks:selectArtworkFiles', async (_event, projectId: unknown) => {
    if (typeof projectId !== 'string' || !projectId.trim()) {
      return fail<string[]>('Project id is required')
    }

    const result = await dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: 'Artwork Images', extensions: artworkExtensions.map((ext) => ext.slice(1)) }
      ]
    })

    if (result.canceled) return ok<string[]>([])
    return ok(result.filePaths)
  })

  ipcMain.handle(
    'artworks:importArtworkFiles',
    async (_event, projectId: unknown, filePaths: unknown) => {
      if (typeof projectId !== 'string' || !projectId.trim()) {
        return fail<ArtworkItem[]>('Project id is required')
      }
      if (!Array.isArray(filePaths) || !filePaths.every((value) => typeof value === 'string')) {
        return fail<ArtworkItem[]>('Invalid file paths')
      }

      const workspacePath = await getCurrentWorkspacePath()
      if (!workspacePath) return fail<ArtworkItem[]>('No workspace selected')

      try {
        return ok(await importArtworkFilesToProject(workspacePath, projectId, filePaths))
      } catch (error) {
        return fail<ArtworkItem[]>(
          error instanceof Error ? error.message : 'Failed to import artworks'
        )
      }
    }
  )

  ipcMain.handle('artworks:listSourceArtworks', async (_event, projectId: unknown) => {
    if (typeof projectId !== 'string' || !projectId.trim()) {
      return fail<ArtworkItem[]>('Project id is required')
    }

    const workspacePath = await getCurrentWorkspacePath()
    if (!workspacePath) return fail<ArtworkItem[]>('No workspace selected')

    try {
      return ok(await listArtworkFilesInProject(workspacePath, projectId))
    } catch (error) {
      return fail<ArtworkItem[]>(error instanceof Error ? error.message : 'Failed to list artworks')
    }
  })

  ipcMain.handle('artworks:getArtworkPreviewUrl', async (_event, projectId: unknown, artworkId: unknown) => {
    if (typeof projectId !== 'string' || !projectId.trim()) {
      return fail<string>('Project id is required')
    }
    if (typeof artworkId !== 'string' || !artworkId.trim()) {
      return fail<string>('Artwork id is required')
    }

    const workspacePath = await getCurrentWorkspacePath()
    if (!workspacePath) return fail<string>('No workspace selected')

    try {
      return ok(await getArtworkPreviewUrlInProject(workspacePath, projectId, artworkId))
    } catch (error) {
      return fail<string>(error instanceof Error ? error.message : 'Failed to load preview')
    }
  })

  ipcMain.handle('artworks:revealArtworkInFolder', async (_event, projectId: unknown, artworkId: unknown) => {
    if (typeof projectId !== 'string' || !projectId.trim()) {
      return fail<null>('Project id is required')
    }
    if (typeof artworkId !== 'string' || !artworkId.trim()) {
      return fail<null>('Artwork id is required')
    }

    const workspacePath = await getCurrentWorkspacePath()
    if (!workspacePath) return fail<null>('No workspace selected')

    try {
      await revealArtworkInFolderInProject(workspacePath, projectId, artworkId)
      return ok<null>(null)
    } catch (error) {
      return fail<null>(error instanceof Error ? error.message : 'Failed to reveal artwork')
    }
  })
}

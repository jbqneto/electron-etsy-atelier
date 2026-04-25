import { ipcMain } from 'electron'

import type { Result, FolderKey, ProjectSummary } from '../../shared/types/ipc'
import { getCurrentWorkspacePath, getProjectSummaryInWorkspace, openProjectFolderInSystem, openProjectSubfolderInSystem } from '../services/workspaceService'

function ok<T>(data: T): Result<T> {
  return { ok: true, data }
}

function fail<T>(error: string): Result<T> {
  return { ok: false, error }
}

export function registerProjectsIpc(): void {
  ipcMain.handle('projects:getProjectSummary', async (_event, projectId: unknown) => {
    if (typeof projectId !== 'string' || !projectId.trim()) {
      return fail<ProjectSummary>('Project id is required')
    }

    const workspacePath = await getCurrentWorkspacePath()
    if (!workspacePath) return fail<ProjectSummary>('No workspace selected')

    try {
      return ok(await getProjectSummaryInWorkspace(workspacePath, projectId))
    } catch (error) {
      return fail<ProjectSummary>(error instanceof Error ? error.message : 'Failed to load project summary')
    }
  })

  ipcMain.handle('projects:openProjectFolder', async (_event, projectId: unknown) => {
    if (typeof projectId !== 'string' || !projectId.trim()) {
      return fail<null>('Project id is required')
    }

    const workspacePath = await getCurrentWorkspacePath()
    if (!workspacePath) return fail<null>('No workspace selected')

    try {
      await openProjectFolderInSystem(workspacePath, projectId)
      return ok<null>(null)
    } catch (error) {
      return fail<null>(error instanceof Error ? error.message : 'Failed to open project folder')
    }
  })

  ipcMain.handle('projects:openProjectSubfolder', async (_event, projectId: unknown, folderKey: unknown) => {
    if (typeof projectId !== 'string' || !projectId.trim()) {
      return fail<null>('Project id is required')
    }
    if (
      folderKey !== 'sourceArtworks' &&
      folderKey !== 'upscaled' &&
      folderKey !== 'printableRatios' &&
      folderKey !== 'mockups' &&
      folderKey !== 'pdf' &&
      folderKey !== 'exportPackage'
    ) {
      return fail<null>('Invalid folder key')
    }

    const workspacePath = await getCurrentWorkspacePath()
    if (!workspacePath) return fail<null>('No workspace selected')

    try {
      await openProjectSubfolderInSystem(workspacePath, projectId, folderKey as FolderKey)
      return ok<null>(null)
    } catch (error) {
      return fail<null>(error instanceof Error ? error.message : 'Failed to open folder')
    }
  })
}

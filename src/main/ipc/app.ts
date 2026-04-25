import { dialog, ipcMain } from 'electron'

import { appPingResponseSchema } from '../../shared/schemas/app'
import { createProjectInputSchema } from '../../shared/schemas/project'
import type { AppPingResponse } from '../../shared/types/app'
import type { Result } from '../../shared/types/result'
import type { Project } from '../../shared/types/project'
import type { WorkspaceState } from '../../shared/types/workspace-state'
import {
  createProjectInWorkspace,
  getCurrentWorkspace,
  getCurrentWorkspacePath,
  initializeWorkspaceAtPath,
  listProjectsInWorkspace,
  openProjectFolderInSystem
} from '../services/workspaceService'

const appPingResponse: AppPingResponse = {
  ok: true,
  message: 'The Atelier Desktop is running'
}

function ok<T>(data: T): Result<T> {
  return { ok: true, data }
}

function fail<T>(error: string): Result<T> {
  return { ok: false, error }
}

async function resolveWorkspacePath(): Promise<string | null> {
  return getCurrentWorkspacePath()
}

export function registerAppIpcHandlers(): void {
  ipcMain.handle('app:ping', () => appPingResponseSchema.parse(appPingResponse))

  ipcMain.handle('workspace:selectWorkspace', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory', 'createDirectory']
    })

    if (result.canceled || result.filePaths.length === 0) {
      return fail<WorkspaceState>('Workspace selection was canceled')
    }

    try {
      return ok(await initializeWorkspaceAtPath(result.filePaths[0]))
    } catch (error) {
      return fail<WorkspaceState>(
        error instanceof Error ? error.message : 'Failed to initialize workspace'
      )
    }
  })

  ipcMain.handle('workspace:getCurrentWorkspace', async () => {
    try {
      return ok(await getCurrentWorkspace())
    } catch (error) {
      return fail<WorkspaceState | null>(
        error instanceof Error ? error.message : 'Failed to load workspace'
      )
    }
  })

  ipcMain.handle('workspace:initializeWorkspace', async (_event, workspacePath: unknown) => {
    if (typeof workspacePath !== 'string' || !workspacePath.trim()) {
      return fail<WorkspaceState>('Workspace path is required')
    }

    try {
      return ok(await initializeWorkspaceAtPath(workspacePath))
    } catch (error) {
      return fail<WorkspaceState>(
        error instanceof Error ? error.message : 'Failed to initialize workspace'
      )
    }
  })

  ipcMain.handle('projects:createProject', async (_event, input: unknown) => {
    const parsed = createProjectInputSchema.safeParse(input)
    if (!parsed.success) {
      return fail<Project>('Invalid project input')
    }

    const workspacePath = await resolveWorkspacePath()
    if (!workspacePath) return fail<Project>('No workspace selected')

    try {
      return ok(await createProjectInWorkspace(workspacePath, parsed.data))
    } catch (error) {
      return fail<Project>(error instanceof Error ? error.message : 'Failed to create project')
    }
  })

  ipcMain.handle('projects:listProjects', async () => {
    const workspacePath = await resolveWorkspacePath()
    if (!workspacePath) return ok<Project[]>([])

    try {
      return ok(await listProjectsInWorkspace(workspacePath))
    } catch (error) {
      return fail<Project[]>(error instanceof Error ? error.message : 'Failed to list projects')
    }
  })

  ipcMain.handle('projects:openProjectFolder', async (_event, projectId: unknown) => {
    if (typeof projectId !== 'string' || !projectId.trim()) {
      return fail<null>('Project id is required')
    }

    const workspacePath = await resolveWorkspacePath()
    if (!workspacePath) return fail<null>('No workspace selected')

    try {
      await openProjectFolderInSystem(workspacePath, projectId)
      return ok<null>(null)
    } catch (error) {
      return fail<null>(error instanceof Error ? error.message : 'Failed to open project folder')
    }
  })
}

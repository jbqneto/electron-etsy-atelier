import { ipcMain } from 'electron'

import { createProjectInputSchema } from '../../shared/schemas/project'
import type { Result } from '../../shared/types/ipc'
import type { Project } from '../../shared/types/project'
import type { WorkspaceState } from '../../shared/types/workspace-state'
import { getConfiguredWorkspacePath } from '../services/appConfigService'
import {
  createProjectInWorkspace,
  getCurrentWorkspace,
  getCurrentWorkspacePath,
  listProjectsInWorkspace
} from '../services/workspaceService'

function ok<T>(data: T): Result<T> {
  return { ok: true, data }
}

function fail<T>(error: string): Result<T> {
  return { ok: false, error }
}

async function resolveWorkspacePath(): Promise<string | null> {
  return getCurrentWorkspacePath()
}

export function registerWorkspaceIpc(): void {
  ipcMain.handle('workspace:getCurrentWorkspace', async () => {
    try {
      const workspaceState = await getCurrentWorkspace()
      return ok(workspaceState)
    } catch (error) {
      return fail<WorkspaceState | null>(
        error instanceof Error ? error.message : 'Failed to load workspace'
      )
    }
  })

  ipcMain.handle('workspace:getConfiguredWorkspacePath', async () => {
    try {
      return ok(getConfiguredWorkspacePath())
    } catch (error) {
      return fail<string>(
        error instanceof Error ? error.message : 'Failed to load configured workspace path'
      )
    }
  })

  ipcMain.handle('projects:createProject', async (_event, input: unknown) => {
    const parsed = createProjectInputSchema.safeParse(input)
    if (!parsed.success) return fail<Project>('Invalid project input')

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
}

import { contextBridge, ipcRenderer } from 'electron'
import { z } from 'zod'

import type { AtelierApi } from '../shared/types/app'
import { appPingResponseSchema } from '../shared/schemas/app'
import { resultSchema } from '../shared/schemas/result'
import { projectSchema } from '../shared/schemas/project'
import { workspaceStateSchema } from '../shared/schemas/workspace-state'
import { artworkItemSchema } from '../shared/schemas/artwork'
import { projectSummarySchema } from '../shared/schemas/project-summary'
import { jobSchema } from '../shared/schemas/job'
import type { ArtworkItem, FolderKey, Job, ProjectSummary, Result } from '../shared/types/ipc'
import type { Project } from '../shared/types/project'
import type { WorkspaceState } from '../shared/types/workspace-state'

const atelierApi: AtelierApi = {
  app: {
    ping: async () => appPingResponseSchema.parse(await ipcRenderer.invoke('app:ping'))
  },
  workspace: {
    selectWorkspace: async () =>
      resultSchema(workspaceStateSchema).parse(
        await ipcRenderer.invoke('workspace:selectWorkspace')
      ) as Result<WorkspaceState>,
    getCurrentWorkspace: async () =>
      resultSchema(workspaceStateSchema.nullable()).parse(
        await ipcRenderer.invoke('workspace:getCurrentWorkspace')
      ) as Result<WorkspaceState | null>,
    initializeWorkspace: async (workspacePath: string) =>
      resultSchema(workspaceStateSchema).parse(
        await ipcRenderer.invoke('workspace:initializeWorkspace', workspacePath)
      ) as Result<WorkspaceState>
  },
  projects: {
    createProject: async (input) =>
      resultSchema(projectSchema).parse(
        await ipcRenderer.invoke('projects:createProject', input)
      ) as Result<Project>,
    listProjects: async () =>
      resultSchema(projectSchema.array()).parse(
        await ipcRenderer.invoke('projects:listProjects')
      ) as Result<Project[]>,
    openProjectFolder: async (projectId: string) =>
      resultSchema(z.null()).parse(
        await ipcRenderer.invoke('projects:openProjectFolder', projectId)
      ) as Result<null>,
    openProjectSubfolder: async (projectId: string, folderKey: FolderKey) =>
      resultSchema(z.null()).parse(
        await ipcRenderer.invoke('projects:openProjectSubfolder', projectId, folderKey)
      ) as Result<null>,
    getProjectSummary: async (projectId: string) =>
      resultSchema(projectSummarySchema).parse(
        await ipcRenderer.invoke('projects:getProjectSummary', projectId)
      ) as Result<ProjectSummary>
  },
  artworks: {
    selectArtworkFiles: async (projectId: string) =>
      resultSchema(z.array(z.string())).parse(
        await ipcRenderer.invoke('artworks:selectArtworkFiles', projectId)
      ) as Result<string[]>,
    importArtworkFiles: async (projectId: string, filePaths: string[]) =>
      resultSchema(artworkItemSchema.array()).parse(
        await ipcRenderer.invoke('artworks:importArtworkFiles', projectId, filePaths)
      ) as Result<ArtworkItem[]>,
    listSourceArtworks: async (projectId: string) =>
      resultSchema(artworkItemSchema.array()).parse(
        await ipcRenderer.invoke('artworks:listSourceArtworks', projectId)
      ) as Result<ArtworkItem[]>,
    getArtworkPreviewUrl: async (projectId: string, artworkId: string) =>
      resultSchema(z.string().min(1)).parse(
        await ipcRenderer.invoke('artworks:getArtworkPreviewUrl', projectId, artworkId)
      ) as Result<string>,
    revealArtworkInFolder: async (projectId: string, artworkId: string) =>
      resultSchema(z.null()).parse(
        await ipcRenderer.invoke('artworks:revealArtworkInFolder', projectId, artworkId)
      ) as Result<null>
  },
  jobs: {
    listJobs: async () =>
      resultSchema(jobSchema.array()).parse(await ipcRenderer.invoke('jobs:listJobs')) as Result<
        Job[]
      >,
    clearCompletedJobs: async () =>
      resultSchema(z.null()).parse(await ipcRenderer.invoke('jobs:clearCompletedJobs')) as Result<null>,
    createDemoJob: async () =>
      resultSchema(jobSchema).parse(await ipcRenderer.invoke('jobs:createDemoJob')) as Result<Job>
  }
}

contextBridge.exposeInMainWorld('atelier', atelierApi)

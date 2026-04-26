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
import { databaseStatusSchema } from '../shared/schemas/database'
import {
  databaseMigrationPreviewSchema,
  databaseMigrationResultSchema
} from '../shared/schemas/database-migration'
import {
  generatePrintableRatiosResultSchema,
  imageCardSchema,
  sharpValidationResultSchema,
  updateImageCardInputSchema
} from '../shared/schemas/image-pipeline'
import type {
  GeneratePrintableRatiosResult,
  ImageCard,
  UpdateImageCardInput
} from '../shared/image-pipeline'
import type {
  ArtworkItem,
  FolderKey,
  Job,
  ProjectSummary,
  Result,
  SharpValidationResult
} from '../shared/types/ipc'
import type {
  DatabaseMigrationPreview,
  DatabaseMigrationResult,
  DatabaseStatus
} from '../shared/types/database'
import type { Project } from '../shared/types/project'
import type { WorkspaceState } from '../shared/types/workspace-state'

const atelierApi: AtelierApi = {
  app: {
    ping: async () => appPingResponseSchema.parse(await ipcRenderer.invoke('app:ping'))
  },
  workspace: {
    getCurrentWorkspace: async () =>
      resultSchema(workspaceStateSchema.nullable()).parse(
        await ipcRenderer.invoke('workspace:getCurrentWorkspace')
      ) as Result<WorkspaceState | null>,
    getConfiguredWorkspacePath: async () =>
      resultSchema(z.string().min(1)).parse(
        await ipcRenderer.invoke('workspace:getConfiguredWorkspacePath')
      ) as Result<string>
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
    listJobs: async () => {
      console.log('[preload] jobs:listJobs invoke')
      const response = await ipcRenderer.invoke('jobs:listJobs')
      console.log('[preload] jobs:listJobs response', response)
      return resultSchema(jobSchema.array()).parse(response) as Result<Job[]>
    },
    clearCompletedJobs: async () => {
      console.log('[preload] jobs:clearCompletedJobs invoke')
      const response = await ipcRenderer.invoke('jobs:clearCompletedJobs')
      console.log('[preload] jobs:clearCompletedJobs response', response)
      return resultSchema(z.null()).parse(response) as Result<null>
    },
    createDemoJob: async () => {
      console.log('[preload] jobs:createDemoJob invoke')
      const response = await ipcRenderer.invoke('jobs:createDemoJob')
      console.log('[preload] jobs:createDemoJob response', response)
      return resultSchema(jobSchema).parse(response) as Result<Job>
    }
  },
  database: {
    getStatus: async () =>
      resultSchema(databaseStatusSchema).parse(
        await ipcRenderer.invoke('database:getStatus')
      ) as Result<DatabaseStatus>,
    getMigrationPreview: async () =>
      resultSchema(databaseMigrationPreviewSchema).parse(
        await ipcRenderer.invoke('database:getMigrationPreview')
      ) as Result<DatabaseMigrationPreview>,
    migrateJsonToSqlite: async () =>
      resultSchema(databaseMigrationResultSchema).parse(
        await ipcRenderer.invoke('database:migrateJsonToSqlite')
      ) as Result<DatabaseMigrationResult>
  },
  imagePipeline: {
    validateSharp: async () =>
      resultSchema(sharpValidationResultSchema).parse(
        await ipcRenderer.invoke('imagePipeline:validateSharp')
      ) as Result<SharpValidationResult>,
    scanSourceArtworks: async (projectId: string) =>
      resultSchema(imageCardSchema.array()).parse(
        await ipcRenderer.invoke('imagePipeline:scanSourceArtworks', projectId)
      ) as Result<ImageCard[]>,
    listImageCards: async (projectId: string) =>
      resultSchema(imageCardSchema.array()).parse(
        await ipcRenderer.invoke('imagePipeline:listImageCards', projectId)
      ) as Result<ImageCard[]>,
    updateImageCard: async (projectId: string, cardId: string, input: UpdateImageCardInput) =>
      resultSchema(imageCardSchema).parse(
        await ipcRenderer.invoke(
          'imagePipeline:updateImageCard',
          projectId,
          cardId,
          updateImageCardInputSchema.parse(input)
        )
      ) as Result<ImageCard>,
    generatePrintableRatios: async (projectId: string) =>
      resultSchema(generatePrintableRatiosResultSchema).parse(
        await ipcRenderer.invoke('imagePipeline:generatePrintableRatios', projectId)
      ) as Result<GeneratePrintableRatiosResult>
  }
}

contextBridge.exposeInMainWorld('atelier', atelierApi)

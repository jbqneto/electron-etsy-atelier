import { registerAppIpc } from './appIpc'
import { registerDatabaseIpc } from './databaseIpc'
import { registerArtworksIpc } from './artworksIpc'
import { registerImagePipelineIpc } from './imagePipelineIpc'
import { registerJobsIpc } from './jobsIpc'
import { registerProjectsIpc } from './projectsIpc'
import { registerWorkspaceIpc } from './workspaceIpc'

export function registerIpcHandlers(): void {
  registerAppIpc()
  registerDatabaseIpc()
  registerWorkspaceIpc()
  registerProjectsIpc()
  registerArtworksIpc()
  registerJobsIpc()
  registerImagePipelineIpc()
}

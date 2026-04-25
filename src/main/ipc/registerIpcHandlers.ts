import { registerAppIpc } from './appIpc'
import { registerArtworksIpc } from './artworksIpc'
import { registerImagePipelineIpc } from './imagePipelineIpc'
import { registerJobsIpc } from './jobsIpc'
import { registerProjectsIpc } from './projectsIpc'
import { registerWorkspaceIpc } from './workspaceIpc'

export function registerIpcHandlers(): void {
  registerAppIpc()
  registerWorkspaceIpc()
  registerProjectsIpc()
  registerArtworksIpc()
  registerJobsIpc()
  registerImagePipelineIpc()
}

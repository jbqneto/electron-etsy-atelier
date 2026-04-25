import { ipcMain } from 'electron'

import type { Result } from '../../shared/types/ipc'
import { jobSchema } from '../../shared/schemas/job'
import { clearCompletedJobs, createDemoJob, listJobs } from '../services/jobService'

function ok<T>(data: T): Result<T> {
  return { ok: true, data }
}

export function registerJobsIpc(): void {
  ipcMain.handle('jobs:listJobs', () => ok(listJobs().map((job) => jobSchema.parse(job))))
  ipcMain.handle('jobs:clearCompletedJobs', () => {
    clearCompletedJobs()
    return ok(null)
  })
  ipcMain.handle('jobs:createDemoJob', () => ok(jobSchema.parse(createDemoJob())))
}

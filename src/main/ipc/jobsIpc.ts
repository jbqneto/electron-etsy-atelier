import { ipcMain } from 'electron'

import type { Result } from '../../shared/types/ipc'
import { jobSchema } from '../../shared/schemas/job'
import { clearCompletedJobs, createDemoJob, listJobs } from '../services/jobService'

function ok<T>(data: T): Result<T> {
  return { ok: true, data }
}

export function registerJobsIpc(): void {
  ipcMain.handle('jobs:listJobs', () => {
    const jobs = listJobs().map((job) => jobSchema.parse(job))
    console.log('[jobs] listJobs returned', jobs.length, 'items')
    return ok(jobs)
  })
  ipcMain.handle('jobs:clearCompletedJobs', () => {
    console.log('[jobs] clearCompletedJobs called')
    clearCompletedJobs()
    return ok(null)
  })
  ipcMain.handle('jobs:createDemoJob', () => {
    const job = jobSchema.parse(createDemoJob())
    console.log('[jobs] createDemoJob created', job.id)
    return ok(job)
  })
}

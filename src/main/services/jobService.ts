import { randomUUID } from 'crypto'

import type { Job, JobStatus } from '../../shared/types/job'

const jobs = new Map<string, Job>()
const timers = new Map<string, NodeJS.Timeout[]>()

function now(): string {
  return new Date().toISOString()
}

function saveJob(job: Job): Job {
  jobs.set(job.id, job)
  return job
}

export function listJobs(): Job[] {
  return Array.from(jobs.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function clearCompletedJobs(): void {
  for (const [id, job] of jobs.entries()) {
    if (job.status === 'completed' || job.status === 'failed') jobs.delete(id)
  }
}

export function createDemoJob(): Job {
  const id = randomUUID()
  const job: Job = {
    id,
    type: 'demo',
    title: 'Demo image pipeline job',
    status: 'pending',
    progress: 0,
    message: 'Queued',
    createdAt: now(),
    updatedAt: now()
  }
  saveJob(job)

  const sequence: Array<{ delay: number; progress: number; status: JobStatus; message: string }> = [
    { delay: 700, progress: 20, status: 'running', message: 'Preparing input' },
    { delay: 1300, progress: 55, status: 'running', message: 'Processing preview step' },
    { delay: 1900, progress: 85, status: 'running', message: 'Finalizing output' },
    { delay: 2500, progress: 100, status: 'completed', message: 'Demo job completed' }
  ]

  const jobTimers: NodeJS.Timeout[] = []
  for (const step of sequence) {
    const timer = setTimeout(() => {
      const current = jobs.get(id)
      if (!current) return
      saveJob({
        ...current,
        progress: step.progress,
        status: step.status,
        message: step.message,
        updatedAt: now()
      })
    }, step.delay)
    jobTimers.push(timer)
  }
  timers.set(id, jobTimers)
  return job
}

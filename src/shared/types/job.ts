export type JobStatus = 'pending' | 'running' | 'completed' | 'failed'

export interface Job {
  id: string
  type: string
  title: string
  status: JobStatus
  progress: number
  message: string
  createdAt: string
  updatedAt: string
}

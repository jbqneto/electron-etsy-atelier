export type Result<T> = { ok: true; data: T } | { ok: false; error: string }

export type FolderKey =
  | 'sourceArtworks'
  | 'upscaled'
  | 'printableRatios'
  | 'mockups'
  | 'pdf'
  | 'exportPackage'

export interface ArtworkItem {
  id: string
  originalName: string
  filename: string
  relativePath: string
  extension: string
  sizeBytes: number
  importedAt: string
}

export interface ProjectSummary {
  id: string
  name: string
  slug: string
  status: 'draft' | 'active' | 'archived'
  description: string
  marketplace: 'etsy'
  createdAt: string
  updatedAt: string
  fullPath: string
  folders: Array<{
    key: FolderKey
    label: string
    path: string
    description: string
    fileCount: number
  }>
}

export interface SharpValidationResult {
  sharpVersion: string
  libvipsVersion: string
  outputFormat: string
  width: number
  height: number
  sizeBytes: number
}

export interface Job {
  id: string
  type: string
  title: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress: number
  message: string
  createdAt: string
  updatedAt: string
}

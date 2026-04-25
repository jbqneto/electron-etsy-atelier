export type ProjectStatus = 'draft' | 'active' | 'archived'

export interface ProjectPaths {
  sourceArtworks: string
  upscaled: string
  printableRatios: string
  mockups: string
  pdf: string
  exportPackage: string
}

export interface Project {
  id: string
  name: string
  slug: string
  status: ProjectStatus
  description: string
  marketplace: 'etsy'
  createdAt: string
  updatedAt: string
  paths: ProjectPaths
}

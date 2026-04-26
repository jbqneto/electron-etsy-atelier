import type { FolderKey } from '../../shared/types/ipc'

export const projectFolderPaths = {
  sourceArtworks: 'source-artworks',
  upscaled: 'upscaled',
  printableRatios: 'printable-ratios',
  mockups: 'mockups',
  pdf: 'pdf',
  exportPackage: 'export-package'
} as const satisfies Record<FolderKey, string>

export const legacyProjectFolderPaths = {
  sourceArtworks: '01-source-artworks',
  upscaled: '02-upscaled',
  printableRatios: '03-printable-ratios',
  mockups: '04-mockups',
  pdf: '05-pdf',
  exportPackage: '06-export-package'
} as const satisfies Record<FolderKey, string>


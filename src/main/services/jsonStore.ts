import { randomUUID } from 'crypto'
import { mkdir, readFile, rename, unlink, writeFile } from 'fs/promises'
import { basename, dirname, isAbsolute, join, relative, resolve } from 'path'

type ReadJsonFileOptions = {
  onCorrupted?: 'fallback' | 'throw'
}

function isFileMissing(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === 'ENOENT'
  )
}

function buildBackupPath(filePath: string): string {
  const timestamp = new Date().toISOString().replace(/[^\d]/g, '').slice(0, 14)
  return join(dirname(filePath), `${basename(filePath)}.${timestamp}.bak`)
}

export async function ensureDirectory(directoryPath: string): Promise<void> {
  await mkdir(directoryPath, { recursive: true })
}

export function validateInsideWorkspace(workspacePath: string, targetPath: string): void {
  const resolvedWorkspace = resolve(workspacePath)
  const resolvedTarget = resolve(targetPath)
  const relation = relative(resolvedWorkspace, resolvedTarget)

  if (relation === '' || (!relation.startsWith('..') && !isAbsolute(relation))) return

  throw new Error('Resolved path is outside the workspace')
}

export function safeJoinWorkspacePath(workspacePath: string, ...segments: string[]): string {
  const targetPath = resolve(workspacePath, ...segments)
  validateInsideWorkspace(workspacePath, targetPath)
  return targetPath
}

export async function backupCorruptedJson(filePath: string, content: string): Promise<string> {
  await ensureDirectory(dirname(filePath))
  const backupPath = buildBackupPath(filePath)
  await writeFile(backupPath, content, 'utf-8')
  return backupPath
}

export async function readJsonFile<T>(
  filePath: string,
  fallback: T,
  options: ReadJsonFileOptions = {}
): Promise<T> {
  const onCorrupted = options.onCorrupted ?? 'fallback'
  let content: string

  try {
    content = await readFile(filePath, 'utf-8')
  } catch (error) {
    if (isFileMissing(error)) return fallback
    throw new Error(`Failed to read JSON file at ${filePath}`)
  }

  try {
    return JSON.parse(content) as T
  } catch {
    const backupPath = await backupCorruptedJson(filePath, content)
    const message = `Corrupted JSON detected at ${filePath}. Backup saved to ${backupPath}.`
    if (onCorrupted === 'throw') {
      throw new Error(message)
    }
    return fallback
  }
}

export async function writeJsonFileAtomic<T>(filePath: string, value: T): Promise<void> {
  await ensureDirectory(dirname(filePath))
  const tempFilePath = join(dirname(filePath), `.${basename(filePath)}.${randomUUID()}.tmp`)
  const content = JSON.stringify(value, null, 2)

  try {
    await writeFile(tempFilePath, content, 'utf-8')
    await rename(tempFilePath, filePath)
  } finally {
    try {
      await unlink(tempFilePath)
    } catch {
      // Ignore cleanup errors when the temp file has already been moved.
    }
  }
}

export async function writeJsonFile<T>(filePath: string, value: T): Promise<void> {
  await writeJsonFileAtomic(filePath, value)
}

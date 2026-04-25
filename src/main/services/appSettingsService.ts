import { mkdir, readFile, writeFile } from 'fs/promises'
import { existsSync } from 'fs'
import { dirname, join } from 'path'

import { app } from 'electron'

import { appSettingsSchema } from '../../shared/schemas/settings'
import type { AppSettings } from '../../shared/types/settings'

const settingsPath = join(app.getPath('userData'), 'settings.json')

function defaultSettings(): AppSettings {
  return { lastWorkspacePath: null }
}

async function ensureSettingsDirectory(): Promise<void> {
  await mkdir(dirname(settingsPath), { recursive: true })
}

export class AppSettingsService {
  private backupCounter = 0

  async readSettings(): Promise<{ settings: AppSettings; error?: string }> {
    await ensureSettingsDirectory()

    if (!existsSync(settingsPath)) {
      const settings = defaultSettings()
      await this.writeSettings(settings)
      return { settings }
    }

    try {
      const raw = await readFile(settingsPath, 'utf-8')
      const settings = appSettingsSchema.parse(JSON.parse(raw))
      return { settings }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to read settings'
      await this.backupCorruptedSettings()
      const settings = defaultSettings()
      await this.writeSettings(settings)
      return { settings, error: message }
    }
  }

  async writeSettings(settings: AppSettings): Promise<void> {
    await ensureSettingsDirectory()
    await writeFile(
      settingsPath,
      JSON.stringify(appSettingsSchema.parse(settings), null, 2),
      'utf-8'
    )
  }

  private async backupCorruptedSettings(): Promise<void> {
    if (!existsSync(settingsPath)) return
    const backupPath = `${settingsPath}.corrupted-${String(this.backupCounter + 1).padStart(3, '0')}`
    this.backupCounter += 1
    await writeFile(backupPath, await readFile(settingsPath, 'utf-8'), 'utf-8')
  }
}

export const appSettingsService = new AppSettingsService()

import { app } from 'electron'
import { join } from 'path'

export function getSettingsPath(): string {
  return join(app.getPath('userData'), 'settings.json')
}

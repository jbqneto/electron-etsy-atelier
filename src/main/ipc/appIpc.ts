import { ipcMain } from 'electron'

import { appPingResponseSchema } from '../../shared/schemas/app'
import type { Result } from '../../shared/types/ipc'

type AppPingResponse = {
  ok: true
  message: 'The Atelier Desktop is running'
}

const appPingResponse: AppPingResponse = {
  ok: true,
  message: 'The Atelier Desktop is running'
}

function ok<T>(data: T): Result<T> {
  return { ok: true, data }
}

export function registerAppIpc(): void {
  ipcMain.handle('app:ping', () => ok(appPingResponseSchema.parse(appPingResponse)))
}

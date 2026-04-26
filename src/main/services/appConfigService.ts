import { resolve } from 'path'

import rawAppConfig from '../../config/config.json'
import { appConfigSchema } from '../../shared/schemas/app-config'
import type { AppConfig } from '../../shared/types/app-config'

const appConfig = appConfigSchema.parse(rawAppConfig) as AppConfig

export function getAppConfig(): AppConfig {
  return appConfig
}

export function getConfiguredWorkspacePath(): string {
  return resolve(appConfig.workspace)
}

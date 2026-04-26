import { spawnSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const devdir = process.env.npm_config_devdir ?? join(tmpdir(), 'node-gyp')
const target = process.env.npm_config_target ?? '39.8.9'

const npmBin = process.platform === 'win32' ? 'npm.cmd' : 'npm'

const result = spawnSync(
  npmBin,
  ['rebuild', 'better-sqlite3', '--foreground-scripts', '--loglevel=error'],
  {
    stdio: 'inherit',
    env: {
      ...process.env,
      npm_config_devdir: devdir,
      npm_config_target: target,
      npm_config_runtime: 'electron',
      npm_config_disturl: 'https://electronjs.org/headers',
      npm_config_build_from_source: 'true'
    }
  }
)

process.exit(result.status ?? 1)

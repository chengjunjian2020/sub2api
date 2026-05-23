#!/usr/bin/env node

import { existsSync, statSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const frontendDir = path.resolve(scriptDir, '..')

const host = process.env.SUB2API_FRONTEND_HOST || 'japan-server'
const remoteDir = process.env.SUB2API_FRONTEND_DIR || '/usr/install/sub2api-frontend/dist'
const distDir = path.resolve(frontendDir, process.env.SUB2API_FRONTEND_DIST || '../backend/internal/web/dist')
const reloadCaddy = process.env.SUB2API_FRONTEND_RELOAD_CADDY === 'true'
const tmpDir = `/tmp/sub2api-frontend-${Date.now()}`

function quote(value) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd || frontendDir,
    stdio: 'inherit',
    shell: false,
  })

  if (result.error) {
    throw result.error
  }
  if (result.status !== 0) {
    process.exit(result.status || 1)
  }
}

if (!existsSync(distDir) || !statSync(distDir).isDirectory()) {
  console.error(`[deploy:frontend] dist directory not found: ${distDir}`)
  console.error('[deploy:frontend] Run `pnpm build` first, or use `pnpm deploy:frontend`.')
  process.exit(1)
}

console.log(`[deploy:frontend] Uploading ${path.relative(frontendDir, distDir)} to ${host}:${remoteDir}`)

run('ssh', [host, `rm -rf ${quote(tmpDir)} && mkdir -p ${quote(tmpDir)}`])
run('scp', ['-r', `${distDir}/.`, `${host}:${tmpDir}/`])

const installCommand = [
  `mkdir -p ${quote(remoteDir)}`,
  `if command -v rsync >/dev/null 2>&1; then rsync -a --delete ${quote(tmpDir)}/ ${quote(remoteDir)}/; else find ${quote(remoteDir)} -mindepth 1 -maxdepth 1 -exec rm -rf {} + && cp -a ${quote(tmpDir)}/. ${quote(remoteDir)}/; fi`,
  `rm -rf ${quote(tmpDir)}`,
].join(' && ')

run('ssh', [host, installCommand])

if (reloadCaddy) {
  run('ssh', [host, 'caddy reload --config /etc/caddy/Caddyfile'])
}

console.log('[deploy:frontend] Done.')

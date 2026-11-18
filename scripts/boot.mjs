// 781-5 — what the node's LaunchAgent (lib/node/autostart.cjs) runs at the person's login on macOS: the node is already up — nothing
// (so the agent can be loaded at once, with no restart); it is not — `pm2 resurrect` brings back the saved list. One line in
// logs/boot.log either way, with the machine's uptime: the proof that the boot reached the node.
import { execFileSync } from 'node:child_process'
import { appendFileSync, mkdirSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const bin = process.env.FRACTERA_PM2 || 'pm2'
// pm2's binary is a node script; the LaunchAgent's PATH carries the node it was written with, so its shebang finds node at login.
const run = (args) => execFileSync(bin, args, { encoding: 'utf8', timeout: 120_000, stdio: ['ignore', 'pipe', 'pipe'] })
const log = (line) => {
  try {
    mkdirSync(path.join(ROOT, 'logs'), { recursive: true })
    appendFileSync(path.join(ROOT, 'logs', 'boot.log'), `${new Date().toISOString()} uptime ${Math.round(os.uptime())} s — ${line}\n`)
  } catch { /* nowhere to write — launchd keeps stdout in logs/boot-out.log */ }
}

let online = false
try {
  const out = run(['jlist'])
  // ✗ 2026-11-18 11:39 (the first real boot): a fresh pm2 daemon prints «[PM2] Spawning…» before the JSON — the list is the line that
  // starts with «[» and ends with «]», never the first «[».
  const json = out.split('\n').map((l) => l.trim()).find((l) => l.startsWith('[') && l.endsWith(']') && !l.startsWith('[PM2')) ?? '[]'
  online = JSON.parse(json).some((p) => p.name === 'fractera-web4' && p.pm2_env?.status === 'online')
} catch (e) {
  log(`pm2 jlist failed: ${e instanceof Error ? e.message.split('\n')[0] : e}`)
}
if (online) {
  log('the node is already up — nothing to do')
} else {
  try {
    run(['resurrect'])
    log('pm2 resurrect — the saved list is coming back')
  } catch (e) {
    log(`pm2 resurrect failed: ${e instanceof Error ? e.message.split('\n')[0] : e}`)
    process.exitCode = 1
  }
}

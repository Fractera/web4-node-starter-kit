// 781-5 — POWER ON → THE NODE IS UP, WITH NO SUDO (macOS).
//
// The owner, 2026-11-18: «ноутбук стоит дома а пользователь с телефоном находится на работе. Если мы необходимо включиться он позвонит
// членов семьи чтобы они открыли ноутбук и включили его. После этого через несколько минут должен начать работать в Telegram».
// ✗ Measured that morning: this Mac had no autostart at all — `serve:autostart` asks `pm2 startup launchd`, which only prints a `sudo …`
// line, and nobody ran it; after the reboot nothing started until an outside agent typed `pm2 resurrect`.
//
// A user LaunchAgent needs no sudo: launchd runs it at the person's login (with FileVault the password at power-on IS that login).
// Its program is `scripts/boot.mjs`: the processes are already up — it does nothing (so loading it now is harmless); they are not —
// `pm2 resurrect` brings back the saved list. The list is saved only when it is complete (every element that is on is online), never
// half: a half list would bring back half a node after the next reboot. Written by the core on the person's press (the window or the
// Pult), never by the agent — the agent's permissions rightly refuse system persistence. Linux keeps `pm2 startup` (systemd),
// Windows its Startup folder (scripts/serve.mjs `autostart`).

'use strict'

const { execFileSync } = require('node:child_process')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')

const LABEL = 'ai.fractera.node'
const plistFile = () => path.join(os.homedir(), 'Library', 'LaunchAgents', `${LABEL}.plist`)
const pm2Plist = () => path.join(os.homedir(), 'Library', 'LaunchAgents', `pm2.${os.userInfo().username}.plist`)
const xml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** pm2's own binary next to the running node (global npm), or by PATH — a full path: at login PATH is not the terminal's. */
function pm2Bin() {
  const near = path.join(path.dirname(process.execPath), 'pm2')
  if (fs.existsSync(near)) return near
  try { return execFileSync('/usr/bin/which', ['pm2'], { encoding: 'utf8' }).trim() || null } catch { return null }
}

/** Is the node started at login on this machine? → { platform, on, how } */
function state() {
  if (process.platform !== 'darwin') return { platform: process.platform, on: null, how: 'pm2-startup' }
  if (fs.existsSync(plistFile())) return { platform: 'darwin', on: true, how: 'launch-agent', file: plistFile() }
  if (fs.existsSync(pm2Plist())) return { platform: 'darwin', on: true, how: 'pm2-launchd', file: pm2Plist() }
  return { platform: 'darwin', on: false, how: null }
}

/** pm2's processes now: name → status. */
function pm2List(bin) {
  try {
    const out = execFileSync(process.execPath, [bin, 'jlist'], { encoding: 'utf8', timeout: 20_000, stdio: ['ignore', 'pipe', 'ignore'] })
    // a fresh daemon prints «[PM2] Spawning…» first (✗ boot.mjs 2026-11-18 11:39) — the list is its own line
    const json = out.split('\n').map((l) => l.trim()).find((l) => l.startsWith('[') && l.endsWith(']') && !l.startsWith('[PM2')) ?? '[]'
    return Object.fromEntries(JSON.parse(json).map((p) => [p.name, p.pm2_env?.status ?? '?']))
  } catch { return null }
}

/** The processes a complete node has: the core and every element of the registry that is on. */
function expected(root) {
  const names = ['fractera-web4']
  try {
    const reg = JSON.parse(fs.readFileSync(path.join(root, 'WEB4-ITEMS-REGISTRY', 'web4-items.json'), 'utf8'))
    // 837-0f: a static require — inside the core's Next bundle a computed path compiles into «Cannot find module 'unknown'»
    const power = require('../web4-items/element-power.cjs')
    for (const e of reg.services ?? []) {
      if (!e?.id) continue
      let off = false
      try { off = power.isOff(e) === true } catch { off = false }
      if (!off) names.push(`fractera-svc-${e.id}`)
    }
  } catch { /* no registry — the core alone */ }
  return names
}

/** Save pm2's list only when complete. → { ok, missing? } */
function saveIfComplete(root, bin) {
  const list = pm2List(bin)
  if (!list) return { ok: false, reason: 'pm2 does not answer' }
  const missing = expected(root).filter((n) => list[n] !== 'online')
  if (missing.length) return { ok: false, reason: 'the list is not complete', missing }
  execFileSync(process.execPath, [bin, 'save'], { timeout: 20_000, stdio: 'ignore' })
  return { ok: true }
}

function plistText(root, bin) {
  const nodeDir = path.dirname(process.execPath)
  const PATH = [...new Set([nodeDir, path.dirname(bin), '/opt/homebrew/bin', '/usr/local/bin', '/usr/bin', '/bin', '/usr/sbin', '/sbin'])].join(':')
  const pm2Home = process.env.PM2_HOME || path.join(os.homedir(), '.pm2')
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>${LABEL}</string>
  <key>ProgramArguments</key>
  <array>
    <string>${xml(process.execPath)}</string>
    <string>${xml(path.join(root, 'scripts', 'boot.mjs'))}</string>
  </array>
  <key>WorkingDirectory</key><string>${xml(root)}</string>
  <key>EnvironmentVariables</key>
  <dict>
    <key>PATH</key><string>${xml(PATH)}</string>
    <key>PM2_HOME</key><string>${xml(pm2Home)}</string>
    <key>FRACTERA_PM2</key><string>${xml(bin)}</string>
  </dict>
  <key>RunAtLoad</key><true/>
  <key>AbandonProcessGroup</key><true/>
  <key>StandardOutPath</key><string>${xml(path.join(root, 'logs', 'boot-out.log'))}</string>
  <key>StandardErrorPath</key><string>${xml(path.join(root, 'logs', 'boot-err.log'))}</string>
</dict>
</plist>
`
}

/**
 * Turn the autostart on (macOS): save the complete list, write the LaunchAgent, load it now (its program sees the node up and exits).
 * → { ok, did, file?, reason?, missing? }
 */
function enable(root) {
  if (process.platform !== 'darwin') return { ok: false, reason: 'macOS only here; Linux and Windows: npm run serve:autostart' }
  const bin = pm2Bin()
  if (!bin) return { ok: false, reason: 'pm2 is not found' }
  const saved = saveIfComplete(root, bin)
  if (!saved.ok) return { ok: false, reason: saved.reason, missing: saved.missing }
  fs.mkdirSync(path.dirname(plistFile()), { recursive: true })
  fs.mkdirSync(path.join(root, 'logs'), { recursive: true })
  fs.writeFileSync(plistFile(), plistText(root, bin))
  const uid = os.userInfo().uid
  try { execFileSync('/bin/launchctl', ['bootout', `gui/${uid}/${LABEL}`], { stdio: 'ignore' }) } catch { /* not loaded yet */ }
  try { execFileSync('/bin/launchctl', ['bootstrap', `gui/${uid}`, plistFile()], { stdio: 'ignore' }) } catch { /* loads at the next login anyway */ }
  return { ok: true, did: 'launch-agent', file: plistFile() }
}

/** Is the LaunchAgent loaded in launchd right now (the proof of 781-5). */
function loaded() {
  if (process.platform !== 'darwin') return null
  try { execFileSync('/bin/launchctl', ['print', `gui/${os.userInfo().uid}/${LABEL}`], { stdio: 'ignore' }); return true } catch { return false }
}

module.exports = { LABEL, state, enable, loaded, expected, plistFile }

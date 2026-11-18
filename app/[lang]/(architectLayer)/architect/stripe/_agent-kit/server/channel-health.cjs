// 781-1/2 — DOES THE BOT HEAR: the Telegram plugin of a session is a fact, not a launch flag; the poison of the machine-wide failure
// cache cannot come back.
//
// The owner, 2026-11-18: «ноутбук стоит дома а пользователь с телефоном находится на работе … через несколько минут должен начать работать
// в Telegram»; «Telegram начинает писать сообщения какие-то размышления … и тем не менее до сих пор Telegram не включён».
// ✗ Measured that morning (development-docs/reports/errors-the-main-agent-bot-went-deaf-after-the-reboot.md): a Claude Code session in the
// home folder started the plugin enabled for the whole machine, it died without a token, Claude Code wrote `plugin:telegram:telegram`
// into `~/.claude/mcp-needs-auth-cache.json` — and for 15 minutes every session of the machine skipped the plugin, while the node counted
// a session «launched with --channels» as hearing.
//
// Self-contained (node builtins only): bundled with the channel door and loaded by the core's mount (552-6 — no computed requires here).

'use strict'

const { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } = require('node:fs')
const os = require('node:os')
const path = require('node:path')

const PLUGIN = 'telegram@claude-plugins-official'
const CACHE_KEY = 'plugin:telegram:telegram'

const claudeHome = (env) => (env && env.CLAUDE_CONFIG_DIR) || path.join(os.homedir(), '.claude')

/**
 * 781-2: the poison out of one Claude Code home — ONE key in each of the person's files, nothing else:
 *  · the failure cache: the Telegram plugin's entry removed (a node launch never waits out someone else's 15 minutes);
 *  · the user settings: the plugin → false (614-2 again: a session outside the node never starts it; a node session turns it on for
 *    itself with `--settings`). The settings are backed up once, before the first change, into `backupFile`.
 * A file we cannot read as an object is left untouched. → { cache: removed|none|unknown, global: turned-off|off|none|unknown }
 */
function clearPoison(env, backupFile = null) {
  const home = claudeHome(env)
  const out = { cache: 'none', global: 'none' }
  const cacheFile = path.join(home, 'mcp-needs-auth-cache.json')
  if (existsSync(cacheFile)) {
    try {
      const j = JSON.parse(readFileSync(cacheFile, 'utf8'))
      if (!j || typeof j !== 'object' || Array.isArray(j)) out.cache = 'unknown'
      else if (Object.prototype.hasOwnProperty.call(j, CACHE_KEY)) {
        delete j[CACHE_KEY]
        writeFileSync(cacheFile, JSON.stringify(j))
        out.cache = 'removed'
      }
    } catch { out.cache = 'unknown' }
  }
  const settingsFile = path.join(home, 'settings.json')
  if (existsSync(settingsFile)) {
    try {
      const raw = readFileSync(settingsFile, 'utf8')
      const j = JSON.parse(raw)
      const plugins = j && typeof j === 'object' && !Array.isArray(j) ? j.enabledPlugins : null
      if (plugins && typeof plugins === 'object' && plugins[PLUGIN] === true) {
        if (backupFile && !existsSync(backupFile)) {
          mkdirSync(path.dirname(backupFile), { recursive: true })
          writeFileSync(backupFile, raw)
        }
        plugins[PLUGIN] = false
        writeFileSync(settingsFile, `${JSON.stringify(j, null, 2)}\n`)
        out.global = 'turned-off'
      } else if (plugins && plugins[PLUGIN] === false) out.global = 'off'
    } catch { out.global = 'unknown' }
  }
  return out
}

/** 781-1: the plugin's live pid from its `bot.pid`, written not earlier than `sinceMs` (a killed session never erases its file), or null. */
function pluginPid(stateDir, sinceMs = 0) {
  try {
    const file = path.join(stateDir, 'bot.pid')
    const st = statSync(file)
    if (st.mtimeMs < sinceMs - 500) return null
    const pid = Number(readFileSync(file, 'utf8'))
    if (!(pid > 1)) return null
    process.kill(pid, 0)
    return { pid, at: st.mtimeMs }
  } catch {
    return null
  }
}

/**
 * 781-1: the state of an agent's channel for the panel, the Pult and `npm run person` — `data/services/<id>/channel-state.json`.
 * state: starting · hears · healing (deaf, the node restarts it when its turn ends) · failed (closed, the node reads the bot) ·
 * asleep (no session). Written by the bridge on every change; the readers cross-check it with the plugin's pid (`lib/node/main-channel.cjs`).
 */
function writeState(root, element, rec) {
  try {
    const file = path.join(root, 'data', 'services', element, 'channel-state.json')
    mkdirSync(path.dirname(file), { recursive: true })
    writeFileSync(file, JSON.stringify({ ...rec, at: new Date().toISOString() }, null, 2))
  } catch { /* the state is for eyes; the work never stops for it */ }
}

module.exports = { PLUGIN, CACHE_KEY, claudeHome, clearPoison, pluginPid, writeState }

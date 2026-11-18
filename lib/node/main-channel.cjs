// 781-1/4 — ONE MODEL-FREE ANSWER TO «DOES THE MAIN AGENT'S BOT HEAR?» for the panel's red band, the Pult's card and `npm run person`.
//
// The bridge writes `data/services/<id>/channel-state.json` on every change (starting · hears · healing · failed · asleep, the agent kit's
// `channel-health.cjs`); this reader cross-checks it with the facts, because a file outlives the process that wrote it: the plugin's
// `bot.pid` alive, the session's record (`session-mode.json`), the bot itself (a token and an admitted chat).
// → { bot, state: 'no-bot'|'asleep'|'starting'|'hears'|'healing'|'deaf'|'failed', why, since }
//   deaf — a session that should hear and has no live plugin, while the bridge did not say «healing» yet (or the core is down).

'use strict'

const fs = require('node:fs')
const path = require('node:path')

const readJson = (f, fb) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')) } catch { return fb } }

function botExists(dir) {
  try {
    const token = fs.readFileSync(path.join(dir, '.env'), 'utf8').split(/\r?\n/).some((l) => /^TELEGRAM_BOT_TOKEN=\S+/.test(l))
    const allowed = readJson(path.join(dir, 'access.json'), {}).allowFrom
    return token && Array.isArray(allowed) && allowed.length > 0
  } catch { return false }
}

function pluginAlive(dir) {
  try {
    const pid = Number(fs.readFileSync(path.join(dir, 'bot.pid'), 'utf8'))
    if (!(pid > 1)) return false
    process.kill(pid, 0)
    return true
  } catch { return false }
}

function health(root, id = 'build') {
  const svc = path.join(root, 'data', 'services', id)
  const dir = path.join(svc, 'channel', 'telegram')
  if (!botExists(dir)) return { bot: false, state: 'no-bot', why: null, since: null }
  const rec = readJson(path.join(svc, 'channel-state.json'), null)
  const mode = readJson(path.join(svc, 'session-mode.json'), {})
  const alive = pluginAlive(dir)
  const since = rec?.at ?? null
  const why = rec?.why ?? null
  if (alive) return { bot: true, state: 'hears', why: null, since }
  if (!mode.running) return { bot: true, state: rec?.state === 'failed' ? 'failed' : 'asleep', why, since }
  if (rec?.state === 'starting' || rec?.state === 'healing' || rec?.state === 'failed') return { bot: true, state: rec.state, why, since }
  return { bot: true, state: 'deaf', why: why ?? 'no-plugin', since }
}

/** The red band and the Pult's warning show only these. */
const trouble = (h) => ['deaf', 'healing', 'failed'].includes(h?.state)

module.exports = { health, trouble }

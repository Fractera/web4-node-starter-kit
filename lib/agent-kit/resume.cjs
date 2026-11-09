// A CONVERSATION CUT BY ACCIDENT IS CONTINUED, NOT LOST (step 708). The owner 2026-11-09: «механическая прерывание когда например по
// ошибке пользователь … остановил терминал или просто разрядился компьютер … Так же точно и с элементами»; his choice «b»: the main
// agent comes back by itself after a lost session, elements by the terminal's button and the bot's /on.
//
// 🔒 THE CONVERSATION IS NAMED BY THE NODE. Every agent session the bridge starts gets `--session-id <uuid>` (Claude Code 2.1.319,
// `claude --help`), recorded in `data/services/<id>/session-mode.json` as `conversation`; continuing is `--resume <uuid>`, never
// `--continue` (that takes the folder's newest conversation — a work session `<id>--work` runs in the same folder).
// 🔒 HOW THE LAST SESSION ENDED — `why` of the same record: `closed-by-agent` / `closed-woken-by-main` (the person's «выключить», done
// --close) are clean; `stopped` (the Stop button), `exited` (the process ended by itself), `channel-failed` and `lost` (the core's start
// found `running: true` — power, a killed core) are not. Browser storage was rejected: the agent cannot read it, Telegram has none.
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')

const MAIN = 'build'
const UNCLEAN = new Set(['stopped', 'exited', 'channel-failed', 'lost'])
/** From this fill of the window a fresh session with the letter is the better default (the button says why). */
const FULL_FROM = 80
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

const svc = (root, id) => path.join(root, 'data', 'services', id)
const modeFile = (root, id) => path.join(svc(root, id), 'session-mode.json')
function readJson(file) { try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return null } }
const readMode = (root, id) => readJson(modeFile(root, id))

/** Where Claude Code keeps the folder's conversations (689: an element on its own person's subscription — its own Claude folder). */
/** @type {(cwd: string, configDir?: string | null) => string} */
const journalDir = (cwd, configDir = null) => path.join(configDir || path.join(os.homedir(), '.claude'), 'projects', String(cwd).replace(/[:\\/]/g, '-'))
/** The transcript of a recorded conversation, or null when it is not on disk (never started, deleted). */
/** @param {string | null} cwd @param {unknown} id @param {string | null} [configDir] */
function conversationFile(cwd, id, configDir = null) {
  if (!cwd || !UUID.test(String(id ?? ''))) return null
  const f = path.join(journalDir(cwd, configDir), `${id}.jsonl`)
  return fs.existsSync(f) ? f : null
}

/** The id the next continuing start resumes: the recorded conversation of this element, if its transcript exists. */
/** @param {string} root @param {string} id @param {string | null} cwd @param {string | null} [configDir] */
function resumable(root, id, cwd, configDir = null) {
  const rec = readMode(root, id)
  return conversationFile(cwd, rec?.conversation, configDir) ? rec.conversation : null
}

/**
 * 708-6: the id `claude --continue` takes — the newest transcript of the folder. A session continued that way (a record older than 708,
 * ✗ 2026-11-09 14:52: the main agent came back with `conversation: null`) gets its id recorded, so the next cut can be continued too.
 * @param {string | null} cwd @param {string | null} [configDir]
 */
function newest(cwd, configDir = null) {
  if (!cwd) return null
  try {
    const dir = journalDir(cwd, configDir)
    const all = fs.readdirSync(dir).filter((f) => UUID.test(f.replace(/\.jsonl$/, '')) && f.endsWith('.jsonl')).map((f) => ({ f, t: fs.statSync(path.join(dir, f)).mtimeMs })).sort((a, b) => b.t - a.t)
    return all.length ? all[0].f.replace(/\.jsonl$/, '') : null
  } catch { return null }
}

/**
 * What the sleeping terminal offers: null — nothing to continue; otherwise how the last session ended, how full its window was
 * (`context.json`, written by the status line, 700-1) and which button is the main one.
 */
/** @param {string} root @param {string} id @param {string | null} cwd @param {string | null} [configDir] */
function offer(root, id, cwd, configDir = null) {
  const rec = readMode(root, id)
  if (!rec || rec.running === true || !conversationFile(cwd, rec.conversation, configDir)) return null
  const ctx = readJson(path.join(svc(root, id), 'context.json'))
  const used = typeof ctx?.used === 'number' ? ctx.used : null
  const unclean = UNCLEAN.has(String(rec.why ?? ''))
  const full = used !== null && used >= FULL_FROM
  return { end: rec.why ?? null, at: rec.at ?? null, unclean, used, full, primary: unclean && !full ? 'continue' : 'new' }
}
/** Bot /on and «включить»: continue by itself only after an unclean end with room left in the window. */
/** @type {(root: string, id: string, cwd: string | null, configDir?: string | null) => boolean} */
const continuesByItself = (root, id, cwd, configDir = null) => offer(root, id, cwd, configDir)?.primary === 'continue'

/**
 * The core's start (instrumentation): a record still `running: true` means its session died with the core. Skipped while a core build
 * record exists — the build's own return (675, 707) brings those agents back. Returns the ids marked lost.
 */
function markLost(root, at = new Date()) {
  if (fs.existsSync(path.join(root, 'data', 'node', 'agent-return.json'))) return []
  let ids = []
  try { ids = fs.readdirSync(path.join(root, 'data', 'services')) } catch { return [] }
  const lost = []
  for (const id of ids) {
    const rec = readMode(root, id)
    if (rec?.running !== true) continue
    const next = { running: false, effort: 'medium', ultracode: false, workflows: false, why: 'lost', conversation: rec.conversation ?? null, lostFrom: rec.at ?? null, at: at.toISOString() }
    try { fs.writeFileSync(modeFile(root, id), JSON.stringify(next, null, 2) + '\n', 'utf8'); lost.push(id) } catch { /* a record, not a condition */ }
  }
  return lost
}

/** The tail of the recorded (or newest) conversation: the words of its last turns, without tool calls and outputs. */
/** @param {string} cwd @param {{ id?: string | null, configDir?: string | null, turns?: number, maxChars?: number }} [opts] */
function tail(cwd, { id = null, configDir = null, turns = 12, maxChars = 6000 } = {}) {
  const dir = journalDir(cwd, configDir)
  let file = conversationFile(cwd, id, configDir)
  if (!file) {
    try {
      const all = fs.readdirSync(dir).filter((f) => f.endsWith('.jsonl')).map((f) => ({ f, t: fs.statSync(path.join(dir, f)).mtimeMs })).sort((a, b) => b.t - a.t)
      file = all.length ? path.join(dir, all[0].f) : null
    } catch { file = null }
  }
  if (!file) return null
  const out = []
  const lines = fs.readFileSync(file, 'utf8').split('\n')
  for (let i = lines.length - 1; i >= 0 && out.length < turns; i--) {
    let row = null
    try { row = JSON.parse(lines[i]) } catch { continue }
    if (row?.isSidechain || (row?.type !== 'user' && row?.type !== 'assistant')) continue
    const c = row.message?.content
    const text = typeof c === 'string' ? c : Array.isArray(c) ? c.filter((p) => p?.type === 'text').map((p) => p.text).join('\n') : ''
    if (!text.trim() || /^<(command|local-command|system-reminder)/.test(text.trim())) continue
    out.push(`[${String(row.timestamp ?? '').slice(0, 16).replace('T', ' ')}Z] ${row.type === 'user' ? 'person/node' : 'agent'}: ${text.trim().slice(0, 1500)}`)
  }
  const words = out.reverse().join('\n\n')
  return { file, id: path.basename(file, '.jsonl'), text: words.length > maxChars ? `…${words.slice(-maxChars)}` : words }
}

module.exports = { MAIN, UNCLEAN, FULL_FROM, readMode, journalDir, conversationFile, resumable, newest, offer, continuesByItself, markLost, tail }

// THE CORE'S SIDE OF THE HOOK RELAY (node step 811-5a). `lib/agent-kit/hook-relay.cjs` (run by a walled element's session as `fe-<id>`)
// posts a hook event here through the door `/api/node/hook-relay`; this file runs the REAL hook — a script of the core — as the node's
// user, exactly as the bridge would have run it in that element's session on a home computer.
// 🔒 A FIXED LIST: a name maps to one script of the core; nothing else ever runs. The element id passed to the script is the caller's —
// proved by its own key at the door — never a word of the request; the one free argument (the pulse's event) is checked against its list.
// 🔒 The script runs in the element's own folder (the hooks and the skills server read the session's folder from `cwd`), with the node's
// environment (its own scripts, as before) and the element's own Claude folder as CLAUDE_CONFIG_DIR when it has one (limits, pulse).
const path = require('node:path')
const fs = require('node:fs')
const { spawn } = require('node:child_process')

const PULSE_EVENTS = new Set(['turn-start', 'turn-end', 'turn-error', 'session-end'])
const MAX_OUT = 1024 * 1024

/** name → how to run it: script (from the node's root) and its arguments for the caller `id`. */
function planOf(root, name, id, arg) {
  const lib = (...p) => path.join(root, 'lib', 'agent-kit', ...p)
  switch (name) {
    case 'record': return { script: lib('memory', 'record.cjs'), args: [id] }
    case 'brief': return { script: lib('memory', 'brief.cjs'), args: [id] }
    case 'recall': return { script: lib('memory', 'recall.cjs'), args: [id] }
    case 'window': return { script: lib('window.cjs'), args: [id] }
    case 'limits': return { script: lib('limits.cjs'), args: [id] }
    case 'progress': return { script: lib('progress.cjs'), args: [root, id] }
    case 'pulse': return PULSE_EVENTS.has(arg) ? { script: lib('pulse.cjs'), args: [id, arg] } : null
    case 'github-push': return { script: path.join(root, 'scripts', 'element-github-push.mjs'), args: [id] }
    case 'mcp:skills': return { script: lib('skills', 'mcp.mjs'), args: [], mcp: true }
    default: return null
  }
}

/** The names the bridge may give a walled session (and the door accepts). */
const NAMES = ['record', 'brief', 'recall', 'window', 'limits', 'progress', 'pulse', 'github-push', 'mcp:skills']

/** Which relay name a hook script of the core is — by its file (the bridge maps a session's hooks with it). */
const BY_FILE = { 'record.cjs': 'record', 'brief.cjs': 'brief', 'recall.cjs': 'recall', 'window.cjs': 'window', 'limits.cjs': 'limits', 'progress.cjs': 'progress', 'pulse.cjs': 'pulse' }

/**
 * 818-3 (the red team 817 H2, measured 2026-11-20: an element posted `record` with the MAIN agent's transcript as `transcript_path`, and
 * the node — reading as its own user — copied 9 lines of that conversation into the diary as the element's and into its vectors).
 * A session's own conversation is the one file whose folder is named EXACTLY after the element's folder (Claude Code names a project by
 * its cwd: every character but a letter or a digit → «-»), inside `projects/` of a Claude home; links resolved first. Exact, never a prefix: «…-user-root» is a
 * prefix of «…-user-root-shop». No path — nothing to read, allowed.
 * @returns {string|null} why it is refused, or null
 */
function transcriptRefusal(dir, stdin) {
  let input = null
  try { input = JSON.parse(stdin || '{}') } catch { return null }
  const p = input && typeof input.transcript_path === 'string' ? input.transcript_path : ''
  if (!p) return null
  let real = ''
  try { real = fs.realpathSync(p) } catch { return 'the transcript does not exist' }
  let own = dir
  try { own = fs.realpathSync(dir) } catch { /* the folder as given */ }
  const project = own.replace(/[^a-zA-Z0-9]/g, '-')
  if (!real.endsWith('.jsonl')) return 'not a transcript'
  if (path.basename(path.dirname(real)) !== project) return "the transcript is not this element's own session"
  if (path.basename(path.dirname(path.dirname(real))) !== 'projects') return "the transcript is not in a Claude home's projects"
  return null
}

/**
 * Run one relayed event for the element `id` (already proved by its key).
 * @param {{ root: string, id: string, dir: string, name: string, arg?: string|null, stdin?: string, timeoutMs?: number, env?: object }} o
 * @returns {Promise<{ ok: boolean, stdout?: string, stderr?: string, code?: number, error?: string }>}
 */
function runRelayed({ root, id, dir, name, arg = null, stdin = '', timeoutMs = 60_000, env = process.env }) {
  const plan = planOf(root, name, id, arg)
  if (!plan) return Promise.resolve({ ok: false, error: `not a relayed hook: ${String(name).slice(0, 40)}` })
  if (!fs.existsSync(plan.script)) return Promise.resolve({ ok: false, error: 'the hook is not in this core' })
  if (name === 'record') {
    const why = transcriptRefusal(dir, stdin)
    if (why) return Promise.resolve({ ok: false, error: `record refused: ${why}` })
  }
  const own = path.join(root, 'data', 'services', id, 'claude')
  const childEnv = { ...env }
  delete childEnv.CLAUDE_CONFIG_DIR
  if (fs.existsSync(own)) childEnv.CLAUDE_CONFIG_DIR = own
  return new Promise((resolve) => {
    let stdout = ''
    let stderr = ''
    let done = false
    const child = spawn(process.execPath, [plan.script, ...plan.args], { cwd: dir, env: childEnv, stdio: ['pipe', 'pipe', 'pipe'] })
    const end = (r) => { if (done) return; done = true; clearTimeout(timer); resolve(r) }
    const timer = setTimeout(() => { try { child.kill('SIGKILL') } catch { /* gone */ } end({ ok: true, stdout, stderr, code: 0 }) }, timeoutMs)
    child.stdout.setEncoding('utf8')
    child.stderr.setEncoding('utf8')
    // An MCP request: the answer is the line with the request's id; a notification has none — the server is closed at once.
    let wantId
    if (plan.mcp) { try { wantId = JSON.parse(stdin).id } catch { wantId = undefined } }
    child.stdout.on('data', (c) => {
      if (stdout.length < MAX_OUT) stdout += c
      if (plan.mcp && wantId !== undefined && stdout.split('\n').some((l) => { try { return JSON.parse(l).id === wantId } catch { return false } })) child.stdin.end()
    })
    child.stderr.on('data', (c) => { if (stderr.length < MAX_OUT) stderr += c })
    child.on('error', (e) => end({ ok: false, error: e.message }))
    child.on('close', (code) => end({ ok: true, stdout, stderr, code: code ?? 0 }))
    child.stdin.on('error', () => { /* the hook did not read its input */ })
    child.stdin.write(plan.mcp ? `${stdin.trim()}\n` : stdin)
    if (!plan.mcp || wantId === undefined) child.stdin.end()
  })
}

/**
 * The bridge's side: a walled session's hooks (the object of `--settings` `hooks`) with every core script replaced by the relay. A hook
 * of the core not in the list is dropped — an element user could not read it anyway — and named in `dropped`.
 * @param {object|null} hooks  @param {{ node: string, relay: string }} at
 */
function relayHooks(hooks, at) {
  const dropped = []
  if (!hooks) return { hooks: null, dropped }
  const out = {}
  for (const [event, groups] of Object.entries(hooks)) {
    const list = []
    for (const g of groups) {
      const hs = (g.hooks || []).map((h) => relayOne(h, at)).filter((h) => h || (dropped.push(event), false))
      if (hs.length) list.push({ ...g, hooks: hs })
    }
    if (list.length) out[event] = list
  }
  return { hooks: Object.keys(out).length ? out : null, dropped }
}

/** One hook (exec form `{command, args}` or shell form `node <script> <args>`) → its relay twin, or null. */
function relayOne(h, at) {
  if (!h || h.type !== 'command') return null
  const exec = Array.isArray(h.args)
  const words = exec ? h.args : String(h.command || '').trim().split(/\s+/).slice(1)
  const file = path.basename(String(words[0] || ''))
  const name = BY_FILE[file]
  if (!name) return null
  // the pulse keeps its event (its last word); every other relayed hook needs nothing but the caller, which the door knows
  const arg = name === 'pulse' ? words[words.length - 1] : null
  const tail = arg ? [name, arg] : [name]
  const { args: _a, command: _c, ...rest } = h
  return exec ? { ...rest, command: at.node, args: [at.relay, ...tail] } : { ...rest, command: [q(at.node), q(at.relay), ...tail].join(' ') }
}

const q = (s) => (/^[A-Za-z0-9_./@+-]+$/.test(s) ? s : `'${String(s).replace(/'/g, `'\\''`)}'`)

/** The statusLine of a walled session: the limits line through the relay. */
function relayLine(line, at) {
  if (!line) return null
  const r = relayOne(line, at)
  return r ? { ...r, type: 'command' } : null
}

module.exports = { NAMES, planOf, runRelayed, relayHooks, relayOne, relayLine, transcriptRefusal }

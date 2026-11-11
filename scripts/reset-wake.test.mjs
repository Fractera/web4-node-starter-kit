// 728: after its own reset an agent's fresh session wakes with its letter — the main agent and an element — even in a long session
// (its 256 KB screen buffer full) and when the turn goes on after the ask. ✗ 2026-11-11 18:21: the bridge typed `/clear` into a running
// turn and pasted the letter 9 s later into the OLD conversation; the old agent answered it at 65 % of its window and the new one got
// nothing. Run: npm run test:reset-wake (about 40 s, no model, no real claude).
// A fake Claude Code stands in for the terminal and the REAL bridge copies drive it — `architect/build/_agent-kit` for the main agent,
// `architect/[item]/_agent-kit` for an element. The fake prints a spinner while a turn runs, queues what is typed during a turn the way
// Claude Code does (a slash command waits for the turn's end, words go into the running turn), and on `/clear` writes the pulse's
// `session-end reason=clear`, starts a new conversation and writes its transcript where `resume.journalDir` looks. Everything lives in a
// temporary root (a link to lib/, its own data/) and a temporary home: the node's own records are never touched.
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, symlinkSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { createRequire } from 'node:module'
import { randomUUID } from 'node:crypto'
import { fileURLToPath } from 'node:url'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..')
const ARCH = join(REPO, 'app', '[lang]', '(architectLayer)', 'architect')
const tmp = mkdtempSync(join(tmpdir(), 'reset-wake-'))
const root = join(tmp, 'root')
const home = join(tmp, 'home')
mkdirSync(join(root, 'data', 'services'), { recursive: true })
mkdirSync(home, { recursive: true })
symlinkSync(join(REPO, 'lib'), join(root, 'lib'), 'junction')
// The bridge finds lib/ and data/ from the working folder and the transcripts from the home: both temporary, set before it loads.
process.env.HOME = home
process.env.USERPROFILE = home
process.chdir(root)
const require = createRequire(import.meta.url)
const resume = require(join(REPO, 'lib', 'agent-kit', 'resume.cjs'))
const kit = (group) => ({
  bridge: require(join(ARCH, group, '_agent-kit', 'server', 'bridge.cjs')),
  session: require(join(ARCH, group, '_agent-kit', 'server', 'session.cjs')),
})
const KITS = { main: kit('build'), item: kit('[item]') }

let bad = 0
const ok = (cond, what) => { console.log(`${cond ? '✓' : '✗'} ${what}`); if (!cond) bad++ }
const LETTER = '⟦node · context-reset'
const FULL = 256 * 1024
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/**
 * A fake Claude Code session registered in the node's session map. `turnMs` — how long the turn already running at the ask goes on
 * (0: the turn has ended); `deaf` — `/clear` never takes effect.
 */
function fakeClaude(k, service, element, { turnMs = 0, deaf = false } = {}) {
  const cwd = join(tmp, 'work', service)
  mkdirSync(cwd, { recursive: true })
  const f = { conv: randomUUID(), first: null, turn: null, queue: [], input: '', got: [], timers: new Set(), deaf }
  f.first = f.conv
  const pulseFile = join(root, 'data', 'services', element, 'pulse.json')
  mkdirSync(dirname(pulseFile), { recursive: true })
  const pulse = (event, extra = {}) => {
    let prev = {}
    try { prev = JSON.parse(readFileSync(pulseFile, 'utf8')) } catch { /* first */ }
    const now = { at: new Date().toISOString(), event, session: f.conv, login: 'node', ...extra }
    writeFileSync(pulseFile, JSON.stringify({ last: now, history: [now, ...(prev.history ?? [])].slice(0, 20) }, null, 2))
  }
  const transcript = (id) => {
    const dir = resume.journalDir(cwd, null)
    mkdirSync(dir, { recursive: true })
    writeFileSync(join(dir, `${id}.jsonl`), '{"type":"system"}\n')
  }
  const screen = (chunk) => k.session.remember(s, chunk)
  const later = (fn, ms) => { const t = setTimeout(() => { f.timers.delete(t); fn() }, ms); f.timers.add(t) }
  function startTurn(text, ms) {
    f.got.push({ conv: f.conv, text, how: 'turn' })
    pulse('turn-start')
    f.turn = { conv: f.conv }
    const spin = setInterval(() => screen('\x1b[2K\x1b[1G✻ Working… (esc to interrupt)'), 100)
    f.timers.add(spin)
    later(() => { clearInterval(spin); f.timers.delete(spin); endTurn() }, ms)
  }
  function endTurn() {
    f.turn = null
    pulse('turn-end')
    screen('\x1b[2K\x1b[1G> ')
    const queued = f.queue.splice(0)
    for (const q of queued) run(q)
  }
  function clear() {
    if (f.deaf) return
    pulse('session-end', { reason: 'clear' })
    f.conv = randomUUID()
    transcript(f.conv)
    screen('\x1b[2J\x1b[H(no content)\r\n> ')
  }
  function run(text) {
    if (text === '/clear') return clear()
    startTurn(text, 1500)
  }
  function submit(text) {
    if (!text) return
    if (f.turn) {
      // Claude Code: a slash command typed during a turn waits for the turn's end; words go into the running turn.
      if (text.startsWith('/')) f.queue.push(text)
      else f.got.push({ conv: f.conv, text, how: 'injected' })
      return
    }
    run(text)
  }
  const proc = {
    write(data) {
      const s1 = String(data)
      if (s1 === '\r') { const text = f.input.trim(); f.input = ''; submit(text); return }
      f.input += s1.replace(/\x1b\[20[01]~/g, '')
      screen(`\x1b[2K\x1b[1G> ${f.input.slice(-80)}`)
    },
    kill() { /* the fake has no process */ },
  }
  const s = k.session.register({ service, pid: 0, proc, cwd })
  screen('x'.repeat(FULL)) // a long session: the screen buffer is already full
  transcript(f.conv)
  if (turnMs > 0) startTurn('the agent works and asks for its reset', turnMs)
  f.stop = () => { for (const t of f.timers) { clearTimeout(t); clearInterval(t) } k.session.stop(service, 'test-end') }
  return f
}

/** Ask for the reset the way `npm run session -- clear --continue` and an element's `npm run reset` do, then watch. */
async function scenario(name, k, service, element, opts, { watchMs, letterIn }) {
  const f = fakeClaude(k, service, element, opts)
  await sleep(300)
  const asked = k.bridge.sessionCommand(service, { action: 'clear', continue: true })
  const t0 = Date.now()
  while (Date.now() - t0 < watchMs) {
    if (letterIn !== 'none' && f.got.some((m) => m.text.startsWith(LETTER))) { await sleep(300); break }
    await sleep(250)
  }
  f.stop()
  const letters = f.got.filter((m) => m.text.startsWith(LETTER))
  const inOld = letters.filter((m) => m.conv === f.first)
  const secs = Math.round((Date.now() - t0) / 100) / 10
  console.log(`\n${name} — ${service}: asked ${asked.ok ? asked.scheduled : asked.reason}; ${secs} s; messages: ${f.got.map((m) => `${m.conv === f.first ? 'old' : 'new'}/${m.how}: ${m.text.slice(0, 32)}`).join(' | ') || 'none'}`)
  return { f, letters, inOld }
}

// D — the measure itself (the root cause): a full buffer, more output — the measure must move.
{
  const k = KITS.main
  const s = k.session.register({ service: 'tst-measure', pid: 0, proc: { write() {}, kill() {} }, cwd: tmp })
  k.session.remember(s, 'x'.repeat(FULL + 1000))
  const lenBefore = s.buffer.length
  const seenBefore = s.seen
  for (let i = 0; i < 40; i++) k.session.remember(s, '\x1b[2K\x1b[1G✻ Working… (esc to interrupt)')
  console.log(`D — buffer ${lenBefore} → ${s.buffer.length}; the measure ${seenBefore} → ${s.seen}`)
  ok(s.buffer.length === lenBefore, 'D: the screen buffer stays at its 256 KB cap (why the old measure went blind)')
  ok(typeof s.seen === 'number' && s.seen > seenBefore, 'D: the measure of the screen still moves after 256 KB of output')
  k.session.stop('tst-measure', 'test-end')
}

// E — the window line knows its conversation (728-3).
{
  const win = require(join(REPO, 'lib', 'agent-kit', 'window.cjs'))
  const rec = { used: 65, size: 1_000_000, session: 'old-conversation' }
  const has = typeof win.lineFor === 'function'
  ok(has && win.lineFor('build', rec, 'new-conversation') === '', 'E: a fresh conversation is not told the old window (65 % of another conversation — silent)')
  ok(has && /65 %/.test(win.lineFor('build', rec, 'old-conversation')), 'E: negative control — the same conversation still gets its line')
  ok(has && /65 %/.test(win.lineFor('build', { used: 65, size: 1_000_000 }, 'any')), 'E: a record written before 728 (no conversation in it) is read as before')
}

const results = await Promise.all([
  // A — the incident: the turn goes on 20 s after the ask, the buffer full. The letter must wait and land in the NEW conversation.
  scenario('A1 main agent, long session, the turn goes on after the ask', KITS.main, 'build', 'build', { turnMs: 20_000 }, { watchMs: 50_000 }),
  scenario('A2 element, long session, the turn goes on after the ask', KITS.item, 'tst5k', 'tst5k', { turnMs: 20_000 }, { watchMs: 50_000 }),
  // B — the quick path: the turn already ended. Must work on the old code and the new (the test does not fail on everything).
  scenario('B element, the turn already ended', KITS.item, 'tst6b', 'tst6b', { turnMs: 0 }, { watchMs: 30_000 }),
  // C — `/clear` never takes effect: the letter must not go into a conversation that was not cleared.
  scenario('C element, /clear never takes effect', KITS.item, 'tst7c', 'tst7c', { turnMs: 0, deaf: true }, { watchMs: 20_000, letterIn: 'none' }),
])
console.log('')
const [a1, a2, b, c] = results
for (const [name, r, file] of [['A1 main agent', a1, 'development-docs/development-steps/current-steps.md'], ['A2 element', a2, 'development-docs/current-step.md'], ['B element', b, 'development-docs/current-step.md']]) {
  const l = r.letters[0]
  ok(r.inOld.length === 0, `${name}: the letter never reaches the old conversation`)
  ok(r.letters.length === 1 && l.conv !== r.f.first && l.how === 'turn', `${name}: the letter wakes the new conversation as its own turn`)
  ok(Boolean(l) && r.f.got.find((m) => m.conv === l.conv) === l, `${name}: the letter is the first message of the new conversation`)
  ok(Boolean(l) && l.text.includes(file), `${name}: the letter names its own state record (${file})`)
}
ok(c.letters.length === 0, 'C: without a clear the letter is not pasted — the old conversation is not told it was cleared')

rmSync(tmp, { recursive: true, force: true })
console.log(bad ? `===RESET_WAKE_FAILED=== ${bad}` : '===RESET_WAKE_OK=== after its own reset the agent wakes with its letter in the new conversation — the main agent and an element')
process.exit(bad ? 1 : 0)

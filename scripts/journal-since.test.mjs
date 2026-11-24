// Node steps 850-1, 850-2, 851-1: the element's journal, not the file's time, says whether a pasted task was taken; a message held in the
// session's queue is seen; an unreadable journal is «unknown», never «not started». ✗ 2026-11-24, fractera.ai: the marketplace's journal
// moved with its running turn and the person's queued messages — «работа началась» while nothing was taken; behind the wall the 0700
// journal of fe-<id> could not be listed and a live task was called «not started». `npm run test:journal-since`.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { chmodSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const { scan, inlineCode } = createRequire(import.meta.url)(join(ROOT, 'lib', 'agent-kit', 'journal-since.cjs'))
const tmp = mkdtempSync(join(tmpdir(), 'journal-since-'))
const AT = Date.parse('2026-11-24T11:06:00Z')
const iso = (min) => new Date(AT + min * 60_000).toISOString()
const entry = (o) => JSON.stringify(o)
const user = (min, content) => entry({ type: 'user', timestamp: iso(min), message: { role: 'user', content } })
const queue = (min, operation) => entry({ type: 'queue-operation', operation, timestamp: iso(min), sessionId: 's', ...(operation === 'enqueue' ? { content: 'x' } : {}) })
const assistant = (min) => entry({ type: 'assistant', timestamp: iso(min), message: { role: 'assistant', content: [{ type: 'text', text: 'ok' }] } })
let n = 0
const folder = (lines) => { const d = join(tmp, `p${++n}`); mkdirSync(d, { recursive: true }); writeFileSync(join(d, 'a.jsonl'), lines.join('\n') + '\n'); return d }
let passed = 0
const ok = (cond, what) => { assert.ok(cond, what); passed++ }

// The marketplace's morning (negative control of the old rule): the running turn wrote tool results and an answer after the paste, then the
// person's two messages were enqueued and never dequeued. The file moved — the old rule said «started»; the content says «waiting».
const lidt5 = folder([
  user(-2, 'Roma: какой доступ к репозиторию?'),
  assistant(-1),
  user(0.5, [{ type: 'tool_result', tool_use_id: 't1', content: 'done' }]),
  assistant(1.4),
  queue(33.75, 'enqueue'),
  queue(38.1, 'enqueue'),
])
const a = scan(lidt5, AT)
ok(a.state === 'waiting' && a.tookAt === null, `a turn's tool results and queued messages are not «took» — got ${a.state}`)
ok(a.waiting && a.waiting.count === 2 && a.waiting.since === Date.parse(iso(33.75)), 'the held messages are counted from the first')

// A task taken: a prompt with text after the paste.
const took = scan(folder([assistant(-1), user(0.2, 'Узел: задача главного агента …'), assistant(0.5)]), AT)
ok(took.state === 'took' && took.tookAt === Date.parse(iso(0.2)), 'a prompt after the paste is «took»')

// A message that went in and out of the queue is not held.
const passedQueue = scan(folder([queue(1, 'enqueue'), queue(1.01, 'dequeue'), user(1.02, '<channel source="plugin:telegram:telegram">hi</channel>')]), AT)
ok(passedQueue.state === 'took' && passedQueue.waiting === null, 'enqueue then dequeue holds nothing')

// Nothing after the paste — «not»; a journal older than the paste is not read at all.
const old = folder([user(-30, 'old'), assistant(-29)])
writeFileSync(join(old, 'a.jsonl'), [user(-30, 'old')].join('\n'))
const past = new Date(AT - 60 * 60_000)
execFileSync('touch', ['-t', `${past.getFullYear()}${String(past.getMonth() + 1).padStart(2, '0')}${String(past.getDate()).padStart(2, '0')}${String(past.getHours()).padStart(2, '0')}${String(past.getMinutes()).padStart(2, '0')}`, join(old, 'a.jsonl')])
const none = scan(old, AT)
ok(none.state === 'not' && none.files === 0, `an untouched journal is «not» — got ${none.state}/${none.files}`)

// No folder yet — «not»; an unreadable folder (the wall's 0700 of another user) — «unknown», never «not».
ok(scan(join(tmp, 'absent'), AT).state === 'not', 'no folder is «not»')
const walled = folder([user(0.2, 'task')])
if (process.getuid && process.getuid() !== 0) {
  chmodSync(walled, 0o000)
  const w = scan(walled, AT)
  chmodSync(walled, 0o755)
  ok(w.state === 'unknown' && w.why === 'EACCES', `an unreadable journal is «unknown» — got ${w.state}/${w.why}`)
}

// The same scan as one `node -e` program — the form the walled element runs as itself.
const inline = JSON.parse(execFileSync(process.execPath, ['-e', inlineCode(), lidt5, String(AT)], { encoding: 'utf8' }))
ok(inline.state === 'waiting' && inline.waiting.count === 2, 'the inline program answers as the module')

// 850-3: the screen says a turn runs by Claude Code's spinner line; an idle prompt does not.
const screen = createRequire(import.meta.url)(join(ROOT, 'app', '[lang]', '(architectLayer)', 'architect', 'kits', '_agent-kit', 'core', 'server', 'screen.cjs'))
ok(screen.turnOnScreen('\x1b[2K✻ Working… (12s · \x1b[1mesc to interrupt\x1b[22m)'), 'the spinner line is a running turn')
ok(!screen.turnOnScreen('╭────╮\n│ > │\n╰────╯  ? for shortcuts'), 'an idle prompt is no turn')

rmSync(tmp, { recursive: true, force: true })
console.log(`===JOURNAL_SINCE_OK=== ${passed} checks: took only from a prompt, a held queue seen, unreadable is unknown, the inline form agrees`)

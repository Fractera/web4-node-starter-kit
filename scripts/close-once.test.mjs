// Node step 856-1: «Выключить его?» never after every answer — in a conversation the person started, no element is asked either; one
// hint per session comes with the first answer, for every agent that answers in its own bot. ✗ 2026-11-24, fractera.ai: the marketplace's
// person got the question 8 times in 70 minutes, a custom element's twice in 37 s — the rule held for the main agent only. A contract
// check of the two places (the bridge's `done()` needs a live pty session to run); the live proof is the node's log: `asked false` per
// answer and one `hinted.json` entry per session. `npm run test:close-once`.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const kit = join(ROOT, 'app', '[lang]', '(architectLayer)', 'architect', 'kits', '_agent-kit', 'core', 'server', 'bridge.cjs')
const src = readFileSync(kit, 'utf8')
const done = src.slice(src.indexOf('async function done(service'), src.indexOf('function lastReplyAt('))
let passed = 0
const ok = (c, what) => { assert.ok(c, what); passed++ }
const person = done.indexOf('if (live.byPerson) {')
ok(person > 0, 'done() answers a person\'s conversation without a question')
ok(person < done.indexOf('AGENT_CLOSE_ASK_DELAY_MS'), 'before the 5-second wait for the question')
ok(person < done.indexOf("telegram.askToClose(service, 'done'"), 'before the question')
ok(done.indexOf('if (close || modes.modeOfKey(service) === \'work\')') < person, '«выключить» and the work session still close first')
ok(/wokenByMain\(id\)/.test(done.slice(person)), 'a session the main agent woke for an element without a bot still closes itself')
const progress = readFileSync(join(ROOT, 'lib', 'agent-kit', 'progress.cjs'), 'utf8')
ok(!/if \(element === 'build'\) await hintOnce/.test(progress) && /\n  await hintOnce\(root, r, String\(ev\.session_id/.test(progress), 'the hint runs for every agent\'s bot, once per session')
ok(/wakeTimeoutMs\(\)/.test(src) && /askToClose\(service, 'timeout'/.test(src), 'the 60-minute reminder stays')
console.log(`===CLOSE_ONCE_OK=== ${passed} checks: no question in a person's conversation, one hint per session, the closing paths kept`)

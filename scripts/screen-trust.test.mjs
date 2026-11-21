// Node step 829: what stands on an agent's terminal screen, read from the stream its session printed. ✗ 2026-11-21 16:25–16:27, the new
// element j58fl: the node answered the folder-trust dialog, an idle Claude Code printed too little to push the dialog's words out of the
// last 4000 characters, «a question on the screen» stayed true for 120 s and the person's first message was never pasted.
// `npm run test:screen-trust`.
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const screen = createRequire(import.meta.url)(join(ROOT, 'app', '[lang]', '(architectLayer)', 'architect', 'kits', '_agent-kit', 'core', 'server', 'screen.cjs'))
let passed = 0
const t = async (name, fn) => { try { await fn(); passed++; console.log(`  ✓ ${name}`) } catch (e) { process.exitCode = 1; console.log(`  ✗ ${name}\n    ${e.message}`) } }

// Ink's way: colours, spaces drawn by moving the cursor (ESC[nC), lines erased and redrawn.
const ink = (line) => `\x1b[2K\x1b[38;5;246m${line.replace(/ /g, '\x1b[1C')}\x1b[39m\r\n`
const TRUST = [
  '╭──────────────────────────────────────────────────────────╮',
  '│ Accessing workspace:',
  '│ /Users/x/web4-node-starter-kit/WEB4-ITEMS/user/j58fl',
  '│ Quick safety check: Is this a project you created or one you trust?',
  '│ ❯ 1. Yes, I trust this folder',
  '│   2. No, exit',
  '│ Enter to confirm · Esc to exit',
  '╰──────────────────────────────────────────────────────────╯',
].map(ink).join('')
const WELCOME = [
  '╭───╮ Claude Code v2.1.330',
  '│ Opus 5.5 with high effort · Claude Pro',
  '│ ~/web4-node-starter-kit/WEB4-ITEMS/user/j58fl',
  'Channels (experimental) messages from plugin:telegram@claude-plugins-official inject directly in this session',
  '> Try "fix lint errors"',
  '5 ч 26 % · 7 дн 55 %',
].map(ink).join('')
const PROMPT = [
  'Bash command: rm -rf build',
  'Do you want to proceed?',
  '❯ 1. Yes',
  '  2. No, and tell Claude what to do differently (esc)',
].map(ink).join('')

/** A session the way `session.cjs` keeps it: the buffer and `seen`, everything ever printed. */
const sessionOf = (...chunks) => { const buffer = chunks.join(''); return { buffer, seen: buffer.length } }

await t('the defect reproduced: after the trust is answered the raw tail still «shows» the dialog (the old reading)', () => {
  const s = sessionOf(TRUST, WELCOME)
  assert.ok(s.buffer.length < 4000, 'the welcome is too short to push the dialog out')
  assert.equal(screen.questionOnScreen(s.buffer), true)
})

await t('829: once Claude Code recorded the trust, the stream is read from the node\'s Enter — no question; the record is asked once', () => {
  const s = sessionOf(TRUST)
  s.trustEnterAt = s.seen
  s.buffer += WELCOME
  s.seen = s.buffer.length
  let asked = 0
  const trusted = () => { asked++; return true }
  assert.equal(screen.questionOnScreen(screen.liveStream(s, trusted)), false)
  assert.equal(screen.trustOnScreen(screen.liveStream(s, trusted)), false)
  assert.equal(asked, 1, 'the cut is fixed once — the file is not read again')
  assert.equal(s.trustCut, s.trustEnterAt)
})

await t('829 negative: a question printed AFTER the trust is still seen (a permission prompt)', () => {
  const s = sessionOf(TRUST)
  s.trustEnterAt = s.seen
  s.buffer += WELCOME + PROMPT
  s.seen = s.buffer.length
  const live = screen.liveStream(s, () => true)
  assert.equal(screen.questionOnScreen(live), true)
  assert.match(screen.questionLine(live), /^Do you want to proceed\?$/)
})

await t('829 negative: while Claude Code has NOT recorded the trust (or the record is unknown) the dialog counts as on the screen', () => {
  for (const answer of [false, null]) {
    const s = sessionOf(TRUST, WELCOME)
    assert.equal(screen.questionOnScreen(screen.liveStream(s, () => answer)), true, String(answer))
    assert.equal(s.trustCut, undefined)
  }
})

await t('829: the person answered the dialog by hand (no Enter of the node) — the cut is the read that found the record', () => {
  const s = sessionOf(TRUST, WELCOME)
  assert.equal(screen.questionOnScreen(screen.liveStream(s, () => true)), false)
  assert.equal(s.trustCut, s.seen)
  s.buffer += PROMPT
  s.seen = s.buffer.length
  assert.equal(screen.questionOnScreen(screen.liveStream(s, () => { throw new Error('asked again') })), true, 'a new question after the cut')
})

await t('829: a full 256 KB buffer (seen far past its length) — only what was printed after the cut is read', () => {
  const s = { buffer: 'x'.repeat(2000) + TRUST + WELCOME, seen: 1_000_000 }
  s.trustCut = s.seen - WELCOME.length
  assert.equal(screen.liveStream(s, () => true), WELCOME)
  s.trustCut = s.seen - 10 * s.buffer.length
  assert.equal(screen.liveStream(s, () => true), s.buffer, 'a cut before the buffer\'s start — the whole buffer')
})

console.log(process.exitCode ? `===SCREEN_TRUST_FAILED=== ${passed} passed` : `===SCREEN_TRUST_OK=== ${passed} passed`)

// THE CONTEXT WINDOW, TOLD TO THE AGENT (step 700-1). The owner 2026-11-08: «отслеживать переполнения контекста … логика перехода этого
// события не должна быть мёртвой как у функции Compact … в некоторых случаях такое действие имеет смысл выполнить даже если у тебя 60% …
// а в некоторых случаях это может быть необязательно выполнять даже если у тебя 70». So code measures and the agent decides.
//   as a hook (the node's bridge gives it to every session, UserPromptSubmit):  node window.cjs <element id>  < hook JSON
// Reads `data/services/<id>/context.json` (written by the status line, `lib/agent-kit/limits.cjs`) and, from 55 %, prints ONE line that
// Claude Code adds to the turn: the percentage and the choice. From 85 % the line says «now». Below 55 % — nothing.
// 🛑 A hook never fails the session: any error — silent, exit code 0.
const fs = require('fs')
const path = require('path')
const nodeLine = require('./node-line.cjs')

const ROOT = path.join(__dirname, '..', '..')
const element = String(process.argv[2] ?? '')
const SHAPE = /^[a-z][a-z0-9-]{0,39}$/
const ASK_FROM = 55
const NOW_FROM = 85
const MAIN = 'build'

/** The line for this element at `used` %, or '' — exported for the proof. */
function line(id, rec, at = new Date()) {
  if (!rec || typeof rec.used !== 'number' || rec.used < ASK_FROM) return ''
  const size = rec.size ? ` of ${Math.round(rec.size / 1000)}k tokens` : ''
  const where = id === MAIN ? 'development-docs/development-steps/current-steps.md, section «Letter to my next session»' : 'development-docs/current-step.md, section «Letter to my next session»'
  const reset = id === MAIN ? 'npm run session -- clear --continue' : 'npm run reset'
  const how = `write the letter to your next session (${where}: where you stand, the person's words verbatim, what is half done, the next action, the clues to keep), commit it, then \`${reset}\` — the node clears the window when this turn ends and wakes your next session with the letter. Compaction is off: do not wait for it.`
  const said = rec.used >= NOW_FROM
    ? `Your context window is ${rec.used} %${size} — reset NOW, at the nearest boundary: ${how}`
    : `Your context window is ${rec.used} %${size}. Decide by the work in front of you: a small last task that fits — finish it first; a long or new piece of work — ${how}`
  return nodeLine.head('context-window', id, at) + said
}

/**
 * 728: the record of ANOTHER conversation says nothing about this one. ✗ 2026-11-11 18:23: after `/clear` the fresh conversation's first
 * line said «65 %» (the old conversation's record; the real window was 7 %) — from 85 % it would have said «reset NOW» to a clean window.
 * The status line names its conversation in the record (`lib/agent-kit/limits.cjs`); a record without one (before 728) is read as before.
 */
function lineFor(id, rec, session, at = new Date()) {
  if (rec && typeof rec.session === 'string' && typeof session === 'string' && session && rec.session !== session) return ''
  return line(id, rec, at)
}

function main(raw) {
  if (!SHAPE.test(element)) return ''
  let input = {}
  try { input = JSON.parse(raw || '{}') } catch { /* not JSON — no conversation to compare */ }
  let rec = null
  try { rec = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'services', element, 'context.json'), 'utf8')) } catch { return '' }
  return lineFor(element, rec, input.session_id)
}

if (require.main === module) {
  let raw = ''
  process.stdin.on('data', (d) => { raw += d })
  process.stdin.on('end', () => { let out = ''; try { out = main(raw) } catch { /* never fail the session */ } if (out) process.stdout.write(out); process.exit(0) })
}

module.exports = { line, lineFor, ASK_FROM, NOW_FROM }

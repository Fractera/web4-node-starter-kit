// THE SECTION THE PERSON CAME FROM (node step 821; the owner, Telegram 434: «пробросить сообщения–подсказку для агента … пользователь
// перешёл в чат из раздела: мои проект/дело/соцсети/инстаграм … чтобы не было так что пользователь думает … про тренировку агент думает что
// речь идёт про Instagram»). The element's Mini App button «Перейти в чат» writes `data/services/<id>/tg-context.json` through the
// element's own door; this hook (UserPromptSubmit of every session of the element) adds ONE line before the person's message while that
// record is fresh — 30 minutes; a press in another section writes over it.
//   as a hook:  node came-from.cjs <element id>  < hook JSON
// 🛑 A hook never fails the session: any error — silent, exit code 0. The record is the element's data: only a short path of titles and an
// address of its Mini App pass, every other character is dropped.
const fs = require('fs')
const path = require('path')
const nodeLine = require('./node-line.cjs')

const ROOT = path.join(__dirname, '..', '..')
const SHAPE = /^[a-z][a-z0-9-]{0,39}$/
const FRESH_MS = 30 * 60 * 1000
// 852-7: a quiz node of an element's Mini App lives up to six segments down (`/tg/quiz/1/2/3/4/5`).
const HREF = /^\/[a-z]{2}\/tg(\/[a-z0-9-]{1,60}){0,6}$/

/** The titles of the path, cleaned: at most 6, each at most 60 characters of letters, digits, spaces and «-&.,'()». */
const clean = (parts) => (Array.isArray(parts) ? parts : [])
  .filter((p) => typeof p === 'string')
  .map((p) => p.replace(/[^\p{L}\p{N} \-&.,'()]/gu, '').trim().slice(0, 60))
  .filter(Boolean)
  .slice(0, 6)

/** The line for this record at `at`, or '' — exported for the proof. */
function line(id, rec, at = new Date()) {
  if (!SHAPE.test(id) || !rec || typeof rec.at !== 'string') return ''
  const when = Date.parse(rec.at)
  if (!Number.isFinite(when) || at.getTime() - when > FRESH_MS || when - at.getTime() > 60 * 1000) return ''
  const parts = clean(rec.path)
  if (!parts.length) return ''
  const href = typeof rec.href === 'string' && HREF.test(rec.href) ? ` (${rec.href})` : ''
  const mins = Math.max(0, Math.round((at.getTime() - when) / 60000))
  return nodeLine.head('came-from', id, at) + `The person came into this chat from your Mini App, the section «${parts.join(' › ')}»${href}, ${mins} min ago: read their next words in the sense of that section, unless they name another.`
}

function main() {
  const element = String(process.argv[2] ?? '')
  if (!SHAPE.test(element)) return ''
  let rec = null
  try { rec = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'services', element, 'tg-context.json'), 'utf8')) } catch { return '' }
  return line(element, rec)
}

if (require.main === module) {
  process.stdin.resume()
  process.stdin.on('data', () => {})
  process.stdin.on('end', () => { let out = ''; try { out = main() } catch { /* never fail the session */ } if (out) process.stdout.write(out); process.exit(0) })
}

module.exports = { line, clean, FRESH_MS }

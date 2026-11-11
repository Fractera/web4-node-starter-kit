// ОСТАТОК ЛИМИТА ПОДПИСКИ (686-2) — команда строки состояния каждой сессии узла.
//   node limits.cjs <id элемента>  < JSON строки состояния Claude Code
// Claude Code отдаёт ей `rate_limits.five_hour|seven_day.{used_percentage,resets_at}`, «present only while the API reports it» (2.1.319).
// Пишет `data/node/limits/<вход>.json` (вход — `node` или `own-<id>`, 689) и печатает одну строку для терминала: «окно 41 % · 5 ч 14 % · 7 дн 60 %».
// По этим записям главный агент считает, сколько лимита останется ему (§1: одалживание — только пока прогноз оставляет 15 %).
const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..', '..')
const element = String(process.argv[2] ?? '')

// 700-1: the same input carries the live context window (`context_window.used_percentage|context_window_size|total_input_tokens`,
// code.claude.com/docs/en/statusline, read 2026-11-08). It goes to `data/services/<id>/context.json` — the window hook
// (`lib/agent-kit/window.cjs`) reads it on the next turn. Written only on a change of the percentage: the status line runs often.
// 728: the record names its conversation (`session_id` of the status line's input) and is rewritten when the conversation changes — the
// window hook keeps silent for a record of another conversation (a fresh one after `/clear` was told the old window).
function writeWindow(cw, conversation) {
  if (!cw || typeof cw.used_percentage !== 'number' || !/^[a-z][a-z0-9-]{0,39}$/.test(element)) return null
  const session = typeof conversation === 'string' && conversation ? conversation : null
  const used = Math.round(cw.used_percentage)
  const dir = path.join(ROOT, 'data', 'services', element)
  const file = path.join(dir, 'context.json')
  let prev = null
  try { prev = JSON.parse(fs.readFileSync(file, 'utf8')) } catch { /* first time */ }
  if (!prev || prev.used !== used || (session && prev.session !== session)) {
    fs.mkdirSync(dir, { recursive: true })
    const rec = { at: new Date().toISOString(), used, size: typeof cw.context_window_size === 'number' ? cw.context_window_size : null, tokens: typeof cw.total_input_tokens === 'number' ? cw.total_input_tokens : null, ...(session ? { session } : {}) }
    fs.writeFileSync(file + '.tmp', JSON.stringify(rec, null, 2))
    fs.renameSync(file + '.tmp', file)
  }
  return `окно ${used} %`
}

function main(raw) {
  let input = {}
  try { input = JSON.parse(raw || '{}') } catch { return '' }
  let win = null
  try { win = writeWindow(input.context_window, input.session_id) } catch { /* the line never fails the session */ }
  const rl = input.rate_limits
  if (!rl || typeof rl !== 'object') return win ?? ''
  const login = process.env.CLAUDE_CONFIG_DIR && /^[a-z][a-z0-9-]{0,39}$/.test(element) ? `own-${element}` : 'node'
  const dir = path.join(ROOT, 'data', 'node', 'limits')
  fs.mkdirSync(dir, { recursive: true })
  const pick = (w) => (w && typeof w.used_percentage === 'number' ? { used: w.used_percentage, resetsAt: typeof w.resets_at === 'number' ? new Date(w.resets_at * 1000).toISOString() : null } : null)
  const rec = { at: new Date().toISOString(), login, element: element || null, fiveHour: pick(rl.five_hour), sevenDay: pick(rl.seven_day) }
  const file = path.join(dir, `${login}.json`)
  fs.writeFileSync(file + '.tmp', JSON.stringify(rec, null, 2))
  fs.renameSync(file + '.tmp', file)
  const part = (name, w) => (w ? `${name} ${w.used} %` : null)
  return [win, part('5 ч', rec.fiveHour), part('7 дн', rec.sevenDay)].filter(Boolean).join(' · ')
}

let raw = ''
process.stdin.on('data', (d) => { raw += d })
process.stdin.on('end', () => { let line = ''; try { line = main(raw) } catch { /* строка состояния не роняет сессию */ } process.stdout.write(line); process.exit(0) })

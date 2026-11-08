// ОСТАТОК ЛИМИТА ПОДПИСКИ (686-2) — команда строки состояния каждой сессии узла.
//   node limits.cjs <id элемента>  < JSON строки состояния Claude Code
// Claude Code отдаёт ей `rate_limits.five_hour|seven_day.{used_percentage,resets_at}`, «present only while the API reports it» (2.1.319).
// Пишет `data/node/limits/<вход>.json` (вход — `node` или `own-<id>`, 689) и печатает одну строку для терминала: «5 ч 14 % · 7 дн 60 %».
// По этим записям главный агент считает, сколько лимита останется ему (§1: одалживание — только пока прогноз оставляет 15 %).
const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..', '..')
const element = String(process.argv[2] ?? '')

function main(raw) {
  let input = {}
  try { input = JSON.parse(raw || '{}') } catch { return '' }
  const rl = input.rate_limits
  if (!rl || typeof rl !== 'object') return ''
  const login = process.env.CLAUDE_CONFIG_DIR && /^[a-z][a-z0-9-]{0,39}$/.test(element) ? `own-${element}` : 'node'
  const dir = path.join(ROOT, 'data', 'node', 'limits')
  fs.mkdirSync(dir, { recursive: true })
  const pick = (w) => (w && typeof w.used_percentage === 'number' ? { used: w.used_percentage, resetsAt: typeof w.resets_at === 'number' ? new Date(w.resets_at * 1000).toISOString() : null } : null)
  const rec = { at: new Date().toISOString(), login, element: element || null, fiveHour: pick(rl.five_hour), sevenDay: pick(rl.seven_day) }
  const file = path.join(dir, `${login}.json`)
  fs.writeFileSync(file + '.tmp', JSON.stringify(rec, null, 2))
  fs.renameSync(file + '.tmp', file)
  const part = (name, w) => (w ? `${name} ${w.used} %` : null)
  return [part('5 ч', rec.fiveHour), part('7 дн', rec.sevenDay)].filter(Boolean).join(' · ')
}

let raw = ''
process.stdin.on('data', (d) => { raw += d })
process.stdin.on('end', () => { let line = ''; try { line = main(raw) } catch { /* строка состояния не роняет сессию */ } process.stdout.write(line); process.exit(0) })

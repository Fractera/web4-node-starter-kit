// ПУЛЬС СЕССИИ (686-2) — как закончился каждый ход агента, записанное кодом, а не моделью.
//   как хук (мост узла даёт его каждой сессии):  node pulse.cjs <id элемента> <turn-start|turn-end|turn-error|session-end>  < JSON хука
// Пишет `data/services/<id>/pulse.json`: последнее событие и двадцать прежних. Вход сессии — «own» (своя папка Claude Code элемента,
// 689: `CLAUDE_CONFIG_DIR` в окружении) или «node». 🛑 Хук никогда не роняет сессию: любая ошибка — молча, код выхода 0.
const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..', '..')
const [element, event] = process.argv.slice(2)
const SHAPE = /^[a-z][a-z0-9-]{0,39}$/

function main(raw) {
  if (!SHAPE.test(String(element)) || !['turn-start', 'turn-end', 'turn-error', 'session-end'].includes(event)) return
  let input = {}
  try { input = JSON.parse(raw || '{}') } catch { /* не JSON — пишем без него */ }
  const dir = path.join(ROOT, 'data', 'services', element)
  fs.mkdirSync(dir, { recursive: true })
  const file = path.join(dir, 'pulse.json')
  let prev = {}
  try { prev = JSON.parse(fs.readFileSync(file, 'utf8')) } catch { /* первый раз */ }
  const now = {
    at: new Date().toISOString(),
    event,
    session: typeof input.session_id === 'string' ? input.session_id : null,
    login: process.env.CLAUDE_CONFIG_DIR ? 'own' : 'node',
    ...(event === 'turn-error' ? { error: input.error ?? 'unknown', details: String(input.error_details ?? '').slice(0, 300) } : {}),
    ...(event === 'turn-error' || event === 'turn-end' ? { last: String(input.last_assistant_message ?? '').slice(0, 300) } : {}),
    ...(event === 'session-end' && input.reason ? { reason: String(input.reason) } : {}),
  }
  const history = [now, ...(Array.isArray(prev.history) ? prev.history : [])].slice(0, 20)
  fs.writeFileSync(file + '.tmp', JSON.stringify({ last: now, history }, null, 2))
  fs.renameSync(file + '.tmp', file)
}

let raw = ''
process.stdin.on('data', (d) => { raw += d })
process.stdin.on('end', () => { try { main(raw) } catch { /* хук не роняет сессию */ } process.exit(0) })
setTimeout(() => { try { main(raw) } catch { /* — */ } process.exit(0) }, 3000).unref()

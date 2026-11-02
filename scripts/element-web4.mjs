// ЭЛЕМЕНТ В СЕТИ WEB4 (узел, шаг 567-6). `npm run element:web4 -- <id> on | off | status`
// on — паспорт `visibility: network` (визитка A2A отвечает снаружи, соседи находят, меню показывает A2A и «Отзывы»); off — `node`.
// Без коммита и сборки: визитка элемента читает паспорт на каждый запрос. Строки `===WEB4_ON===` / `===WEB4_OFF===` / `===WEB4_STATUS===`.
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
// Корень узла — от места скрипта: главный агент зовёт команду из своей папки data/main-agent.
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const web4 = require('../lib/web4-items/element-web4.cjs')

const [id, action] = process.argv.slice(2)
if (!id || !['on', 'off', 'status'].includes(action ?? '')) {
  console.log('usage: npm run element:web4 -- <id> on | off | status')
  process.exit(2)
}
if (action === 'status') {
  const v = web4.visibilityOf(id, ROOT)
  console.log(`===WEB4_STATUS=== ${id} ${v === 'network' ? 'on (in the Web4 network)' : v === 'node' ? 'off (only inside the node)' : 'unknown (no passport field)'}`)
  process.exit(0)
}
try {
  const before = web4.setVisibility(id, action === 'on' ? 'network' : 'node', ROOT)
  console.log(`===WEB4_${action.toUpperCase()}=== ${id} visibility ${before ?? '—'} → ${action === 'on' ? 'network' : 'node'}`)
} catch (e) {
  console.log(`===WEB4_FAILED=== ${e instanceof Error ? e.message : String(e)}`)
  process.exit(1)
}

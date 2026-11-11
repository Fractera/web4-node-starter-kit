// ЖДУН ВОЗВРАТА ГЛАВНОГО АГЕНТА ПОСЛЕ ОБНОВЛЕНИЯ УЗЛА (узел, шаг 675-1) — зачем и почему так: `lib/deploy/agent-return.cjs`.
// `node scripts/spawn-free.mjs scripts/agent-return.mjs --after-update <мс начала>` — его запускает `serve.mjs rebuild`, вне дерева ядра.
// Ход — в `logs/agent-return.log`; выходит, когда обновление закончилось, и через 60 минут в любом случае.
// 707-2: `--cut-off` — его запускает старт ядра (`instrumentation.ts`): осталась запись сборки, чей процесс умер, — вернуть записанных.
import { appendFileSync, mkdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const { afterUpdate, afterCutOff, afterLost, afterUpdateStopped } = createRequire(import.meta.url)('../lib/deploy/agent-return.cjs')
const LOG = join(ROOT, 'logs', 'agent-return.log')
mkdirSync(dirname(LOG), { recursive: true })
const say = (s) => appendFileSync(LOG, `${new Date().toISOString()} ${s}\n`)

// 708: `--lost` — старт ядра пометил сессию главного агента потерянной (она умерла с ядром) — вернуть его в тот же разговор.
if (process.argv.includes('--lost')) {
  const r = await afterLost(ROOT, say)
  say(`старт ядра: сессия главного агента потеряна с ядром — ${r.woke ? 'он вернулся в тот же разговор' : `не вернулся — ${r.reason}`}`)
  process.exit(0)
}
// 719: `--update-stopped <state> <reason>` — обновление кончилось до сборки ядра; его зовёт `node-update.mjs` из `finish()`.
const u = process.argv.indexOf('--update-stopped')
if (u >= 0) {
  const r = await afterUpdateStopped(ROOT, process.argv[u + 1] ?? 'stopped', process.argv[u + 2] ?? '', say)
  say(`обновление кончилось до сборки ядра (${process.argv[u + 1]}): ${r.woke ? 'главный агент разбужен' : `не разбужен — ${r.reason}`}`)
  process.exit(0)
}
if (process.argv.includes('--cut-off')) {
  const r = await afterCutOff(ROOT, say)
  if (r.reason !== 'no-record') say(`старт ядра: ${r.woke ? 'оборванная сборка — агенты вернулись' : `не будятся — ${r.reason}`}`)
  process.exit(0)
}
const i = process.argv.indexOf('--after-update')
const since = Number(process.argv[i + 1])
if (i < 0 || !Number.isFinite(since)) { say('usage: agent-return.mjs --after-update <ms>'); process.exit(2) }
say(`жду итог обновления узла (начало сборки ${new Date(since).toISOString()})`)
const r = await afterUpdate(ROOT, since, { say })
say(`итог: ${r.woke ? 'агенты вернулись' : `не будятся — ${r.reason}`}`)
process.exit(0)

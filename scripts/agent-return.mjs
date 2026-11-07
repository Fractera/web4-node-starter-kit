// ЖДУН ВОЗВРАТА ГЛАВНОГО АГЕНТА ПОСЛЕ ОБНОВЛЕНИЯ УЗЛА (узел, шаг 675-1) — зачем и почему так: `lib/deploy/agent-return.cjs`.
// `node scripts/spawn-free.mjs scripts/agent-return.mjs --after-update <мс начала>` — его запускает `serve.mjs rebuild`, вне дерева ядра.
// Ход — в `logs/agent-return.log`; выходит, когда обновление закончилось, и через 60 минут в любом случае.
import { appendFileSync, mkdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const { afterUpdate } = createRequire(import.meta.url)('../lib/deploy/agent-return.cjs')
const LOG = join(ROOT, 'logs', 'agent-return.log')
mkdirSync(dirname(LOG), { recursive: true })
const say = (s) => appendFileSync(LOG, `${new Date().toISOString()} ${s}\n`)

const i = process.argv.indexOf('--after-update')
const since = Number(process.argv[i + 1])
if (i < 0 || !Number.isFinite(since)) { say('usage: agent-return.mjs --after-update <ms>'); process.exit(2) }
say(`жду итог обновления узла (начало сборки ${new Date(since).toISOString()})`)
const r = await afterUpdate(ROOT, since, { say })
say(`итог: ${r.woke ? 'главный агент вернулся' : `не будится — ${r.reason}`}`)
process.exit(0)

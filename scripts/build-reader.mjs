// Чтец сборки ядра (узел, шаг 642-2) — зачем и почему так: `lib/deploy/build-reader.cjs`. GET /status → этап и хвост журнала сборки;
// только 127.0.0.1, CORS только для страницы ядра этого компьютера; выходит с родителем (сборкой) и через 90 минут в любом случае.
// 707-2: родитель умер, а крышка закрыта (его конец никто не довёл: ✗ узел владельца 2026-11-09 13:09 — сборку убили вместе с агентом,
// ядро поднял сторож здоровья по счастью, а будь он уже остановлен — узел остался бы лежать) — чтец, последний живой свидетель сборки,
// возвращает прежнюю сборку из копии и открывает крышку. Ядро стартует и само возвращает записанных агентов (`instrumentation.ts`).
import { createServer } from 'node:http'
import { existsSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const LOG = process.env.FRACTERA_BUILD_LOG || ''
const WHAT = process.env.FRACTERA_BUILD_WHAT || 'core'
const PARENT = Number(process.env.FRACTERA_BUILD_PARENT) || 0
const CORE = Number(process.env.FRACTERA_CORE_PORT) || 24680
const PORT = Number(process.env.FRACTERA_READER_PORT) || 25680
const startedAt = new Date().toISOString()
const ORIGINS = new Set([`http://localhost:${CORE}`, `http://127.0.0.1:${CORE}`])

function tail(n = 200) {
  if (!LOG) return []
  try {
    // eslint-disable-next-line no-control-regex
    return readFileSync(LOG, 'utf8').replace(/\u001b\[[0-9;?]*[A-Za-z]/g, '').split(/\r?\n|\r/).filter((l) => l.trim() !== '').slice(-n)
  } catch { return [] }
}

const server = createServer((req, res) => {
  const origin = req.headers.origin
  const cors = origin && ORIGINS.has(origin) ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' } : {}
  if (origin && !cors['Access-Control-Allow-Origin']) { res.writeHead(403).end(); return }
  if (req.method === 'OPTIONS') { res.writeHead(204, { ...cors, 'Access-Control-Allow-Methods': 'GET' }).end(); return }
  if (req.method !== 'GET' || !req.url?.startsWith('/status')) { res.writeHead(404, cors).end(); return }
  res.writeHead(200, { ...cors, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' })
  res.end(JSON.stringify({ ok: true, reader: true, what: WHAT, startedAt, lines: tail() }))
})
server.on('error', () => process.exit(0)) // порт занят — молча: страница скажет «журнал недоступен»
server.listen(PORT, '127.0.0.1')

const alive = (pid) => { try { process.kill(pid, 0); return true } catch { return false } }
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
function recoverAndExit() {
  try {
    if (existsSync(join(ROOT, 'data', 'node', 'quiet-build.json'))) {
      const lid = createRequire(import.meta.url)('../lib/deploy/quiet-build.cjs')
      const say = () => {}
      lid.restoreNext(ROOT, say)
      lid.openLid(ROOT, say)
    }
  } catch { /* открыть не вышло — человек: npm run serve:start */ }
  process.exit(0)
}
setInterval(() => { if (PARENT && !alive(PARENT)) recoverAndExit() }, 3000).unref()
setTimeout(() => process.exit(0), 90 * 60_000).unref()

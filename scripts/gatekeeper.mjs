// ПРИВРАТНИК СПЯЩИХ ЭЛЕМЕНТОВ (узел, шаг 663-4). Процесс pm2 `fractera-gatekeeper` (~50 МБ — цена названа владельцу).
//
// 🎯 Владелец 2026-11-06: «кастомные элементы могли бы отключаться если памяти мало и при обращении к ним активироваться … не случится ли
// так что мы отключим этого агента а он не сможет принять заявку а2а»; выбор в окне — «Привратник (Рекомендую)».
// Соседи и A2A стучатся в элемент прямо на его порт (`127.0.0.1:<порт>`, двери `X-Node-Key`) — спящий отвечал бы «соединение
// отклонено». Привратник слушает порты элементов, которые УСЫПИЛО ПРАВИЛО НАГРУЗКИ (`off.byRule`) и чей паспорт разрешает
// пробуждение (`power.wakeOnCall`): первое соединение он принимает и придерживает, отпускает порт, будит элемент
// (`element-power on --by-rule`), ждёт его двери здоровья и передаёт придержанное соединение элементу байт в байт.
// 🔒 Не трогает: элемент, выключенный человеком (его выбор), `never` и `manual` (у них нет `wakeOnCall`), работающий элемент.
// 🔒 Окно холодного старта: пока элемент поднимается (секунды), порт ничей — новое соединение в эти секунды получит отказ; придержанные
// дождутся. Это названо в навыке `element-power`.
// 🔒 Реестр читается по событию изменения его папки (запись — временный файл и переименование), не опросом.
import { spawn } from 'node:child_process'
import { watch, readFileSync } from 'node:fs'
import net from 'node:net'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
const require = createRequire(import.meta.url)
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
process.chdir(ROOT)
const power = require('../lib/web4-items/element-power.cjs')
const paths = require('../lib/web4-items/paths.cjs')
const { readElementProps } = require('../lib/web4-items/element-props.cjs')

const COLD_START_MS = 120_000
const log = (m) => console.log(`[gatekeeper ${new Date().toISOString()}] ${m}`)
const guarded = new Map() // id → { port, server, waking, held: Socket[] }

function childEnv() {
  const env = {}
  for (const [k, v] of Object.entries(process.env)) if (!/^(__NEXT|NEXT_|AGI_)/.test(k) && !['PORT', 'HOSTNAME', 'NODE_ENV'].includes(k)) env[k] = v
  return env
}
function healthPath(entry) {
  try { return JSON.parse(readFileSync(path.join(paths.entryDir(entry), '.install-stamp.json'), 'utf8')).health || '/' } catch { return '/' }
}
async function waitHealthy(port, health) {
  const until = Date.now() + COLD_START_MS
  while (Date.now() < until) {
    try { if ((await fetch(`http://127.0.0.1:${port}${health}`, { signal: AbortSignal.timeout(3000) })).ok) return true } catch { /* ещё поднимается */ }
    await new Promise((r) => setTimeout(r, 500))
  }
  return false
}
/** Кого сторожить: усыплённые правилом элементы с `wakeOnCall`. */
function sleepers() {
  let services = []
  try { services = power.readRegistry(ROOT).services || [] } catch { return new Map() }
  const out = new Map()
  for (const s of services) {
    const off = power.offOf(s)
    if (!off || !off.byRule || !Number.isInteger(s.port)) continue
    if (readElementProps(paths.entryDir(s))?.power?.wakeOnCall !== true) continue
    out.set(s.id, s)
  }
  return out
}

function wake(id, entry, g) {
  if (g.waking) return
  g.waking = true
  const t0 = Date.now()
  g.server.close() // отпустить порт: элементу он нужен для старта; придержанные сокеты живут дальше
  log(`${id}: вызов на порт ${entry.port} — бужу`)
  const child = spawn(process.execPath, [path.join(ROOT, 'scripts', 'element-power.mjs'), id, 'on', '--by-rule'], { cwd: ROOT, env: childEnv(), stdio: 'ignore', windowsHide: true })
  child.on('error', (e) => log(`${id}: включение не запустилось: ${e.message}`))
  waitHealthy(entry.port, healthPath(entry)).then((ok) => {
    log(`${id}: ${ok ? `проснулся за ${((Date.now() - t0) / 1000).toFixed(1)} с` : 'не ответил за 2 минуты'} — передаю ${g.held.length} соединений`)
    for (const sock of g.held) {
      if (!ok || sock.destroyed) { sock.destroy(); continue }
      const up = net.connect(entry.port, '127.0.0.1', () => {
        if (sock.heldBytes?.length) for (const chunk of sock.heldBytes) up.write(chunk)
        sock.removeAllListeners('data')
        sock.pipe(up).pipe(sock)
        sock.resume()
      })
      up.on('error', () => sock.destroy())
      sock.on('error', () => up.destroy())
    }
    g.held = []
    guarded.delete(id)
  })
}

function guard(id, entry) {
  const g = { port: entry.port, server: null, waking: false, held: [] }
  g.server = net.createServer((sock) => {
    sock.heldBytes = []
    sock.on('data', (chunk) => sock.heldBytes.push(chunk)) // придержать байты запроса до пробуждения
    sock.on('error', () => {})
    g.held.push(sock)
    wake(id, entry, g)
  })
  let tries = 0
  g.server.on('error', (e) => {
    // Процесс элемента ещё отпускает порт (его только что усыпили) — несколько попыток с паузой.
    if (e.code === 'EADDRINUSE' && tries++ < 20 && guarded.get(id) === g && !g.waking) setTimeout(() => g.server.listen(entry.port, '127.0.0.1'), 1000)
    else log(`${id}: порт ${entry.port} не взят: ${e.code || e.message}`)
  })
  g.server.on('listening', () => log(`${id}: сплю — слушаю порт ${entry.port}, разбужу на первый вызов`))
  g.server.listen(entry.port, '127.0.0.1')
  guarded.set(id, g)
}

function refresh() {
  const want = sleepers()
  for (const [id, g] of guarded) {
    if (!want.has(id) && !g.waking) { g.server.close(); guarded.delete(id); log(`${id}: больше не сплю — порт отпущен`) }
  }
  for (const [id, entry] of want) if (!guarded.has(id)) guard(id, entry)
}

log('привратник пущен: сторожит порты элементов, усыплённых правилом нагрузки (wakeOnCall)')
refresh()
let timer = null
try {
  watch(path.dirname(paths.REGISTRY_FILE), (_, file) => {
    if (file && !String(file).startsWith('web4-items.json')) return
    clearTimeout(timer)
    timer = setTimeout(refresh, 500)
  })
} catch (e) { log(`реестр не наблюдается: ${e.message}`) }

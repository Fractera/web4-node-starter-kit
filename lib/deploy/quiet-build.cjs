// СБОРКА ПРИ «ЗАКРЫТОЙ КРЫШКЕ» (узел, шаг 553, решение владельца 2026-10-21).
//
// 🎯 Слово владельца, дословно: «перед началом сборки нужно освободить память, проверить сколько её есть и при необходимости
// остановить работу проекта чтобы выполнить сборку … проект разрастается большим количеством элементов и какой-то момент мы снова
// столкнёмся с такой проблемой независимо от мощности компьютера … наш проект всегда продолжает работать на Cloud Flyer и возвращать
// статику а если несколько секунд будет оборваны динамика из-за того что продолжается сборка это не критическая проблема … сразу
// освободить всё необходимое пространство полностью остановив работу приложения как будто крышка компьютера закрыта для внешнего мира».
//
// 🔒 ЧТО ДЕЛАЕТ: перед сборкой ядра останавливает ВСЕ процессы pm2 этого узла (ядро, его сторож, элементы и их сторожа), кроме
// туннелей — туннель держит адрес (перезапуск быстрого туннеля меняет адрес — запрещено, решение 2026-09-19), а Cloudflare на время
// сборки отдаёт копии страниц (344/385: «дом молчит» — копия). Список остановленных пишется в `data/node/quiet-build.json` ДО остановки:
// оборванная сборка (выключение, краш) не оставит узел лежать — `serve:start` и следующий `serve:rebuild` поднимают по списку.
// 🔒 КОПИЯ `.next` ВНЕ ПРОЕКТА — обычный путь (ANTI-PATTERNS «Оборванная сборка ядра…»): упавшая сборка стирает `static/chunks`
// прежней, и пульт остаётся без скриптов и стилей. Упала — копия возвращается.
// ✗ Оплачено 2026-10-21 (553-6): две сборки подряд упали «memory allocation of 2147483648 bytes failed» при 740 и 1263 МБ свободных,
// когда на паузу ставились службы по одной; каждая попытка — 10 минут, каждый раз пульт оставался без статики до ручного возврата копии.

const { spawnSync } = require('node:child_process')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')

const isWindows = process.platform === 'win32'
const pm2 = isWindows ? 'pm2.cmd' : 'pm2'
const TUNNELS = new Set(['fractera-web4-tunnel', 'fractera-web4-domain'])

const pm2run = (args) => spawnSync(pm2, args, { encoding: 'utf8', shell: isWindows, windowsHide: true, stdio: 'pipe' })
const stateFile = (root) => path.join(root, 'data', 'node', 'quiet-build.json')
const backupDir = (root) => path.join(path.dirname(root), `${path.basename(root)}-next-backup`)
const freeMb = () => Math.round(os.freemem() / 1048576)

/** Процессы pm2 этого узла (по имени и по рабочей папке внутри узла — чужие процессы pm2 человека не трогаются). */
function nodeApps(root) {
  let apps = []
  try { apps = JSON.parse(pm2run(['jlist']).stdout) } catch { apps = [] }
  const inside = (dir) => {
    if (typeof dir !== 'string' || !dir) return false
    const rel = path.relative(root, dir)
    return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel))
  }
  return apps.filter((a) => /^fractera-(web4|svc-)/.test(a.name) && inside(a.pm2_env?.pm_cwd ?? a.pm2_env?.cwd))
}

/** Остановить все работающие процессы узла, кроме туннелей. Список — в файл ДО остановки. */
function closeLid(root, say = console.log) {
  const before = freeMb()
  const names = nodeApps(root).filter((a) => a.pm2_env?.status === 'online' && !TUNNELS.has(a.name)).map((a) => a.name)
  fs.mkdirSync(path.dirname(stateFile(root)), { recursive: true })
  const prev = readState(root)
  const all = [...new Set([...(prev?.names ?? []), ...names])]
  fs.writeFileSync(stateFile(root), JSON.stringify({ at: new Date().toISOString(), names: all }, null, 2) + '\n', 'utf8')
  for (const n of names) pm2run(['stop', n])
  // Память освобождается не мгновенно — короткая пауза перед замером.
  spawnSync(process.execPath, ['-e', 'setTimeout(()=>{},4000)'])
  const after = freeMb()
  say(`Крышка закрыта: остановлено процессов узла — ${names.length} (туннель работает, Cloudflare отдаёт копии страниц). Свободно памяти: ${before} → ${after} МБ.`)
  return { names: all, before, after }
}

function readState(root) {
  try { return JSON.parse(fs.readFileSync(stateFile(root), 'utf8')) } catch { return null }
}

/** Поднять всё, что остановила `closeLid` (и прежняя оборванная сборка). Файл списка удаляется после запуска. */
function openLid(root, say = console.log) {
  // Обрыв посреди `next build` мог оставить элементы вне папки ядра — сначала они возвращаются, потом поднимаются процессы.
  itemsBack(root, say)
  const st = readState(root)
  if (!st?.names?.length) return []
  for (const n of st.names) pm2run(['start', n])
  pm2run(['save'])
  fs.rmSync(stateFile(root), { force: true })
  say(`Крышка открыта: запущено процессов узла — ${st.names.length}.`)
  return st.names
}

/** Копия `.next` без `cache` вне проекта. `true` — копия есть. */
function backupNext(root, say = console.log) {
  const src = path.join(root, '.next')
  if (!fs.existsSync(path.join(src, 'BUILD_ID'))) return false
  const dst = backupDir(root)
  fs.rmSync(dst, { recursive: true, force: true })
  if (isWindows) {
    // robocopy: 0–7 — успех; `cp -r` тех же ~9 тыс. мелких файлов на Windows шёл около 20 минут, robocopy — секунды.
    const r = spawnSync('robocopy', [src, dst, '/E', '/MT:16', '/XD', 'cache', '/NFL', '/NDL', '/NJH', '/NJS'], { windowsHide: true, stdio: 'ignore' })
    if (r.status === null || r.status > 7) return false
  } else {
    fs.cpSync(src, dst, { recursive: true, filter: (p) => !p.startsWith(path.join(src, 'cache')) })
  }
  say(`Копия прежней сборки: ${dst}`)
  return true
}

/** Вернуть прежнюю сборку из копии (сборка упала). */
function restoreNext(root, say = console.log) {
  const dst = path.join(root, '.next')
  const copy = backupDir(root)
  if (!fs.existsSync(path.join(copy, 'BUILD_ID'))) { say('Копии прежней сборки нет — вернуть нечего.'); return false }
  fs.rmSync(dst, { recursive: true, force: true })
  if (isWindows) spawnSync('robocopy', [copy, dst, '/E', '/MT:16', '/NFL', '/NDL', '/NJH', '/NJS'], { windowsHide: true, stdio: 'ignore' })
  else fs.cpSync(copy, dst, { recursive: true })
  say('Прежняя сборка возвращена из копии.')
  return fs.existsSync(path.join(dst, 'BUILD_ID'))
}

function dropBackup(root) {
  fs.rmSync(backupDir(root), { recursive: true, force: true })
}

// ── ЭЛЕМЕНТЫ ВНЕ ПАПКИ ЯДРА НА ВРЕМЯ `next build` ──────────────────────────────────────────────────────────────────────────
// 🎯 Владелец 2026-10-21: «ядро по своей природе не должно быть зависимо от количества элементов … начиная с последних трёх дней по
// мере того как мы увеличивали количество элементов в проекте всегда пропорционально росло во время сборки»; и «for test can we remove
// a lot of items , check bilding after return items ?». Измерено тем же днём: `WEB4-ITEMS` внутри папки ядра — 14 элементов, ~938 тыс.
// файлов, 13 ГБ (у каждого свои node_modules и сборки). С ними Turbopack падал «memory allocation of 2147483648 bytes failed» четыре раза
// подряд (и при 1587 МБ свободных); с папкой, унесённой переименованием, то же ядро собралось с первого раза за 5,5 мин.
// 🔒 Переименование на том же диске — мгновенно, файлы не копируются. Возврат — в `finally` вызывающего и в `openLid`: обрыв посреди
// сборки не оставит элементы без папки (процессы элементов при закрытой крышке остановлены — папку никто не держит).
const asideDir = (root) => path.join(path.dirname(root), `${path.basename(root)}-WEB4-ITEMS-aside`)

function itemsAside(root, say = console.log) {
  const items = path.join(root, 'WEB4-ITEMS')
  if (!fs.existsSync(items)) return false
  if (fs.existsSync(asideDir(root))) throw new Error(`${asideDir(root)} уже есть — сначала вернуть элементы (itemsBack)`)
  fs.renameSync(items, asideDir(root))
  say(`Элементы вынесены из папки ядра на время сборки: ${asideDir(root)}`)
  return true
}

function itemsBack(root, say = console.log) {
  const items = path.join(root, 'WEB4-ITEMS')
  if (!fs.existsSync(asideDir(root)) || fs.existsSync(items)) return false
  fs.renameSync(asideDir(root), items)
  say('Элементы возвращены в папку ядра.')
  return true
}

// ── ПЕРЕРИСОВКА СТРАНИЦ ЯДРА ПОСЛЕ СБОРКИ ───────────────────────────────────────────────────────────────────────────────
// ✗ 557 (2026-10-21): страницы ядра предрендериваются при сборке, а элементы в это время вынесены — меню собиралось без них (у
// встроенных не было дерева, у рождённых — пунктов «Документы»). Вынос только node_modules и сборок не помог: с остальным содержимым
// `WEB4-ITEMS` сборка падала тем же отказом на 2 ГБ. Поэтому элементы выносятся целиком, а когда ядро поднялось и элементы вернулись,
// ядро получает свой обычный сигнал «настройки сменились» (`/api/settings/changed`, ключ узла) и перерисовывает страницы по настоящим
// паспортам. Сигнал — следствие действия человека (сборки), а не таймер.
async function redrawCore(root, say = console.log) {
  let port = 24680
  try { port = JSON.parse(fs.readFileSync(path.join(root, 'logs', 'runtime.json'), 'utf8')).port ?? port } catch { /* по умолчанию */ }
  let key = ''
  try { key = /^SETTINGS_SECRET=(.*)$/m.exec(fs.readFileSync(path.join(root, '.env.local'), 'utf8'))?.[1]?.trim() ?? '' } catch { /* ключа нет */ }
  if (!key) { say('Перерисовка страниц ядра пропущена: нет ключа узла.'); return false }
  for (let i = 0; i < 60; i++) {
    try { if ((await fetch(`http://localhost:${port}/api/health`, { signal: AbortSignal.timeout(3000) })).ok) break } catch { /* ещё стартует */ }
    await new Promise((r) => setTimeout(r, 2000))
  }
  try {
    const r = await fetch(`http://localhost:${port}/api/settings/changed`, { method: 'POST', headers: { 'x-settings-key': key }, signal: AbortSignal.timeout(60_000) })
    say(`Страницы ядра перерисованы по вернувшимся элементам: ${r.status}.`)
    return r.ok
  } catch (e) {
    say(`Страницы ядра не перерисованы: ${e instanceof Error ? e.message : e}`)
    return false
  }
}

module.exports = { closeLid, openLid, readState, backupNext, restoreNext, dropBackup, freeMb, itemsAside, itemsBack, redrawCore }

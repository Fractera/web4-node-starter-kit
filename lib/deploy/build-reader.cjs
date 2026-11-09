// ЧТЕЦ СБОРКИ ЯДРА (узел, шаг 642-2). Слово владельца 2026-11-04: «Сейчас развёртывание проходит совершенно вслепую … терминала высотой
// например в 400 пикселей в котором проходила процедура развёртывания с фокусировкой на последнюю строчку таким образом пользователь
// видел чтобы компьютер не завис … от каждого элементом и в том числе ребро».
//
// 🔒 ЗАЧЕМ ОТДЕЛЬНЫЙ ПРОЦЕСС: ядро собирается при закрытой крышке (553) — остановлены все процессы узла, и само ядро тоже, поэтому
// страница, которая показала бы журнал, 8–12 минут не отвечает. А `serve.mjs rebuild` собирает через `spawnSync` — его собственный
// цикл событий занят, сервер в нём не ответил бы. Чтец — маленький процесс Node без зависимостей: `scripts/build-reader.mjs`.
// 🔒 НЕ ПОРТ ЯДРА: туннель смотрит на порт ядра, и Cloudflare на время сборки отдаёт копии страниц («дом молчит» — 344/385). Займи чтец
// порт ядра, интернет получил бы его ответы вместо копий. Чтец слушает 127.0.0.1:25680 — сразу за блоком портов узла 24680–25679
// (`lib/server-port.cjs`), его видит только этот компьютер.
// 🔒 ЖИВЁТ РОВНО ПОКА ЗАКРЫТА КРЫШКА: `serve.mjs rebuild` запускает его после `closeLid` и останавливает перед каждым `openLid`; сам он
// выходит, когда умер родитель (707-2: если крышка при этом закрыта — сначала возвращает прежнюю сборку и открывает крышку), и через
// 90 минут в любом случае.
const { spawn } = require('node:child_process')
const { mkdirSync, readFileSync, rmSync, writeFileSync } = require('node:fs')
const { dirname, join } = require('node:path')

const READER_PORT = 25680
const pidFile = (root) => join(root, 'data', 'node', 'build-reader.json')

/** Остановить чтеца по его записи (сирота прежней сборки — тоже). */
function stopReader(root) {
  let rec = null
  try { rec = JSON.parse(readFileSync(pidFile(root), 'utf8')) } catch { return false }
  try { process.kill(rec.pid) } catch { /* уже вышел */ }
  rmSync(pidFile(root), { force: true })
  return true
}

/** Запустить чтеца: `log` — файл, куда идёт вывод сборки (нет — чтец отдаёт только этап), `what` — core | update. */
function startReader(root, { log, what = 'core', corePort = 24680 } = {}) {
  stopReader(root)
  const child = spawn(process.execPath, [join(root, 'scripts', 'build-reader.mjs')], {
    cwd: root,
    detached: true,
    stdio: 'ignore',
    windowsHide: true,
    env: { ...process.env, FRACTERA_BUILD_LOG: log ?? '', FRACTERA_BUILD_WHAT: what, FRACTERA_BUILD_PARENT: String(process.pid), FRACTERA_CORE_PORT: String(corePort), FRACTERA_READER_PORT: String(READER_PORT) },
  })
  child.unref()
  mkdirSync(dirname(pidFile(root)), { recursive: true })
  writeFileSync(pidFile(root), JSON.stringify({ pid: child.pid, port: READER_PORT, log: log ?? null, what, startedAt: new Date().toISOString() }, null, 2))
  return child.pid
}

module.exports = { READER_PORT, startReader, stopReader }

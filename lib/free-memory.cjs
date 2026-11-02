// ДОСТУПНАЯ ПАМЯТЬ, А НЕ «ПУСТЫЕ СТРАНИЦЫ» (узел, шаг 624-1).
//
// ✗ Оплачено 2026-11-02 (владелец, Mac 16 ГБ, первый запуск): Telegram ответил «Агент build не включён: мало свободной памяти (свободно
// 114 МБ, нужно 300 МБ)», а система показывала 79% свободной (`memory_pressure`). Владелец: «до этого я работал на Windows компьютер у
// него было восемь но даже на нём я никогда не получал такие ограничения».
// 🛑 ПРИЧИНА: `os.freemem()` на macOS — только `Pages free` из `vm_stat`. macOS держит пустых страниц минимум, всё остальное — кэш файлов
// и неактивные страницы, которые система отдаёт по первому требованию. На Windows и Linux `os.freemem()` уже отдаёт доступную память
// (Windows — available, Linux — `MemAvailable`), поэтому там число верное и правка его не трогает.
// 🔒 НА macOS ДОСТУПНО = free + inactive + speculative (то, что «Мониторинг системы» считает освобождаемым без давления). `purgeable` не
// прибавляется: эти страницы уже лежат внутри active/inactive. `vm_stat` не ответил — прежнее `os.freemem()`, не догадка.
// Читают: мост комплекта агента (из корня узла, как `modes.cjs`), сборка при закрытой крышке, правило глубокой памяти, «Этот компьютер».

const { execFileSync } = require('node:child_process')
const os = require('node:os')
const path = require('node:path')

const MB = 1024 * 1024

/** Доступная память в байтах: на macOS — по `vm_stat`, иначе — `os.freemem()`. */
function availableBytes() {
  if (process.platform !== 'darwin') return os.freemem()
  try {
    const out = execFileSync('vm_stat', { encoding: 'utf8', timeout: 2000, windowsHide: true })
    const page = Number(/page size of (\d+) bytes/.exec(out)?.[1]) || 4096
    const pages = (name) => Number(new RegExp(`^Pages ${name}:\\s+(\\d+)`, 'm').exec(out)?.[1]) || 0
    const bytes = (pages('free') + pages('inactive') + pages('speculative')) * page
    return bytes > 0 ? bytes : os.freemem()
  } catch {
    return os.freemem()
  }
}

/** Доступная память в мегабайтах (округлено вниз). */
const availableMb = () => Math.floor(availableBytes() / MB)

// 624-2: КТО ЗАНИМАЕТ ПАМЯТЬ — чтобы совет «закройте лишнее» называл программы этого компьютера, а не общий список.
// 🔒 Не называются: сам узел (его закрывать нельзя), системные службы (их не закрыть) и Telegram — в нём человек читает этот совет и
// нажимает «Включить» (владелец 2026-11-02 согласился: «go»).
const SKIP = new Set(['node', 'next-server', 'npm', 'pm2', 'cloudflared', 'telegram', 'kernel_task', 'windowserver', 'finder', 'dock',
  'system', 'registry', 'memory compression', 'explorer', 'dwm', 'svchost', 'msmpeng', 'systemd', 'xorg'])

/** Имя программы по пути процесса: внешняя `.app` на macOS, иначе имя файла (`node <скрипт>` — node); вкладки WebKit — Safari. */
function appName(cmd) {
  if (/com\.apple\.WebKit\./.test(cmd)) return 'Safari'
  const app = /\/([^/]+)\.app\//.exec(cmd)
  if (app) return app[1]
  if (/^\/(System|usr|sbin|Library\/Apple)\//.test(cmd)) return null
  const name = path.basename(cmd.split(/\s/)[0]).replace(/\.exe$/i, '')
  return name.toLowerCase() === 'claude' ? 'Claude Code' : name
}

/** До `n` программ, занимающих больше всего памяти: [{ name, mb }], процессы одной программы сложены. Не вышло — []. */
function topApps(n = 3) {
  const sum = new Map()
  const add = (name, mb) => {
    if (!name || SKIP.has(name.toLowerCase())) return
    sum.set(name, (sum.get(name) ?? 0) + mb)
  }
  try {
    if (process.platform === 'win32') {
      const out = execFileSync('tasklist', ['/fo', 'csv', '/nh'], { encoding: 'utf8', timeout: 5000, windowsHide: true })
      for (const line of out.split(/\r?\n/)) {
        const f = line.split('","').map((x) => x.replace(/^"|"$/g, ''))
        if (f.length >= 5) add(appName(f[0]), Number(f[4].replace(/\D/g, '')) / 1024)
      }
    } else {
      const out = execFileSync('ps', ['-axo', 'rss=,comm='], { encoding: 'utf8', timeout: 5000 })
      for (const line of out.split('\n')) {
        const m = /^\s*(\d+)\s+(.+)$/.exec(line)
        if (m) add(appName(m[2]), Number(m[1]) / 1024)
      }
    }
  } catch {
    return []
  }
  return [...sum].map(([name, mb]) => ({ name, mb: Math.round(mb) })).sort((a, b) => b.mb - a.mb).slice(0, n)
}

module.exports = { availableBytes, availableMb, topApps }

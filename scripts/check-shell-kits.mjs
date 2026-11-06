// СТОРОЖ ОБОЛОЧКИ ПРОЕКТА: КОПИИ `components/shell/` СОВПАДАЮТ С САЙТОМ БАЙТ В БАЙТ (шаг 285-3).
//
// Слово владельца 2026-09-24: «если мы говорим что мы пере используем один и тот же компонент везде то почему у
// нас корень и ядро имеет правильное представление для хедер и футер». Источник вида — сайт (элемент root);
// ядро и службы держат копию (`npm run shell-kit:add`). Копия, разошедшаяся с сайтом, и есть «калейдоскоп».
//
// Три вердикта, а не два: ок · ОШИБКА — у самого ЯДРА копия не совпадает с установленным сайтом (ядро
// собирается сейчас, и его вид обязан быть видом сайта) · ДОЛГ — у службы копия старше сайта: служба живёт своим
// тегом, обновляется своим выпуском; печатается при каждом прогоне, пока не закрыт.
// 🛑 Сайта с оболочкой ещё нет (узел до сайта v1.7.x) — сторож молчит об этом вслух и не падает.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { spawnSync } from 'node:child_process'

const ROOT = process.cwd()
const reg = JSON.parse(readFileSync(join(ROOT, 'WEB4-ITEMS-REGISTRY', 'web4-items.json'), 'utf8'))
const dirOf = (s) => join(ROOT, 'WEB4-ITEMS', s.kind === 'user' ? 'user' : 'core', s.id)
const root = (reg.services ?? []).find((s) => s.id === 'root')
const siteShell = root ? join(dirOf(root), 'components', 'shell') : null

function files(dir) {
  const out = []
  const walk = (d) => {
    for (const n of readdirSync(d)) {
      const p = join(d, n)
      if (statSync(p).isDirectory()) walk(p)
      else out.push(relative(dir, p).split('\\').join('/'))
    }
  }
  walk(dir)
  return out.sort()
}
const read = (p) => readFileSync(p, 'utf8').replace(/\r\n/g, '\n')

// Источник вида сайта: установленная папка — по умолчанию.
const installedSite = () => ({ list: () => files(siteShell), read: (f) => read(join(siteShell, f)), label: 'сайт' })

// 662-1: ✗ замерено на узле владельца 2026-11-06 — `node:update` проверяет ядро (шаг 6) ДО того, как ставит элементы на закрепления
// (шаг 7): выпуск, где оболочка меняется у сайта и ядра вместе, откатывался «ядро не совпадает с сайтом» — сверка шла с сайтом
// прежней версии. Сайт стоит ровно на теге выпуска, а закрепление реестра другое — ядро сверяется с оболочкой ЗАКРЕПЛЁННОГО тега
// (её прочтёт установка сразу после сторожей). Своя работа поверх тега или тег не достаётся — прежняя сверка с установленной папкой.
function pinnedSite() {
  if (!root?.version || !root.repo) return null
  const dir = dirOf(root)
  const g = (...a) => spawnSync('git', ['-C', dir, ...a], { encoding: 'utf8', windowsHide: true })
  const at = g('describe', '--tags', '--exact-match', 'HEAD')
  if (at.status !== 0 || at.stdout.trim() === root.version) return null
  if (g('rev-parse', '-q', '--verify', `${root.version}^{commit}`).status !== 0) g('fetch', '--quiet', '--tags', root.repo)
  const ls = g('ls-tree', '-r', '--name-only', root.version, '--', 'components/shell')
  if (ls.status !== 0 || !ls.stdout.trim()) return null
  const list = ls.stdout.trim().split('\n').map((p) => p.replace(/^components\/shell\//, '')).sort()
  return {
    list: () => list,
    read: (f) => g('show', `${root.version}:components/shell/${f}`).stdout.replace(/\r\n/g, '\n'),
    label: `сайт ${root.version} (закрепление; установлен ${at.stdout.trim()})`,
  }
}

function compare(copy, site = installedSite()) {
  const want = site.list()
  const have = existsSync(copy) ? files(copy) : []
  const diff = []
  for (const f of want) {
    if (!have.includes(f)) diff.push(`нет ${f}`)
    else if (site.read(f) !== read(join(copy, f))) diff.push(`отличается ${f}`)
  }
  for (const f of have) if (!want.includes(f)) diff.push(`лишний ${f}`)
  return diff
}

if (!siteShell || !existsSync(join(siteShell, 'shell-types.ts'))) {
  console.log('shell-kits: у установленного сайта нет components/shell — сверять не с чем (нужен сайт v1.7.1+)')
  console.log('===SHELL_KITS_OK===')
  process.exit(0)
}

let errors = 0
const coreSite = pinnedSite() ?? installedSite()
const core = compare(join(ROOT, 'components', 'shell'), coreSite)
if (core.length) {
  errors++
  console.log(`  ✗ ОШИБКА ядро: components/shell не совпадает с ${coreSite.label} — npm run shell-kit:add -- .`)
  for (const d of core.slice(0, 12)) console.log(`      ${d}`)
} else console.log(`  ✓ ядро — копия: ${coreSite.label}`)

for (const s of reg.services ?? []) {
  if (s.id === 'root') continue
  // 285-4: у службы, где Next живёт папкой внутри (данные: `presentation/`), оболочка там.
  const copy = [join(dirOf(s), 'components', 'shell'), join(dirOf(s), 'presentation', 'components', 'shell')].find((p) => existsSync(p))
  if (!copy) continue
  const d = compare(copy)
  if (d.length) {
    console.log(`  ⚠ ДОЛГ ${s.id} ${s.version}: оболочка старше сайта — shell-kit:add в исходник службы, новый тег`)
    for (const x of d.slice(0, 6)) console.log(`      ${x}`)
  } else console.log(`  ✓ ${s.id} — копия сайта`)
}

// 294: замок страницы (`components/auth/access-gate.client.tsx`) — один файл у сайта и ядра; копия ядра = сайт.
const gateSite = join(dirOf(root), 'components', 'auth', 'access-gate.client.tsx')
const gateCore = join(ROOT, 'components', 'auth', 'access-gate.client.tsx')
if (existsSync(gateSite) && existsSync(gateCore)) {
  if (read(gateSite) !== read(gateCore)) {
    errors++
    console.log('  ✗ ОШИБКА ядро: components/auth/access-gate.client.tsx не совпадает с сайтом — скопируйте файл сайта')
  } else console.log('  ✓ замок страницы ядра — копия сайта')
}

if (errors) {
  console.log('===SHELL_KITS_FAILED===')
  process.exit(1)
}
console.log('===SHELL_KITS_OK===')

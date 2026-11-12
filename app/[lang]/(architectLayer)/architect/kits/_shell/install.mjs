// УСТАНОВКА ОБОЛОЧКИ ПРОЕКТА (ШАПКА И ПОДВАЛ) В СЛУЖБУ НА NEXT (шаг 285-3).
//
//   npm run shell-kit:add -- <папка исходника службы>
//   npm run shell-kit:add -- <папка исходника службы> --from <папка образца>
//
// 🔒 ИСТОЧНИК — ЯДРО (шаг 734-3a). Вид шапки и подвала живёт в `components/shell/` ядра — образец, из которого собирается и
// инструмент «Оболочка проекта» (727), — и копируется в элемент байт в байт. Один образец на узел («калейдоскоп» — слово
// владельца 2026-09-24 о двух копиях вида); ✗ до 734 образцом была папка элемента `root`, и ядро зависело от одного кастомного
// элемента — владелец 2026-11-12: «из всех элементов выделять ядро как особую сущность». Сторож `npm run check:shell-kits`
// сверяет копии элементов с ядром.
//
// 🔒 СТАВИТСЯ В ИСХОДНИК СЛУЖБЫ (её репозиторий или форк), а не в WEB4-ITEMS/: папка элемента — клон по тегу.
// Примитивы shadcn и `lib/utils` копируются, только если их у службы НЕТ — свои службы не перезаписываются.

import { cpSync, existsSync, readFileSync, rmSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const NODE = join(here, '..', '..', '..', '..', '..', '..')
const args = process.argv.slice(2)
const fromIdx = args.indexOf('--from')
const fromArg = fromIdx >= 0 ? args[fromIdx + 1] : null
// 587-7: значение `--from` пропускается только когда флаг есть. ✗ Было `i !== fromIdx + 1`: без `--from` (fromIdx = -1) отсекался
// первый же аргумент, и `npm run shell-kit:add -- .` отвечал «укажите папку».
const target = args.find((a, i) => !a.startsWith('--') && !(fromIdx >= 0 && i === fromIdx + 1))

// Образец — ядро узла (эта папка лежит в нём); `--from` — другая папка с тем же устройством (рабочая копия ядра).
function siteDir() {
  return fromArg ? resolve(fromArg) : NODE
}

if (!target || !existsSync(target)) {
  console.error('shell-kit: укажите папку исходника службы, которая существует')
  process.exit(1)
}
const site = siteDir()
if (!site || !existsSync(join(site, 'components', 'shell', 'shell-types.ts'))) {
  console.error(`shell-kit: у образца нет components/shell (${site})`)
  process.exit(1)
}

const dst = resolve(target)
rmSync(join(dst, 'components', 'shell'), { recursive: true, force: true })
cpSync(join(site, 'components', 'shell'), join(dst, 'components', 'shell'), { recursive: true })
console.log(`shell-kit: components/shell скопирована с ядра (${site}) в ${dst}`)

// 553: мега-меню оболочки — navigation-menu; поиск языка — input.
const PRIMITIVES = ['components/ui/button.tsx', 'components/ui/sheet.tsx', 'components/ui/separator.tsx', 'components/ui/badge.tsx', 'components/ui/dropdown-menu.tsx', 'components/ui/navigation-menu.tsx', 'components/ui/input.tsx', 'lib/utils.ts']
for (const p of PRIMITIVES) {
  if (existsSync(join(dst, p))) continue
  mkdirSync(dirname(join(dst, p)), { recursive: true })
  cpSync(join(site, p), join(dst, p))
  console.log(`  + ${p} (не было у элемента — взят у ядра)`)
}

// 285-4: кнопка сайта стоит на @base-ui/react — без него сборка службы падает «Can't resolve '@base-ui/react/button'».
const DEPS = ['lucide-react', 'radix-ui', '@base-ui/react', 'class-variance-authority', 'clsx', 'tailwind-merge']
const sitePkg = JSON.parse(readFileSync(join(site, 'package.json'), 'utf8'))
// 285-4: приложение Next может жить папкой ВНУТРИ службы (данные: `presentation/`) — его package.json у службы.
const pkgPath = existsSync(join(dst, 'package.json')) ? join(dst, 'package.json') : join(dst, '..', 'package.json')
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
const added = []
for (const d of DEPS) {
  if (pkg.dependencies?.[d] || pkg.devDependencies?.[d]) continue
  const v = sitePkg.dependencies?.[d]
  if (!v) continue
  pkg.dependencies = { ...(pkg.dependencies ?? {}), [d]: v }
  added.push(`${d}@${v}`)
}
if (added.length) {
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
  console.log(`  + зависимости в package.json: ${added.join(', ')} — выполните npm install в службе`)
}

console.log('  подключение (корневой макет с языком в адресе):')
console.log('    <ThemeProvider> из "@/components/shell/theme-provider.client" вокруг страницы')
console.log('    <ProjectHeader data={shell} surface={…} /> … <ProjectFooter data={shell} surface={…} />')
console.log('    данные — дверь сайта PROJECT_SHELL_URL/<язык> на сборке; адреса сделать абсолютными на PROJECT_SITE_URL')
console.log('===SHELL_KIT_OK===')

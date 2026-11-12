// СТОРОЖ ОБОЛОЧКИ ПРОЕКТА: КОПИИ `components/shell/` СОВПАДАЮТ С ЯДРОМ БАЙТ В БАЙТ (шаг 285-3, образец — ядро с шага 734-3a).
//
// Слово владельца 2026-09-24: «если мы говорим что мы пере используем один и тот же компонент везде то почему у
// нас корень и ядро имеет правильное представление для хедер и футер». Один вид на всех — да; но ИСТОЧНИК вида — ЯДРО.
// ✗ 285-3 сделал источником элемент root, и сборка ядра падала, когда его копия расходилась с root: ядро зависело от одного
// кастомного элемента. Владелец 2026-11-12 (шаг 734): «воспринимать все кастомные элементы равными и вообще из всех элементов
// выделять ядро как особую сущность». Теперь образец — `components/shell/` самого ядра (из него же собирается инструмент
// «Оболочка проекта», 727), а root сверяется с ядром, как любой другой элемент.
//
// Два вердикта: ок · ДОЛГ — у элемента копия разошлась с ядром: элемент живёт своим тегом, обновляется своим выпуском
// (`npm run shell-kit:add` в его исходник); печатается при каждом прогоне, пока не закрыт. Сборка ядра падает только от одного:
// у самого ядра нет образца.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = process.cwd()
const reg = JSON.parse(readFileSync(join(ROOT, 'WEB4-ITEMS-REGISTRY', 'web4-items.json'), 'utf8'))
const dirOf = (s) => join(ROOT, 'WEB4-ITEMS', s.kind === 'user' ? 'user' : 'core', s.id)
const coreShell = join(ROOT, 'components', 'shell')

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

function compare(copy) {
  const want = files(coreShell)
  const have = existsSync(copy) ? files(copy) : []
  const diff = []
  for (const f of want) {
    if (!have.includes(f)) diff.push(`нет ${f}`)
    else if (read(join(coreShell, f)) !== read(join(copy, f))) diff.push(`отличается ${f}`)
  }
  for (const f of have) if (!want.includes(f)) diff.push(`лишний ${f}`)
  return diff
}

if (!existsSync(join(coreShell, 'shell-types.ts'))) {
  console.log('  ✗ ОШИБКА ядро: нет образца оболочки components/shell/ — инструмент «Оболочка проекта» не из чего собрать')
  console.log('===SHELL_KITS_FAILED===')
  process.exit(1)
}
console.log('  ✓ ядро — образец оболочки')

// Каждый элемент одинаково: ни один id не пропускается и ни один не главный.
for (const s of reg.services ?? []) {
  // 285-4: у службы, где Next живёт папкой внутри (данные: `presentation/`), оболочка там.
  const copy = [join(dirOf(s), 'components', 'shell'), join(dirOf(s), 'presentation', 'components', 'shell')].find((p) => existsSync(p))
  if (!copy) continue
  const d = compare(copy)
  if (d.length) {
    console.log(`  ⚠ ДОЛГ ${s.id} ${s.version}: оболочка разошлась с ядром — shell-kit:add в исходник элемента, новый тег`)
    for (const x of d.slice(0, 6)) console.log(`      ${x}`)
  } else console.log(`  ✓ ${s.id} — копия ядра`)
}

// 294: замок страницы (`components/auth/access-gate.client.tsx`) — один файл; образец — ядро, копии элементов сверяются с ним.
const gateCore = join(ROOT, 'components', 'auth', 'access-gate.client.tsx')
if (existsSync(gateCore)) {
  for (const s of reg.services ?? []) {
    const gate = join(dirOf(s), 'components', 'auth', 'access-gate.client.tsx')
    if (existsSync(gate) && read(gate) !== read(gateCore)) console.log(`  ⚠ ДОЛГ ${s.id}: замок страницы разошёлся с ядром`)
  }
}

console.log('===SHELL_KITS_OK===')

// СТОРОЖ: МЕНЮ «ГЛАВНОГО АГЕНТА» = МЕНЮ ЭЛЕМЕНТА (шаг 528-6).
//
// Владелец 2026-10-18: «Подвергни критическому анализу соответствия и отставание меню главного агента меню элементы. Приведи в
// соответствие». Меню элемента живёт в `lib/web4-items/item-tree.ts`, меню главного агента — папками `architect/build/` и схемой места
// `_lib/main-agent-scheme.ts`. Две половины одного знания расходятся молча: страницу добавили в дерево элемента — у главного агента её
// нет, и ничто не падает. Этот сторож ловит:
//   1. узел Messenger или Рабочего процесса элемента без страницы у главного агента (своей папки или страницы, поставленной схемой);
//   2. папку под `build/messenger` или `build/workflow`, которой нет в дереве элемента;
//   3. страницу главного агента «россыпью» — не наверху (`MAIN_AGENT_TOP`) и без места в схеме;
//   4. место в схеме без страницы или без пункта-родителя.
// Оба TS-файла читаются компилятором TypeScript проекта (transpileModule): своя копия списка здесь была бы третьей половиной.

import { existsSync, mkdtempSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import ts from 'typescript'

const ROOT = process.cwd()
const BUILD = join(ROOT, 'app', '[lang]', '(architectLayer)', 'architect', 'build')
const tmp = mkdtempSync(join(tmpdir(), 'main-agent-menu-'))

async function load(rel, name) {
  const src = readFileSync(join(ROOT, rel), 'utf8')
  const out = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText
  const file = join(tmp, `${name}.mjs`)
  writeFileSync(file, out)
  return import(pathToFileURL(file).href)
}

const tree = await load('lib/web4-items/item-tree.ts', 'item-tree')
const scheme = await load('app/[lang]/(architectLayer)/_lib/main-agent-scheme.ts', 'main-agent-scheme')

const isPage = (dir) => existsSync(join(dir, '_data', 'index.ts'))
const childPages = (dir) =>
  existsSync(dir)
    ? readdirSync(dir).filter((n) => !/^[_[(.]/.test(n) && statSync(join(dir, n)).isDirectory() && isPage(join(dir, n)))
    : []
/** Папки-страницы под `build/<base>` на любую глубину — пути от `build/`. */
function folders(base) {
  const out = []
  const walk = (rel) => { for (const n of childPages(join(BUILD, ...rel.split('/')))) { const r = `${rel}/${n}`; out.push(r); walk(r) } }
  if (isPage(join(BUILD, ...base.split('/')))) { out.push(base); walk(base) }
  return out
}
/** Узлы дерева элемента под разделом — пути от элемента. */
function treePaths(slug) {
  const out = []
  const walk = (pages, base) => { for (const p of pages) { const path = `${base}/${p.slug}`; out.push(path); if (p.pages) walk(p.pages, path) } }
  const trail = tree.findTreePath(slug.split('/'))
  const section = trail ? trail[trail.length - 1] : null
  if (section) { out.push(slug); walk(section.pages ?? [], slug) }
  return out
}

const errors = []
const PLACE = scheme.MAIN_AGENT_PLACE
const borrowed = new Set(Object.entries(PLACE).map(([slug, parent]) => `${parent}/${slug}`))

// 530-1: и «Настройки → Платежи» — у главного агента та же ветка (остальные настройки элемента у ядра законно другие).
for (const section of ['messenger', 'workflow', 'settings/payments']) {
  const onDisk = new Set(folders(section))
  for (const p of treePaths(section)) {
    if (!onDisk.has(p) && !borrowed.has(p)) errors.push(`у элемента есть «${p}», у главного агента — нет (ни папки build/${p}, ни места в схеме)`)
  }
  const inTree = new Set(treePaths(section))
  for (const p of onDisk) if (!inTree.has(p)) errors.push(`у главного агента есть build/${p}, а в дереве элемента такой страницы нет`)
}

const top = new Set(scheme.MAIN_AGENT_TOP)
for (const slug of childPages(BUILD)) {
  if (!top.has(slug) && !PLACE[slug]) errors.push(`страница build/${slug} лежит россыпью: её нет ни среди верхних пунктов, ни в схеме места`)
}
for (const slug of top) if (!isPage(join(BUILD, slug))) errors.push(`верхний пункт «${slug}» назван, а папки build/${slug} нет`)
for (const [slug, parent] of Object.entries(PLACE)) {
  if (!isPage(join(BUILD, slug))) errors.push(`в схеме место для build/${slug}, а такой страницы нет`)
  if (!isPage(join(BUILD, ...parent.split('/')))) errors.push(`в схеме build/${slug} стоит под «${parent}», а такой страницы нет`)
}

for (const e of errors) console.log(`  ОШИБКА  ${e}`)
if (errors.length) {
  console.log(`===MAIN_AGENT_MENU_FAILED=== ошибок: ${errors.length}`)
  process.exit(1)
}
console.log(`===MAIN_AGENT_MENU_OK=== Messenger, Рабочий процесс и Платежи совпадают с элементом, страниц россыпью нет, мест в схеме: ${Object.keys(PLACE).length}`)

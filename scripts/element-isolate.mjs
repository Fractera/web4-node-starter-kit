// ГРАНИЦА АГЕНТА ЭЛЕМЕНТА (узел, шаг 548): `node scripts/element-isolate.mjs` — для каждого элемента узла и для главного агента.
//
// Слово владельца 2026-10-19: «когда работа идёт внутри элемента единственное что ему требуется от ядра это доступ к его файлу
// который содержит описание других элементов, и ядра … Мы не говорим о том что ему категорически запрещено выходить за свои
// пределы но чтобы он это сделал он должен явно спросить разрешения у архитектора».
//
// ✗ Замерено: агент элемента стартует в папке внутри узла, и Claude Code грузит каждый CLAUDE.md выше рабочей папки — инструкция
// ядра (252 361 знак, ≈95 тыс. токенов) ехала в каждый элемент на каждом шаге: 146 547 токенов на старте агента template.
//
// Пишет элементу `.claude/settings.local.json` (вне git, путь узла свой у каждой машины):
//   - `claudeMdExcludes` — CLAUDE.md ядра не грузится;
//   - 🪦 `permissions.blockReadsOutsideWorkingDirectories` снят 548-13: с ним каждая команда с подоболочкой ждала человека;
//   - `permissions.ask` — чтение и правка исходников ядра и папок других элементов только с ответа человека в терминале;
//   - хук `PreToolUse` (`scripts/element-boundary-hook.mjs`, 548-7) — команда оболочки или записываемый файл, где назван путь вне
//     своей папки, спрашивает человека: правила не видят node-скриптов, а песочницы на Windows нет;
//   - чужие навыки, плагины и коннекторы выключены (`lib/agent-kit/foreign-off.mjs`, 548-7);
//   - вендорные навыки (рядом `SOURCE.md`) — `name-only`: их зовут по имени навыки-привратники и инструкция;
//   - `skillListingBudgetFraction` — столько, чтобы описания всех своих навыков помещались (меньше 1 % не ставится).
//   Свои данные элемента (`data/services/<id>`) и журналы узла порог не трогают. О составе узла элемент узнаёт из
//   `npm run passport -- project` (дверь ядра), не из файлов ядра.
// Затем ставит папку главного агента (`scripts/main-agent-install.mjs`, 548-4).
// Запускают: рождение (`item-birth.mjs`), перенос папки (`element-move.mjs`), установка (`services-install.mjs`) — пути меняются.
// Свои строки файла сценарий узнаёт по пути узла и переписывает только их; чужие настройки элемента остаются.

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { foreignOff, skillField } from '../lib/agent-kit/foreign-off.mjs'
import { installMainAgent } from './main-agent-install.mjs'

const ROOT = process.cwd()
const ITEMS = join(ROOT, 'WEB4-ITEMS')
const posix = (p) => p.replace(/\\/g, '/').replace(/^([A-Za-z]):/, (_, d) => `/${d.toLowerCase()}`)
const nodePosix = posix(ROOT)
// Исходники и документы ядра: всё в корне узла, кроме данных, журналов, зависимостей и самих элементов.
const OPEN = new Set(['data', 'logs', 'node_modules', 'WEB4-ITEMS', '.git', '.next', 'tsconfig.tsbuildinfo'])
const coreDirs = readdirSync(ROOT, { withFileTypes: true }).filter((d) => d.isDirectory() && !OPEN.has(d.name) && !d.name.startsWith('.next')).map((d) => d.name)
const rootFiles = readdirSync(ROOT, { withFileTypes: true }).filter((d) => d.isFile()).map((d) => d.name)
const HOOK = join(ROOT, 'scripts', 'element-boundary-hook.mjs').replace(/\\/g, '/')
const foreign = foreignOff()
const readText = (f) => { try { return readFileSync(f, 'utf8') } catch { return '' } }

/** Свои навыки элемента: сколько знаков займут в списке с описаниями и какие из них вендорные.
 *  С 552-2 свои навыки шаблона лежат в группах-плагинах `.claude/skills/<группа>/skills/<навык>`: в списке они стоят как
 *  `<группа>:<навык>`, и `skillOverrides` на них не действует — их описания бюджет обязан вместить целиком. */
function ownSkills(dir) {
  const base = join(dir, '.claude', 'skills')
  if (!existsSync(base)) return { chars: 0, vendor: [] }
  let chars = 0
  const vendor = []
  const described = (text, name) => name.length + 4 + `${skillField(text, 'description')} ${skillField(text, 'when_to_use')}`.trim().slice(0, 1536).length
  for (const d of readdirSync(base, { withFileTypes: true })) {
    if (!d.isDirectory()) continue
    if (existsSync(join(base, d.name, '.claude-plugin', 'plugin.json'))) {
      const inner = join(base, d.name, 'skills')
      for (const s of existsSync(inner) ? readdirSync(inner, { withFileTypes: true }) : []) {
        const text = s.isDirectory() ? readText(join(inner, s.name, 'SKILL.md')) : ''
        if (text) chars += described(text, `${d.name}:${skillField(text, 'name') || s.name}`)
      }
      continue
    }
    const text = readText(join(base, d.name, 'SKILL.md'))
    if (!text) continue
    const name = skillField(text, 'name') || d.name
    if (existsSync(join(base, d.name, 'SOURCE.md'))) { vendor.push(name); chars += name.length + 4; continue }
    chars += described(text, name)
  }
  return { chars, vendor }
}

const elements = []
for (const kind of ['core', 'user']) {
  const base = join(ITEMS, kind)
  if (!existsSync(base)) continue
  for (const name of readdirSync(base, { withFileTypes: true })) if (name.isDirectory()) elements.push(join(base, name.name))
}

const idOf = (dir) => {
  for (const f of [join(dir, 'OWN-SERVICE-PROPS', 'OWN-SERVICE-PROPS.json'), join(dir, 'OWN-SERVICE-PROPS.json')]) {
    try { const id = JSON.parse(readText(f)).id; if (typeof id === 'string' && id) return id } catch { /* нет паспорта */ }
  }
  return dir.split(/[\\/]/).pop()
}

// Сколько знаков списка помещается в 1 % окна — замерено 548-6: 29 994 знака у переполненного списка (журнал 22:02).
const BUDGET_AT_ONE_PERCENT = 28_000
const PLUGIN_SKILLS_CHARS = 1_500

const excludes = [join(ROOT, 'CLAUDE.md'), join(ROOT, 'CLAUDE.md').replace(/\\/g, '/'), `${nodePosix}/CLAUDE.md`, join(ROOT, 'CLAUDE.local.md').replace(/\\/g, '/')]
const ours = (rule) => rule.includes(nodePosix)
let written = 0
const report = []
const only = process.argv.includes('--only-main')
for (const dir of only ? [] : elements) {
  if (!existsSync(join(dir, 'CLAUDE.md'))) continue
  const id = idOf(dir)
  const ask = []
  const guard = (p) => { ask.push(`Read(/${p})`, `Edit(/${p})`) }
  // 548-14: файлы корня ядра — поимённо. ✗ Шаблон `<узел>/*` правила Claude Code читают как .gitignore: под него попадает папка
  // WEB4-ITEMS целиком, а с ней и папка самого элемента — любое чтение и правка СВОИХ файлов инструментами Read, Edit и Write
  // ждали архитектора (замерено 2026-10-20: y7jos встал на своём current-step.md, template получил отказ на его чтение).
  for (const f of rootFiles) guard(`${nodePosix}/${f}`)
  for (const d of coreDirs) guard(`${nodePosix}/${d}/**`)
  for (const other of elements) if (other !== dir) guard(`${posix(other)}/**`)
  const file = join(dir, '.claude', 'settings.local.json')
  let s = {}
  try { s = JSON.parse(readFileSync(file, 'utf8')) } catch { /* нет файла — начинаем с пустого */ }
  s.claudeMdExcludes = [...(s.claudeMdExcludes ?? []).filter((x) => !excludes.includes(x)), ...excludes]
  s.permissions = s.permissions ?? {}
  s.permissions.ask = [...(s.permissions.ask ?? []).filter((r) => !ours(r)), ...ask]
  // 548-14: своя папка и свои данные пишутся без вопроса (правило Edit покрывает Write). ✗ замерено 2026-10-20: в режиме auto
  // Claude Code спросил человека, создавать ли файл в СОБСТВЕННОЙ приёмной (текст пришёл от соседа по i2i), — агент, разбуженный
  // соседом, встал: у задачи A2A человека нет. Граница наружу — правила ask выше и сторож путей.
  const allow = [`Edit(/${posix(dir)}/**)`, `Edit(/${posix(join(ROOT, 'data', 'services', id))}/**)`]
  s.permissions.allow = [...(s.permissions.allow ?? []).filter((r) => !ours(r)), ...allow]
  // 548-13: блок чтения вне рабочих папок снят — он заставлял Claude Code спрашивать человека о КАЖДОЙ команде с подоболочкой
  // ($(…)), и разбуженный агент вставал на своём же «закончил» (замерено на erpxd 2026-10-20). Границу держат ask и хук.
  delete s.permissions.blockReadsOutsideWorkingDirectories

  // Сторож путей: своя запись узнаётся по имени сценария и переписывается целиком.
  const hookCmd = `node "${HOOK}" --dir "${dir.replace(/\\/g, '/')}" --data "${join(ROOT, 'data', 'services', id).replace(/\\/g, '/')}" --root "${ROOT.replace(/\\/g, '/')}"`
  const pre = (s.hooks?.PreToolUse ?? []).filter((m) => !(m.hooks ?? []).some((h) => String(h.command ?? '').includes('element-boundary-hook.mjs')))
  s.hooks = { ...(s.hooks ?? {}), PreToolUse: [...pre, { matcher: 'Bash|PowerShell|Write|Edit|MultiEdit|NotebookEdit', hooks: [{ type: 'command', command: hookCmd }] }] }

  // Чужое — вон из списка; вендорные навыки — по имени; бюджет — под свои описания.
  const own = ownSkills(dir)
  const { skillOverrides, enabledPlugins, ...rest } = foreign.settings
  Object.assign(s, rest)
  s.skillOverrides = { ...(s.skillOverrides ?? {}), ...skillOverrides, ...Object.fromEntries(own.vendor.map((n) => [n, 'name-only'])) }
  s.enabledPlugins = { ...(s.enabledPlugins ?? {}), ...enabledPlugins }
  const need = (own.chars + PLUGIN_SKILLS_CHARS) / BUDGET_AT_ONE_PERCENT
  const fraction = Math.min(0.02, Math.max(0.01, Math.ceil(need * 1.08 * 1000) / 100000))
  if (fraction > 0.01) s.skillListingBudgetFraction = fraction
  else delete s.skillListingBudgetFraction

  mkdirSync(join(dir, '.claude'), { recursive: true })
  writeFileSync(file, JSON.stringify(s, null, 2) + '\n', 'utf8')
  written++
  report.push(`${id}: список своих навыков ${own.chars} знаков, бюджет ${fraction}`)
}
if (report.length) console.log(report.join('\n'))
if (!only) console.log(`===ELEMENT_ISOLATE_OK=== элементов: ${written} · порог: исходники ядра (${coreDirs.length} папок + файлы корня) и ${elements.length - 1} соседей · чужих навыков выключено: ${foreign.userSkills.length}, плагинов: ${foreign.plugins.length}`)
installMainAgent(ROOT)

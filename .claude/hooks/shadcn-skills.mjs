#!/usr/bin/env node
// НАВЫКИ ПЕРЕД ИНТЕРФЕЙСОМ — ЗАКОН, А НЕ СОВЕТ (узел, шаг 730-2; 743-7). PreToolUse на Edit / Write / MultiEdit / Bash / PowerShell.
//
// Слова владельца 2026-11-11: «я даю тебе задание следовать навыкам а что в итоге в итоге кто во что горазд? Хочу использую навыки хочу не
// использую навыки». ✗ 729: агент загрузил `interface-design`, но не `use-primitives` и `use-shadcn` — и собрал руками то, что лежало
// в `components/ui/`. Ничто этого не заметило: навык грузится, только когда агент сам решит, что он к месту.
// 🔒 Правка интерфейсного файла (`.tsx` в components/, app/, _tools/, sections/, _widgets/) отказывается, пока в журнале ЭТОЙ сессии
// (transcript_path) нет вызова Skill для каждого обязательного навыка, который есть в проекте (`use-primitives`, `use-shadcn`).
// 🔒 743-7 (владелец 2026-11-14: «Сегодня твоя память есть завтра твоей памяти нет ты в архитектуру должен это записать и решить эту
// проблему я сталкиваюсь с этим уже неделю подряд»). ✗ 743-4: строки добавлены в `components/node-state/` и `components/hosting/` без
// `interface-design` — две дыры: (1) панелью считались только три папки, а ядро ЦЕЛИКОМ — пульт архитектора (в его `app/[lang]` нет
// ничего, кроме `(architectLayer)`); (2) правка шла через оболочку (python в Bash), а хук смотрел только Edit/Write. Владелец следом:
// «У нас весь проект так или иначе работы с интерфейсом … это не только про ядро это про все элементы». Теперь КАЖДЫЙ интерфейсный файл —
// в ядре и в любом элементе — просит и `interface-design` (вне территории навыка дизайна), и команда оболочки, которая ПИШЕТ в интерфейсный
// `.tsx` (sed -i, перенаправление, tee, cp/mv/rm, запись из python или node), держится так же. В начале каждой сессии строительства
// хук `interface-design-start.mjs` напоминает загрузить навыки сразу.
// 🔒 Свобода навыка дизайна: территория дизайна (секции элемента, страницы-прототипы, виджеты) хуком не закрыта — там ведёт выданный или
// закреплённый навык дизайна, а законность его метки проверяет сторож `check:shadcn-parts` (730-1). Сам shadcn (`components/ui/`) и
// вендорный AI Elements — не наш интерфейс, а исходник библиотеки.
// 🛑 Хук не ломает работу: непонятный вход, нет журнала — пропуск (сторож сборки всё равно стоит после).

import fs from "node:fs"
import path from "node:path"

// 725-4 → 743-7: interface work is craft work everywhere — `interface-design` beside the two (✗ 722: panel screens built without it looked
// foreign to the panel; ✗ 743-4: two panel lines added without it).
const REQUIRED = ["use-primitives", "use-shadcn", "interface-design"]
const AREA = /(?:^|\/)((?:components|app|_tools|sections|_widgets)\/.*)$/
const FREE = [/^components\/ui\//, /^components\/ai-elements\//, /^components\/sections\//, /\/_widgets\//, /^_widgets\//, /\/prototypes\/_pages\//]
// 743-7: a shell command that writes a file (reads — cat, grep, sed -n — pass)
const WRITES = /\bsed\s+(-[a-zA-Z]*i|--in-place)|\bperl\s+-[a-zA-Z]*i|>>?\s*(?!\/dev\/null|&)[^\s>]|\btee\b|\b(cp|mv|rm)\s|writeFileSync|writeFile\(|open\([^)]*["'][wa]\+?["']|write_text\(|\bSet-Content\b|\bOut-File\b|\bgit\s+(checkout|restore|apply)\b/
const TSX = /[^\s'"`;|&()<>=]*\.tsx\b/g

let input = ""
for await (const chunk of process.stdin) input += chunk
let call
try { call = JSON.parse(input) } catch { process.exit(0) }
const tool = call?.tool_name
const SHELL = tool === "Bash" || tool === "PowerShell"
if (!["Edit", "Write", "MultiEdit"].includes(tool) && !SHELL) process.exit(0)
const root = path.resolve(call?.cwd ?? process.cwd())

/** An interface file: its path inside its own project (the design skill's territory is free). */
function classify(p) {
  const abs = path.resolve(root, String(p).replace(/^~(?=\/)/, process.env.HOME ?? "~")).split(path.sep).join("/")
  if (!abs.endsWith(".tsx")) return null
  const m = AREA.exec(abs)
  if (!m) return null
  const rel = m[1]
  if (FREE.some((f) => f.test(rel))) return null
  return { rel }
}

let targets = []
if (SHELL) {
  const cmd = String(call?.tool_input?.command ?? "")
  if (!WRITES.test(cmd)) process.exit(0)
  targets = (cmd.match(TSX) ?? []).map(classify).filter(Boolean)
} else {
  const file = call?.tool_input?.file_path
  if (typeof file !== "string") process.exit(0)
  targets = [classify(file)].filter(Boolean)
}
if (!targets.length) process.exit(0)

// 730-4: в элементе навыки живут группами (`.claude/skills/build-skills/skills/use-shadcn`) и зовутся с приставкой группы
// (`build-skills:use-shadcn`); хук ставит каждому элементу ядро (`scripts/element-isolate.mjs`).
const groups = () => { try { return fs.readdirSync(path.join(root, ".claude", "skills")) } catch { return [] } }
const skillHere = (name) => fs.existsSync(path.join(root, ".claude", "skills", name, "SKILL.md")) ||
  groups().some((g) => fs.existsSync(path.join(root, ".claude", "skills", g, "skills", name, "SKILL.md")))
const need = REQUIRED.filter(skillHere)
if (!need.length) process.exit(0)
let log = ""
try { log = fs.readFileSync(call?.transcript_path ?? "", "utf8") } catch { process.exit(0) }
const loaded = (name) => new RegExp(`"name":"Skill","input":\\{"skill":"([a-z0-9-]+:)?${name}"`).test(log)
const missing = need.filter((n) => !loaded(n))
if (!missing.length) process.exit(0)
process.stderr.write(
  `Интерфейсный файл ${targets.map((t) => t.rel).join(", ")}${SHELL ? " (правка через оболочку — тоже правка)" : ""}: сначала загрузите навыки ` +
  `${missing.map((n) => `«${n}»`).join(" и ")} (инструмент Skill), потом пишите. Интерфейс — работа ремесла: «interface-design» до первой строки, в ядре и в каждом элементе. ` +
  `Элемент дизайна, который есть в shadcn, берётся из shadcn (components/ui/); свой вид — только у навыка дизайна на его территории ` +
  `(секции, прототипы, виджеты). Шаги 730-2, 743-7.\n`,
)
process.exit(2)

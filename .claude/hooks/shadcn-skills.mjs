#!/usr/bin/env node
// НАВЫКИ ПЕРЕД ИНТЕРФЕЙСОМ — ЗАКОН, А НЕ СОВЕТ (узел, шаг 730-2). PreToolUse на Edit / Write / MultiEdit.
//
// Слова владельца 2026-11-11: «я даю тебе задание следовать навыкам а что в итоге в итоге кто во что горазд? Хочу использую навыки хочу не
// использую навыки». ✗ 729: агент загрузил `interface-design`, но не `use-primitives` и `use-shadcn` — и собрал руками то, что лежало
// в `components/ui/`. Ничто этого не заметило: навык грузится, только когда агент сам решит, что он к месту.
// 🔒 Правка интерфейсного файла (`.tsx` в components/, app/, _tools/, sections/, _widgets/) отказывается, пока в журнале ЭТОЙ сессии
// (transcript_path) нет вызова Skill для каждого обязательного навыка, который есть в проекте (`use-primitives`, `use-shadcn`).
// 🔒 Свобода навыка дизайна: территория дизайна (секции элемента, страницы-прототипы, виджеты) хуком не закрыта — там ведёт выданный или
// закреплённый навык дизайна, а законность его метки проверяет сторож `check:shadcn-parts` (730-1). Сам shadcn (`components/ui/`) и
// вендорный AI Elements — не наш интерфейс, а исходник библиотеки.
// 🛑 Хук не ломает работу: непонятный вход, нет журнала — пропуск (сторож сборки всё равно стоит после).

import fs from "node:fs"
import path from "node:path"

const REQUIRED = ["use-primitives", "use-shadcn"]
// 725-4: the architect's panel is craft work — `interface-design` too (✗ 722: panel screens built without it looked foreign to the panel).
const PANEL = [/^app\/\[lang\]\/\(architectLayer\)\//, /^components\/architect\//, /^components\/dashboard\//]
const PANEL_REQUIRED = ["interface-design"]
const AREAS = /^(components|app|_tools|sections|_widgets)\//
const FREE = [/^components\/ui\//, /^components\/ai-elements\//, /^components\/sections\//, /\/_widgets\//, /^_widgets\//, /\/prototypes\/_pages\//]

let input = ""
for await (const chunk of process.stdin) input += chunk
let call
try { call = JSON.parse(input) } catch { process.exit(0) }
if (!["Edit", "Write", "MultiEdit"].includes(call?.tool_name)) process.exit(0)
const root = path.resolve(call?.cwd ?? process.cwd())
const file = call?.tool_input?.file_path
if (typeof file !== "string" || !file.endsWith(".tsx")) process.exit(0)
const rel = path.relative(root, path.resolve(root, file)).split(path.sep).join("/")
if (rel.startsWith("..") || !AREAS.test(rel) || FREE.some((f) => f.test(rel))) process.exit(0)

// 730-4: в элементе навыки живут группами (`.claude/skills/build-skills/skills/use-shadcn`) и зовутся с приставкой группы
// (`build-skills:use-shadcn`); хук ставит каждому элементу ядро (`scripts/element-isolate.mjs`).
const groups = () => { try { return fs.readdirSync(path.join(root, ".claude", "skills")) } catch { return [] } }
const skillHere = (name) => fs.existsSync(path.join(root, ".claude", "skills", name, "SKILL.md")) ||
  groups().some((g) => fs.existsSync(path.join(root, ".claude", "skills", g, "skills", name, "SKILL.md")))
const need = [...REQUIRED, ...(PANEL.some((p) => p.test(rel)) ? PANEL_REQUIRED : [])].filter(skillHere)
if (!need.length) process.exit(0)
let log = ""
try { log = fs.readFileSync(call?.transcript_path ?? "", "utf8") } catch { process.exit(0) }
const loaded = (name) => new RegExp(`"name":"Skill","input":\\{"skill":"([a-z0-9-]+:)?${name}"`).test(log)
const missing = need.filter((n) => !loaded(n))
if (!missing.length) process.exit(0)
process.stderr.write(
  `Интерфейсный файл ${rel}: сначала загрузите навыки ${missing.map((n) => `«${n}»`).join(" и ")} (инструмент Skill), потом пишите. ` +
  `Элемент дизайна, который есть в shadcn, берётся из shadcn (components/ui/); свой вид — только у навыка дизайна на его территории ` +
  `(секции, прототипы, виджеты). Шаг 730-2.\n`,
)
process.exit(2)

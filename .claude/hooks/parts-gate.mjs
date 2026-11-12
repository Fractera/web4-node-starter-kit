#!/usr/bin/env node
// THE GATE OF A NEW INTERFACE FILE (node steps 725-3, 725-7 and 733-1). PreToolUse on Write.
//
// The owner, 2026-11-11: «вместо того чтобы взять готовые инструмент ты по какой-то причине полез создавать новый и создал говно» and
// «гораздо важнее иметь технологию для того чтобы из того процесса в котором ты находишься в процессе строительства понять что именно
// сейчас ты создаёшь инструмент». ✗ 722-4: a Textarea and the bare microphone squeezed into one row while VoiceTextarea lay ready; ✗ 722-8:
// the same row written three times before anyone extracted it.
// 🔒 A NEW `.tsx` in the interface folders is written only when (1) this session asked the parts map — the tool `parts_find` or
// `npm run parts` is in its transcript — and (2) its first lines say what is being born: `// @part <id> — <what>` (its card in the
// folder's parts.json, held by check:parts-map) or `// @local — <why no one else needs it>`.
// 🔒 733-1 (the owner, 2026-11-12: «модели не понимают когда их создавать и куда их складывать и вторая задача более первичная чем
// первая»): every refusal asks the three questions of the definition (skill use-tools); a file born under `_tools/<id>/` needs that
// tool's card `tool.json` on disk first — the card is its declaration: the job is written before the code.
// 🔒 Not held: an edit of an existing file (not a birth), route files (page, layout, route …), shadcn's own sources, a design skill's
// territory (sections, prototypes, widgets — local by nature), a project without the parts map (lib/parts/PARTS.json).
// 🛑 The hook never breaks work: an unreadable input or no transcript — it passes; the build's guards stand behind it.
import fs from "node:fs"
import path from "node:path"

const AREAS = /^(components|app|_tools|sections)\//
const FREE = [/^components\/ui\//, /^components\/ai-elements\//, /^components\/sections\//, /^sections\//, /\/_widgets\//, /\/prototypes\/_pages\//, /\/_agent-kit\//]
const ROUTE = /\/(page|layout|route|loading|error|not-found|template|default|global-error)\.tsx$/

let input = ""
for await (const chunk of process.stdin) input += chunk
let call
try { call = JSON.parse(input) } catch { process.exit(0) }
if (call?.tool_name !== "Write") process.exit(0)
const root = path.resolve(call?.cwd ?? process.cwd())
const file = call?.tool_input?.file_path
if (typeof file !== "string" || !file.endsWith(".tsx")) process.exit(0)
const abs = path.resolve(root, file)
const rel = path.relative(root, abs).split(path.sep).join("/")
if (rel.startsWith("..") || !AREAS.test(rel) || FREE.some((f) => f.test(rel)) || ROUTE.test("/" + rel)) process.exit(0)
if (fs.existsSync(abs)) process.exit(0)
if (!fs.existsSync(path.join(root, "lib", "parts", "PARTS.json"))) process.exit(0)

let log = ""
try { log = fs.readFileSync(call?.transcript_path ?? "", "utf8") } catch { process.exit(0) }
const asked = /"name":"mcp__[a-z0-9_-]*__parts_find"/.test(log) || /npm run parts\b/.test(log)
const head = String(call?.tool_input?.content ?? "").split("\n").slice(0, 8).join("\n")
const tool = /^_tools\/([^/]+)\//.exec(rel)
const carded = tool ? fs.existsSync(path.join(root, "_tools", tool[1], "tool.json")) : false
const declared = carded || /\/\/\s*@part\s+[a-z0-9-]+/.test(head) || /\/\/\s*@local\b/.test(head)
if (asked && declared) process.exit(0)

const why = []
if (!asked) why.push("ask the parts map first — the tool parts_find (or npm run parts -- <words>) with what you are about to build: a ready part is taken as it is, never built a second time")
if (tool && !carded) why.push(`write the tool's card _tools/${tool[1]}/tool.json first — the task it solves, its interface, the tools it is made of — then its code`)
else if (!declared) why.push("say on the file's first lines what is being born: `// @part <id> — <what it does>` (a reusable control, its card in the folder's parts.json in the same commit) or `// @local — <why no one else needs it>`")
process.stderr.write(
  `New interface file ${rel}: ${why.join("; then ")}. Before it is born, answer three questions (skill use-tools): 1) is it how a page's ` +
  `content looks? → a section; 2) is it bound to this page — reads its data, knows where it stands? → a widget, and the tools inside ` +
  `it are taken or born as tools, never written into it; 3) does it solve a task with its own interface, its material from outside? → ` +
  `a TOOL: _tools/<id>/ with its card first, even when one place needs it today; made of other tools — they are its parts, each found ` +
  `or born first. The owner, 2026-11-12: «Инструмент это то что решает задачу и используют для этого визуальный интерфейс. Один ` +
  `инструмент может быть частью другого». Node step 733.\n`,
)
process.exit(2)

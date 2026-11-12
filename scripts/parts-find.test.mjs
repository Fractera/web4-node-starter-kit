// THE SEARCH OF READY PARTS KEEPS FINDING THEM (node step 725-2). Words only — the build has no vectors; the meaning half is proven live.
// The cases are the plan's: a card edited so that the voice textarea, the chat tool or the left menu stop being found makes the build red,
// and the negative control keeps «nothing ready» honest.
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { findParts } from "../lib/parts/parts-find.mjs"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
process.env.DATA_SECRET = ""
const CASES = [
  ["поле с голосом", ["voice-textarea", "voice-field"], 2],
  ["надиктовать описание задачи", ["voice-textarea"], 1],
  ["окно переписки с моделью", ["tool-chat"], 1],
  ["chat with a model", ["tool-chat"], 1],
  ["левое меню", ["workspace-shell"], 1],
  ["modal window", ["app-dialog"], 1],
  ["таблица с поиском и страницами", ["table-tools"], 1],
  ["всплывающая подсказка", ["ui-tooltip"], 1],
]
const bad = []
for (const [q, want, top] of CASES) {
  const ids = (await findParts(ROOT, { query: q })).parts.slice(0, top).map((p) => p.id)
  if (!want.some((w) => ids.includes(w))) bad.push(`«${q}» → ${ids.join(", ") || "nothing"}; expected ${want.join(" or ")} in the first ${top}`)
}
const none = (await findParts(ROOT, { query: "бронирование столика" })).parts
if (none.length) bad.push(`«бронирование столика» must find nothing, found ${none.map((p) => p.id).join(", ")}`)
if (bad.length) {
  for (const b of bad) console.error(`  ✗ ${b}`)
  console.error(`===PARTS_FIND_FAILED=== ${bad.length}`)
  process.exit(1)
}
console.log(`===PARTS_FIND_OK=== ${CASES.length} queries find their part, the negative control finds nothing`)

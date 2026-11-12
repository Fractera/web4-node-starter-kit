// THE SEARCH OF READY PARTS KEEPS FINDING THEM (node step 725-2). Words only — the build has no vectors; the meaning half is proven live.
// The cases are the plan's: a card edited so that the voice textarea, the chat tool or the left menu stop being found makes the build red,
// and the negative control keeps «nothing ready» honest.
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import fs from "node:fs"
import os from "node:os"
import { findParts, partsText } from "../lib/parts/parts-find.mjs"

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
// 733-9-2: a copy whose source holds a newer version says so, with the command; at the same version it says nothing (the negative).
{
  const el = fs.mkdtempSync(join(os.tmpdir(), "parts-newer-"))
  fs.mkdirSync(join(el, "lib", "parts"), { recursive: true })
  const card = { id: "tool-image-crop", kind: "tool", title: { en: "Image cropping", ru: "Обрезка изображения" }, version: "1.0.0", parts: [], path: "_tools/image-crop/x.tsx",
    what: { en: "crop a picture", ru: "обрезать картинку" }, how: "x", words: { en: ["crop picture"], ru: ["обрезать картинку"] }, usedBy: [],
    source: { from: "core", tool: "tool-image-crop", version: "1.0.0", bodyHash: "0" } }
  fs.writeFileSync(join(el, "lib", "parts", "PARTS.json"), JSON.stringify({ parts: [card] }))
  const at = (version) => [{ ...card, version, source: undefined, where: { owner: "core" } }]
  const said = async (version) => partsText(await findParts(el, { query: "обрезать картинку", node: at(version) }), "обрезать картинку")
  if (!/A newer version v1\.1\.0 is in the core .*--update/.test(await said("1.1.0"))) bad.push("a copy at 1.0.0 with the core at 1.1.0 does not say «a newer version … --update»")
  if (/A newer version/.test(await said("1.0.0"))) bad.push("a copy at the core's own version says «a newer version» (negative control)")
}
if (bad.length) {
  for (const b of bad) console.error(`  ✗ ${b}`)
  console.error(`===PARTS_FIND_FAILED=== ${bad.length}`)
  process.exit(1)
}
console.log(`===PARTS_FIND_OK=== ${CASES.length} queries find their part, the negative control finds nothing`)

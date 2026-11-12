#!/usr/bin/env node
// npm run test:take — taking a tool (733-5): the tool and the parts of its recipe, each a copy with its provenance; a part already here
// at the same version is skipped; an update replaces an unedited older copy, never a fork (733-9-2); a panel tool, a missing requirement or a taken path refuse the whole take and write nothing.
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { doTake, planTake } from "../lib/parts/take.mjs"

const tmp = (n) => fs.mkdtempSync(path.join(os.tmpdir(), `take-${n}-`))
const put = (root, rel, data) => { fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true }); fs.writeFileSync(path.join(root, rel), typeof data === "string" ? data : JSON.stringify(data, null, 2)) }
const T = (id, scope, body, extra = {}) => ({ id, kind: "tool", path: body[0], title: { en: id, ru: id }, version: "1.0.0", parts: [], scope, body, requires: [], what: { en: id, ru: id }, how: "x", words: { en: [id, id], ru: [id, id] }, ...extra })
const core = tmp("core")
put(core, "lib/parts/PARTS.json", { parts: [
  T("tool-crop", "any", ["_tools/crop/x.tsx"], { parts: [{ id: "app-dialog", version: "1.0.0" }], requires: ["components/ui/button"] }),
  T("app-dialog", "any", ["components/dialog/app-dialog.client.tsx"], { requires: ["components/ui/button"] }),
  T("tool-term", "panel", ["_tools/term/x.tsx"]),
  T("table", "any", ["components/table/table.tsx"], { requires: ["sections/table.i18n"] }),
  T("tool-two", "any", ["_tools/two/a.tsx", "_tools/two/b.tsx"]),
] })
put(core, "_tools/crop/x.tsx", "export default function Crop() { return null }\n")
put(core, "_tools/crop/tool.json", { id: "crop", entry: "x.tsx", version: "1.0.0", parts: [{ id: "app-dialog", version: "1.0.0" }], scope: "any" })
put(core, "components/dialog/app-dialog.client.tsx", "export function AppDialog() { return null }\n")
put(core, "_tools/term/x.tsx", "x\n"); put(core, "components/table/table.tsx", "x\n")
put(core, "_tools/two/a.tsx", "a\n"); put(core, "_tools/two/b.tsx", "b\n")
const fresh = () => { const r = tmp("el"); put(r, "components/ui/button.tsx", "x\n"); return r }

let failed = 0
const expect = (name, ok, more = "") => { console.log(`${ok ? "✓" : "✗"} ${name}${ok ? "" : ` — ${more}`}`); if (!ok) failed++ }

let el = fresh()
let plan = planTake({ source: core, from: "core", receiver: el, tool: "tool-crop" })
expect("a tool with a part: both copied, the part first", plan.ok && plan.copies.map((c) => c.id).join(",") === "app-dialog,tool-crop", JSON.stringify(plan))
const written = doTake({ source: core, from: "core", receiver: el, plan })
const card = JSON.parse(fs.readFileSync(path.join(el, "_tools/crop/tool.json"), "utf8"))
expect("the copy's card names its source with the body's fingerprint", card.source?.from === "core" && card.source?.tool === "tool-crop" && /^[0-9a-f]{16}$/.test(card.source?.bodyHash ?? ""), JSON.stringify(card.source))
const dialogCards = JSON.parse(fs.readFileSync(path.join(el, "components/dialog/parts.json"), "utf8")).parts
expect("a component part gets its card in its folder, with its source", dialogCards.some((p) => p.id === "app-dialog" && p.source?.from === "core" && !p.body), JSON.stringify(dialogCards))
expect("the files are written", written.includes("_tools/crop/x.tsx") && written.includes("components/dialog/app-dialog.client.tsx"), written.join(", "))

el = fresh()
put(el, "lib/parts/PARTS.json", { parts: [{ ...T("app-dialog", "any", ["components/dialog/app-dialog.client.tsx"]), source: { from: "core", tool: "app-dialog", version: "1.0.0" } }] })
plan = planTake({ source: core, from: "core", receiver: el, tool: "tool-crop" })
expect("a part already here at the same version is skipped", plan.ok && plan.copies.map((c) => c.id).join(",") === "tool-crop" && plan.skipped.length === 1, JSON.stringify(plan))

el = fresh()
plan = planTake({ source: core, from: "core", receiver: el, tool: "tool-term" })
expect("a panel tool is refused", !plan.ok && /architect panel only/.test(plan.refused.join(" ")), JSON.stringify(plan.refused))
plan = planTake({ source: core, from: "core", receiver: el, tool: "table" })
expect("a missing requirement refuses, naming it", !plan.ok && /sections\/table\.i18n/.test(plan.refused.join(" ")), JSON.stringify(plan.refused))
put(el, "components/dialog/app-dialog.client.tsx", "my own\n")
plan = planTake({ source: core, from: "core", receiver: el, tool: "tool-crop" })
expect("a part the element has whole of its own stands in, not overwritten", plan.ok && plan.copies.map((c) => c.id).join(",") === "tool-crop" && /stand in/.test(plan.skipped.join(" ")), JSON.stringify(plan))
// 735 A4 (D7): the asked tool whole of the element's own (both templates carry the one modal) — an answer, not an error; nothing written.
put(el, "_tools/crop/x.tsx", "my own crop\n")
plan = planTake({ source: core, from: "core", receiver: el, tool: "tool-crop" })
expect("the asked tool whole of its own stands in: ok, nothing to copy", plan.ok && plan.copies.length === 0 && /tool-crop — the element's own files stand in/.test(plan.skipped.join(" ")), JSON.stringify(plan))
expect("…and nothing is overwritten", doTake({ source: core, from: "core", receiver: el, plan }).length === 0 && fs.readFileSync(path.join(el, "_tools/crop/x.tsx"), "utf8") === "my own crop\n")
put(el, "_tools/two/a.tsx", "my own a\n")
plan = planTake({ source: core, from: "core", receiver: el, tool: "tool-two" })
expect("a tool whose path is PARTLY held by something else refuses", !plan.ok && /_tools\/two\/a\.tsx is already here and is not/.test(plan.refused.join(" ")), JSON.stringify(plan.refused))
expect("a refused take writes nothing", fs.readFileSync(path.join(el, "_tools/two/a.tsx"), "utf8") === "my own a\n" && !fs.existsSync(path.join(el, "_tools/two/b.tsx")))
plan = planTake({ source: core, from: "core", receiver: el, tool: "nothing" })
expect("an unknown tool is refused (negative control)", !plan.ok && plan.copies.length === 0, JSON.stringify(plan))

// 733-9-2: an update. The element holds a copy of tool-crop at 1.0.0; the core moves to 1.1.0 with a new body.
el = fresh()
doTake({ source: core, from: "core", receiver: el, plan: planTake({ source: core, from: "core", receiver: el, tool: "tool-crop" }) })
const taken = JSON.parse(fs.readFileSync(path.join(el, "_tools/crop/tool.json"), "utf8")).source
const dialogSrc = JSON.parse(fs.readFileSync(path.join(el, "components/dialog/parts.json"), "utf8")).parts[0].source
const elMap = () => put(el, "lib/parts/PARTS.json", { parts: [
  { ...T("tool-crop", "any", ["_tools/crop/x.tsx"], { parts: [{ id: "app-dialog", version: "1.0.0" }] }), source: taken },
  { ...T("app-dialog", "any", ["components/dialog/app-dialog.client.tsx"]), source: dialogSrc },
] })
elMap()
const core2 = tmp("core2")
fs.cpSync(core, core2, { recursive: true })
const map2 = JSON.parse(fs.readFileSync(path.join(core2, "lib/parts/PARTS.json"), "utf8"))
map2.parts = map2.parts.map((p) => (p.id === "tool-crop" ? { ...p, version: "1.1.0", body: ["_tools/crop/x.tsx", "_tools/crop/y.ts"] } : p))
put(core2, "lib/parts/PARTS.json", map2)
put(core2, "_tools/crop/x.tsx", "export default function Crop() { return 'v1.1' }\n"); put(core2, "_tools/crop/y.ts", "export const y = 1\n")
plan = planTake({ source: core2, from: "core", receiver: el, tool: "tool-crop" })
expect("an older copy without --update is refused, naming --update", !plan.ok && /--update/.test(plan.refused.join(" ")), JSON.stringify(plan.refused))
plan = planTake({ source: core2, from: "core", receiver: el, tool: "tool-crop", update: true })
expect("--update replaces an unedited older copy; its unchanged part is skipped", plan.ok && plan.copies.map((c) => `${c.id}@${c.version}<${c.replaces}`).join(",") === "tool-crop@1.1.0<1.0.0" && /app-dialog v1\.0\.0 — already here/.test(plan.skipped.join(" ")), JSON.stringify(plan))
doTake({ source: core2, from: "core", receiver: el, plan })
const after = JSON.parse(fs.readFileSync(path.join(el, "_tools/crop/tool.json"), "utf8")).source
expect("the update writes the new body and the new source", fs.readFileSync(path.join(el, "_tools/crop/x.tsx"), "utf8").includes("v1.1") && fs.existsSync(path.join(el, "_tools/crop/y.ts")) && after.version === "1.1.0" && after.bodyHash !== taken.bodyHash, JSON.stringify(after))
el = fresh()
doTake({ source: core, from: "core", receiver: el, plan: planTake({ source: core, from: "core", receiver: el, tool: "tool-crop" }) })
elMap()
put(el, "_tools/crop/x.tsx", "export default function Crop() { return 'mine' }\n")
plan = planTake({ source: core2, from: "core", receiver: el, tool: "tool-crop", update: true })
expect("an edited copy is a fork: --update refuses it and writes nothing", !plan.ok && /fork/.test(plan.refused.join(" ")) && plan.copies.length === 0, JSON.stringify(plan))

if (failed) { console.error(`===TAKE_FAILED=== ${failed}`); process.exit(1) }
console.log("===TAKE_OK===")

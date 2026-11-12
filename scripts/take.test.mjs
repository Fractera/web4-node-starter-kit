#!/usr/bin/env node
// npm run test:take — taking a tool (733-5): the tool and the parts of its recipe, each a copy with its provenance; a part already here
// at the same version is skipped; a panel tool, a missing requirement or a taken path refuse the whole take and write nothing.
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
] })
put(core, "_tools/crop/x.tsx", "export default function Crop() { return null }\n")
put(core, "_tools/crop/tool.json", { id: "crop", entry: "x.tsx", version: "1.0.0", parts: [{ id: "app-dialog", version: "1.0.0" }], scope: "any" })
put(core, "components/dialog/app-dialog.client.tsx", "export function AppDialog() { return null }\n")
put(core, "_tools/term/x.tsx", "x\n"); put(core, "components/table/table.tsx", "x\n")
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
put(el, "_tools/crop/x.tsx", "my own crop\n")
plan = planTake({ source: core, from: "core", receiver: el, tool: "tool-crop" })
expect("the taken tool's own path held by something else refuses", !plan.ok && /already here and is not/.test(plan.refused.join(" ")), JSON.stringify(plan.refused))
expect("a refused take writes nothing", fs.readFileSync(path.join(el, "_tools/crop/x.tsx"), "utf8") === "my own crop\n" && !fs.existsSync(path.join(el, "_tools/crop/tool.json")))
plan = planTake({ source: core, from: "core", receiver: el, tool: "nothing" })
expect("an unknown tool is refused (negative control)", !plan.ok && plan.copies.length === 0, JSON.stringify(plan))

if (failed) { console.error(`===TAKE_FAILED=== ${failed}`); process.exit(1) }
console.log("===TAKE_OK===")

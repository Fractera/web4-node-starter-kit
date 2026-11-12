// THE SWEEP OF HAND-BUILT DUPLICATES (node step 725-6): `npm run parts -- --audit` — model-free. Every client component of the core is read
// against the parts map; each finding names the ready part and what the fix costs. The owner chooses what to rebuild — this only lists.
// Rules (each from a measured defect):
//   R1 a Textarea and the bare microphone in one file → VoiceTextarea (✗ 722-4: the field squeezed to one letter wide);
//   R2 an Input and the bare microphone in one file → VoiceField;
//   R3 the Table primitive with a hand search field outside components/table → TableTools (the node's table standard, 262);
//   R4 a frozen second copy of a long class string (`lib/parts/dup-debt.json`) → extract one part;
//   R5 a carded composite or a tool nobody in the core imports → keep it (an element may), or retire it — the owner's call.
import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { execFileSync } from "node:child_process"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { loadMap } from "../lib/parts/parts-find.mjs"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const VOICE = /from\s+["']@\/_tools\/voice-input\/client\/(voice-input\.client|use-voice-recorder)["']/
const has = (src, mod) => new RegExp(`from\\s+["']@/components/ui/${mod}["']`).test(src)

export function audit(root = ROOT, files) {
  const list = files ?? execFileSync("git", ["ls-files", "-co", "--exclude-standard", "app", "components", "sections"], { cwd: root, encoding: "utf8" })
    .split("\n").filter((f) => f.endsWith(".tsx") && !/^components\/(ui|ai-elements|form|table)\//.test(f) && !/\/_agent-kit\//.test(f) && existsSync(join(root, f)))
  const out = []
  for (const f of list) {
    const src = readFileSync(join(root, f), "utf8")
    if (has(src, "textarea") && VOICE.test(src)) out.push({ rule: "R1", file: f, part: "VoiceTextarea (components/form/voice-textarea.client.tsx)", cost: "small — one component replaces the pair" })
    if (has(src, "input") && VOICE.test(src)) out.push({ rule: "R2", file: f, part: "VoiceField (components/form/voice-field.client.tsx)", cost: "small" })
    if (has(src, "table") && has(src, "input") && /filter\(|toLowerCase\(\)\.includes/.test(src))
      out.push({ rule: "R3", file: f, part: "TableTools (components/table/table-tools.client.tsx)", cost: "medium — columns and search keys move into TableTools" })
  }
  const debtFile = join(root, "lib", "parts", "dup-debt.json")
  const debt = existsSync(debtFile) ? JSON.parse(readFileSync(debtFile, "utf8")).groups ?? {} : {}
  for (const [classes, fl] of Object.entries(debt))
    out.push({ rule: "R4", file: fl.join(" + "), part: `one part for «${classes.slice(0, 70)}${classes.length > 70 ? "…" : ""}»`, cost: `medium — ${fl.length} copies` })
  for (const p of loadMap(root).filter((p) => (p.kind === "composite" || p.kind === "tool") && !p.internal && !(p.usedBy ?? []).length))
    out.push({ rule: "R5", file: p.path, part: `${p.title ?? p.export} — imported by nobody outside its own folder in the core`, cost: "a decision, no code" })
  return out
}

const RULES = { R1: "textarea + bare microphone", R2: "input + bare microphone", R3: "table with a hand search", R4: "second copies", R5: "unused parts" }
export function report(findings) {
  const by = (r) => findings.filter((x) => x.rule === r)
  const lines = [`# The parts sweep of the core — ${new Date().toISOString().slice(0, 10)} (node step 725-6, \`npm run parts -- --audit\`)`, "",
    "Model-free: every client component read against the parts map (`lib/parts/PARTS.json`). Nothing is rebuilt here — the owner chooses.", ""]
  for (const r of Object.keys(RULES)) {
    lines.push(`## ${r} — ${RULES[r]} (${by(r).length})`, "")
    if (!by(r).length) lines.push("- none", "")
    for (const x of by(r)) lines.push(`- \`${x.file}\` → ${x.part} · ${x.cost}`)
    lines.push("")
  }
  return lines.join("\n")
}

if (process.argv[1]?.endsWith("parts-audit.mjs")) {
  const f = audit()
  const text = report(f)
  if (process.argv.includes("--write")) {
    const file = join(ROOT, "development-docs", "reports", `feature-parts-sweep-${new Date().toISOString().slice(0, 10)}.md`)
    writeFileSync(file, text)
    console.log(`===PARTS_AUDIT_WRITTEN=== ${file.slice(ROOT.length + 1)} · ${f.length} findings`)
  } else console.log(text)
}

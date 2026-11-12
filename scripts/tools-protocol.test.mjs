#!/usr/bin/env node
// npm run test:tools-protocol [-- <custom|native> [<vX.Y.Z>]] — A NEWBORN OF EVERY TEMPLATE CAN TAKE EVERY «ANY» TOOL OF THE CORE (step 735 A1).
// The owner, 2026-11-12: «новый элементы рождаются без инструментов. – Иногда когда приходит задача они получают инструменты и других
// элементов … – Система работает чётко и эффективно». Measured the same day: a newborn custom could take 7 of the core's 13 «any» tools,
// a newborn native 4 — the voice tools hung on an internal icon, the table on a dictionary of the core's section layer, the modal read
// «already here and is not app-dialog», the natives lacked three libraries. Nothing said so: the take was never asked in a build.
// 🔒 WHAT A BIRTH GETS IS WHAT IS ASKED: for each template whose working clone is on this machine (`data/workshop/<repo>`, else
// `../<repo>` — the author's workshop) the tag is unpacked into a temp folder (`git archive`) and the core's take planner
// (`lib/parts/take.mjs`, nothing written) is asked for every «any» tool of the core's map. Green only when every tool is takeable — copied,
// or the element's own files stand in.
// 🔒 A PERSON'S NODE HAS NO WORKSHOP: no clone holding the tag → that kind is SKIPPED, exit 0. `npm run template -- pin` runs it for the
// version it is about to pin: a template whose newborn cannot take a tool is not pinned.
import { execFileSync } from "node:child_process"
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { planTake } from "../lib/parts/take.mjs"

const ROOT = resolve(import.meta.dirname, "..")
const KINDS = { custom: "item-template.json", native: "native-template.json" }
const [onlyKind, onlyVersion] = process.argv.slice(2)
if (onlyKind && !KINDS[onlyKind]) { console.log(`===TOOLS_PROTOCOL_USAGE=== npm run test:tools-protocol [-- <custom|native> [<vX.Y.Z>]]`); process.exit(1) }

const git = (dir, argv) => execFileSync("git", ["-C", dir, ...argv], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], windowsHide: true }).trim()
const hasTag = (dir, tag) => { try { git(dir, ["rev-parse", "--verify", "-q", `${tag}^{commit}`]); return true } catch { return false } }
const map = JSON.parse(readFileSync(join(ROOT, "lib", "parts", "PARTS.json"), "utf8")).parts ?? []
const tools = map.filter((p) => p.kind === "tool" && p.scope === "any")

const lines = []
const red = []
let checked = 0
for (const kind of onlyKind ? [onlyKind] : Object.keys(KINDS)) {
  const pin = JSON.parse(readFileSync(join(ROOT, "WEB4-ITEMS-REGISTRY", KINDS[kind]), "utf8"))
  const version = onlyVersion ?? pin.version
  const clone = [join(ROOT, "data", "workshop", pin.from), resolve(ROOT, "..", pin.from)].find((d) => existsSync(join(d, ".git")) && hasTag(d, version))
  if (!clone) { console.log(`· ${kind} ${version}: no working clone holding the tag on this machine — skipped`); continue }
  const tmp = mkdtempSync(join(tmpdir(), `tools-protocol-${kind}-`))
  try {
    const tar = join(tmp, ".born.tar")
    git(clone, ["archive", "--format=tar", "-o", tar, version])
    execFileSync("tar", ["-xf", tar, "-C", tmp], { stdio: "ignore", windowsHide: true })
    rmSync(tar)
    // 735 D13: the installer's `# kind:` sticks to every variable after it — an ELEMENT_KEY block put before SETTINGS_SECRET gave the
    // node key of 8 natives an element key's value and their doors answered 401. Only ELEMENT_KEY may be of kind element-key.
    if (existsSync(join(tmp, ".env.example"))) {
      let k = null
      for (const l of readFileSync(join(tmp, ".env.example"), "utf8").split(/\r?\n/)) {
        const m = l.match(/^#\s*kind:\s*(\S+)\s*$/); if (m) { k = m[1]; continue }
        const v = l.match(/^([A-Z_][A-Z0-9_]*)=/)
        if (v && k === "element-key" && v[1] !== "ELEMENT_KEY") red.push(`${kind} ${version} · .env.example: ${v[1]} falls under «# kind: element-key» — it would get the element's key; start its group with its own # kind:`)
      }
    }
    let ok = 0
    for (const t of tools) {
      const plan = planTake({ source: ROOT, from: "core", receiver: tmp, tool: t.id })
      if (plan.ok) ok++
      else red.push(`${kind} ${version} · ${t.id}: ${plan.refused.join(" | ")}`)
    }
    checked++
    lines.push(`${kind} ${ok}/${tools.length}`)
    console.log(`${ok === tools.length ? "✓" : "✗"} ${kind} ${version} (${clone}): ${ok} of ${tools.length} «any» tools takeable`)
  } finally {
    rmSync(tmp, { recursive: true, force: true })
  }
}

if (!checked) { console.log("===TOOLS_PROTOCOL_SKIPPED=== no template clone with its tag on this machine (a person's node has no workshop)"); process.exit(0) }
if (red.length) {
  for (const r of red) console.error(`  ✗ ${r}`)
  console.error(`===TOOLS_PROTOCOL_FAILED=== ${lines.join(", ")} — a newborn of this template cannot take these tools of the core`)
  process.exit(1)
}
console.log(`===TOOLS_PROTOCOL_OK=== ${lines.join(", ")}`)

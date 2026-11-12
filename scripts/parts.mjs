// npm run parts -- <words> [--kind tool|composite|primitive|section] [--as <element id>] — the ready parts of this project for a person or a script, the same
// answer as the tool parts_find of a build session (node step 725-2, lib/parts/parts-find.mjs).
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { findParts, partsText } from "../lib/parts/parts-find.mjs"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const args = process.argv.slice(2)
if (args.includes("--audit")) {
  const { audit, report } = await import("./parts-audit.mjs")
  console.log(report(audit()))
  process.exit(0)
}
const ki = args.indexOf("--kind")
const kinds = ki >= 0 ? [args[ki + 1]] : undefined
// 733-4: `--as <element id>` — the same search as that element's build session sees it: its own map, then the node's tools.
const ai = args.indexOf("--as")
const as = ai >= 0 ? args[ai + 1] : null
const query = args.filter((a, i) => a !== "--kind" && i !== ki + 1 && a !== "--as" && i !== ai + 1).join(" ").trim()
if (!query) {
  console.log("npm run parts -- <what you are about to build> [--kind tool|composite|primitive|section]")
  process.exit(1)
}
let here = ROOT
let node = []
if (as) {
  const { createRequire } = await import("node:module")
  const req = createRequire(import.meta.url)
  const paths = req("../lib/web4-items/paths.cjs")
  const entry = (JSON.parse((await import("node:fs")).readFileSync(paths.REGISTRY_FILE, "utf8")).services ?? []).find((s) => s.id === as)
  if (!entry) { console.log(`no element «${as}» in the registry`); process.exit(1) }
  here = paths.itemDir(entry.id, entry.kind)
  node = (await import("../lib/parts/node-index.mjs")).nodeTools(ROOT, here)
}
console.log(partsText(await findParts(here, { query, kinds, node }), query))

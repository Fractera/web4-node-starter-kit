#!/usr/bin/env node
// npm run test:usage-ledger — AN ELEMENT'S PAID CALL REACHES THE NODE'S LEDGER (step 735 B1b, defect D9).
// Measured 2026-11-12: an element runs as a Next standalone server that moves into its build folder (`process.chdir(__dirname)` of its
// `server.js`), so its ledger lines landed in `.next/standalone/data/node/usage/`, were wiped by every rebuild, and `npm run money` —
// which read only the core's folder — never showed one. Now an element's process writes `<SERVICE_DATA_DIR>/usage/` and money reads
// every `data/services/<id>/usage/`. Proven with real processes in a temp node: the element's line is seen under its id; the same
// process WITHOUT SERVICE_DATA_DIR (the old behaviour — the negative control) leaves its line in its build folder, unseen.
import { execFileSync } from "node:child_process"
import { existsSync, mkdirSync, mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"

const ROOT = resolve(import.meta.dirname, "..")
const LEDGER = join(ROOT, "lib", "usage-ledger.cjs")
const node = mkdtempSync(join(tmpdir(), "usage-ledger-"))
const dataDir = join(node, "data", "services", "zz1")
const standalone = join(node, "WEB4-ITEMS", "user", "zz1", ".next", "standalone")
mkdirSync(dataDir, { recursive: true })
mkdirSync(standalone, { recursive: true })
const day = new Date().toISOString().slice(0, 10)

const env = (extra) => { const e = { ...process.env, ...extra }; if (!extra.SERVICE_DATA_DIR) delete e.SERVICE_DATA_DIR; return e }
const call = (cwd, extra, who) => execFileSync(process.execPath, ["-e", `require(${JSON.stringify(LEDGER)}).recordOk({ who: ${JSON.stringify(who)}, endpoint: "audio/transcriptions", model: "m" })`], { cwd, env: env(extra), stdio: "ignore" })
const money = () => JSON.parse(execFileSync(process.execPath, [join(ROOT, "scripts", "money.mjs"), "--json", "--day", day], { cwd: node, env: env({}), encoding: "utf8" }))

const bad = []
try {
  call(standalone, { SERVICE_DATA_DIR: dataDir }, "voice-input")
  if (!existsSync(join(dataDir, "usage", `${day}.jsonl`))) bad.push("an element's process with SERVICE_DATA_DIR wrote nothing into <SERVICE_DATA_DIR>/usage/")
  call(standalone, {}, "lost-call")
  if (!existsSync(join(standalone, "data", "node", "usage", `${day}.jsonl`))) bad.push("negative control: without SERVICE_DATA_DIR the line should stay in the process folder")
  call(node, {}, "core-call")
  const rows = money().rows
  const el = rows.find((r) => r.element === "zz1" && r.who === "voice-input")
  if (!el || el.calls !== 1) bad.push(`npm run money does not show the element's call under its id: ${JSON.stringify(rows)}`)
  if (rows.some((r) => r.who === "lost-call")) bad.push("npm run money shows a line left in a build folder — the negative control does not hold")
  if (!rows.some((r) => r.who === "core-call" && !r.element)) bad.push(`npm run money lost the core's own line: ${JSON.stringify(rows)}`)
} finally {
  rmSync(node, { recursive: true, force: true })
}
if (bad.length) {
  for (const b of bad) console.error(`  ✗ ${b}`)
  console.error(`===USAGE_LEDGER_FAILED=== ${bad.length}`)
  process.exit(1)
}
console.log("===USAGE_LEDGER_OK=== an element's paid call lands in its data folder and npm run money names it; a line left in a build folder is not seen (the old place)")

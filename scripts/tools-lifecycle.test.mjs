#!/usr/bin/env node
// npm run test:tools-lifecycle [-- --keep] — THE WHOLE TOOL CYCLE ON THIS NODE, NO MODEL (step 735, the proof of stage B).
// The owner, 2026-11-12: «новый элементы рождаются без инструментов. – Иногда когда приходит задача они получают инструменты и других
// элементов. А потом иногда они их улучшают под себя – Если подходящее инструментов не существуют, то они их создают. – Система работает
// чётко и эффективно». Two throwaway custom elements are born by the node's own `create`, every act runs through the element's own
// `npm run` (never by reading its code), and both are deleted through the core's door at the end (`--keep` leaves them for a look).
// 🔒 It births real elements (a port, a process, a build each, a few minutes) — so it never runs in a prebuild: by hand on a node.
//   G1  a newborn's `_tools/` holds `.gitkeep` only
//   G2  it takes a core tool (`tool:take`), its maps and type check stay green; an edited copy is red until `tool:own` makes it its own
//   G3  it bears a tool (`tool:new`); the neighbour finds it (`parts -- --as`) and takes it (`tool:take --from`)
import { spawnSync } from "node:child_process"
import { appendFileSync, existsSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs"
import { createRequire } from "node:module"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"

const ROOT = resolve(import.meta.dirname, "..")
const require = createRequire(import.meta.url)
const KEEP = process.argv.includes("--keep")
const NPM = process.platform === "win32" ? "npm.cmd" : "npm"
const born = []
const say = (line) => console.log(line)
const npm = (cwd, args, timeout = 30 * 60_000) => {
  const r = spawnSync(NPM, ["run", "--silent", ...args], { cwd, encoding: "utf8", timeout, windowsHide: true, env: { ...process.env, FORCE_COLOR: "0" } })
  return { code: r.status, out: `${r.stdout ?? ""}${r.stderr ?? ""}` }
}
const stop = (step, why, out = "") => { throw Object.assign(new Error(`${step}: ${why}`), { out }) }
const tscErrors = (dir) => {
  const r = spawnSync(process.platform === "win32" ? "npx.cmd" : "npx", ["tsc", "--noEmit", "-p", "."], { cwd: dir, encoding: "utf8", timeout: 10 * 60_000, windowsHide: true })
  return `${r.stdout ?? ""}${r.stderr ?? ""}`.split("\n").filter((l) => /error TS/.test(l) && !l.startsWith(".next/")).length
}
const port = () => JSON.parse(readFileSync(join(ROOT, "logs", "runtime.json"), "utf8")).port
const folderOf = (id) => {
  const paths = require(join(ROOT, "lib", "web4-items", "paths.cjs"))
  const entry = (JSON.parse(readFileSync(join(ROOT, "WEB4-ITEMS-REGISTRY", "web4-items.json"), "utf8")).services ?? []).find((s) => s.id === id)
  return entry ? paths.entryDir(entry) : null
}

function birth(letter) {
  const vector = join(mkdtempSync(join(tmpdir(), "lifecycle-")), "vector.md")
  writeFileSync(vector, `A throwaway element of the tool lifecycle proof (node step 735, element ${letter}). It is deleted at the end of the test.\n`)
  const r = npm(ROOT, ["create", "--", "--role", `Throwaway element ${letter} of the tool lifecycle proof`, "--name", `Проба инструментов ${letter}`,
    "--vector-file", vector, "--brief", "Nothing to build: the node's tool lifecycle test runs its commands and deletes it.", "--look", "project",
    "--different", "a throwaway element of the tool lifecycle proof (735), deleted at its end", "--boundary", "control", "--no-wake"])
  const id = /draft ([a-z0-9]{5}) — birth starts/.exec(r.out)?.[1]
  if (id) born.push(id)
  if (r.code !== 0 || !id) stop(`birth ${letter}`, `npm run create exited ${r.code}`, r.out)
  const dir = folderOf(id)
  if (!dir || !existsSync(join(dir, "package.json"))) stop(`birth ${letter}`, `no folder for ${id}`)
  return { id, dir }
}

try {
  say("· birth of A and B (a few minutes each) …")
  const A = birth("A")
  const B = birth("B")
  say(`  A = ${A.id}, B = ${B.id}`)

  // G1 — born without tools.
  for (const e of [A, B]) {
    const tools = existsSync(join(e.dir, "_tools")) ? readdirSync(join(e.dir, "_tools")) : []
    if (tools.join(",") !== ".gitkeep") stop("G1", `${e.id}/_tools holds ${tools.join(", ") || "nothing"}`)
  }
  say("===G1_BORN_EMPTY_OK=== both newborns: _tools/ holds .gitkeep only")

  // G2 — take a core tool; the maps and the type check stay green.
  const before = tscErrors(A.dir)
  let r = npm(A.dir, ["tool:take", "--", "voice-textarea"])
  if (r.code !== 0 || !/===TAKE_OK===/.test(r.out)) stop("G2 take", "tool:take voice-textarea did not pass", r.out)
  for (const s of ["build:tools-map", "build:parts-map", "check:parts-map", "check:shadcn-parts"]) {
    r = npm(A.dir, [s])
    if (r.code !== 0) stop(`G2 ${s}`, "red after the take", r.out)
  }
  const after = tscErrors(A.dir)
  if (after > before) stop("G2 tsc", `the take added ${after - before} type error(s)`)
  say(`===G2_TAKE_OK=== A took voice-textarea with its recipe; maps, check:shadcn-parts green; type errors outside .next ${before} → ${after}`)

  // G2 — improve: an edited copy is red; tool:own makes it A's own, the edit kept.
  const file = join(A.dir, "components", "form", "voice-textarea.client.tsx")
  appendFileSync(file, "// edited by the lifecycle test (735)\n")
  r = npm(A.dir, ["check:parts-map"])
  if (r.code === 0 || !/was edited/.test(r.out)) stop("G2 edit", "an edited copy is not red", r.out)
  r = npm(A.dir, ["tool:own", "--", "voice-textarea", "--as", "tool-voice-note"])
  if (r.code !== 0 || !/===TOOL_OWN_OK===/.test(r.out)) stop("G2 own", "tool:own did not pass", r.out)
  r = npm(A.dir, ["check:parts-map"])
  if (r.code !== 0) stop("G2 own", "check:parts-map red after tool:own", r.out)
  if (!readFileSync(file, "utf8").includes("edited by the lifecycle test")) stop("G2 own", "the edit was lost")
  say("===G2_IMPROVE_OK=== the edited copy was red («was edited»); tool:own made it A's tool-voice-note; green; the edit kept")

  // G3 — create; the neighbour finds it and takes it.
  r = npm(A.dir, ["tool:new", "--", "demo-counter", "count clicks on a button and show the number"])
  if (r.code !== 0 || !/===TOOL_NEW_OK===/.test(r.out)) stop("G3 new", "tool:new did not pass", r.out)
  for (const s of ["check:tools-map", "check:parts-map"]) { r = npm(A.dir, [s]); if (r.code !== 0) stop(`G3 ${s}`, "red after tool:new", r.out) }
  say("===G3_CREATE_OK=== A bore tool-demo-counter with its complete card; maps green")
  r = npm(ROOT, ["parts", "--", "--as", B.id, "count clicks on a button"])
  if (!new RegExp(`Lives in the element «${A.id}».*tool:take -- tool-demo-counter --from ${A.id}`, "s").test(r.out)) stop("G3 find", `B does not find A's tool`, r.out)
  r = npm(B.dir, ["tool:take", "--", "tool-demo-counter", "--from", A.id])
  if (r.code !== 0 || !/===TAKE_OK===/.test(r.out)) stop("G3 take", "B could not take A's tool", r.out)
  const card = JSON.parse(readFileSync(join(B.dir, "_tools", "tool-demo-counter", "tool.json"), "utf8"))
  if (card.source?.from !== A.id) stop("G3 take", `B's copy names its source ${JSON.stringify(card.source)}`)
  if (!existsSync(join(ROOT, "data", "node", "parts-index.json"))) stop("G3 index", "data/node/parts-index.json was not written")
  say(`===G3_NEIGHBOUR_OK=== B found A's tool («Lives in the element ${A.id}») and took it (source ${A.id}); the node's index exists`)
  say("===TOOLS_LIFECYCLE_OK=== G1 G2 G3")
} catch (e) {
  console.error(`===TOOLS_LIFECYCLE_FAILED=== ${e.message}`)
  if (e.out) console.error(String(e.out).split("\n").slice(-25).join("\n"))
  process.exitCode = 1
} finally {
  if (KEEP) say(`· kept: ${born.join(", ") || "nothing"} (delete them in the panel or by the door)`)
  else for (const id of born) {
    try {
      const base = `http://127.0.0.1:${port()}/api/architect/items/${id}`
      const g = await (await fetch(base)).json()
      const d = await fetch(base, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ confirm: g.address }) })
      say(`· ${id} deleted through the core's door: ${d.status}`)
    } catch (err) { console.error(`· ${id} NOT deleted (${err instanceof Error ? err.message : err}) — delete it in the panel`) }
  }
}

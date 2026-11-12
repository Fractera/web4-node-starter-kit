// TAKE A TOOL — A COPY WITH ITS PROVENANCE (node step 733-5). The owner, 2026-11-12: «Да, рецепт со ссылками» — a tool is kept once and
// a combination is a recipe; «взять — команда ядра без модели». An element asks; the core copies the tool and the parts of its recipe it
// lacks into the element's folder, each as its own copy; the element's agent commits them (its repository, its decision).
// 🔒 NEVER SILENT, NEVER HALF: a «panel» tool, a requirement the element does not have, or a path the element already holds with something
// else — the whole take is refused with the reason, nothing is written. A part already there at the same version is not copied again.
// 🔒 THE BODY IS NOT EDITED AFTER: the copy's card says `source` { from, tool, version, bodyHash } — a changed body is a fork (733-9).
// 🔒 Tools come from the core or a neighbour of this node only — never from another node (the owner: «этого не будет категорически»).
import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync, rmSync } from "node:fs"
import { dirname, join } from "node:path"
import { bodyHash } from "./parts-map.mjs"

const loadParts = (dir) => {
  const f = join(dir, "lib", "parts", "PARTS.json")
  return existsSync(f) ? JSON.parse(readFileSync(f, "utf8")).parts ?? [] : []
}
const has = (dir, k) => ["", ".tsx", ".ts", ".mjs", ".js", "/index.ts", "/index.tsx"].some((x) => existsSync(join(dir, k + x)))

// The fingerprint lives with the map (733-9): the element's own parts code carries it without this file.
export { bodyHash }

/**
 * What a take would do — or why it cannot. `source` — the folder the tool lives in (the core or a neighbour), `from` its name;
 * `receiver` — the element's folder. Returns { ok, copies: [{ id, version, files, card }], skipped, refused }.
 */
export function planTake({ source, from, receiver, tool, update = false }) {
  const srcParts = loadParts(source)
  const byId = new Map(srcParts.filter((p) => p.kind === "tool").map((p) => [p.id, p]))
  const mine = new Map(loadParts(receiver).filter((p) => p.kind === "tool").map((p) => [p.source?.tool ?? p.id, p]))
  const root = byId.get(tool)
  if (!root) return { ok: false, copies: [], skipped: [], refused: [`no tool «${tool}» in ${from}`] }
  const order = []
  const seen = new Set()
  const walk = (id) => {
    if (seen.has(id)) return
    seen.add(id)
    const t = byId.get(id)
    if (!t) { order.push({ missing: id }); return }
    for (const x of t.parts ?? []) walk(x.id)
    order.push(t)
  }
  walk(tool)
  const refused = []
  const copies = []
  const skipped = []
  for (const t of order) {
    if (t.missing) { refused.push(`«${t.missing}» is in the recipe but not in ${from}`); continue }
    if (t.scope !== "any") { refused.push(`«${t.id}» lives in the core's architect panel only (scope ${t.scope ?? "?"})`); continue }
    const isRoot = t.id === tool
    const held = mine.get(t.id)
    if (held?.source && held.source.version === t.version) { skipped.push(`${t.id} v${t.version} — already here`); continue }
    // 733-9-2: AN UPDATE replaces a copy only while it is still its source's body (`source.bodyHash` = its body now) — an edited copy is a
    // fork and is never overwritten; the element's own tool of the same id is never touched. The parts of its recipe update with it.
    const fork = held?.source && Array.isArray(held.body) && held.body.length && bodyHash(receiver, held.body.filter((f) => existsSync(join(receiver, f)))) !== held.source.bodyHash
    if (update && held?.source && held.source.from === from && !fork) {
      const files = Array.isArray(t.body) ? t.body : []
      if (!files.length) { refused.push(`«${t.id}»: no measured body in ${from}'s map`); continue }
      const missing = (t.requires ?? []).filter((k) => !has(receiver, k) && !order.some((o) => o.body?.some((f) => f.replace(/\.(tsx?|jsx?|mjs)$/, "") === k)))
      if (missing.length) refused.push(`«${t.id}» requires what this element does not have: ${missing.join(", ")}`)
      copies.push({ id: t.id, version: t.version, files, card: t, replaces: held.source.version, stale: (held.body ?? []).filter((f) => !files.includes(f)) })
      continue
    }
    if (update && fork) { refused.push(`«${t.id}»: the copy here was edited after the take — it is a fork, not updated; undo the edit or make it your own tool`); continue }
    if (held && isRoot) { refused.push(`«${t.id}» is already here (${held.source ? `a copy at ${held.source.version}; ${from} has ${t.version} — npm run tool:take -- ${t.id} --update` : "its own"}) — not taken twice`); continue }
    if (held) { skipped.push(`${t.id} — the element's own ${held.source ? `copy at ${held.source.version}` : "tool"} stands in (not overwritten)`); continue }
    const files = Array.isArray(t.body) ? t.body : []
    if (!files.length) { refused.push(`«${t.id}»: no measured body in ${from}'s map`); continue }
    const present = files.filter((f) => existsSync(join(receiver, f)))
    // A part of the recipe the element already has whole, uncarded or carded otherwise — its own stands in, nothing is overwritten.
    // 735 A4 (D7): the asked tool itself too — both templates carry the one modal as their own component, and «take app-dialog» read
    // like an error («is already here and is not …»); it is an answer: «yours stands in». Only a PARTIAL presence stays a refusal below.
    if (present.length === files.length) { skipped.push(`${t.id} — the element's own files stand in (${files.join(", ")}; not overwritten)`); continue }
    for (const f of present) refused.push(`${f} is already here and is not «${t.id}» — the element decides what it is first`)
    const missing = (t.requires ?? []).filter((k) => !has(receiver, k) && !order.some((o) => o.body?.some((f) => f.replace(/\.(tsx?|jsx?|mjs)$/, "") === k)))
    if (missing.length) refused.push(`«${t.id}» requires what this element does not have: ${missing.join(", ")}`)
    copies.push({ id: t.id, version: t.version, files, card: t })
  }
  return { ok: refused.length === 0, copies, skipped, refused }
}

/** Do the take planned above: copy the bodies, write each copy's card with its source. Returns the files written. */
export function doTake({ source, from, receiver, plan }) {
  const written = []
  for (const c of plan.copies) {
    // An update: a file the old body had and the new one has not goes (it was the source's, never the element's).
    for (const f of c.stale ?? []) { try { rmSync(join(receiver, f)); written.push(`- ${f}`) } catch { /* already gone */ } }
    for (const f of c.files) {
      mkdirSync(dirname(join(receiver, f)), { recursive: true })
      copyFileSync(join(source, f), join(receiver, f))
      written.push(f)
    }
    const provenance = { from, tool: c.id, version: c.version, bodyHash: bodyHash(source, c.files) }
    const toolDir = /^_tools\/([^/]+)\//.exec(c.files[0])
    if (toolDir && existsSync(join(source, "_tools", toolDir[1], "tool.json"))) {
      const card = JSON.parse(readFileSync(join(source, "_tools", toolDir[1], "tool.json"), "utf8"))
      const dest = join(receiver, "_tools", toolDir[1], "tool.json")
      writeFileSync(dest, JSON.stringify({ ...card, source: provenance }, null, 2) + "\n")
      written.push(`_tools/${toolDir[1]}/tool.json`)
    } else {
      const folder = dirname(c.files[0])
      const file = join(receiver, folder, "parts.json")
      const data = existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : { _: "Cards of the reusable parts of this folder. One card per part; the map is lib/parts/PARTS.json.", parts: [] }
      const { usedBy, body, requires, where, score, ...card } = c.card
      data.parts = [...(data.parts ?? []).filter((p) => p.id !== c.id), { ...card, source: provenance }]
      mkdirSync(dirname(file), { recursive: true })
      writeFileSync(file, JSON.stringify(data, null, 2) + "\n")
      written.push(`${folder}/parts.json`)
    }
  }
  return written
}

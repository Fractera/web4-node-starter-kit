// THE NODE'S INDEX OF TOOLS (node step 733-4). The owner, 2026-11-12: an element looks for a tool in itself first, and only then in the
// core and its neighbours; «Найти — функция без агента»: no model and no main agent — a read of maps, metadata only, never code.
// 🔒 WHAT IS SEEN: the core's tools of scope «any» (a «panel» tool lives in the architect panel only), and — on a single-project node —
// the tools of the other elements, read from their own maps `lib/parts/PARTS.json`. On an app factory (projects of different owners) a
// neighbour's tools are not shown: exchange between owners is not part of this step.
// 🔒 NO TOOL EVER COMES FROM ANOTHER NODE: the owner, 2026-11-12 — «Внимание этого не будет категорически ошибка».
// 🔒 A CACHE BY THE MAPS' TIMES: `data/node/parts-index.json` keeps every element's extract with the mtime of its map; an unchanged map is
// not read again — a thousand elements cost a thousand `stat` calls, not a thousand parses.
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs"
import { createRequire } from "node:module"
import { dirname, join, resolve } from "node:path"

const require = createRequire(import.meta.url)

// The rule of `lib/web4-items/paths.cjs` (`WEB4-ITEMS/<kind>/<address>`, else `<id>`), counted from the CORE's folder: paths.cjs counts
// from the process's cwd, and parts_find runs in an element's folder — there it would look for the neighbours inside the element.
const LABEL = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/
function itemDir(core, id, kind) {
  const base = join(core, "WEB4-ITEMS", kind === "core" || kind === "user" ? kind : "core")
  let a = null
  try { a = JSON.parse(readFileSync(join(core, "data", "services", id, "address.json"), "utf8")).address } catch { /* no address file */ }
  if (typeof a === "string" && LABEL.test(a) && a !== id && existsSync(join(base, a))) return join(base, a)
  return join(base, id)
}

/** What a found tool tells an agent of another repository: what it is, what it is made of, where it lives — no paths into code to open. */
function extract(p, owner) {
  return { id: p.id, kind: "tool", title: p.title, what: p.what, how: p.how, words: p.words, version: p.version, parts: p.parts ?? [],
    scope: p.scope, needs: p.needs, path: p.path, usedBy: [], where: owner }
}

function toolsOf(dir) {
  const file = join(dir, "lib", "parts", "PARTS.json")
  if (!existsSync(file)) return { mtime: 0, tools: [] }
  const mtime = statSync(file).mtimeMs
  const parts = JSON.parse(readFileSync(file, "utf8")).parts ?? []
  return { mtime, tools: parts.filter((p) => p.kind === "tool") }
}

/**
 * The tools an element may take, besides its own: the core's «any» tools and, on a single-project node, its neighbours' tools.
 * `asker` — the element's folder (its own map is searched apart, first). Every entry says `where`: { owner: "core" | <element id> }.
 */
export function nodeTools(core, asker) {
  const out = []
  for (const p of toolsOf(core).tools) if (p.scope === "any") out.push(extract(p, { owner: "core" }))
  let type = "project"
  try { type = require(join(core, "lib", "web4-items", "node-type.cjs")).readNodeType(core) } catch { /* no reader — a single project */ }
  if (type !== "project") return out
  let services = []
  try { services = JSON.parse(readFileSync(join(core, "WEB4-ITEMS-REGISTRY", "web4-items.json"), "utf8")).services ?? [] } catch { return out }
  const cacheFile = join(core, "data", "node", "parts-index.json")
  let cache = {}
  try { cache = JSON.parse(readFileSync(cacheFile, "utf8")) } catch { /* first run */ }
  let changed = false
  const me = asker ? resolve(asker) : ""
  for (const s of services) {
    const dir = itemDir(core, s.id, s.kind)
    if (!dir || resolve(dir) === me) continue
    const file = join(dir, "lib", "parts", "PARTS.json")
    if (!existsSync(file)) continue
    const mtime = statSync(file).mtimeMs
    if (cache[s.id]?.mtime !== mtime) {
      cache[s.id] = { mtime, tools: toolsOf(dir).tools.map((p) => extract(p, { owner: s.id })) }
      changed = true
    }
    out.push(...cache[s.id].tools)
  }
  if (changed) {
    try { mkdirSync(dirname(cacheFile), { recursive: true }); writeFileSync(cacheFile, JSON.stringify(cache) + "\n") } catch { /* a cache is a speed, not a truth */ }
  }
  return out
}

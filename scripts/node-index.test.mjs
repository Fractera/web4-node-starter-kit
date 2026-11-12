#!/usr/bin/env node
// npm run test:node-index — the node's index of tools (733-4): an element finds its own tool first, then the core's «any» tools and,
// on a single-project node, its neighbours' tools; a «panel» tool is never offered; an app factory hides the neighbours.
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { nodeTools } from "../lib/parts/node-index.mjs"
import { findParts, partsText } from "../lib/parts/parts-find.mjs"

const HERE = path.dirname(fileURLToPath(import.meta.url))
const core = fs.mkdtempSync(path.join(os.tmpdir(), "node-index-"))
const put = (rel, data) => { fs.mkdirSync(path.dirname(path.join(core, rel)), { recursive: true }); fs.writeFileSync(path.join(core, rel), typeof data === "string" ? data : JSON.stringify(data)) }
const tool = (id, scope, en, ru, words) => ({ id, kind: "tool", path: `_tools/${id}/x.tsx`, title: { en, ru }, version: "1.0.0", parts: [], scope,
  what: { en: `${en} — a tool that does it for a person with its own window.`, ru: `${ru} — инструмент со своим окном.` }, how: "Open it.", words: { en: words, ru: words } })
put("lib/parts/PARTS.json", { parts: [tool("tool-crop", "any", "Image cropping", "Обрезка изображения", ["crop image", "обрезка картинки"]), tool("tool-term", "panel", "Terminal drawer", "Терминал", ["terminal", "терминал"])] })
fs.mkdirSync(path.join(core, "lib/web4-items"), { recursive: true })
fs.copyFileSync(path.join(HERE, "../lib/web4-items/node-type.cjs"), path.join(core, "lib/web4-items/node-type.cjs"))
const registry = (nodeType) => put("WEB4-ITEMS-REGISTRY/web4-items.json", { nodeType, services: [{ id: "a", kind: "user" }, { id: "b", kind: "user" }] })
put("WEB4-ITEMS/user/a/lib/parts/PARTS.json", { parts: [tool("qr-code", "any", "QR code", "QR-код", ["qr code", "qr код"])] })
put("WEB4-ITEMS/user/b/lib/parts/PARTS.json", { parts: [tool("map-pin", "any", "Address to a map point", "Адрес в точку на карте", ["map point", "точка на карте"])] })
const A = path.join(core, "WEB4-ITEMS/user/a")

let failed = 0
const expect = (name, ok, more = "") => { console.log(`${ok ? "✓" : "✗"} ${name}${ok ? "" : ` — ${more}`}`); if (!ok) failed++ }

registry("project")
let ids = nodeTools(core, A).map((t) => `${t.where.owner}:${t.id}`)
expect("a single project: the core's «any» tool and the neighbour's tool", ids.includes("core:tool-crop") && ids.includes("b:map-pin"), ids.join(", "))
expect("a «panel» tool is never offered", !ids.some((i) => i.endsWith("tool-term")), ids.join(", "))
expect("its own tools are not in the node's list", !ids.some((i) => i.startsWith("a:")), ids.join(", "))
expect("the cache is written by the maps' times", fs.existsSync(path.join(core, "data/node/parts-index.json")))
let r = await findParts(A, { query: "обрезка картинки", node: nodeTools(core, A) })
expect("a core tool found from the element says how to take it", /take a copy[^\n]*npm run tool:take -- tool-crop/.test(partsText(r, "x")), partsText(r, "x").slice(0, 300))
r = await findParts(A, { query: "точка на карте", node: nodeTools(core, A) })
expect("a neighbour's tool names its element", /the element «b»[^\n]*--from b/.test(partsText(r, "x")), partsText(r, "x").slice(0, 300))
r = await findParts(A, { query: "qr код", node: nodeTools(core, A) })
expect("its own tool comes first and says «Yours»", r.parts[0]?.id === "qr-code" && /Yours/.test(partsText(r, "x")), JSON.stringify(r.parts.map((p) => p.id)))
r = await findParts(A, { query: "бронирование столика", node: nodeTools(core, A) })
expect("a foreign query finds nothing (negative control)", r.parts.length === 0, JSON.stringify(r.parts.map((p) => p.id)))
registry("factory")
ids = nodeTools(core, A).map((t) => `${t.where.owner}:${t.id}`)
expect("an app factory: the neighbour hidden, the core's «any» stays", ids.includes("core:tool-crop") && !ids.includes("b:map-pin"), ids.join(", "))

fs.rmSync(core, { recursive: true, force: true })
if (failed) { console.error(`===NODE_INDEX_FAILED=== ${failed}`); process.exit(1) }
console.log("===NODE_INDEX_OK===")

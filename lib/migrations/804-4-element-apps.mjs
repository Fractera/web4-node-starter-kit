// 804-4 — the node's type (`nodeType` of the registry: project | factory) is gone: every element answered at its birth whether it is part
// of the project or an app of its own (`lib/web4-items/element-app.cjs`). A node installed before 804 gets that answer written into each
// born entry, by the type it was born under (the rule 554-1 used to give it, or not, its own organization in the sign-in), and the
// registry's `nodeType` is dropped. The preinstalled elements and root carry no field: they are part of the project by the owner's rule.
import { readFileSync, renameSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join } from 'node:path'

const require = createRequire(import.meta.url)
const { migrateApps } = require('../web4-items/element-app.cjs')

export const id = '804-4-element-apps'
export const why = 'the node type leaves the registry: each born element keeps its own answer (app: project | own) instead'
export const wraps = ['migrateApps']

export function run(root) {
  const file = join(root, 'WEB4-ITEMS-REGISTRY', 'web4-items.json')
  let raw
  try { raw = readFileSync(file, 'utf8') } catch { return { done: true, note: 'no registry on this node yet' } }
  const out = migrateApps(JSON.parse(raw), { root })
  if (!out.changed.length && out.dropped === null) return { done: true, note: 'nothing to move: no node type and every born element has its answer' }
  const nl = raw.includes('\r\n') ? '\r\n' : '\n'
  const tmp = `${file}.${process.pid}.tmp`
  writeFileSync(tmp, (JSON.stringify(out.registry, null, 2) + '\n').replace(/\n/g, nl), 'utf8')
  renameSync(tmp, file)
  const apps = out.registry.services.filter((s) => out.changed.includes(s.id)).map((s) => `${s.id}=${s.app}`)
  return { done: true, note: `node type ${out.dropped ?? 'none'} dropped${apps.length ? `; answers written: ${apps.join(', ')}` : ''}` }
}

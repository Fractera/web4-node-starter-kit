// For one source folder: which of its old tool copies (_tools/tool-*) and form parts are imported by code OUTSIDE that tool's own
// folder — the element's real pages and components. Reads files only.
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs'
import { join, relative } from 'node:path'
const root = process.argv[2]
const SKIP = new Set(['node_modules', '.next', '.git', 'development-docs', 'public'])
const files = []
const walk = (d) => { for (const n of readdirSync(d)) { if (SKIP.has(n) || n.startsWith('.next')) continue; const p = join(d, n); const s = statSync(p); if (s.isDirectory()) walk(p); else if (/\.(ts|tsx|mjs|cjs|js)$/.test(n)) files.push(p) } }
walk(root)
const text = new Map(files.map((f) => [relative(root, f), readFileSync(f, 'utf8')]))
const tools = existsSync(join(root, '_tools')) ? readdirSync(join(root, '_tools')).filter((n) => n.startsWith('tool-')) : []
const targets = [...tools.map((t) => [`_tools/${t}/`, t]), ['components/form/voice-control', 'voice-control'], ['components/dialog/app-dialog', 'app-dialog']]
const out = {}
for (const [needle, name] of targets) {
  const own = name.startsWith('tool-') ? `_tools/${name}/` : null
  const users = [...text].filter(([rel, src]) => !(own && rel.startsWith(own)) && !rel.startsWith('scripts/') && new RegExp(`from\\s+["'][^"']*${needle.replace(/[/.]/g, '\\$&')}`).test(src)).map(([rel]) => rel)
  out[name] = users
}
console.log(JSON.stringify(out))

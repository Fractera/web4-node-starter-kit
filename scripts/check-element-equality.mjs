// THE CORE GIVES NO ELEMENT A PLACE BY ITS ID (node step 734; the owner, 2026-11-12: «the core alone is special; all elements are
// equal»). The files below were cleaned of the root element's privileges; each one finds an element by what it provides
// (`provides` in the registry) or by the person's own pick, never by a fixed id. This guard holds them there: a fixed element id in one
// of them fails the build. The list grows with every substep of 734 that cleans another file (3c the bare domain, 3d the lists).
//
// Negative control: `node scripts/check-element-equality.mjs --self-test` puts `find((x) => x.id === 'root')` into a copy of the first
// file and must fail.
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const CLEANED = [
  // 734-3b: the birth takes the project's look and settings from the `project-settings` provider
  'scripts/item-birth.mjs',
  // 734-3b: the core's design comes from the same provider
  'scripts/sync-site-design.mjs',
  'lib/web4-items/project-settings-source.mjs',
]
// An element id used as an address in code: a quoted id compared, looked up or joined into a data path. Words in comments do not count.
const IDS = ['root', 'config', 'auth', 'data', 'storage', 'vectors', 'embeddings', 'graph', 'cache', 'memory', 'stripe']
const stripComments = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '').split('\n').map((l) => l.replace(/(^|[^:'"`])\/\/.*$/, '$1')).join('\n')
const patterns = IDS.flatMap((id) => [
  new RegExp(`\\.id\\s*===?\\s*['"\`]${id}['"\`]`),
  new RegExp(`['"\`]${id}['"\`]\\s*===?\\s*[\\w.]*\\.id\\b`),
  new RegExp(`['"\`]services['"\`]\\s*,\\s*['"\`]${id}['"\`]`),
  new RegExp(`services/${id}/`),
  new RegExp(`serviceUrl\\(\\s*['"\`]${id}['"\`]`),
])

function offences(path, src) {
  const out = []
  stripComments(src).split('\n').forEach((line, i) => {
    if (patterns.some((p) => p.test(line))) out.push(`${path}:${i + 1}: ${line.trim().slice(0, 140)}`)
  })
  return out
}

if (process.argv.includes('--self-test')) {
  const src = readFileSync(join(ROOT, CLEANED[0]), 'utf8') + "\nconst site = registry.services.find((x) => x.id === 'root')\n"
  const found = offences(CLEANED[0], src)
  if (found.length === 0) { console.error('===ELEMENT_EQUALITY_SELFTEST_FAILED=== the planted id was not found'); process.exit(1) }
  console.log(`===ELEMENT_EQUALITY_SELFTEST_OK=== the planted id is caught: ${found[found.length - 1]}`)
  process.exit(0)
}

const all = CLEANED.flatMap((p) => offences(p, readFileSync(join(ROOT, p), 'utf8')))
if (all.length) {
  console.error('===ELEMENT_EQUALITY_FAILED=== a cleaned file gives an element a place by its id (node step 734): find it by `provides` or the person\'s pick')
  for (const o of all) console.error(`  ${o}`)
  process.exit(1)
}
console.log(`===ELEMENT_EQUALITY_OK=== files cleaned of element privileges: ${CLEANED.length}, none names an element by its id`)

// A DEAD REQUIRE IN THE CORE'S BUILD (core step 837-0f). Reads the built server code `.next/server/{chunks,app}/**/*.js` after
// `next build` and before the restart (`scripts/serve.mjs rebuild`): a `require` by a computed path (`require(path.join(root, …))`) in a
// module the bundle imports compiles into `throw Error("Cannot find module 'unknown'")` — no build error, no warning, and the
// `try { … } catch { return false }` around it turns a rule into a silent «no».
// ✗ 2026-11-22: `lib/agent-kit/claude-account.cjs` loaded the wall that way — on the server every walled element was «not walled», and
// the subscription page offered «Подписка узла» again after three updates that each «fixed» it; unit tests passed (they run unbundled).
// Code that only the custom server loads (`server.js` → `lib/agent-kit/mount.cjs`, the bridges) is not bundled and may compute a path.
// Usage: node scripts/check-bundle-requires.mjs [the node's folder]. Exit 1 with the files and what stands before the dead require.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const root = process.argv[2] || process.cwd()
const DEAD = "Cannot find module 'unknown'"
const dirs = ['chunks', 'app'].map((d) => join(root, '.next', 'server', d)).filter((d) => existsSync(d))
if (!dirs.length) {
  console.log('===BUNDLE_REQUIRES_SKIP=== no .next/server — nothing built yet')
  process.exit(0)
}

const found = []
let files = 0
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    const st = statSync(p)
    if (st.isDirectory()) { walk(p); continue }
    if (!name.endsWith('.js')) continue
    files++
    const text = readFileSync(p, 'utf8')
    let i = text.indexOf(DEAD)
    while (i >= 0) {
      found.push({ file: relative(root, p), before: text.slice(Math.max(0, i - 140), i).replace(/\s+/g, ' ') })
      i = text.indexOf(DEAD, i + DEAD.length)
    }
  }
}
for (const d of dirs) walk(d)

if (!found.length) {
  console.log(`===BUNDLE_REQUIRES_OK=== ${files} built files, no require by a computed path`)
  process.exit(0)
}
const byBefore = new Map()
for (const f of found) {
  const k = f.before.slice(-110)
  if (!byBefore.has(k)) byBefore.set(k, new Set())
  byBefore.get(k).add(f.file)
}
console.error(`===BUNDLE_REQUIRES_FAIL=== ${found.length} dead require(s) in ${new Set(found.map((f) => f.file)).size} built file(s):`)
for (const [k, set] of byBefore) console.error(`  …${k}  ← ${[...set].slice(0, 2).join(', ')}${set.size > 2 ? ` (+${set.size - 2})` : ''}`)
console.error('A module the core\'s bundle imports requires by a computed path (require(path.join(…))). Make it a static')
console.error("require('../<folder>/<file>.cjs'); a module only server.js loads may keep it (lib/agent-kit/mount.cjs).")
process.exit(1)

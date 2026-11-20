// THE RED TEAM'S HOLES STAY CLOSED (node step 818; the holes measured by 817 on the server 109.199.105.213, 2026-11-20).
// `node scripts/redteam-holes.test.mjs`, in the prebuild. Each check names its hole; the live proof is `scripts/dedicated-server/redteam.sh`
// on a server and a curl from the internet.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => readFileSync(join(ROOT, p), 'utf8')
let passed = 0
let failed = 0
function t(name, fn) {
  try { fn(); passed++; console.log(`  ✓ ${name}`) } catch (e) { failed++; console.log(`  ✗ ${name}\n    ${String(e.message ?? e).split('\n').slice(0, 4).join('\n    ')}`) }
}
const code = (src) => src.split('\n').filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l)).join('\n') // comments may name the header

console.log('818 the red team holes')
t('H1 the API gate opens nothing for a self-written x-agent-identity (817: «outsider@agent» from the internet)', () => {
  assert.doesNotMatch(code(read('proxy/common.ts')), /x-agent-identity/i)
})
t('H1 getSession believes the label only from the owner at this machine (negative: never unconditionally)', () => {
  const src = code(read('lib/auth/get-session.ts'))
  assert.match(src, /isOwnerAtMachine\(req\)\s*\?\s*req\.headers\.get\('x-agent-identity'\)/)
  assert.doesNotMatch(src, /const agentId = req\?\.headers\.get\('x-agent-identity'\)/)
})
t('H1 requireAdmin and requireRole let no label in', () => {
  for (const p of ['lib/auth/require-admin.ts', 'lib/auth/require-role.ts']) assert.doesNotMatch(code(read(p)), /x-agent-identity/i, p)
})

if (failed) { console.log(`===REDTEAM_HOLES_FAILED=== ${failed} failed, ${passed} passed`); process.exit(1) }
console.log(`===REDTEAM_HOLES_OK=== ${passed} passed`)

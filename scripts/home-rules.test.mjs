// TESTS OF WHAT A HOME COMPUTER DOES NOT DO (node step 809-1). `node scripts/home-rules.test.mjs`, in the prebuild.
// The owner, 2026-11-20: an app of its own and an element's own domain — only on a dedicated server; a home computer keeps the node's
// own domain and the elements' subdomains. Each refusal has its negative control.
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { extraDomainsAllowed, ownAppAllowed } from '../lib/hosting/home-rules.mjs'
import { nodePlace } from '../lib/hosting/place.mjs'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
let passed = 0
const t = (name, fn) => { try { fn(); passed += 1; console.log(`  ✓ ${name}`) } catch (e) { console.error(`  ✗ ${name}\n    ${e.message}`); process.exitCode = 1 } }

console.log('809-1 a home computer: no app of its own, no element domains')
t('home refuses both; negative: a server allows both; no answer about the place is never a server', () => {
  assert.deepEqual([ownAppAllowed({ kind: 'home' }), extraDomainsAllowed({ kind: 'home' })], [false, false])
  assert.deepEqual([ownAppAllowed({ kind: 'server' }), extraDomainsAllowed({ kind: 'server' })], [true, true])
  assert.deepEqual([ownAppAllowed(null), extraDomainsAllowed(undefined), ownAppAllowed({ kind: 'unknown' })], [false, false, false])
})
const here = nodePlace(ROOT).kind
const birth = (app) => spawnSync(process.execPath, ['scripts/item-birth.mjs', 'zzzz809', '--app', app], { cwd: ROOT, encoding: 'utf8', timeout: 30_000 })
t(`the birth on this ${here} node: «own» ${here === 'server' ? 'passes the place rule' : 'is refused by the place rule'}; negative: «project» never is`, () => {
  const own = birth('own')
  const project = birth('project')
  const said = (r) => `${r.stdout}${r.stderr}`
  assert.notEqual(own.status, 0) // no such draft either way — nothing is born
  assert.equal(said(own).includes('только на выделенном сервере'), here !== 'server', said(own))
  assert.equal(said(project).includes('только на выделенном сервере'), false, said(project))
})

console.log(process.exitCode ? '✗ home rules' : `✓ home rules: ${passed} passed`)

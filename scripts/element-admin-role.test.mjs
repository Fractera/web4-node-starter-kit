// Node step 778: the admin role of an element — one fixed family elementAdmin001…980 in every project; a custom element takes the first
// free number of the registry, a built-in one none; a number held twice keeps the earlier entry; a deleted entry frees its number.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const role = createRequire(import.meta.url)(join(ROOT, 'lib', 'web4-items', 'element-admin-role.cjs'))
let passed = 0
const t = (name, fn) => { try { fn(); passed++; console.log(`  ✓ ${name}`) } catch (e) { process.exitCode = 1; console.log(`  ✗ ${name}\n    ${e.message}`) } }
const reg = (...services) => ({ services })
const native = (id) => ({ id, kind: 'core' })
const custom = (id, adminRole) => ({ id, kind: 'user', ...(adminRole ? { adminRole } : {}) })

t('the family is fixed: 980 names, 001 … 980, three digits, nothing else is one of them', () => {
  assert.equal(role.ALL.length, 980)
  assert.equal(role.ALL[0], 'elementAdmin001')
  assert.equal(role.ALL[979], 'elementAdmin980')
  assert.equal(new Set(role.ALL).size, 980)
  for (const bad of ['elementAdmin000', 'elementAdmin981', 'elementAdmin1', 'elementAdmin0001', 'ElementAdmin001', 'admin', 'architect', '', null, 7]) {
    assert.equal(role.isRole(bad), false, String(bad))
  }
  assert.equal(role.numberOf('elementAdmin042'), 42)
  assert.equal(role.roleOf(0), null)
  assert.equal(role.roleOf(981), null)
})

t('a custom element takes the first free number in the registry order; a built-in one takes none', () => {
  const r = reg(native('auth'), native('data'), custom('a'), custom('b'))
  assert.deepEqual(role.ensureAdminRoles(r), ['a', 'b'])
  assert.equal(role.adminRoleOf(r, 'a'), 'elementAdmin001')
  assert.equal(role.adminRoleOf(r, 'b'), 'elementAdmin002')
  assert.equal(role.adminRoleOf(r, 'auth'), '')
  assert.equal('adminRole' in r.services[0], false)
})

t('numbers already held are kept; a gap is filled first; nothing changes on a second run', () => {
  const r = reg(custom('a', 'elementAdmin001'), custom('b', 'elementAdmin003'), custom('c'))
  assert.deepEqual(role.ensureAdminRoles(r), ['c'])
  assert.equal(role.adminRoleOf(r, 'c'), 'elementAdmin002')
  assert.deepEqual(role.ensureAdminRoles(r), [])
})

t('a number held twice stays with the earlier entry; the later one gets a new number', () => {
  const r = reg(custom('a', 'elementAdmin005'), custom('b', 'elementAdmin005'))
  assert.deepEqual(role.ensureAdminRoles(r), ['b'])
  assert.equal(role.adminRoleOf(r, 'a'), 'elementAdmin005')
  assert.equal(role.adminRoleOf(r, 'b'), 'elementAdmin001')
})

t('a built-in element that somehow holds a role loses it (its admin is the architect alone)', () => {
  const r = reg({ id: 'auth', kind: 'core', adminRole: 'elementAdmin001' }, custom('a'))
  role.ensureAdminRoles(r)
  assert.equal('adminRole' in r.services[0], false)
  assert.equal(role.adminRoleOf(r, 'a'), 'elementAdmin001')
})

t('a deleted entry frees its number for the next birth; all 980 taken — no number', () => {
  const r = reg(custom('a', 'elementAdmin001'), custom('b', 'elementAdmin002'))
  r.services = r.services.filter((s) => s.id !== 'a')
  assert.equal(role.firstFree(r), 'elementAdmin001')
  const full = reg(...role.ALL.map((x, i) => custom(`e${i}`, x)))
  assert.equal(role.firstFree(full), null)
  assert.deepEqual(role.ensureAdminRoles({ services: [...full.services, custom('late')] }), [])
})

t('no element is named in the module (all elements equal — CLAUDE.md §3)', () => {
  const code = readFileSync(join(ROOT, 'lib', 'web4-items', 'element-admin-role.cjs'), 'utf8').replace(/\/\/.*$/gm, '')
  assert.doesNotMatch(code, /['"`](root|auth|data|storage|config)['"`]/)
})

console.log(`element-admin-role: ${passed} passed`)

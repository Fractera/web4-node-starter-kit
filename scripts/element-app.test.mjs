// 804-1: what an element is — part of the project or an app of its own (lib/web4-items/element-app.cjs), and the registry without the
// node's type (804-4). Run: node scripts/element-app.test.mjs
import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const require = createRequire(import.meta.url)
const { appOf, appOfEntry, isOwnApp, ownApps, migrateApps } = require('../lib/web4-items/element-app.cjs')

let passed = 0
const t = (name, fn) => { try { fn(); passed += 1; console.log(`  ✓ ${name}`) } catch (e) { console.error(`  ✗ ${name}\n    ${e.message}`); process.exitCode = 1 } }

const tmp = mkdtempSync(join(tmpdir(), 'element-app-'))
const put = (rel, value) => { const f = join(tmp, rel); mkdirSync(join(f, '..'), { recursive: true }); writeFileSync(f, typeof value === 'string' ? value : JSON.stringify(value, null, 2)) }
const registry = (nodeType, services) => put('WEB4-ITEMS-REGISTRY/web4-items.json', { _: ['comment'], ...(nodeType ? { nodeType } : {}), services })
const born = { from: 'fractera-custom-item-starter', version: 'v0.3.218', at: '2026-11-19T10:00:00Z' }
const services = [
  { id: 'auth', kind: 'core' },
  { id: 'root', kind: 'user' },
  { id: 'marina', kind: 'user', born, app: 'own' },
  { id: 'shop', kind: 'user', born, app: 'project' },
  { id: 'legacy', kind: 'user', born },
  { id: 'nativeborn', kind: 'user', born },
]
put('WEB4-ITEMS/user/nativeborn/OWN-SERVICE-PROPS/OWN-SERVICE-PROPS.json', { id: 'nativeborn', elementType: 'native' })

try {
  t('the field decides: marina own, shop project', () => {
    registry('project', services)
    assert.equal(appOf('marina', tmp), 'own')
    assert.equal(appOf('shop', tmp), 'project')
    assert.equal(isOwnApp('marina', tmp), true)
  })
  t('the preinstalled elements (a native, root) are part of the project on any node type — the owner\'s rule', () => {
    registry('factory', services)
    assert.equal(appOf('auth', tmp), 'project')
    assert.equal(appOf('root', tmp), 'project')
  })
  t('an id the registry does not hold (the main agent build) — part of the project', () => {
    assert.equal(appOf('build', tmp), 'project')
    assert.equal(appOf('nope', tmp), 'project')
  })
  t('legacy: a born entry without the field reads the type it was born under — factory → own, project → project', () => {
    registry('factory', services)
    assert.equal(appOf('legacy', tmp), 'own')
    registry('project', services)
    assert.equal(appOf('legacy', tmp), 'project')
    registry(null, services)
    assert.equal(appOf('legacy', tmp), 'project')
  })
  t('negative: a native element born on a factory serves the node — part of the project, not an own app', () => {
    registry('factory', services)
    assert.equal(appOf('nativeborn', tmp), 'project')
    assert.deepEqual(ownApps(tmp).sort(), ['legacy', 'marina'])
  })
  t('negative: a bogus field value falls back to the rule, never passes through', () => {
    assert.equal(appOfEntry({ id: 'x', kind: 'user', born, app: 'factory' }, { legacyType: 'project' }), 'project')
    assert.equal(appOfEntry({ id: 'x', kind: 'core', app: 'bogus' }), 'project')
  })
  t('migration: born entries get the field by the old type, the type is dropped, the comment stays first', () => {
    const reg = { _: ['comment'], nodeType: 'factory', services }
    const out = migrateApps(reg, { root: tmp })
    assert.deepEqual(out.changed.sort(), ['legacy', 'nativeborn'])
    assert.equal(out.dropped, 'factory')
    assert.equal(Object.keys(out.registry)[0], '_')
    assert.ok(!('nodeType' in out.registry))
    const by = Object.fromEntries(out.registry.services.map((s) => [s.id, s.app]))
    assert.deepEqual(by, { auth: undefined, root: undefined, marina: 'own', shop: 'project', legacy: 'own', nativeborn: 'project' })
  })
  t('migration: a snapshot\'s type may be given; a migrated registry migrates to itself (idempotent)', () => {
    const once = migrateApps({ _: ['c'], services }, { root: tmp, legacyType: 'factory' }).registry
    assert.equal(once.services.find((s) => s.id === 'legacy').app, 'own')
    const twice = migrateApps(once, { root: tmp })
    assert.deepEqual(twice.changed, [])
    assert.equal(twice.dropped, null)
    assert.deepEqual(twice.registry, once)
  })
} finally {
  rmSync(tmp, { recursive: true, force: true })
}
console.log(process.exitCode ? `===ELEMENT_APP_FAILED=== ${passed} passed` : `===ELEMENT_APP_OK=== ${passed} passed`)

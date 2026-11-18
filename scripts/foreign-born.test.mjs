// 784: an element born on the node a fork came from never stops a fresh project's install (lib/web4-items/foreign-born.mjs).
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { foreignBorn } from '../lib/web4-items/foreign-born.mjs'
let passed = 0
const t = (name, fn) => { try { fn(); passed += 1; console.log(`  ✓ ${name}`) } catch (e) { console.error(`  ✗ ${name}\n    ${e.message}`); process.exitCode = 1 } }
const services = [
  { id: 'auth', version: 'v2.4.43' },
  { id: 'root', version: 'v3.0.68' },
  { id: 'hrutb', born: { from: 'custom', at: '2026-11-16T17:20:36.564Z' } },
  { id: 'kept', born: { from: 'custom', at: '2026-11-16T10:00:00Z' }, github: 'someone/kept' },
  { id: 'here', born: { from: 'custom', at: '2026-11-16T11:00:00Z' } },
  { id: 'lost', born: { from: 'custom', at: '2026-11-17T09:00:00Z' } },
  { id: 'nodate', born: { from: 'custom' } },
]
const folders = new Set(['auth', 'root', 'here'])
const hasFolder = (e) => folders.has(e.id)
const SERVER = '2026-11-18T15:24:09Z' // the server became fresh after every birth above
const THIS = '2026-11-15T23:11:53Z' // this computer became fresh before them
t('the server set up from the fork drops the elements born on the parent node with no folder and no repository', () => {
  assert.deepEqual(foreignBorn(services, { freshAt: SERVER, hasFolder }), ['hrutb', 'lost'])
})
t('negative: on the node that bore them (fresh BEFORE their birth) nothing is dropped — a lost folder stays an error', () => {
  assert.deepEqual(foreignBorn(services, { freshAt: THIS, hasFolder }), [])
})
t('kept: one with its own repository (restored), one with its folder, one without a birth time; no fresh mark — nothing', () => {
  const ids = foreignBorn(services, { freshAt: SERVER, hasFolder })
  assert.ok(!ids.includes('kept') && !ids.includes('here') && !ids.includes('nodate'))
  assert.deepEqual(foreignBorn(services, { freshAt: null, hasFolder }), [])
})
t('the installer asks this rule before its loop', () => {
  const src = readFileSync(new URL('./services-install.mjs', import.meta.url), 'utf8')
  assert.ok(src.indexOf("foreignBorn(registry.services") > 0 && src.indexOf("foreignBorn(registry.services") < src.indexOf('for (const entry of registry.services)'))
})
console.log(process.exitCode ? `===FOREIGN_BORN_FAILED=== ${passed} passed` : `===FOREIGN_BORN_OK=== ${passed} passed`)

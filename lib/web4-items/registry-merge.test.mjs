// node lib/web4-items/registry-merge.test.mjs — the installer's last registry write meets the disk (node step 834-12)
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
const { mergeRegistry } = createRequire(import.meta.url)('./registry-merge.cjs')
let n = 0
const t = (name, fn) => { fn(); n++; console.log(`  ✓ ${name}`) }
const start = new Set(['root', 'j58fl'])
t('deleted on disk during the install → stays deleted (the ghost of 2026-11-21)', () => {
  const r = mergeRegistry({ services: [{ id: 'root', port: 1 }, { id: 'j58fl', port: 2 }] }, { services: [{ id: 'root' }] }, start)
  assert.deepEqual(r.registry.services.map((s) => s.id), ['root']); assert.deepEqual(r.dropped, ['j58fl'])
})
t('born on disk during the install → kept', () => {
  const r = mergeRegistry({ services: [{ id: 'root', port: 1 }] }, { services: [{ id: 'root' }, { id: 'sgnou', port: 9 }] }, new Set(['root']))
  assert.deepEqual(r.registry.services.map((s) => s.id), ['root', 'sgnou']); assert.deepEqual(r.born, ['sgnou'])
})
t('the installer\'s measured port wins for an element on both', () => {
  const r = mergeRegistry({ services: [{ id: 'root', port: 7 }] }, { services: [{ id: 'root', port: 1 }] }, new Set(['root']))
  assert.equal(r.registry.services[0].port, 7)
})
t('negative: an entry the installer added itself is not dropped', () => {
  const r = mergeRegistry({ services: [{ id: 'root' }, { id: 'new' }] }, { services: [{ id: 'root' }] }, new Set(['root']))
  assert.deepEqual(r.registry.services.map((s) => s.id), ['root', 'new']); assert.deepEqual(r.kept, ['new'])
})
t('negative: an unreadable disk leaves the installer\'s copy as it is', () => {
  const mine = { services: [{ id: 'root' }] }
  assert.equal(mergeRegistry(mine, null, new Set(['root'])).registry, mine)
})
console.log(`registry-merge: ${n} ✓`)

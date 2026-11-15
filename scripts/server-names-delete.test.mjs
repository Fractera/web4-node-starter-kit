// A DELETED ELEMENT LEAVES A SERVER'S EDGE, A RENAMED ONE MOVES ON IT (node steps 750-2, 750-3). ✗ Before 750 the deletion on a server wrote «no-domain» and the deleted
// element's name stayed in nginx and DNS. nginx is written from the name table (`lib/hosting/hostnames.mjs` `nodeNames`), which reads the
// registry; the deletion removes the registry entry, then rewrites nginx (`name-up.mjs`). This proves the table half over a temp node:
// the name is there before the registry step (the negative control) and gone after it, the other names untouched; the road that decides
// to act at all is `reach-road.mjs` (server only).
// `node scripts/server-names-delete.test.mjs` → `===SERVER_NAMES_DELETE_OK===` or a failed assertion.
import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { nodeNames } from '../lib/hosting/hostnames.mjs'
import { roadOf } from '../lib/domain/reach-road.mjs'

const root = mkdtempSync(join(tmpdir(), 'names-del-'))
let n = 0
const test = (title, fn) => { fn(); n++; console.log(`  ✓ ${title}`) }
const registry = (services) => writeFileSync(join(root, 'WEB4-ITEMS-REGISTRY', 'web4-items.json'), JSON.stringify({ services }))
try {
  mkdirSync(join(root, 'WEB4-ITEMS-REGISTRY'), { recursive: true })
  mkdirSync(join(root, 'logs'), { recursive: true })
  writeFileSync(join(root, 'logs', 'domain.json'), JSON.stringify({ zone: 'aifa.dev', hostname: 'aifa.dev', via: 'server' }))
  const base = [{ id: 'root', port: 24683 }, { id: 'auth', port: 24681 }, { id: 'data', port: 24682 }]
  const hosts = () => nodeNames({ root }).rows.map((r) => r.host)

  test('the deletion acts on this node: its road is «server»', () => {
    assert.equal(roadOf({ zone: 'aifa.dev', via: 'server' }, 'server'), 'server')
  })
  test('negative control: before the registry step the element\'s name is on the edge', () => {
    registry([...base, { id: 'qwert', port: 24700, kind: 'user', born: true }])
    assert.ok(hosts().includes('qwert.aifa.dev'))
  })
  test('after the registry step the rewrite has no such name, and every other name stays', () => {
    const before = hosts().filter((h) => h !== 'qwert.aifa.dev')
    registry(base)
    assert.ok(!hosts().includes('qwert.aifa.dev'))
    assert.deepEqual(hosts(), before)
  })
  test('750-3: a renamed element (its address file) takes the new name on the rewrite and leaves the old one', () => {
    registry([...base, { id: 'qwert', port: 24700, kind: 'user', born: true }])
    mkdirSync(join(root, 'data', 'services', 'qwert'), { recursive: true })
    writeFileSync(join(root, 'data', 'services', 'qwert', 'address.json'), JSON.stringify({ address: 'shop' }))
    assert.ok(hosts().includes('shop.aifa.dev'))
    assert.ok(!hosts().includes('qwert.aifa.dev'))
  })
} finally {
  rmSync(root, { recursive: true, force: true })
}
console.log(`===SERVER_NAMES_DELETE_OK=== ${n} tests`)

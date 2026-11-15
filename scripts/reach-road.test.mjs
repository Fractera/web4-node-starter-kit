// THE ROAD OF «АДРЕС В ИНТЕРНЕТЕ» (node step 749-3). The owner, 2026-11-15, on aifa.dev: «нереальный адрес … адрес Local хост и
// ошибочную надпись узел работает на этой машине своего Домина у него нет». The door `/api/node/reach` knew only the Cloudflare tunnel,
// so a server whose domain is held by its nginx read as «only this machine». `lib/domain/reach-road.mjs` decides the road once; these
// fixtures are the four places a node can be in, plus the negative controls.
// `node scripts/reach-road.test.mjs` → `===REACH_ROAD_OK===` or a failed assertion.
import assert from 'node:assert/strict'
import { roadOf } from '../lib/domain/reach-road.mjs'

let n = 0
const test = (title, fn) => { fn(); n++; console.log(`  ✓ ${title}`) }

test('a server whose domain its nginx holds — «server» (aifa.dev, 2026-11-15)', () => {
  assert.equal(roadOf({ zone: 'aifa.dev', hostname: 'aifa.dev', via: 'server', activatedAt: '2026-11-14' }, 'server'), 'server')
})
test('a person\'s computer with its own domain through the named tunnel — «tunnel», as before', () => {
  assert.equal(roadOf({ zone: 'example.org', tunnelId: '0d3c…', hostname: 'example.org' }, 'home'), 'tunnel')
})
test('a dedicated server before its domain — «server-no-domain», never «only this machine»', () => {
  assert.equal(roadOf(null, 'server'), 'server-no-domain')
  assert.equal(roadOf({}, 'server'), 'server-no-domain')
})
test('a person\'s computer without a domain — «local», as before', () => {
  assert.equal(roadOf(null, 'home'), 'local')
  assert.equal(roadOf(undefined, 'home'), 'local')
})
test('negative: the place never overrides a real tunnel, and `via` wins over a sleeping tunnel id on a server', () => {
  assert.equal(roadOf({ zone: 'example.org', tunnelId: 'abc' }, 'server'), 'tunnel')
  assert.equal(roadOf({ zone: 'aifa.dev', tunnelId: 'abc', via: 'server' }, 'server'), 'server')
})
test('negative: a record without a zone is no domain, whatever else it says', () => {
  assert.equal(roadOf({ via: 'server', tunnelId: 'abc' }, 'home'), 'local')
  assert.equal(roadOf({ zone: '', via: 'server' }, 'server'), 'server-no-domain')
  assert.equal(roadOf({ zone: 'example.org', tunnelId: '' }, 'home'), 'local')
})

console.log(`===REACH_ROAD_OK=== ${n} tests`)

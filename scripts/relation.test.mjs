// TESTS OF THE SERVER'S RELATION TO THIS NODE (node step 744-4). `npm run test:relation`, in the prebuild.
// The owner, 2026-11-14: «прежде всего получать исходные данные по состоянию сервера если сервер никак не связан с нашим текущим
// положением Fractera то предлагает удалить предыдущее состояние если связан то предлагает обновиться до последней версии если это возможно».
// D49: «related» = the server's node follows THIS node's fork and is not a 737 move of another computer; everything else is «unrelated».
// Each verdict has its negative control: the one fact that turns it is changed and the verdict must turn with it.
import assert from 'node:assert/strict'
import { forkKey, relationOf } from '../lib/hosting/relation.mjs'

let passed = 0
const t = (name, fn) => {
  try { fn(); passed += 1; console.log(`  ✓ ${name}`) } catch (e) { console.error(`  ✗ ${name}\n    ${e.message}`); process.exitCode = 1 }
}
const FORK = 'https://github.com/aifa-agi/web4-node-starter-kit.git'
const node = (over = {}) => ({ head: 'a'.repeat(40), ahead: 0, behind: 0, phase: 'live', origin: FORK, movedFrom: null, launching: false, ...over })
const probe = (over = {}) => ({ fractera: null, foreignSites: [], pm2Root: 0, otherNodes: [], ...over })
const ids = (r) => r.reasons.map((x) => x.id)

console.log('744-4 the server\'s state first: clean · related · unrelated')
t('a fork is one fork however it is spelled: https, .git, ssh form, credentials, case', () => {
  for (const u of ['https://github.com/AIFA-AGI/web4-node-starter-kit', 'git@github.com:aifa-agi/web4-node-starter-kit.git', 'https://x-access-token:abc@github.com/aifa-agi/web4-node-starter-kit.git', 'ssh://git@github.com/aifa-agi/web4-node-starter-kit.git'])
    assert.equal(forkKey(u), 'github.com/aifa-agi/web4-node-starter-kit', u)
  assert.equal(forkKey('https://github.com/Fractera/web4-node-starter-kit.git'), 'github.com/fractera/web4-node-starter-kit')
  assert.equal(forkKey(''), null)
})
t('nothing on the server → clean; negative: one foreign nginx site or one root program is not clean', () => {
  assert.equal(relationOf(probe(), FORK).kind, 'clean')
  assert.deepEqual(ids(relationOf(probe({ foreignSites: ['shop'] }), FORK)), ['foreign-sites'])
  assert.equal(relationOf(probe({ pm2Root: 2 }), FORK).kind, 'unrelated')
})
t('a node of THIS fork, never moved → related; negative: another fork, the original, no origin → unrelated, the node itself named', () => {
  const r = relationOf(probe({ fractera: node() }), FORK)
  assert.deepEqual([r.kind, r.nodeUnrelated], ['related', false])
  for (const [origin, id] of [['https://github.com/someone/web4-node-starter-kit.git', 'other-fork'], ['https://github.com/Fractera/web4-node-starter-kit.git', 'other-fork'], [null, 'no-origin']]) {
    const u = relationOf(probe({ fractera: node({ origin }) }), FORK)
    assert.deepEqual([u.kind, ids(u), u.nodeUnrelated], ['unrelated', [id], true], String(origin))
  }
})
t('a 737 MOVE of a computer (its mark carries movedAt) → unrelated even on this very fork — the measured test server', () => {
  const r = relationOf(probe({ fractera: node({ movedFrom: { from: 'MacBook-Pro-de-Roman.local', at: '2026-11-13T22:45:16Z' } }) }), FORK)
  assert.deepEqual([r.kind, ids(r), r.nodeUnrelated], ['unrelated', ['moved'], true])
  assert.equal(r.reasons[0].from, 'MacBook-Pro-de-Roman.local')
})
t('a related node beside foreign sites → unrelated for the SERVER, but the node is kept (only the strangers are cleared)', () => {
  const r = relationOf(probe({ fractera: node(), foreignSites: ['old-site'], pm2Root: 1 }), FORK)
  assert.deepEqual([r.kind, ids(r), r.nodeUnrelated], ['unrelated', ['foreign-sites', 'root-programs'], false])
})
t('another Fractera node in the node user\'s home → unrelated, named by its folder', () => {
  const r = relationOf(probe({ otherNodes: ['my-other-fork'] }), FORK)
  assert.deepEqual([r.kind, ids(r), r.nodeUnrelated], ['unrelated', ['other-nodes'], true])
})
t('negative: without this node\'s own fork nothing can be «related» — the node there is unrelated, never trusted by default', () => {
  assert.deepEqual(ids(relationOf(probe({ fractera: node() }), null)), ['other-fork'])
})

console.log(`${passed} passed${process.exitCode ? ', FAILED' : ''}`)

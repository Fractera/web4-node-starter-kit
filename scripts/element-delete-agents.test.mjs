// DELETING AN ELEMENT CLOSES ITS AGENT FIRST AND FORGETS ITS SUPERVISION (node step 750-1). ✗ 2026-11-15 13:05: a deleted element's
// Opus session kept running in its vanished folder, and `supervision.json` kept the id. `node scripts/element-delete-agents.test.mjs`
// → `===ELEMENT_DELETE_AGENTS_OK===` or a failed assertion.
import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { closeAgents } from '../lib/web4-items/agent-close.mjs'

const require = createRequire(import.meta.url)
const supervision = require('../lib/web4-items/supervision.cjs')
let n = 0
const test = async (title, fn) => { await fn(); n++; console.log(`  ✓ ${title}`) }

await test('both sessions are closed, the agent then its worker, and the deletion waits for the delayed stop', async () => {
  const calls = []; const waits = []
  const r = await closeAgents('abcde', (s, o) => { calls.push([s, o.close]); return { ok: true } }, async (ms) => { waits.push(ms) })
  assert.deepEqual(calls, [['abcde', true], ['abcde--work', true]])
  assert.deepEqual(waits, [2000])
  assert.equal(r.ok, true)
  assert.equal(r.detail, 'abcde:closed,abcde--work:closed')
})
await test('a session already off is no failure, and nothing to wait for', async () => {
  const waits = []
  const r = await closeAgents('abcde', () => ({ ok: false, reason: 'no-session' }), async (ms) => { waits.push(ms) })
  assert.equal(r.ok, true); assert.deepEqual(waits, [])
})
await test('negative: a kit that throws or refuses is named as a failed step, never a crash', async () => {
  const r = await closeAgents('abcde', (s) => { if (s.endsWith('--work')) throw new Error('boom'); return { ok: false, reason: 'busy' } }, async () => {})
  assert.equal(r.ok, false); assert.equal(r.detail, 'abcde:busy,abcde--work:boom')
})
await test('negative: no kits mounted (a script, not the core) — said, not guessed', async () => {
  assert.deepEqual(await closeAgents('abcde', undefined), { step: 'agents', ok: false, detail: 'no-kits' })
})
await test('the supervision record of the deleted element is forgotten; an unknown id changes nothing', async () => {
  const root = mkdtempSync(join(tmpdir(), 'sup-'))
  try {
    supervision.set('abcde', 'main', { root, brief: 'x' })
    supervision.set('fghij', 'architect', { root })
    assert.equal(supervision.forget('abcde', root), true)
    assert.equal(supervision.forget('abcde', root), false)
    const j = JSON.parse(readFileSync(join(root, 'data', 'node', 'supervision.json'), 'utf8'))
    assert.deepEqual(Object.keys(j.elements), ['fghij'])
  } finally { rmSync(root, { recursive: true, force: true }) }
})
console.log(`===ELEMENT_DELETE_AGENTS_OK=== ${n} tests`)

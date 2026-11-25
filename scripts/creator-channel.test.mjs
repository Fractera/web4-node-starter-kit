// The creator channel's node half (node step 855-2/3, lib/node/creator-channel.cjs): identity, signature, redaction, fingerprint, the
// switch. Every check has its negative: a tampered report or a foreign key fails, a second report of the same fault folds, the switch off
// queues nothing, a secret never reaches the queue.
import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const cc = createRequire(import.meta.url)(join(dirname(fileURLToPath(import.meta.url)), '..', 'lib', 'node', 'creator-channel.cjs'))
let failed = 0
const t = (name, fn) => { try { fn(); console.log(`  ✓ ${name}`) } catch (e) { failed += 1; console.log(`  ✗ ${name}\n    ${e.message}`) } }
const root = mkdtempSync(join(tmpdir(), 'creator-channel-'))
const other = mkdtempSync(join(tmpdir(), 'creator-channel-b-'))

t('the identity is born once, the private key 0600, the ID from the public key', () => {
  const a = cc.identity(root)
  const b = cc.identity(root)
  assert.equal(a.id, b.id)
  assert.match(a.id, /^fr-[0-9a-f]{16}$/)
  assert.equal(statSync(join(root, 'data', 'node', 'identity', 'node.key')).mode & 0o777, 0o600)
  assert.notEqual(cc.identity(other).id, a.id, 'another node — another ID')
})

const fault = { component: 'core-build', errorClass: 'prebuild-failed', summary: 'The build stopped at check:static', by: 'trigger' }
let env = null
t('a report is queued, signed and verifies', () => {
  const r = cc.report(root, fault, { commit: 'abc1234', site: 'https://example.org' })
  assert.ok(r.queued, JSON.stringify(r))
  env = JSON.parse(readFileSync(r.queued, 'utf8'))
  assert.equal(cc.verify(env), true)
  assert.equal(env.report.node.id, cc.identity(root).id)
})
t('negative: a changed word or another node\'s key does not verify', () => {
  assert.equal(cc.verify({ ...env, report: { ...env.report, summary: 'something else' } }), false)
  assert.equal(cc.verify({ ...env, publicKey: cc.identity(other).publicKey }), false)
})
t('the same fault the same day folds into one report; another fault is its own', () => {
  const again = cc.report(root, fault, { commit: 'abc1234' })
  assert.equal(again.count, 2)
  assert.ok(cc.report(root, { ...fault, errorClass: 'guard-refused-twice' }, { commit: 'abc1234' }).queued)
  assert.equal(cc.waiting(root).length, 2)
})
t('nothing private reaches the queue (tokens, keys, e-mail, phone, IP, the home folder)', () => {
  const dirty = 'bot 123456789:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsawQ sk-proj-abcdefghijklmnop1234 ghp_abcdefghijklmnopqrstuvwxyz1234 SETTINGS_SECRET=xyz roma@example.com +34 612 345 678 10.0.0.12 /Users/romanbolshiyanov/web4'
  const r = cc.report(root, { ...fault, errorClass: 'leak-test', summary: dirty }, { commit: 'abc1234' })
  const s = JSON.parse(readFileSync(r.queued, 'utf8')).report.summary
  for (const bad of ['AAHdqTcv', 'sk-proj', 'ghp_', 'xyz', 'roma@', '612 345', '10.0.0.12', 'romanbolshiyanov']) assert.ok(!s.includes(bad), `${bad} leaked: ${s}`)
})
t('the switch off — nothing is queued; on again — it is', () => {
  cc.setOn(root, false)
  assert.deepEqual(cc.report(root, { ...fault, errorClass: 'while-off' }), { off: true })
  cc.setOn(root, true)
  assert.ok(cc.report(root, { ...fault, errorClass: 'while-on' }).queued)
})
t('negative: a report without its component, class or summary is refused', () => {
  assert.ok(cc.report(root, { component: 'core-build', summary: 'x' }).refused)
  assert.ok(cc.report(root, { component: 'bad component!', errorClass: 'x', summary: 'x' }).refused)
})
t('Roma\'s shape of the text', () => {
  const s = cc.text(env.report, 'ru')
  assert.match(s, /^Я Fractera с ID: fr-[0-9a-f]{16}, мой сайт: https:\/\/example\.org, обнаружил потенциальную системную ошибку/)
  assert.match(s, /Описание коротко: The build stopped/)
})

t('855-5: a failed build on an ordinary node queues one report; on the creator\'s own node it is skipped (negative)', () => {
  const out = cc.onBuildFailed(other, { what: 'core', summary: 'the core build FAILED: check:static refused 2 pages', facts: { commit: 'def5678' } })
  assert.ok(out.queued, JSON.stringify(out))
  const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
  const owner = createRequire(import.meta.url)(join(ROOT, 'lib', 'agent-kit', 'system-part.cjs')).knownOwner(ROOT)
  if (owner) assert.deepEqual(cc.onBuildFailed(ROOT, { what: 'core', summary: 'x' }), { skipped: 'creator-node' })
})

rmSync(root, { recursive: true, force: true }); rmSync(other, { recursive: true, force: true })
if (failed) { console.log(`===TEST_CREATOR_CHANNEL_FAILED=== ${failed}`); process.exit(1) }
console.log('===TEST_CREATOR_CHANNEL_OK===')

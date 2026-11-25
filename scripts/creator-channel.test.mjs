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
t('a Telegram chat id and a host with a person\'s name are cleaned; the node\'s own site and public services stay (aifa.dev 2026-11-25)', () => {
  const r = cc.report(root, { ...fault, errorClass: 'hosts-test', summary: 'chat_id 90413601 user: 5551234; ryabusmarina.ru and shop.ryabusmarina.ru failed, ryabusmarina.ru again; fractera.ai and github.com fine; example.org is ours; file quiz.json' }, { commit: 'abc1234', site: 'https://example.org' })
  const s = JSON.parse(readFileSync(r.queued, 'utf8')).report.summary
  assert.ok(!s.includes('90413601') && !s.includes('5551234'), s)
  assert.ok(!/ryabus/.test(s), s)
  assert.match(s, /\[domain #1\] and \[domain #2\] failed, \[domain #1\] again/)
  assert.match(s, /fractera\.ai and github\.com fine; example\.org is ours; file quiz\.json/)
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

const inbox = createRequire(import.meta.url)(join(dirname(fileURLToPath(import.meta.url)), '..', 'lib', 'node', 'creator-inbox.cjs'))
const fractera = mkdtempSync(join(tmpdir(), 'creator-inbox-'))
t('855-4: the door is inert without the inbox settings (every node but Fractera\'s)', () => {
  assert.equal(inbox.config(fractera), null)
})
t('855-4: the door — accepts a signed report once, folds the repeat, refuses a forgery and a changed key (negatives)', () => {
  const e = JSON.parse(readFileSync(join(other, 'data', 'node', 'creator-reports', cc.waiting(other)[0]), 'utf8'))
  const ok = inbox.accept(fractera, e)
  assert.equal(ok.status, 202)
  assert.match(ok.forward, /^Я Fractera с ID: fr-/)
  assert.equal(inbox.accept(fractera, e).status, 200, 'the same fingerprint folds')
  assert.equal(inbox.accept(fractera, { ...e, report: { ...e.report, summary: 'forged' } }).status, 401)
  const stranger = cc.identity(root)
  const forgedKey = { report: { ...e.report, fingerprint: 'ffffffffffffffff' }, publicKey: stranger.publicKey, signature: cc.sign(root, { ...e.report, fingerprint: 'ffffffffffffffff' }) }
  assert.equal(inbox.accept(fractera, forgedKey).status, 401, 'another key cannot speak for this node ID')
  assert.equal(inbox.accept(fractera, { nope: 1 }).status, 400)
})
await (async () => {
  const before = cc.waiting(other).length
  let out = await cc.flush(other, { fetchImpl: async () => ({ status: 404 }) })
  assert.equal(out.waiting, before, 'the door not there yet — everything waits')
  cc.setOn(other, false)
  let called = 0
  out = await cc.flush(other, { fetchImpl: async () => { called += 1; return { status: 202 } } })
  assert.equal(called, 0, 'off — not one call')
  cc.setOn(other, true)
  out = await cc.flush(other, { fetchImpl: async () => { called += 1; return { status: 202 } } })
  assert.equal(called, 0, 'on but never allowed by the architect — not one call (aifa.dev 2026-11-25)')
  cc.allow(other)
  out = await cc.flush(other, { fetchImpl: async () => ({ status: 202 }) })
  assert.equal(out.sent, before)
  assert.equal(cc.waiting(other).length, 0)
  console.log('  ✓ 855-4: flush — 404 keeps waiting, off or not yet allowed sends nothing, allowed + 202 moves to sent/')
})().catch((e) => { failed += 1; console.log(`  ✗ flush\n    ${e.message}`) })
t('the way back: a sent report whose fingerprint Fractera\'s core lists as fixed shows as closed; an unlisted one does not (negative)', () => {
  const sent = cc.closed(other)
  assert.deepEqual(sent, [], 'no creator-fixed.json in this root — nothing closed')
  const { mkdirSync: mk, writeFileSync: wr, readdirSync: rd } = createRequire(import.meta.url)('node:fs')
  const one = JSON.parse(readFileSync(join(other, 'data', 'node', 'creator-reports', 'sent', rd(join(other, 'data', 'node', 'creator-reports', 'sent'))[0]), 'utf8'))
  mk(join(other, 'lib', 'node'), { recursive: true })
  wr(join(other, 'lib', 'node', 'creator-fixed.json'), JSON.stringify({ [one.report.fingerprint]: { commit: 'f00dcafe', step: '855' }, ffff: { commit: 'x' } }))
  const c = cc.closed(other)
  assert.equal(c.length, 1)
  assert.equal(c[0].commit, 'f00dcafe')
})
rmSync(fractera, { recursive: true, force: true })

rmSync(root, { recursive: true, force: true }); rmSync(other, { recursive: true, force: true })
if (failed) { console.log(`===TEST_CREATOR_CHANNEL_FAILED=== ${failed}`); process.exit(1) }
console.log('===TEST_CREATOR_CHANNEL_OK===')

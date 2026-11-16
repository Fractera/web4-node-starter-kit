// TESTS OF «ЗАПОМНИТЬ СЕРВЕР НА 24 ЧАСА» (node step 760-1). `npm run test:launch-remember`, in the prebuild.
// The rule under test: the launch page keeps the server's address, SSH port and access deadline — never the password, never past a day,
// never while the switch is off. Each case has its negative control: a password handed in is dropped; a stale entry is forgotten.
import assert from 'node:assert/strict'
import { REMEMBER_FLAG, REMEMBER_KEY, capUntil, forgetServer, readServer, rememberOn, saveServer, setRememberOn } from '../lib/hosting/launch-remember.mjs'

let passed = 0
const t = (name, fn) => {
  try { fn(); passed += 1; console.log(`  ✓ ${name}`) } catch (e) { console.error(`  ✗ ${name}\n    ${e.message}`); process.exitCode = 1 }
}
const memory = () => {
  const m = new Map()
  return { m, getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) }
}
const NOW = Date.parse('2026-11-16T12:00:00.000Z')
const IN_5H = '2026-11-16T17:00:00.000Z'

console.log('760-1 the launch page remembers the server, never the password')

t('the switch is on by default; off is remembered', () => {
  const s = memory()
  assert.equal(rememberOn(s), true)
  setRememberOn(s, false)
  assert.equal(rememberOn(s), false)
  assert.equal(s.getItem(REMEMBER_FLAG), '0')
  setRememberOn(s, true)
  assert.equal(rememberOn(s), true)
})

t('a connected server comes back with its address, port and deadline', () => {
  const s = memory()
  assert.equal(saveServer(s, { host: '109.199.105.213', port: 22, until: IN_5H }, NOW), true)
  assert.deepEqual(readServer(s, NOW), { host: '109.199.105.213', port: 22, until: IN_5H })
})

t('negative control: a password handed in is never written', () => {
  const s = memory()
  saveServer(s, { host: '109.199.105.213', port: 22, until: IN_5H, password: 'correct horse battery' }, NOW)
  const raw = s.getItem(REMEMBER_KEY)
  assert.deepEqual(Object.keys(JSON.parse(raw)).sort(), ['host', 'port', 'until'])
  assert.equal(raw.includes('correct horse'), false)
})

t('a deadline past now is refused; one past a day is cut to a day', () => {
  const s = memory()
  assert.equal(saveServer(s, { host: '109.199.105.213', port: 22, until: '2026-11-16T11:00:00.000Z' }, NOW), false)
  assert.equal(s.getItem(REMEMBER_KEY), null)
  assert.equal(capUntil('2026-11-20T00:00:00.000Z', NOW), '2026-11-17T12:00:00.000Z')
  assert.equal(capUntil(null, NOW), '2026-11-17T12:00:00.000Z')
})

t('negative control: past its deadline the entry is forgotten, not shown', () => {
  const s = memory()
  saveServer(s, { host: '109.199.105.213', port: 22, until: IN_5H }, NOW)
  assert.equal(readServer(s, Date.parse('2026-11-16T17:00:01.000Z')), null)
  assert.equal(s.getItem(REMEMBER_KEY), null)
})

t('off forgets the server at once and refuses to keep one', () => {
  const s = memory()
  saveServer(s, { host: '109.199.105.213', port: 22, until: IN_5H }, NOW)
  setRememberOn(s, false)
  assert.equal(s.getItem(REMEMBER_KEY), null)
  assert.equal(saveServer(s, { host: '109.199.105.213', port: 22, until: IN_5H }, NOW), false)
  assert.equal(readServer(s, NOW), null)
})

t('not an address, not a port, a damaged entry — nothing kept, nothing shown', () => {
  const s = memory()
  assert.equal(saveServer(s, { host: 'not an address', port: 22, until: IN_5H }, NOW), false)
  assert.equal(saveServer(s, { host: '109.199.105.213', port: 70000, until: IN_5H }, NOW), false)
  s.setItem(REMEMBER_KEY, '{"host":"109.199.105.213","port":22,"until":"2030-01-01T00:00:00.000Z"}')
  assert.equal(readServer(s, NOW), null, 'a deadline further than a day is not believed')
  s.setItem(REMEMBER_KEY, 'not json')
  assert.equal(readServer(s, NOW), null)
  forgetServer(s)
  assert.equal(s.getItem(REMEMBER_KEY), null)
})

t('a browser that refuses storage remembers nothing and throws nothing', () => {
  const broken = { getItem() { throw new Error('denied') }, setItem() { throw new Error('denied') }, removeItem() { throw new Error('denied') } }
  assert.equal(rememberOn(broken), true)
  assert.equal(saveServer(broken, { host: '109.199.105.213', port: 22, until: IN_5H }, NOW), false)
  assert.equal(readServer(broken, NOW), null)
  setRememberOn(broken, false)
  forgetServer(broken)
})

console.log(process.exitCode ? `✗ launch-remember: failed (${passed} passed)` : `✓ launch-remember: ${passed} cases`)

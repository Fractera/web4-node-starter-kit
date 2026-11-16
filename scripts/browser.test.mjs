// The person's browser from Telegram (node step 767): the pure parts of lib/node/browser.cjs — the list, the choice of a tab, the
// addresses, the profiles and the gate of the elements' door. AppleScript itself is proven live (the owner sees the tab in front).
import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const b = createRequire(import.meta.url)(join(ROOT, 'lib', 'node', 'browser.cjs'))
let passed = 0
const t = (name, fn) => {
  try { fn(); passed += 1; console.log(`  ✓ ${name}`) } catch (e) { process.exitCode = 1; console.log(`  ✗ ${name}\n    ${e.message.split('\n').join('\n    ')}`) }
}

const row = (w, tt, active, url, title) => [w, tt, active, url, title].join(b.FS)
const out = [
  row(1, 1, true, 'http://localhost:24680/ru/build/terminal', 'Терминал | Fractera'),
  row(1, 2, false, 'https://mail.google.com/mail/u/0/#inbox', 'Входящие - bo@gmail.com - Gmail'),
  row(2, 1, false, 'https://www.linkedin.com/feed/', '(22) Лента | LinkedIn'),
  row(2, 2, true, 'https://mail.google.com/mail/u/1/', 'Входящие - r6@gmail.com - Gmail'),
].join(b.RS) + b.RS
const rows = b.parseList(out)

t('the AppleScript list becomes rows: window, tab, the active one, address, title (a title with a separator stays whole)', () => {
  assert.equal(rows.length, 4)
  assert.deepEqual(rows[0], { w: 1, t: 1, active: true, url: 'http://localhost:24680/ru/build/terminal', title: 'Терминал | Fractera' })
  assert.equal(b.parseList('').length, 0)
})
t('the choice: the same address beats an address that starts with it, a host, then words; the front window first', () => {
  assert.equal(b.pick(rows, 'https://www.linkedin.com/feed').t, 1)
  assert.equal(b.pick(rows, 'https://mail.google.com/mail/u/1').w, 2, 'the address decides between two Gmail tabs')
  assert.equal(b.pick(rows, 'mail.google.com').w, 1, 'the same host in two windows — the front one')
  assert.equal(b.pick(rows, 'gmail r6').w, 2, 'words: every word must be there')
  assert.equal(b.pick(rows, 'linkedin').w, 2)
})
t('negative: nothing answers — no tab is chosen (focus then opens nothing)', () => {
  assert.equal(b.pick(rows, 'starship flight zzz'), null)
  assert.equal(b.pick(rows, ''), null)
  assert.equal(b.pick(rows, 'https://other.example/'), null)
})
t('addresses: only http(s); javascript:, file:, data: and the empty are refused; a host is read for the list', () => {
  assert.equal(b.cleanUrl('https://example.com/a b'), 'https://example.com/a%20b')
  for (const bad of ['javascript:alert(1)', 'file:///etc/passwd', 'data:text/html,x', '', 'example.com', null]) assert.equal(b.cleanUrl(bad), null, String(bad))
  assert.equal(b.hostOf('https://www.linkedin.com/feed/'), 'www.linkedin.com')
  assert.equal(b.hostOf('chrome://newtab/'), 'newtab')
})
t('profiles: a folder, an exact name or account, the letter case between twins, a unique part; ambiguous and unknown are said', () => {
  const list = [
    { dir: 'Default', name: 'Roman', email: 'bolshiyanov@gmail.com' },
    { dir: 'Profile 10', name: 'Roma', email: 'r672442251@gmail.com' },
    { dir: 'Profile 11', name: 'fractera.ai', email: 'admin@fractera.ai' },
    { dir: 'Profile 7', name: 'Fractera.ai', email: '' },
  ]
  assert.equal(b.resolveProfile('Default', list).profile.dir, 'Default')
  assert.equal(b.resolveProfile('roma', list).profile.dir, 'Profile 10', 'the exact name beats «Roman» containing it')
  assert.equal(b.resolveProfile('bolshiyanov@gmail.com', list).profile.name, 'Roman')
  assert.equal(b.resolveProfile('Fractera.ai', list).profile.dir, 'Profile 7')
  assert.equal(b.resolveProfile('fractera.ai', list).profile.dir, 'Profile 11')
  assert.equal(b.resolveProfile('r67244', list).profile.name, 'Roma')
  assert.equal(b.resolveProfile('rom', list).reason, 'profile-ambiguous')
  assert.equal(b.resolveProfile('nobody', list).reason, 'no-profile')
  assert.equal(b.maskEmail('r672442251@gmail.com'), 'r6…@gmail.com')
})
t('the elements\' door: an element of the architect may; another person\'s element (own subscription) and an app factory may not', () => {
  const tmp = mkdtempSync(join(tmpdir(), 'browser-'))
  try {
    assert.equal(b.elementMay(tmp, 'root'), null, 'no registry — a single project')
    mkdirSync(join(tmp, 'data', 'services', 'anna', 'claude'), { recursive: true })
    assert.equal(b.elementMay(tmp, 'anna'), 'own-subscription')
    mkdirSync(join(tmp, 'WEB4-ITEMS-REGISTRY'), { recursive: true })
    writeFileSync(join(tmp, 'WEB4-ITEMS-REGISTRY', 'web4-items.json'), JSON.stringify({ nodeType: 'factory', items: [] }))
    assert.equal(b.elementMay(tmp, 'root'), 'app-factory')
  } finally { rmSync(tmp, { recursive: true, force: true }) }
})

console.log(process.exitCode ? `===BROWSER_TEST_FAILED=== ${passed} passed` : `===BROWSER_TEST_OK=== ${passed} passed`)

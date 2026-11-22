// node lib/agent-kit/claude-account.test.mjs — whose Claude account an element runs on (node step 833-1), each case with its negative.
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, cpSync, utimesSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
const require = createRequire(import.meta.url)
const here = dirname(fileURLToPath(import.meta.url))
const root = mkdtempSync(join(tmpdir(), 'claude-account-'))
mkdirSync(join(root, 'lib', 'hosting'), { recursive: true })
cpSync(join(here, '..', 'hosting', 'element-wall.cjs'), join(root, 'lib', 'hosting', 'element-wall.cjs'))
mkdirSync(join(root, 'lib', 'web4-items'), { recursive: true })
cpSync(join(here, '..', 'web4-items', 'element-app.cjs'), join(root, 'lib', 'web4-items', 'element-app.cjs'))
mkdirSync(join(root, 'WEB4-ITEMS-REGISTRY'), { recursive: true })
writeFileSync(join(root, 'WEB4-ITEMS-REGISTRY', 'web4-items.json'), JSON.stringify({ services: [{ id: 'shop', kind: 'user', app: 'own' }, { id: 'site', kind: 'user', app: 'project' }] }))
const { accountOf, subscriptionPath, ownEmail } = require('./claude-account.cjs')
const wallOn = { helper: join(root, 'helper'), nodeEnv: join(root, 'node.env'), anyPlatform: true, passwd: join(root, 'passwd') }
writeFileSync(wallOn.helper, ''); writeFileSync(wallOn.nodeEnv, `NODE_DIR=${root}\n`); writeFileSync(wallOn.passwd, 'fe-marina:x:1:1::/:/bin/false\n')
let n = 0
const t = (name, fn) => { fn(); n++; console.log(`  ✓ ${name}`) }
try {
  t('a home computer: no own folder → the node\'s login', () => assert.equal(accountOf(root, 'marina'), 'node'))
  t('a walled element with no own account → none', () => assert.equal(accountOf(root, 'marina', wallOn), 'none'))
  t('negative: an empty own folder is not a sign-in', () => { mkdirSync(join(root, 'data', 'services', 'marina', 'claude'), { recursive: true }); assert.equal(accountOf(root, 'marina', wallOn), 'none') })
  t('signed in (oauthAccount) → own', () => { writeFileSync(join(root, 'data', 'services', 'marina', 'claude', '.claude.json'), JSON.stringify({ oauthAccount: { emailAddress: 'm@x' } })); assert.equal(accountOf(root, 'marina', wallOn), 'own') })
  t('negative: an element without its wall user stays node', () => assert.equal(accountOf(root, 'other', wallOn), 'node'))
  // 834-10 (the owner, Telegram 662): an app of its own runs only on its own account on any node
  t('an app of its own on a home computer, no account → none', () => assert.equal(accountOf(root, 'shop'), 'none'))
  t('negative: a part of the project on a home computer → node', () => assert.equal(accountOf(root, 'site'), 'node'))
  t('an app of its own signed in → own', () => { mkdirSync(join(root, 'data', 'services', 'shop', 'claude'), { recursive: true }); writeFileSync(join(root, 'data', 'services', 'shop', 'claude', '.credentials.json'), '{}'); assert.equal(accountOf(root, 'shop'), 'own') })
  t('the subscription page by address', () => { writeFileSync(join(root, 'data', 'services', 'marina', 'address.json'), '{"address":"marina"}'); assert.equal(subscriptionPath(root, 'marina', 'ru'), '/ru/marina/subscription') })
  // 839-2: a walled element's e-mail is read as the element (its files are 0600 of fe-<id>), once per sign-in
  const fake = (out) => { writeFileSync(join(root, 'run.sh'), `#!/bin/sh\nprintf '%s' '${out}'\n`); return { ...wallOn, prefix: ['/bin/sh'], helper: join(root, 'run.sh') } }
  const wdir = join(root, 'data', 'services', 'walla', 'claude')
  writeFileSync(wallOn.passwd, 'fe-marina:x:1:1::/:/bin/false\nfe-walla:x:2:1::/:/bin/false\n')
  t('negative: a walled element not signed in has no e-mail and the helper is not asked', () => { mkdirSync(wdir, { recursive: true }); assert.equal(ownEmail(root, 'walla', fake('w@x.io')), null) })
  t('a walled element signed in → its e-mail read as the element', () => { writeFileSync(join(wdir, '.credentials.json'), '{}'); assert.equal(ownEmail(root, 'walla', fake('w@x.io')), 'w@x.io') })
  t('the same sign-in → the kept answer, the helper not asked again', () => assert.equal(ownEmail(root, 'walla', fake('other@x.io')), 'w@x.io'))
  t('a new sign-in (the credentials time) → read again', () => { const later = new Date(Date.now() + 5000); utimesSync(join(wdir, '.credentials.json'), later, later); assert.equal(ownEmail(root, 'walla', fake('new@x.io')), 'new@x.io') })
  t('negative: the helper answers no e-mail → null, never garbage', () => { const l2 = new Date(Date.now() + 9000); utimesSync(join(wdir, '.credentials.json'), l2, l2); assert.equal(ownEmail(root, 'walla', fake('not an email')), null) })
} finally { rmSync(root, { recursive: true, force: true }) }
console.log(`claude-account: ${n} ✓`)

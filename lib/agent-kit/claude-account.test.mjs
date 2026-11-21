// node lib/agent-kit/claude-account.test.mjs — whose Claude account an element runs on (node step 833-1), each case with its negative.
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, cpSync } from 'node:fs'
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
const { accountOf, subscriptionPath } = require('./claude-account.cjs')
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
} finally { rmSync(root, { recursive: true, force: true }) }
console.log(`claude-account: ${n} ✓`)

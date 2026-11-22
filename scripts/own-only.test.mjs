// AN ELEMENT THAT MAY RUN ONLY ON ITS OWN CLAUDE ACCOUNT HAS NO CHOICE, AND ITS PAGE'S ACTIONS REACH THE CORE (node step 837-0e).
// `node scripts/own-only.test.mjs` (in the prebuild). The owner, 2026-11-22, on the server (Telegram 843, 845): «Ты предлагаешь пользователю
// выбрать … либо воровать подписку архитектора … ему нельзя давать выбор» · «нет никакой кнопки чтобы войти» · «терминал … должна работать
// независимо от подписки». Measured: every POST of an element's page died as an empty 500 (next.config's 307 — Node's fetch cannot resend
// a body), and the walled element was offered «Подписка узла» with no folder of its own. Skill `server-wall`.

import assert from 'node:assert/strict'
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const req = createRequire(join(ROOT, 'package.json'))
const ca = req(join(ROOT, 'lib', 'agent-kit', 'claude-account.cjs'))

let passed = 0
const t = (name, fn) => { try { fn(); passed++; console.log(`  ✓ ${name}`) } catch (e) { process.exitCode = 1; console.log(`  ✗ ${name}\n    ${e.message}`) } }

// a node of its own: the core's lib, a registry with an app of its own and a part of the project, the app's data folder
const fake = mkdtempSync(join(tmpdir(), 'own-only-'))
symlinkSync(join(ROOT, 'lib'), join(fake, 'lib'))
mkdirSync(join(fake, 'WEB4-ITEMS-REGISTRY'))
writeFileSync(join(fake, 'WEB4-ITEMS-REGISTRY', 'web4-items.json'), JSON.stringify({ services: [
  { id: 'shop', kind: 'user', app: 'own' }, { id: 'site', kind: 'user', app: 'project' },
] }))
mkdirSync(join(fake, 'data', 'services', 'shop'), { recursive: true })

t('an app of its own may run only on its own account; a part of the project on a computer may choose', () => {
  assert.equal(ca.ownOnly(fake, 'shop'), true)
  assert.equal(ca.ownOnly(fake, 'site'), false)
  assert.equal(ca.ownOnly(fake, '../shop'), false)
})
t('its own folder is made inside its data folder, and a second call is fine', () => {
  const a = ca.ensureOwnHome(fake, 'shop')
  assert.deepEqual(a, { ok: true, dir: join(fake, 'data', 'services', 'shop', 'claude') })
  assert.ok(existsSync(a.dir))
  assert.equal(ca.ensureOwnHome(fake, 'shop').ok, true)
})
t('negative: no data folder — nothing is made outside the wall', () => {
  assert.deepEqual(ca.ensureOwnHome(fake, 'site'), { ok: false, reason: 'no-data-folder' })
  assert.equal(existsSync(join(fake, 'data', 'services', 'site')), false)
  assert.deepEqual(ca.ensureOwnHome(fake, 'a/../b'), { ok: false, reason: 'bad-id' })
})
t('signed in = its credentials file EXISTS, even unreadable to the node (Claude writes it 0600); the e-mail from .claude.json', () => {
  const dir = join(fake, 'data', 'services', 'shop', 'claude')
  assert.equal(ca.ownSignedIn(fake, 'shop'), false)
  writeFileSync(join(dir, '.credentials.json'), '{"secret":"never read"}')
  chmodSync(join(dir, '.credentials.json'), 0o000)
  assert.equal(ca.ownSignedIn(fake, 'shop'), true)
  assert.equal(ca.ownEmail(fake, 'shop'), null)
  writeFileSync(join(dir, '.claude.json'), JSON.stringify({ oauthAccount: { emailAddress: 'marina@example.com' } }))
  assert.equal(ca.ownEmail(fake, 'shop'), 'marina@example.com')
  chmodSync(join(dir, '.credentials.json'), 0o600)
})

const door = (g) => readFileSync(join(ROOT, 'app', '[lang]', '(architectLayer)', 'architect', g, 'agent-api', 'claude-auth', 'route.ts'), 'utf8')
t('the door: an own-only element gets no choice (canOwn false), its own folder (own true) and no way back to the node\'s login', () => {
  for (const g of ['[item]', 'auth']) {
    const src = door(g)
    const get = src.slice(src.indexOf('export async function GET'), src.indexOf('export async function POST'))
    const post = src.slice(src.indexOf('export async function POST'))
    assert.ok(get.indexOf('claudeAccount.ownOnly(process.cwd(), service)') > 0 && get.indexOf('claudeAccount.ownOnly') < get.indexOf('const own = '), `${g}: own-only first`)
    assert.ok(get.includes('canOwn: false, own: true, walledNone: false'), g)
    assert.ok(post.indexOf('claudeAccount.ownOnly(process.cwd(), service)') < post.indexOf('if (running(service))'), `${g}: no switch for own-only`)
    assert.ok(post.includes('if (!body.own) return NextResponse.json({ ok: false, reason: "own-only" }'), g)
    assert.ok(post.includes('reason: (e as NodeJS.ErrnoException)?.code ?? "switch-failed"'), `${g}: a failure says its reason`)
  }
})
t('the agent: an own-only element gets its folder before the refusal, so the terminal opens before sign-in', () => {
  const src = readFileSync(join(ROOT, 'app', '[lang]', '(architectLayer)', 'architect', 'kits', '_agent-kit', 'core', 'server', 'bridge.cjs'), 'utf8')
  const make = src.indexOf('ownAccountRule().ensureOwnHome(process.cwd(), element).ok) ownHome = ownClaudeDir(element)')
  const refuse = src.indexOf("return { ok: false, reason: 'no-account' }")
  assert.ok(make > 0 && refuse > make, `make ${make}, refuse ${refuse}`)
  assert.ok(src.includes('if (serviceDir(service) && ownAccountRule().ownOnly(process.cwd(), service)) ownAccountRule().ensureOwnHome(process.cwd(), service)'))
})
t('next.config: an element\'s keyed call skips the redirect AND the rewrite (a 307 loses a POST body; the rewrite doubles «architect»)', () => {
  const cfg = readFileSync(join(ROOT, 'next.config.ts'), 'utf8')
  const keyed = 'missing: [{ type: "header", key: "x-node-key" }]'
  assert.ok(cfg.includes(`{ source: "/:lang([a-z]{2})/architect/:path*", destination: "/:lang/:path*", permanent: false, ${keyed} }`))
  assert.ok(cfg.includes(`{ source: "/:lang([a-z]{2})/:path*", destination: "/:lang/architect/:path*", ${keyed} }`))
})

rmSync(fake, { recursive: true, force: true })
console.log(process.exitCode ? `===OWN_ONLY_FAILED=== ${passed} passed` : `===OWN_ONLY_OK=== ${passed} passed`)

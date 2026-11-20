// THE WALL BETWEEN ELEMENTS ON A DEDICATED SERVER, DRY (node step 811-2). `npm run test:element-wall` — not in prebuild (a server-side
// shell). The helper `scripts/dedicated-server/fractera-element.sh` runs with FRACTERA_ELEMENT_DRY=1: it prints every act instead of
// running it, and its /etc/fractera and its root are temporary folders of this machine. Every verb is tried with what it must refuse.
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, realpathSync, symlinkSync, writeFileSync, existsSync, cpSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

if (process.platform === 'win32') { console.log('· skipped on Windows: the server side is a Linux shell'); process.exit(0) }
const here = fileURLToPath(new URL('.', import.meta.url))
const DS = join(here, 'dedicated-server')
const helper = join(DS, 'fractera-element.sh')
const tmp = (p) => realpathSync(mkdtempSync(join(tmpdir(), p)))
let passed = 0
const t = (name, fn) => { try { fn(); passed += 1; console.log(`  ✓ ${name}`) } catch (e) { console.error(`  ✗ ${name}\n    ${e.message.split('\n').slice(0, 4).join('\n    ')}`); process.exitCode = 1 } }

// One «server»: root R, /etc/fractera in ETC, the node in R/home/fractera/node with one custom element «shop».
const R = tmp('wall-root-')
const ETC = join(R, 'etc', 'fractera')
const NODE = join(R, 'home', 'fractera', 'node')
mkdirSync(join(ETC, 'elements'), { recursive: true })
mkdirSync(join(NODE, 'WEB4-ITEMS', 'custom', 'shop'), { recursive: true })
mkdirSync(join(NODE, 'WEB4-ITEMS', 'native', 'auth'), { recursive: true })
mkdirSync(join(NODE, 'data', 'services', 'build'), { recursive: true })
mkdirSync(join(NODE, 'lib', 'agent-kit'), { recursive: true })
mkdirSync(join(NODE, 'scripts', 'dedicated-server'), { recursive: true })
writeFileSync(join(NODE, 'lib', 'agent-kit', 'relay.cjs'), '// relay\n')
writeFileSync(join(NODE, '.env.local'), 'SECRET=1\n')
writeFileSync(join(ETC, 'node.env'), `NODE_USER=fractera\nNODE_DIR=${NODE}\n`)
const outside = tmp('wall-outside-')
symlinkSync(outside, join(NODE, 'WEB4-ITEMS', 'custom', 'linked'))

const helperRun = (args, extra = {}) => {
  const r = spawnSync('bash', [helper, ...args], { encoding: 'utf8', env: { PATH: process.env.PATH, FRACTERA_ELEMENT_DRY: '1', FRACTERA_ELEMENT_ETC: ETC, FRACTERA_ELEMENT_ROOT: R, ...extra } })
  return { status: r.status, out: `${r.stdout}${r.stderr}` }
}
const refused = (args, why) => { const r = helperRun(args); assert.notEqual(r.status, 0, `accepted: ${args.join(' ')}\n${r.out}`); if (why) assert.match(r.out, why); return r }

console.log('811-2 the helper parses')
t('bash -n (this machine\'s bash and the script\'s syntax)', () => {
  const r = spawnSync('bash', ['-n', helper], { encoding: 'utf8' }); assert.equal(r.status, 0, r.stderr)
})
t('without a verb it names its verbs and refuses', () => { refused([], /verbs: add/) })

console.log('811-2 add — the user, its home, its record, ACLs on its folder and data folder')
t('add shop WEB4-ITEMS/custom/shop', () => {
  const r = helperRun(['add', 'shop', 'WEB4-ITEMS/custom/shop'])
  assert.equal(r.status, 0, r.out)
  assert.match(r.out, /DRY: useradd --system --gid fractera-el --home-dir \S+\/var\/lib\/fractera-el\/shop --create-home --shell \/usr\/sbin\/nologin fe-shop/)
  assert.match(r.out, /install -d -m 2770 -o fractera -g fractera \S+\/data\/services\/shop/)
  assert.match(r.out, /record \S+elements\/shop FOLDER=WEB4-ITEMS\/custom\/shop/)
  assert.match(r.out, /setfacl -R -P -m u:fe-shop:rwX\\?,g:fractera:rwX\\?,o::---\\?,d:u:fe-shop:rwX/)
  assert.equal((r.out.match(/setfacl -R -P/g) ?? []).length, 2, 'the folder and the data folder')
  assert.match(r.out, /ELEMENT_ADDED shop/)
})
t('negative: a repeat add (the user exists) never walks the folder as root — the two top folders only', () => {
  const shim = tmp('wall-shim-'); writeFileSync(join(shim, 'id'), '#!/bin/sh\nexit 0\n', { mode: 0o755 })
  const r = helperRun(['add', 'shop', 'WEB4-ITEMS/custom/shop'], { PATH: `${shim}:${process.env.PATH}` })
  assert.equal(r.status, 0, r.out)
  assert.doesNotMatch(r.out, /useradd|setfacl -R/)
  assert.equal((r.out.match(/DRY: setfacl -m u:fe-shop/g) ?? []).length, 2)
})
t('negative: a bad id (capitals, too long for useradd, a leading dash)', () => {
  refused(['add', 'Shop', 'WEB4-ITEMS/custom/shop'], /bad element id/)
  refused(['add', 'a'.repeat(30), 'WEB4-ITEMS/custom/shop'], /bad element id/)
  refused(['add', '-x', 'WEB4-ITEMS/custom/shop'], /bad element id/)
  assert.equal(helperRun(['add', 'a'.repeat(29), 'WEB4-ITEMS/custom/shop']).status, 0, '29 characters → fe-<id> is 32, useradd\'s limit')
})
t('negative: a folder outside WEB4-ITEMS, with .., absolute, missing', () => {
  refused(['add', 'shop', 'data/node'], /bad element folder/)
  refused(['add', 'shop', 'WEB4-ITEMS/custom/..'], /bad element folder/)
  refused(['add', 'shop', '/etc'], /bad element folder/)
  refused(['add', 'shop', 'WEB4-ITEMS/custom/none'], /not a real folder/)
})
t('negative: a symlinked element folder is never opened', () => { refused(['add', 'linked', 'WEB4-ITEMS/custom/linked'], /not a real folder/) })
t('negative: a symlinked data folder is never opened', () => {
  symlinkSync(outside, join(NODE, 'data', 'services', 'evil'))
  mkdirSync(join(NODE, 'WEB4-ITEMS', 'custom', 'evil'))
  refused(['add', 'evil', 'WEB4-ITEMS/custom/evil'], /data folder is not a real folder/)
})

console.log('811-2 run — as fe-<id>, in its folder, a clean environment')
writeFileSync(join(ETC, 'elements', 'shop'), 'FOLDER=WEB4-ITEMS/custom/shop\n')
t('run shop PORT=24700 -- node server.js', () => {
  const r = helperRun(['run', 'shop', 'PORT=24700', 'CLAUDE_CONFIG_DIR=/x/y', '--', 'node', 'server.js'])
  assert.equal(r.status, 0, r.out)
  assert.match(r.out, /setpriv --no-new-privs --reuid=fe-shop --regid=fractera-el --init-groups -- env -i HOME=\S+fractera-el\/shop USER=fe-shop/)
  assert.match(r.out, /PATH=\S+\/usr\/local\/lib\/fractera\/bin:\/usr\/local\/bin:\/usr\/bin:\/bin DISABLE_AUTOUPDATER=1 PORT=24700 CLAUDE_CONFIG_DIR=\/x\/y node server.js$/m)
})
t('negative: LD_PRELOAD, PATH, HOME, NODE_OPTIONS, BASH_ENV are refused', () => {
  for (const e of ['LD_PRELOAD=/x.so', 'PATH=/tmp', 'HOME=/root', 'NODE_OPTIONS=--require=/x', 'BASH_ENV=/x']) refused(['run', 'shop', e, '--', 'node'], /not allowed/)
})
t('negative: a bad key, an entry without «=», no «--», no program', () => {
  refused(['run', 'shop', '1A=x', '--', 'node'], /bad environment entry/)
  refused(['run', 'shop', 'A;rm=x', '--', 'node'], /bad environment entry/)
  refused(['run', 'shop', 'node'], /bad environment entry/)
  refused(['run', 'shop', 'A=1'], /run <id>/)
  refused(['run', 'shop', '--'], /run <id>/)
})
t('negative: an element without root\'s record cannot run (exit 3)', () => { assert.equal(refused(['run', 'other', '--', 'node'], /no element other/).status, 3) })

console.log('811-2 signal and stop — only that element\'s processes')
t('negative: a bad pid, a bad signal, a process that is not the element\'s', () => {
  refused(['signal', 'shop', '1; rm', 'TERM'], /bad pid/)
  refused(['signal', 'shop', '1', 'STOP'], /bad signal/)
  assert.equal(refused(['signal', 'shop', String(process.pid), 'TERM'], /is not element shop's/).status, 3)
})

console.log('811-2 walls — the node closed to element users, the allow list opened')
const list = join(NODE, 'scripts', 'dedicated-server', 'element-readable.txt')
t('walls with one readable file', () => {
  writeFileSync(list, '# comment\nlib/agent-kit/relay.cjs\n\n')
  const r = helperRun(['walls'])
  assert.equal(r.status, 0, r.out)
  assert.match(r.out, /DRY: chmod 0711 \S+\/home\/fractera \S+\/home\/fractera\/node/)
  assert.match(r.out, /find \S+node -mindepth 1 \( -path \S+WEB4-ITEMS\/custom\/shop -o -path \S+data\/services\/shop -o -false \) -prune -o ! -type l -exec chmod o-rwx/)
  assert.doesNotMatch(r.out, /-path \S+native\/auth/, 'a native element is closed, never pruned')
  assert.match(r.out, /chmod o-rwx \S+data\/services\/build/, 'the node\'s own data folder closed')
  assert.match(r.out, /chmod o\+r \S+lib\/agent-kit\/relay\.cjs/)
  assert.match(r.out, /chmod o\+x \S+node\/lib\/agent-kit\n[\s\S]*chmod o\+x \S+node\/lib\n/)
  assert.match(r.out, /chmod 0600 \S+\/\.env\.local/)
  assert.match(r.out, /WALLS_APPLIED 1/)
})
t('negative: the allow list refuses .., an absolute path, a missing file, a symlink', () => {
  for (const bad of ['../../etc/passwd', '/etc/passwd', 'lib/none.cjs', 'lib/agent-kit/../../.env.local']) {
    writeFileSync(list, `${bad}\n`); refused(['walls'], /bad readable path|not a file of the node/)
  }
  symlinkSync(join(NODE, '.env.local'), join(NODE, 'lib', 'agent-kit', 'env-link.cjs'))
  writeFileSync(list, 'lib/agent-kit/env-link.cjs\n'); refused(['walls'], /not a file of the node/)
  writeFileSync(list, '')
})

console.log('811-2 claude-share — only the official installer\'s file, only a Linux program')
const home = join(R, 'home', 'fractera')
const versions = join(home, '.local', 'share', 'claude', 'versions')
mkdirSync(versions, { recursive: true }); mkdirSync(join(home, '.local', 'bin'), { recursive: true })
writeFileSync(join(versions, '2.1.0'), Buffer.concat([Buffer.from([0x7f, 0x45, 0x4c, 0x46]), Buffer.alloc(16)]))
t('claude-share copies the version the link points to', () => {
  symlinkSync(join(versions, '2.1.0'), join(home, '.local', 'bin', 'claude'))
  const r = helperRun(['claude-share'])
  assert.equal(r.status, 0, r.out)
  assert.match(r.out, /install -m 0755 -o root -g root \S+versions\/2\.1\.0 \S+usr\/local\/lib\/fractera\/bin\/claude/)
})
t('negative: a link outside ~/.local/share/claude, a file that is not ELF', () => {
  const fake = join(outside, 'claude'); writeFileSync(fake, '\x7fELF....')
  const link = join(home, '.local', 'bin', 'claude')
  spawnSync('rm', ['-f', link]); symlinkSync(fake, link)
  refused(['claude-share'], /not where the official installer/)
  writeFileSync(join(versions, 'script'), '#!/bin/sh\n')
  spawnSync('rm', ['-f', link]); symlinkSync(join(versions, 'script'), link)
  refused(['claude-share'], /not a Linux program/)
})

console.log('811-2 the installer carries the wall')
t('prepare.sh (DRY_RUN): acl, the group, both helpers in one sudoers line, root\'s records folder', () => {
  const d = tmp('wall-prepare-')
  for (const f of ['prepare.sh', 'stages.sh', 'fractera-root.sh', 'fractera-element.sh']) cpSync(join(DS, f), join(d, f))
  const r = spawnSync('bash', [join(d, 'prepare.sh'), 'fractera', 'node', '22'], { encoding: 'utf8', env: { PATH: process.env.PATH, DRY_RUN: '1' } })
  assert.equal(r.status, 0, r.stderr)
  assert.match(r.stdout, /DRY apt: .*psmisc acl'?$/m)
  assert.match(r.stdout, /DRY element-group: getent group fractera-el \S+ \|\| groupadd --system fractera-el/)
  assert.match(r.stdout, /install -m 0755 -o root -g root '\S+fractera-element\.sh' \/usr\/local\/sbin\/fractera-element/)
  assert.match(r.stdout, /NOPASSWD: \/usr\/local\/sbin\/fractera-root, \/usr\/local\/sbin\/fractera-element/)
  assert.match(r.stdout, /install -d -m 0700 \/etc\/fractera\/elements/)
  const order = ['DRY user:', 'DRY element-group:', 'DRY helper:'].map((s) => r.stdout.indexOf(s))
  assert.ok(order.every((n, i) => n >= 0 && (i === 0 || n > order[i - 1])), `order ${order}`)
})
t('start.sh applies the wall before the node starts; launch uploads the helper', () => {
  const s = readFileSync(join(DS, 'start.sh'), 'utf8')
  const a = s.indexOf('fractera-element claude-share'), b = s.indexOf('fractera-element walls'), c = s.indexOf("stage serve")
  assert.ok(a > 0 && b > a && c > b, 'claude-share → walls → serve')
  assert.match(readFileSync(join(DS, 'launch.mjs'), 'utf8'), /'fractera-root\.sh', 'fractera-element\.sh'/)
})
t('clear.sh (a node cleared) erases the element users\' homes and root\'s records of them', () => {
  const base = tmp('wall-clear-'); const h = tmp('wall-clear-home-'); const rt = tmp('wall-clear-rootdir-'); const ng = tmp('wall-clear-nginx-')
  mkdirSync(join(base, 'var', 'lib', 'fractera-el', 'shop'), { recursive: true }); mkdirSync(join(base, 'etc', 'fractera', 'elements'), { recursive: true })
  writeFileSync(join(base, 'etc', 'fractera', 'elements', 'shop'), 'FOLDER=WEB4-ITEMS/custom/shop\n')
  mkdirSync(join(h, 'node'))
  const r = spawnSync('bash', [join(DS, 'clear.sh'), '--node', 'node', '--dir', join(rt, '.fractera')], { encoding: 'utf8', env: { PATH: process.env.PATH, CLEAR_TEST: '1', CLEAR_HOME: h, CLEAR_ROOT: rt, CLEAR_NGINX: ng, CLEAR_BASE: base } })
  assert.equal(r.status, 0, r.stderr)
  assert.ok(!existsSync(join(base, 'var', 'lib', 'fractera-el', 'shop')) && !existsSync(join(base, 'etc', 'fractera', 'elements', 'shop')), r.stdout)
  assert.ok(existsSync(join(base, 'var', 'lib', 'fractera-el')), 'the homes folder itself stays (prepare.sh owns it)')
})

console.log('811-3 the node\'s side — birth and deletion ask the helper only where the wall is')
{
  const require = createRequire(import.meta.url)
  const wall = require('../lib/hosting/element-wall.cjs')
  const W = tmp('wall-node-side-')
  const fake = join(W, 'fractera-element'); const calls = join(W, 'calls.txt')
  writeFileSync(fake, `#!/bin/sh\necho "$@" >> '${calls}'\necho ELEMENT_OK\n`, { mode: 0o755 })
  const nodeEnv = join(W, 'node.env'); writeFileSync(nodeEnv, `NODE_USER=fractera\nNODE_DIR=${NODE}\n`)
  const opts = { helper: fake, nodeEnv, anyPlatform: true, prefix: ['env'] }
  const shop = join(NODE, 'WEB4-ITEMS', 'custom', 'shop')
  t('a custom element gets its user: add <id> WEB4-ITEMS/custom/<address>', () => {
    const r = wall.ensureElementUser(NODE, { id: 'shop', kind: 'user' }, shop, opts)
    assert.equal(r.ok, true, r.out)
    assert.equal(readFileSync(calls, 'utf8').trim(), 'add shop WEB4-ITEMS/custom/shop')
  })
  t('negative: a native element never gets a user', () => {
    assert.equal(wall.ensureElementUser(NODE, { id: 'auth', kind: 'core' }, join(NODE, 'WEB4-ITEMS', 'native', 'auth'), opts).skipped, 'native')
  })
  t('negative: no wall when the helper is missing, node.env names another node, or the machine is not Linux', () => {
    assert.equal(wall.wallOn(NODE, { ...opts, helper: join(W, 'none') }), false)
    const other = join(W, 'other.env'); writeFileSync(other, `NODE_DIR=${W}\n`)
    assert.equal(wall.wallOn(NODE, { ...opts, nodeEnv: other }), false)
    if (process.platform !== 'linux') assert.equal(wall.wallOn(NODE, { helper: fake, nodeEnv }), false)
    assert.equal(wall.ensureElementUser(NODE, { id: 'shop', kind: 'user' }, shop, { ...opts, helper: join(W, 'none') }).skipped, 'no-wall')
  })
  t('negative: a folder outside WEB4-ITEMS/<kind>/<address> is refused before the helper', () => {
    const before = readFileSync(calls, 'utf8')
    assert.equal(wall.ensureElementUser(NODE, { id: 'x', kind: 'user' }, join(NODE, 'data'), opts).ok, false)
    assert.equal(readFileSync(calls, 'utf8'), before, 'the helper was not called')
  })
  t('deletion: remove <id> (async, for the door)', async () => {
    const r = await wall.removeElementUserAsync(NODE, 'shop', opts)
    assert.equal(r.ok, true)
  })
  await new Promise((r) => setTimeout(r, 300))
  t('deletion reached the helper', () => { assert.match(readFileSync(calls, 'utf8'), /^remove shop$/m) })
  t('the installer and the delete door call it', () => {
    assert.match(readFileSync(join(here, 'services-install.mjs'), 'utf8'), /element-wall\.cjs'\)\.ensureElementUser\(ROOT, entry, dir\)/)
    assert.match(readFileSync(join(here, '..', 'lib', 'web4-items', 'element-delete.ts'), 'utf8'), /removeElementUserAsync\(ROOT, id\)/)
  })
}

console.log(`\n${passed} passed${process.exitCode ? ', some FAILED' : ''}`)

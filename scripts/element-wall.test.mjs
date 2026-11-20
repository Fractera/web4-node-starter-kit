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
const ta = async (name, fn) => { try { await fn(); passed += 1; console.log(`  ✓ ${name}`) } catch (e) { console.error(`  ✗ ${name}\n    ${e.message.split('\n').slice(0, 4).join('\n    ')}`); process.exitCode = 1 } }
const t = (name, fn) => { try { fn(); passed += 1; console.log(`  ✓ ${name}`) } catch (e) { console.error(`  ✗ ${name}\n    ${e.message.split('\n').slice(0, 4).join('\n    ')}`); process.exitCode = 1 } }

// One «server»: root R, /etc/fractera in ETC, the node in R/home/fractera/node with one custom element «shop» (kind user) and a native «auth» (kind core).
const R = tmp('wall-root-')
const ETC = join(R, 'etc', 'fractera')
const NODE = join(R, 'home', 'fractera', 'node')
mkdirSync(join(ETC, 'elements'), { recursive: true })
mkdirSync(join(NODE, 'WEB4-ITEMS', 'user', 'shop'), { recursive: true })
mkdirSync(join(NODE, 'WEB4-ITEMS', 'core', 'auth'), { recursive: true })
mkdirSync(join(NODE, 'data', 'services', 'build'), { recursive: true })
mkdirSync(join(NODE, 'lib', 'agent-kit'), { recursive: true })
mkdirSync(join(NODE, 'scripts', 'dedicated-server'), { recursive: true })
writeFileSync(join(NODE, 'lib', 'agent-kit', 'relay.cjs'), '// relay\n')
writeFileSync(join(NODE, '.env.local'), 'SECRET=1\n')
writeFileSync(join(ETC, 'node.env'), `NODE_USER=fractera\nNODE_DIR=${NODE}\n`)
const outside = tmp('wall-outside-')
symlinkSync(outside, join(NODE, 'WEB4-ITEMS', 'user', 'linked'))

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
t('add shop WEB4-ITEMS/user/shop', () => {
  const r = helperRun(['add', 'shop', 'WEB4-ITEMS/user/shop'])
  assert.equal(r.status, 0, r.out)
  assert.match(r.out, /DRY: useradd --system --gid fractera-el --home-dir \S+\/var\/lib\/fractera-el\/shop --create-home --shell \/usr\/sbin\/nologin fe-shop/)
  assert.match(r.out, /install -d -m 2770 -o fractera -g fractera \S+\/data\/services\/shop/)
  assert.match(r.out, /record \S+elements\/shop FOLDER=WEB4-ITEMS\/user\/shop/)
  assert.match(r.out, /setfacl -R -P -m u:fe-shop:rwX\\?,g:fractera:rwX\\?,o::---\\?,d:u:fe-shop:rwX/)
  assert.equal((r.out.match(/setfacl -R -P/g) ?? []).length, 2, 'the folder and the data folder')
  assert.match(r.out, /ELEMENT_ADDED shop/)
})
t('negative: a repeat add (the user exists) never walks the folder as root — the two top folders only', () => {
  const shim = tmp('wall-shim-'); writeFileSync(join(shim, 'id'), '#!/bin/sh\nexit 0\n', { mode: 0o755 })
  const r = helperRun(['add', 'shop', 'WEB4-ITEMS/user/shop'], { PATH: `${shim}:${process.env.PATH}` })
  assert.equal(r.status, 0, r.out)
  assert.doesNotMatch(r.out, /useradd|setfacl -R/)
  assert.equal((r.out.match(/DRY: setfacl -m u:fe-shop/g) ?? []).length, 2)
})
t('negative: a bad id (capitals, too long for useradd, a leading dash)', () => {
  refused(['add', 'Shop', 'WEB4-ITEMS/user/shop'], /bad element id/)
  refused(['add', 'a'.repeat(30), 'WEB4-ITEMS/user/shop'], /bad element id/)
  refused(['add', '-x', 'WEB4-ITEMS/user/shop'], /bad element id/)
  assert.equal(helperRun(['add', 'a'.repeat(29), 'WEB4-ITEMS/user/shop']).status, 0, '29 characters → fe-<id> is 32, useradd\'s limit')
})
t('negative: a folder outside WEB4-ITEMS, with .., absolute, missing', () => {
  refused(['add', 'shop', 'data/node'], /bad element folder/)
  refused(['add', 'shop', 'WEB4-ITEMS/user/..'], /bad element folder/)
  refused(['add', 'shop', '/etc'], /bad element folder/)
  refused(['add', 'shop', 'WEB4-ITEMS/user/none'], /not a real folder/)
})
t('negative: a symlinked element folder is never opened', () => { refused(['add', 'linked', 'WEB4-ITEMS/user/linked'], /not a real folder/) })
t('negative: a symlinked data folder is never opened', () => {
  symlinkSync(outside, join(NODE, 'data', 'services', 'evil'))
  mkdirSync(join(NODE, 'WEB4-ITEMS', 'user', 'evil'))
  refused(['add', 'evil', 'WEB4-ITEMS/user/evil'], /data folder is not a real folder/)
})

console.log('811-2 run — as fe-<id>, in its folder, a clean environment')
writeFileSync(join(ETC, 'elements', 'shop'), 'FOLDER=WEB4-ITEMS/user/shop\n')
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
  assert.match(r.out, /find \S+node -mindepth 1 \( -path \S+WEB4-ITEMS\/user\/shop -o -path \S+data\/services\/shop -o -false \) -prune -o ! -type l -exec chmod o-rwx/)
  assert.doesNotMatch(r.out, /-path \S+core\/auth/, 'a native element is closed, never pruned')
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
  assert.match(r.stdout, /install -d -m 0755 \/etc\/fractera\/elements/)
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
  writeFileSync(join(base, 'etc', 'fractera', 'elements', 'shop'), 'FOLDER=WEB4-ITEMS/user/shop\n')
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
  const shop = join(NODE, 'WEB4-ITEMS', 'user', 'shop')
  t('a custom element gets its user: add <id> WEB4-ITEMS/user/<address>', () => {
    const r = wall.ensureElementUser(NODE, { id: 'shop', kind: 'user' }, shop, opts)
    assert.equal(r.ok, true, r.out)
    assert.equal(readFileSync(calls, 'utf8').trim(), 'add shop WEB4-ITEMS/user/shop')
  })
  t('negative: a native element never gets a user', () => {
    assert.equal(wall.ensureElementUser(NODE, { id: 'auth', kind: 'core' }, join(NODE, 'WEB4-ITEMS', 'core', 'auth'), opts).skipped, 'native')
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
    const inst = readFileSync(join(here, 'services-install.mjs'), 'utf8')
    assert.match(inst, /wall\.ensureElementUser\(ROOT, entry, dir\)/)
    assert.ok(inst.indexOf('wall.ensureElementUser(ROOT, entry, dir)') < inst.indexOf("run('npm', ['ci'"), 'the user exists before the element\'s install scripts run')
    assert.match(readFileSync(join(here, '..', 'lib', 'web4-items', 'element-delete.ts'), 'utf8'), /removeElementUserAsync\(ROOT, id\)/)
  })
}

console.log('811-4 the element\'s code runs as its own user — short programs by run, long ones as units')
writeFileSync(join(ETC, 'elements', 'shop'), 'FOLDER=WEB4-ITEMS/user/shop\n')
mkdirSync(join(NODE, 'WEB4-ITEMS', 'user', 'shop', '.next', 'standalone'), { recursive: true })
t('unit-start shop: a transient unit as fe-shop, the group stopped as one, the log in root\'s folder', () => {
  const r = helperRun(['unit-start', 'shop', '--in', '.next/standalone', 'PORT=24700', '--', '/usr/bin/node', 'server.js'])
  assert.equal(r.status, 0, r.out)
  assert.match(r.out, /systemd-run --quiet --collect --unit=fractera-el-shop-serve --uid=fe-shop --gid=fractera-el -p WorkingDirectory=\S+user\/shop\/\.next\/standalone/)
  assert.match(r.out, /-p KillMode=control-group -p TimeoutStopSec=10 -p StandardOutput=append:\S+var\/log\/fractera-el\/shop-serve\.log/)
  assert.match(r.out, /--setenv=HOME=\S+fractera-el\/shop .*--setenv=PORT=24700 -- \/usr\/bin\/node server\.js/)
  assert.match(r.out, /UNIT_STARTED fractera-el-shop-serve/)
})
t('unit-start --unit preview; unit-stop --unit preview', () => {
  assert.match(helperRun(['unit-start', 'shop', '--unit', 'preview', '--', 'node']).out, /--unit=fractera-el-shop-preview/)
  assert.match(helperRun(['unit-stop', 'shop', '--unit', 'preview']).out, /DRY: systemctl stop fractera-el-shop-preview/)
})
t('negative: --in outside the folder, a bad unit tag, a unit of an element without a record', () => {
  refused(['unit-start', 'shop', '--in', '..', '--', 'node'], /bad --in folder/)
  refused(['unit-start', 'shop', '--in', '/etc', '--', 'node'], /bad --in folder/)
  refused(['run', 'shop', '--in', 'none', '--', 'node'], /bad --in folder/)
  refused(['unit-start', 'shop', '--unit', 'Serve;x', '--', 'node'], /bad unit tag/)
  refused(['unit-stop', 'shop', '--unit', '../x'], /bad unit tag/)
  assert.equal(refused(['unit-start', 'other', '--', 'node'], /no element other/).status, 3)
})
t('the shim parses; pm2 only ever signals the node\'s own bash', () => {
  const r = spawnSync('bash', ['-n', join(DS, 'element-shim.sh')], { encoding: 'utf8' }); assert.equal(r.status, 0, r.stderr)
  const sh = readFileSync(join(DS, 'element-shim.sh'), 'utf8')
  assert.match(sh, /trap stop TERM INT HUP/); assert.match(sh, /systemctl is-active --quiet "\$unit"/)
})
{
  const require = createRequire(import.meta.url)
  const wall = require('../lib/hosting/element-wall.cjs')
  const W = tmp('wall-411-')
  const fake = join(W, 'fractera-element'); writeFileSync(fake, '#!/bin/sh\n', { mode: 0o755 })
  const nodeEnv = join(W, 'node.env'); writeFileSync(nodeEnv, `NODE_USER=fractera\nNODE_DIR=${NODE}\n`)
  const passwd = join(W, 'passwd'); writeFileSync(passwd, 'root:x:0:0::/root:/bin/bash\nfe-shop:x:998:997::/var/lib/fractera-el/shop:/usr/sbin/nologin\n')
  mkdirSync(join(NODE, 'WEB4-ITEMS-REGISTRY'), { recursive: true })
  writeFileSync(join(NODE, 'WEB4-ITEMS-REGISTRY', 'web4-items.json'), JSON.stringify({ services: [{ id: 'shop', kind: 'user' }, { id: 'auth', kind: 'core' }] }))
  const opts = { helper: fake, nodeEnv, passwd, anyPlatform: true, prefix: ['/usr/bin/sudo', '-n'], node: '/usr/bin/node' }
  const shop = join(NODE, 'WEB4-ITEMS', 'user', 'shop')
  // walledEntryAt reads the registry through paths.cjs of THIS node — the test node is elsewhere, so the entry's folder is given by
  // the real paths module only when the test's ROOT matches; check by what the module returns
  const at = wall.walledEntryAt(NODE, shop)
  t('serveApp: pm2 runs the shim with the node\'s order only', () => {
    assert.ok(at && at.entry.id === 'shop', 'the folder maps to its element')
    const app = wall.serveApp(NODE, { id: 'shop', kind: 'user' }, { port: 24700, start: { args: ['server.js'], cwd: join(shop, '.next', 'standalone') } }, opts)
    assert.equal(app.interpreter, '/bin/bash'); assert.match(app.script, /element-shim\.sh$/)
    assert.deepEqual(app.args, ['shop', '--in', '.next/standalone', 'PORT=24700', 'HOSTNAME=127.0.0.1', 'NODE_ENV=production', '--', '/usr/bin/node', 'server.js'])
  })
  t('negative: no shim for a native, without the user, without the wall', () => {
    const st = { port: 1, start: { args: ['s.js'] } }
    assert.equal(wall.serveApp(NODE, { id: 'auth', kind: 'core' }, st, opts), null)
    assert.equal(wall.serveApp(NODE, { id: 'shop', kind: 'user' }, st, { ...opts, passwd: join(W, 'none') }), null)
    assert.equal(wall.serveApp(NODE, { id: 'shop', kind: 'user' }, st, { ...opts, helper: join(W, 'none') }), null)
  })
  t('asElement: never the node\'s environment — only what is given, the refused keys dropped', () => {
    const w = wall.asElement(NODE, shop, 'npm', ['run', 'build'], { NEXT_DIST_DIR: '.next-b', LD_PRELOAD: '/x', PATH: '/tmp', DATA_SECRET: undefined }, opts)
    assert.equal(w.wrapped, 'shop')
    assert.deepEqual(w.args.slice(0, 5), ['-n', fake, 'run', 'shop', 'NEXT_DIST_DIR=.next-b'])
    assert.ok(!w.args.some((a) => /LD_PRELOAD|PATH=|DATA_SECRET/.test(a)), w.args.join(' '))
  })
  t('negative: outside a walled element\'s folder the command stays as it was', () => {
    assert.deepEqual(wall.asElement(NODE, join(NODE, 'lib'), 'npm', ['ci'], {}, opts), { cmd: 'npm', args: ['ci'] })
    assert.equal(wall.unitOf(NODE, join(NODE, 'WEB4-ITEMS', 'core', 'auth'), 'warm', 'node', [], {}, opts), null)
  })
}
t('the installer, the preview and its readers use the units', () => {
  const inst = readFileSync(join(here, 'services-install.mjs'), 'utf8')
  assert.match(inst, /wall\.unitOf\(ROOT, start\.cwd, 'warm'/); assert.match(inst, /wall\.asElement\(ROOT, cwd, cmd, args, env\)/)
  const prev = readFileSync(join(here, 'element-preview.mjs'), 'utf8')
  assert.match(prev, /wall\.unitOf\(ROOT, dir, 'preview'/); assert.match(prev, /wall\.asElement\(ROOT, dir, cmd, args, env\)/)
  assert.match(readFileSync(join(here, '..', 'lib', 'deploy', 'preview-lock.cjs'), 'utf8'), /unitActive\(p\.unit\)/)
  assert.match(readFileSync(join(here, '..', 'app', 'api', 'architect', 'items', '[id]', 'preview', 'route.ts'), 'utf8'), /unitActive\(p\.unit\)/)
  assert.match(readFileSync(join(here, '..', 'ecosystem.config.cjs'), 'utf8'), /serveApp\(root, s, stamp\)/)
})

console.log('811-4b the node\'s git inside an element\'s folder runs as that element')
{
  const G = tmp('wall-git-')
  const gnode = join(G, 'node'); const recs = join(G, 'elements')
  for (const d of ['WEB4-ITEMS/user/shop/src', 'WEB4-ITEMS/user/fresh', 'WEB4-ITEMS/core/auth', 'lib']) mkdirSync(join(gnode, d), { recursive: true })
  mkdirSync(recs); writeFileSync(join(recs, 'shop'), 'FOLDER=WEB4-ITEMS/user/shop\n')
  symlinkSync(join(gnode, 'WEB4-ITEMS', 'user', 'shop'), join(gnode, 'lib', 'shop-link'))
  const me = spawnSync('id', ['-un'], { encoding: 'utf8' }).stdout.trim()
  const envFile = join(G, 'node.env')
  const shimRun = (cwd, args, extra = {}, user = me) => {
    writeFileSync(envFile, `NODE_USER=${user}\nNODE_DIR=${gnode}\n`)
    const r = spawnSync('bash', [join(DS, 'node-git.sh'), ...args], { cwd, encoding: 'utf8', env: { PATH: process.env.PATH, HOME: G, FRACTERA_GIT_TEST_ENV: envFile, FRACTERA_GIT_TEST_RECORDS: recs, FRACTERA_GIT_TEST_SUDO: 'echo', ...extra } })
    return `${r.stdout}${r.stderr}`.trim()
  }
  const H = '/usr/local/sbin/fractera-element run'
  const shop = join(gnode, 'WEB4-ITEMS', 'user', 'shop')
  t('in its folder: git status → the helper runs /usr/bin/git as shop', () => {
    assert.equal(shimRun(shop, ['status']), `${H} shop -- /usr/bin/git status`)
  })
  t('in a subfolder: --in src', () => { assert.equal(shimRun(join(shop, 'src'), ['log', '-1']), `${H} shop --in src -- /usr/bin/git log -1`) })
  t('from the core with a relative -C: made absolute, still the element\'s', () => {
    assert.equal(shimRun(gnode, ['-C', 'WEB4-ITEMS/user/shop', 'rev-parse', 'HEAD']), `${H} shop -- /usr/bin/git -C ${gnode}/WEB4-ITEMS/user/shop rev-parse HEAD`)
  })
  t('--git-dir=… and GIT_DIR point into it: the element\'s', () => {
    assert.match(shimRun(gnode, ['--git-dir=WEB4-ITEMS/user/shop/.git', 'log']), new RegExp(`^${H} shop -- /usr/bin/git --git-dir=${gnode}/WEB4-ITEMS/user/shop/.git log$`))
    assert.match(shimRun(gnode, ['status'], { GIT_DIR: 'WEB4-ITEMS/user/shop/.git' }), new RegExp(`^${H} shop GIT_DIR=${gnode}/WEB4-ITEMS/user/shop/.git -- /usr/bin/git status$`))
  })
  t('through a symlink of the core into the element: still the element\'s (the real path decides)', () => {
    assert.match(shimRun(join(gnode, 'lib', 'shop-link'), ['status']), new RegExp(`^${H} shop -- `))
  })
  t('negative: the core, a native, an element without its user, .. out of the element — the real git', () => {
    for (const [cwd, args] of [[gnode, ['status']], [join(gnode, 'WEB4-ITEMS', 'core', 'auth'), ['status']], [join(gnode, 'WEB4-ITEMS', 'user', 'fresh'), ['status']], [gnode, ['-C', 'WEB4-ITEMS/user/shop/../..', 'status']]]) {
      const out = shimRun(cwd, args); assert.doesNotMatch(out, /fractera-element/, `${cwd} ${args.join(' ')} → ${out}`)
    }
  })
  t('negative: another user (an element, root) always gets the real git', () => {
    assert.doesNotMatch(shimRun(shop, ['status'], {}, 'fractera-not-me'), /fractera-element/)
  })
  t('the installer puts the shim first; units hide other users\' processes; records readable', () => {
    assert.match(readFileSync(join(DS, 'prepare.sh'), 'utf8'), /node-git\.sh' \/usr\/local\/lib\/fractera\/node-bin\/git/)
    for (const f of ['install.sh', 'start.sh']) assert.match(readFileSync(join(DS, f), 'utf8'), /export PATH="\/usr\/local\/lib\/fractera\/node-bin:/)
    assert.match(readFileSync(join(DS, 'launch.mjs'), 'utf8'), /'node-git\.sh'/)
    assert.match(readFileSync(join(here, '..', 'ecosystem.config.cjs'), 'utf8'), /nodeBinPath\(root\)/)
    assert.match(helperRun(['unit-start', 'shop', '--', 'node']).out, /-p ProtectProc=invisible/)
    assert.match(helperRun(['add', 'shop', 'WEB4-ITEMS/user/shop']).out, /install -d -m 0755 \S+elements/)
  })
}

console.log('811-5b the helper\'s agent verb — the element\'s agent as a unit on the caller\'s pty')
{
  writeFileSync(join(ETC, 'elements', 'shop'), 'FOLDER=WEB4-ITEMS/user/shop\n')
  t('agent shop: systemd-run --pty as fe-shop, other users\' processes invisible, the group ends with the unit', () => {
    const r = helperRun(['agent', 'shop', '--unit', 'agent', 'CLAUDE_CONFIG_DIR=/x/claude', '--', '/usr/local/lib/fractera/bin/claude', '--model', 'opus'])
    assert.equal(r.status, 0, r.out)
    assert.match(r.out, /systemd-run --quiet --collect --pty --unit=fractera-el-shop-agent --uid=fe-shop --gid=fractera-el/)
    assert.match(r.out, /-p ProtectProc=invisible -p KillMode=control-group/)
    assert.match(r.out, /--setenv=CLAUDE_CONFIG_DIR=\/x\/claude/)
    assert.match(r.out, /-- \/usr\/local\/lib\/fractera\/bin\/claude --model opus$/m)
  })
  t('agent without --unit is tag agent; --unit shell; negatives: bad tag, PATH, LD_PRELOAD, unknown element', () => {
    assert.match(helperRun(['agent', 'shop', '--', '/bin/bash']).out, /--unit=fractera-el-shop-agent/)
    assert.match(helperRun(['agent', 'shop', '--unit', 'shell', '--', '/bin/bash']).out, /--unit=fractera-el-shop-shell/)
    refused(['agent', 'shop', '--unit', 'Bad1', '--', 'x'], /bad unit tag/)
    refused(['agent', 'shop', 'PATH=/tmp', '--', 'x'], /PATH is not allowed/)
    refused(['agent', 'shop', 'LD_PRELOAD=/tmp/x.so', '--', 'x'], /not allowed/)
    refused(['agent', 'ghost', '--', 'x'], /no element ghost/)
  })
  t('claude-share also shares bun (only a real ELF file)', () => {
    const src = readFileSync(helper, 'utf8')
    assert.match(src, /\.bun\/bin\/bun/)
    assert.match(src, /install -m 0755 -o root -g root "\$bun" "\$SHARED_BIN\/bun"/)
  })
}

console.log('811-5a the hook relay — the walled session\'s hooks run by the core for the caller only')
{
  const require = createRequire(import.meta.url)
  const relayRun = require('../lib/agent-kit/hook-relay-run.cjs')
  const at = { node: '/usr/bin/node', relay: '/n/lib/agent-kit/hook-relay.cjs' }
  t('the session\'s hooks → the relay (exec and shell forms, the pulse keeps its event); a hook not in the list is dropped', () => {
    const hooks = {
      Stop: [{ hooks: [{ type: 'command', command: 'node /n/lib/agent-kit/memory/record.cjs shop' }, { type: 'command', command: 'node /n/lib/agent-kit/pulse.cjs shop turn-end' }]}],
      SessionStart: [{ matcher: 'startup', hooks: [{ type: 'command', command: '/opt/node', args: ['/n/lib/agent-kit/memory/brief.cjs', 'shop'] }] }],
      PreToolUse: [{ matcher: 'Bash', hooks: [{ type: 'command', command: '/opt/node', args: ['/n/lib/agent-kit/guard-search.cjs', '/n'] }] },
        { matcher: '*', hooks: [{ type: 'command', command: '/opt/node', args: ['/n/lib/agent-kit/progress.cjs', '/n', 'shop'], async: true, timeout: 30 }] }],
    }
    const r = relayRun.relayHooks(hooks, at)
    assert.equal(r.hooks.Stop[0].hooks[0].command, '/usr/bin/node /n/lib/agent-kit/hook-relay.cjs record')
    assert.equal(r.hooks.Stop[0].hooks[1].command, '/usr/bin/node /n/lib/agent-kit/hook-relay.cjs pulse turn-end')
    assert.deepEqual(r.hooks.SessionStart[0].hooks[0], { type: 'command', command: '/usr/bin/node', args: [at.relay, 'brief'] })
    assert.equal(r.hooks.SessionStart[0].matcher, 'startup')
    assert.equal(r.hooks.PreToolUse.length, 1, 'the guard of the main agent is dropped')
    assert.deepEqual(r.hooks.PreToolUse[0].hooks[0], { type: 'command', async: true, timeout: 30, command: '/usr/bin/node', args: [at.relay, 'progress'] })
    assert.deepEqual(r.dropped, ['PreToolUse'])
    assert.equal(relayRun.relayLine({ type: 'command', command: 'node /n/lib/agent-kit/limits.cjs shop' }, at).command, '/usr/bin/node /n/lib/agent-kit/hook-relay.cjs limits')
  })
  t('negative: the door\'s list — an unknown name, a pulse event not in its list, a path for a name → nothing runs', () => {
    assert.equal(relayRun.planOf('/n', 'rm', 'shop'), null)
    assert.equal(relayRun.planOf('/n', 'pulse', 'shop', '../../x'), null)
    assert.equal(relayRun.planOf('/n', '../lib/agent-kit/pulse.cjs', 'shop'), null)
    assert.deepEqual(relayRun.planOf('/n', 'pulse', 'shop', 'turn-end').args, ['shop', 'turn-end'])
  })
  await ta('a relayed hook runs for the CALLER, in its folder, with its own Claude folder; stdin reaches it', async () => {
    const n = tmp('relay-node-')
    mkdirSync(join(n, 'lib', 'agent-kit'), { recursive: true })
    mkdirSync(join(n, 'data', 'services', 'shop', 'claude'), { recursive: true })
    const dir = tmp('relay-shop-')
    writeFileSync(join(n, 'lib', 'agent-kit', 'window.cjs'), "let s='';process.stdin.on('data',c=>s+=c).on('end',()=>{console.log(JSON.stringify({argv:process.argv.slice(2),cwd:process.cwd(),cfg:process.env.CLAUDE_CONFIG_DIR,stdin:s}));process.exit(3)})\n")
    return relayRun.runRelayed({ root: n, id: 'shop', dir, name: 'window', stdin: '{"e":1}', env: { PATH: process.env.PATH, CLAUDE_CONFIG_DIR: '/node/own' } }).then((r) => {
      const o = JSON.parse(r.stdout)
      assert.deepEqual(o.argv, ['shop']); assert.equal(o.cwd, dir); assert.equal(o.cfg, join(n, 'data', 'services', 'shop', 'claude')); assert.equal(o.stdin, '{"e":1}'); assert.equal(r.code, 3)
    })
  })
}

console.log('811-5b the walled launch — files copied, the skills server relayed, only its own environment')
{
  const require = createRequire(import.meta.url)
  const n = tmp('launch-node-')
  for (const f of ['lib/hosting/element-wall.cjs', 'lib/agent-kit/hook-relay-run.cjs', 'lib/agent-kit/walled-session.cjs']) { mkdirSync(join(n, f, '..'), { recursive: true }); cpSync(join(here, '..', f), join(n, f)) }
  mkdirSync(join(n, 'data', 'node', 'agent-prompts'), { recursive: true })
  const P = (f) => join(n, 'data', 'node', 'agent-prompts', f)
  writeFileSync(P('shop.md'), 'the soul')
  writeFileSync(P('shop-skills-mcp.json'), JSON.stringify({ mcpServers: { 'node-skills': { command: '/opt/node', args: ['/n/lib/agent-kit/skills/mcp.mjs'] } } }))
  writeFileSync(P('shop-mcp.json'), JSON.stringify({ mcpServers: { rea: { command: '/opt/node', args: ['rea.mjs', 'mcp'] } } }))
  const { walledLaunch, walledShell } = require(join(n, 'lib', 'agent-kit', 'walled-session.cjs'))
  const settings = { autoCompactEnabled: false, hooks: { Stop: [{ hooks: [{ type: 'command', command: `node ${n}/lib/agent-kit/pulse.cjs shop turn-end` }] }] }, statusLine: { type: 'command', command: `node ${n}/lib/agent-kit/limits.cjs shop` } }
  const args = ['--add-dir', `${n}/data/services/shop`, '--mcp-config', P('shop-mcp.json'), P('shop-skills-mcp.json'), '--settings', JSON.stringify(settings), '--append-system-prompt-file', P('shop.md'),
    '--append-system-prompt', `rule: node "${n}/scripts/element-github-push.mjs" shop — then`, '--model', 'opus', 'first task']
  const env = { PATH: '/home/fractera/.local/bin:/usr/bin', HOME: '/home/fractera', DATA_SECRET: 'NEVER', SETTINGS_SECRET: 'NEVER', CLAUDE_CONFIG_DIR: `${n}/data/services/shop/claude`, TELEGRAM_STATE_DIR: `${n}/data/services/shop/channel/telegram`, FRACTERA_PASS: 'main' }
  const L = walledLaunch({ root: n, id: 'shop', key: 'shop.mac', args, env, port: 24680, node: '/usr/bin/node', mode: 'build', opts: { prefix: ['sudo', '-n'] } })
  const sep = L.args.indexOf('--')
  const head = L.args.slice(0, sep); const tail = L.args.slice(sep + 1)
  t('sudo -n <helper> agent shop --unit agent, then only the kept keys and the element\'s key', () => {
    assert.equal(L.cmd, 'sudo')
    assert.deepEqual(head.slice(0, 6), ['-n', '/usr/local/sbin/fractera-element', 'agent', 'shop', '--unit', 'agent'])
    assert.deepEqual(head.slice(6).sort(), [`CLAUDE_CONFIG_DIR=${n}/data/services/shop/claude`, 'FRACTERA_CORE_PORT=24680', 'FRACTERA_HOOK_KEY=shop.mac', 'FRACTERA_PASS=main', `TELEGRAM_STATE_DIR=${n}/data/services/shop/channel/telegram`].sort())
    assert.equal(tail[0], '/usr/local/lib/fractera/bin/claude')
  })
  t('negative: the node\'s secrets and its PATH/HOME never reach the element (args nor env)', () => {
    const all = JSON.stringify([L.args, L.env])
    assert.doesNotMatch(all, /NEVER/); assert.doesNotMatch(all, /\/home\/fractera/)
  })
  t('hooks and status line → the relay; the prompt file copied into its data folder; skills via the relay; REA dropped; the push rule → the relay', () => {
    const s = JSON.parse(tail[tail.indexOf('--settings') + 1])
    assert.equal(s.hooks.Stop[0].hooks[0].command, `/usr/bin/node ${n}/lib/agent-kit/hook-relay.cjs pulse turn-end`)
    assert.equal(s.statusLine.command, `/usr/bin/node ${n}/lib/agent-kit/hook-relay.cjs limits`)
    const pf = tail[tail.indexOf('--append-system-prompt-file') + 1]
    assert.equal(pf, join(n, 'data', 'services', 'shop', 'session', 'shop.md')); assert.equal(readFileSync(pf, 'utf8'), 'the soul')
    const mi = tail.indexOf('--mcp-config')
    assert.equal(tail[mi + 2], '--settings', 'one config left')
    assert.deepEqual(JSON.parse(readFileSync(tail[mi + 1], 'utf8')), { mcpServers: { 'node-skills': { command: '/usr/bin/node', args: [`${n}/lib/agent-kit/hook-relay.cjs`, 'mcp', 'skills'] } } })
    assert.ok(L.dropped.includes('mcp rea'))
    assert.equal(tail[tail.indexOf('--append-system-prompt') + 1], `rule: node ${n}/lib/agent-kit/hook-relay.cjs github-push — then`)
    assert.equal(tail[tail.length - 1], 'first task')
  })
  t('a work session is the unit «work»; the login shell is the unit «shell» with its own Claude folder only', () => {
    assert.equal(walledLaunch({ root: n, id: 'shop', key: 'k', args: [], env: {}, port: 1, mode: 'work', opts: { prefix: ['sudo'] } }).unitTag, 'work')
    const sh = walledShell({ root: n, id: 'shop', home: '/h/claude', opts: { prefix: ['sudo'] } })
    assert.deepEqual(sh.args.slice(1), ['agent', 'shop', '--unit', 'shell', 'CLAUDE_CONFIG_DIR=/h/claude', '--', '/bin/bash', '-l'])
  })
}

console.log('811-5g who opened the connection — asked of Linux')
{
  const require = createRequire(import.meta.url)
  const peer = require('../lib/hosting/peer-uid.cjs')
  const d = tmp('peer-')
  // the core listens on 24680 (0x6068); a client socket from port 51000 (0xC738) of uid 1007, and the server's side owned by 1000
  writeFileSync(join(d, 'tcp'), '  sl  local_address rem_address   st tx_queue rx_queue tr tm->when retrnsmt   uid  timeout inode\n' +
    '   0: 0100007F:6068 0100007F:C738 01 00000000:00000000 00:00000000 00000000  1000        0 1 1\n' +
    '   1: 0100007F:C738 0100007F:6068 01 00000000:00000000 00:00000000 00000000  1007        0 2 1\n')
  writeFileSync(join(d, 'passwd'), 'fractera:x:1000:1000::/home/fractera:/bin/bash\nfe-shop:x:1007:998::/var/lib/fractera-el/shop:/usr/sbin/nologin\nwww-data:x:33:33::/var/www:/usr/sbin/nologin\n')
  const opts = { files: [join(d, 'tcp')], passwd: join(d, 'passwd') }
  t('the client socket\'s line names fe-shop → element shop', () => {
    assert.equal(peer.peerUid({ remoteAddress: '127.0.0.1', remotePort: 51000, localPort: 24680 }, opts), 1007)
    assert.equal(peer.elementPeer({ remoteAddress: '::ffff:127.0.0.1', remotePort: 51000, localPort: 24680 }, opts), 'shop')
  })
  t('negative: the node\'s own user, another port, not loopback → nobody', () => {
    writeFileSync(join(d, 'tcp2'), readFileSync(join(d, 'tcp'), 'utf8').replace(' 1007 ', ' 1000 '))
    assert.equal(peer.elementPeer({ remoteAddress: '127.0.0.1', remotePort: 51000, localPort: 24680 }, { ...opts, files: [join(d, 'tcp2')] }), null)
    assert.equal(peer.elementPeer({ remoteAddress: '127.0.0.1', remotePort: 51001, localPort: 24680 }, opts), null)
    assert.equal(peer.peerUid({ remoteAddress: '10.0.0.5', remotePort: 51000, localPort: 24680 }, opts), null)
  })
  t('negative: a header sent by the client is always removed (no wall here → nothing set back)', () => {
    const req = { headers: { 'x-fractera-peer': 'forged', host: 'localhost' }, socket: {} }
    peer.stamp(req, NODE)
    assert.equal(req.headers['x-fractera-peer'], undefined)
  })
  t('the owner-at-machine rule refuses a stamped request; the core\'s pty sockets refuse it; server.js stamps every request', () => {
    assert.match(readFileSync(join(here, '..', 'lib', 'auth', 'owner-at-machine.ts'), 'utf8'), /if \(req\.headers\.get\(PEER_HEADER\)\) return false/)
    assert.match(readFileSync(join(here, '..', 'lib', 'agent-kit', 'mount.cjs'), 'utf8'), /peer-uid\.cjs'\)\.stamp\(req, process\.cwd\(\)\)\) \{\n\s+socket\.destroy\(\)/)
    assert.match(readFileSync(join(here, '..', 'server.js'), 'utf8'), /peer\.stamp\(req, __dirname\)\n\s+handle\(req, res\)/)
  })
}

console.log(`\n${passed} passed${process.exitCode ? ', some FAILED' : ''}`)

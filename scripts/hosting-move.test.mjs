// THE MOVE RUNNER, END TO END, DRY (node step 737-7). `npm run test:hosting-move` — not in prebuild (it waits on detached scripts for
// ~20 s; prebuild time is time the node's sites stand behind the closed lid). A real ssh2 server in this process plays the server; the
// runner runs every rung in order with `--dry`: the server scripts print their commands instead of running them, every acting command
// (pm2 stop, claude login, stopping this node) is replaced, and the «server's» folders are temporary folders of this machine.
import assert from 'node:assert/strict'
import { spawn, spawnSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { startTestSshServer } from './hosting-test-ssh.mjs'

if (process.platform === 'win32') { console.log('· skipped on Windows: the server side is a Linux shell'); process.exit(0) }
const here = fileURLToPath(new URL('.', import.meta.url))
const tmp = (p) => mkdtempSync(join(tmpdir(), p))
const home = tmp('move-home-')
const node = tmp('move-node-')
const remote = tmp('move-remote-')
const rootDir = tmp('move-rootdir-')
const put = (rel, text) => { mkdirSync(join(node, rel, '..'), { recursive: true }); writeFileSync(join(node, rel), text) }
put('WEB4-ITEMS-REGISTRY/web4-items.json', JSON.stringify({ services: [{ id: 'auth', port: 24681, kind: 'core' }] }))
put('logs/runtime.json', JSON.stringify({ port: 24680 }))
put('data/services/build/channel/telegram/.env', 'TELEGRAM_BOT_TOKEN=test-token-not-real\n')
put('data/services/build/channel/telegram/bot.json', '{"username":"test_bot"}')
cpSync(join(here, 'dedicated-server'), join(node, 'scripts', 'dedicated-server'), { recursive: true })
const PASSWORD = 'dry-run-password-737'
const ssh = await startTestSshServer({ home, password: PASSWORD })
const env = { ...process.env, FRACTERA_MOVE_NODE_ROOT: node, FRACTERA_MOVE_REMOTE_ROOT: remote, FRACTERA_MOVE_ROOT_DIR: rootDir, FRACTERA_MOVE_POLL_MS: '200' }
const runner = join(here, 'dedicated-server', 'move.mjs')
// Asynchronous on purpose: the «server» lives in THIS process — a blocking spawn would starve it, and the runner would time out.
const run = (rung, extra = [], input = undefined) => new Promise((resolve) => {
  const child = spawn(process.execPath, [runner, rung, '--dry', ...extra], { env })
  let stdout = ''
  let stderr = ''
  child.stdout.on('data', (d) => { stdout += d })
  child.stderr.on('data', (d) => { stderr += d })
  const timer = setTimeout(() => child.kill(), 120_000)
  child.on('close', (status) => { clearTimeout(timer); resolve({ status, stdout, stderr }) })
  if (input !== undefined) child.stdin.end(input)
  else child.stdin.end()
})
const state = () => JSON.parse(readFileSync(join(node, 'data', 'node', 'server', 'move.json'), 'utf8'))
let passed = 0
const t = async (name, fn) => { try { await fn(); passed += 1; console.log(`  ✓ ${name}`) } catch (e) { console.error(`  ✗ ${name}\n    ${e.message}`); process.exitCode = 1 } }

console.log('737-7 the move runner, dry, end to end')
await t('connect: the password once from stdin → the node key on the «server», its key pinned', async () => {
  const r = await run('connect', ['--host', '127.0.0.1', '--port', String(ssh.port)], `${PASSWORD}\n`)
  assert.equal(r.status, 0, r.stdout + r.stderr)
  assert.equal(state().rungs.connect.state, 'done')
  assert.match(state().server.fingerprint, /^SHA256:/)
  assert.ok(readFileSync(join(home, '.ssh', 'authorized_keys'), 'utf8').includes('fractera-node'))
})
await t('negative: a rung out of order is refused', async () => {
  const r = await run('rehearse')
  assert.equal(r.status, 2, r.stdout + r.stderr)
  assert.ok(r.stderr.includes('===MOVE_REFUSED==='))
})
await t('probe: the «server» measured; negative — this Mac is not Ubuntu, so the verdict refuses it', async () => {
  const r = await run('probe')
  assert.equal(r.status, 1, r.stdout + r.stderr)
  const s = state()
  assert.equal(s.rungs.probe.state, 'failed')
  assert.equal(s.verdict.items.find((i) => i.id === 'os').level, 'fail')
  assert.ok(Number.isInteger(s.needs.copyFiles))
  // The rest of the ladder goes on as on an Ubuntu server: the test marks the probe done.
  s.rungs.probe.state = 'done'
  writeFileSync(join(node, 'data', 'node', 'server', 'move.json'), JSON.stringify(s))
})
await t('prepare: uploaded, started detached, every stage followed to done', async () => {
  const r = await run('prepare')
  assert.equal(r.status, 0, r.stdout + r.stderr)
  const stages = state().rungs.prepare.stages
  assert.ok(stages.some((x) => x.id === 'firewall' && x.state === 'done'), JSON.stringify(stages))
})
await t('copy: the silent copy — no bot token travels; the phase mark written; install followed to done', async () => {
  const r = await run('copy')
  assert.equal(r.status, 0, r.stdout + r.stderr)
  assert.ok(!existsSync(join(remote, 'data/services/build/channel/telegram/.env')), 'a bot token travelled into the rehearsal')
  assert.ok(existsSync(join(remote, 'data/services/build/channel/telegram/bot.json')))
  assert.equal(JSON.parse(readFileSync(join(remote, 'data/node/server.json'), 'utf8')).phase, 'silent')
  assert.ok(state().rungs.copy.stages.some((x) => x.id === 'elements' && x.state === 'done'))
})
await t('claude and rehearse (dry): done in order', async () => {
  assert.equal((await run('claude')).status, 0)
  const r = await run('rehearse')
  assert.equal(r.status, 0, r.stdout + r.stderr)
  assert.ok(state().rungs.rehearse.stages.some((x) => x.id === 'serve' && x.state === 'done'))
})
await t('negative: the move waits for the Telegram choice', async () => {
  const r = await run('move')
  assert.equal(r.status, 2, r.stdout + r.stderr)
  assert.ok(r.stderr.includes('===MOVE_REFUSED==='))
})
await t('telegram, the server\'s own bot: the relay carries each action to the server\'s channel door over SSH; the token rides stdin, never a command line', async () => {
  // The server's channel door of its main agent, played by a small HTTP server on this machine's loopback; its port is the server's own
  // runtime record (never copied from this computer).
  const { createServer } = await import('node:http')
  const seen = []
  const door = createServer((req, res) => {
    let body = ''
    req.on('data', (d) => { body += d })
    req.on('end', () => {
      seen.push({ method: req.method, url: req.url, body })
      res.setHeader('content-type', 'application/json')
      if (req.method === 'GET') return res.end(JSON.stringify({ ok: true, configured: true, botUsername: 'srv_bot', allowed: 1 }))
      const b = JSON.parse(body || '{}')
      res.end(JSON.stringify(b.action === 'token' ? { ok: true, tail: String(b.token).slice(-4), username: 'srv_bot' } : { ok: true }))
    })
  })
  await new Promise((resolve) => door.listen(0, '127.0.0.1', resolve))
  mkdirSync(join(remote, 'logs'), { recursive: true })
  writeFileSync(join(remote, 'logs', 'runtime.json'), JSON.stringify({ port: door.address().port }))
  const relay = (input) => new Promise((resolve) => {
    const child = spawn(process.execPath, [join(here, 'dedicated-server', 'telegram.mjs'), '--dry'], { env })
    let out = ''
    child.stdout.on('data', (d) => { out += d })
    child.on('close', () => resolve(JSON.parse(out.trim().split('\n').pop() || '{}')))
    child.stdin.end(JSON.stringify(input))
  })
  ssh.state.commands = []
  const TOKEN = '123456789:SERVER_TOKEN_must_never_be_in_a_command_line'
  const a = await relay({ method: 'POST', lang: 'ru', body: { action: 'token', token: TOKEN } })
  assert.equal(a.ok, true, JSON.stringify(a))
  assert.equal(a.username, 'srv_bot')
  assert.ok(seen.some((x) => x.method === 'POST' && x.url === '/ru/architect/build/agent-api/channel' && x.body.includes(TOKEN)), JSON.stringify(seen))
  assert.ok(ssh.state.commands.length > 0, 'the relay ran nothing on the server')
  assert.ok(ssh.state.commands.every((c) => !c.includes(TOKEN)), 'the token was in a command line on the server')
  assert.equal((await relay({ method: 'GET', lang: 'ru' })).allowed, 1)
  await new Promise((resolve) => door.close(resolve))
  // Negative: the server's core silent — the relay says so and never invents an answer.
  assert.equal((await relay({ method: 'GET', lang: 'ru' })).error, 'server-silent')
  ssh.state.commands = undefined
})
await t('telegram: the choice «move» recorded as the ladder\'s door records it — the move may start', async () => {
  const s = state()
  s.telegram = { choice: 'move', bot: 'test_bot', at: new Date().toISOString() }
  s.rungs.telegram = { state: 'done' }
  writeFileSync(join(node, 'data', 'node', 'server', 'move.json'), JSON.stringify(s))
})
await t('move: the last copy brings the bot token, the mark turns live; negative — a dry run never marks this computer moved', async () => {
  const r = await run('move')
  assert.equal(r.status, 0, r.stdout + r.stderr)
  assert.equal(state().rungs.move.state, 'done')
  assert.ok(existsSync(join(remote, 'data/services/build/channel/telegram/.env')))
  assert.equal(JSON.parse(readFileSync(join(remote, 'data/node/server.json'), 'utf8')).phase, 'live')
  assert.ok(!existsSync(join(node, 'data', 'node', 'moved.json')))
  // 737-11a: the bot moved with the node → the server's main agent is woken to greet the person (a dry run only records it).
  assert.equal(state().welcome?.dry, true, JSON.stringify(state().welcome))
})
await t('return (dry): the «server» copy comes home, the server is marked returned; this computer\'s key survives the road back', async () => {
  writeFileSync(join(remote, 'data/node/memory-written-on-server.txt'), 'made on the server after the move')
  const r = await run('return')
  assert.equal(r.status, 0, r.stdout + r.stderr)
  assert.ok(existsSync(join(node, 'data/node/memory-written-on-server.txt')), 'the server\'s new data did not come home')
  assert.ok(existsSync(join(node, 'data/node/server/id_ed25519')), 'the road back erased this computer\'s key')
  assert.equal(JSON.parse(readFileSync(join(remote, 'data/node/server.json'), 'utf8')).phase, 'returned')
  assert.equal(state().return.state, 'done')
})
await t('negative: a node that never moved cannot «return» — refused before any action', async () => {
  const r = await new Promise((resolve) => {
    const child = spawn(process.execPath, [runner, 'return'], { env: { ...env, FRACTERA_MOVE_NODE_ROOT: '' } })
    let stderr = ''
    child.stderr.on('data', (d) => { stderr += d })
    child.on('close', (status) => resolve({ status, stderr }))
    child.stdin.end()
  })
  assert.equal(r.status, 2, r.stderr)
  assert.ok(r.stderr.includes('===MOVE_RETURN_REFUSED==='))
})
await t('negative: the password is in no file of the node or of the «server»', async () => {
  const grep = spawnSync('grep', ['-rl', PASSWORD, node, remote, rootDir], { encoding: 'utf8' })
  assert.equal(grep.stdout.trim(), '', grep.stdout)
})

console.log('737-11b the road «Новый сервер», dry, on the same «server»')
const writeState = (fn) => { const s = state(); fn(s); writeFileSync(join(node, 'data', 'node', 'server', 'move.json'), JSON.stringify(s)) }
await t('copy of this node without its data: accounts, stores and the node\'s identity stay here; the code travels', async () => {
  put('data/services/auth/auth.db', 'accounts')
  put('data/node-code.json', '{"code":"home1"}')
  put('WEB4-ITEMS/core/data/data/main.sqlite', 'store')
  put('WEB4-ITEMS/core/data/app.js', 'code')
  writeState((s) => {
    s.road = 'new'
    s.copyPlan = { variant: 'clone', data: false }
    s.rungs = { connect: { state: 'done' }, probe: { state: 'done' }, prepare: { state: 'done' } }
    delete s.telegram
    delete s.welcome
  })
  const r = await run('copy')
  assert.equal(r.status, 0, r.stdout + r.stderr)
  assert.ok(existsSync(join(remote, 'WEB4-ITEMS/core/data/app.js')))
  for (const f of ['data/services/auth/auth.db', 'data/node-code.json', 'WEB4-ITEMS/core/data/data/main.sqlite']) assert.ok(!existsSync(join(remote, f)), `travelled ${f}`)
})
await t('negative: the new road never rehearses — the rung is refused', async () => {
  assert.equal((await run('claude')).status, 0)
  const r = await run('rehearse')
  assert.equal(r.status, 2, r.stdout + r.stderr)
  assert.ok(r.stderr.includes('===MOVE_REFUSED==='))
})
await t('start: the independent server is marked live at once and started; this computer is never marked moved', async () => {
  const r = await run('start')
  assert.equal(r.status, 0, r.stdout + r.stderr)
  const mark = JSON.parse(readFileSync(join(remote, 'data/node/server.json'), 'utf8'))
  assert.equal(mark.phase, 'live')
  assert.equal(mark.independent, true)
  assert.equal(state().rungs.start.state, 'done')
  assert.ok(!existsSync(join(node, 'data', 'node', 'moved.json')))
})
await t('greet: once the server\'s own bot admits the person, its main agent is woken to greet (a dry run records it)', async () => {
  writeState((s) => { s.telegram = { choice: 'new', bot: 'srv_bot' }; s.rungs.telegram = { state: 'done' } })
  const r = await run('greet')
  assert.equal(r.status, 0, r.stdout + r.stderr)
  assert.equal(state().welcome?.dry, true, JSON.stringify(state().welcome))
})
await t('a fresh node: the fork is cloned there, nothing of this node travels; the earlier folder is moved aside, never erased', async () => {
  spawnSync('git', ['init', '-q'], { cwd: node })
  spawnSync('git', ['remote', 'add', 'origin', 'https://github.com/example/web4-node-starter-kit.git'], { cwd: node })
  writeState((s) => { s.copyPlan = { variant: 'fresh', data: false }; delete s.rungs.copy; delete s.rungs.claude; delete s.rungs.start; delete s.rungs.telegram })
  const r = await run('copy')
  assert.equal(r.status, 0, r.stdout + r.stderr)
  assert.equal(state().rungs.copy.stages[0].detail, 'https://github.com/example/web4-node-starter-kit.git')
  assert.ok(!existsSync(join(remote, 'WEB4-ITEMS/core/data/app.js')), 'this node\'s code travelled into a fresh node')
  assert.equal(state().rungs.start, undefined, 'a copy again must ask for the start again')
  const { readdirSync } = await import('node:fs')
  const aside = readdirSync(join(remote, '..')).filter((n) => n.startsWith(`${remote.split('/').pop()}.before-`))
  assert.equal(aside.length, 1, 'the earlier folder was not kept')
  assert.ok(existsSync(join(remote, '..', aside[0], 'WEB4-ITEMS/core/data/app.js')))
  rmSync(join(remote, '..', aside[0]), { recursive: true, force: true })
})

ssh.server.close()
for (const d of [home, node, remote, rootDir]) rmSync(d, { recursive: true, force: true })
console.log(`${passed} passed${process.exitCode ? ', FAILED' : ''}`)
process.exit(process.exitCode ?? 0)

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
await t('move: the last copy brings the bot token, the mark turns live; negative — a dry run never marks this computer moved', async () => {
  const r = await run('move')
  assert.equal(r.status, 0, r.stdout + r.stderr)
  assert.equal(state().rungs.move.state, 'done')
  assert.ok(existsSync(join(remote, 'data/services/build/channel/telegram/.env')))
  assert.equal(JSON.parse(readFileSync(join(remote, 'data/node/server.json'), 'utf8')).phase, 'live')
  assert.ok(!existsSync(join(node, 'data', 'node', 'moved.json')))
})
await t('negative: the password is in no file of the node or of the «server»', async () => {
  const grep = spawnSync('grep', ['-rl', PASSWORD, node, remote, rootDir], { encoding: 'utf8' })
  assert.equal(grep.stdout.trim(), '', grep.stdout)
})

ssh.server.close()
for (const d of [home, node, remote, rootDir]) rmSync(d, { recursive: true, force: true })
console.log(`${passed} passed${process.exitCode ? ', FAILED' : ''}`)
process.exit(process.exitCode ?? 0)

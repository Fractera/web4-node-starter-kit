// Node step 846: a person admitted to an element's bot while its agent's session runs WITHOUT the channel — the node restarts the same
// conversation with the channel itself. ✗ 2026-11-23, aifa.dev, cmdfc «Diana» (the server's agent, Telegram 1208): the session started
// 15:44 UTC before the bot, the bot was connected 15:53, nothing restarted it and the bot stayed silent until a hand did; the node only
// drew a banner. `npm run test:admitted-channel`.
import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SERVER = join(ROOT, 'app', '[lang]', '(architectLayer)', 'architect', 'kits', '_agent-kit', 'core', 'server')
const tmp = mkdtempSync(join(tmpdir(), 'admitted-channel-'))
const put = (p, text) => { mkdirSync(dirname(join(tmp, p)), { recursive: true }); writeFileSync(join(tmp, p), text) }
const EL = 'el846'
const NONCE = 'abc846abc846abc846abc846'
const dir = `data/services/${EL}/channel/telegram`
put(`${dir}/.token.node`, 'TELEGRAM_BOT_TOKEN=123456789:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\n')
put(`${dir}/bot.json`, JSON.stringify({ name: 'Diana', username: 'diana_test_bot' }))
put(`${dir}/person.json`, JSON.stringify({ lang: 'ru' }))
process.chdir(tmp) // the kit reads the node's root from the working folder at load
const telegram = createRequire(import.meta.url)(join(SERVER, 'telegram.cjs'))

let passed = 0
const t = async (name, fn) => { try { await fn(); passed++; console.log(`  ✓ ${name}`) } catch (e) { process.exitCode = 1; console.log(`  ✗ ${name}\n    ${e.message}`) } }

/** A fake Bot API: the first getUpdates returns `updates`, every other call answers ok. */
let updates = []
globalThis.fetch = async (url, init) => {
  const method = String(url).split('/').pop()
  const body = JSON.parse(init?.body ?? '{}')
  if (method === 'getUpdates' && body.offset === undefined) { const u = updates; updates = []; return { json: async () => ({ ok: true, result: u }) } }
  return { json: async () => ({ ok: true, result: { message_id: 1 } }) }
}
const message = (id, text) => ({ update_id: id, message: { message_id: id, chat: { id: 111, type: 'private' }, from: { id: 111, first_name: 'Roma' }, text } })
const settle = () => new Promise((r) => setTimeout(r, 50))

await t('846: the admission (/start <nonce>) calls the bridge — the session without the channel is restarted with it', async () => {
  const seen = []
  telegram.setAdmitted(async (service) => { seen.push(service); return { did: 'restarted' } })
  put(`${dir}/access.json`, JSON.stringify({ dmPolicy: 'allowlist', allowFrom: [], groups: {}, pending: {} }))
  put(`${dir}/activation.json`, JSON.stringify({ createdAt: Date.now(), nonce: NONCE }))
  updates = [message(1, `/start ${NONCE}`)]
  await telegram.idleTick(EL)
  await settle()
  assert.deepEqual(seen, [EL])
  assert.ok(JSON.parse(readFileSync(join(tmp, dir, 'access.json'), 'utf8')).allowFrom.includes('111'), 'the person is admitted')
})

await t('negative: a stranger with a wrong nonce is not admitted and nothing is restarted', async () => {
  const seen = []
  telegram.setAdmitted(async (service) => { seen.push(service); return { did: 'restarted' } })
  put(`${dir}/access.json`, JSON.stringify({ dmPolicy: 'allowlist', allowFrom: [], groups: {}, pending: {} }))
  put(`${dir}/activation.json`, JSON.stringify({ createdAt: Date.now(), nonce: NONCE }))
  updates = [message(2, '/start not-the-nonce')]
  await telegram.idleTick(EL)
  await settle()
  assert.deepEqual(seen, [])
})

await t('negative: a rehearsing server (phase silent) admits but starts nothing (737-11a)', async () => {
  const seen = []
  telegram.setAdmitted(async (service) => { seen.push(service); return { did: 'restarted' } })
  put('data/node/server.json', JSON.stringify({ phase: 'silent' }))
  put(`${dir}/access.json`, JSON.stringify({ dmPolicy: 'allowlist', allowFrom: [], groups: {}, pending: {} }))
  put(`${dir}/activation.json`, JSON.stringify({ createdAt: Date.now(), nonce: NONCE }))
  updates = [message(3, `/start ${NONCE}`)]
  await telegram.idleTick(EL)
  await settle()
  rmSync(join(tmp, 'data/node/server.json'))
  assert.deepEqual(seen, [])
})

await t('the bridge registers the hook, waits for the turn in flight and keeps work and loaned sessions without the channel', async () => {
  const src = readFileSync(join(SERVER, 'bridge.cjs'), 'utf8')
  assert.match(src, /telegram\.setAdmitted\(\(service\) => channelAfterAdmission\(service\)\)/)
  const fn = src.slice(src.indexOf('async function channelAfterAdmission'), src.indexOf('/** Принять сокет службы'))
  assert.ok(fn.includes("modes.modeOfKey(service) === 'work' || onLoan(element)"), 'work and loaned sessions stay as they are')
  assert.ok(fn.indexOf('whenIdle(') > 0 && fn.indexOf('whenIdle(') < fn.indexOf('restartSame('), 'the turn in flight is never cut')
  assert.ok(fn.includes('live.channel'), 'a session that already has the channel is left alone')
})

await t('846 (Telegram 1209): «Включить» on a live session without the channel closes it after the turn and starts the same conversation with the channel', async () => {
  const src = readFileSync(join(SERVER, 'bridge.cjs'), 'utf8')
  const live = src.slice(src.indexOf('  if (live) {', src.indexOf('async function wake(')), src.indexOf('// 409-3: бот элемента подключён'))
  assert.ok(live.includes('if (await closedForChannel(live, service, element, confirmed)) continueLast = true'), 'the press restarts, continuing the conversation')
  assert.ok(live.indexOf('closedForChannel') < live.indexOf('deliver(live'), 'no paste into the deaf session first')
  const fn = src.slice(src.indexOf('async function closedForChannel'), src.indexOf('/** Принять сокет службы'))
  assert.ok(fn.includes("!confirmed || live.channel || modes.modeOfKey(service) === 'work' || onLoan(element) || !telegram.connected(element)"), 'only the person\'s press, only a session meant to carry the channel')
  assert.ok(fn.indexOf('whenIdle(') < fn.indexOf('session.stop('), 'the turn in flight is never cut')
})

rmSync(tmp, { recursive: true, force: true })
console.log(process.exitCode ? '\n===ADMITTED_CHANNEL_FAILED===' : `\n===ADMITTED_CHANNEL_OK=== ${passed} passed`)

// node step 798-1: the node's bot factory (lib/node/bot-factory.cjs) against a stubbed Telegram — nothing leaves this computer.
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const require = createRequire(import.meta.url)
const f = require('../lib/node/bot-factory.cjs')
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bot-factory-'))
const kept = path.join(root, 'data', 'node', 'bot-factory.json')
const TOKEN = '123456789:AAEexampleexampleexampleexample0001'
const ok = (m) => console.log(`  ✓ ${m}`)

// A stub of the Bot API: `me` is what getMe answers; updates and tokens are queued.
function stub({ me, updates = [], token = '987654321:BBEnewtokennewtokennewtokennew0002' }) {
  const calls = []
  const fetchImpl = async (url, init) => {
    const method = url.split('/').pop()
    const body = JSON.parse(init.body || '{}')
    calls.push({ method, body })
    const answer = method === 'getMe' ? me
      : method === 'getUpdates' ? { ok: true, result: updates.splice(0) }
      : method === 'getManagedBotToken' ? { ok: true, result: token }
      : method === 'replaceManagedBotToken' ? { ok: true, result: token }
      : { ok: false, description: 'unknown' }
    return { json: async () => answer }
  }
  return { fetchImpl, calls }
}

// bad shape and refused token: nothing kept
assert.deepEqual(await f.save(root, 'nonsense'), { ok: false, error: 'bad-format' })
assert.equal((await f.save(root, TOKEN, stub({ me: { ok: false } }).fetchImpl)).error, 'token-rejected')
assert.equal(fs.existsSync(kept), false)
ok('a bad shape and a token Telegram refuses keep nothing')

// negative control: a real bot with the mode OFF — refused, its username named, nothing kept
const off = await f.save(root, TOKEN, stub({ me: { ok: true, result: { id: 1, is_bot: true, username: 'factory_bot', can_manage_bots: false } } }).fetchImpl)
assert.deepEqual(off, { ok: false, error: 'management-off', username: 'factory_bot' })
assert.equal(fs.existsSync(kept), false)
ok('Bot Management Mode off: refused with the bot named, nothing kept')

// the mode on: kept 0600, only the tail goes back
const good = await f.save(root, TOKEN, stub({ me: { ok: true, result: { id: 1, is_bot: true, username: 'factory_bot', first_name: 'F', can_manage_bots: true } } }).fetchImpl)
assert.deepEqual(good, { ok: true, username: 'factory_bot', tail: '0001' })
assert.equal(fs.statSync(kept).mode & 0o777, process.platform === 'win32' ? fs.statSync(kept).mode & 0o777 : 0o600)
const st = await f.state(root)
assert.deepEqual(st, { ready: true, username: 'factory_bot', tail: '0001' })
assert.equal(JSON.stringify(st).includes(TOKEN), false)
ok('the mode on: kept, the state carries only the last 4')

// live recheck: the mode switched off later → not ready
const later = await f.state(root, { live: true }, stub({ me: { ok: true, result: { id: 1, is_bot: true, username: 'factory_bot', can_manage_bots: false } } }).fetchImpl)
assert.equal(later.ready, false); assert.equal(later.live, 'management-off')
ok('a live recheck notices the mode switched off')

// the link of Telegram's window
assert.equal(f.createLink(root, { username: 'root_site_bot', name: 'Главный сайт' }).url, `https://t.me/newbot/factory_bot/root_site_bot?name=${encodeURIComponent('Главный сайт').replace(/%20/g, '+')}`)
assert.equal(f.createLink(root, { username: 'no', name: 'x' }).error, 'bad-username')
ok('the creation link: Telegram\'s format; a bad address refused')

// suggested addresses obey Telegram's rule
for (const [b, s] of [['root', 'ab12c'], ['Главный сайт', ''], ['a'.repeat(60), 'zz'], ['9lives', 'q']]) {
  const u = f.suggestUsername(b, s)
  assert.ok(f.USERNAME.test(u) && u.length <= 32, u)
}
ok('suggested addresses: 5–32 characters, ending in «bot»')

// waiting: another creator's bot is skipped, ours gives its token; the offset moves
const s = stub({ me: { ok: true }, updates: [
  { update_id: 10, managed_bot: { user: { id: 555 }, bot: { id: 70, username: 'stranger_bot' } } },
  { update_id: 11, managed_bot: { user: { id: 42 }, bot: { id: 71, username: 'root_site_bot', first_name: 'Главный сайт' } } },
] })
const got = await f.awaitCreated(root, { ms: 2000, creatorId: 42 }, s.fetchImpl)
assert.equal(got.ok, true); assert.equal(got.bot.username, 'root_site_bot'); assert.equal(got.token.startsWith('987654321:'), true)
assert.deepEqual(s.calls.find((c) => c.method === 'getUpdates').body.allowed_updates, ['managed_bot'])
assert.deepEqual(s.calls.find((c) => c.method === 'getManagedBotToken').body, { user_id: 71 })
assert.equal(JSON.parse(fs.readFileSync(path.join(root, 'data', 'node', 'bot-factory-offset.json'), 'utf8')).offset, 12)
ok('waiting: only managed_bot updates, a stranger\'s bot skipped, the token taken for ours, the offset kept')

// nobody confirmed → timeout
assert.equal((await f.awaitCreated(root, { ms: 1200 }, stub({ me: { ok: true } }).fetchImpl)).error, 'timeout')
ok('nobody confirmed: timeout')

// reissue
assert.equal((await f.reissue(root, 71, stub({ me: { ok: true } }).fetchImpl)).ok, true)
ok('reissue: replaceManagedBotToken gives a new token')

fs.rmSync(root, { recursive: true, force: true })
console.log('===BOT_FACTORY_TEST_OK===')

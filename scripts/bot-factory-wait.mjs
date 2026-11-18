// node step 798-2/798-4: waits (≤ 10 min) for the bot the person confirms in Telegram's window, takes its token from the node's factory and
// connects it to the service it was offered to (the link's record, `bot-factory.cjs` remember/serviceOf; unknown → this waiter's
// service) exactly as the bot page's own form does (`saveToken` of the agent kit). Started detached by the doors and by an element's birth;
// its only trace is `data/node/bot-factory-wait.json` — never the token.
//   node scripts/bot-factory-wait.mjs <service> <suggested username>
import { createRequire } from 'node:module'
import fs from 'node:fs'
import path from 'node:path'

const require = createRequire(import.meta.url)
const ROOT = process.cwd()
const factory = require(path.join(ROOT, 'lib', 'node', 'bot-factory.cjs'))
const [service, username] = process.argv.slice(2)
const status = path.join(ROOT, 'data', 'node', 'bot-factory-wait.json')
const MS = 10 * 60_000

const write = (o) => { fs.mkdirSync(path.dirname(status), { recursive: true }); fs.writeFileSync(status, JSON.stringify({ service, username, pid: process.pid, ...o }, null, 2)) }

// The kit copy of the service: its own group (`architect/<service>/_agent-kit`) or the shared one of born elements (`[item]`).
function kitOf(id) {
  const own = path.join(ROOT, 'app', '[lang]', '(architectLayer)', 'architect', id, '_agent-kit', 'server', 'telegram.cjs')
  return fs.existsSync(own) ? own : path.join(ROOT, 'app', '[lang]', '(architectLayer)', 'architect', '[item]', '_agent-kit', 'server', 'telegram.cjs')
}

if (!/^[a-z0-9][a-z0-9-]{0,40}$/.test(service ?? '')) { console.error('bot-factory-wait: <service> <username>'); process.exit(2) }
const startedAt = new Date().toISOString()
const until = Date.now() + MS
write({ state: 'waiting', startedAt, until: new Date(until).toISOString() })
for (;;) {
  const got = await factory.awaitCreated(ROOT, { ms: Math.max(1000, until - Date.now()) })
  if (!got.ok) { write({ state: got.error === 'timeout' ? 'timeout' : 'error', error: got.error, startedAt }); process.exit(0) }
  const target = factory.serviceOf(ROOT, got.bot.username) ?? service
  const saved = await require(kitOf(target)).saveToken(target, got.token)
  if (target !== service) continue // a late bot of another offer — connected where it belongs; this waiter waits on
  write(saved.ok
    ? { state: 'done', startedAt, bot: { id: got.bot.id, username: saved.username, tail: saved.tail } }
    : { state: 'error', error: saved.error, startedAt, bot: { id: got.bot.id, username: got.bot.username } })
  process.exit(0)
}

// THE SERVER'S OWN BOT, SET UP FROM THIS COMPUTER (node step 737-11a). The owner, 2026-11-13: «вызываем процедуру создание нового
// телеграмм бота прямо в этом окне … После подтверждения сервер сразу стартует установленный на него Telegram».
// One call of the door `app/api/node/server/telegram` = one run of this relay: it reads `{ method, lang, body }` from stdin, reaches the
// server as the node's user by the node's key, and asks the server's OWN channel door of the main agent on its loopback
// (`/<lang>/architect/build/agent-api/channel` — the same door the server's panel uses; a loopback request without the edge mark is the
// owner at that machine, `lib/auth/owner-at-machine.ts`). It prints the server's answer as one JSON line.
// 🔒 THE TOKEN NEVER ENTERS AN ARGV: the browser → the door's request body → this relay's stdin → the SSH channel's stdin → `curl --data-binary
// @-` on the server. Neither process list (here or there) shows it, and nothing writes it to a file here.
// 🔒 THE SERVER'S POLLER IS ALREADY RUNNING: the core starts one for the main agent at its own start and reads the token at every tick
// (`startIdlePoller`, measured 2026-11-13) — a token saved there is read within 3 s, no restart. During the rehearsal (phase «silent») that
// poller only admits by the activation link and answers with one line (`telegram.cjs`, 737-11a): no agent starts there before the move.
// `--dry` (its test): the «server» is this machine through the test's SSH server; FRACTERA_MOVE_NODE_ROOT / FRACTERA_MOVE_REMOTE_ROOT as in move.mjs.
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { readMove } from '../../lib/hosting/move-state.mjs'
import { q } from '../../lib/hosting/remote.mjs'
import { connect, exec } from '../../lib/hosting/ssh.mjs'
import { remoteRootOf, REMOTE_USER } from '../../lib/hosting/transfer.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const dry = process.argv.includes('--dry')
const root = (dry && process.env.FRACTERA_MOVE_NODE_ROOT) || path.resolve(here, '..', '..')
const REMOTE_ROOT = (dry && process.env.FRACTERA_MOVE_REMOTE_ROOT) || remoteRootOf(root)
const LANG = /^[a-z]{2,3}(-[A-Za-z0-9]{2,8})?$/
async function relay() {
  let raw = ''
  for await (const chunk of process.stdin) raw += chunk
  let input = null
  try { input = JSON.parse(raw) } catch { return { ok: false, error: 'relay-bad-input' } }
  const method = input?.method === 'POST' ? 'POST' : 'GET'
  const lang = typeof input?.lang === 'string' && LANG.test(input.lang) ? input.lang : 'en'
  const server = readMove(root).server
  if (!server?.host) return { ok: false, error: 'relay-no-server' }
  let client = null
  try {
    ({ client } = await connect({ root, host: server.host, port: server.port, username: REMOTE_USER }))
    // The server's core port is the server's own record (`logs/runtime.json` never travels: each machine writes its own at start).
    const rt = await exec(client, `cat ${q(`${REMOTE_ROOT}/logs/runtime.json`)} 2>/dev/null || true`, { timeoutMs: 15_000 })
    let port = 24680
    try { port = Number(JSON.parse(rt.stdout).port) || port } catch { /* the default port */ }
    const url = `http://127.0.0.1:${port}/${lang}/architect/build/agent-api/channel`
    const r = method === 'GET'
      ? await exec(client, `curl -s --max-time 25 ${q(url)}`, { timeoutMs: 40_000 })
      : await exec(client, `curl -s --max-time 25 -X POST -H 'content-type: application/json' --data-binary @- ${q(url)}`, { timeoutMs: 40_000, stdin: JSON.stringify(input?.body ?? {}) })
    let answer = null
    try { answer = JSON.parse(r.stdout.trim()) } catch { /* not JSON: the server's core is down or busy */ }
    return answer && typeof answer === 'object' ? answer : { ok: false, error: 'server-silent' }
  } catch (e) {
    return { ok: false, error: 'server-unreachable', detail: String(e?.reason ?? e?.message ?? e).slice(0, 200) }
  } finally {
    client?.end()
  }
}

const out = await relay()
process.stdout.write(`${JSON.stringify(out)}\n`)
if (out.ok === false && String(out.error).startsWith('relay-')) process.exitCode = 2

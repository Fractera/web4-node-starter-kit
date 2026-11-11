// test-openai-errors — the node's one reader of OpenAI's errors against a FAKE OpenAI over real HTTP (step 726-0).
//
//   npm run test:openai-errors
//
// Plane: the module on the wire. A loopback server answers each refusal OpenAI's error-codes guide names
// (https://developers.openai.com/api/docs/guides/error-codes, read 2026-11-12) with its status and body; `readOpenAiResponse` must
// name the reason and OpenAI's page to act on. Then the two ways fetch itself fails — a timeout and a closed port.
//
// Negative controls, both must stay red:
//   • the OLD reading of the translate door (before 78089ae4, verbatim below) reads `credit_balance_exhausted` as a rate limit —
//     the very defect the owner saw on 2026-11-11;
//   • the guard `check:openai-calls` on a tree with a direct call that bypasses the reader, and with a kit copy that drifted.

import { createServer } from 'node:http'
import { createRequire } from 'node:module'
import { execFileSync } from 'node:child_process'
import { cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'

const require = createRequire(import.meta.url)
const { readOpenAiResponse, readOpenAiException } = require('../lib/openai-error.cjs')

const err = (code, type, message) => ({ error: { message, type, param: null, code } })
// [title in the guide, status, body, the reason it must read as, a fragment of the link]
const CASES = [
  ['401 Incorrect API key provided', 401, err('invalid_api_key', 'invalid_request_error', 'Incorrect API key provided: sk-proj-abcd****wxyz.'), 'bad-key', 'api-keys'],
  ['401 Invalid Authentication', 401, err(null, 'invalid_request_error', 'Invalid authentication'), 'bad-key', 'api-keys'],
  ['401 IP not authorized', 401, err(null, 'invalid_request_error', 'IP not authorized for this project'), 'ip-blocked', 'ip-allowlist'],
  ['403 Country, region, or territory not supported', 403, err('unsupported_country_region_territory', 'request_forbidden', 'Country, region, or territory not supported'), 'region', 'supported-countries'],
  ['403 other permission', 403, err(null, 'invalid_request_error', 'You have insufficient permissions for this operation.'), 'forbidden', 'api-keys'],
  ['429 Credit balance exhausted', 429, err('credit_balance_exhausted', 'insufficient_quota', 'You have no credits remaining. org-AbC123xyz'), 'no-funds', 'billing'],
  ['429 insufficient_quota (older code)', 429, err('insufficient_quota', 'insufficient_quota', 'You exceeded your current quota'), 'no-funds', 'billing'],
  ['429 Rate limit reached for requests', 429, err('rate_limit_exceeded', 'requests', 'Rate limit reached for gpt-5-mini in organization org-Zz9 on requests per min'), 'rate-limit', 'rate-limits'],
  ['429 Slow down', 429, err('slow_down', 'rate_limit_error', 'Your request rate increased too quickly'), 'rate-limit', 'rate-limits'],
  ['429 Organization spend limit reached', 429, err('organization_spend_limit_exceeded', 'insufficient_quota', 'spend limit'), 'spend-limit', 'organization/limits'],
  ['429 Project spend limit reached', 429, err('project_spend_limit_exceeded', 'insufficient_quota', 'project spend limit'), 'spend-limit', 'platform.openai.com/settings/'],
  ['429 Organization usage limit reached', 429, err('organization_usage_limit_exceeded', 'insufficient_quota', 'usage limit'), 'usage-limit', 'organization/limits'],
  ['500 The server had an error', 500, err(null, 'server_error', 'The server had an error while processing your request'), 'server', 'status.openai.com'],
  ['503 Model temporarily overloaded', 503, err('server_is_overloaded', 'service_unavailable_error', 'overloaded'), 'overloaded', 'status.openai.com'],
  ['404 NotFoundError (by status)', 404, err('model_not_found', 'invalid_request_error', 'The model `gpt-9` does not exist'), 'not-found', null],
  ['400 BadRequestError (by status)', 400, err(null, 'invalid_request_error', "Invalid 'messages'"), 'bad-request', null],
  ['502 with a body that is not JSON', 502, '<html>bad gateway</html>', 'server', 'status.openai.com'],
]

// The OLD reading, verbatim from app/api/i18n/translate/route.ts before 78089ae4 — the negative control.
function oldReading(status, code) {
  if (status === 401) return 'bad-key'
  if (code === 'insufficient_quota') return 'no-funds'
  if (status === 429) return 'rate-limit'
  return 'upstream'
}

let failed = 0
const say = (ok, line) => { if (!ok) failed++; console.log(`${ok ? '  ✓' : '  ✗'} ${line}`) }

let current = null
const server = createServer((req, res) => {
  if (req.url === '/hang') return // never answers: the timeout case
  const [, status, body] = current
  res.writeHead(status, { 'content-type': typeof body === 'string' ? 'text/html' : 'application/json' })
  res.end(typeof body === 'string' ? body : JSON.stringify(body))
})
// A port of the node's own range, never 3000 or 49152+ (CLAUDE.md §2); the first free one from the top of the range.
let port = 0
for (const p of [25679, 25678, 25677, 25676, 25675]) {
  try { await new Promise((ok, no) => { server.once('error', no); server.listen(p, '127.0.0.1', ok) }); port = p; break } catch { /* busy */ }
}
if (!port) { console.error('no free port in 25675–25679'); process.exit(1) }
const base = `http://127.0.0.1:${port}`

console.log(`fake OpenAI on ${base} — every refusal of the guide:`)
for (const c of CASES) {
  current = c
  const res = await fetch(`${base}/v1/chat/completions`, { method: 'POST' })
  const info = await readOpenAiResponse(res)
  const linkOk = c[4] === null ? info.link === null : String(info.link).includes(c[4])
  say(info.reason === c[3] && linkOk, `${c[0]} → ${info.reason} · ${info.link ?? 'no link'}`)
}

current = CASES.find((c) => c[3] === 'no-funds')
{
  const res = await fetch(`${base}/x`, { method: 'POST' })
  const info = await readOpenAiResponse(res)
  say(!/org-AbC123xyz/.test(info.message) && info.message.includes('org-…'), `the organization id is hidden in OpenAI's message: «${info.message}»`)
}
{
  current = CASES[0]
  const res = await fetch(`${base}/x`, { method: 'POST' })
  const info = await readOpenAiResponse(res)
  say(!/sk-proj-abcd/.test(info.message), `a key fragment is hidden in OpenAI's message: «${info.message}»`)
}

try { await fetch(`${base}/hang`, { signal: AbortSignal.timeout(300) }); say(false, 'the hanging call did not time out') } catch (e) {
  const info = readOpenAiException(e); say(info.reason === 'timeout', `a call OpenAI never answers → ${info.reason}`)
}
server.close()
try { await fetch(`${base}/closed`); say(false, 'the closed port answered') } catch (e) {
  const info = readOpenAiException(e); say(info.reason === 'unreachable', `OpenAI out of reach (a closed port) → ${info.reason}`)
}

console.log('negative control — the old reading of the translate door:')
{
  const old = oldReading(429, 'credit_balance_exhausted')
  say(old === 'rate-limit', `the old code reads credit_balance_exhausted as «${old}» (the defect of 2026-11-11 reproduced; the reader says «no-funds»)`)
}

console.log('negative control — the guard on a broken tree:')
{
  const tree = mkdtempSync(join(tmpdir(), 'openai-calls-'))
  try {
    const KIT = 'app/[lang]/(architectLayer)/architect/kits/_agent-kit/core/server/openai-error.cjs'
    for (const f of ['lib/openai-error.cjs', KIT]) { mkdirSync(join(tree, dirname(f)), { recursive: true }); cpSync('lib/openai-error.cjs', join(tree, f)) }
    mkdirSync(join(tree, 'app/api/x'), { recursive: true })
    writeFileSync(join(tree, 'app/api/x/route.ts'), 'export async function POST() { return fetch("https://api.openai.com/v1/chat/completions") }\n')
    execFileSync('git', ['init', '-q'], { cwd: tree })
    const guard = () => { try { execFileSync('node', ['scripts/check-openai-calls.mjs', '--root', tree], { stdio: 'pipe' }); return 'green' } catch { return 'red' } }
    say(guard() === 'red', 'a new direct call without the reader → the guard is red')
    writeFileSync(join(tree, 'app/api/x/route.ts'), 'import { readOpenAiResponse } from "@/lib/openai-error.cjs"\nexport async function POST() { return fetch("https://api.openai.com/v1/chat/completions") }\n')
    say(guard() === 'green', 'the same call through the reader → the guard is green')
    writeFileSync(join(tree, KIT), '// drifted\n')
    say(guard() === 'red', "the kit's copy drifted from the reader → the guard is red")
  } finally {
    rmSync(tree, { recursive: true, force: true })
  }
}

console.log(failed ? `===OPENAI_ERRORS_FAILED=== ${failed}` : '===OPENAI_ERRORS_OK=== every refusal of the guide read right; both negative controls red')
process.exit(failed ? 1 : 0)

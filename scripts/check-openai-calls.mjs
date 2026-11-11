// check-openai-calls — every call of the core to OpenAI reads a refusal through the node's ONE reader (step 726-0).
//
// Why: on 2026-11-11 twenty files called api.openai.com directly, each reading OpenAI's error its own way or not at all; an empty
// prepaid balance (`credit_balance_exhausted`, HTTP 429) reached the person as «rate limit, wait» or as a bare red mark. The cure is
// one reader, `lib/openai-error.cjs` (its list from OpenAI's own error-codes guide); this guard keeps a NEW direct call from
// bypassing it — the defect returns silently otherwise, because a direct call works perfectly until the day OpenAI refuses.
//
// Three rules, each with its own breakage (the guard is proven by breaking, `npm run test:openai-errors` does it):
//   1. a file of the core that calls OpenAI — names `api.openai.com` or imports `@ai-sdk/openai` (726-1: the AI SDK path has no
//      literal host and was invisible to the first version) — must load the reader (`openai-error`) AND the ledger (`usage-ledger`,
//      726-1: every paid call writes its line);
//   2. the agent kit's copies `core/server/openai-error.cjs` and `usage-ledger.cjs` are byte-identical to `lib/` (the kit lives
//      without the core; its copies in the groups are held by `check:agent-kits`);
//   3. the reader names every code of OpenAI's guide — a code dropped from the list is a refusal read wrong again.
//
// `--root <dir>` checks another tree (the test runs it on a broken copy).

import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createRequire } from 'node:module'

const args = process.argv.slice(2)
const rootAt = args.indexOf('--root')
const ROOT = rootAt >= 0 ? args[rootAt + 1] : process.cwd()
const DIRS = ['lib', 'app', '_tools', 'scripts', 'components', 'services']
const READER = 'lib/openai-error.cjs'
const KIT = 'app/[lang]/(architectLayer)/architect/kits/_agent-kit/core/server'
const LEDGER = 'lib/usage-ledger.cjs'
// The codes OpenAI's guide names (https://developers.openai.com/api/docs/guides/error-codes, read 2026-11-12) and the reason each
// must read as. A new code in the guide is added here AND in the reader, in one commit.
const GUIDE = {
  credit_balance_exhausted: 'no-funds',
  insufficient_quota: 'no-funds',
  organization_spend_limit_exceeded: 'spend-limit',
  project_spend_limit_exceeded: 'spend-limit',
  organization_usage_limit_exceeded: 'usage-limit',
  slow_down: 'rate-limit',
  server_is_overloaded: 'overloaded',
}

const problems = []

// 1. Files that call OpenAI directly — tracked and new (an untracked file is exactly the one a fresh change adds).
let files = []
try {
  files = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '--', ...DIRS], { cwd: ROOT, encoding: 'utf8' })
    .split('\n').filter((f) => /\.(c|m)?(j|t)sx?$/.test(f))
} catch {
  problems.push('git ls-files failed — the guard cannot see the tree')
}
let callers = 0
for (const f of new Set(files)) {
  const full = join(ROOT, f)
  if (!existsSync(full) || f === READER || f === LEDGER || /\/(openai-error|usage-ledger)\.cjs$/.test(f) || f === 'scripts/check-openai-calls.mjs' || f.startsWith('scripts/test-openai-errors')) continue
  const src = readFileSync(full, 'utf8')
  if (!src.includes('api.openai.com') && !/from ["']@ai-sdk\/openai["']/.test(src)) continue
  callers++
  if (!/openai-error(\.cjs)?['"]/.test(src)) problems.push(`${f}: calls OpenAI without the reader — import { readOpenAiResponse, logOpenAiError } from "@/lib/openai-error.cjs" (the AI SDK: readOpenAiSdkError; a .cjs of the kit: require('./openai-error.cjs'))`)
  if (!/usage-ledger(\.cjs)?['"]/.test(src)) problems.push(`${f}: calls OpenAI without the ledger — import { recordOk, recordRefusal } from "@/lib/usage-ledger.cjs" (a .cjs of the kit: require('./usage-ledger.cjs')); every paid call writes one line`)
}

// 2. The kit's copies.
const reader = join(ROOT, READER)
for (const own of [READER, LEDGER]) {
  const name = own.split('/').pop()
  const a = join(ROOT, own)
  const b = join(ROOT, KIT, name)
  if (!existsSync(a)) problems.push(`${own} is missing`)
  else if (!existsSync(b)) problems.push(`${KIT}/${name} is missing — cp ${own} into the kit master, then npm run agent-kit:update`)
  else if (readFileSync(a, 'utf8') !== readFileSync(b, 'utf8')) problems.push(`${KIT}/${name} differs from ${own} — cp it again, then npm run agent-kit:update`)
}

// 3. The guide's codes.
if (existsSync(reader)) {
  const { readOpenAiError } = createRequire(import.meta.url)(reader)
  for (const [code, want] of Object.entries(GUIDE)) {
    const status = code === 'server_is_overloaded' ? 503 : 429
    const got = readOpenAiError(status, { error: { code, type: code === 'insufficient_quota' ? 'insufficient_quota' : 'x', message: 'm' } }).reason
    if (got !== want) problems.push(`the reader reads ${code} (HTTP ${status}) as «${got}», OpenAI's guide means «${want}»`)
  }
}

if (problems.length) {
  for (const p of problems) console.error(`  ✗ ${p}`)
  console.error(`===OPENAI_CALLS_FAILED=== ${problems.length}`)
  process.exit(1)
}
console.log(`===OPENAI_CALLS_OK=== ${callers} callers of OpenAI, every one through the reader and the ledger; the kit's copies identical; ${Object.keys(GUIDE).length} codes of OpenAI's guide read right`)

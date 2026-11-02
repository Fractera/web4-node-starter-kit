// 627-1 — MARK: a card per unique skill, by Claude Haiku through the owner's subscription. Each call is `claude -p` with no tools, no MCP,
// no settings (so no plugins and no hooks), no session file, the system prompt from a file, and an empty working folder in the system's
// temporary directory — so no CLAUDE.md is found (measured 2026-11-02: ~600 tokens of overhead, 1.7 s). `total_cost_usd` of the answer
// says what the same call would cost through the API; the subscription pays nothing extra, it spends its limits.
// Resumable: a card whose id and fingerprint are already in cards.jsonl is not marked again; a usage limit stops the run — run it again.
import { spawn } from 'node:child_process'
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { blobShaOf, dedupeBySha, shaOf, urlOf, validateCard } from './lib.mjs'
import { SYSTEM, userMessage } from './marker-prompt.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)
const { resolveBin } = require('../../app/[lang]/(architectLayer)/architect/[item]/_agent-kit/server/claude-cli.cjs')

const LIMIT_WORDS = /usage limit|rate limit|limit reached|429|overloaded/i

/** One `claude -p` call → { ok, json } or { ok: false, error }. On Windows a `claude.cmd` runs through the shell, its arguments quoted. */
function claudeOnce(bin, sysFile, input, cwd) {
  const args = ['-p', '--model', 'haiku', '--tools', '', '--strict-mcp-config', '--setting-sources', '', '--no-session-persistence',
    '--system-prompt-file', sysFile, '--output-format', 'json']
  const win = process.platform === 'win32' && /\.cmd$/i.test(bin)
  const quote = (a) => (a === '' ? '""' : /\s/.test(a) ? `"${a}"` : a)
  return new Promise((resolve) => {
    let child
    try {
      child = spawn(win ? quote(bin) : bin, win ? args.map(quote) : args, { cwd, shell: win, windowsHide: true })
    } catch (err) {
      return resolve({ ok: false, error: err instanceof Error ? err.message : String(err) })
    }
    let out = ''
    let err = ''
    child.stdout.on('data', (d) => { out += d })
    child.stderr.on('data', (d) => { err += d })
    const timer = setTimeout(() => child.kill(), 180_000)
    child.on('error', (e) => { clearTimeout(timer); resolve({ ok: false, error: e.message }) })
    child.on('close', (code) => {
      clearTimeout(timer)
      let json
      try { json = JSON.parse(out) } catch { return resolve({ ok: false, error: `exit ${code}: ${(err || out).slice(-300).trim()}` }) }
      resolve(json.is_error ? { ok: false, error: String(json.result ?? json.subtype).slice(0, 300), json } : { ok: true, json })
    })
    child.stdin.end(input)
  })
}

/** The model's text → the marks object; a code fence or words around the JSON are tolerated. */
function marksOf(result) {
  const s = String(result ?? '')
  const from = s.indexOf('{')
  const to = s.lastIndexOf('}')
  if (from < 0 || to <= from) throw new Error('no JSON object in the answer')
  return JSON.parse(s.slice(from, to + 1))
}

/** The card: our metadata around the model's marks. A risk always means «not-for-node» — decided here, not left to the model. */
function cardOf(row, text, m, markedBy) {
  const risks = Array.isArray(m.risks) ? m.risks.map((r) => String(r).trim()).filter(Boolean) : m.risks
  return {
    id: `${row.source}@${row.skill}`, source: row.source, skill: row.skill, installs: row.installs, stars: row.stars ?? null,
    licence: row.licence ?? null, url: urlOf(row.source, row.skill), sha: row.sha, blob: blobShaOf(text),
    summary: String(m.summary ?? '').trim(),
    tasks: Array.isArray(m.tasks) ? m.tasks.map((t) => String(t).trim()) : m.tasks,
    tags: Array.isArray(m.tags) ? m.tags.map((t) => String(t).toLowerCase().trim()) : m.tags,
    tools: Array.isArray(m.tools) ? m.tools.map((t) => String(t).trim()).filter(Boolean) : m.tools,
    fractera: Array.isArray(risks) && risks.length ? 'not-for-node' : m.fractera,
    why: String(m.why ?? '').trim(), risks, markedBy, markedAt: new Date().toISOString(),
  }
}

const readJsonl = (file) => (existsSync(file) ? readFileSync(file, 'utf8').split(/\r?\n/).filter(Boolean).map((l) => JSON.parse(l)) : [])

/** Mark one row: two tries; returns { card } or { error, limit }. Every call is written to the log with its usage. */
async function markRow(row, text, ctx) {
  let last = 'not tried'
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const started = Date.now()
    const r = await claudeOnce(ctx.bin, ctx.sysFile, userMessage(row, text), ctx.cwd)
    const u = r.json?.usage ?? {}
    const markedBy = Object.keys(r.json?.modelUsage ?? {})[0] ?? 'haiku'
    let card = null
    let errors = []
    if (r.ok) {
      try {
        card = cardOf(row, text, marksOf(r.json.result), markedBy)
        errors = validateCard(card)
      } catch (e) {
        errors = [e instanceof Error ? e.message : String(e)]
      }
    }
    appendFileSync(ctx.log, `${JSON.stringify({
      id: `${row.source}@${row.skill}`, attempt, ok: r.ok && !errors.length, error: r.ok ? errors.join(', ') || undefined : r.error,
      input: (u.input_tokens ?? 0) + (u.cache_creation_input_tokens ?? 0) + (u.cache_read_input_tokens ?? 0),
      cacheRead: u.cache_read_input_tokens ?? 0, output: u.output_tokens ?? 0, ms: r.json?.duration_ms ?? Date.now() - started,
      costUsd: r.json?.total_cost_usd ?? null, model: markedBy, chars: text.length,
    })}\n`)
    if (r.ok && !errors.length) return { card }
    last = r.ok ? `invalid card: ${errors.join(', ')}` : r.error
    if (!r.ok && LIMIT_WORDS.test(r.error)) return { error: last, limit: true }
  }
  return { error: last }
}

/** Mark every unique fetched skill not yet in the cards (or, with `control`, the planted fixtures only). */
export async function markAll({ dataDir, cardsFile, limit = Infinity, concurrency = 3, control = false }) {
  const bin = resolveBin('claude')
  if (!bin) throw new Error('claude is not found — the marker runs on Claude Code')
  const cwd = join(tmpdir(), 'fractera-catalog-mark')
  mkdirSync(cwd, { recursive: true })
  const sysFile = join(cwd, 'marker-system.txt')
  writeFileSync(sysFile, SYSTEM)
  mkdirSync(dataDir, { recursive: true })
  const ctx = { bin, sysFile, cwd, log: join(dataDir, 'mark-log.jsonl') }

  if (control) {
    const fixture = join(HERE, 'fixtures', 'planted-risky', 'SKILL.md')
    const text = readFileSync(fixture, 'utf8')
    const row = { rank: 0, source: 'fractera-control/planted', skill: 'planted-risky', installs: 0, stars: null, licence: null, sha: shaOf(text) }
    const r = await markRow(row, text, ctx)
    const line = r.card ?? { id: `${row.source}@${row.skill}`, error: r.error }
    writeFileSync(join(dataDir, 'controls.jsonl'), `${JSON.stringify(line)}\n`)
    return { marked: r.card ? 1 : 0, failed: r.card ? [] : [line], skipped: 0, duplicates: [], stoppedByLimit: Boolean(r.limit) }
  }

  const fetched = JSON.parse(readFileSync(join(dataDir, 'fetched.json'), 'utf8')).filter((r) => r.sha)
  const { keep, duplicates } = dedupeBySha(fetched)
  writeFileSync(join(dataDir, 'duplicates.json'), `${JSON.stringify(duplicates, null, 1)}\n`)
  const cards = new Map(readJsonl(cardsFile).map((c) => [c.id, c]))
  const todo = keep.filter((r) => cards.get(`${r.source}@${r.skill}`)?.sha !== r.sha).slice(0, limit)
  const failed = []
  let stop = false
  let next = 0
  let marked = 0
  const save = () => {
    mkdirSync(dirname(cardsFile), { recursive: true })
    const sorted = [...cards.values()].sort((a, b) => b.installs - a.installs || a.id.localeCompare(b.id))
    writeFileSync(cardsFile, sorted.map((c) => JSON.stringify(c)).join('\n') + '\n')
  }
  const worker = async () => {
    while (!stop && next < todo.length) {
      const row = todo[next++]
      const text = readFileSync(join(dataDir, row.file), 'utf8')
      const r = await markRow(row, text, ctx)
      if (r.card) {
        cards.set(r.card.id, r.card)
        marked += 1
        save()
        console.log(`  ${r.card.id}: ${r.card.fractera}${r.card.risks.length ? ` · risks ${r.card.risks.length}` : ''}`)
      } else {
        failed.push({ id: `${row.source}@${row.skill}`, error: r.error })
        console.log(`  ${row.source}@${row.skill}: FAILED — ${r.error}`)
        if (r.limit) stop = true
      }
    }
  }
  await Promise.all(Array.from({ length: Math.max(1, concurrency) }, worker))
  return { marked, failed, skipped: keep.length - todo.length, duplicates, stoppedByLimit: stop }
}

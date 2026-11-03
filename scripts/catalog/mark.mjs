// 627-1 — MARK: a card per unique skill, by Claude Haiku through the owner's subscription. Each call is `claude -p` with no tools, no MCP,
// no settings (so no plugins and no hooks), no session file, the system prompt from a file, and an empty working folder in the system's
// temporary directory — so no CLAUDE.md is found (measured 2026-11-02: ~600 tokens of overhead, 1.7 s). `total_cost_usd` of the answer
// says what the same call would cost through the API; the subscription pays nothing extra, it spends its limits.
// Run 2: the marker reads the skill's SKILL.md AND its scripts (whole folders from fetch.mjs); the card carries the folder's files,
// scripts, fingerprint and licence. Resumable: a card whose id and folder fingerprint are already in cards.jsonl is not marked again;
// a usage limit stops the run — run it again.
import { spawn } from 'node:child_process'
import { appendFileSync, existsSync, lstatSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
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

const list = (v, lower = false) => (Array.isArray(v) ? v.map((t) => (lower ? String(t).toLowerCase() : String(t)).trim()).filter(Boolean) : v)

/** The card: our metadata around the model's marks. A risk always means `use: skip` — decided here, not left to the model. */
function cardOf(row, text, m, markedBy) {
  const risks = list(m.risks)
  return {
    id: `${row.source}@${row.skill}`, source: row.source, skill: row.skill, installs: row.installs, stars: row.stars ?? null,
    licence: row.licence ?? null, licenceFrom: row.licenceFrom ?? null, url: urlOf(row.source, row.skill),
    sha: row.sha, blob: row.blob ?? blobShaOf(text), folderSha: row.folderSha ?? null,
    files: row.files ?? 1, scripts: row.scripts ?? [],
    summary: String(m.summary ?? '').trim(), tasks: list(m.tasks), tags: list(m.tags, true), tools: list(m.tools),
    quality: Number(m.quality), qualityWhy: String(m.qualityWhy ?? '').trim(),
    value: m.value, use: Array.isArray(risks) && risks.length ? 'skip' : m.use, needs: list(m.needs) ?? [],
    why: String(m.why ?? '').trim(), risks, markedBy, markedAt: new Date().toISOString(),
  }
}

const readJsonl = (file) => (existsSync(file) ? readFileSync(file, 'utf8').split(/\r?\n/).filter(Boolean).map((l) => JSON.parse(l)) : [])

/** The folder's scripts as strings — links are never read (a link file holds only its target's path anyway: core.symlinks=false). */
function scriptsOf(row, dataDir) {
  return (row.scripts ?? []).map((p) => {
    const file = join(dataDir, row.dir, row.folder ?? '', p)
    try {
      if (lstatSync(file).isSymbolicLink()) return { path: p, text: '[a link — not read]' }
      return { path: p, text: readFileSync(file, 'utf8') }
    } catch {
      return { path: p, text: '[could not be read]' }
    }
  })
}

/** Mark one row: two tries; returns { card } or { error, limit }. Every call is written to the log with its usage. */
async function markRow(row, text, scripts, ctx) {
  let last = 'not tried'
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const started = Date.now()
    const input = userMessage(row, text, scripts)
    const r = await claudeOnce(ctx.bin, ctx.sysFile, input, ctx.cwd)
    const u = r.json?.usage ?? {}
    const markedBy = Object.keys(r.json?.modelUsage ?? {})[0] ?? 'haiku'
    let card = null
    let errors = []
    if (r.ok) {
      try {
        card = cardOf(row, text, marksOf(r.json.result), markedBy)
        if (ctx.audits) card.audits = ctx.audits[card.id] ?? []
        errors = validateCard(card)
      } catch (e) {
        errors = [e instanceof Error ? e.message : String(e)]
      }
    }
    appendFileSync(ctx.log, `${JSON.stringify({
      id: `${row.source}@${row.skill}`, attempt, ok: r.ok && !errors.length, error: r.ok ? errors.join(', ') || undefined : r.error,
      input: (u.input_tokens ?? 0) + (u.cache_creation_input_tokens ?? 0) + (u.cache_read_input_tokens ?? 0),
      cacheRead: u.cache_read_input_tokens ?? 0, output: u.output_tokens ?? 0, ms: r.json?.duration_ms ?? Date.now() - started,
      costUsd: r.json?.total_cost_usd ?? null, model: markedBy, chars: input.length, scripts: scripts.length,
    })}\n`)
    if (r.ok && !errors.length) return { card }
    last = r.ok ? `invalid card: ${errors.join(', ')}` : r.error
    if (!r.ok && LIMIT_WORDS.test(r.error)) return { error: last, limit: true }
  }
  return { error: last }
}

/** Mark every unique fetched skill not yet in the cards (or, with `control`, the planted fixture only). */
export async function markAll({ dataDir, cardsFile, limit = Infinity, concurrency = 3, control = false, only = null }) {
  const bin = resolveBin('claude')
  if (!bin) throw new Error('claude is not found — the marker runs on Claude Code')
  const cwd = join(tmpdir(), 'fractera-catalog-mark')
  mkdirSync(cwd, { recursive: true })
  const sysFile = join(cwd, 'marker-system.txt')
  writeFileSync(sysFile, SYSTEM)
  mkdirSync(dataDir, { recursive: true })
  // The partners' audits, when `npm run catalog -- audit` ran before the marking (627-5).
  const audits = existsSync(join(dataDir, 'audits.json')) ? JSON.parse(readFileSync(join(dataDir, 'audits.json'), 'utf8')) : null
  const ctx = { bin, sysFile, cwd, log: join(dataDir, 'mark-log.jsonl'), audits }

  if (control) {
    const fixture = join(HERE, 'fixtures', 'planted-risky', 'SKILL.md')
    const text = readFileSync(fixture, 'utf8')
    const row = { rank: 0, source: 'fractera-control/planted', skill: 'planted-risky', installs: 0, stars: null, licence: null,
      licenceFrom: null, sha: shaOf(text), files: 1, scripts: [], list: [`SKILL.md ${text.length}`] }
    const r = await markRow(row, text, [], ctx)
    const line = r.card ?? { id: `${row.source}@${row.skill}`, error: r.error }
    writeFileSync(join(dataDir, 'controls.jsonl'), `${JSON.stringify(line)}\n`)
    return { marked: r.card ? 1 : 0, failed: r.card ? [] : [line], skipped: 0, duplicates: [], stoppedByLimit: Boolean(r.limit) }
  }

  // The fetch may still be writing fetched.json (a large run marks what is fetched so far, then runs again): a half-written file is read
  // again after a second, three times.
  let fetched = null
  for (let attempt = 1; !fetched; attempt += 1) {
    try { fetched = JSON.parse(readFileSync(join(dataDir, 'fetched.json'), 'utf8')).filter((r) => r.sha) } catch (err) {
      if (attempt >= 3) throw err
      await new Promise((ok) => setTimeout(ok, 1000))
    }
  }
  const { keep, duplicates } = dedupeBySha(fetched)
  writeFileSync(join(dataDir, 'duplicates.json'), `${JSON.stringify(duplicates, null, 1)}\n`)
  const cards = new Map(readJsonl(cardsFile).map((c) => [c.id, c]))
  // `only` — these ids are marked again whatever the cards hold (a calibration check); otherwise every skill not marked yet.
  const todo = (only ? keep.filter((r) => only.includes(`${r.source}@${r.skill}`))
    : keep.filter((r) => cards.get(`${r.source}@${r.skill}`)?.folderSha !== r.folderSha)).slice(0, limit)
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
      const text = readFileSync(join(dataDir, row.dir, row.path), 'utf8')
      const r = await markRow(row, text, scriptsOf(row, dataDir), ctx)
      if (r.card) {
        cards.set(r.card.id, r.card)
        marked += 1
        save()
        console.log(`  ${r.card.id}: value ${r.card.value} · use ${r.card.use}${r.card.scripts.length ? ` · scripts ${r.card.scripts.length}` : ''}${r.card.risks.length ? ` · risks ${r.card.risks.length}` : ''}`)
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

// THE SKILLS CATALOG AS A FILE OF VECTORS (node step 627). The owner, 2026-11-03: «Чтобы мгновенно отвечать любыми затратами»; in the
// choice window — «Файл векторов (Рекомендую)». Measured before the choice: the catalog as a LightRAG space answered in ~11 s and took
// up to 1.36 GB while it ran (a process per call loads 246 MB of JSON); its relationship and topic vectors only added false hits. The
// catalog's pieces alone — a card's summary and each of its tasks — found the right card in 19 of 20 questions and nothing for 10 of 10
// questions outside the catalog at 0.60.
// A row is one piece of one card: `vectors.f32` (rows × dims float32, little-endian, normalized by `embeddings`) and `rows.json`
// ([mark, piece]); the cards' words stay in cards.jsonl. The query is counted by the node's `embeddings` — the same model as the rows.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

export const THRESHOLD = 0.6

/** The node key and the address of an element of the node (its port in the registry). */
export function elementAccess(root, id, fallbackPort) {
  let key = ''
  try {
    for (const line of readFileSync(join(root, '.env.local'), 'utf8').split(/\r?\n/)) {
      const m = line.match(/^SETTINGS_SECRET=(.*)$/)
      if (m) key = m[1].trim().replace(/^["']|["']$/g, '')
    }
  } catch { /* no key — the element refuses */ }
  let port = fallbackPort
  try {
    const reg = JSON.parse(readFileSync(join(root, 'WEB4-ITEMS-REGISTRY', 'web4-items.json'), 'utf8'))
    const list = Array.isArray(reg) ? reg : reg.items ?? reg.services ?? Object.values(reg)
    port = list.find((x) => x && x.id === id)?.port ?? port
  } catch { /* the default port */ }
  return { key, url: `http://127.0.0.1:${port}` }
}

/** Texts → normalized vectors by the node's `embeddings` (at most 256 texts a call). → { model, dims, vectors: Float32Array[] } */
export async function embedTexts(root, texts, timeout = 120_000) {
  const { key, url } = elementAccess(root, 'embeddings', 24696)
  const vectors = []
  let model = ''
  let dims = 0
  for (let i = 0; i < texts.length; i += 256) {
    const r = await fetch(`${url}/api/embed`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Node-Key': key }, body: JSON.stringify({ texts: texts.slice(i, i + 256) }), signal: AbortSignal.timeout(timeout) })
    const body = await r.json().catch(() => null)
    if (r.status !== 200 || !Array.isArray(body?.vectors)) throw new Error(`embeddings answered ${r.status}: ${JSON.stringify(body).slice(0, 200)}`)
    model = body.model ?? model
    dims = body.dims ?? body.vectors[0]?.length ?? dims
    for (const v of body.vectors) vectors.push(Float32Array.from(v))
  }
  return { model, dims, vectors }
}

/** The index folder → { manifest, rows, matrix, dims } — read once and kept by the caller. */
export function loadIndex(dir) {
  const manifest = JSON.parse(readFileSync(join(dir, 'manifest.json'), 'utf8'))
  const rows = JSON.parse(readFileSync(join(dir, 'rows.json'), 'utf8'))
  const buf = readFileSync(join(dir, 'vectors.f32'))
  const matrix = new Float32Array(buf.buffer, buf.byteOffset, buf.byteLength / 4)
  if (matrix.length !== rows.length * manifest.dims) throw new Error(`the index is broken: ${matrix.length} numbers for ${rows.length} rows of ${manifest.dims}`)
  return { manifest, rows, matrix, dims: manifest.dims }
}

/** The closest cards: a card's score is its best piece; only cards at or above the threshold. → [{ mark, score, piece }] */
export function searchIndex(index, query, { threshold = THRESHOLD, n = 3 } = {}) {
  const { rows, matrix, dims } = index
  const best = new Map()
  for (let r = 0; r < rows.length; r++) {
    let dot = 0
    const at = r * dims
    for (let d = 0; d < dims; d++) dot += matrix[at + d] * query[d]
    if (dot < threshold) continue
    const [mark, piece] = rows[r]
    const was = best.get(mark)
    if (!was || dot > was.score) best.set(mark, { mark, score: dot, piece })
  }
  return [...best.values()].sort((a, b) => b.score - a.score).slice(0, n)
}

// ── 627-3: A NODE RECEIVES THE CATALOG READY ─────────────────────────────────────────────────────────────────────────────────────
// At install and update the node takes the release named in `release.json` (beside the cards): downloads it, checks its sha256, the
// model and the size against the node's own `embeddings`, unpacks it beside the old copy and swaps the folders by a rename — the old
// copy stays until the new one is whole. Nothing is counted here. Already in place (the same vectors) — nothing is downloaded.
export const catalogDir = (root) => join(root, 'data', 'node', 'skills-catalog')
export const releaseFile = (root) => join(root, 'lib', 'agent-kit', 'skills', 'catalog', 'release.json')

async function embeddingsModel(root) {
  const { key, url } = elementAccess(root, 'embeddings', 24696)
  try {
    const r = await fetch(`${url}/api/embed-status`, { headers: { 'X-Node-Key': key }, signal: AbortSignal.timeout(5000) })
    const b = await r.json()
    return b?.model ? { model: b.model, dims: b.dims } : null
  } catch {
    return null
  }
}

/** → { ok, already?, reason?, cards?, rows? }. `download(url)` → Buffer (a stub in the probe), `model` — what the node counts with. */
export async function installCatalog(root, { release, download, model } = {}) {
  const { createHash } = await import('node:crypto')
  const { existsSync, mkdirSync, renameSync, rmSync, writeFileSync } = await import('node:fs')
  const { spawnSync } = await import('node:child_process')
  const sha = (b) => createHash('sha256').update(b).digest('hex')
  let rel = release
  try { rel ??= JSON.parse(readFileSync(releaseFile(root), 'utf8')) } catch { return { ok: false, reason: 'no release.json beside the cards' } }
  const dir = catalogDir(root)
  try {
    if (JSON.parse(readFileSync(join(dir, 'manifest.json'), 'utf8')).vectorsSha === rel.vectorsSha) return { ok: true, already: true, cards: rel.cards, rows: rel.rows }
  } catch { /* nothing in place yet */ }
  const mine = model === undefined ? await embeddingsModel(root) : model
  if (mine && (mine.model !== rel.model || mine.dims !== rel.dims)) return { ok: false, reason: `the catalog is counted by ${rel.model} (${rel.dims}), this node counts with ${mine.model} (${mine.dims}) — not taken` }
  let buf
  try {
    buf = download ? await download(rel.url) : Buffer.from(await (await fetch(rel.url, { signal: AbortSignal.timeout(600_000) })).arrayBuffer())
  } catch (e) {
    return { ok: false, reason: `the download failed: ${e instanceof Error ? e.message : e}` }
  }
  if (sha(buf) !== rel.sha256) return { ok: false, reason: `the downloaded file is not the released one (sha256 ${sha(buf).slice(0, 12)}… ≠ ${String(rel.sha256).slice(0, 12)}…) — not taken` }
  const tmp = `${dir}.new-${process.pid}`
  rmSync(tmp, { recursive: true, force: true })
  mkdirSync(tmp, { recursive: true })
  try {
    writeFileSync(join(tmp, 'package.tar.gz'), buf)
    const tar = spawnSync('tar', ['-xzf', 'package.tar.gz'], { cwd: tmp, encoding: 'utf8', windowsHide: true })
    rmSync(join(tmp, 'package.tar.gz'), { force: true })
    if (tar.status !== 0) return { ok: false, reason: `tar: ${String(tar.stderr).trim().slice(0, 200)}` }
    const index = loadIndex(tmp)
    if (index.manifest.model !== rel.model || index.manifest.dims !== rel.dims) return { ok: false, reason: `the package names ${index.manifest.model} (${index.manifest.dims}), release.json ${rel.model} (${rel.dims}) — not taken` }
    if (sha(readFileSync(join(tmp, 'vectors.f32'))) !== rel.vectorsSha) return { ok: false, reason: 'the vectors are not the released ones — not taken' }
    const old = `${dir}.old-${process.pid}`
    if (existsSync(dir)) renameSync(dir, old)
    renameSync(tmp, dir)
    rmSync(old, { recursive: true, force: true })
    return { ok: true, cards: index.manifest.cards, rows: index.rows.length }
  } finally {
    rmSync(tmp, { recursive: true, force: true })
  }
}

// ── 627-4: THE READER — `skills_find` and `npm run skills -- market` ───────────────────────────────────────────────────────────────
// The owner, 2026-11-03: «да, согласен, меняй 627-4» — the catalog answers from the checked cards only; the live skills.sh is looked at
// only when the person asks for it in so many words (`npm run skills -- market --live`), named «not checked by Fractera». A skip-card is
// never proposed; named by the person, it is answered from `skip.json` with the reason. A card with scripts says so: installed only
// after a separate yes. The index and the cards are read once per process (the tool lives as long as the session).
const catalogFiles = (root) => join(root, 'lib', 'agent-kit', 'skills', 'catalog')
const cache = new Map()
function loaded(root) {
  if (cache.has(root)) return cache.get(root)
  const index = loadIndex(catalogDir(root))
  const cards = new Map()
  for (const line of readFileSync(join(catalogFiles(root), 'cards.jsonl'), 'utf8').split('\n')) {
    if (!line) continue
    const c = JSON.parse(line)
    cards.set(`catalog:${String(c.source).replace(/\//g, '~')}:${c.skill}`, c)
  }
  let skip = []
  try { skip = JSON.parse(readFileSync(join(catalogFiles(root), 'skip.json'), 'utf8')).skills ?? [] } catch { /* no short list */ }
  const out = { index, cards, skip }
  cache.set(root, out)
  return out
}

/** The skip-cards the question names by their skill's name (a word of 4+ letters, exactly). */
function namedSkips(skip, query) {
  const words = new Set(String(query).toLowerCase().split(/[^a-z0-9-]+/).filter((w) => w.length >= 4))
  return skip.filter((s) => words.has(String(s.id).split('@').pop().toLowerCase())).slice(0, 3)
}

// ── 640-5: SEVEN CARDS, THE AGENT'S TERMS, OTHER PHRASINGS, THEN WORDS ───────────────────────────────────────────────────────────
// Found live in 640-4: for «in the style of a blogger» the agent passed the terms «brand voice», «voice profile», but the catalog
// heard only its sentence and gave three cards — `brand-voice` stood #6 and #12 above the threshold and was cut. The owner, 2026-11-04:
// «вместо трёх получаю семь навыков для первичного анализа – если найдены меньше семи то переформулирую запрос минимум два или три раза
// пока не будет найдено семь. – Если всё равно не найдено может быть ты примешь какую-нибудь ещё способ? – Если не найдено то в
// магазине навыков skills.sh». The vectors are the same; only the reading changes (no catalog is counted again).
// A card's score by meaning is the mean of its best piece for the sentence and its best piece for any term — measured on the owner's
// catalog: the max over the terms alone let one word («social media» → a video skill) push the fitting cards out.
export const WANT = 7
const MAX_TERMS = 10
const MAX_REPHRASINGS = 3
const list = (v) => (Array.isArray(v) ? v : typeof v === 'string' ? v.split(',') : []).map((s) => String(s).trim()).filter(Boolean)

/** Each card's best piece for each of the texts → Map(mark → Float32Array of scores), only the cards some text came near. */
function scoresOf(index, vectors, floor) {
  const { rows, matrix, dims } = index
  const out = new Map()
  for (let r = 0; r < rows.length; r++) {
    const at = r * dims
    for (let q = 0; q < vectors.length; q++) {
      const v = vectors[q]
      let dot = 0
      for (let d = 0; d < dims; d++) dot += matrix[at + d] * v[d]
      if (dot < floor) continue
      const mark = rows[r][0]
      let s = out.get(mark)
      if (!s) { s = new Float32Array(vectors.length).fill(-1); out.set(mark, s) }
      if (dot > s[q]) s[q] = dot
    }
  }
  return out
}

// The word pass: the agent's terms as whole phrases in a card's name, summary and tasks — for a card whose words the vectors missed.
// The name counts 2, the text 1; a card needs 2 — one term in its name, or two terms in its text (one common word in a summary —
// «reminder» — is noise: measured, it brought seven unrelated cards).
function byWords(cards, terms, taken, n) {
  const phrases = terms.map((t) => t.toLowerCase()).filter((t) => t.length >= 4)
    .map((t) => new RegExp(`(^|[^a-z0-9])${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/[-_\s]+/g, '[-_\\s]+')}($|[^a-z0-9])`))
  if (!phrases.length) return []
  const hits = []
  for (const [mark, c] of cards) {
    // A skip-card is never proposed (627-4), by words neither.
    if (taken.has(mark) || c.use === 'skip') continue
    const name = String(c.skill).toLowerCase()
    const text = `${c.summary ?? ''} ${(c.tasks ?? []).join(' ')}`.toLowerCase()
    let score = 0
    for (const p of phrases) score += p.test(name) ? 2 : p.test(text) ? 1 : 0
    if (score >= 2) hits.push({ mark, score, installs: c.installs ?? 0 })
  }
  return hits.sort((a, b) => b.score - a.score || b.installs - a.installs).slice(0, n)
}

/**
 * { query, terms?, rephrasings?, n? } → { ok, found: [card + score + by], skipped: [{ id, why }], passes, short, error? }
 * `terms` — the agent's short English themes and terms; `rephrasings` — 2–3 other sentences of the same task, read only when the first
 * gives fewer than `n`. `by`: «sentence», «rephrasing», «words».
 * @param {string} root
 * @param {{ query?: string, terms?: string[] | string, rephrasings?: string[], n?: number, embed?: (root: string, texts: string[], timeout?: number) => Promise<{ model: string, dims: number, vectors: Float32Array[] }> }} [options]
 * @returns {Promise<{ ok: boolean, query?: string, found: Record<string, any>[], skipped: { id: string, why: string }[], passes?: string[], short?: boolean, error?: string, ownNote?: string }>}
 */
export async function findInCatalogFile(root, { query = '', terms = [], rephrasings = [], n = WANT, embed = embedTexts } = {}) {
  // 640-2: the person's own skills (kept with `npm run skills -- keep`) are searched FIRST and stand above the catalog's cards — the
  // owner, 2026-11-04: «чтобы он был приоритете над основным числом других навыков». They answer even when the catalog is not here yet.
  const { ownModel, searchOwn } = await import('./own.mjs')
  let data = null
  try { data = loaded(root) } catch { /* no catalog on this node yet */ }
  const mine = ownModel(root)
  if (!data && !mine) {
    return { ok: false, found: [], skipped: [], error: 'the skills catalog is not on this node yet — npm run skills-catalog (it comes with the node\'s install and update)' }
  }
  const words = list(terms).slice(0, MAX_TERMS)
  const again = (Array.isArray(rephrasings) ? rephrasings : []).map((s) => String(s).trim()).filter(Boolean).slice(0, MAX_REPHRASINGS)
  const texts = [String(query), ...again, ...words].map((t) => t.slice(0, 1000))
  let vectors
  let model
  try {
    const r = await embed(root, texts, 30_000)
    vectors = r.vectors
    model = r.model
  } catch (e) {
    return { ok: false, found: [], skipped: [], error: `the node's embeddings element did not answer (${e instanceof Error ? e.message : e}) — npm run power -- embeddings on` }
  }
  if (data && model !== data.index.manifest.model) return { ok: false, found: [], skipped: [], error: `the catalog is counted by ${data.index.manifest.model}, the node's embeddings by ${model}` }
  // Another model's own index is never compared with this vector — named, and the catalog still answers.
  const ownNote = mine && mine !== model ? `the node's own skills are counted by ${mine}, the embeddings by ${model} — keep them again` : null
  // The own skills keep the sentence alone at their 0.45 (measured so in 640-2).
  const own = mine && !ownNote ? searchOwn(root, vectors[0], { n: 3 }) : []
  const seen = new Set(own.map((c) => String(c.id).toLowerCase()))
  const taken = new Map()
  const passes = []
  if (data) {
    const termsAt = 1 + again.length
    const scores = scoresOf(data.index, vectors, 0.3)
    const fused = (s, q) => (words.length ? (s[q] + Math.max(...s.subarray(termsAt))) / 2 : s[q])
    const put = (mark, card) => {
      if (taken.size >= n || !card?.id || seen.has(String(card.id).toLowerCase())) return
      taken.set(mark, card)
    }
    const pass = (q, by) => {
      const was = taken.size
      const best = []
      for (const [mark, s] of scores) if (!taken.has(mark) && s[q] > -1) best.push([mark, fused(s, q)])
      for (const [mark, score] of best.filter(([, v]) => v >= THRESHOLD).sort((a, b) => b[1] - a[1])) put(mark, { ...data.cards.get(mark), score, by })
      passes.push(`${by} ${q === 0 ? '' : `«${texts[q]}» `}+${taken.size - was}`)
    }
    pass(0, 'sentence')
    for (let i = 0; i < again.length && taken.size < n; i++) pass(1 + i, 'rephrasing')
    if (taken.size < n && words.length) {
      const was = taken.size
      for (const h of byWords(data.cards, words, taken, n - taken.size)) put(h.mark, { ...data.cards.get(h.mark), score: null, by: 'words' })
      passes.push(`words +${taken.size - was}`)
    }
  }
  const catalog = [...taken.values()]
  return {
    ok: true,
    query,
    found: [...own, ...catalog],
    skipped: data ? namedSkips(data.skip, [query, ...words].join(' ')) : [],
    passes,
    short: !!data && catalog.length < n,
    rephrased: again.length,
    want: n,
    ...(ownNote ? { ownNote } : {}),
  }
}

const USE_TEXT = { install: 'install it as it is', 'install-with-service': 'install it with an outside service', ideas: 'take its ideas, not its code' }

/** The answer for an agent: each card with what it brings, the verdict for the node, its stars and installs, its scripts and link. */
export function catalogFileText(r) {
  if (!r.ok) return `The skills catalog did not answer (${r.error}).`
  const lines = []
  const own = r.found.filter((c) => c.own)
  const catalog = r.found.filter((c) => !c.own)
  if (own.length) {
    lines.push('The person\'s OWN skills — they kept these themselves; offer them FIRST:')
    for (const c of own) {
      lines.push(`- ${c.skill} (${c.source}) — ${c.summary}`)
      lines.push(`  Kept ${String(c.keptAt ?? '').slice(0, 10)}${c.said ? ` («${c.said}»)` : ''} · ${c.value} value, ${USE_TEXT[c.use] ?? c.use}${Array.isArray(c.scripts) && c.scripts.length ? ` · ${c.scripts.length} script(s): a separate yes` : ''}`)
      lines.push(`  Into an element after their yes: npm run skills -- hand ${c.id} --to <element> --send`)
    }
  }
  if (r.ownNote) lines.push(`(${r.ownNote})`)
  if (catalog.length) {
    lines.push('The skills catalog — checked and marked by Fractera (closest first):')
    for (const c of catalog) {
      const scripts = Array.isArray(c.scripts) && c.scripts.length ? ` · ${c.scripts.length} script(s): installed only after a separate yes, name them` : ''
      lines.push(`- ${c.skill} (${c.source}) — ${c.summary}`)
      lines.push(`  For this node: ${c.value} value, ${USE_TEXT[c.use] ?? c.use}. ${c.why ?? ''}`.trimEnd())
      lines.push(`  ★ ${c.stars ?? '?'} stars · ${c.installs ?? '?'} installs · licence ${c.licence || 'unknown'}${scripts} · ${c.url ?? ''}`)
    }
    lines.push('This is the first look, not the choice: read all of them, then tell the person what the fitting ones bring, in your own words, with their stars and installs; install only after their yes: npm run skills -- hand <owner/repo@skill> --to <element> --send.')
  }
  // 640-5: fewer than seven — the agent phrases the task again (at least twice, from the method's side), and only then the open store.
  if (r.short) {
    const got = catalog.length
    lines.push(r.rephrased < 2
      ? `Only ${got} of ${r.want} — that may be the wording, not the catalog. Call skills_find again with "rephrasings": 2–3 other English sentences of the same task, from the side of the method (what the skill does: "build a voice profile from an author's posts"), and short terms that could be a skill's name ("brand voice"). Do not say «nothing in the catalog» before that.`
      : `Only ${got} of ${r.want} after ${r.rephrased} phrasings and the word search. You may say the checked catalog has no more for «${r.query}». The open skills.sh is looked at only at the person's word — ask them in one line (npm run skills -- market --live "<English words>"); what it finds is not checked by Fractera.`)
  }
  for (const s of r.skipped) lines.push(`Checked and not proposed: ${s.id} — ${s.why}`)
  return lines.join('\n')
}

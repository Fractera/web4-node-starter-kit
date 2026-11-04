// THE CATALOG AS A FILE OF VECTORS (node step 627-2): the useful cards → their pieces (a card's summary and each of its tasks) → vectors
// by the node's `embeddings` (MiniLM-L12, 384 — the same model every node runs, which is what lets the file travel ready) → `vectors.f32`,
// `rows.json`, `manifest.json`, packed for a release. No language model, no graph.
// The owner, 2026-11-02: «…чтобы он приезжал уже размеченным»; 2026-11-03: «Короткий чёрный список (Рекомендую)» — only the useful
// cards are searchable, the skip-cards travel as a short list (`skip.json`); «Файл векторов (Рекомендую)» — why a file and not a graph
// space: `lib/agent-kit/skills/catalog-index.mjs`. Runs at Fractera only: a person's node receives the file (627-3) and counts nothing.
import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { embedTexts } from '../../lib/agent-kit/skills/catalog-index.mjs'

export const NAME = 'skills-catalog'
const VALUE_ORDER = { high: 0, some: 1, none: 2 }

/** The mark of a card in the index (and once in the graph): `catalog:<owner~repo>:<skill>`. */
export const catalogMark = (c) => `catalog:${String(c.source).replace(/\//g, '~')}:${c.skill}`.slice(0, 300)
export const usefulCards = (cards) => cards.filter((c) => c.use !== 'skip' && !(Array.isArray(c.risks) && c.risks.length))
export const readCards = (file) => readFileSync(file, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l))
const sha256 = (buf) => createHash('sha256').update(buf).digest('hex')

/** A card → its pieces: [text, piece] — 0 the summary, 1… each task (one vector of a whole card lets «Instagram» outweigh the job). */
export function cardPieces(c) {
  return [[`${c.skill} — ${c.summary}`, 0], ...(c.tasks ?? []).map((t, i) => [`${c.skill}: ${t}`, i + 1])]
}

/** The skip-cards as a short list: the agent answers «checked, here is why not» without a search. */
export function writeSkipList(cards, file) {
  const skills = cards.filter((c) => !usefulCards([c]).length).map((c) => ({ id: c.id, why: String(c.why ?? '').slice(0, 220), ...(c.risks?.length ? { risks: c.risks.slice(0, 3) } : {}) }))
  writeFileSync(file, `${JSON.stringify({ about: 'Skills of the catalog checked and not proposed on a node (node step 627): the reason, the risks. The full cards stay in cards.jsonl.', count: skills.length, skills })}\n`)
  return skills.length
}

/** Count the vectors of every piece of every useful card into `<out>/` (vectors.f32, rows.json, manifest.json). */
export async function buildIndex({ nodeRoot, cardsFile, outDir, log = console.log }) {
  const cards = readCards(cardsFile)
  const useful = usefulCards(cards).sort((a, b) => (VALUE_ORDER[a.value] ?? 3) - (VALUE_ORDER[b.value] ?? 3) || (b.installs ?? 0) - (a.installs ?? 0))
  const rows = []
  const texts = []
  for (const c of useful) for (const [text, piece] of cardPieces(c)) { rows.push([catalogMark(c), piece]); texts.push(text) }
  const t0 = Date.now()
  const vectors = []
  let model = ''
  let dims = 0
  for (let i = 0; i < texts.length; i += 1024) {
    const r = await embedTexts(nodeRoot, texts.slice(i, i + 1024))
    model = r.model
    dims = r.dims
    vectors.push(...r.vectors)
    log(`  ${Math.min(i + 1024, texts.length)} of ${texts.length} pieces · ${((Date.now() - t0) / 1000).toFixed(0)} s`)
  }
  const matrix = new Float32Array(vectors.length * dims)
  vectors.forEach((v, r) => matrix.set(v, r * dims))
  rmSync(outDir, { recursive: true, force: true })
  mkdirSync(outDir, { recursive: true })
  const vec = Buffer.from(matrix.buffer)
  writeFileSync(join(outDir, 'vectors.f32'), vec)
  writeFileSync(join(outDir, 'rows.json'), JSON.stringify(rows))
  const manifest = { name: NAME, model, dims, rows: rows.length, cards: useful.length, skip: cards.length - useful.length, builtAt: new Date().toISOString(), cardsSha: sha256(readFileSync(cardsFile)), vectorsSha: sha256(vec) }
  writeFileSync(join(outDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)
  return { ...manifest, seconds: (Date.now() - t0) / 1000 }
}

/** Pack the index folder into `<out>/<name>-<date>.tar.gz`. → { file, size, sha256, manifest } */
export function packIndex({ indexDir, outDir, date = new Date().toISOString().slice(0, 10) }) {
  const manifest = JSON.parse(readFileSync(join(indexDir, 'manifest.json'), 'utf8'))
  mkdirSync(outDir, { recursive: true })
  const file = join(outDir, `${NAME}-${date}.tar.gz`)
  const tar = spawnSync('tar', ['-czf', file, '-C', indexDir, 'manifest.json', 'rows.json', 'vectors.f32'], { encoding: 'utf8' })
  if (tar.status !== 0) throw new Error(`tar: ${tar.stderr}`)
  const buf = readFileSync(file)
  return { file, size: buf.length, sha256: sha256(buf), manifest }
}

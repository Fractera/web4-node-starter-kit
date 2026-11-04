// THE NODE'S OWN SKILLS (node step 640). The owner, 2026-11-04: «когда пользователь говорит например смотри наш интересный навык может
// быть мы будем его использовать … установить в хранилище навыков внутри собственного узла и потом в дальнейшем использовать его как
// обычный навык … чтобы он был приоритете над основным числом других навыков».
// A skill the person suggested, judged by 628's `adopt` and kept on their yes (`npm run skills -- keep`): its checked folder lives in
// `data/node/skills/own/<owner>__<repo>/<skill>/` with SOURCE.md, its card in `cards.jsonl`, and its pieces in a small index of the same
// shape as the catalog's (`index/` — vectors.f32, rows.json, manifest.json; the node's `embeddings`). `findInCatalogFile` searches this
// index FIRST and puts a fitting own skill above the catalog's cards. Outside git: the person's choice is theirs, not Fractera's.
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { embedTexts, loadIndex, searchIndex } from './catalog-index.mjs'

// Measured on 2026-11-04 (640-2): see `OWN_THRESHOLD` in completed-steps/640-2.md — a kept skill is shown when it fits, never forced.
export const OWN_THRESHOLD = 0.5

export const ownDir = (root) => join(root, 'data', 'node', 'skills', 'own')
const cardsFile = (root) => join(ownDir(root), 'cards.jsonl')
export const ownIndexDir = (root) => join(ownDir(root), 'index')
export const ownMark = (id) => `own:${String(id).toLowerCase()}`

/** The kept skills' cards, the newest last. */
export function readOwn(root) {
  if (!existsSync(cardsFile(root))) return []
  return readFileSync(cardsFile(root), 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l))
}

// The same pieces as the catalog's (`cardPieces` in scripts/catalog/build.mjs): the summary and each task.
const piecesOf = (c) => [`${c.skill} — ${c.summary}`, ...(c.tasks ?? []).map((t) => `${c.skill}: ${t}`)]

/** Write the cards and count the index again (a handful of skills — the whole index each time); no cards — no index. */
export async function writeOwn(root, cards, { embed = embedTexts } = {}) {
  mkdirSync(ownDir(root), { recursive: true })
  const dir = ownIndexDir(root)
  const save = () => writeFileSync(cardsFile(root), cards.map((c) => JSON.stringify(c)).join('\n') + (cards.length ? '\n' : ''))
  if (!cards.length) { save(); rmSync(dir, { recursive: true, force: true }); cache.delete(root); return { rows: 0 } }
  const rows = cards.flatMap((c) => piecesOf(c).map((p) => [ownMark(c.id), p]))
  // Counted before anything is written: the embeddings element down — the store stays as it was.
  const { model, dims, vectors } = await embed(root, rows.map(([, p]) => p))
  save()
  const flat = new Float32Array(rows.length * dims)
  vectors.forEach((v, i) => flat.set(v, i * dims))
  const tmp = `${dir}.new-${process.pid}`
  rmSync(tmp, { recursive: true, force: true })
  mkdirSync(tmp, { recursive: true })
  writeFileSync(join(tmp, 'vectors.f32'), Buffer.from(flat.buffer))
  writeFileSync(join(tmp, 'rows.json'), JSON.stringify(rows))
  writeFileSync(join(tmp, 'manifest.json'), `${JSON.stringify({ name: 'own-skills', model, dims, rows: rows.length, cards: cards.length, builtAt: new Date().toISOString() })}\n`)
  rmSync(dir, { recursive: true, force: true })
  renameSync(tmp, dir)
  cache.delete(root)
  return { rows: rows.length, model, dims }
}

// Read again only when the index changed on the disk (a keep or a forget in another process).
const cache = new Map()
function ownIndex(root) {
  const file = join(ownIndexDir(root), 'manifest.json')
  if (!existsSync(file)) return null
  const at = statSync(file).mtimeMs
  const was = cache.get(root)
  if (was?.at === at) return was
  const index = loadIndex(ownIndexDir(root))
  const cards = new Map(readOwn(root).map((c) => [ownMark(c.id), c]))
  const out = { at, index, cards }
  cache.set(root, out)
  return out
}

/** The model the own index is counted by, or null when nothing is kept. */
export function ownModel(root) {
  try { return ownIndex(root)?.index.manifest.model ?? null } catch { return null }
}

/** The kept skills that fit a query vector — each card marked `own: true`, with its score. */
export function searchOwn(root, vector, { threshold = OWN_THRESHOLD, n = 3 } = {}) {
  let data
  try { data = ownIndex(root) } catch { return [] }
  if (!data) return []
  return searchIndex(data.index, vector, { threshold, n }).map((f) => ({ ...data.cards.get(f.mark), own: true, score: f.score })).filter((c) => c.id)
}

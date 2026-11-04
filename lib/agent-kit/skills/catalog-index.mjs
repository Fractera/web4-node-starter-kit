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

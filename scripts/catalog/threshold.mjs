// THE CATALOG'S «CLOSE ENOUGH» (node step 627-2): 30 questions against the index at several thresholds — 20 with a right card known
// in advance (a card of the first three whose summary, tasks or tags answer the question), 10 outside the catalog (nothing may come
// back). The query is counted by the node's `embeddings`, as `skills_find` will count it (627-4).
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { embedTexts, loadIndex, searchIndex } from '../../lib/agent-kit/skills/catalog-index.mjs'
import { catalogMark, readCards } from './build.mjs'

export const QUESTIONS = JSON.parse(readFileSync(join(import.meta.dirname, 'fixtures', 'threshold-30.json'), 'utf8'))

export async function measure({ nodeRoot, cardsFile, indexDir, thresholds = [0.5, 0.55, 0.6, 0.65, 0.7], log = console.log }) {
  const byMark = new Map(readCards(cardsFile).map((c) => [catalogMark(c), c]))
  const index = loadIndex(indexDir)
  const t0 = Date.now()
  const { vectors } = await embedTexts(nodeRoot, QUESTIONS.map((q) => q.q))
  const t1 = Date.now()
  const rows = []
  for (const t of thresholds) {
    let inside = 0
    let leaks = 0
    const misses = []
    QUESTIONS.forEach((q, i) => {
      const found = searchIndex(index, vectors[i], { threshold: t })
      const names = found.map((f) => `${byMark.get(f.mark)?.id ?? f.mark} ${f.score.toFixed(2)}`).join(', ')
      if (q.right) {
        const rx = new RegExp(q.right, 'i')
        if (found.some((f) => { const c = byMark.get(f.mark); return c && rx.test(`${c.summary} ${(c.tasks ?? []).join(' ')} ${(c.tags ?? []).join(' ')}`) })) inside += 1
        else misses.push(`${q.q} → ${names || 'nothing'}`)
      } else if (found.length) { leaks += 1; misses.push(`outside: ${q.q} → ${names}`) }
    })
    const inN = QUESTIONS.filter((q) => q.right).length
    rows.push({ threshold: t, inside, of: inN, leaks, outside: QUESTIONS.length - inN, misses })
    log(`  ${t.toFixed(2)}: inside ${inside} of ${inN} · outside leaks ${leaks} of ${QUESTIONS.length - inN}`)
  }
  const s0 = Date.now()
  for (let k = 0; k < 30; k++) searchIndex(index, vectors[k % vectors.length])
  log(`  time: 30 questions counted in ${t1 - t0} ms, one search over ${index.rows.length} rows ${((Date.now() - s0) / 30).toFixed(1)} ms`)
  return rows
}

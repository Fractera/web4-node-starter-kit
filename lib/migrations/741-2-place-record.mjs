// 741-2 — a node installed before 741 records where it lives: from the launch's mark or the measurement, never over a version-2 record.
// Moved here from two hand-placed calls (`serve.mjs` start and, after the miss of 2026-11-14, rebuild) — step 743-3.
import { migratePlaceRecord } from '../hosting/place.mjs'

export const id = '741-2-place-record'
export const why = 'a node installed before 741 gets its place record (data/node/place.json v2) — the 276-3 declaration is replaced'
export const wraps = ['migratePlaceRecord']

export function run(root) {
  const rec = migratePlaceRecord(root)
  return { done: true, note: rec ? `recorded ${rec.place} (${rec.by})` : 'a version-2 record already stands — kept' }
}

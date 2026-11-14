// ONE DOOR FOR TRANSITIONS BETWEEN VERSIONS — THE MIGRATION LEDGER (node step 743-3).
// ✗ Measured 2026-11-14: the place migration of 741-2 hung on `serve.mjs start`; `node:update` runs `rebuild`, so after this Mac's update
// the old declaration still stood until the migration was run by hand — and the fix was a SECOND copy on `rebuild` (8f165354). Every
// next transition would have repeated it. Homebrew does the same job in one place: its `update-report` runs the migrations of the new code.
// 🔒 A one-time change of the node's own data on the way from one version to the next is a file in `lib/migrations/` (its contract —
// that folder's README). This runner applies the ones not yet in the ledger `data/node/migrations.json` (outside git: it survives every
// update), in name order, and every entry point that brings code to life calls it: the installation (computer and server), `serve.mjs
// start` and `rebuild`, and the update after its merge. A migration that fails is recorded and tried again next time; it never stops a
// start. The guard `check:migrations` refuses a migration's function called anywhere else.
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { basename, dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

export const MIGRATIONS_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'migrations')
export const ledgerFile = (root) => join(root, 'data', 'node', 'migrations.json')

/** The migration files in name order: `<step>-<slug>.mjs`. */
export function migrationFiles(dir = MIGRATIONS_DIR) {
  if (!existsSync(dir)) return []
  return readdirSync(dir).filter((f) => /^\d[\w.-]*\.mjs$/.test(f)).sort((a, b) => a.localeCompare(b, 'en', { numeric: true }))
}

/** The ledger: `{ v: 1, applied: [{ id, at, by, version, result: "done"|"failed", note }] }`; a broken file is moved aside, never trusted. */
export function readLedger(root) {
  const file = ledgerFile(root)
  if (!existsSync(file)) return { v: 1, applied: [] }
  try {
    const j = JSON.parse(readFileSync(file, 'utf8'))
    if (j && Array.isArray(j.applied)) return j
  } catch { /* moved aside below */ }
  renameSync(file, `${file}.broken-${new Date().toISOString().replace(/[:.]/g, '-')}`)
  return { v: 1, applied: [] }
}

function writeLedger(root, ledger) {
  const file = ledgerFile(root)
  mkdirSync(dirname(file), { recursive: true })
  const tmp = `${file}.${process.pid}.tmp`
  writeFileSync(tmp, JSON.stringify(ledger, null, 2) + '\n')
  renameSync(tmp, file)
}

/**
 * Applies every migration not yet done on `root`. `by` names the entry point (install · start · rebuild · update · manual). Returns
 * `{ applied: [...ids], failed: [...ids], skipped: n }`; prints one line per migration it ran. Never throws for a migration's failure.
 */
export async function runMigrations(root, by, { dir = MIGRATIONS_DIR, log = console.log } = {}) {
  const ledger = readLedger(root)
  const done = new Set(ledger.applied.filter((a) => a.result === 'done').map((a) => a.id))
  const head = spawnSync('git', ['-C', root, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8', windowsHide: true }).stdout?.trim() || null
  const out = { applied: [], failed: [], skipped: 0 }
  for (const file of migrationFiles(dir)) {
    const id = basename(file, '.mjs')
    if (done.has(id)) { out.skipped += 1; continue }
    let result = 'failed'
    let note = ''
    try {
      const m = await import(pathToFileURL(join(dir, file)).href)
      if (m.id !== id || typeof m.run !== 'function') throw new Error(`the contract is broken: id «${m.id}», run ${typeof m.run}`)
      const r = await m.run(root)
      result = r?.done ? 'done' : 'failed'
      note = String((r?.done ? r.note : r?.reason) ?? '').slice(0, 300)
    } catch (e) {
      note = String(e?.message ?? e).slice(0, 300)
    }
    ledger.applied = ledger.applied.filter((a) => !(a.id === id && a.result === 'failed'))
    ledger.applied.push({ id, at: new Date().toISOString(), by, version: head, result, note })
    writeLedger(root, ledger)
    out[result === 'done' ? 'applied' : 'failed'].push(id)
    log(`migration ${id}: ${result}${note ? ` — ${note}` : ''}`)
  }
  return out
}

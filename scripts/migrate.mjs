// `npm run migrate` / `node scripts/migrate.mjs --by <install|start|rebuild|update|manual> [--root <node folder>]` — applies the
// migrations not yet in the node's ledger (step 743-3, `lib/deploy/migrations.mjs`). One line per migration it ran, then a marked line.
// Exit 0 even when a migration failed (it is recorded and tried again); 1 only when the runner itself could not run.
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { runMigrations } from '../lib/deploy/migrations.mjs'

const args = process.argv.slice(2)
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined }
const root = path.resolve(opt('--root') ?? path.join(path.dirname(fileURLToPath(import.meta.url)), '..'))
const by = opt('--by') ?? 'manual'

try {
  const r = await runMigrations(root, by)
  console.log(`===MIGRATE_OK=== applied ${r.applied.length}, failed ${r.failed.length}${r.failed.length ? ` (${r.failed.join(', ')})` : ''}, already done ${r.skipped}`)
} catch (e) {
  console.error(`===MIGRATE_FAILED=== ${e?.message ?? e}`)
  process.exit(1)
}

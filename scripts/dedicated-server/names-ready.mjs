// ARE THE NODE'S NAMES READY ON THIS SERVER (node step 737-15) — run on the server as the node's user by the move runner, at the
// rehearsal and again right before the move. Public DNS is asked for every name (`lib/hosting/dns-check.mjs`); a name that already points
// here and has no usable certificate gets one (`certs.mjs`, the root helper, Let's Encrypt over the ACME path nginx keeps open in every
// state). Prints ONE JSON line: { zone, names, pointing, certified, waiting, elsewhere, unknown }.
// The owner, 2026-11-13: the records are switched right after «Подключение» so DNS has woken by the move — and «отработать сценарий при
// котором он ещё не проснулся тоже надо чтобы не получилось так что после переезда у нас чёрный экран»: `waiting` is that list, and the
// move refuses while it is not empty.
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { domainState, readiness, runDnsCheck } from '../../lib/hosting/server-domain.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '..', '..')
const dry = process.argv.includes('--dry')

const empty = { zone: null, names: 0, pointing: [], certified: [], waiting: [], elsewhere: [], unknown: [] }
let state = domainState(root, dry ? { certs: [] } : {})
if (!state.zone) { console.log(JSON.stringify(empty)); process.exit(0) }
if (!dry) await runDnsCheck(root)
state = domainState(root, dry ? { certs: [] } : {})
if (!dry && state.rows.some((r) => r.dns === 'ok' && (r.cert === 'missing' || r.cert === 'expiring'))) {
  spawnSync(process.execPath, [path.join(here, 'certs.mjs')], { cwd: root, stdio: 'ignore', timeout: 40 * 60_000 })
  state = domainState(root)
}
console.log(JSON.stringify(readiness(state)))

// A NEW NAME ON A SERVER NODE (node step 737-16) — run detached on the server by the element-address door when the node's domain is held
// by nginx (`logs/domain.json` via "server"). nginx learns the name at once (503 «being connected» until its certificate, the ACME path
// open), then public DNS is asked and the certificate issued when the name points here (`names-ready.mjs` → `certs.mjs`, which applies
// nginx again). The owner, 2026-11-13: «при создании каждого нового элемента придётся вновь создавать новые записи» — with the `*`
// record or the node's Cloudflare token nothing is left for the person; otherwise the door names the one A record to add.
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '..', '..')
const w = spawnSync(process.execPath, [path.join(here, '..', 'server.mjs'), 'nginx', '--write', '--root', root], { cwd: root, encoding: 'utf8', timeout: 60_000 })
if (w.status === 0) spawnSync('sudo', ['-n', '/usr/local/sbin/fractera-root', 'nginx-apply'], { encoding: 'utf8', timeout: 60_000 })
const r = spawnSync(process.execPath, [path.join(here, 'names-ready.mjs')], { cwd: root, encoding: 'utf8', timeout: 45 * 60_000 })
console.log(`===NAME_UP=== ${String(r.stdout ?? '').trim().split('\n').pop() ?? ''}`)

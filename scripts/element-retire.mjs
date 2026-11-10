// npm run element:retire -- <id> [<id> …]
//
// RETIRE A NATIVE ELEMENT FRACTERA NO LONGER SHIPS (node step 716). The owner, 2026-11-10, verbatim: «нигде не было упоминаний о том что
// существуют блоки и дизайн как нативные элементы их не должно существовать как нативные элементы и не должно быть обращение к ним.
// Поэтому сначала убери их». A native element (`kind: core`) belongs to Fractera: when the fork's registry drops it, the node update leaves
// it out of the node's registry (`mergeRegistry`, `scripts/node-update.mjs`) and calls this script for it after the guards — past the last
// rollback, so a retired folder never meets a restored registry.
//
// The order is the deletion door's (`lib/web4-items/element-delete.ts`, for born elements inside the core's server): from the living to
// the dead — the process and its watcher, the page copy in Cloudflare, the element's data, its process logs, its folder. The folder and the
// data are MOVED into `WEB4-ITEMS/.trash/` (outside git; the next deletion of an element erases the trash whole), never erased here: the
// code is on GitHub, the moved data is still on the disk until then.
// 🔒 Only an id the registry no longer lists: a listed element is the node's living element, and this script refuses it.
// 🔒 An own domain: the subdomain's tunnel route and DNS record are NOT removed here (the Cloudflare door lives in the core's server) —
//   the script names them, and the address then answers with Cloudflare's error page until the person removes them.
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join, resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const require = createRequire(import.meta.url)
const paths = require('../lib/web4-items/paths.cjs')
const IS_WIN = process.platform === 'win32'
const TRASH = join(paths.ITEMS_DIR, '.trash')
const ID = /^[a-z][a-z0-9-]{1,23}$/

const ids = process.argv.slice(2).filter((a) => !a.startsWith('--'))
if (!ids.length || ids.some((id) => !ID.test(id))) {
  console.error('===ELEMENT_RETIRE_REFUSED=== npm run element:retire -- <id> [<id> …] — ids of native elements the registry no longer lists')
  process.exit(1)
}
let listed = []
try { listed = JSON.parse(readFileSync(paths.REGISTRY_FILE, 'utf8')).services.map((s) => s.id) } catch { /* no registry — nothing is listed */ }
const living = ids.filter((id) => listed.includes(id))
if (living.length) {
  console.error(`===ELEMENT_RETIRE_REFUSED=== still in the registry: ${living.join(', ')} — a living element is turned off (npm run power), never retired`)
  process.exit(1)
}

function pm2(args) {
  try {
    execFileSync(IS_WIN ? 'pm2.cmd' : 'pm2', args, { cwd: ROOT, shell: IS_WIN, windowsHide: true, stdio: 'ignore', timeout: 30_000 })
    return true
  } catch { return false }
}

function moveToTrash(from, name) {
  if (!existsSync(from)) return 'absent'
  mkdirSync(TRASH, { recursive: true })
  const to = join(TRASH, `${name}-${Date.now()}`)
  for (let i = 0; i < 10; i++) {
    try { renameSync(from, to); return to.slice(ROOT.length + 1) } catch { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 500) }
  }
  return null
}

let domain = null
try { domain = JSON.parse(readFileSync(join(ROOT, 'logs', 'domain.json'), 'utf8')) } catch { /* the node runs on its temporary address */ }

let failed = 0
for (const id of ids) {
  const line = []
  // 1. The process and its watcher.
  const a = pm2(['delete', `fractera-svc-${id}`])
  const b = pm2(['delete', `fractera-svc-${id}-watch`])
  line.push(`processes: ${a || b ? 'deleted' : 'none'}`)
  // 2. The page copy in Cloudflare Workers — the same call the deletion door makes; its state goes by file, the data moves next.
  try {
    const copy = join(ROOT, 'data', 'services', id, 'static-copy.json')
    if (existsSync(copy) && JSON.parse(readFileSync(copy, 'utf8')).ok) {
      const keep = join(ROOT, 'logs', `static-copy-removal-${id}.json`)
      writeFileSync(keep, readFileSync(copy))
      require('../lib/web4-items/static-copy-start.cjs').startStaticCopy(ROOT, id, ['--remove', `--state=${keep}`])
      line.push('page copy: removal started')
    }
  } catch { line.push('page copy: none') }
  // 3. The element's data on the node (keys, sessions, links, bot) and 4. its process logs.
  const data = moveToTrash(join(ROOT, 'data', 'services', id), `${id}-data`)
  line.push(`data: ${data ?? 'BUSY'}`)
  for (const f of [`svc-${id}-out.log`, `svc-${id}-err.log`, `svc-${id}-watch.log`]) {
    try { rmSync(join(ROOT, 'logs', f), { force: true }) } catch { /* held — stays a log line */ }
  }
  // 5. The folder with its code.
  const folder = moveToTrash(paths.itemDir(id, 'core'), id)
  line.push(`folder: ${folder ?? 'BUSY'}`)
  if (data === null || folder === null) failed += 1
  if (domain?.zone) line.push(`own domain: remove ${id}.${domain.zone} from the tunnel and DNS in Cloudflare by hand`)
  console.log(`  ${id} — ${line.join('; ')}`)
}
pm2(['save'])
if (failed) {
  console.error(`===ELEMENT_RETIRE_FAILED=== ${failed} of ${ids.length}: a folder was busy — run it again: npm run element:retire -- ${ids.join(' ')}`)
  process.exit(1)
}
console.log(`===ELEMENT_RETIRE_OK=== ${ids.join(', ')}: no process, no folder, out of the registry`)

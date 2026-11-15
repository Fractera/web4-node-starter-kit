// REMOVE THE WHOLE FRACTERA PROJECT FROM THIS COMPUTER (node step 746-1). The owner, 2026-11-15: «полное удаление … только с локальной
// машины всего проекта … Конечно же с подтверждением что пользователь понимает о всей ответственности и этих данных которые потеряет
// безвозвратно»; with the archive offered first («Да, с архивом, начинай 746»).
//
//   node scripts/node-remove.mjs                       → the preview, JSON: what goes, what stays; nothing changes
//   node scripts/node-remove.mjs --yes --confirm <the folder's name>   → starts the removal and returns at once
//
// 🔒 ONLY THIS COMPUTER. The folder of the node and the Claude Code session journals of this folder and its elements
// (`~/.claude/projects/<the folder as Claude Code names it>[-WEB4-ITEMS-…]`). Never the fork on GitHub, a launched server, the tunnel and
// DNS in the Cloudflare account, the subscription, or the shared programs `cloudflared` and pm2 (other programs of the person may use them).
// 🔒 ONLY A PERSON'S COMPUTER (`placeKind === "home"`): a server has its own way out (`scripts/dedicated-server/clear.sh`) and is never
// emptied by a button of its own panel.
// 🔒 THE NAME, LETTER FOR LETTER. The folder's own name, so a removal is never started by a habit of clicking «yes».
// 🛑 A JOURNAL IS MATCHED EXACTLY, never by a prefix alone: `…-web4-node-starter-kit-2` (a second folder beside this one) starts with this
// folder's journal name too. Only the name itself and the name + `-WEB4-ITEMS-` (this node's elements) are this node's.
// 🔒 THE REMOVAL IS A COPY OUTSIDE THE FOLDER, STARTED OUTSIDE THE CORE (`scripts/node-remove-stage.mjs` → the temp folder →
// `spawn-free`): the core's door that calls this script dies with the node's processes the stage removes first.
// `--root <dir>` and `FRACTERA_REMOVE_HOME` exist for the test on a scratch folder (`scripts/node-remove.test.mjs`).
import { spawnSync } from 'node:child_process'
import { copyFileSync, existsSync, readdirSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { placeKind } from '../lib/hosting/place.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const argv = process.argv.slice(2)
const flag = (name) => { const i = argv.indexOf(name); return i >= 0 ? argv[i + 1] ?? '' : null }
const root = path.resolve(flag('--root') ?? path.join(here, '..'))
const home = process.env.FRACTERA_REMOVE_HOME || os.homedir()
const isWindows = process.platform === 'win32'

/** How Claude Code names a folder's journal directory: every character that is not a Latin letter or a digit becomes «-». */
export const journalName = (dir) => dir.replace(/[^a-zA-Z0-9]/g, '-')

export function journals(nodeRoot = root, homeDir = home) {
  // Claude Code keeps its journals in CLAUDE_CONFIG_DIR when the person set one, else in ~/.claude (the test passes its own home).
  const config = !process.env.FRACTERA_REMOVE_HOME && process.env.CLAUDE_CONFIG_DIR ? process.env.CLAUDE_CONFIG_DIR : path.join(homeDir, '.claude')
  const base = path.join(config, 'projects')
  const own = journalName(nodeRoot)
  let names = []
  try { names = readdirSync(base) } catch { return [] }
  return names.filter((n) => n === own || n.startsWith(`${own}-WEB4-ITEMS-`)).map((n) => path.join(base, n))
}

function git(dir, args) {
  const r = spawnSync('git', ['-C', dir, ...args], { encoding: 'utf8', windowsHide: true, timeout: 10_000 })
  return { rc: r.status ?? 1, out: (r.stdout ?? '').trim() }
}

/** The custom elements (born and preinstalled: root's agent works too) and their work that is nowhere else: commits, and how many are not on GitHub (`null` — never exported). The same
 * count as `deletionRisk` of `lib/web4-items/element-delete.ts` (a TS door module; this script is bare node) — a second copy, named. */
function elements() {
  let services = []
  try { services = JSON.parse(readFileSync(path.join(root, 'WEB4-ITEMS-REGISTRY', 'web4-items.json'), 'utf8')).services ?? [] } catch { return [] }
  const require = createRequire(import.meta.url)
  const cwd = process.cwd()
  process.chdir(root) // paths.cjs and name-file.cjs take the node's root from the working folder
  try {
    const paths = require('../lib/web4-items/paths.cjs')
    const { displayName } = require('../lib/web4-items/name-file.cjs')
    return services.filter((s) => s.kind === 'user').map((s) => {
      const dir = paths.itemDir(s.id, 'user')
      const commits = Number(git(dir, ['rev-list', '--count', 'HEAD']).out) || 0
      let last = null
      try { last = JSON.parse(readFileSync(path.join(root, 'data', 'services', s.id, 'github', 'state.json'), 'utf8')).lastCommit ?? null } catch { /* never exported */ }
      // No export record: the commits on no remote branch and under no tag (root came from its template's tag; its agent's work is local).
      const remote = !last && git(dir, ['remote']).out !== ''
      const ahead = last ? git(dir, ['rev-list', '--count', `${last}..HEAD`]) : remote ? git(dir, ['rev-list', '--count', 'HEAD', '--not', '--remotes', '--tags']) : null
      const unpushed = ahead ? (ahead.rc === 0 ? Number(ahead.out) || 0 : commits) : null
      return { id: s.id, name: displayName(s.id, { root, address: s.address ?? s.id }), commits, unpushed }
    })
  } catch { return [] } finally { process.chdir(cwd) }
}

function processes() {
  const r = spawnSync(isWindows ? 'pm2.cmd' : 'pm2', ['jlist'], { encoding: 'utf8', shell: isWindows, windowsHide: true, timeout: 20_000 })
  let apps = []
  try { apps = JSON.parse(r.stdout) } catch { return [] }
  const inside = (dir) => { const rel = typeof dir === 'string' && dir ? path.relative(root, dir) : '..'; return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel)) }
  return apps.filter((a) => /^fractera-(web4|svc-)/.test(a.name) && inside(a.pm2_env?.pm_cwd ?? a.pm2_env?.cwd)).map((a) => a.name)
}

export function preview() {
  const place = placeKind(root)
  return {
    ok: place === 'home',
    refused: place === 'home' ? null : 'server',
    folder: root,
    name: path.basename(root),
    place,
    processes: processes(),
    elements: elements(),
    journals: journals(),
    reportDir: home,
  }
}

function start() {
  const place = placeKind(root)
  if (place !== 'home') return { ok: false, status: 403, error: 'server' }
  if (!existsSync(path.join(root, 'package.json'))) return { ok: false, status: 400, error: 'not-a-node' }
  if ((flag('--confirm') ?? '').trim() !== path.basename(root)) return { ok: false, status: 409, error: 'name' }
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const copy = path.join(os.tmpdir(), `fractera-node-remove-${stamp}.mjs`)
  copyFileSync(path.join(here, 'node-remove-stage.mjs'), copy)
  const report = path.join(home, `Fractera-removed-${stamp.slice(0, 23)}.txt`)
  const args = [path.join(here, 'spawn-free.mjs'), copy, '--stage', root, '--report', report, ...journals().flatMap((j) => ['--journals', j])]
  // cwd outside the folder: Windows refuses to delete a folder that is some process's working folder.
  const r = spawnSync(process.execPath, args, { cwd: os.tmpdir(), windowsHide: true, timeout: 20_000 })
  if (r.status !== 0) return { ok: false, status: 500, error: 'start' }
  return { ok: true, status: 202, report }
}

if (path.resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) {
  const result = argv.includes('--yes') ? start() : preview()
  console.log(JSON.stringify(result, null, 2))
  if (argv.includes('--yes') && !result.ok) process.exit(1)
}

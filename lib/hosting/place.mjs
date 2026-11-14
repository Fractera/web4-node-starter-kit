// WHERE THE NODE LIVES — RECORDED BY ITS INSTALLATION, CHECKED BY A MEASUREMENT (node steps 737-18, 741-2). The owner, 2026-11-13:
// «очень важно теперь найти способ нативно отслеживать является ли данное состояние локальным или это выделенный сервер»; 2026-11-14:
// «ты уже решил каким именно образом гарантировано архитектура определяет живёт она на локальной машине или на удалённом сервере?»;
// 741 approved the same day («да, утверждаю 741 и D31–D37 -> go»).
// 🔒 THREE SOURCES, IN THIS ORDER:
//   1. the record `data/node/place.json` version 2 (D37), written by the act that installed the node — `npm run launch` on a person's
//      computer («home»), `scripts/dedicated-server/install.sh` on a server («server») — or, for a node installed before 741, by its first
//      start (`by: "migration"`, from what it knew then). It carries a hash of the machine's id: a record copied with the folder to
//      another machine is «foreign» and is not obeyed;
//   2. for a server launched before 741 and not started since — the launch's mark `data/node/server.json` (phase live or silent);
//   3. a measurement: macOS and Windows are a person's computer; Linux holding a public IPv4 on its own network interface is a server,
//      behind a private address a computer.
// The measurement also CHECKS the record: a disagreement is returned as `mismatch` and said by the indicator, never silently obeyed.
// ✗ What this replaces (276-3): a declaration the person clicked — `{ "place": "server" }` without `"v": 2`. The owner declared «server»
// on his Mac at 10:15 on 2026-11-13; such a file is treated as absent and replaced by the migration.
// Limits named aloud: a cloud machine behind its provider's NAT measures «computer» (its record says «server» — the mismatch line
// explains it); a Linux desktop with a public address measures «server» (its record says «home», D35).
// Bare `node` reads it (CommonJS-free `.mjs`, no `@/` imports): the core's pages and doors, the proxy (741-3), `serve.mjs`, the launch.
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, renameSync, statSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import { join } from 'node:path'

const KINDS = new Set(['home', 'server'])
const BY = new Set(['launch', 'dedicated-server', 'migration'])

/** Private, shared, loopback and link-local IPv4 ranges — an address in them is not reachable from the internet by itself. */
export function isPublicIpv4(ip) {
  const p = String(ip).split('.').map(Number)
  if (p.length !== 4 || p.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return false
  const [a, b] = p
  if (a === 10 || a === 127 || a === 0 || a >= 224) return false
  if (a === 172 && b >= 16 && b <= 31) return false
  if (a === 192 && b === 168) return false
  if (a === 100 && b >= 64 && b <= 127) return false // carrier-grade NAT
  if (a === 169 && b === 254) return false
  if (a === 192 && b === 0 && p[2] === 2) return false // documentation
  if (a === 198 && (b === 18 || b === 19)) return false // benchmarking
  return true
}

/** The public IPv4 this machine holds on its own interfaces, or `null`. */
export function publicIpOnInterfaces(interfaces = os.networkInterfaces()) {
  for (const list of Object.values(interfaces ?? {})) {
    for (const a of list ?? []) {
      const v4 = a && (a.family === 'IPv4' || a.family === 4)
      if (v4 && !a.internal && isPublicIpv4(a.address)) return a.address
    }
  }
  return null
}

/** What this machine looks like — the check, never the answer when a record exists. */
export function measurePlace(probe = {}) {
  const platform = probe.platform ?? process.platform
  if (platform === 'darwin') return { kind: 'home', detail: 'macos' }
  if (platform === 'win32') return { kind: 'home', detail: 'windows' }
  const ip = publicIpOnInterfaces(probe.interfaces)
  return ip ? { kind: 'server', detail: `public-ip ${ip}` } : { kind: 'home', detail: 'private-address' }
}

let machineCache
/**
 * A short hash of this machine's own id — never the id itself (it is a stable identifier of the person's computer). `null` when the id
 * cannot be read: the check is then skipped, never guessed.
 */
export function machineHash(platform = process.platform) {
  if (machineCache !== undefined && platform === process.platform) return machineCache
  let raw = null
  try {
    if (platform === 'linux') raw = readFileSync('/etc/machine-id', 'utf8').trim() || null
    else if (platform === 'darwin') {
      const r = spawnSync('ioreg', ['-rd1', '-c', 'IOPlatformExpertDevice'], { encoding: 'utf8', timeout: 5000 })
      raw = String(r.stdout ?? '').match(/"IOPlatformUUID" = "([^"]+)"/)?.[1] ?? null
    } else if (platform === 'win32') {
      const r = spawnSync('reg', ['query', 'HKLM\\SOFTWARE\\Microsoft\\Cryptography', '/v', 'MachineGuid'], { encoding: 'utf8', timeout: 5000, windowsHide: true })
      raw = String(r.stdout ?? '').match(/MachineGuid\s+REG_SZ\s+(\S+)/)?.[1] ?? null
    }
  } catch { raw = null }
  const hash = raw ? createHash('sha256').update(`fractera-place:${raw}`).digest('hex').slice(0, 16) : null
  if (platform === process.platform) machineCache = hash
  return hash
}

const recordPath = (root) => join(root, 'data', 'node', 'place.json')
const recordCache = new Map()

/** The version-2 record, or `null` (absent, damaged, or the retired declaration of 276-3). Cached by the file's mtime. */
export function readPlaceRecord(root) {
  const file = recordPath(root)
  let mtime
  try { mtime = statSync(file).mtimeMs } catch { recordCache.delete(file); return null }
  const hit = recordCache.get(file)
  if (hit && hit.mtime === mtime) return hit.record
  let record = null
  try {
    const r = JSON.parse(readFileSync(file, 'utf8'))
    if (r && r.v === 2 && KINDS.has(r.place) && BY.has(r.by)) {
      record = { place: r.place, by: r.by, at: typeof r.at === 'string' ? r.at : null, machine: typeof r.machine === 'string' ? r.machine : null }
    }
  } catch { record = null }
  recordCache.set(file, { mtime, record })
  return record
}

/** The launch's mark of a server installed before 741 (`data/node/server.json`), or `null`. */
function serverMark(root) {
  try {
    const m = JSON.parse(readFileSync(join(root, 'data', 'node', 'server.json'), 'utf8'))
    if (m.phase === 'live' || m.phase === 'silent') {
      const at = typeof m.movedAt === 'string' ? m.movedAt : typeof m.at === 'string' ? m.at : null
      return { at, detail: m.independent ? 'new-server' : 'moved' }
    }
  } catch { /* not a server mark */ }
  return null
}

/**
 * Where the node lives.
 * @param {string} root the node's folder
 * @param {{ platform?: string, interfaces?: object, machine?: string | null }} [probe] — the tests' machine
 * @returns {{ kind: 'home' | 'server', source: 'installed' | 'migrated' | 'moved' | 'measured', changedAt: string | null, detail: string,
 *   mismatch?: string, foreign?: true }}
 */
export function nodePlace(root, probe = {}) {
  const measured = measurePlace(probe)
  const record = readPlaceRecord(root)
  if (record) {
    const here = 'machine' in probe ? probe.machine : machineHash(probe.platform ?? process.platform)
    if (record.machine && here && record.machine !== here) {
      return { kind: measured.kind, source: 'measured', changedAt: null, detail: measured.detail, foreign: true }
    }
    const detail = record.by === 'dedicated-server' ? 'new-server' : record.by
    return {
      kind: record.place, source: record.by === 'migration' ? 'migrated' : 'installed', changedAt: record.at, detail,
      ...(record.place !== measured.kind ? { mismatch: measured.detail } : {}),
    }
  }
  const mark = serverMark(root)
  if (mark) return { kind: 'server', source: 'moved', changedAt: mark.at, detail: mark.detail }
  return { kind: measured.kind, source: 'measured', changedAt: null, detail: measured.detail }
}

/** Write the record atomically (tmp + rename). Only the installation and the migration call it. */
export function writePlaceRecord(root, place, by, probe = {}) {
  if (!KINDS.has(place) || !BY.has(by)) throw new Error(`bad place record ${place}/${by}`)
  const dir = join(root, 'data', 'node')
  mkdirSync(dir, { recursive: true })
  const machine = 'machine' in probe ? probe.machine : machineHash(probe.platform ?? process.platform)
  const body = { v: 2, place, by, at: new Date().toISOString(), machine }
  const tmp = join(dir, `place.json.${process.pid}.tmp`)
  writeFileSync(tmp, `${JSON.stringify(body, null, 2)}\n`)
  renameSync(tmp, recordPath(root))
  recordCache.delete(recordPath(root))
  return body
}

/**
 * A node installed before 741 gets its record on its next start, from what it knows: the launch's mark → «server», else the
 * measurement. A version-2 record is never overwritten. Returns the written record or `null`.
 */
export function migratePlaceRecord(root, probe = {}) {
  if (readPlaceRecord(root)) return null
  const place = serverMark(root) ? 'server' : measurePlace(probe).kind
  return writePlaceRecord(root, place, 'migration', probe)
}

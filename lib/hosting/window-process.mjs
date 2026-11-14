// THE SSH WINDOW OPENED FROM THE PAGE (node step 744-3, D45: «opened from the page through the door (cookie), not from the CLI with a
// stored key»). The launch door starts `scripts/server.mjs window --key-stdin` detached, with this browser's visit key on its stdin and the
// visit's deadline as its end: the window gives the server's own panel at http://localhost:<25680–25689> while the access lasts.
// 🔒 What lies on disk here is no secret: `logs/windows/<host>-<port>.log` holds the window's marked lines (its local address, its end),
// `.pid` its process id — for «is it alive», never for killing: the page closes a window by its signal file `.close`, which the window
// itself watches (a process id may belong to someone else by the time it is read again).
import { spawn } from 'node:child_process'
import { closeSync, existsSync, mkdirSync, openSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const dir = (root) => join(root, 'logs', 'windows')
const base = (root, host, port) => join(dir(root), `${String(host).replace(/[^a-z0-9.-]/gi, '')}-${Number(port)}`)
const alive = (pid) => { try { process.kill(pid, 0); return true } catch (e) { return e?.code === 'EPERM' } }

/** The local address of this server's open window, or `null` (none, closed, or its process gone). */
export function windowUrl({ root, host, port }) {
  const b = base(root, host, port)
  try {
    const text = readFileSync(`${b}.log`, 'utf8')
    if (/===WINDOW_(CLOSED|FAILED)===/.test(text)) return null
    const m = /===WINDOW=== (http:\/\/localhost:\d+\/[a-z]{2})/.exec(text)
    const pid = Number(readFileSync(`${b}.pid`, 'utf8'))
    return m && pid > 0 && alive(pid) ? m[1] : null
  } catch { return null }
}

/**
 * Open the window (or answer the one already open). Resolves `{ ok: true, url }` or `{ ok: false, reason }` — the CLI's own reason
 * (`need-password`, `auth`, `no-pin`, `no-core-port` …) or `timeout`.
 * @param {{ root: string, host: string, port: number, key: string, until: number, env?: NodeJS.ProcessEnv, waitMs?: number }} o
 */
export async function openWindowProcess({ root, host, port, key, until, env = process.env, waitMs = 30_000 }) {
  const known = windowUrl({ root, host, port })
  if (known) return { ok: true, url: known }
  mkdirSync(dir(root), { recursive: true })
  const b = base(root, host, port)
  rmSync(`${b}.close`, { force: true })
  const out = openSync(`${b}.log`, 'w')
  const child = spawn(process.execPath, [join(root, 'scripts', 'server.mjs'), 'window', '--ip', host, '--key-stdin', '--until', String(until), '--close-file', `${b}.close`],
    { cwd: root, env, detached: true, stdio: ['pipe', out, out], windowsHide: true })
  child.stdin.end(key)
  child.unref()
  closeSync(out)
  writeFileSync(`${b}.pid`, String(child.pid ?? ''))
  for (let waited = 0; waited < waitMs; waited += 250) {
    await new Promise((r) => setTimeout(r, 250))
    const text = existsSync(`${b}.log`) ? readFileSync(`${b}.log`, 'utf8') : ''
    const failed = /===WINDOW_FAILED=== (\S+)/.exec(text)
    if (failed) return { ok: false, reason: failed[1] }
    const url = windowUrl({ root, host, port })
    if (url) return { ok: true, url }
  }
  writeFileSync(`${b}.close`, 'timeout\n')
  return { ok: false, reason: 'timeout' }
}

/** Ask this server's window to close (it watches the signal file); nothing open — nothing done. */
export function closeWindowProcess({ root, host, port }) {
  const b = base(root, host, port)
  if (existsSync(`${b}.log`)) writeFileSync(`${b}.close`, 'closed from the page\n')
}

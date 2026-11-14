// THE SSH WINDOW TO A SERVER NODE (node step 741-5; the owner approved 2026-11-14: «да, утверждаю 741 и D31–D37 -> go», D35 → the
// window comes back). `npm run server -- window --ip <IPv4>` gives the owner the server's own panel at `http://localhost:<port>` on THIS
// computer — before the server's domain exists, and whenever its sign-in is not wanted.
// 🔒 WHY IT IS THE OWNER AND NOBODY ELSE: the connection is a VISIT key the caller holds (744-3: the person's root password opened it,
// the server drops it at its own deadline) to a pinned server (`lib/hosting/ssh.mjs` — a changed server key is refused), and the forwarded request arrives on the server's loopback without passing nginx, so it carries no edge mark
// (`lib/hosting/edge.mjs`): the server's core reads it as the owner at its keyboard. The same «localhost» sent from the internet to the
// server's IP is dropped by nginx (444) — measured 2026-11-14.
// 🪦 738 removed the verb with the move; three texts kept naming it (`edge.mjs`, the server domain door and its words) — they are true again.
// 🔒 The local port: the first free one of 25680–25689 — outside the node's own range 24680–25679, never 3000, below 49152 (CLAUDE.md
// §2), bound to 127.0.0.1 only. The window asks no password itself: without a pin, without a key or with the key refused it says why.
import net from 'node:net'
import { connect, exec, readPins } from './ssh.mjs'

export const WINDOW_FIRST = 25680
export const WINDOW_LAST = 25689

/** A local port the window may take: not the node's range, not 3000, not the dynamic range. */
export function windowPortAllowed(p) {
  return Number.isInteger(p) && p >= 1024 && p < 49152 && p !== 3000 && !(p >= 24680 && p <= 25679)
}

/** The pin of a server by its IP — the newest, when several ports were pinned. */
export function pinFor(root, ip) {
  const pins = Object.values(readPins(root)).filter((p) => p && p.host === ip)
  pins.sort((a, b) => String(b.pinnedAt ?? '').localeCompare(String(a.pinnedAt ?? '')))
  return pins[0] ?? null
}

function listen(server, port) {
  return new Promise((resolve) => {
    const fail = () => { server.off('listening', ok); resolve(false) }
    const ok = () => { server.off('error', fail); resolve(true) }
    server.once('error', fail)
    server.once('listening', ok)
    server.listen(port, '127.0.0.1')
  })
}

/**
 * Open the window. Resolves `{ ok: true, port, corePort, close }` or `{ ok: false, reason, detail? }` — reasons: `bad-port`, `no-pin`,
 * `need-password` (no visit key given), `auth` (the visit key expired or closed), `host-key-changed`, `unreachable`, `timeout`,
 * `no-core-port`, `no-free-port`.
 * @param {{ root: string, ip: string, privateKey?: string | null, user?: string, folder: string, nodeDir?: string, localPort?: number | null, onDrop?: () => void }} o
 */
export async function openWindow({ root, ip, privateKey = null, user = 'fractera', folder, nodeDir = null, localPort = null, onDrop = null }) {
  if (localPort !== null && !windowPortAllowed(localPort)) return { ok: false, reason: 'bad-port' }
  const pin = pinFor(root, ip)
  if (!pin) return { ok: false, reason: 'no-pin' }
  let client
  try {
    ({ client } = await connect({ root, host: ip, port: pin.port, privateKey }))
  } catch (e) {
    return { ok: false, reason: e?.reason ?? 'unreachable', detail: String(e?.message ?? e).slice(0, 200) }
  }
  client.on('close', () => onDrop?.())
  const dir = nodeDir ?? `/home/${user}/${folder}`
  const r = await exec(client, `cat '${dir.replace(/'/g, `'\\''`)}/logs/runtime.json'`).catch(() => ({ stdout: '' }))
  let corePort = null
  try { corePort = Number(JSON.parse(r.stdout).port) } catch { corePort = null }
  if (!Number.isInteger(corePort) || corePort < 1 || corePort > 65535) { client.end(); return { ok: false, reason: 'no-core-port' } }

  const sockets = new Set()
  const server = net.createServer((sock) => {
    sockets.add(sock)
    sock.on('close', () => sockets.delete(sock))
    client.forwardOut('127.0.0.1', sock.remotePort ?? 0, 'localhost', corePort, (err, stream) => {
      if (err) { sock.destroy(); return }
      sock.pipe(stream).pipe(sock)
      stream.on('close', () => sock.destroy())
      sock.on('close', () => stream.end())
    })
  })
  const candidates = localPort !== null ? [localPort] : Array.from({ length: WINDOW_LAST - WINDOW_FIRST + 1 }, (_, i) => WINDOW_FIRST + i)
  let port = null
  for (const p of candidates) {
    if (await listen(server, p)) { port = p; break }
  }
  if (port === null) { client.end(); return { ok: false, reason: 'no-free-port' } }
  const close = () => {
    for (const s of sockets) s.destroy()
    server.close()
    client.end()
  }
  return { ok: true, port, corePort, close }
}

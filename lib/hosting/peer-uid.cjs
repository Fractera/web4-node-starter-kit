// WHO OPENED THIS CONNECTION — ASKED OF LINUX, NOT OF THE REQUEST (node step 811-5g). The owner, Telegram 135, 2026-11-20: «мы же
// строили такую систему защиты чтобы она была непрошибаемой». The rule «a request from this machine is the owner at its keyboard»
// (`lib/auth/owner-at-machine.ts`) is true on a home computer, where one person lives; on a dedicated server with a wall per element
// (`element-wall.cjs`) every element user `fe-<id>` is also «on this machine» and could knock on the core's loopback as the architect.
// 🔒 THE ANSWER COMES FROM THE KERNEL: for a loopback TCP connection the client's socket is a line of /proc/net/tcp(6) — local address
// = the request's remote address:port, remote = the server's address:port — and that line names the uid that opened it. A header can be
// forged; this line cannot. `server.js` stamps every request with the verdict (`x-fractera-peer`, always removed first, so a client never
// sends it in), the owner-at-machine rule refuses a stamped request, and the pty sockets of the core refuse it outright.
// Only where the wall is on (Linux, the helper installed for this node); everywhere else nothing is read and nothing changes.
const fs = require('node:fs')

const HEADER = 'x-fractera-peer'
const LOOPBACK = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1'])

let passwd = { at: 0, byUid: new Map() }
function userName(uid, file = '/etc/passwd') {
  if (Date.now() - passwd.at > 30_000) {
    const byUid = new Map()
    try {
      for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
        const [name, , id] = line.split(':')
        if (name && /^\d+$/.test(id || '')) byUid.set(Number(id), name)
      }
    } catch { /* no passwd — nobody is named */ }
    passwd = { at: Date.now(), byUid }
  }
  return passwd.byUid.get(uid) ?? null
}

const hexPort = (p) => p.toString(16).toUpperCase().padStart(4, '0')

/**
 * The uid that opened the client side of a loopback connection, or null (not loopback, not found, not Linux).
 * @param {{ remoteAddress?: string, remotePort?: number, localPort?: number }} socket
 */
function peerUid(socket, { files = ['/proc/net/tcp', '/proc/net/tcp6'] } = {}) {
  if (!socket || !LOOPBACK.has(String(socket.remoteAddress)) || !socket.remotePort || !socket.localPort) return null
  const client = `:${hexPort(socket.remotePort)}`
  const server = `:${hexPort(socket.localPort)}`
  for (const file of files) {
    let text
    try { text = fs.readFileSync(file, 'utf8') } catch { continue }
    for (const line of text.split('\n').slice(1)) {
      const f = line.trim().split(/\s+/)
      // sl local_address rem_address st tx:rx tr:when retrnsmt uid …
      if (f.length > 7 && f[1].endsWith(client) && f[2].endsWith(server)) return Number(f[7])
    }
  }
  return null
}

/** The element whose own user opened this connection (`fe-<id>` → `<id>`), or null. Cached on the socket (keep-alive). */
function elementPeer(socket, opts = {}) {
  if (!socket) return null
  if (socket.__fracteraPeer !== undefined) return socket.__fracteraPeer
  const uid = peerUid(socket, opts)
  const name = uid === null ? null : userName(uid, opts.passwd)
  const id = name && name.startsWith('fe-') ? name.slice(3) : null
  socket.__fracteraPeer = id
  return id
}

/** Is the wall on for this node? Asked once per process (the helper does not appear or vanish while the core runs). */
let wall = null
function wallHere(root) {
  if (wall === null) {
    try { wall = require('./element-wall.cjs').wallOn(root) } catch { wall = false }
  }
  return wall
}

/** server.js: the header is always removed; on a walled server a connection opened by an element user gets it back with its id. */
function stamp(req, root) {
  delete req.headers[HEADER]
  if (!wallHere(root)) return null
  const id = elementPeer(req.socket)
  if (id) req.headers[HEADER] = id
  return id
}

module.exports = { HEADER, peerUid, elementPeer, stamp, wallHere }

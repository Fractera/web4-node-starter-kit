// THE SSH ROAD TO THE PERSON'S SERVER (node step 737-3). The owner, 2026-11-13: «настройка которая принимает IP-адрес сервера и которая
// принимает пароль с сервера а затем … шаг за шагом автоматически».
// 🔒 THE PASSWORD IS USED ONCE AND KEPT NOWHERE: it enters `installKey` from the node's screen, lives only in this process's memory for
// the first connection (dropped from the configs once it is ready or failed), and is never written, logged, recorded or sent to a
// model. Everything
// after it goes by the node's own key: ed25519, made here, private half in `data/node/server/` (0600, `data/*` is outside git), public
// half appended to the server's `authorized_keys`. Proof you can do yourself: change the server's password after the move — the node
// keeps working.
// 🔒 THE SERVER'S OWN KEY IS PINNED at the first contact, SHA-256: a different key later is a refusal (`host-key-changed`, with both
// fingerprints), never a silent «accept» — a man in the middle would otherwise receive the whole node. The person who reinstalled the
// server says so on the page (`trustHost`), seeing both fingerprints.
// 🔒 738-2 — A MAP OF PINS, ONE PER SERVER (the owner, 2026-11-14: «… начать работать со вторым … с 10-м и с 100-м сервером»):
// `known-hosts.json` {"<host>:<port>": {fingerprint, keyLine, pinnedAt}} and a `known_hosts` of every pinned server for the system's
// `ssh`. ✗ 737 kept ONE pin (`known-host.json`): connecting server #2 overwrote #1, and system ssh to #1 then failed for good. The old
// single pin is read once into the map.
// 🔒 `ssh2` (MIT, github.com/mscdex/ssh2) — the Fractera easy starter's proven choice (`lib/deploy.ts`): pure JS on all three systems,
// no `sshpass`, no askpass helper holding the password in a file.
import { createHash } from 'node:crypto'
import { chmodSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import ssh2 from 'ssh2'

const { Client, utils } = ssh2
export const KEY_NAME = 'id_ed25519'
const PUBLIC_LINE = /^ssh-ed25519 [A-Za-z0-9+/]+={0,2} fractera-node$/
const OUTPUT_CAP = 1_000_000

export const serverDir = (root) => join(root, 'data', 'node', 'server')

/** An ed25519 pair the library itself can read back. ✗ MEASURED 2026-11-13 (CI ubuntu failed on it): ssh2's generateKeyPairSync gives
 *  «Malformed OpenSSH private key» for 85 of 20 000 pairs (~1 in 235) — such a node key would fail every connect of the move for good.
 *  So a pair is made again until `parseKey` takes it (ten tries; the chance all ten are bad is below 10⁻²³). */
export function readableKeyPair(options) {
  for (let i = 0; i < 10; i++) {
    const pair = options ? utils.generateKeyPairSync('ed25519', options) : utils.generateKeyPairSync('ed25519')
    if (!(utils.parseKey(pair.private) instanceof Error)) return pair
  }
  throw new Error('ssh2 made ten unreadable ed25519 keys in a row')
}

/** The node's key pair, made once. Returns the private key (Buffer) and the public line `ssh-ed25519 … fractera-node`. */
export function ensureKeyPair(root) {
  const dir = serverDir(root)
  const priv = join(dir, KEY_NAME)
  const pub = `${priv}.pub`
  if (!existsSync(priv) || !existsSync(pub)) {
    mkdirSync(dir, { recursive: true, mode: 0o700 })
    const pair = readableKeyPair({ comment: 'fractera-node' })
    writeFileSync(priv, pair.private, { mode: 0o600 })
    writeFileSync(pub, `${pair.public.trim()}\n`, { mode: 0o644 })
  }
  try { chmodSync(priv, 0o600) } catch { /* Windows keeps its own ACL */ }
  const publicLine = readFileSync(pub, 'utf8').trim()
  if (!PUBLIC_LINE.test(publicLine)) throw new Error('the node key is damaged: data/node/server/id_ed25519.pub')
  return { privateKey: readFileSync(priv), publicLine }
}

export function fingerprint(keyBuffer) {
  return `SHA256:${createHash('sha256').update(keyBuffer).digest('base64').replace(/=+$/, '')}`
}

const pinKey = (host, port) => `${host}:${port}`

/** Every pinned server: `{ "<host>:<port>": { host, port, fingerprint, keyLine, pinnedAt } }`; the 737 single pin joins it. */
export function readPins(root) {
  let pins = {}
  try { pins = JSON.parse(readFileSync(join(serverDir(root), 'known-hosts.json'), 'utf8')) ?? {} } catch { /* none yet */ }
  try {
    const old = JSON.parse(readFileSync(join(serverDir(root), 'known-host.json'), 'utf8'))
    if (old?.host && old?.fingerprint && !pins[pinKey(old.host, old.port ?? 22)]) pins[pinKey(old.host, old.port ?? 22)] = { host: old.host, port: old.port ?? 22, fingerprint: old.fingerprint, keyLine: old.keyLine ?? null, pinnedAt: old.pinnedAt ?? null }
  } catch { /* no 737 pin */ }
  return pins
}

function readPin(root, host, port) {
  return readPins(root)[pinKey(host, port)] ?? null
}

function writePins(root, pins) {
  mkdirSync(serverDir(root), { recursive: true, mode: 0o700 })
  writeFileSync(join(serverDir(root), 'known-hosts.json'), `${JSON.stringify(pins, null, 2)}\n`, { mode: 0o600 })
  const lines = Object.values(pins).filter((p) => p.keyLine).map((p) => `${p.port === 22 ? p.host : `[${p.host}]:${p.port}`} ${p.keyLine}`)
  writeFileSync(join(serverDir(root), 'known_hosts'), lines.length ? `${lines.join('\n')}\n` : '', { mode: 0o600 })
  rmSync(join(serverDir(root), 'known-host.json'), { force: true })
}

/**
 * Pin a server's key after the first successful contact: its entry in `known-hosts.json` and its line in `known_hosts` for the system's
 * `ssh` (`StrictHostKeyChecking=yes` against that very line). Every other server's pin stays.
 */
export function pinHost(root, host, port, print, keyLine = null) {
  const pins = readPins(root)
  pins[pinKey(host, port)] = { host, port, fingerprint: print, keyLine, pinnedAt: new Date().toISOString() }
  writePins(root, pins)
}

/** `ssh-ed25519 AAAA…` of a raw host key, or `null`. */
function keyLineOf(key) {
  const parsed = utils.parseKey(key)
  if (!parsed || parsed instanceof Error) return null
  const k = Array.isArray(parsed) ? parsed[0] : parsed
  return `${k.type} ${k.getPublicSSH().toString('base64')}`
}

/**
 * Open a connection. `password` only for the first contact; otherwise the node's key. Resolves `{ client, fingerprint }`.
 * Refuses: `host-key-changed` (pinned key differs), `auth` (wrong password or key not installed), `unreachable`, `timeout`.
 */
export function connect({ root, host, port = 22, username = 'root', password = null, timeoutMs = 20_000, expect = null }) {
  return new Promise((resolve, reject) => {
    const client = new Client()
    // `expect` (trusting a reinstalled server) replaces the old pin by the one fingerprint the person confirmed.
    const pin = expect ? null : readPin(root, host, port)
    let seen = null
    let seenLine = null
    let changed = false
    const config = {
      host, port, username, readyTimeout: timeoutMs, keepaliveInterval: 15_000,
      hostVerifier: (key) => {
        seen = fingerprint(key)
        seenLine = keyLineOf(key)
        if (pin && pin.fingerprint !== seen) { changed = true; return false }
        // 738-2: trusting a reinstalled server — only the key whose fingerprint the person saw on the page, never whatever answers now.
        if (expect && expect !== seen) { changed = true; return false }
        return true
      },
      ...(password !== null ? { password, tryKeyboard: false } : { privateKey: ensureKeyPair(root).privateKey }),
    }
    const forget = () => {
      delete config.password
      if (client.config) client.config.password = undefined
    }
    client.once('ready', () => {
      forget()
      resolve({ client, fingerprint: seen, hostKeyLine: seenLine })
    })
    // `on`, not `once`: ssh2 may emit a second error after the first («Connection lost before handshake» after a timeout) — with no
    // listener left it would crash the process (✗ caught by test:hosting-move, 2026-11-13). Every later error after settling is quiet.
    let settled = false
    client.once('ready', () => { settled = true })
    client.on('error', (err) => {
      if (settled) return
      settled = true
      forget()
      const level = String(err?.level ?? '')
      const reason = changed ? 'host-key-changed'
        : level === 'client-authentication' ? 'auth'
        : /timed out/i.test(String(err?.message)) ? 'timeout'
        : 'unreachable'
      reject(Object.assign(new Error(reason), { reason, ...(changed ? { seen, pinned: pin?.fingerprint ?? null } : {}) }))
    })
    client.connect(config)
  })
}

/** Run one command; output is capped. Resolves `{ code, stdout, stderr }` — a non-zero code is an answer, not an exception. */
export function exec(client, command, { timeoutMs = 120_000, onData = null, stdin = null } = {}) {
  return new Promise((resolve, reject) => {
    client.exec(command, (err, stream) => {
      if (err) return reject(err)
      // 737-11a: a secret (a bot token) reaches the server's command on its stdin — never in its argv, which the server's process list shows.
      if (stdin !== null) stream.end(stdin)
      let stdout = ''
      let stderr = ''
      const timer = setTimeout(() => { try { stream.close() } catch { /* already closed */ } }, timeoutMs)
      stream.on('data', (d) => { const s = d.toString(); if (stdout.length < OUTPUT_CAP) stdout += s; onData?.(s) })
      stream.stderr.on('data', (d) => { const s = d.toString(); if (stderr.length < OUTPUT_CAP) stderr += s; onData?.(s) })
      stream.on('close', (code) => { clearTimeout(timer); resolve({ code: typeof code === 'number' ? code : null, stdout, stderr }) })
    })
  })
}

/** Write a file on the server through SFTP with a mode. */
export function upload(client, remotePath, content, mode = 0o600) {
  return new Promise((resolve, reject) => {
    client.sftp((err, sftp) => {
      if (err) return reject(err)
      const ws = sftp.createWriteStream(remotePath, { mode })
      ws.on('error', (e) => { sftp.end(); reject(e) })
      ws.on('close', () => { sftp.end(); resolve() })
      ws.end(content)
    })
  })
}

/**
 * The first contact: the password once → the node's public key into root's `authorized_keys` → a second connection by the key alone
 * proves it → the server's key is pinned. Resolves `{ fingerprint }`.
 */
export async function installKey({ root, host, port = 22, password, expect = null }) {
  const { publicLine } = ensureKeyPair(root)
  const first = await connect({ root, host, port, password, expect })
  try {
    const line = publicLine.replace(/'/g, '')
    const r = await exec(first.client, `umask 077; mkdir -p ~/.ssh && touch ~/.ssh/authorized_keys && (grep -qxF '${line}' ~/.ssh/authorized_keys || printf '%s\\n' '${line}' >> ~/.ssh/authorized_keys) && echo KEY_OK`)
    if (r.code !== 0 || !r.stdout.includes('KEY_OK')) throw Object.assign(new Error('key-install'), { reason: 'key-install', detail: r.stderr.slice(0, 400) })
  } finally {
    first.client.end()
  }
  const second = await connect({ root, host, port, expect })
  try {
    const r = await exec(second.client, 'echo BY_KEY')
    if (!r.stdout.includes('BY_KEY')) throw Object.assign(new Error('key-check'), { reason: 'key-check' })
  } finally {
    second.client.end()
  }
  pinHost(root, host, port, first.fingerprint, first.hostKeyLine)
  return { fingerprint: first.fingerprint }
}

// THE SSH ROAD TO THE PERSON'S SERVER (node step 737-3). The owner, 2026-11-13: «настройка которая принимает IP-адрес сервера и которая
// принимает пароль с сервера а затем … шаг за шагом автоматически».
// 🔒 THE PASSWORD IS USED ONCE AND KEPT NOWHERE: it enters `installKey` from the node's screen, lives only in this process's memory for
// the first connection (dropped from the configs once it is ready or failed), and is never written, logged, recorded or sent to a
// model. Everything
// after it goes by the node's own key: ed25519, made here, private half in `data/node/server/` (0600, `data/*` is outside git), public
// half appended to the server's `authorized_keys`. Proof you can do yourself: change the server's password after the move — the node
// keeps working.
// 🔒 THE SERVER'S OWN KEY IS PINNED at the first contact (`known-host.json`, SHA-256): a different key later is a refusal
// (`host-key-changed`), never a silent «accept» — a man in the middle would otherwise receive the whole node.
// 🔒 `ssh2` (MIT, github.com/mscdex/ssh2) — the Fractera easy starter's proven choice (`lib/deploy.ts`): pure JS on all three systems,
// no `sshpass`, no askpass helper holding the password in a file.
import { createHash } from 'node:crypto'
import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import ssh2 from 'ssh2'

const { Client, utils } = ssh2
export const KEY_NAME = 'id_ed25519'
const PUBLIC_LINE = /^ssh-ed25519 [A-Za-z0-9+/]+={0,2} fractera-node$/
const OUTPUT_CAP = 1_000_000

export const serverDir = (root) => join(root, 'data', 'node', 'server')

/** The node's key pair, made once. Returns the private key (Buffer) and the public line `ssh-ed25519 … fractera-node`. */
export function ensureKeyPair(root) {
  const dir = serverDir(root)
  const priv = join(dir, KEY_NAME)
  const pub = `${priv}.pub`
  if (!existsSync(priv) || !existsSync(pub)) {
    mkdirSync(dir, { recursive: true, mode: 0o700 })
    const pair = utils.generateKeyPairSync('ed25519', { comment: 'fractera-node' })
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

function readPin(root) {
  try { return JSON.parse(readFileSync(join(serverDir(root), 'known-host.json'), 'utf8')) } catch { return null }
}

/**
 * Pin the server's key after the first successful contact: `known-host.json` for this module and `known_hosts` for the system's
 * `ssh`/`rsync` (737-5 copies files through them with `StrictHostKeyChecking=yes` against this very line).
 */
export function pinHost(root, host, port, print, keyLine = null) {
  mkdirSync(serverDir(root), { recursive: true, mode: 0o700 })
  writeFileSync(join(serverDir(root), 'known-host.json'), `${JSON.stringify({ host, port, fingerprint: print, keyLine, pinnedAt: new Date().toISOString() }, null, 2)}\n`)
  if (keyLine) writeFileSync(join(serverDir(root), 'known_hosts'), `${port === 22 ? host : `[${host}]:${port}`} ${keyLine}\n`, { mode: 0o600 })
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
export function connect({ root, host, port = 22, username = 'root', password = null, timeoutMs = 20_000 }) {
  return new Promise((resolve, reject) => {
    const client = new Client()
    const pin = readPin(root)
    let seen = null
    let seenLine = null
    let changed = false
    const config = {
      host, port, username, readyTimeout: timeoutMs, keepaliveInterval: 15_000,
      hostVerifier: (key) => {
        seen = fingerprint(key)
        seenLine = keyLineOf(key)
        if (pin && pin.host === host && pin.port === port && pin.fingerprint !== seen) { changed = true; return false }
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
    client.once('error', (err) => {
      forget()
      const level = String(err?.level ?? '')
      const reason = changed ? 'host-key-changed'
        : level === 'client-authentication' ? 'auth'
        : /timed out/i.test(String(err?.message)) ? 'timeout'
        : 'unreachable'
      reject(Object.assign(new Error(reason), { reason }))
    })
    client.connect(config)
  })
}

/** Run one command; output is capped. Resolves `{ code, stdout, stderr }` — a non-zero code is an answer, not an exception. */
export function exec(client, command, { timeoutMs = 120_000, onData = null } = {}) {
  return new Promise((resolve, reject) => {
    client.exec(command, (err, stream) => {
      if (err) return reject(err)
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
export async function installKey({ root, host, port = 22, password }) {
  const { publicLine } = ensureKeyPair(root)
  const first = await connect({ root, host, port, password })
  try {
    const line = publicLine.replace(/'/g, '')
    const r = await exec(first.client, `umask 077; mkdir -p ~/.ssh && touch ~/.ssh/authorized_keys && (grep -qxF '${line}' ~/.ssh/authorized_keys || printf '%s\\n' '${line}' >> ~/.ssh/authorized_keys) && echo KEY_OK`)
    if (r.code !== 0 || !r.stdout.includes('KEY_OK')) throw Object.assign(new Error('key-install'), { reason: 'key-install', detail: r.stderr.slice(0, 400) })
  } finally {
    first.client.end()
  }
  const second = await connect({ root, host, port })
  try {
    const r = await exec(second.client, 'echo BY_KEY')
    if (!r.stdout.includes('BY_KEY')) throw Object.assign(new Error('key-check'), { reason: 'key-check' })
  } finally {
    second.client.end()
  }
  pinHost(root, host, port, first.fingerprint, first.hostKeyLine)
  return { fingerprint: first.fingerprint }
}

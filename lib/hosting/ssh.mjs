// THE SSH ROAD TO THE PERSON'S SERVER (node step 737-3). The owner, 2026-11-13: «настройка которая принимает IP-адрес сервера и которая
// принимает пароль с сервера а затем … шаг за шагом автоматически».
// 🔒 744-3 — ACCESS FOR ONE DAY, HELD BY THE SERVER (the owner, 2026-11-14: «не думаю что у тебя есть право хранить пароль от сервера
// потому что это могут быть чужие сервера … в случае взлома пользователи получит доступ ко всем серверам» · «no more then 24»). The
// password is used once (`openVisit`) and kept nowhere; it makes a VISIT key: ed25519, made in this process's memory, its line in root's
// `authorized_keys` carrying `expiry-time` computed by the SERVER'S OWN clock (its zone, no «Z» — measured: OpenSSH 8.6 refuses a
// «Z», 9.6 reads a bare stamp in the system zone), so at the deadline sshd itself refuses it. The private half goes back to the caller
// (the launch door keeps it in the browser as an HttpOnly cookie, ≤ 24 h) — never to the node's disk. ✗ Before 744-3 a persistent
// node key lived in `data/node/server/id_ed25519` and opened every server this computer ever launched, forever.
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
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import ssh2 from 'ssh2'

const { Client, utils } = ssh2
const OUTPUT_CAP = 1_000_000
/** A visit lasts at most a day (the owner: «no more then 24»); shorter only for a test. */
export const VISIT_MINUTES = 24 * 60

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

/** The base64 body of a key's public half (`AAAA…`), from its private or public text; `null` when unreadable. */
export function publicBody(keyText) {
  const parsed = utils.parseKey(keyText)
  if (!parsed || parsed instanceof Error) return null
  return (Array.isArray(parsed) ? parsed[0] : parsed).getPublicSSH().toString('base64')
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
 * Open a connection — by the root `password` (the first contact of a visit) or by a visit's `privateKey` from the caller; neither is
 * `need-password` at once. Resolves `{ client, fingerprint, hostKeyLine }`. Refuses: `host-key-changed` (pinned key differs), `auth`
 * (a wrong password, or the key expired or removed), `no-password-login` (the server takes no password at all), `unreachable`, `timeout`.
 */
export function connect({ root, host, port = 22, username = 'root', password = null, privateKey = null, timeoutMs = 20_000, expect = null }) {
  if (password === null && !privateKey) return Promise.reject(Object.assign(new Error('need-password'), { reason: 'need-password' }))
  return new Promise((resolve, reject) => {
    const client = new Client()
    // `expect` (trusting a reinstalled server) replaces the old pin by the one fingerprint the person confirmed.
    const pin = expect ? null : readPin(root, host, port)
    let seen = null
    let seenLine = null
    let changed = false
    let secret = password
    let passwordOff = false
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
      // 744-3: one password try; the server's refusal names the methods it still takes — none of them «password» means the provider
      // switched password login off: named on step 1, never worked around.
      ...(password !== null
        ? {
            authHandler: (methodsLeft, _partial, next) => {
              if (methodsLeft === null && secret !== null) return next({ type: 'password', username, password: secret })
              if (Array.isArray(methodsLeft) && !methodsLeft.includes('password')) passwordOff = true
              return next(false)
            },
          }
        : { privateKey }),
    }
    const forget = () => {
      secret = null
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
        : level === 'client-authentication' ? (passwordOff ? 'no-password-login' : 'auth')
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

const BODY = /^[A-Za-z0-9+/]+={0,2}$/
const refuse = (reason, detail = '') => Object.assign(new Error(reason), { reason, ...(detail ? { detail } : {}) })

/**
 * The visit's line written ON THE SERVER, by its own clock: the deadline is now + `minutes` (whole minutes, the server's zone — `expiry-time`
 * takes YYYYMMDDHHMM); this node's earlier lines go — the persistent `fractera-node` key of before 744-3 (root's and the node user's,
 * D45), the visit this browser replaces, every visit already expired; every other key of the server stays untouched. Atomic: a temporary
 * file in the same folder, then `mv`. GNU and BSD `date` alike (`-d @E` / `-r E`), `awk` without interval braces (mawk). Read on stdin.
 */
function visitScript(minutes, line, old) {
  return `set -eu
umask 077
mkdir -p ~/.ssh && touch ~/.ssh/authorized_keys
E=$(( $(date +%s) + ${minutes} * 60 )); E=$(( E - E % 60 ))
D=$(date -d "@$E" +%Y%m%d%H%M 2>/dev/null || date -r "$E" +%Y%m%d%H%M)
NOW=$(date +%Y%m%d%H%M)
F=~/.ssh/authorized_keys; T="$F.fractera.$$"
awk -v now="$NOW" -v old='${old}' '
  / fractera-node$/ { next }
  /fractera-visit/ {
    if (old != "" && index($0, old) > 0) next
    if (match($0, /expiry-time="[0-9]+"/)) { s = substr($0, RSTART + 13, RLENGTH - 14); if (s + 0 <= now + 0) next }
  }
  { print }' "$F" > "$T"
printf 'expiry-time="%s" %s\\n' "$D" '${line}' >> "$T"
chmod 600 "$T" && mv -f "$T" "$F"
H=/home/fractera/.ssh/authorized_keys
if [ -f "$H" ] && grep -q ' fractera-node$' "$H"; then grep -v ' fractera-node$' "$H" > "$H.fractera" || true; chmod 600 "$H.fractera"; mv -f "$H.fractera" "$H"; chown fractera:fractera "$H" 2>/dev/null || true; fi
echo "VISIT_OK $E $D"
`
}

/** Remove the line of one visit key (its public body) from root's `authorized_keys`. */
function closeScript(body) {
  return `umask 077; F=~/.ssh/authorized_keys; T="$F.fractera.$$"; [ -f "$F" ] || { echo VISIT_CLOSED; exit 0; }
grep -vF '${body}' "$F" > "$T" || true; chmod 600 "$T" && mv -f "$T" "$F" && echo VISIT_CLOSED
`
}

/**
 * A VISIT (744-3): the root password once → a key made in memory, its line in root's `authorized_keys` with the server's own deadline →
 * a second connection by that key alone proves the server takes it (an OpenSSH older than 8.2, or a broken option, drops the line: it is
 * taken away again and the visit fails `key-refused`) → the server's key is pinned. `previous` — this browser's earlier visit key, whose
 * line goes now. Resolves `{ privateKey, deadline (ISO), stamp (the server's YYYYMMDDHHMM), fingerprint }`; nothing is written here
 * except the pin.
 */
export async function openVisit({ root, host, port = 22, password, minutes = VISIT_MINUTES, expect = null, previous = null }) {
  const m = Math.max(1, Math.min(VISIT_MINUTES, Math.floor(Number(minutes)) || VISIT_MINUTES))
  const pair = readableKeyPair()
  const body = publicBody(pair.private)
  const old = previous ? publicBody(previous) : null
  if (!body || !BODY.test(body) || (old && !BODY.test(old))) throw refuse('visit-key')
  const line = `ssh-ed25519 ${body} fractera-visit ${new Date().toISOString()}`
  const first = await connect({ root, host, port, password, expect })
  try {
    const r = await exec(first.client, 'bash -s', { stdin: visitScript(m, line, old ?? '') })
    const ok = /VISIT_OK (\d+) (\d{12})/.exec(r.stdout)
    if (r.code !== 0 || !ok) throw refuse('visit-install', r.stderr.slice(0, 400))
    try {
      const second = await connect({ root, host, port, privateKey: pair.private, expect: first.fingerprint })
      try {
        if (!(await exec(second.client, 'echo BY_VISIT')).stdout.includes('BY_VISIT')) throw refuse('key-refused')
      } finally { second.client.end() }
    } catch {
      await exec(first.client, closeScript(body)).catch(() => null)
      throw refuse('key-refused')
    }
    pinHost(root, host, port, first.fingerprint, first.hostKeyLine)
    return { privateKey: pair.private, deadline: new Date(Number(ok[1]) * 1000).toISOString(), stamp: ok[2], fingerprint: first.fingerprint }
  } finally {
    first.client.end()
  }
}

/** Close a visit now: its line leaves root's `authorized_keys` (connected by that very key). Resolves `{ closed }`. */
export async function closeVisit({ root, host, port = 22, privateKey }) {
  const body = privateKey ? publicBody(privateKey) : null
  if (!body || !BODY.test(body)) throw refuse('need-password')
  const { client } = await connect({ root, host, port, privateKey })
  try {
    return { closed: (await exec(client, closeScript(body))).stdout.includes('VISIT_CLOSED') }
  } finally { client.end() }
}

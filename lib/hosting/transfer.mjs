// THE COPY OF THE NODE TO ITS SERVER (node step 737-5). The owner, 2026-11-13: «весь проект переносится на сервер».
// 🔒 WHAT TRAVELS — EVERYTHING THAT IS THE NODE: the core's git history, `data/` (memory, element data, bots, keys of elements), `logs/`
// state (the fork verdict, the fresh-project mark — without it the server would strip the history), the registry, every element
// folder with its own `.git` and uncommitted work, `.env.local` (copied as a file, never read).
// 🔒 WHAT NEVER TRAVELS — what this computer rebuilds for itself or owns alone: `node_modules` and builds (`.next*`, the graph's Python
// `.uv`/`.venv` — macOS binaries do not run on Linux; the server's `npm ci`, `services:install` and the graph's prebuild make its own),
// this computer's SSH key and server pin (`data/node/server/` — the key never leaves the computer that made it), its quick tunnel and
// runtime marks, its logs.
// 🔒 TWO PHASES, ONE COMMAND: phase 1 while the node works (the bulk), phase 2 after the node stops (the last changes, consistent SQLite
// files). `--delete` keeps the copy exact; excluded paths on the server (its own node_modules and builds) are never deleted by it.
// 🔒 THE SERVER IS CHECKED, NOT TRUSTED: the system `ssh` under rsync uses the node's key and `StrictHostKeyChecking=yes` against the
// key pinned at the first contact (`ssh.mjs` → `known_hosts`).
import { spawn, spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, join } from 'node:path'
import { KEY_NAME, serverDir } from './ssh.mjs'

export const REMOTE_USER = 'fractera'
export const EXCLUDES = [
  'node_modules/', 'node_modules.old-*/', '.next/', '.next-*/', '.uv/', '.venv/', '.turbo/', '.DS_Store', '*.log',
  '/data/node/server/', '/data/node/moved.json',
  '/logs/runtime.json', '/logs/tunnel.json', '/logs/tunnel-*.json', '/logs/domain-tunnel.json', '/logs/browser-opened.json',
  '/logs/eyes/', '/logs/node-update/',
  // The server's own records: `--delete` of a later phase must never erase them (they exist only there).
  '/logs/dedicated-server/', '/data/node/server-side/', '/data/node/server.json',
]
// 🔒 THE REHEARSAL IS SILENT BY CONSTRUCTION, NOT BY A SWITCH IN EVERY SENDER: while the person's computer still runs the node, the
// server's copy gets no bot tokens (every bot of every element keeps its token in `data/services/<id>/channel/telegram*/.env` —
// measured: telegram.cjs, telegram-slots.cjs, notice.ts, progress.cjs, commands.cjs, telegram-relay.ts, main-agent-cli.mjs all read
// there) and no `logs/domain.json` (a named tunnel would get a second connector and split the domain's visitors). Two readers of one
// bot split the person's messages (409, telegram.cjs). The move's last phase brings both.
export const SILENT_EXCLUDES = ['/data/services/*/channel/telegram*/.env', '/logs/domain.json']

/** Where the node lives on the server: the same folder name in the user's home. */
export function remoteRootOf(root, user = REMOTE_USER) {
  return `/home/${user}/${basename(root)}`
}

/** The rules file of one phase: `silent` (the rehearsal) adds the bot tokens and the named tunnel to what stays here. */
export function writeExcludes(dir, phase = 'live') {
  const file = join(dir, 'rsync-excludes.txt')
  writeFileSync(file, `${[...EXCLUDES, ...(phase === 'silent' ? SILENT_EXCLUDES : [])].join('\n')}\n`)
  return file
}

/** Is `rsync` here (macOS and Linux ship it; Windows does not — 737-5 names the tar road as a debt). */
export function hasRsync() {
  return spawnSync('rsync', ['--version'], { encoding: 'utf8' }).status === 0
}

const number = (text, label) => {
  const m = String(text).match(new RegExp(`${label}:\\s*([\\d,.]+)`))
  return m ? Number(m[1].replace(/[,.]/g, '')) : null
}

/** Measure the copy before it happens: a local dry run with the same rules. Resolves `{ files, bytes }`. */
export function measure(root) {
  const tmp = mkdtempSync(join(tmpdir(), 'fractera-measure-'))
  try {
    const excludes = writeExcludes(tmp)
    const empty = join(tmp, 'empty')
    const r = spawnSync('rsync', ['-rlptn', '--stats', `--exclude-from=${excludes}`, `${root}/`, `${empty}/`], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
    if (r.status !== 0) throw new Error(`rsync dry run failed: ${String(r.stderr).slice(0, 300)}`)
    return { files: number(r.stdout, 'Number of files'), bytes: number(r.stdout, 'Total file size') }
  } finally {
    rmSync(tmp, { recursive: true, force: true })
  }
}

/** The rsync arguments of one phase. Refuses a key path with spaces (rsync splits `-e` on them). */
export function rsyncArgs({ root, host, port = 22, user = REMOTE_USER, excludeFile, target = null }) {
  const key = join(serverDir(root), KEY_NAME)
  const known = join(serverDir(root), 'known_hosts')
  if (/\s/.test(key + known)) throw new Error('the node folder path holds a space: rsync cannot pass the key to ssh')
  const ssh = `ssh -i ${key} -p ${port} -o BatchMode=yes -o IdentitiesOnly=yes -o StrictHostKeyChecking=yes -o UserKnownHostsFile=${known}`
  return ['-rlptz', '--delete', '--stats', `--exclude-from=${excludeFile}`, '-e', ssh, `${root}/`, target ?? `${user}@${host}:${remoteRootOf(root, user)}/`]
}

/**
 * Run one phase. `onLine` gets rsync's lines; resolves `{ code, files, bytes, sent }`. The environment is cleaned of the core's
 * `NEXT_*` and `PORT` (ANTI-PATTERNS «All systems»).
 */
export function copyPhase({ root, host, port = 22, user = REMOTE_USER, onLine = null, target = null, phase = 'live' }) {
  const tmp = mkdtempSync(join(tmpdir(), 'fractera-copy-'))
  const excludeFile = writeExcludes(tmp, phase)
  const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith('NEXT_') && k !== 'PORT' && k !== '__NEXT_PROCESSED_ENV'))
  return new Promise((resolve) => {
    const child = spawn('rsync', rsyncArgs({ root, host, port, user, excludeFile, target }), { env })
    let out = ''
    const feed = (chunk) => {
      const s = chunk.toString()
      if (out.length < 200_000) out += s
      if (onLine) for (const line of s.split('\n')) if (line.trim()) onLine(line)
    }
    child.stdout.on('data', feed)
    child.stderr.on('data', feed)
    child.on('close', (code) => {
      rmSync(tmp, { recursive: true, force: true })
      resolve({ code, files: number(out, 'Number of files'), bytes: number(out, 'Total file size'), sent: number(out, 'Total bytes sent'), tail: out.slice(-600) })
    })
  })
}

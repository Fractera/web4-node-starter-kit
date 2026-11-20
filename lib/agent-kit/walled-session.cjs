// A WALLED ELEMENT'S AGENT SESSION (node step 811-5b). On a dedicated server a custom element's agent runs as its own Linux user `fe-<id>`
// (`lib/hosting/element-wall.cjs`), which reads nothing of the core. The bridge builds the session as everywhere and hands it here;
// this file turns it into a launch the element user can live with:
// - the hooks and the status line of `--settings` → the relay (`hook-relay.cjs`, the one core file it may read; the core runs the
//   real hooks for it — `hook-relay-run.cjs`);
// - files the session is pointed at (`--append-system-prompt-file`, `--mcp-config`) → copies in the element's own data folder
//   (`data/services/<id>/session/`, opened to it by the helper's ACLs); the skills server → through the relay; any other MCP server
//   of the core (REA of the study pass) is left out on a server and said so;
// - the GitHub rule's `node scripts/element-github-push.mjs <id>` → the relay's `github-push`;
// - the environment → ONLY the keys below (never the node's own: it holds secrets), plus the element's own key for the relay;
// - the program → the helper's `agent` verb: a systemd unit as fe-<id> on the caller's pty, every other user's process invisible to it.
// 🔒 The owner's decision (Telegram 128, 2026-11-20): on a server an element's agent runs ONLY on the element's own Claude account; no
// account (or the node's subscription lent) → no session — the bridge refuses with `no-account`, the main agent does the work itself.
const fs = require('node:fs')
const path = require('node:path')
const { execFile } = require('node:child_process')

const KEEP_ENV = ['CLAUDE_CONFIG_DIR', 'TELEGRAM_STATE_DIR', 'FRACTERA_PASS', 'COLORTERM', 'LANG', 'LC_ALL']

/** The walled element whose folder the session runs in, or null (home computer, native element, a server before 811, no user yet). */
function walledAt(root, cwd, opts = {}) {
  const wall = require(path.join(root, 'lib', 'hosting', 'element-wall.cjs'))
  if (!wall.wallOn(root, opts)) return null
  const at = wall.walledEntryAt(root, cwd)
  if (!at || !wall.userExists(at.entry.id, opts)) return null
  return { id: at.entry.id, dir: at.dir, wall }
}

/** Values of a list flag (`--mcp-config a b --next`): indexes of its values. */
function valuesOf(args, i) {
  const out = []
  for (let j = i + 1; j < args.length && !String(args[j]).startsWith('--'); j++) out.push(j)
  return out
}

/**
 * @param {{ root: string, id: string, key: string, args: string[], env: object, port: number, node?: string, mode?: string, opts?: object }} o
 * @returns {{ cmd: string, args: string[], env: object, unitTag: string, dropped: string[], stop: () => void }}
 */
function walledLaunch({ root, id, key, args, env, port, node = '/usr/bin/node', mode = 'build', opts = {} }) {
  const wall = require(path.join(root, 'lib', 'hosting', 'element-wall.cjs'))
  const relayRun = require(path.join(root, 'lib', 'agent-kit', 'hook-relay-run.cjs'))
  const at = { node, relay: path.join(root, 'lib', 'agent-kit', 'hook-relay.cjs') }
  const sessionDir = path.join(root, 'data', 'services', id, 'session')
  fs.mkdirSync(sessionDir, { recursive: true })
  const dropped = []
  const out = [...args]
  for (let i = 0; i < out.length; i++) {
    const flag = out[i]
    if (flag === '--settings') {
      const s = JSON.parse(out[i + 1])
      const h = relayRun.relayHooks(s.hooks ?? null, at)
      if (h.hooks) s.hooks = h.hooks; else delete s.hooks
      dropped.push(...h.dropped.map((e) => `hook ${e}`))
      if (s.statusLine) { const l = relayRun.relayLine(s.statusLine, at); if (l) s.statusLine = l; else { delete s.statusLine; dropped.push('statusLine') } }
      out[i + 1] = JSON.stringify(s)
    } else if (flag === '--append-system-prompt-file') {
      const src = out[i + 1]
      const dst = path.join(sessionDir, path.basename(src))
      fs.writeFileSync(dst, fs.readFileSync(src, 'utf8'))
      out[i + 1] = dst
    } else if (flag === '--mcp-config') {
      const idx = valuesOf(out, i)
      const keep = []
      for (const j of idx) {
        const conf = JSON.parse(fs.readFileSync(out[j], 'utf8'))
        const servers = {}
        for (const [name, srv] of Object.entries(conf.mcpServers ?? {})) {
          if (name === 'node-skills') servers[name] = { command: node, args: [at.relay, 'mcp', 'skills'] }
          else dropped.push(`mcp ${name}`)
        }
        if (!Object.keys(servers).length) continue
        const dst = path.join(sessionDir, path.basename(out[j]))
        fs.writeFileSync(dst, JSON.stringify({ mcpServers: servers }, null, 2))
        keep.push(dst)
      }
      out.splice(i, idx.length + 1, ...(keep.length ? ['--mcp-config', ...keep] : []))
      if (!keep.length) i--
    } else if (typeof flag === 'string' && flag.includes('element-github-push.mjs')) {
      out[i] = flag.replace(/node "[^"]*element-github-push\.mjs" [a-z0-9-]+/g, `node ${at.relay} github-push`)
    }
  }
  const given = {}
  for (const k of KEEP_ENV) if (env[k]) given[k] = env[k]
  given.FRACTERA_HOOK_KEY = key
  given.FRACTERA_CORE_PORT = String(port)
  const unitTag = mode === 'work' ? 'work' : 'agent'
  const [sudo, ...pre] = opts.prefix || ['/usr/bin/sudo', '-n']
  const helper = opts.helper || wall.HELPER
  const kv = Object.entries(given).map(([k, v]) => `${k}=${v}`)
  const claude = opts.claude || '/usr/local/lib/fractera/bin/claude'
  return {
    cmd: sudo,
    args: [...pre, helper, 'agent', id, '--unit', unitTag, ...kv, '--', claude, ...out],
    // node-pty needs an environment for sudo itself; the element never sees it (the helper starts from an empty one)
    env: { PATH: '/usr/local/bin:/usr/bin:/bin', TERM: 'xterm-256color' },
    unitTag,
    dropped,
    stop: () => execFile(sudo, [...pre, helper, 'unit-stop', id, '--unit', unitTag], () => {}),
  }
}

/** The element's login shell (`claude auth login` into its own Claude folder) as fe-<id>, the unit tag `shell`. */
function walledShell({ root, id, home, opts = {} }) {
  const wall = require(path.join(root, 'lib', 'hosting', 'element-wall.cjs'))
  const [sudo, ...pre] = opts.prefix || ['/usr/bin/sudo', '-n']
  const helper = opts.helper || wall.HELPER
  return {
    cmd: sudo,
    args: [...pre, helper, 'agent', id, '--unit', 'shell', ...(home ? [`CLAUDE_CONFIG_DIR=${home}`] : []), '--', '/bin/bash', '-l'],
    env: { PATH: '/usr/local/bin:/usr/bin:/bin', TERM: 'xterm-256color' },
    stop: () => execFile(sudo, [...pre, helper, 'unit-stop', id, '--unit', 'shell'], () => {}),
  }
}

module.exports = { walledAt, walledLaunch, walledShell, KEEP_ENV }

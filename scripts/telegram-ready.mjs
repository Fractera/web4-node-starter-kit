// THE AGENTS' TELEGRAM IS READY BEFORE THE FIRST AGENT STARTS (node step 825-8; the owner, 2026-11-21, Telegram 542: «как правильно
// сделать bootstrap чтобы при установке поднялся Telegram … думать из концепции что будет наилучшим вариантом»).
//
// 🔒 ONE PATH. Every agent's Telegram is the plugin `telegram@claude-plugins-official` of Claude Code, its MCP server run by Bun. The
// install prepares all three, in order, each verified, so the first session of every agent starts WITH the channel:
//   1. Bun — `scripts/ensure-bun.mjs --strict` (the official installer; its `unzip` comes from the server's prepare stage);
//   2. the plugin — `claude plugin marketplace add anthropics/claude-plugins-official`, then `claude plugin install …` (measured 2026-11-21
//      in an empty Claude home: install alone fails «not found in marketplace», after the marketplace it succeeds — no sign-in needed);
//   3. its dependencies — `bun install` in the plugin's folder (the kit's `preparePlugin` would do it at the first launch, 300 s at most —
//      here it is done before anyone waits).
// ✗ Measured live 2026-11-21 on fractera.ai: no Bun → every agent started without the channel; the red banner «Telegram главного агента
// вас не слышит», «Переподключить» could not help — there was nothing to reconnect.
// Exit 1 with `===TELEGRAM_READY_FAILED=== <what>` — the server's stage `telegram` stops the install visibly; `===TELEGRAM_READY===` —
// the three facts, the paths printed. Idempotent: a ready machine passes in seconds. Never prints a token (it reads none).
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { homedir } from 'node:os'
import { join } from 'node:path'

const require = createRequire(import.meta.url)
const { resolveBin, extraBins } = require('../app/[lang]/(architectLayer)/architect/[item]/_agent-kit/server/claude-cli.cjs')
const PLUGIN = 'telegram@claude-plugins-official'
const fail = (what) => { console.error(`===TELEGRAM_READY_FAILED=== ${what}`); process.exit(1) }
const env = { ...process.env, PATH: [...extraBins(), process.env.PATH || ''].join(process.platform === 'win32' ? ';' : ':') }
const run = (bin, args, opts = {}) => spawnSync(bin, args, { encoding: 'utf8', env, windowsHide: true, timeout: 600_000, ...opts })
const pluginPath = () => {
  try {
    const home = env.CLAUDE_CONFIG_DIR || join(homedir(), '.claude')
    return JSON.parse(readFileSync(join(home, 'plugins', 'installed_plugins.json'), 'utf8')).plugins?.[PLUGIN]?.[0]?.installPath ?? ''
  } catch { return '' }
}

// 1. Bun
const b = run(process.execPath, [join(import.meta.dirname, 'ensure-bun.mjs'), '--strict'], { stdio: ['ignore', 'pipe', 'pipe'] })
const bun = resolveBin('bun', env.PATH)
if (b.status !== 0 || !bun) fail(`bun: ${`${b.stdout}${b.stderr}`.split('\n').filter(Boolean).slice(-2).join(' ')}`)

// 2. the plugin
const claude = resolveBin('claude', env.PATH)
if (!claude) fail('claude: the CLI is not installed (scripts/ensure-claude.mjs comes first)')
if (!pluginPath()) {
  run(claude, ['plugin', 'marketplace', 'add', 'anthropics/claude-plugins-official'])
  const r = run(claude, ['plugin', 'install', PLUGIN])
  if (!pluginPath()) fail(`plugin: ${`${r.stdout}${r.stderr}`.trim().slice(-300)}`)
}
const dir = pluginPath()

// 3. its dependencies
if (!existsSync(join(dir, 'node_modules'))) {
  const r = run(bun, ['install', '--no-summary'], { cwd: dir })
  if (r.status !== 0 || !existsSync(join(dir, 'node_modules'))) fail(`bun install in ${dir}: ${`${r.stdout}${r.stderr}`.trim().slice(-300)}`)
}
console.log(`===TELEGRAM_READY=== bun ${bun} · plugin ${dir} · dependencies installed`)

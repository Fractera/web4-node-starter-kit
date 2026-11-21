// IS BUN ON THE MACHINE — AND IF NOT, INSTALL IT (node step 825-8). Run by `preinstall`, after ensure-claude.
//
// 🔒 WHY. The Telegram channel of every agent is the plugin `telegram@claude-plugins-official`, and its MCP server runs on Bun: the kit's
// `channelLaunch` (`_agent-kit/server/telegram.cjs` → `preparePlugin`) finds `bun` by `resolveBin` (`~/.local/bin`, `~/.bun/bin`, PATH)
// and installs the plugin's dependencies with it. ✗ Measured live 2026-11-21 on the owner's fresh server fractera.ai: no bun → the main
// agent and every element started WITHOUT the channel («Telegram главного агента вас не слышит», «Агент piiic не включился»); the Mac
// had bun from an earlier hand install, so nothing showed there. Elements behind the wall copy the node user's `~/.bun/bin/bun`
// (`scripts/dedicated-server/fractera-element.sh`, 811-5e) — they need it here first.
//
// 🔒 ONE PATH, NO «IF» (the owner, 2026-11-21, Telegram 542: «правильный вопрос в том как правильно сделать bootstrap чтобы при
// установке поднялся Telegram»): the official installer, its prerequisites guaranteed before it — FROM THE PRIMARY SOURCE
// (bun.sh/docs/installation): macOS and Linux `curl -fsSL https://bun.sh/install | bash` → `~/.bun/bin/bun` (Linux needs `unzip`: the
// server's prepare stage installs it as root, macOS ships it); Windows `npm install -g bun` (ensure-claude's reason: `irm … | iex` raised
// an antivirus alarm, measured 2026-10-02).
//
// Exit code: 0 with bun; without — 0 in `preinstall` (a desktop node still installs, its terminal works), 1 with `--strict` (the server's
// stage `telegram`, `scripts/telegram-ready.mjs`: a server without Telegram is not a finished server).
import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { resolveBin } = require('../app/[lang]/(architectLayer)/architect/[item]/_agent-kit/server/claude-cli.cjs')

const isWindows = process.platform === 'win32'
const MANUAL = isWindows ? 'npm install -g bun' : 'curl -fsSL https://bun.sh/install | bash'
const version = (bin) => {
  const r = spawnSync(bin, ['--version'], { encoding: 'utf8', windowsHide: true, timeout: 30_000 })
  return r.status === 0 ? String(r.stdout).trim() : null
}
const find = () => resolveBin('bun', process.env.PATH || process.env.Path || '')

const found = find()
if (found) {
  console.log(`===BUN_PRESENT=== ${found} ${version(found) ?? ''}`.trim())
  process.exit(0)
}
console.log('Bun not found — installing it the official way (the Telegram channel of the agents runs on it).')
const r = isWindows
  ? spawnSync('npm.cmd', ['install', '-g', 'bun'], { encoding: 'utf8', stdio: 'inherit', windowsHide: true, shell: true, timeout: 600_000 })
  : spawnSync('bash', ['-c', 'curl -fsSL https://bun.sh/install | bash'], { encoding: 'utf8', stdio: 'inherit', timeout: 600_000 })
const after = find()
const v = after ? version(after) : null
if (after && v) {
  console.log(`===BUN_INSTALLED=== ${after} ${v}`)
  process.exit(0)
}
console.error(`===BUN_FAILED=== ${r.error ? String(r.error.message) : `the installer ended with code ${r.status}`}`)
console.error('The agents\' Telegram channel needs Bun. Install it yourself:')
console.error(`  ${MANUAL}`)
process.exit(process.argv.includes('--strict') ? 1 : 0)

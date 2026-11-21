// IS BUN ON THE MACHINE — AND IF NOT, INSTALL IT (node step 825-8). Run by `preinstall`, after ensure-claude.
//
// 🔒 WHY. The Telegram channel of every agent is the plugin `telegram@claude-plugins-official`, and its MCP server runs on Bun: the kit's
// `channelLaunch` (`_agent-kit/server/telegram.cjs` → `preparePlugin`) finds `bun` by `resolveBin` (`~/.local/bin`, `~/.bun/bin`, PATH)
// and installs the plugin's dependencies with it. ✗ Measured live 2026-11-21 on the owner's fresh server fractera.ai: no bun → the main
// agent and every element started WITHOUT the channel («Telegram главного агента вас не слышит», «Агент piiic не включился»); the Mac
// had bun from an earlier hand install, so nothing showed there. Elements behind the wall copy the node user's `~/.bun/bin/bun`
// (`scripts/dedicated-server/fractera-element.sh`, 811-5e) — they need it here first.
//
// 🔒 THE COMMANDS — FROM THE PRIMARY SOURCE (bun.sh/docs/installation): macOS and Linux `curl -fsSL https://bun.sh/install | bash`
// → `~/.bun/bin/bun` (on Linux the script needs `unzip` — the server's prepare stage installs it); Windows `npm install -g bun` (the
// same reason ensure-claude avoids `irm … | iex`: an antivirus alarm measured 2026-10-02).
//
// 🛑 NEVER FAILS THE INSTALL. No network, no curl, no unzip — `===BUN_FAILED===` with the reason and the command; the node installs on,
// its agents work in the terminal, only Telegram waits for bun.
import { spawnSync } from 'node:child_process'
import { chmodSync, copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync } from 'node:fs'
import { createRequire } from 'node:module'
import { homedir, tmpdir } from 'node:os'
import { join } from 'node:path'

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
// Linux without unzip (an older server, prepared before unzip joined its apt list; the node user has no root to add it): Bun's own
// npm package — `bun` with its platform binary `@oven/bun-linux-*` as an optional dependency, no unzip, no script run — into a scratch
// folder, the binary copied to `~/.bun/bin/bun` as a real file (an element behind the wall copies only a real ELF, 811-5e).
if (process.platform === 'linux' && !resolveBin('unzip', process.env.PATH || '')) {
  const tmp = mkdtempSync(join(tmpdir(), 'bun-npm-'))
  const r = spawnSync('npm', ['install', '--no-save', '--no-audit', '--no-fund', '--ignore-scripts', '--prefix', tmp, 'bun'], { encoding: 'utf8', timeout: 600_000 })
  const oven = join(tmp, 'node_modules', '@oven')
  const pkg = (existsSync(oven) ? readdirSync(oven) : []).filter((d) => d.startsWith(`bun-linux-${process.arch === 'arm64' ? 'aarch64' : 'x64'}`)).sort((a, b) => a.length - b.length)[0]
  const bin = pkg ? join(oven, pkg, 'bin', 'bun') : null
  if (bin && existsSync(bin)) {
    const dest = join(homedir(), '.bun', 'bin')
    mkdirSync(dest, { recursive: true })
    copyFileSync(bin, join(dest, 'bun'))
    chmodSync(join(dest, 'bun'), 0o755)
  }
  rmSync(tmp, { recursive: true, force: true })
  const got = find()
  const v = got ? version(got) : null
  if (got && v) { console.log(`===BUN_INSTALLED=== ${got} ${v} (npm package, no unzip)`); process.exit(0) }
  console.error(`===BUN_FAILED=== no unzip, and Bun's npm package did not give a binary: ${String(r.stderr ?? '').slice(-300) || `npm ended with code ${r.status}`}`)
  console.error('  sudo apt-get install -y unzip, then: ' + MANUAL)
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
console.error('The node installs on; the agents\' Telegram channel waits for Bun. Install it yourself:')
console.error(`  ${MANUAL}`)
process.exit(0)

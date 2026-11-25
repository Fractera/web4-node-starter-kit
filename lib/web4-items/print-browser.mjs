// THE BROWSER THAT PRINTS A PDF ON THIS COMPUTER (core step 852-3; the fractera.ai server, 2026-11-24 12:5x UTC: «GET
// /api/node/product-quiz/pdf … 503 no Chrome on this computer»). A dedicated server has no Google Chrome, but the node already installs
// its own headless Chromium for the agent's eyes (`scripts/ensure-eyes.mjs`: `playwright install chromium --only-shell`, into the
// machine's Playwright cache). The door now finds, in order: CHROME_PATH → an installed Chrome / Chromium → the node's own headless
// shell from that cache. Pure apart from the injected `fs` — the test feeds a fake tree.
import { existsSync, readdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const SYSTEM = {
  win32: (env) => [
    join(env.PROGRAMFILES || 'C:/Program Files', 'Google/Chrome/Application/chrome.exe'),
    join(env['PROGRAMFILES(X86)'] || 'C:/Program Files (x86)', 'Google/Chrome/Application/chrome.exe'),
    join(env.LOCALAPPDATA || '', 'Google/Chrome/Application/chrome.exe'),
  ],
  darwin: () => ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Chromium.app/Contents/MacOS/Chromium'],
  linux: () => ['/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser'],
}

/** Where Playwright keeps its browsers on this platform (PLAYWRIGHT_BROWSERS_PATH wins). */
export function playwrightCache(platform, env, home) {
  if (env.PLAYWRIGHT_BROWSERS_PATH && env.PLAYWRIGHT_BROWSERS_PATH !== '0') return env.PLAYWRIGHT_BROWSERS_PATH
  if (platform === 'darwin') return join(home, 'Library', 'Caches', 'ms-playwright')
  if (platform === 'win32') return join(env.LOCALAPPDATA || join(home, 'AppData', 'Local'), 'ms-playwright')
  return join(env.XDG_CACHE_HOME || join(home, '.cache'), 'ms-playwright')
}

// The headless shell's binary inside a `chromium_headless_shell-<rev>` folder, by Playwright's layouts (older and newer).
const SHELL_BINARIES = [
  'chrome-headless-shell-linux64/chrome-headless-shell', 'chrome-linux/headless_shell',
  'chrome-headless-shell-mac-x64/chrome-headless-shell', 'chrome-headless-shell-mac-arm64/chrome-headless-shell', 'chrome-mac/headless_shell',
  'chrome-headless-shell-win64/chrome-headless-shell.exe', 'chrome-win/headless_shell.exe',
]

/**
 * The browser to print with: { path, via, args } — `args` the headless flag that binary understands — or null.
 * @param {{ platform?: string, env?: Record<string,string|undefined>, home?: string, exists?: (p:string)=>boolean, list?: (p:string)=>string[] }} [o]
 */
export function printBrowser(o = {}) {
  const platform = o.platform ?? process.platform
  const env = o.env ?? process.env
  const home = o.home ?? homedir()
  const exists = o.exists ?? existsSync
  const list = o.list ?? ((p) => { try { return readdirSync(p) } catch { return [] } })
  if (env.CHROME_PATH) return { path: env.CHROME_PATH, via: 'CHROME_PATH', args: ['--headless=new'] }
  const system = (SYSTEM[platform] ?? SYSTEM.linux)(env).find((p) => p && exists(p))
  if (system) return { path: system, via: 'installed', args: ['--headless=new'] }
  const cache = playwrightCache(platform, env, home)
  // The newest revision first: `chromium_headless_shell-1200` before `-1187`.
  const dirs = list(cache).filter((d) => /^chromium_headless_shell-\d+$/.test(d)).sort((a, b) => Number(b.split('-').pop()) - Number(a.split('-').pop()))
  for (const d of dirs) {
    for (const rel of SHELL_BINARIES) {
      const p = join(cache, d, rel)
      if (exists(p)) return { path: p, via: 'node-headless-shell', args: ['--headless'] }
    }
  }
  return null
}

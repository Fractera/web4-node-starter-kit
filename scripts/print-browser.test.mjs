// Samples of the browser that prints the quiz PDF (core step 852-3, lib/web4-items/print-browser.mjs): exit code 1 on any miss.
import assert from 'node:assert/strict'
import { printBrowser, playwrightCache } from '../lib/web4-items/print-browser.mjs'

let passed = 0
const t = (name, fn) => { try { fn(); passed += 1; console.log(`  ✓ ${name}`) } catch (e) { console.error(`  ✗ ${name}\n    ${e.message}`); process.exitCode = 1 } }
const fake = (files) => ({ exists: (p) => files.includes(p), list: (d) => [...new Set(files.filter((f) => f.startsWith(d + '/')).map((f) => f.slice(d.length + 1).split('/')[0]))] })

t('a dedicated server with no Chrome prints with the node\'s own headless shell, the newest revision', () => {
  const fs = fake(['/root/.cache/ms-playwright/chromium_headless_shell-1187/chrome-linux/headless_shell',
    '/root/.cache/ms-playwright/chromium_headless_shell-1200/chrome-headless-shell-linux64/chrome-headless-shell'])
  const b = printBrowser({ platform: 'linux', env: {}, home: '/root', ...fs })
  assert.deepEqual(b, { path: '/root/.cache/ms-playwright/chromium_headless_shell-1200/chrome-headless-shell-linux64/chrome-headless-shell', via: 'node-headless-shell', args: ['--headless'] })
})

t('an installed Chrome comes before the cache; CHROME_PATH before everything', () => {
  const fs = fake(['/usr/bin/google-chrome', '/root/.cache/ms-playwright/chromium_headless_shell-1200/chrome-linux/headless_shell'])
  assert.equal(printBrowser({ platform: 'linux', env: {}, home: '/root', ...fs }).via, 'installed')
  assert.equal(printBrowser({ platform: 'linux', env: { CHROME_PATH: '/opt/c' }, home: '/root', ...fs }).path, '/opt/c')
})

t('the cache follows PLAYWRIGHT_BROWSERS_PATH and each platform\'s place', () => {
  assert.equal(playwrightCache('linux', { PLAYWRIGHT_BROWSERS_PATH: '/srv/pw' }, '/root'), '/srv/pw')
  assert.equal(playwrightCache('darwin', {}, '/Users/r'), '/Users/r/Library/Caches/ms-playwright')
  assert.equal(playwrightCache('linux', { XDG_CACHE_HOME: '/x' }, '/root'), '/x/ms-playwright')
})

t('NEGATIVE CONTROL — the pre-852 rule (installed Chrome only) finds nothing on such a server; no browser at all → null', () => {
  const fs = fake(['/root/.cache/ms-playwright/chromium_headless_shell-1200/chrome-linux/headless_shell'])
  const before = ['/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser'].find((p) => fs.exists(p)) ?? null
  assert.equal(before, null)
  assert.notEqual(printBrowser({ platform: 'linux', env: {}, home: '/root', ...fs }), null)
  assert.equal(printBrowser({ platform: 'linux', env: {}, home: '/root', ...fake([]) }), null)
})

console.log(process.exitCode ? `===PRINT_BROWSER_TEST_FAILED=== ${passed} passed` : `===PRINT_BROWSER_TEST_OK=== ${passed} passed`)

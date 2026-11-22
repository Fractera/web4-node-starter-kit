// THE CLAUDE LOGIN LINK IS FOUND IN WHAT THE CLI REALLY PRINTS (node step 837-0). `node scripts/terminal-auth.test.mjs` (in the prebuild).
//
// ✗ 2026-11-22: the «fix» of 01:25 looked for `authorize?z=` — read by eye from a screenshot — and its test checked a string written by
// the same eye, so it passed while every real login on the server showed no window (the owner, Telegram 789: «Ни хрена я не увидел»).
// 🔒 THE FIRST SAMPLE HERE IS BYTES, NOT A RETELLING: Claude Code 2.1.330 `claude auth login` in a pseudo-terminal (160×40, no browser),
// captured 2026-11-22 12:51 UTC — only the 43 characters of its one-time challenge are replaced by others of the same kinds. A new CLI
// that prints its link otherwise gets a new sample of ITS bytes here, captured the same way, before the pattern is touched.

import assert from 'node:assert/strict'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const { extractAuthUrl } = await import(pathToFileURL(join(ROOT, 'app', '[lang]', '(architectLayer)', 'architect', 'kits', '_agent-kit', 'core', 'client', 'terminal-auth.mjs')).href)

const ESC = '\x1b'
const BEL = '\x07'
const SHORT = 'https://claude.ai/oauth/authorize?z-Ab3d0-pKaO8Ut0dVCWq93rtch_E-9g4QEWvZgw6xyz'
// Claude Code 2.1.330, byte for byte (the challenge replaced)
const CLI_2_1_330 = `Opening browser to sign in…\r\nIf the browser didn't open, visit:\r\n${ESC}]8;;${SHORT}${BEL}${ESC}[94m${SHORT}${ESC}[39m${ESC}]8;;${BEL}\r\nPaste code here if prompted > `
// what the owner's server showed at 12:46 (Telegram 789), as plain text
const SERVER_SCREEN = 'If the browser didn\'t open, visit:\r\nhttps://claude.ai/oauth/authorize?z-9AvgvJGECrTcQ29X7RybbDs6FOO8Zir1Sw2eKTMNnS8\r\nPaste code here if prompted > '
const LONG = 'https://claude.com/cai/oauth/authorize?code=true&client_id=abc&response_type=code&state=Xy_z-9Q'

let passed = 0
const t = (name, fn) => { try { fn(); passed++; console.log(`  ✓ ${name}`) } catch (e) { process.exitCode = 1; console.log(`  ✗ ${name}\n    ${e.message}`) } }

t('CLI 2.1.330 bytes: the hyperlink (OSC 8) gives the short link', () => assert.deepEqual(extractAuthUrl(CLI_2_1_330), { how: 'OSC-8', url: SHORT }))
t('CLI 2.1.330 bytes with the hyperlink torn off: the visible text gives it, without «Paste»', () => {
  const torn = CLI_2_1_330.replace(new RegExp(`${ESC}\\]8;;[^${BEL}]*${BEL}`, 'g'), '')
  assert.equal(extractAuthUrl(torn)?.url, SHORT)
})
t('the owner\'s server screen (12:46): «?z-…» is found', () => assert.equal(extractAuthUrl(SERVER_SCREEN)?.url, 'https://claude.ai/oauth/authorize?z-9AvgvJGECrTcQ29X7RybbDs6FOO8Zir1Sw2eKTMNnS8'))
t('a link the terminal wrapped onto two lines is joined back', () => {
  const wrapped = `visit:\r\n${SHORT.slice(0, 50)}\r\n${SHORT.slice(50)}\r\nPaste code here if prompted > `
  assert.equal(extractAuthUrl(wrapped)?.url, SHORT)
})
t('the older long link (CLI 2.1.260) is still found, without «Paste»', () => assert.equal(extractAuthUrl(`visit: ${LONG}\r\nPaste code here if prompted > `)?.url, LONG))
t('negative: another claude.ai address is not a login link', () => assert.equal(extractAuthUrl('see https://claude.ai/settings?z-abc\r\n'), null))
t('negative: no link — nothing', () => assert.equal(extractAuthUrl('Login successful.\r\n'), null))

console.log(process.exitCode ? `===TERMINAL_AUTH_FAILED=== ${passed} passed` : `===TERMINAL_AUTH_OK=== ${passed} passed`)

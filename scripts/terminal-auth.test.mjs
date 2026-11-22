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

// 837-0b — THE SHELL OF THE LOGIN TERMINAL, ONE RULE FOR THE WHOLE NODE. The owner's photo (Telegram 814): on the server the core typed
// `claude auth login` into the node user's zsh with no start-up file, and Debian's new-user menu ate it («laude: command not found»),
// while every walled element's `/bin/bash -l` worked (816: «почему … разные архитектуры»). Now Linux — bash -l for the core and every
// element; macOS — zsh, with -f when it has no start-up file (zshmodules: the newuser module loads only while RCS is set); Windows — cmd.
const { createRequire } = await import('node:module')
const { mkdtempSync, writeFileSync, existsSync, rmSync } = await import('node:fs')
const { tmpdir } = await import('node:os')
const req = createRequire(join(ROOT, 'package.json'))
const { loginShellArgs, shellCandidates } = req(join(ROOT, 'app', '[lang]', '(architectLayer)', 'architect', 'kits', '_agent-kit', 'core', 'server', 'claude-cli.cjs'))
const walled = req(join(ROOT, 'lib', 'agent-kit', 'walled-session.cjs'))
const bare = mkdtempSync(join(tmpdir(), 'login-shell-'))
const withRc = mkdtempSync(join(tmpdir(), 'login-shell-rc-'))
writeFileSync(join(withRc, '.zshrc'), '# the person\'s own\n')
const withLogin = mkdtempSync(join(tmpdir(), 'login-shell-zlogin-'))
writeFileSync(join(withLogin, '.zlogin'), '')
t('Linux: bash first — the core and the native elements get what a walled element gets', () => assert.equal(shellCandidates('linux')[0], '/bin/bash'))
t('Linux: the same shell and flag as the walled element\'s login shell', () => {
  const w = walled.walledShell({ root: ROOT, id: 'x', home: null, opts: { prefix: ['sudo'], helper: 'h' } })
  assert.deepEqual(w.args.slice(-2), ['/bin/bash', '-l'])
  assert.deepEqual(loginShellArgs(shellCandidates('linux')[0], bare), ['-l'])
})
t('macOS: zsh stays first, its default', () => assert.equal(shellCandidates('darwin')[0], '/bin/zsh'))
t('Windows: ComSpec, then cmd.exe; no arguments', () => { assert.equal(shellCandidates('win32', { ComSpec: 'C:\\X\\cmd.exe' })[0], 'C:\\X\\cmd.exe'); assert.deepEqual(loginShellArgs('C:\\Windows\\System32\\cmd.exe', bare), []) })
t('zsh with no start-up file starts with -f (the server\'s node user had exactly this)', () => { assert.deepEqual(loginShellArgs('/bin/zsh', bare), ['-f']); assert.deepEqual(loginShellArgs('/usr/bin/zsh', bare), ['-f']) })
t('negative: a person\'s own ~/.zshrc keeps their zsh as it was', () => assert.deepEqual(loginShellArgs('/bin/zsh', withRc), []))
t('negative: any one start-up file is enough (.zlogin)', () => assert.deepEqual(loginShellArgs('/bin/zsh', withLogin), []))
// live: this machine's own shells, in an empty home, with the arguments above, run the line the bridge types after 800 ms
let pty = null
try { pty = req('node-pty') } catch { /* no native module here — the live checks are skipped below */ }
const typed = (shell) => new Promise((resolve) => {
  let buf = ''
  const child = pty.spawn(shell, loginShellArgs(shell, bare), { cols: 100, rows: 24, cwd: bare, env: { HOME: bare, PATH: '/usr/bin:/bin', TERM: 'xterm-256color', SHELL: shell }, name: 'xterm-256color' })
  child.onData((d) => { buf += d })
  setTimeout(() => child.write('echo MARK_$((6*7))\r'), 800)
  setTimeout(() => { try { child.kill() } catch { /* gone */ } resolve(buf) }, 3000)
})
for (const shell of ['/bin/bash', '/bin/zsh']) {
  if (!pty || !existsSync(shell)) { console.log(`  · live ${shell} check skipped: no node-pty or no ${shell} here`); continue }
  const out = await typed(shell)
  t(`live: ${shell} ${loginShellArgs(shell, bare).join(' ')} in an empty home runs the typed line, no new-user menu`, () => {
    assert.ok(out.includes('MARK_42'), `the typed line did not run: ${JSON.stringify(out.slice(-200))}`)
    assert.ok(!/configuration function for new users|Type one of the keys/.test(out), 'the new-user menu appeared')
  })
}
for (const d of [bare, withRc, withLogin]) rmSync(d, { recursive: true, force: true })

console.log(process.exitCode ? `===TERMINAL_AUTH_FAILED=== ${passed} passed` : `===TERMINAL_AUTH_OK=== ${passed} passed`)

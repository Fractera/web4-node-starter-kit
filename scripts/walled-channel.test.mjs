// 839-8: a walled element's Telegram channel — its plugin chmods `.env` to 0600 first and swallows EPERM, so a `.env` that is not the
// session user's own is never read («TELEGRAM_BOT_TOKEN required», the server 2026-11-22). Before the walled launch the node opens what it
// made for the element and hands `.env` over: the element copies it AS ITSELF (the helper's `run`, the token never an argument) and the
// node keeps reading its own copy `.token.node`. Proven in a child node with a scratch node folder and a fake helper that records the calls
// and does the copy; negatives: a home computer (no wall) hands nothing, the token never appears in a helper's arguments.
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createRequire } from 'node:module'

const CORE = process.cwd()
const KIT = join(CORE, 'app', '[lang]', '(architectLayer)', 'architect', 'kits', '_agent-kit', 'core', 'server', 'telegram.cjs')
const TOKEN = '1234567890:AAHabcdefghijklmnopqrstuvwxyz012345'
let n = 0
const t = (name, fn) => { fn(); n++; console.log(`  ✓ ${name}`) }

function scratch(walled) {
  const root = mkdtempSync(join(tmpdir(), 'walled-channel-'))
  mkdirSync(join(root, 'WEB4-ITEMS-REGISTRY'), { recursive: true })
  writeFileSync(join(root, 'WEB4-ITEMS-REGISTRY', 'web4-items.json'), JSON.stringify({ services: [{ id: 'shop', kind: 'user' }] }))
  mkdirSync(join(root, 'WEB4-ITEMS', 'user', 'shop'), { recursive: true })
  const state = join(root, 'data', 'services', 'shop', 'channel', 'telegram')
  mkdirSync(state, { recursive: true })
  writeFileSync(join(state, '.env'), `TELEGRAM_BOT_TOKEN=${TOKEN}\n`, { mode: 0o600 })
  const code = `
    const calls = []
    globalThis.__web4WalledSession = { walledAt: () => ${walled} }
    globalThis.__web4ElementWall = { runAsElement: (id, prog, args) => { calls.push([id, prog, ...args].join(' ')); const fs = require('node:fs')
      if (prog === '/bin/cp') fs.copyFileSync(args[0], args[1]); if (prog === '/bin/mv') fs.renameSync(args[1], args[2]); return { ok: true } } }
    const kit = require(${JSON.stringify(KIT)})
    const fs = require('node:fs')
    const path = require('node:path')
    const s = path.join(process.cwd(), 'data', 'services', 'shop', 'channel', 'telegram')
    process.stdout.write(JSON.stringify({ calls, token: kit.storedToken('shop'), nodeCopy: fs.existsSync(path.join(s, '.token.node')), incoming: fs.existsSync(path.join(s, '.env.incoming')), env: fs.readFileSync(path.join(s, '.env'), 'utf8') }))`
  return { root, code }
}

t('a walled element: .env is handed over as the element (cp + mv), the node keeps .token.node, no leftover, the token never an argument', () => {
  const { root, code } = scratch(true)
  try {
    // the hand-off runs inside channelLaunch; call it through the exported name the test needs
    const r = spawnSync(process.execPath, ['-e', code.replace("const kit = require", "const kit = require").replace("process.stdout.write(", "kit.handEnvToElement('shop'); process.stdout.write(")], { cwd: root, encoding: 'utf8' })
    assert.equal(r.status, 0, r.stderr)
    const o = JSON.parse(r.stdout)
    assert.equal(o.calls.length, 2, JSON.stringify(o.calls))
    assert.match(o.calls[0], /^shop \/bin\/cp \S+\.env\.incoming \S+\.env\.part$/)
    assert.match(o.calls[1], /^shop \/bin\/mv -f \S+\.env\.part \S+\/\.env$/)
    assert.ok(!o.calls.join(' ').includes(TOKEN), 'the token never rides in a helper argument')
    assert.equal(o.nodeCopy, true); assert.equal(o.incoming, false)
    assert.equal(o.token, TOKEN); assert.match(o.env, /TELEGRAM_BOT_TOKEN=/)
  } finally { rmSync(root, { recursive: true, force: true }) }
})
t('negative: a home computer (no wall) — nothing handed, no node copy made', () => {
  const { root, code } = scratch(false)
  try {
    const r = spawnSync(process.execPath, ['-e', code.replace("process.stdout.write(", "kit.handEnvToElement('shop'); process.stdout.write(")], { cwd: root, encoding: 'utf8' })
    assert.equal(r.status, 0, r.stderr)
    const o = JSON.parse(r.stdout)
    assert.equal(o.calls.length, 0); assert.equal(o.nodeCopy, false); assert.equal(o.token, TOKEN)
  } finally { rmSync(root, { recursive: true, force: true }) }
})
t('the readers outside the kit take the node\'s copy first (progress, the asks\' bot)', () => {
  assert.match(readFileSync(join(CORE, 'lib', 'agent-kit', 'progress.cjs'), 'utf8'), /\['\.token\.node', '\.env'\]/)
  assert.match(readFileSync(join(CORE, 'lib', 'node', 'person-asks-telegram.cjs'), 'utf8'), /\['\.token\.node', '\.env'\]/)
})
t('839-9: a plugin pid of another user (EPERM) is alive; no such process (ESRCH) is dead', () => {
  const ch = createRequire(import.meta.url)(join(CORE, 'app', '[lang]', '(architectLayer)', 'architect', 'kits', '_agent-kit', 'core', 'server', 'channel-health.cjs'))
  const dir = mkdtempSync(join(tmpdir(), 'pid-'))
  const real = process.kill
  try {
    writeFileSync(join(dir, 'bot.pid'), '424242')
    process.kill = () => { const e = new Error('EPERM'); e.code = 'EPERM'; throw e }
    assert.equal(ch.pluginPid(dir)?.pid, 424242)
    process.kill = () => { const e = new Error('ESRCH'); e.code = 'ESRCH'; throw e }
    assert.equal(ch.pluginPid(dir), null)
  } finally { process.kill = real; rmSync(dir, { recursive: true, force: true }) }
})
// 839-11 (the server's main agent, Telegram 1016): the node's own `claude plugin install` against the element's Claude home wrote a fresh
// `.claude.json` over the element's 0600 one — no onboarding, no trusted folder, every session stood on the first-run dialog. 839-12 (1054):
// after the first-run marks the session stood on Claude Code's trust question for its data folder («Adding a new directory … Your answer
// holds for this session»). Before every session the element's OWN home is marked — onboarding, theme, trust of its own two folders —
// behind the wall as the element itself, keeping its account; never the node's home, never a file that does not parse.
// mode: 'walled' — the helper runs it as the element; 'refused' — walled, the helper cannot; 'home' — a home computer (no wall).
function markRun(mode, { file = JSON.stringify({ oauthAccount: { emailAddress: 'm@x.test' }, projects: {} }), configDir = null } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'walled-mark-'))
  mkdirSync(join(root, 'WEB4-ITEMS-REGISTRY'), { recursive: true })
  writeFileSync(join(root, 'WEB4-ITEMS-REGISTRY', 'web4-items.json'), JSON.stringify({ services: [{ id: 'shop', kind: 'user' }] }))
  const folder = join(root, 'WEB4-ITEMS', 'user', 'shop')
  const data = join(root, 'data', 'services', 'shop')
  mkdirSync(folder, { recursive: true })
  const home = configDir ? join(root, configDir) : join(data, 'claude')
  mkdirSync(home, { recursive: true })
  writeFileSync(join(home, '.claude.json'), file, { mode: 0o600 })
  const code = `
    const calls = []
    globalThis.__web4WalledSession = { walledAt: () => ${mode !== 'home'} }
    // the fake helper: records the call and runs the program here (as «the element»); 'refused' — the helper cannot wrap it
    globalThis.__web4ElementWall = { asElement: (root, cwd, prog, args, env) => { calls.push({ prog, args: args.slice(0, 3), env }); return ${mode === 'refused' ? '{ cmd: prog, args }' : "{ cmd: process.execPath, args, wrapped: 'shop' }"} } }
    const kit = require(${JSON.stringify(KIT)})
    const said = kit.markOwnHome('shop', ${JSON.stringify(home)}, [${JSON.stringify(folder)}, ${JSON.stringify(data)}])
    const again = kit.markOwnHome('shop', ${JSON.stringify(home)}, [${JSON.stringify(folder)}, ${JSON.stringify(data)}])
    const install = kit.asWalled('shop', '/usr/local/lib/fractera/bin/claude', ['plugin', 'install', 'telegram@claude-plugins-official'], { CLAUDE_CONFIG_DIR: ${JSON.stringify(home)} })
    process.stdout.write(JSON.stringify({ said, again, calls, install, raw: require('node:fs').readFileSync(${JSON.stringify(join(home, '.claude.json'))}, 'utf8') }))`
  const r = spawnSync(process.execPath, ['-e', code], { cwd: root, encoding: 'utf8' })
  rmSync(root, { recursive: true, force: true })
  assert.equal(r.status, 0, r.stderr)
  const o = JSON.parse(r.stdout)
  let parsed = null
  try { parsed = JSON.parse(o.raw) } catch { /* the unparsed sample */ }
  return { ...o, file: parsed, folder, data }
}
t('839-11/12: behind the wall the element marks its own home — onboarding, theme, trust of its folder and its data folder — keeping its account; the plugin install runs as the element', () => {
  const o = markRun('walled')
  assert.equal(o.file.hasCompletedOnboarding, true); assert.equal(o.file.theme, 'dark')
  assert.equal(o.file.oauthAccount.emailAddress, 'm@x.test')
  assert.equal(o.file.projects[o.folder]?.hasTrustDialogAccepted, true); assert.equal(o.file.projects[o.data]?.hasTrustDialogAccepted, true)
  assert.ok(o.calls[0].prog === 'node' && o.calls[1].prog === 'node', 'the marks are written by the element, not the node')
  assert.match(o.said, /отмечено/); assert.match(o.said, /доверенными/)
  assert.equal(o.again, '', 'a second session finds everything marked and writes nothing')
  assert.equal(o.install.cmd, process.execPath); assert.equal(o.calls[2].env.CLAUDE_CONFIG_DIR.endsWith('claude'), true)
  assert.equal(Object.keys(o.file.projects).some((k) => !k.endsWith('shop')), false, 'only its own two folders — never the repository root')
})
t('negative: walled, but the helper cannot run it as the element — the node never writes the element\'s file itself', () => {
  const o = markRun('refused')
  assert.equal(o.said, ''); assert.equal(o.file.hasCompletedOnboarding, undefined); assert.deepEqual(o.file.projects, {})
})
t('a home computer (no wall): the element\'s own home is marked by the node\'s user, no helper; negative: a home that is not the element\'s own is untouched', () => {
  const o = markRun('home')
  assert.equal(o.calls.length, 0); assert.equal(o.install, null)
  assert.equal(o.file.hasCompletedOnboarding, true); assert.equal(o.file.projects[o.data]?.hasTrustDialogAccepted, true)
  const n = markRun('home', { configDir: 'node-claude-home' })
  assert.equal(n.said, ''); assert.equal(n.file.hasCompletedOnboarding, undefined); assert.deepEqual(n.file.projects, {})
})
t('negative: a file that does not parse (half-written) is left alone', () => {
  const o = markRun('walled', { file: '{"oauthAccount": {"emailAddress": "m@x.te' })
  assert.match(o.said, /не читается/); assert.equal(o.raw, '{"oauthAccount": {"emailAddress": "m@x.te')
})
console.log(`===WALLED_CHANNEL_OK=== ${n} passed`)

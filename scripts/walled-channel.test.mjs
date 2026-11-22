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
console.log(`===WALLED_CHANNEL_OK=== ${n} passed`)

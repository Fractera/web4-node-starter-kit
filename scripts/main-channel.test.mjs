// Node step 781-1/2/5/6: does the main agent's bot hear (the plugin's pid, not a launch flag), the poison of the machine-wide failure
// cache taken out with one key each, the autostart's complete list, the «computer is on» line once per boot. No network, no pm2.
import assert from 'node:assert/strict'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, utimesSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const req = createRequire(import.meta.url)
const health = req(join(ROOT, 'app', '[lang]', '(architectLayer)', 'architect', 'kits', '_agent-kit', 'core', 'server', 'channel-health.cjs'))
const mainChannel = req(join(ROOT, 'lib', 'node', 'main-channel.cjs'))
const bootLine = req(join(ROOT, 'lib', 'node', 'boot-line.cjs'))
const autostart = req(join(ROOT, 'lib', 'node', 'autostart.cjs'))
let passed = 0
const t = (name, fn) => { try { fn(); passed++; console.log(`  ✓ ${name}`) } catch (e) { process.exitCode = 1; console.log(`  ✗ ${name}\n    ${e.message}`) } }
const tmp = () => mkdtempSync(join(tmpdir(), 'main-channel-'))
const DEAD_PID = 2 ** 22 - 3

t('781-2: the poison is taken out — the cache entry removed, the other entries kept', () => {
  const home = tmp()
  writeFileSync(join(home, 'mcp-needs-auth-cache.json'), JSON.stringify({ 'plugin:telegram:telegram': { timestamp: 1, id: 'x' }, 'other-server': { timestamp: 2 } }))
  const out = health.clearPoison({ CLAUDE_CONFIG_DIR: home })
  assert.equal(out.cache, 'removed')
  assert.deepEqual(Object.keys(JSON.parse(readFileSync(join(home, 'mcp-needs-auth-cache.json'), 'utf8'))), ['other-server'])
})
t('781-2: the plugin enabled for the whole machine → false, the settings backed up once, the rest of the file kept', () => {
  const home = tmp()
  const backup = join(tmp(), 'backup.json')
  writeFileSync(join(home, 'settings.json'), JSON.stringify({ theme: 'dark', enabledPlugins: { 'telegram@claude-plugins-official': true, 'other@x': true } }))
  assert.equal(health.clearPoison({ CLAUDE_CONFIG_DIR: home }, backup).global, 'turned-off')
  const s = JSON.parse(readFileSync(join(home, 'settings.json'), 'utf8'))
  assert.deepEqual([s.theme, s.enabledPlugins['telegram@claude-plugins-official'], s.enabledPlugins['other@x']], ['dark', false, true])
  assert.ok(existsSync(backup))
  assert.equal(JSON.parse(readFileSync(backup, 'utf8')).enabledPlugins['telegram@claude-plugins-official'], true, 'the backup keeps the original')
  assert.equal(health.clearPoison({ CLAUDE_CONFIG_DIR: home }, backup).global, 'off', 'a second pass changes nothing')
})
t('781-2: a file we cannot read as an object is left untouched — negative control', () => {
  const home = tmp()
  writeFileSync(join(home, 'mcp-needs-auth-cache.json'), '[1,2]')
  writeFileSync(join(home, 'settings.json'), 'not json')
  const out = health.clearPoison({ CLAUDE_CONFIG_DIR: home })
  assert.deepEqual(out, { cache: 'unknown', global: 'unknown' })
  assert.equal(readFileSync(join(home, 'settings.json'), 'utf8'), 'not json')
})
t('781-1: the plugin hears only with a live pid written after the session\'s start', () => {
  const dir = tmp()
  writeFileSync(join(dir, 'bot.pid'), String(process.pid))
  assert.equal(health.pluginPid(dir, Date.now() - 5000)?.pid, process.pid)
  const old = (Date.now() - 60_000) / 1000
  utimesSync(join(dir, 'bot.pid'), old, old)
  assert.equal(health.pluginPid(dir, Date.now()), null, 'a pid file older than the session (a killed session never erases it) is not hearing')
  writeFileSync(join(dir, 'bot.pid'), String(DEAD_PID))
  assert.equal(health.pluginPid(dir, 0), null, 'a dead pid is not hearing')
})

function node({ bot = true, running = false, pid = null, state = null } = {}) {
  const root = tmp()
  const svc = join(root, 'data', 'services', 'build')
  const tg = join(svc, 'channel', 'telegram')
  mkdirSync(tg, { recursive: true })
  if (bot) { writeFileSync(join(tg, '.env'), 'TELEGRAM_BOT_TOKEN=123:abc\n'); writeFileSync(join(tg, 'access.json'), JSON.stringify({ allowFrom: ['1'] })) }
  writeFileSync(join(svc, 'session-mode.json'), JSON.stringify({ running }))
  if (pid) writeFileSync(join(tg, 'bot.pid'), String(pid))
  if (state) writeFileSync(join(svc, 'channel-state.json'), JSON.stringify({ state, why: 'test', at: new Date().toISOString() }))
  return root
}
t('781-1: the answer — no bot · asleep · hears · deaf · healing · failed', () => {
  assert.equal(mainChannel.health(node({ bot: false })).state, 'no-bot')
  assert.equal(mainChannel.health(node()).state, 'asleep')
  assert.equal(mainChannel.health(node({ running: true, pid: process.pid })).state, 'hears')
  assert.equal(mainChannel.health(node({ running: true, pid: DEAD_PID })).state, 'deaf', 'the 2026-11-18 case: a live session, no plugin, the bridge silent')
  assert.equal(mainChannel.health(node({ running: true, state: 'healing' })).state, 'healing')
  assert.equal(mainChannel.health(node({ running: false, state: 'failed' })).state, 'failed')
})
t('781-4: the red band shows only in trouble — a hearing or sleeping agent shows nothing', () => {
  assert.equal(mainChannel.trouble({ state: 'hears' }), false)
  assert.equal(mainChannel.trouble({ state: 'asleep' }), false)
  for (const s of ['deaf', 'healing', 'failed']) assert.equal(mainChannel.trouble({ state: s }), true, s)
})
t('781-6: «the computer is on» — once after a fresh boot, silent on the next core start and after a long uptime', () => {
  const root = tmp()
  const now = Date.now()
  assert.equal(bootLine.firstAfterBoot(root, { uptimeS: 90, now }).first, true)
  assert.equal(bootLine.firstAfterBoot(root, { uptimeS: 600, now: now + 510_000 }).first, false, 'the same boot — a rebuild later is silent')
  assert.equal(bootLine.firstAfterBoot(tmp(), { uptimeS: 3 * 3600, now }).first, false, 'a core started hours after the boot is not «the computer is on»')
})
t('781-6: the line names the agent\'s state and a missing autostart', () => {
  const root = node({ running: true, pid: process.pid })
  const s = bootLine.text(root, 'ru', Date.now())
  assert.match(s, /Компьютер включился/)
  assert.match(s, /слышит вас/)
})
t('781-5: the complete list — the core and every element that is on; an element that is off is not waited for', () => {
  const root = tmp()
  mkdirSync(join(root, 'WEB4-ITEMS-REGISTRY'), { recursive: true })
  mkdirSync(join(root, 'lib', 'web4-items'), { recursive: true })
  writeFileSync(join(root, 'lib', 'web4-items', 'element-power.cjs'), readFileSync(join(ROOT, 'lib', 'web4-items', 'element-power.cjs')))
  writeFileSync(join(root, 'WEB4-ITEMS-REGISTRY', 'web4-items.json'), JSON.stringify({ services: [{ id: 'auth' }, { id: 'stripe', off: { reason: 'no keys yet' } }] }))
  assert.deepEqual(autostart.expected(root), ['fractera-web4', 'fractera-svc-auth'])
})

console.log(`main-channel: ${passed} passed${process.exitCode ? ', FAILED' : ''}`)

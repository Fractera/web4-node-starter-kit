// Node step 771: «Пульт узла» in Telegram — the page carries no data and no markup from the node; the main bot's menu button follows the
// node's HTTPS address (own domain, else a live temporary address) and falls back to the command menu without one.
import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const req = createRequire(import.meta.url)
const page = req(join(ROOT, 'lib', 'node', 'tg-app', 'page.cjs'))
const menu = req(join(ROOT, 'lib', 'node', 'tg-menu.cjs'))
let passed = 0
const t = async (name, fn) => { try { await fn(); passed++; console.log(`  ✓ ${name}`) } catch (e) { process.exitCode = 1; console.log(`  ✗ ${name}\n    ${e.message}`) } }
const tmp = mkdtempSync(join(tmpdir(), 'tg-app-'))
const put = (p, text) => { mkdirSync(dirname(join(tmp, p)), { recursive: true }); writeFileSync(join(tmp, p), text) }

await t('the page: noindex, data-block on its containers, both languages, no node data inside (it comes by the signed call)', () => {
  const ru = page.html('ru')
  assert.ok(ru.includes('noindex') && ru.includes('data-block="tg-app"') && ru.includes('Пульт узла'))
  assert.ok(page.html('en').includes('Node panel'))
  assert.ok(!/fractera-svc|SETTINGS_SECRET|TELEGRAM_BOT_TOKEN/.test(ru), 'no names of the node\'s wiring')
  assert.ok(ru.includes('textContent') && !/innerHTML\s*=/.test(ru), 'the node\'s words are put as text, never as markup')
})

put('data/services/build/channel/telegram/.env', 'TELEGRAM_BOT_TOKEN=123:TEST\n')
put('data/services/build/channel/telegram/access.json', JSON.stringify({ allowFrom: ['90413601'] }))
put('data/services/build/channel/telegram/person.json', JSON.stringify({ lang: 'ru' }))
const seen = []
const stub = async (token, m) => { seen.push({ token, m }); return { ok: true } }

await t('no HTTPS address — the button goes back to the command menu (negative control: never a dead web_app)', async () => {
  const r = await menu.refresh(tmp, { fetchImpl: stub })
  assert.equal(r.state, 'commands')
  assert.deepEqual(seen.pop().m, { type: 'commands' })
})
await t('a live temporary address — «Пульт» opens the panel there, in the person\'s language', async () => {
  put('logs/tunnel.json', JSON.stringify({ url: 'https://abc-def.trycloudflare.com', dead: false }))
  const r = await menu.refresh(tmp, { fetchImpl: stub })
  assert.equal(r.state, 'panel')
  assert.deepEqual(seen.pop().m, { type: 'web_app', text: 'Пульт', web_app: { url: 'https://abc-def.trycloudflare.com/api/node/tg-app?lang=ru' } })
})
await t('a dead temporary address — back to commands (negative control)', async () => {
  put('logs/tunnel.json', JSON.stringify({ url: 'https://abc-def.trycloudflare.com', dead: true }))
  assert.equal((await menu.refresh(tmp, { fetchImpl: stub })).state, 'commands')
})
await t('the own domain wins over a temporary address', async () => {
  put('logs/tunnel.json', JSON.stringify({ url: 'https://abc-def.trycloudflare.com', dead: false }))
  put('logs/domain.json', JSON.stringify({ zone: 'example.org', activatedAt: '2026-11-16T00:00:00Z' }))
  assert.equal((await menu.refresh(tmp, { fetchImpl: stub })).url, 'https://example.org/api/node/tg-app?lang=ru')
})
await t('no bot — nothing is called (negative control)', async () => {
  rmSync(join(tmp, 'data', 'services', 'build', 'channel', 'telegram', '.env'))
  const before = seen.length
  assert.equal((await menu.refresh(tmp, { fetchImpl: stub })).state, 'no-bot')
  assert.equal(seen.length, before)
})

rmSync(tmp, { recursive: true, force: true })
console.log(process.exitCode ? `===TG_APP_FAILED=== ${passed} passed` : `===TG_APP_OK=== ${passed} passed`)

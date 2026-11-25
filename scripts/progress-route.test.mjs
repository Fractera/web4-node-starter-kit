// 615-7 (Roma 2026-11-25, Telegram 1383): an element's drafts follow the chat its turn came from. The person writes to the element's own
// bot → its own chat, even while the main agent leads it; the main agent's task → the main chat (negative control: the old road stays).
import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const req = createRequire(import.meta.url)
const progress = req(join(dirname(fileURLToPath(import.meta.url)), '..', 'lib', 'agent-kit', 'progress.cjs'))
let failed = 0
const t = async (name, fn) => { try { await fn(); console.log(`  ✓ ${name}`) } catch (e) { failed += 1; console.log(`  ✗ ${name}\n    ${e.message}`) } }

const root = mkdtempSync(join(tmpdir(), 'progress-route-'))
const put = (p, text) => { mkdirSync(dirname(join(root, p)), { recursive: true }); writeFileSync(join(root, p), text) }
for (const id of ['build', 'shop']) {
  put(`data/services/${id}/channel/telegram/.env`, `TELEGRAM_BOT_TOKEN=1:${id}-token\n`)
  put(`data/services/${id}/channel/telegram/access.json`, JSON.stringify({ allowFrom: ['111'] }))
}
put('data/node/woken-by-main.json', JSON.stringify({ shop: { at: Date.now() } }))

await t('the person wrote in the element\'s own bot — the drafts go to its own chat, though the main agent leads it', async () => {
  await progress.onPrompt(root, 'shop', { prompt: '<channel source="plugin:telegram:telegram" chat_id="111">привет</channel>' })
  assert.equal(progress.route(root, 'shop').bot, 'shop')
})
await t('negative: the main agent\'s task in the same element — the main chat, as before', async () => {
  await progress.onPrompt(root, 'shop', { prompt: '⟦node · task · shop⟧ check the cards' })
  assert.equal(progress.route(root, 'shop').bot, 'build')
})
await t('a closed turn no longer pins the own chat', async () => {
  await progress.onPrompt(root, 'shop', { prompt: '<channel source="plugin:telegram:telegram">x</channel>' })
  put('data/node/progress/turn-shop.json', JSON.stringify({ at: Date.now(), replies: [], own: true, closed: Date.now() }))
  assert.equal(progress.route(root, 'shop').bot, 'build')
})
await t('the main agent itself never takes the element\'s road', async () => {
  await progress.onPrompt(root, 'build', { prompt: '<channel source="plugin:telegram:telegram">x</channel>' })
  assert.equal(progress.route(root, 'build').bot, 'build')
})

rmSync(root, { recursive: true, force: true })
if (failed) { console.log(`===TEST_PROGRESS_ROUTE_FAILED=== ${failed}`); process.exit(1) }
console.log('===TEST_PROGRESS_ROUTE_OK===')

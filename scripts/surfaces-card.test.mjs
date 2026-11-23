// Node step 848-2: an element's session starts with the card of its surfaces — site, Telegram Mini App by kinds, bot — five short lines
// read from files, no model; the main agent gets none (its cost never grows with the node). `node scripts/surfaces-card.test.mjs`.
import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const { surfacesText } = createRequire(import.meta.url)(join(ROOT, 'lib', 'agent-kit', 'modes.cjs'))
const tmp = mkdtempSync(join(tmpdir(), 'surfaces-'))
const put = (p, v) => { mkdirSync(dirname(join(tmp, p)), { recursive: true }); writeFileSync(join(tmp, p), JSON.stringify(v)) }
let passed = 0
const t = (name, fn) => { try { fn(); passed++; console.log(`  ✓ ${name}`) } catch (e) { process.exitCode = 1; console.log(`  ✗ ${name}\n    ${e.message}`) } }

const dir = join(tmp, 'WEB4-ITEMS', 'user', 'diana')
put('data/services/cmdfc/address.json', { address: 'diana' })
put('logs/domain.json', { zone: 'aifa.dev' })
put('WEB4-ITEMS/user/diana/app/[lang]/(protectedLayer)/tg/_data/menu.json', { modes: [{ id: 'work', groups: [{ items: [{ slug: '', kind: 'stats' }, { slug: 'projects', kind: 'chat' }, { slug: 'start' }] }] }], common: [] })
put('data/services/cmdfc/channel/telegram/bot.json', { name: 'Diana', username: 'cmdfc_messenger_h2a_726zl_bot' })
put('logs/tg-menu-elements.json', { cmdfc: { state: 'mini-app' } })

t('848-2: the card names the site, the Mini App with its kinds and the bot with its button', () => {
  const c = surfacesText('cmdfc', dir, tmp)
  assert.match(c, /^# Your surfaces/)
  assert.ok(c.includes('site: https://diana.aifa.dev'), c)
  assert.ok(c.includes('Telegram Mini App: https://diana.aifa.dev/tg · 3 items: stats 1, chat 1, none 1'), c)
  assert.ok(c.includes('bot: @cmdfc_messenger_h2a_726zl_bot · its menu button opens the Mini App'), c)
  assert.ok(c.includes('npm run pages -- cmdfc'), c)
  assert.ok(c.length < 600, `the card is small: ${c.length} characters`)
})
t('a work session of the element gets the same card', () => {
  assert.equal(surfacesText('cmdfc--work', dir, tmp), surfacesText('cmdfc', dir, tmp))
})
t('negative: the main agent gets no card — no list of elements on wake', () => {
  assert.equal(surfacesText('build', ROOT, tmp), '')
})
t('negative: no domain, no Mini App, no bot — said plainly, nothing invented', () => {
  const bare = join(tmp, 'WEB4-ITEMS', 'user', 'bare')
  mkdirSync(bare, { recursive: true })
  const c = surfacesText('bare', bare, join(tmp, 'nowhere'))
  assert.ok(c.includes('site: no public address yet') && c.includes('Telegram Mini App: none in this folder') && c.includes('bot: not connected'), c)
})
rmSync(tmp, { recursive: true, force: true })
console.log(process.exitCode ? '\n===SURFACES_CARD_FAILED===' : `\n===SURFACES_CARD_OK=== ${passed} passed`)

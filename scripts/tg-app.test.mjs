// Node step 771: «Пульт узла» in Telegram — the page carries no data and no markup from the node; the main bot's menu button follows the
// node's HTTPS address (own domain, else a live temporary address) and falls back to the command menu without one.
import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
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

await t('818: a node update shows on the Pult with its stage, and the main agent offers no «Разбудить» meanwhile (negative: no update — nothing)', () => {
  const ru = page.html('ru')
  const at = ru.indexOf('function updating(u)'), end = ru.indexOf('function builds(', at)
  assert.ok(at > 0 && end > at, 'the update banner exists')
  const W = req(join(ROOT, 'lib', 'node', 'tg-app', 'words.cjs')).ru
  const el = (tag, cls, text) => ({ cls, textContent: text ?? '', kids: [], attrs: {}, setAttribute(k, v) { this.attrs[k] = v }, appendChild(c) { this.kids.push(c) } })
  const updating = new Function('el', 'W', `${ru.slice(at, end)}; return updating`)(el, W)
  const box = updating({ running: true, stage: 'элементы', since: '2026-11-21T00:10:00Z' })
  assert.equal(box.attrs['data-block'], 'tg-app-node-update')
  assert.match(box.kids[0].textContent, /^Узел обновляется — этап «элементы» с /)
  assert.equal(updating(null), null)
  assert.equal(updating({ running: false }), null)
  assert.ok(ru.includes('mainAgent(s.main,!!up)') && ru.includes('var cr=busy?null:chanRow(a)'), 'no wake button while the node updates')
})

await t('816: the top line carries the node\'s name from CONFIG, the line below — «Локальный компьютер» or «VPS · host» (negatives: no name, no place)', () => {
  const ru = page.html('ru')
  const at = ru.indexOf('var nd=s.node'), end = ru.indexOf("W.placeHome:'';", at) + "W.placeHome:'';".length
  assert.ok(at > 0 && end > at, 'the header is filled from the state')
  const W = req(join(ROOT, 'lib', 'node', 'tg-app', 'words.cjs')).ru
  const show = (node) => {
    const els = { title: { textContent: '' }, where: { textContent: '' } }
    new Function('s', 'W', 'document', ru.slice(at, end))({ node }, W, { getElementById: (id) => els[id] })
    return [els.title.textContent, els.where.textContent]
  }
  assert.deepEqual(show({ name: 'Fractera', place: 'home', web: null }), ['Пульт узла · Fractera', 'Локальный компьютер'])
  assert.deepEqual(show({ name: 'Fractera', place: 'server', web: 'https://architect.fractera.ai' }), ['Пульт узла · Fractera', 'VPS · architect.fractera.ai'])
  assert.deepEqual(show({ name: null, place: 'server', web: null }), ['Пульт узла', 'VPS'])
  assert.deepEqual(show({ name: '', place: 'unknown', web: null }), ['Пульт узла', ''])
  assert.ok(ru.includes('id="where"') && ru.includes('data-block="tg-app-where"'))
})

await t('the tunnel\'s revival puts «Пульт» back (✗ 2026-11-20 18:17: the verdict was lifted, the default menu stayed — Telegram 268)', () => {
  const src = readFileSync(join(ROOT, 'scripts', 'tunnel.mjs'), 'utf8')
  const at = src.indexOf("log('туннель снова отвечает — приговор снят')")
  assert.ok(at > 0, 'the revival line')
  const next = src.indexOf('} else if (failures > 0)', at)
  assert.ok(/tg-menu\.cjs'\)\.refresh\(root\)/.test(src.slice(at, next)), 'the revival refreshes the menu button')
})

put('data/services/build/channel/telegram/.env', 'TELEGRAM_BOT_TOKEN=123:TEST\n')
put('data/services/build/channel/telegram/access.json', JSON.stringify({ allowFrom: ['90413601'] }))
put('data/services/build/channel/telegram/person.json', JSON.stringify({ lang: 'ru' }))
const seen = []
const stub = async (token, m, chat) => { seen.push({ token, m, chat }); return { ok: true } }

await t('no HTTPS address — the button goes back to the bot\'s default menu (negative control: never a dead web_app)', async () => {
  const r = await menu.refresh(tmp, { fetchImpl: stub })
  assert.equal(r.state, 'default')
  assert.deepEqual(seen.pop().m, { type: 'default' })
})
await t('a live temporary address — «Пульт» opens the panel there, in the person\'s language', async () => {
  put('logs/tunnel.json', JSON.stringify({ url: 'https://abc-def.trycloudflare.com', dead: false }))
  const r = await menu.refresh(tmp, { fetchImpl: stub })
  assert.equal(r.state, 'panel')
  assert.equal(seen[seen.length - 1].chat, 90413601, 'set per allowed chat')
  assert.deepEqual(seen.pop().m, { type: 'web_app', text: 'Пульт', web_app: { url: 'https://abc-def.trycloudflare.com/api/node/tg-app?lang=ru' } })
})
await t('a dead temporary address — back to commands (negative control)', async () => {
  put('logs/tunnel.json', JSON.stringify({ url: 'https://abc-def.trycloudflare.com', dead: true }))
  assert.equal((await menu.refresh(tmp, { fetchImpl: stub })).state, 'default')
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

await t('778: an element bot opens the element\'s Mini App (<its HTTPS address>/tg) per allowed chat; a loopback address — the default menu; no bot — no-bot', async () => {
  const el = 'el778'
  put(`data/services/${el}/channel/telegram/.env`, 'TELEGRAM_BOT_TOKEN=123456:ABCDEFGHIJKLMNOPQRSTUVWXYZabcdef_-12\n')
  put(`data/services/${el}/channel/telegram/access.json`, JSON.stringify({ allowFrom: ['111', '222'] }))
  put(`items/${el}/.env.local`, 'PROJECT_SITE_URL=https://el778.example.com/\n')
  const dirOf = (id) => join(tmp, 'items', id)
  const seen = []
  const r = await menu.refreshElement(tmp, el, { dirOf, fetchImpl: async (_token, m, chat) => { seen.push([chat, m]); return { ok: true } } })
  assert.equal(r.ok, true)
  assert.equal(r.state, 'mini-app')
  assert.equal(r.url, 'https://el778.example.com/tg')
  assert.deepEqual(seen.map(([c]) => c), [111, 222])
  assert.equal(seen[0][1].type, 'web_app')
  assert.equal(seen[0][1].web_app.url, 'https://el778.example.com/tg')
  put(`items/${el}/.env.local`, 'PROJECT_SITE_URL=http://localhost:24683\n')
  const seen2 = []
  const r2 = await menu.refreshElement(tmp, el, { dirOf, fetchImpl: async (_t, m, c) => { seen2.push([c, m]); return { ok: true } } })
  assert.equal(r2.state, 'default')
  assert.equal(seen2[0][1].type, 'default')
  const r3 = await menu.refreshElement(tmp, 'nobot778', { dirOf, fetchImpl: async () => ({ ok: true }) })
  assert.equal(r3.state, 'no-bot')
  const r4 = await menu.refreshElement(tmp, 'build', { dirOf, fetchImpl: async () => ({ ok: true }) })
  assert.equal(r4.state, 'not-an-element')
})

const choice = req(join(ROOT, 'lib', 'node', 'tg-app', 'model-choice.cjs'))
const warn = req(join(ROOT, 'lib', 'agent-kit', 'ultracode-warning.cjs'))

await t('779 P1: the Pult\'s model choice — Opus keeps its effort, Sonnet/Haiku run on medium, Ultracode is Opus · max', () => {
  assert.deepEqual(choice.modelChoice({ model: 'opus', effort: 'xhigh' }), { ok: true, model: 'opus', effort: 'xhigh', ultracode: false })
  assert.deepEqual(choice.modelChoice({ model: 'sonnet', effort: 'max' }), { ok: true, model: 'sonnet', effort: 'medium', ultracode: false })
  assert.deepEqual(choice.modelChoice({ model: 'opus', ultracode: true, confirmed: true }), { ok: true, model: 'opus', effort: 'max', ultracode: true })
})
await t('779 P1: refusals — a bad model or effort, Ultracode without the person\'s confirmation or off Opus (negative controls)', () => {
  assert.equal(choice.modelChoice({ model: 'gpt' }).reason, 'bad-model')
  assert.equal(choice.modelChoice({ model: 'opus', effort: 'ultra' }).reason, 'bad-effort')
  assert.equal(choice.modelChoice({ model: 'opus' }).reason, 'bad-effort', 'Opus needs its effort named')
  assert.equal(choice.modelChoice({ model: 'opus', ultracode: true }).reason, 'ultracode-needs-confirmation')
  assert.equal(choice.modelChoice({ model: 'opus', ultracode: true, confirmed: 'yes' }).reason, 'ultracode-needs-confirmation', 'only a real true confirms')
  assert.equal(choice.modelChoice({ model: 'haiku', ultracode: true, confirmed: true }).reason, 'bad-model')
  assert.equal(choice.modelChoice(null).reason, 'bad-model')
})
await t('779: one Ultracode warning for the bot and the Pult, in the owner\'s words, within Telegram\'s popup limit (1–256)', () => {
  for (const l of ['ru', 'en']) {
    const w = warn.warning(l)
    assert.ok(w.length >= 1 && w.length <= 256, `${l}: ${w.length}`)
    assert.ok(page.html(l).includes(JSON.stringify(w).slice(1, -1)), `${l}: the Pult carries the same text`)
  }
  assert.ok(warn.warning('ru').includes('200 $') && warn.warning('ru').includes('любое количество агентов'))
})
await t('779: the Pult\'s card — two lists, Ultracode glows, the popup with «Отмена» and «Включить Ultracode», reduced motion stops the pulse', () => {
  const ru = page.html('ru')
  assert.ok(ru.includes('tg-app-model-pick') && ru.includes("'ultracode','Ultracode'") && ru.includes('.opt.ultra::after'))
  assert.ok(ru.includes("web_app_open_popup") && ru.includes("type:'cancel'") && ru.includes("type:'destructive'") && ru.includes('Включить Ultracode'))
  assert.ok(/prefers-reduced-motion:reduce\)\{[^}]*\.opt\.ultra::after\{animation:none/.test(ru), 'the pulse stops for reduced motion')
  assert.ok(ru.includes('receiveEvent') && ru.includes('popup_closed'), 'the popup\'s answer is heard')
})

await t('780: «+ Новый элемент» — the last row of «Ваши», one field, the words go as the person\'s request (head pult-request), the Pult closes after', () => {
  const ru = page.html('ru')
  assert.ok(ru.includes('tg-app-new-element') && ru.includes('Что должен делать новый элемент?') && ru.includes("action:'newElement'"))
  assert.ok(/newElement',text:v\}\)\.then[\s\S]{0,200}web_app_close/.test(ru), 'the Pult closes so the answer in the chat is seen')
  const nl = req(join(ROOT, 'lib', 'agent-kit', 'node-line.cjs'))
  assert.ok(nl.parse(nl.head('pult-request', 'build') + 'x'), 'the kind is known to the node')
})

rmSync(tmp, { recursive: true, force: true })
console.log(process.exitCode ? `===TG_APP_FAILED=== ${passed} passed` : `===TG_APP_OK=== ${passed} passed`)

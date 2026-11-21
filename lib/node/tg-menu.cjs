'use strict'
// THE MAIN BOT'S MENU BUTTON OPENS «ПУЛЬТ УЗЛА» (node step 771-3). The owner, 2026-11-16 23:13, to «кнопка меню … сама переставляется,
// когда меняется временный адрес … даёшь слово на автоматическую перестановку?»: «Хорошо продолжай работать до конца». The button
// (Bot API `setChatMenuButton`) is a web_app pointing at the node's HTTPS address — its own domain, else the live temporary address;
// none — back to the bot's default menu, so a dead address never sits behind it. Set PER ALLOWED CHAT (the architect's): ✗ measured
// 2026-11-16 23:30 — the bot-wide default answered ok and still read back «commands»; the per-chat button holds and reads back.
// It moves by itself only where the address is written: the tunnel's one writer (`scripts/tunnel.mjs` saveAddress) and the command
// `npm run tg-app -- menu`. No model, no polling; the token never leaves this module.
const fs = require('node:fs')
const path = require('node:path')
const tg = require('./person-asks-telegram.cjs')

const LOG = (root) => path.join(root, 'logs', 'tg-menu.json')

function langOf(root) {
  try { const l = JSON.parse(fs.readFileSync(path.join(root, 'data', 'services', 'build', 'channel', 'telegram', 'person.json'), 'utf8')).lang; return typeof l === 'string' && l.startsWith('ru') ? 'ru' : 'en' } catch { return 'en' }
}

/** The address the button opens, or null — `{ url, text }`. */
function target(root) {
  const base = tg.httpsBase(root)
  if (!base) return null
  const lang = langOf(root)
  return { url: `${base}/api/node/tg-app?lang=${lang}`, text: lang === 'ru' ? 'Пульт' : 'Panel' }
}

async function call(token, method, body) {
  const r = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(10_000),
  })
  const j = await r.json().catch(() => null)
  return j?.ok ? { ok: true, result: j.result } : { ok: false, why: j?.description ?? `HTTP ${r.status}` }
}

/** Set the main bot's menu button to the panel (or back to commands without an HTTPS address). Resolves `{ ok, state, url?, why? }`. */
async function refresh(root, { fetchImpl = null } = {}) {
  const b = tg.bot(root, 'build')
  if (!b) return { ok: false, state: 'no-bot' }
  const t = target(root)
  const menu = t ? { type: 'web_app', text: t.text, web_app: { url: t.url } } : { type: 'default' }
  let out = { ok: true }
  for (const chat of b.chats) {
    const chatId = /^-?\d+$/.test(chat) ? Number(chat) : chat
    let r
    try { r = fetchImpl ? await fetchImpl(b.token, menu, chatId) : await call(b.token, 'setChatMenuButton', { chat_id: chatId, menu_button: menu }) } catch (e) { r = { ok: false, why: e instanceof Error ? e.message : String(e) } }
    if (!r.ok) out = r
  }
  const rec = { at: new Date().toISOString(), ok: out.ok, state: t ? 'panel' : 'default', chats: b.chats.length, host: t ? new URL(t.url).host : null, why: out.ok ? null : out.why }
  try { fs.mkdirSync(path.dirname(LOG(root)), { recursive: true }); fs.writeFileSync(LOG(root), `${JSON.stringify(rec)}\n`) } catch { /* the record is a courtesy */ }
  return { ok: out.ok, state: rec.state, ...(t ? { url: t.url } : {}), ...(out.ok ? {} : { why: out.why }) }
}

// ── 778: AN ELEMENT'S BOT OPENS THE ELEMENT'S MINI APP ─────────────────────────────────────────────────────────────────────────
// The owner, 2026-11-17 (the plan of 778, «да» 18:19): «Ядро: кнопка меню бота элемента открывает его /tg». The address is the one the
// installer gave the element — `PROJECT_SITE_URL` in its own `.env.local` (its public HTTPS address on the node's own domain) — plus
// `/tg`, the branch of its template (closed by the element's admin role). No such address (no own domain yet, a loopback one) — the
// bot's default menu: a dead or local address never sits behind the button. Set PER ALLOWED CHAT, as the main bot's (771-3).
// It is set when the element's bot admits a person (the agent kit's `telegram.cjs`) and by `npm run tg-app -- menu <id>`.
const paths = require('../web4-items/paths.cjs')
const ELEMENT_LOG = (root) => path.join(root, 'logs', 'tg-menu-elements.json')

/**
 * 787-2: the element's public HTTPS site, or null — no address, or a loopback one. 829-2 (✗ 2026-11-21, j58fl, the owner: «Telegram
 * приложение нету почему»): the node's own record comes first — its domain (`logs/domain.json`, `publicAuth`) and the element's address,
 * the installer's own formula for `PROJECT_SITE_URL` (services-install.mjs): the custom template never declares that variable, so no
 * custom element's bot ever got its «Приложение». The element's own `PROJECT_SITE_URL` stays the answer where the node has no such record.
 */
function elementSite(root, id, dirOf = (x) => paths.itemDir(x, 'user')) {
  let pub = null
  try { pub = require('../domain/public-auth.cjs').publicAuth(root) } catch { /* no domain record */ }
  if (pub && pub.architectHost) return id === 'root' ? `https://${pub.siteHost}` : `https://${paths.addressOf(id, root) ?? id}.${pub.zone}`
  let site = ''
  try {
    const dir = dirOf(id)
    site = (fs.readFileSync(path.join(dir, '.env.local'), 'utf8').match(/^PROJECT_SITE_URL=(.*)$/m)?.[1] ?? '').trim()
  } catch { /* no folder or no env — no address */ }
  return /^https:\/\//.test(site) ? site.replace(/\/+$/, '') : null
}

/** 824: whether the element HAS a Mini App — its template's menu `app/[lang]/(protectedLayer)/tg/_data/menu.json`. The owner,
 *  2026-11-21 (Telegram 484): «на корни у нас не будет мини Apple … Мини приложения это часть относящиеся только к основному шаблону …
 *  не относится к нативным» — root and native elements work through the chat; asked by the file, never by an id. */
function hasMiniApp(id, dirOf = (x) => paths.itemDir(x, 'user')) {
  try { return fs.existsSync(path.join(dirOf(id), 'app', '[lang]', '(protectedLayer)', 'tg', '_data', 'menu.json')) } catch { return false }
}

/** The element's Mini App address, or null: `{ url, text }` — null without an HTTPS site or without a Mini App of its own (824). */
function elementTarget(root, id, dirOf = (x) => paths.itemDir(x, 'user')) {
  if (!hasMiniApp(id, dirOf)) return null
  const site = elementSite(root, id, dirOf)
  if (!site) return null
  const lang = langOf(root)
  return { url: `${site}/tg`, text: lang === 'ru' ? 'Приложение' : 'App' }
}

/** Set an element bot's menu button to the element's Mini App (or back to commands without an HTTPS address). */
async function refreshElement(root, id, { fetchImpl = null, dirOf = undefined } = {}) {
  if (!id || id === 'build') return { ok: false, state: 'not-an-element' }
  const b = tg.bot(root, id)
  if (!b) return { ok: false, state: 'no-bot' }
  const t = elementTarget(root, id, dirOf)
  const menu = t ? { type: 'web_app', text: t.text, web_app: { url: t.url } } : { type: 'default' }
  let out = { ok: true }
  for (const chat of b.chats) {
    const chatId = /^-?\d+$/.test(chat) ? Number(chat) : chat
    let r
    try { r = fetchImpl ? await fetchImpl(b.token, menu, chatId) : await call(b.token, 'setChatMenuButton', { chat_id: chatId, menu_button: menu }) } catch (e) { r = { ok: false, why: e instanceof Error ? e.message : String(e) } }
    if (!r.ok) out = r
  }
  const rec = { at: new Date().toISOString(), ok: out.ok, state: t ? 'mini-app' : 'default', chats: b.chats.length, host: t ? new URL(t.url).host : null, why: out.ok ? null : out.why }
  try {
    let all = {}
    try { all = JSON.parse(fs.readFileSync(ELEMENT_LOG(root), 'utf8')) } catch { /* first record */ }
    all[id] = rec
    fs.mkdirSync(path.dirname(ELEMENT_LOG(root)), { recursive: true })
    fs.writeFileSync(ELEMENT_LOG(root), `${JSON.stringify(all, null, 2)}\n`)
  } catch { /* the record is a courtesy */ }
  return { ok: out.ok, state: rec.state, ...(t ? { url: t.url } : {}), ...(out.ok ? {} : { why: out.why }) }
}

/** What Telegram holds now for the first allowed chat (getChatMenuButton) — for the command's status, never the token. */
async function status(root) {
  const b = tg.bot(root, 'build')
  if (!b) return { ok: false, state: 'no-bot' }
  const chat = b.chats[0]
  const r = await call(b.token, 'getChatMenuButton', { chat_id: /^-?\d+$/.test(chat) ? Number(chat) : chat }).catch((e) => ({ ok: false, why: String(e) }))
  return r.ok ? { ok: true, button: r.result } : { ok: false, why: r.why }
}

module.exports = { refresh, status, target, refreshElement, elementTarget, elementSite, hasMiniApp }

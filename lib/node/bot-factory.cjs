'use strict'
// THE NODE'S BOT FACTORY (node step 798; the owner, 2026-11-18, Telegram 786: «мне нужно системное решение … как люди это будут
// делать? Партнёры?»). Every node — this one, a partner's, a dedicated server — keeps its OWN factory: one bot the person makes once in
// @BotFather with «Bot Management Mode» on; every other bot of the node (the main one, the elements') is then made by one tap in
// Telegram's own window and its token comes here, never through a chat. No shared Fractera factory: it would hold every person's bot keys
// and be a single point of failure (CLAUDE.md §2).
//
// Primary source (read 2026-11-18): https://core.telegram.org/bots/features#managed-bots — the link
// `https://t.me/newbot/{manager}/{new_username}?name={new_name}`; the manager receives the update `managed_bot` (ManagedBotUpdated:
// `user` the creator, `bot` the new bot) and takes the token by `getManagedBotToken(user_id)`; `replaceManagedBotToken(user_id)` reissues
// it (https://core.telegram.org/bots/api#getmanagedbottoken). `getMe.can_manage_bots` says the mode is on.
//
// 🔒 The token is a secret: kept in `data/node/bot-factory.json` (0600, outside git), never logged, never returned — only its last 4.
// 🔒 The factory talks to nobody: the node polls it only while a creation waits (`allowed_updates: ["managed_bot"]`), no resident process.

const fs = require('node:fs')
const path = require('node:path')

const TOKEN_SHAPE = /^\d{6,}:[A-Za-z0-9_-]{30,}$/
const USERNAME = /^[A-Za-z][A-Za-z0-9_]{3,30}[Bb][Oo][Tt]$/
const file = (root) => path.join(root, 'data', 'node', 'bot-factory.json')
const offsetFile = (root) => path.join(root, 'data', 'node', 'bot-factory-offset.json')

function readJson(f, fallback) {
  try { return JSON.parse(fs.readFileSync(f, 'utf8')) } catch { return fallback }
}
function writeSecret(f, text) {
  fs.mkdirSync(path.dirname(f), { recursive: true })
  fs.writeFileSync(f, text, { mode: 0o600 })
  try { fs.chmodSync(f, 0o600) } catch { /* Windows */ }
}

/** One Bot API call; `fetchImpl` is replaced by the test. Never throws: `{ ok:false, description }`. */
async function tg(token, method, params, fetchImpl = globalThis.fetch, ms = 15_000) {
  try {
    const res = await fetchImpl(`https://api.telegram.org/bot${token}/${method}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(params ?? {}), signal: AbortSignal.timeout(ms),
    })
    return (await res.json().catch(() => null)) ?? { ok: false, description: 'bad-answer' }
  } catch {
    return { ok: false, description: 'unreachable' }
  }
}

/**
 * Keep the factory's token, after Telegram itself said it is a bot with Bot Management Mode on. Anything else keeps nothing:
 * `bad-format` · `telegram-unreachable` · `token-rejected` · `management-off` (the bot exists, the switch is not on — its username back).
 */
async function save(root, raw, fetchImpl) {
  const token = String(raw ?? '').trim()
  if (!TOKEN_SHAPE.test(token)) return { ok: false, error: 'bad-format' }
  const me = await tg(token, 'getMe', {}, fetchImpl)
  if (me.description === 'unreachable') return { ok: false, error: 'telegram-unreachable' }
  if (!me.ok || !me.result?.is_bot || !me.result?.username) return { ok: false, error: 'token-rejected' }
  if (me.result.can_manage_bots !== true) return { ok: false, error: 'management-off', username: me.result.username }
  writeSecret(file(root), JSON.stringify({ token, id: me.result.id, username: me.result.username, name: me.result.first_name ?? '', savedAt: new Date().toISOString() }, null, 2))
  return { ok: true, username: me.result.username, tail: token.slice(-4) }
}

/** The factory as the page may see it — never the token. `live` asks Telegram again whether the mode is still on. */
async function state(root, { live = false } = {}, fetchImpl) {
  const f = readJson(file(root), null)
  if (!f?.token) return { ready: false }
  const out = { ready: true, username: f.username, tail: String(f.token).slice(-4) }
  if (!live) return out
  const me = await tg(f.token, 'getMe', {}, fetchImpl)
  if (me.description === 'unreachable') return { ...out, live: 'unreachable' }
  if (!me.ok) return { ...out, ready: false, live: 'token-rejected' }
  return me.result?.can_manage_bots === true ? { ...out, live: 'ok' } : { ...out, ready: false, live: 'management-off' }
}

/** Forget the factory (the person replaces it). The bots it made keep working: their tokens live with their channels. */
function forget(root) {
  try { fs.rmSync(file(root)); return true } catch { return false }
}

/** A suggested address for a new bot: Telegram's rule — 5–32 characters, letters, digits and «_», ending in «bot». */
function suggestUsername(base, salt = '') {
  const clean = String(base || 'fractera').replace(/[^A-Za-z0-9_]/g, '_').replace(/_+/g, '_').replace(/^[^A-Za-z]+/, '') || 'fractera'
  const tail = String(salt).replace(/[^a-z0-9]/gi, '').slice(0, 5)
  const u = `${clean.slice(0, 32 - 4 - (tail ? tail.length + 1 : 0))}${tail ? `_${tail}` : ''}_bot`
  return USERNAME.test(u) ? u : `fractera_${tail || 'node'}_bot`
}

/** The creation link of Telegram's own window (the person may edit both fields there). */
function createLink(root, { username, name }) {
  const f = readJson(file(root), null)
  if (!f?.username) return { ok: false, error: 'no-factory' }
  if (!USERNAME.test(String(username))) return { ok: false, error: 'bad-username' }
  return { ok: true, url: `https://t.me/newbot/${f.username}/${username}?name=${encodeURIComponent(String(name || username)).replace(/%20/g, '+')}` }
}

/**
 * Wait for the next bot the factory makes (≤ `ms`), then take its token. Long polling with `allowed_updates: ["managed_bot"]`; the offset
 * is kept so an update is read once. `{ ok:true, bot:{ id, username, name }, creator, token }` — the caller hands the token to the channel
 * it belongs to and never prints it; `{ ok:false, error:'timeout' }` when nobody confirmed.
 */
async function awaitCreated(root, { ms = 10 * 60_000, creatorId = null } = {}, fetchImpl) {
  const f = readJson(file(root), null)
  if (!f?.token) return { ok: false, error: 'no-factory' }
  const until = Date.now() + ms
  let offset = readJson(offsetFile(root), {}).offset ?? 0
  while (Date.now() < until) {
    const wait = Math.max(1, Math.min(25, Math.floor((until - Date.now()) / 1000)))
    const r = await tg(f.token, 'getUpdates', { offset, timeout: wait, allowed_updates: ['managed_bot'] }, fetchImpl, (wait + 10) * 1000)
    if (!r.ok) { await new Promise((ok) => setTimeout(ok, 3000)); continue }
    for (const u of r.result ?? []) {
      offset = u.update_id + 1
      fs.mkdirSync(path.dirname(offsetFile(root)), { recursive: true })
      fs.writeFileSync(offsetFile(root), JSON.stringify({ offset }))
      const m = u.managed_bot
      if (!m?.bot?.id) continue
      if (creatorId && String(m.user?.id) !== String(creatorId)) continue
      const t = await tg(f.token, 'getManagedBotToken', { user_id: m.bot.id }, fetchImpl)
      if (!t.ok || typeof t.result !== 'string') return { ok: false, error: 'token-not-given', bot: { id: m.bot.id, username: m.bot.username } }
      return { ok: true, bot: { id: m.bot.id, username: m.bot.username, name: m.bot.first_name ?? '' }, creator: m.user?.id ?? null, token: t.result }
    }
  }
  return { ok: false, error: 'timeout' }
}

/** A new token for a bot this factory made (the old one stops at once). */
async function reissue(root, botId, fetchImpl) {
  const f = readJson(file(root), null)
  if (!f?.token) return { ok: false, error: 'no-factory' }
  const r = await tg(f.token, 'replaceManagedBotToken', { user_id: Number(botId) }, fetchImpl)
  return r.ok && typeof r.result === 'string' ? { ok: true, token: r.result } : { ok: false, error: r.description || 'refused' }
}

module.exports = { save, state, forget, suggestUsername, createLink, awaitCreated, reissue, TOKEN_SHAPE, USERNAME }

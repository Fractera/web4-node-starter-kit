'use strict'
// A SECRET TYPED IN TELEGRAM (node step 768-4). The owner, 2026-11-16: «если я говорю в Telegram ты мне показываешь возможность ввести
// пароль в Telegram»; «активацию сервера ограничим формы через браузер … для тестирования … фейковое API ключ и передадим его через
// Telegram». A request for an element's key goes to Telegram with a button that opens a small form over the chat (a Telegram Mini App,
// core.telegram.org/bots/webapps). The form is served by the node's own door on its HTTPS address and posts the key straight back to it —
// never through the chat, the bot's updates or an agent.
// 🔒 Two locks on that door, both required: (1) the launch data Telegram signs with the asker's bot token (`initData`, HMAC-SHA256 with the
// key HMAC("WebAppData", token)) — proves the form was opened from that bot by a person in its allowed chats, not too long ago; (2) a
// one-time token in the button's address — names the ONE request; only its sha256 is kept with the request, it dies when the request
// closes or after a day. No telegram.org script: the launch data arrives in the page's hash (`tgWebAppData`).
const crypto = require('node:crypto')

const TOKEN_TTL_MS = 24 * 3600_000
const INIT_MAX_AGE_S = 3600

const sha = (s) => crypto.createHash('sha256').update(String(s)).digest('hex')
const hmac = (key, data) => crypto.createHmac('sha256', key).update(data).digest()

/** A fresh one-time token for a request: `{ token, entry }` — the token travels only in the button, `entry` is kept with the request. */
function issue(now = Date.now()) {
  const token = crypto.randomBytes(18).toString('base64url')
  return { token, entry: { hash: sha(token), until: new Date(now + TOKEN_TTL_MS).toISOString() } }
}

/** Does `token` open this request's entry? */
function tokenOk(entry, token, now = Date.now()) {
  if (!entry || typeof entry.hash !== 'string' || typeof token !== 'string' || !/^[A-Za-z0-9_-]{16,64}$/.test(token)) return false
  if (!(Date.parse(entry.until) > now)) return false
  const a = Buffer.from(sha(token), 'hex')
  const b = Buffer.from(entry.hash, 'hex')
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

/** The hash of a data-check-string under the bot's token (hex). */
function sign(fields, botToken) {
  const dcs = Object.keys(fields).sort().map((k) => `${k}=${fields[k]}`).join('\n')
  return hmac(hmac('WebAppData', botToken), dcs).toString('hex')
}

/**
 * Check Telegram's launch data. `allow` — the chat ids of the asker's bot (`access.json` allowFrom). Resolves
 * `{ ok: true, user }` or `{ ok: false, reason }`: no-data · no-hash · forged · stale · no-user · not-allowed.
 * @param {string} initData @param {string} botToken @param {{ allow?: string[], maxAgeS?: number, now?: number }} [o]
 */
function check(initData, botToken, { allow = [], maxAgeS = INIT_MAX_AGE_S, now = Date.now() } = {}) {
  if (typeof initData !== 'string' || !initData || initData.length > 8192 || !botToken) return { ok: false, reason: 'no-data' }
  const p = new URLSearchParams(initData)
  const hash = p.get('hash') ?? ''
  if (!/^[a-f0-9]{64}$/.test(hash)) return { ok: false, reason: 'no-hash' }
  const fields = {}
  for (const [k, v] of p) if (k !== 'hash') fields[k] = v
  // Telegram's newer launch data also carries `signature` (for third parties); the bot-token hash is checked with it and, failing that,
  // without it — either way only the bot's token can produce the hash
  const ok = (f) => crypto.timingSafeEqual(Buffer.from(sign(f, botToken), 'hex'), Buffer.from(hash, 'hex'))
  let good = ok(fields)
  if (!good && 'signature' in fields) { const { signature, ...rest } = fields; void signature; good = ok(rest) }
  if (!good) return { ok: false, reason: 'forged' }
  const at = Number(fields.auth_date)
  if (!(at > 0) || now / 1000 - at > maxAgeS || at - now / 1000 > 300) return { ok: false, reason: 'stale' }
  let user = null
  try { user = JSON.parse(fields.user ?? 'null') } catch { /* below */ }
  if (!user || !Number.isInteger(user.id)) return { ok: false, reason: 'no-user' }
  if (!allow.map(String).includes(String(user.id))) return { ok: false, reason: 'not-allowed' }
  return { ok: true, user: String(user.id) }
}

module.exports = { issue, tokenOk, check, sign, sha, TOKEN_TTL_MS }

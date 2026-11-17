// THE PERSON'S ACTION REQUESTS (node step 761-16). The owner, 2026-11-16: «я ожидал что как раз в таком кейсе должно было появиться
// уведомление на экране которое невозможно пропустить в котором ты меня призываешь совершить определённое действие и подтвердить о его
// завершении»; «вся верхняя часть экрана очень сильно занята … уведомление лучше показывать снизу». The main agent puts a request here
// (`npm run ask-person`) when a step needs the person's own hands — a password, a sign-in, a /start; every page of the panel shows it at
// the bottom until the person presses «Готово», and that press wakes the main agent in the same conversation
// (`/api/node/person-asks`, node line `person-done`). A file in `data/node/` — outside git, the person's part.
const fs = require('node:fs')
const path = require('node:path')
const crypto = require('node:crypto')
const secrets = require('./person-secrets.cjs')

const KEEP = 50
const file = (root) => path.join(root, 'data', 'node', 'person-asks.json')

/** A place the request may send the person: a page of this node (`/…`) or an https address (Telegram Web, a registrar). */
function cleanHref(v) {
  if (typeof v !== 'string' || !v || v.length > 500) return null
  if (/^\/(?!\/)[^\s]*$/.test(v)) return v
  try { const u = new URL(v); return u.protocol === 'https:' || ['localhost', '127.0.0.1'].includes(u.hostname) ? u.href : null } catch { return null }
}

function read(root) {
  try { const a = JSON.parse(fs.readFileSync(file(root), 'utf8')); return Array.isArray(a) ? a : [] } catch { return [] }
}
function write(root, list) {
  fs.mkdirSync(path.dirname(file(root)), { recursive: true })
  const tmp = `${file(root)}.tmp`
  fs.writeFileSync(tmp, `${JSON.stringify(list.slice(-KEEP), null, 2)}\n`)
  fs.renameSync(tmp, file(root))
}

/** Put a request. `text` — what to do, in the person's language (≤ 400); `href` — where; `why` — why only the person can; `hint` — what
 * may pop up on the way and what to press.
 * @param {string} root
 * `secret` (768) — the person types a secret in the window: `{ kind: 'env', name, where? }` (an element's own key) or `{ kind:
 * 'server-root', host, port? }` (the main agent's server launch); only its name and place are kept — never a value.
 * @param {{ text?: unknown, href?: string | null, why?: string | null, hint?: string | null, copy?: string | null, by?: string, secret?: unknown, signin?: string | null }} [o] */
function add(root, { text, href = null, why = null, hint = null, copy = null, by = 'build', secret = null, signin = null } = {}) {
  const t = typeof text === 'string' ? text.trim() : ''
  if (!t || t.length > 400) throw new Error('person-asks: the text is 1–400 characters')
  const h = href == null || href === '' ? null : cleanHref(href)
  if (href && !h) throw new Error('person-asks: href is a page of this node (/…) or an https address')
  const w = typeof why === 'string' && why.trim() ? why.trim().slice(0, 300) : null
  // the owner, 2026-11-16 (a screenshot of Chrome's «Открыть приложение "Telegram"?»): a request names what may pop up on the way and
  // what to press — in the window itself, not in a chat after the fact
  const hi = typeof hint === 'string' && hint.trim() ? hint.trim().slice(0, 300) : null
  // the owner, 2026-11-16: «я не смог выделить своем браузере тот текст … лучше выпал кнопка скопировать команду» — a command for the
  // person travels apart from the words, the window gives it a copy button
  const c = typeof copy === 'string' && copy.trim() ? copy.trim().slice(0, 600) : null
  const sec = secrets.describe(secret, by)
  // 777: «sign in as the architect» — the link is built by the node's one builder where it is shown (the window, Telegram), never stored
  // from an agent's words: an `href` beside it is dropped.
  const si = signin === 'architect' ? 'architect' : null
  const item = { id: crypto.randomBytes(4).toString('hex'), text: t, href: si ? null : h, why: w, hint: hi, copy: c, by, ...(sec ? { secret: sec } : {}), ...(si ? { signin: si } : {}), at: new Date().toISOString(), doneAt: null }
  write(root, [...read(root), item])
  return item
}

/** Requests still waiting for the person. */
const open = (root) => read(root).filter((a) => !a.doneAt && !a.droppedAt)

/** The person pressed «Готово»: the request is closed once; a second press (another tab) returns null. */
function done(root, id) {
  const list = read(root)
  const a = list.find((x) => x.id === id)
  if (!a || a.doneAt || a.droppedAt) return null
  a.doneAt = new Date().toISOString()
  write(root, list)
  return a
}

/** The agent takes its request back (the step went another way). */
function drop(root, id) {
  const list = read(root)
  const a = list.find((x) => x.id === id && !x.doneAt && !x.droppedAt)
  if (!a) return null
  a.droppedAt = new Date().toISOString()
  write(root, list)
  return a
}

/** Where the request also went in Telegram (761-16b): `{ via, sent }` — kept so «Готово» in the panel can close it there too. */
function setTg(root, id, tg) {
  const list = read(root)
  const a = list.find((x) => x.id === id)
  if (!a) return null
  a.tg = tg
  write(root, list)
  return a
}

/** 768-4: the one-time Telegram entry of a request (`{ hash, until }`, telegram-webapp.cjs) — only its sha256, never the token. */
function setEntry(root, id, entry) {
  const list = read(root)
  const a = list.find((x) => x.id === id && !x.doneAt && !x.droppedAt)
  if (!a) return null
  a.tgEntry = entry
  write(root, list)
  return a
}

/** 768-4: the open request a Telegram token opens, or null. @param {string} root @param {string} token */
function byToken(root, token) {
  const webapp = require('./telegram-webapp.cjs')
  return open(root).find((a) => TELEGRAM_FORM.has(a.secret?.kind) && webapp.tokenOk(a.tgEntry, token)) ?? null
}

/** The secret kinds a Telegram form may take (768-4, 768-6, 778-3); a server's root password — only the window on the computer. */
const TELEGRAM_FORM = new Set(['env', 'openai', 'element-admin'])

/** The words the main agent gets when the person confirms. */
const doneText = (a) => `The person pressed «Готово» on the screen for your request «${a.text}» (asked ${a.at.slice(11, 16)} UTC). Check the result yourself before you rely on it, then go on with the step and tell the person in one line.`

/** 768: the words the asker gets when the person saved its secret — the name and, for a long value, its last four characters only.
 * @param {any} a @param {{ tail?: string | null, restarted?: boolean | null, via?: string, admin?: string | null }} [o] */
const secretDoneText = (a, { tail = null, restarted = null, via = 'window', admin = null } = {}) => a.secret?.kind === 'element-admin'
  ? (admin === 'skipped'
    ? `The person skipped the admin of the element ${a.secret.element} (${a.secret.role}) for the request «${a.text}»: the role stays the architect's alone; another admin later on the Users tab («Админ элемента»).`
    : `The person named the admin of the element ${a.secret.element} (${a.secret.role}) ${via === 'telegram' ? 'in the Telegram form' : 'in the window'}: ${admin === 'created' ? 'a new account was created with that role' : 'an existing account got the role, its password unchanged'}. The e-mail and the password never reach you.`)
  : a.secret?.kind === 'openai'
  ? `The person saved the node's OpenAI key ${via === 'telegram' ? 'in the Telegram form' : 'in the window'} for your request «${a.text}» (asked ${a.at.slice(11, 16)} UTC)${tail ? `, ends …${tail}` : ''}: OpenAI accepted it in a live check, the core keeps it — voice, translations and the deep memory work again. The value never reaches you. Tell the person in one line; a voice note waiting — transcribe it now.`
  : a.secret?.kind === 'server-root'
  ? `The person typed the root password of ${a.secret.host} in the window for your request «${a.text}» (asked ${a.at.slice(11, 16)} UTC): the launch door opened a visit of a day in their browser — the password was stored nowhere. Check the server's state yourself (the page's «Проверить сервер» with an empty password), then go on and tell the person in one line.`
  : `The person saved ${a.secret?.name} ${via === 'telegram' ? 'in the Telegram form' : 'in the window'} for your request «${a.text}» (asked ${a.at.slice(11, 16)} UTC): it is in your key file (.env.local)${tail ? `, ends …${tail}` : ''}; ${restarted === false ? 'your process did NOT restart — say so, the node restarts it: npm run power' : 'your process restarted and reads it now'}. The value never reaches you — never ask for it in a chat. Check that your job works with it, then go on and tell the person in one line.`

module.exports = { add, open, done, drop, read, setTg, setEntry, byToken, cleanHref, doneText, secretDoneText, file, TELEGRAM_FORM }

// THE PERSON'S ACTION REQUESTS (node step 761-16). The owner, 2026-11-16: «я ожидал что как раз в таком кейсе должно было появиться
// уведомление на экране которое невозможно пропустить в котором ты меня призываешь совершить определённое действие и подтвердить о его
// завершении»; «вся верхняя часть экрана очень сильно занята … уведомление лучше показывать снизу». The main agent puts a request here
// (`npm run ask-person`) when a step needs the person's own hands — a password, a sign-in, a /start; every page of the panel shows it at
// the bottom until the person presses «Готово», and that press wakes the main agent in the same conversation
// (`/api/node/person-asks`, node line `person-done`). A file in `data/node/` — outside git, the person's part.
const fs = require('node:fs')
const path = require('node:path')
const crypto = require('node:crypto')

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

/** Put a request. `text` — what to do, in the person's language (≤ 400); `href` — where; `why` — why only the person can. */
function add(root, { text, href = null, why = null, by = 'build' } = {}) {
  const t = typeof text === 'string' ? text.trim() : ''
  if (!t || t.length > 400) throw new Error('person-asks: the text is 1–400 characters')
  const h = href == null || href === '' ? null : cleanHref(href)
  if (href && !h) throw new Error('person-asks: href is a page of this node (/…) or an https address')
  const w = typeof why === 'string' && why.trim() ? why.trim().slice(0, 300) : null
  const item = { id: crypto.randomBytes(4).toString('hex'), text: t, href: h, why: w, by, at: new Date().toISOString(), doneAt: null }
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

/** The words the main agent gets when the person confirms. */
const doneText = (a) => `The person pressed «Готово» on the screen for your request «${a.text}» (asked ${a.at.slice(11, 16)} UTC). Check the result yourself before you rely on it, then go on with the step and tell the person in one line.`

module.exports = { add, open, done, drop, read, cleanHref, doneText, file }

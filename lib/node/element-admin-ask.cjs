'use strict'
// THE BIRTH WINDOW OF AN ELEMENT'S ADMIN (node step 778-3). The owner, 2026-11-17 (Telegram 470): «При рождении элемента просим ввести
// e-mail и пароль»; (471) «Если пользователь проигнорировал ведение имейла, то значит только архитектор может получить эту роль по
// умолчанию». A custom element born with its admin role (elementAdmin001…980, lib/web4-items/element-admin-role.cjs) puts ONE request of
// the core: the orange window at the bottom of every panel page and, with an HTTPS address, the Telegram form — the e-mail and the
// password of the element's admin, or «Пропустить» (the architect alone). The values go straight to the sign-in element
// (lib/node/person-secret-save.ts → lib/auth/element-admin.ts), never into the request's file, a chat or an agent.
// Called by the birth (scripts/item-birth.mjs) and by `npm run ask-person -- --secret element-admin --element <id>`.
const fs = require('node:fs')
const path = require('node:path')
const asks = require('./person-asks.cjs')
const tg = require('./person-asks-telegram.cjs')
const elementAdmin = require('../web4-items/element-admin-role.cjs')

const WORDS = {
  ru: {
    text: 'Кто будет администратором элемента «{name}»? Введите его e-mail и пароль. «Пропустить» — администратором останетесь только вы',
    why: 'администратор открывает страницы управления элементом и его мини-приложение в Telegram; e-mail и пароль уходят прямо во вход узла, мимо чата и агентов',
  },
  en: {
    text: 'Who will administer the element «{name}»? Type their e-mail and password. «Skip» — you alone stay its admin',
    why: 'the admin opens the element\'s management pages and its Telegram Mini App; the e-mail and the password go straight to the node\'s sign-in, past the chat and the agents',
  },
}

function langOf(root) {
  try {
    const l = JSON.parse(fs.readFileSync(path.join(root, 'data', 'services', 'build', 'channel', 'telegram', 'person.json'), 'utf8')).lang
    if (typeof l === 'string') return l.startsWith('ru') ? 'ru' : 'en'
  } catch { /* no bot — the node's default */ }
  return 'ru'
}

/** Put the request for the admin of element `id`. `name` — its name for people; without one, the name the node keeps for it.
 * @param {string} root @param {string} id @param {{ name?: string | null }} [o]
 * @returns {Promise<{ ok: true, id: string, already?: boolean, telegram?: boolean } | { ok: false, reason: string }>} */
async function askElementAdmin(root, id, { name = null } = {}) {
  let registry = null
  try { registry = JSON.parse(fs.readFileSync(path.join(root, 'WEB4-ITEMS-REGISTRY', 'web4-items.json'), 'utf8')) } catch { return { ok: false, reason: 'no-registry' } }
  const role = elementAdmin.adminRoleOf(registry, id)
  // a built-in element (or one born when all 980 were taken) has no role — its admin is the architect alone, nothing to ask
  if (!role) return { ok: false, reason: 'no-admin-role' }
  const waiting = asks.open(root).find((a) => a.secret?.kind === 'element-admin' && a.secret.element === id)
  if (waiting) return { ok: true, id: waiting.id, already: true }
  let label = typeof name === 'string' && name.trim() ? name.trim() : null
  if (!label) { try { label = require('../web4-items/name-file.cjs').ownName(id, root) } catch { /* no name yet */ } }
  const w = WORDS[langOf(root)]
  const a = asks.add(root, { text: w.text.replace('{name}', label || id), why: w.why, by: 'build', secret: { kind: 'element-admin', element: id, role, label: label || id } })
  const t = await tg.announce(root, a).catch(() => ({ sent: 0, via: null }))
  if (t.sent) asks.setTg(root, a.id, { via: t.via, sent: t.sent })
  return { ok: true, id: a.id, telegram: t.sent > 0 }
}

module.exports = { askElementAdmin }

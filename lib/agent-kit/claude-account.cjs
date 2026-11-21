// WHOSE CLAUDE ACCOUNT AN ELEMENT'S AGENT RUNS ON (node step 833-1) — one answer, by code, no model, no `claude` process.
// The server's main agent, handoff 2026-11-21 (Telegram 637), and the owner's decision quoted there: «вход в подписку только через
// компьютер пусть так и остается на индикация о том что ваша агент не вошёл в подписку откройте компьютер и кидай ссылку пусть
// переходят пользователь на локальную версию там авторизуется».
//   own  — the element signed in to a Claude account of its own (`data/services/<id>/claude`, step 689)
//   node — it runs on the node's own login (a home computer: one person, one login)
//   none — no account of its own signed in where the element may run ONLY on its own: behind its wall on a dedicated server (811-5b),
//          or an app of its own on any node (834-10, the owner, Telegram 662, 2026-11-21: agreed «own apps only on their own account» —
//          an app has its own owner, the node's subscription is never theirs): its agent cannot start, every task fails with `no-account`
// 🔒 Read from files: the own folder's `.credentials.json` (Linux, Windows) or the `oauthAccount` of its `.claude.json` (every system,
// written by `claude` at sign-in). A Pult polled every few seconds must never spawn `claude auth status` per element.
const fs = require('node:fs')
const path = require('node:path')

const ID = /^[a-z0-9][a-z0-9-]{0,39}$/

/** The element's own Claude folder holds a signed-in account. */
function ownSignedIn(root, id) {
  const dir = path.join(root, 'data', 'services', id, 'claude')
  try {
    if (!fs.statSync(dir).isDirectory()) return false
  } catch { return false }
  if (fs.existsSync(path.join(dir, '.credentials.json'))) return true
  for (const f of [path.join(dir, '.claude.json'), path.join(dir, '.config.json')]) {
    try {
      const j = JSON.parse(fs.readFileSync(f, 'utf8'))
      if (j?.oauthAccount?.emailAddress || j?.oauthAccount?.accountUuid) return true
    } catch { /* not this file */ }
  }
  return false
}

/** Is this element walled on a dedicated server (811)? `opts` — the wall's test hooks (`lib/hosting/element-wall.cjs`). */
function walled(root, id, opts = {}) {
  try {
    const wall = require(path.join(root, 'lib', 'hosting', 'element-wall.cjs'))
    if (!wall.wallOn(root, opts)) return false
    return wall.userExists(id, opts)
  } catch { return false }
}

/** 834-10: an app of its own (registry `app: own`, `lib/web4-items/element-app.cjs`) runs only on its own account, on any node. */
function ownApp(root, id) {
  try {
    return require(path.join(root, 'lib', 'web4-items', 'element-app.cjs')).isOwnApp(id, root)
  } catch { return false }
}

/**
 * @param {string} root the core's folder @param {string} id a registry id
 * @returns {'own' | 'node' | 'none'}
 */
function accountOf(root, id, opts = {}) {
  if (!ID.test(String(id ?? ''))) return 'node'
  if (ownSignedIn(root, id)) return 'own'
  return walled(root, id, opts) || ownApp(root, id) ? 'none' : 'node'
}

/** The page where the element's own account is signed in — on the node's panel (its address, or the id before it has one). */
function subscriptionPath(root, id, lang) {
  let a = id
  try {
    const x = JSON.parse(fs.readFileSync(path.join(root, 'data', 'services', id, 'address.json'), 'utf8')).address
    if (typeof x === 'string' && /^[a-z0-9-]{1,40}$/.test(x)) a = x
  } catch { /* the id */ }
  return `/${lang}/${a}/subscription`
}

module.exports = { accountOf, ownSignedIn, walled, ownApp, subscriptionPath }

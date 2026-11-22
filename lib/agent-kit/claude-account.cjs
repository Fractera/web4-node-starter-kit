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

// 837-0f: STATIC requires — the claude-auth door imports this module into the core's Next bundle, where a require by a computed path
// (`require(path.join(root, …))`) compiles into «Cannot find module 'unknown'»: walled() and ownApp() silently answered false on the
// server and a walled element got the choice of «Подписка узла» again (✗ 2026-11-22, uuy30). Guard: `check:bundle-requires` after a build.
const wall = require('../hosting/element-wall.cjs')
const elementApp = require('../web4-items/element-app.cjs')

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
    if (!wall.wallOn(root, opts)) return false
    return wall.userExists(id, opts)
  } catch { return false }
}

/** 834-10: an app of its own (registry `app: own`, `lib/web4-items/element-app.cjs`) runs only on its own account, on any node. */
function ownApp(root, id) {
  try {
    return elementApp.isOwnApp(id, root)
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

// 837-0e (the owner, Telegram 843, on the server: «Ты предлагаешь пользователю выбрать будет он использовать собственную подписку либо
// воровать подписку архитектора … ему нельзя давать выбор»): an element that may run ONLY on its own account has no choice and no
// switch — its own folder exists by itself, and its page offers one button, «Войти». The folder is made by the core inside the element's
// data folder, whose ACL (the wall's `add`: u:fe-<id>:rwX and the same as defaults) makes it the element's; skill `server-wall`.
/** Walled on a dedicated server (811-5b) or an app of its own (834-10): the node's login is never its login. */
function ownOnly(root, id, opts = {}) {
  return ID.test(String(id ?? '')) && (walled(root, id, opts) || ownApp(root, id))
}
/** Its own Claude folder, made when missing — only inside an existing data folder of the element (never a new tree outside the wall). */
function ensureOwnHome(root, id) {
  if (!ID.test(String(id ?? ''))) return { ok: false, reason: 'bad-id' }
  const data = path.join(root, 'data', 'services', id)
  const dir = path.join(data, 'claude')
  try {
    if (!fs.statSync(data).isDirectory()) return { ok: false, reason: 'no-data-folder' }
  } catch { return { ok: false, reason: 'no-data-folder' } }
  try {
    fs.mkdirSync(dir)
  } catch (e) {
    if (e && e.code === 'EEXIST') return { ok: true, dir }
    return { ok: false, reason: (e && e.code) || 'mkdir-failed' }
  }
  return { ok: true, dir }
}
/** The e-mail of the element's own account from the files `claude` writes at sign-in — never a `claude` run as the node against them. */
function ownEmail(root, id) {
  if (!ID.test(String(id ?? ''))) return null
  const dir = path.join(root, 'data', 'services', id, 'claude')
  for (const f of [path.join(dir, '.claude.json'), path.join(dir, '.config.json')]) {
    try {
      const e = JSON.parse(fs.readFileSync(f, 'utf8'))?.oauthAccount?.emailAddress
      if (typeof e === 'string' && e.includes('@')) return e
    } catch { /* not this file, or not readable by the node */ }
  }
  return null
}

module.exports = { accountOf, ownSignedIn, walled, ownApp, subscriptionPath, ownOnly, ensureOwnHome, ownEmail }

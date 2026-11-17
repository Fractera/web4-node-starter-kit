'use strict'
// ONE «SIGN IN» LINK FOR THE WHOLE NODE (step 777). The owner, 2026-11-17, after a registration link without a way back left him on
// the sign-in element's own page: «ссылка … должна была содержать хвост который меня должен вести обратно на страницу проекта, но уже на
// авторизованный странице архитектора с домен … должно быть решено на уровне статической функцией в которой всегда вызывается одна и та
// же». So no agent ever types a sign-in address: the browser (`lib/runtime-urls.ts` signInRedirectUrl, the action window, the domain
// page) and the node (the Telegram copy of a request) call these two functions and nothing else.
// 🔒 Pure: no files, no window — the same module runs in the browser and in the node.
// 🔒 `/login`, never `/register` (260-4): the sign-in form itself sends to registration while the node has no account, and the first
// account becomes the architect; a person who already has one is not made to register twice.

/** The sign-in element's form with the way back and the role the destination needs. `signed-in=1` is the mark the proxy sets too: back
 *  on the page, the person sees «you are signed in».
 * @param {string} auth the sign-in element's base address as the browser reaches it
 * @param {string} back where the person returns after signing in
 * @param {'architect' | 'user'} [role] */
function signInLink(auth, back, role = 'architect') {
  const url = new URL(`${String(auth).replace(/\/+$/, '')}/login`)
  let ret = String(back)
  try { const u = new URL(ret); u.searchParams.set('signed-in', '1'); ret = u.toString() } catch { /* not an address — as is */ }
  url.searchParams.set('callbackUrl', ret)
  url.searchParams.set('requireRole', role)
  return url.toString()
}

/** «Sign in as the architect» from a panel page: on the node's own domain when it has one (the same page of the panel there — the owner:
 *  «обратно на страницу проекта, но уже на авторизованный странице архитектора с домен»), else on this computer. `null` — the node knows
 *  no sign-in to send to.
 * @param {{ web?: string | null, webAuth?: string | null, localAuth?: string | null } | null | undefined} bases what the node said
 * @param {string} path the panel page, `/ru/architect/…` (with its query)
 * @param {string | null} [here] this computer's panel origin (`http://localhost:24680`) for the case without a domain */
function architectSignIn(bases, path, here = null) {
  const p = String(path || '/').startsWith('/') ? String(path || '/') : `/${path}`
  if (bases && bases.web && bases.webAuth) return signInLink(bases.webAuth, `${String(bases.web).replace(/\/+$/, '')}${p}`, 'architect')
  if (bases && bases.localAuth && here) return signInLink(bases.localAuth, `${String(here).replace(/\/+$/, '')}${p}`, 'architect')
  return null
}

module.exports = { signInLink, architectSignIn }

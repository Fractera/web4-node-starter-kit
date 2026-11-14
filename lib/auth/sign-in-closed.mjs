// SIGN-IN IS NOT SWITCHED ON YET — SAID, NEVER SENT TO A LOOPBACK ADDRESS (node step 739-4; the sign-in template has its twin, 739-2).
// ✗ 2026-11-14, aifa.dev on its server: before the domain was switched on, the core's sign-in redirect took the registry's
// `http://127.0.0.1:24681` — for a visitor from the internet that is THEIR OWN computer. A request that came by a public name never gets a
// loopback sign-in address: `authBaseFromHost` answers "" there, and the proxy answers one honest page (503) instead of a redirect.
// Plain `.mjs`: the proxy, the server helpers and the hosting test read it.

const LOOPBACK = new Set(['127.0.0.1', 'localhost', '::1', '[::1]'])
const hostname = (h) => String(h ?? '').split(',')[0].trim().replace(/:\d+$/, '').toLowerCase()
const isLoopbackName = (h) => LOOPBACK.has(h) || h.startsWith('127.')

/** A sign-in base that would send this request's visitor to a loopback address: the request came by a public name, the base is loopback. */
export function loopbackForPublic(requestHost, base) {
  const host = hostname(requestHost)
  if (!host || isLoopbackName(host)) return false
  let b = ''
  try { b = base ? new URL(base).hostname.toLowerCase() : '' } catch { b = '' }
  return Boolean(b) && isLoopbackName(b)
}

const WORDS = {
  ru: { title: 'Вход ещё не включён', text: 'Домен этого узла пока не включён: вход заработает здесь, когда архитектор включит домен — на последнем шаге «Активации выделенного сервера» или на вкладке «Активация домена».' },
  en: { title: 'Sign-in is not switched on yet', text: "This node's domain is not switched on yet: sign-in works here once the architect switches the domain on — on the last step of «Dedicated server activation» or the tab «Activate domain»." },
}

export function signInClosedPage(lang) {
  const w = lang === 'ru' ? WORDS.ru : WORDS.en
  return `<!doctype html><html lang="${lang === 'ru' ? 'ru' : 'en'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>${w.title}</title>
<style>body{font:16px/1.6 system-ui,sans-serif;max-width:560px;margin:15vh auto;padding:0 20px;color:#111;background:#fff}@media (prefers-color-scheme:dark){body{color:#eee;background:#111}}</style></head>
<body data-block="sign-in-closed"><h1 style="font-size:22px">${w.title}</h1><p>${w.text}</p></body></html>`
}

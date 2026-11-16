// «ЗАПОМНИТЬ СЕРВЕР НА 24 ЧАСА» — THE LAUNCH PAGE'S MEMORY IN THIS BROWSER (node step 760-1). The owner, 2026-11-16: «мне каждый раз
// приходится заново вводить пароль … если мой сервер один то хотелось бы … switch переключатель: сохранить пароль на 24:00»; and «переключатель
// … должен быть по умолчанию включённым»; approved with 760 the same day («Да, подтверждаю, утверждаю 760 и начинай»).
// 🔒 THE PASSWORD IS KEPT NOWHERE. This browser's access to the server already lives up to a day in an HttpOnly cookie of the launch door
// (744-3), and `connect` with an empty password opens the server by it; the page only forgot WHICH server. So this keeps the address, the SSH
// port and the access deadline — three facts that are not secrets — and never another field: whatever else is handed in is dropped.
// 🔒 ON BY DEFAULT; «off» is the person's choice and is remembered. Off — the page is empty on every visit again (738-4: several servers).
// 🔒 A DAY AT MOST: the deadline is the server's own (the door's `visit.deadline`), capped at 24 h from now; past it the entry is forgotten.
// Pure: every function takes the storage (`window.localStorage` in the browser, a stub in the test) and never throws — a browser that refuses
// storage (a private window) just remembers nothing.

export const REMEMBER_FLAG = 'fractera-launch-remember-on'
export const REMEMBER_KEY = 'fractera-launch-remember'
const DAY_MS = 24 * 60 * 60 * 1000
const IPV4 = /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/
const HOST = /^(?=.{4,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/

/** @typedef {{ getItem(k: string): string | null, setItem(k: string, v: string): void, removeItem(k: string): void }} Store */
/** @typedef {{ host: string, port: number, until: string }} Remembered */

const safe = (fn, fallback) => { try { return fn() } catch { return fallback } }

/** Whether the switch is on — on unless the person turned it off. @param {Store | null | undefined} store */
export function rememberOn(store) {
  return safe(() => store?.getItem(REMEMBER_FLAG) !== '0', true)
}

/** Turn the switch; turning it off forgets the server at once. @param {Store | null | undefined} store @param {boolean} on */
export function setRememberOn(store, on) {
  safe(() => {
    store?.setItem(REMEMBER_FLAG, on ? '1' : '0')
    if (!on) store?.removeItem(REMEMBER_KEY)
  }, undefined)
}

/** Forget the server (the access was closed, or ended). @param {Store | null | undefined} store */
export function forgetServer(store) {
  safe(() => store?.removeItem(REMEMBER_KEY), undefined)
}

/** The deadline as the page keeps it: the server's own, never past 24 h from `now`; `null` when it is not in the future. */
export function capUntil(until, now = Date.now()) {
  const t = Date.parse(String(until ?? ''))
  const at = Number.isFinite(t) ? Math.min(t, now + DAY_MS) : now + DAY_MS
  return at > now ? new Date(at).toISOString() : null
}

/**
 * Remember the server just connected — only its address, SSH port and access deadline. Refused (false): the switch is off, a value is not an
 * address or a port, the deadline is already past.
 * @param {Store | null | undefined} store @param {{ host?: unknown, port?: unknown, until?: unknown }} entry
 */
export function saveServer(store, entry, now = Date.now()) {
  if (!rememberOn(store)) return false
  const host = String(entry?.host ?? '').trim().toLowerCase()
  const port = Number(entry?.port ?? 22)
  const until = capUntil(entry?.until, now)
  if (!(IPV4.test(host) || HOST.test(host)) || !Number.isInteger(port) || port < 1 || port > 65535 || !until) return false
  /** @type {Remembered} */
  const kept = { host, port, until }
  return safe(() => { store?.setItem(REMEMBER_KEY, JSON.stringify(kept)); return true }, false)
}

/** The remembered server while the switch is on and its deadline lasts; otherwise `null` (a stale or damaged entry is removed). @returns {Remembered | null} */
export function readServer(store, now = Date.now()) {
  if (!rememberOn(store)) return null
  const raw = safe(() => store?.getItem(REMEMBER_KEY) ?? null, null)
  if (!raw) return null
  let v = null
  try { v = JSON.parse(raw) } catch { v = null }
  const host = typeof v?.host === 'string' ? v.host : ''
  const port = Number(v?.port)
  const t = Date.parse(String(v?.until ?? ''))
  const fresh = Number.isFinite(t) && t > now && t <= now + DAY_MS
  if (!(IPV4.test(host) || HOST.test(host)) || !Number.isInteger(port) || port < 1 || port > 65535 || !fresh) {
    forgetServer(store)
    return null
  }
  return { host, port, until: new Date(t).toISOString() }
}

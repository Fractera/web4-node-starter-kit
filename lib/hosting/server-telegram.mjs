// THE SERVER'S OWN TELEGRAM BOT, STEP 5 OF THE LAUNCH (node step 758). The owner, 2026-11-16: «Я считаю что Telegram может быть в пятым
// шагом то есть в тот момент когда идёт установка сервера у пользователя есть время подключить Telegram» — and «шаг 5 необязательный».
// The pure part: what the page may know about the bot, never the token. The runner (`scripts/dedicated-server/launch.mjs`, act `telegram`)
// keeps a token given before the server's node lives in `/root/.fractera/telegram.json` (0600, on the server) and hands it to the server
// node's own channel door the first time that node answers; the step was in the move road (737-11a, `e6961403`) and left with it (738-7).

/** A BotFather token: digits, a colon, the secret — the same shape the channel door accepts (`telegram.cjs`). */
export const TOKEN_SHAPE = /^\d{6,}:[A-Za-z0-9_-]{30,}$/

/** The four last characters — how a person recognises their bot; never more of the token. */
export const tailOf = (token) => (typeof token === 'string' && token.length >= 4 ? token.slice(-4) : null)

/**
 * The server's waiting record (`telegram.json`) as the page may see it: pending or skipped, the tail — the token itself stays behind.
 * @param {string} text the file's text, '' when there is none
 * `rejected` — the tail of a waiting token Telegram refused when the node handed it over: the step asks for a new one.
 * @returns {{ pending: boolean, tail: string | null, skipped: boolean, rejected: string | null, token: string | null }} `token` is for the runner only
 */
export function readWaiting(text) {
  let v = null
  try { v = JSON.parse(text || 'null') } catch { v = null }
  const token = v && typeof v.token === 'string' && TOKEN_SHAPE.test(v.token) ? v.token : null
  const rejected = !token && typeof v?.rejected === 'string' ? v.rejected.slice(-4) : null
  return { pending: Boolean(token), tail: tailOf(token), skipped: !token && !rejected && v?.skipped === true, rejected, token }
}

/**
 * What step 5 shows, from the waiting record and the server node's channel answer (`channelState` of its main agent, or null).
 * @param {{ pending: boolean, tail: string | null, skipped: boolean, rejected?: string | null }} waiting
 * @param {{ configured?: boolean, tail?: string | null, botUsername?: string | null, botName?: string | null, allowed?: number } | null} channel
 */
export function telegramView(waiting, channel) {
  const configured = channel?.configured === true
  return {
    configured,
    pending: !configured && waiting.pending,
    skipped: !configured && !waiting.pending && waiting.skipped,
    tail: configured ? channel?.tail ?? null : waiting.tail,
    username: configured ? channel?.botUsername ?? null : null,
    name: configured ? channel?.botName ?? null : null,
    allowed: configured ? Number(channel?.allowed ?? 0) : 0,
    rejected: configured ? null : waiting.rejected ?? null,
    live: channel !== null,
  }
}

/** Step 5 is settled when the bot is set up, its token waits for the node, or the person chose «later». */
export const telegramSettled = (t) => Boolean(t && (t.configured || t.pending || t.skipped))

// ── 761-1 / 761-2 / 761-14: what the server's bot says, and whether its agent can answer ──
// The owner, 2026-11-16: «Сообщение которое приходят первые в Telegram должны содержать ссылку на сайт я же могу одновременно делать
// несколько развертываний совершенно непонятно какой сайта идёт речь». The bot's own lines are the channel's three texts (`saveMessages`,
// action `messages`) — sent by the launch in the page's language, each naming the site with its link; ✗ before 761 the launch sent none and
// the node answered with its English fallback «Claude Code on this computer is not signed in».

/** The site a server's bot speaks for: its domain with https, or its bare IP.
 * @param {{ zone?: string | null, ip?: string | null }} [where] */
export function siteOf({ zone = null, ip = null } = {}) {
  if (zone) return { label: zone, url: `https://${zone}` }
  return { label: ip ?? '', url: ip ? `http://${ip}` : '' }
}

const fillIn = (t, map) => Object.entries(map).reduce((s, [k, v]) => s.split(`{${k}}`).join(v), String(t ?? ''))

/**
 * The three lines of the server's bot in the page's language. `words` — `{ active, inactive, noSubscription, noPanel }` with `{site}` `{link}`
 * `{terminal}` `{subscription}`; the panel's links only on a domain (a bare IP is read-only from outside).
 * @param {Record<string, string> | null | undefined} words
 * @param {{ zone?: string | null, ip?: string | null, lang?: string }} [where]
 */
export function botLines(words, { zone = null, ip = null, lang = 'en' } = {}) {
  const site = siteOf({ zone, ip })
  const panel = zone ? `https://architect.${zone}/${lang}/build` : ''
  // a bare IP: the panel is reached only through the launch page's SSH window — the words name that place (`words.noPanel`)
  const map = { site: site.label, link: site.url, terminal: panel ? `${panel}/terminal` : String(words?.noPanel ?? ''), subscription: panel ? `${panel}/subscription` : String(words?.noPanel ?? '') }
  const one = (k) => fillIn(words?.[k], map).slice(0, 1000)
  return { active: one('active'), inactive: one('inactive'), noSubscription: one('noSubscription'), lang }
}

/** The four texts the launch may carry to the server: three strings of at most 1000 characters and a language code — or null. */
export function cleanLines(v) {
  if (!v || typeof v !== 'object') return null
  const ok = (s) => typeof s === 'string' && s.length > 0 && s.length <= 1000
  if (!ok(v.active) || !ok(v.inactive) || !ok(v.noSubscription)) return null
  const lang = typeof v.lang === 'string' && /^[a-z]{2,3}(-[A-Za-z0-9]{2,8})?$/.test(v.lang) ? v.lang : 'en'
  return { active: v.active, inactive: v.inactive, noSubscription: v.noSubscription, lang }
}

/** Step 5 shows its blue check only when the bot is set AND the server's agent can answer (signed in to Claude Code); else the orange «!». */
export const telegramWarn = (t) => !(t?.configured === true && t?.signedIn === true)

/** The node line's words for the server's main agent once the bot is set and Claude Code signed in: greet, naming the site.
 * @param {{ zone?: string | null, ip?: string | null }} [where] */
export function greetText({ zone = null, ip = null } = {}) {
  const site = siteOf({ zone, ip })
  return `Node: the launch of this server is finished — ${site.label} (${site.url}) answers, and its Telegram bot is yours now. Greet the person in Telegram, in their language, in two or three short lines: name the site with its link ${site.url}, say the server is ready and you are its main agent. If you hold no picture of the person, the first contact (skill know-the-architect) comes in the same message. Nothing else; then npm run done -- --close.`
}

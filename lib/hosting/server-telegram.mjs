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

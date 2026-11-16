// THE PERSON'S ACTION REQUEST IN TELEGRAM (node step 761-16b). The owner, 2026-11-16: «если в этот момент я нахожусь с тобой в чате
// Telegram можешь ли ты прислать мне соответствующий запрос в чат требующие перейти на компьютер чтобы выполнить действия?» → «Да, строй,
// вариант (а)». The same request as the panel's window goes as ONE message of the asker's bot (the main agent's, or an element's own —
// an element without a bot speaks through the main one, the person is the same), with a reply keyboard button «Готово · <id>».
// 🔒 Why a reply keyboard and not an inline button: while an agent's session runs, its bot is read by the Claude Code channel, not by the
// node — an inline button's press would never reach the node; a reply button is a plain message «Готово · <id>», and it reaches the
// running agent through its channel (the agent closes the request: `npm run ask-person -- done <id>`) or the node when the session is off.
// No model; the message stays (639: a request is never a vanishing line).
const fs = require('node:fs')
const path = require('node:path')

const tgDir = (root, service) => path.join(root, 'data', 'services', service, 'channel', 'telegram')
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const WORDS = {
  ru: { title: 'Нужно ваше действие', asks: '{name} просит', why: 'Почему вы', hint: 'Подсказка', computer: 'Это делается на компьютере — в пульте узла.', local: 'откроется только на этом компьютере', secret: 'Это вводится в окне на компьютере, в поле со скрытым вводом. Ключ или пароль сюда в чат не присылайте.', open: 'Где', press: 'Сделали — нажмите кнопку «Готово» внизу.', done: 'Готово', closed: '✓ Закрыто в пульте: «{text}»', dropped: '✓ Запрос снят, ничего делать не нужно: «{text}»', taken: '✓ Принято: «{text}»' },
  en: { title: 'Your action is needed', asks: '{name} asks', why: 'Why you', hint: 'Hint', computer: 'This is done on the computer — in the node\'s panel.', local: 'opens on this computer only', secret: 'This is typed in the window on the computer, in a masked field. Never send a key or a password here in the chat.', open: 'Where', press: 'Done — press «Done» below.', done: 'Done', closed: '✓ Closed in the panel: «{text}»', dropped: '✓ Request withdrawn, nothing to do: «{text}»', taken: '✓ Taken: «{text}»' },
}

function bot(root, service) {
  let token = ''
  let chats = []
  try { token = (fs.readFileSync(path.join(tgDir(root, service), '.env'), 'utf8').match(/^TELEGRAM_BOT_TOKEN=(.+)$/m)?.[1] ?? '').trim() } catch { /* no bot */ }
  try { chats = (JSON.parse(fs.readFileSync(path.join(tgDir(root, service), 'access.json'), 'utf8')).allowFrom ?? []).map(String) } catch { /* nobody */ }
  return token && chats.length ? { token, chats, service } : null
}

function langOf(root, service) {
  for (const s of [service, 'build']) {
    try { const l = JSON.parse(fs.readFileSync(path.join(tgDir(root, s), 'person.json'), 'utf8')).lang; if (typeof l === 'string') return l.startsWith('ru') ? 'ru' : 'en' } catch { /* none */ }
  }
  return 'en'
}

/** The asker's bot, or the main agent's for an element without its own; null — nothing goes to Telegram. */
const botFor = (root, by) => (by && by !== 'build' ? bot(root, by) : null) ?? bot(root, 'build')

/** Where the person's panel answers: the node's own domain once the ladder connected it (any device), else this computer.
 * @returns {{ base: string, local: boolean }} */
function origin(root) {
  try {
    const d = JSON.parse(fs.readFileSync(path.join(root, 'logs', 'domain.json'), 'utf8'))
    if (typeof d.zone === 'string' && d.zone && typeof d.activatedAt === 'string') return { base: `https://${d.zone}`, local: false }
  } catch { /* no own domain */ }
  let port = 24680
  try { const r = JSON.parse(fs.readFileSync(path.join(root, 'logs', 'runtime.json'), 'utf8')); if (Number.isInteger(r.port)) port = r.port } catch { /* the default */ }
  return { base: `http://localhost:${port}`, local: true }
}

/** 761-16e (the owner, 2026-11-16: «если я веду несколько элементов одновременно … там должна существовать ссылка которая отправит меня
 * либо в авто авторизацию либо в руут»): every request in Telegram opens the place of the act — the page the agent gave, else the asking
 * element's page, else the panel. @returns {{ url: string, local: boolean }} */
function linkFor(root, ask, lang) {
  if (ask.href && !ask.href.startsWith('/')) return { url: ask.href, local: false }
  const o = origin(root)
  const p = ask.href ?? (ask.by && ask.by !== 'build' ? `/${lang}/${ask.by}` : `/${lang}`)
  return { url: `${o.base}${p}`, local: o.local }
}

/** The message (HTML) and its keyboard. `name` — the asking element's readable name, null for the main agent.
 * @param {{ id: string, text: string, href?: string | null, why?: string | null, hint?: string | null, copy?: string | null }} ask
 * @param {string} lang
 * @param {string | null} [name] */
function message(ask, lang, name = null, link = null) {
  const w = WORDS[lang] ?? WORDS.en
  const lines = [`🟠 <b>${esc(w.title)}</b>${name ? ` · ${esc(w.asks.replace('{name}', name))}` : ''}`, '', `<b>${esc(ask.text)}</b>`]
  if (ask.why) lines.push(`<i>${esc(w.why)}:</i> ${esc(ask.why)}`)
  if (ask.hint) lines.push(`<i>${esc(w.hint)}:</i> ${esc(ask.hint)}`)
  if (ask.copy) lines.push(`<pre>${esc(ask.copy)}</pre>`)
  // a page of the panel or a command means the computer; an https address may open on the phone as well
  if (ask.copy || (ask.href && ask.href.startsWith('/'))) lines.push(esc(w.computer))
  if (link) lines.push(`${esc(w.open)}: <a href="${esc(link.url).replace(/"/g, '&quot;')}">${esc(link.url)}</a>${link.local ? ` <i>(${esc(w.local)})</i>` : ''}`)
  else if (ask.href && !ask.href.startsWith('/')) lines.push(`${esc(w.open)}: ${esc(ask.href)}`)
  // 768: a secret is never typed in a chat — the message leads to the window and carries no «Готово» (saving closes it)
  if (ask.secret) {
    lines.push('', `🔒 ${esc(w.secret)}`)
    return { text: lines.join('\n'), keyboard: { remove_keyboard: true } }
  }
  lines.push('', esc(w.press))
  return { text: lines.join('\n'), keyboard: { keyboard: [[{ text: `${w.done} · ${ask.id}` }]], one_time_keyboard: true, resize_keyboard: true } }
}

async function send(token, body) {
  // 639: остаётся — a request waits for the person; it never vanishes
  const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(10_000),
  })
  const j = await r.json().catch(() => null)
  return j?.ok ? { ok: true } : { ok: false, why: j?.description ?? `HTTP ${r.status}` }
}

/** Send the request to the person's Telegram. Returns { sent, via, detail } — `sent: 0` when no bot is connected (the window alone).
 * @param {string} root
 * @param {{ id: string, text: string, href?: string | null, why?: string | null, hint?: string | null, copy?: string | null, by?: string }} ask
 * @param {string | null} [name] */
async function announce(root, ask, name = null) {
  const b = botFor(root, ask.by)
  if (!b) return { sent: 0, via: null, detail: 'no-bot' }
  const lang = langOf(root, b.service)
  const m = message(ask, lang, b.service === 'build' && ask.by && ask.by !== 'build' ? name : null, linkFor(root, ask, lang))
  let sent = 0
  let why = ''
  for (const chat of b.chats) {
    try {
      const r = await send(b.token, { chat_id: chat, text: m.text, parse_mode: 'HTML', reply_markup: m.keyboard, link_preview_options: { is_disabled: true } })
      if (r.ok) sent += 1
      else why = r.why
    } catch (e) { why = e instanceof Error ? e.message : String(e) }
  }
  return { sent, via: b.service, detail: sent ? `sent to ${sent} chat(s)` : `Telegram did not take it: ${why}` }
}

/** «Готово» pressed in the panel (kind `closed`), the agent withdrew it (`dropped`) or the person's «Готово · <id>» was taken (`taken`):
 * the chat learns it, and the button goes away — ✗ 2026-11-16 16:45: a dropped request kept its button and the owner pressed it. */
async function closed(root, ask, kind = 'closed') {
  if (!ask.tg?.via) return 'not-sent-there'
  const b = bot(root, ask.tg.via)
  if (!b) return 'no-bot'
  const w = WORDS[langOf(root, b.service)] ?? WORDS.en
  const out = []
  for (const chat of b.chats) {
    // 761-16c: the outcome is returned for the core's journal (B3 could not be proven without it); the window is closed anyway
    try { const r = await send(b.token, { chat_id: chat, text: (w[kind] ?? w.closed).replace('{text}', ask.text), reply_markup: { remove_keyboard: true } }); out.push(r.ok ? 'ok' : r.why) } catch (e) { out.push(String(e?.message ?? e)) }
  }
  return out.join(', ') || 'no-chat'
}

/** «Готово · <id>» as the person's message → the id, or null. */
const doneId = (text) => /(?:Готово|Done)\s*·\s*([a-f0-9]{8})\b/.exec(String(text ?? ''))?.[1] ?? null

module.exports = { announce, closed, message, doneId, botFor, linkFor, origin }

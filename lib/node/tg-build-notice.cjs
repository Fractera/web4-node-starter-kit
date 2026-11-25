'use strict'
// THE CORE BUILD SEEN FROM TELEGRAM (node step 771, the owner 2026-11-17 14:45: «как ты собираешься показывать мне что сейчас идёт сборка
// если в этот момент сервер недоступен»). During a core build the whole node is stopped (the closed lid, 553): «Пульт» cannot open, and a
// page on the core's port is forbidden — the tunnel looks at that port and Cloudflare serves the page copies while the home is silent
// (lib/deploy/build-reader.cjs). Telegram itself stays up, so the node speaks there, by code, no model:
//   start — the main bot's menu button reads «⏳ Ядро собирается» and one message says since when and how long it usually takes;
//   end   — that same message is EDITED to the result («✅ вернулось за N мин» or «🔴 сборка не удалась — работает прежняя»), and the menu
//           button is «Пульт» again (`tg-menu.refresh`).
// Never throws, never holds the build longer than its 10-second calls; the token never leaves this module.
const fs = require('node:fs')
const path = require('node:path')
const tg = require('./person-asks-telegram.cjs')
const menu = require('./tg-menu.cjs')

const FILE = (root) => path.join(root, 'data', 'node', 'tg-build.json')
const WORDS = {
  ru: { button: '⏳ Ядро собирается', start: '🔧 Ядро собирается с {time} — обычно 10–15 минут. «Пульт» и сайты этого компьютера на это время не отвечают; узел вернётся сам и допишет итог сюда.', ok: '✅ Ядро собрано и работает — вернулось в {time} (сборка {min} мин). «Пульт» снова открывается.', fail: '🔴 Сборка ядра не удалась ({time}, {min} мин) — узел вернул прежнюю версию, она работает. Причина — в журнале сборки.' },
  en: { button: '⏳ The core is building', start: '🔧 The core is building since {time} — usually 10–15 minutes. «Panel» and this computer\'s sites do not answer meanwhile; the node comes back by itself and writes the result here.', ok: '✅ The core is built and running — back at {time} (the build took {min} min). «Panel» opens again.', fail: '🔴 The core build failed ({time}, {min} min) — the node brought the previous version back, it runs. The cause is in the build log.' },
}

function langOf(root) {
  try { const l = JSON.parse(fs.readFileSync(path.join(root, 'data', 'services', 'build', 'channel', 'telegram', 'person.json'), 'utf8')).lang; return typeof l === 'string' && l.startsWith('ru') ? 'ru' : 'en' } catch { return 'en' }
}
const hm = (d, lang) => d.toLocaleTimeString(lang === 'ru' ? 'ru-RU' : 'en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }) + ' UTC'

// ✗ 2026-11-17 14:54 (the first live run): the end's calls met «fetch failed» right after the core started — the button stayed «⏳». One
// more try after 5 s; still nothing — the tunnel's writer resets the button with the next address.
async function call(token, method, body) {
  const once = await callOnce(token, method, body)
  if (once) return once
  await new Promise((r) => setTimeout(r, 5000))
  return callOnce(token, method, body)
}

async function callOnce(token, method, body) {
  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/${method}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(10_000) })
    const j = await r.json().catch(() => null)
    return j?.ok ? j.result : null
  } catch { return null }
}

/** The lid closes: the menu button and one message. Resolves the number of chats told. */
async function start(root) {
  const b = tg.bot(root, 'build')
  if (!b) return 0
  const lang = langOf(root)
  const w = WORDS[lang]
  const t = menu.target(root)
  const now = new Date()
  const sent = []
  for (const chat of b.chats) {
    const chatId = /^-?\d+$/.test(chat) ? Number(chat) : chat
    if (t) await call(b.token, 'setChatMenuButton', { chat_id: chatId, menu_button: { type: 'web_app', text: w.button, web_app: { url: t.url } } })
    const m = await call(b.token, 'sendMessage', { chat_id: chatId, text: w.start.replace('{time}', hm(now, lang)) }) // 639: остаётся — this message is edited into the build's result
    if (m?.message_id) sent.push({ chat: chatId, id: m.message_id })
  }
  try { fs.mkdirSync(path.dirname(FILE(root)), { recursive: true }); fs.writeFileSync(FILE(root), JSON.stringify({ at: now.toISOString(), sent })) } catch { /* a courtesy */ }
  return sent.length
}

/** The lid opened: the same message gets the result, the button is «Пульт» again. */
async function end(root, ok) {
  try { await mainEnd(root, ok) } finally {
    // 853: every element bot's button follows the new core too (a native's «Приложение», a custom element's /tg)
    try { await menu.refreshElements(root) } catch { /* `npm run tg-app -- menu <id>` sets one again */ }
  }
}

async function mainEnd(root, ok) {
  let rec = null
  try { rec = JSON.parse(fs.readFileSync(FILE(root), 'utf8')) } catch { /* no start — only the button */ }
  try { fs.rmSync(FILE(root), { force: true }) } catch { /* gone */ }
  const b = tg.bot(root, 'build')
  if (b && rec?.sent?.length) {
    const lang = langOf(root)
    const now = new Date()
    const min = String(Math.max(1, Math.round((now - new Date(rec.at)) / 60_000)))
    const text = WORDS[lang][ok ? 'ok' : 'fail'].replace('{time}', hm(now, lang)).replace('{min}', min)
    for (const s of rec.sent) {
      const edited = await call(b.token, 'editMessageText', { chat_id: s.chat, message_id: s.id, text })
      if (!edited) await call(b.token, 'sendMessage', { chat_id: s.chat, text }) // 639: остаётся — the result
    }
  }
  // ✗ 2026-11-17 15:51: the tunnel's watcher judged the stopped core as a dead address during the build, so the end found no HTTPS
  // address and set the default menu. A verdict that fell after this build began is the lid's, not the tunnel's: the button goes back to
  // «Пульт» at the tunnel's own address (the watcher clears the verdict itself at its next check).
  if (!menu.target(root) && rec?.at) {
    try {
      const t = JSON.parse(fs.readFileSync(path.join(root, 'logs', 'tunnel.json'), 'utf8'))
      if (t.dead && t.deadSince && Date.parse(t.deadSince) >= Date.parse(rec.at) && typeof t.url === 'string' && t.url.startsWith('https://') && b) {
        const lang = langOf(root)
        const button = { type: 'web_app', text: lang === 'ru' ? 'Пульт' : 'Panel', web_app: { url: `${t.url.replace(/\/+$/, '')}/api/node/tg-app?lang=${lang}` } }
        for (const chat of b.chats) await call(b.token, 'setChatMenuButton', { chat_id: /^-?\d+$/.test(chat) ? Number(chat) : chat, menu_button: button })
        return
      }
    } catch { /* no tunnel record — the refresh below decides */ }
  }
  try {
    const r = await menu.refresh(root)
    if (!r.ok) { await new Promise((ok) => setTimeout(ok, 5000)); await menu.refresh(root) }
  } catch { /* the tunnel's writer moves it next time */ }
}

module.exports = { start, end }

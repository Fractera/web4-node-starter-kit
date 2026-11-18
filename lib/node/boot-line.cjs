// 781-6 — «THE COMPUTER IS ON»: one line to the main agent's bot after the machine booted, so the person with the phone knows the node is
// back without opening anything (the owner, 2026-11-18: «ноутбук стоит дома а пользователь с телефоном находится на работе … позвонит
// членов семьи чтобы они открыли ноутбук и включили его. После этого через несколько минут должен начать работать в Telegram»).
//
// Once per boot: the boot time (now − the machine's uptime) is kept in `data/node/boot.json`; the line goes only when the core started
// within `FRESH_S` of that boot — a core rebuild later in the day is silent. Sent through the node's own Bot API (no plugin, no model),
// `delayMs` after the core's start, so it can say whether the agent came back hearing (708 session-lost) or sleeps until a message.

'use strict'

const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')

const FRESH_S = 15 * 60
const readJson = (f, fb) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')) } catch { return fb } }

/** Is this core start the first one after a fresh boot? Records the boot either way. → { first, bootAt } */
function firstAfterBoot(root, { uptimeS = os.uptime(), now = Date.now() } = {}) {
  const bootAt = Math.round(now - uptimeS * 1000)
  const file = path.join(root, 'data', 'node', 'boot.json')
  const rec = readJson(file, null)
  const same = rec && typeof rec.bootAt === 'number' && Math.abs(rec.bootAt - bootAt) < 120_000
  if (!same) {
    try { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, JSON.stringify({ bootAt, seenAt: now }, null, 2)) } catch { /* a convenience */ }
  }
  return { first: !same && uptimeS < FRESH_S, bootAt }
}

const WORDS = {
  ru: {
    on: (t) => `💻 Компьютер включился в ${t} — узел работает.`,
    hears: 'Главный агент вернулся в прежний разговор и слышит вас — пишите.',
    asleep: 'Главный агент спит: напишите ему — он проснётся, или нажмите «Разбудить» в Пульте.',
    trouble: 'Telegram главного агента пока не слышит: узел переподключает его сам. Можно нажать «Переподключить» в Пульте.',
    autostartOff: '⚠ Автозапуск выключен — включите его в Пульте, иначе после следующей перезагрузки узел не поднимется сам.',
  },
  en: {
    on: (t) => `💻 The computer is on since ${t} — the node runs.`,
    hears: 'The main agent is back in its conversation and hears you — write.',
    asleep: 'The main agent is asleep: write to it — it wakes up, or press «Wake» in the Pult.',
    trouble: 'The main agent\'s Telegram does not hear yet: the node reconnects it by itself. You can press «Reconnect» in the Pult.',
    autostartOff: '⚠ The autostart is off — turn it on in the Pult, or after the next reboot the node will not come up by itself.',
  },
}

/** The words of the line, from the node's facts. */
function text(root, lang, bootAt) {
  const w = WORDS[lang] ?? WORDS.en
  const h = require('./main-channel.cjs').health(root, 'build')
  const d = new Date(bootAt)
  const t = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  let auto = null
  try { auto = require('./autostart.cjs').state().on } catch { auto = null }
  const agent = h.state === 'hears' ? w.hears : ['deaf', 'healing', 'failed', 'starting'].includes(h.state) ? w.trouble : w.asleep
  return [w.on(t), agent, auto === false ? w.autostartOff : null].filter(Boolean).join('\n')
}

/** At the core's start: if this is the first start after a fresh boot, send the line in `delayMs`. */
function maybeSend(root, { delayMs = 90_000 } = {}) {
  const { first, bootAt } = firstAfterBoot(root)
  if (!first) return { scheduled: false }
  const t = setTimeout(async () => {
    try {
      const tg = require('./person-asks-telegram.cjs')
      const bot = tg.bot(root, 'build')
      if (!bot) return console.log('[boot] компьютер включился — бота главного агента нет, строку некуда отправить')
      const lang = readJson(path.join(root, 'data', 'services', 'build', 'channel', 'telegram', 'person.json'), {}).lang === 'en' ? 'en' : 'ru'
      const body = text(root, lang, bootAt)
      let sent = 0
      for (const chat of bot.chats) {
        // 639: остаётся — итог включения: его ждёт человек, который попросил домашних включить компьютер
        const r = await fetch(`https://api.telegram.org/bot${bot.token}/sendMessage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: chat, text: body, disable_web_page_preview: true }), signal: AbortSignal.timeout(15_000) }).then((x) => x.json()).catch(() => null)
        if (r?.ok) sent++
      }
      console.log(`[boot] компьютер включился — строка «узел работает» отправлена ${sent} из ${bot.chats.length}`)
    } catch (err) { console.log(`[boot] строка о включении не ушла — ${err instanceof Error ? err.message : err}`) }
  }, delayMs)
  t.unref?.()
  return { scheduled: true, bootAt }
}

module.exports = { firstAfterBoot, text, maybeSend, FRESH_S }

'use strict'
// THE BOT OFFERED AT BIRTH (node step 798-4; the owner, 2026-11-18, Telegram 812–814: «в любой момент когда пользователь создаст у него
// автоматически будет уже Telegram бот?» — «Делай в этом же шаге»). Telegram lets nobody make a bot without the person's own «Create» in
// its window (https://core.telegram.org/bots/features#managed-bots), so the birth of a custom element ends with ONE message of the main
// bot: «Создать бота для <element>» and a button with the factory's link; a waiter (10 min) connects the bot to the element's agent. A tap
// after that still lands on this element (the link's record). No factory, no main bot — nothing is sent; the Pult's «Создать бота» stays.

const fs = require('node:fs')
const path = require('node:path')
const { spawn } = require('node:child_process')
const { randomBytes } = require('node:crypto')
const factory = require('./bot-factory.cjs')
const tg = require('./person-asks-telegram.cjs')

const WORDS = {
  ru: { text: '🤖 Родился элемент «{name}». Создать ему Telegram-бота?\nОдно касание: Telegram покажет своё окно, нажмите там «Создать» — бот сам подключится к агенту элемента. Позже — кнопка «Создать бота» в карточке элемента в Пульте.', button: 'Создать бота' },
  en: { text: '🤖 The element «{name}» is born. Make it a Telegram bot?\nOne tap: Telegram shows its own window, press «Create» there — the bot connects to the element\'s agent by itself. Later — «Make the bot» in the element\'s card in the Pult.', button: 'Make the bot' },
}

function readJson(f, fallback) { try { return JSON.parse(fs.readFileSync(f, 'utf8')) } catch { return fallback } }

/** @returns {Promise<{ ok: boolean, reason?: string, username?: string }>} */
async function offerAtBirth(root, id, name) {
  if (!fs.existsSync(path.join(root, 'data', 'node', 'bot-factory.json'))) return { ok: false, reason: 'no-factory' }
  const main = tg.bot(root, 'build')
  if (!main) return { ok: false, reason: 'no-main-bot' }
  const address = readJson(path.join(root, 'data', 'services', id, 'address.json'), {}).address || id
  const username = factory.suggestUsername(address, randomBytes(3).toString('hex').slice(0, 4))
  const link = factory.createLink(root, { username, name: name || address })
  if (!link.ok) return { ok: false, reason: link.error }
  factory.remember(root, username, id)
  const w = readJson(path.join(root, 'data', 'node', 'bot-factory-wait.json'), null)
  let alive = false
  try { if (w?.state === 'waiting' && w.pid) { process.kill(Number(w.pid), 0); alive = true } } catch { /* dead */ }
  // another creation waits: its waiter connects this bot too (the link's record); else a waiter of its own
  if (!alive) spawn(process.execPath, [path.join(root, 'scripts', 'bot-factory-wait.mjs'), id, username], { cwd: root, detached: true, windowsHide: true, stdio: 'ignore' }).unref()
  let lang = 'ru'
  try { const l = readJson(path.join(root, 'data', 'services', 'build', 'channel', 'telegram', 'person.json'), {}).lang; lang = typeof l === 'string' && !l.startsWith('ru') ? 'en' : 'ru' } catch { /* ru */ }
  const t = WORDS[lang]
  let sent = 0
  for (const chat of main.chats) {
    const r = await fetch(`https://api.telegram.org/bot${main.token}/sendMessage`, { // 639: остаётся — the offer waits for the person
      method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(10_000),
      body: JSON.stringify({ chat_id: chat, text: t.text.replace('{name}', name || address), reply_markup: { inline_keyboard: [[{ text: t.button, url: link.url }]] } }),
    }).then((x) => x.json()).catch(() => null)
    if (r?.ok) sent += 1
  }
  return sent ? { ok: true, username } : { ok: false, reason: 'telegram-did-not-take-it' }
}

module.exports = { offerAtBirth }

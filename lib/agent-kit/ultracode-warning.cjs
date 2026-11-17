'use strict'
// THE ULTRACODE WARNING — ONE TEXT FOR THE BOT AND THE PULT (node step 779). The owner, 2026-11-17 (Telegram 462): «При выборе нужно
// показать информационное окно сообщающее что этот режим может быть экстремально дорогой ему разрешается создавать любое количество
// агентов для решения задачи от начала и до конца. Нажимайте если вы готовы работать с бюджетом от 200 $.»
// Read by the main bot's wake buttons (the kit's telegram.cjs `ultraWarn`) and the Pult's card (lib/node/tg-app) — the same words in both.
// 🔒 The Pult shows it in Telegram's own popup: its message is 1–256 characters (telegram-web-app.js `showPopup`, read 2026-11-17).

const WARNING = {
  ru: 'Этот режим может быть экстремально дорогим: ему разрешается создавать любое количество агентов для решения задачи от начала и до конца. Нажимайте, если вы готовы работать с бюджетом от 200 $.',
  en: 'This mode can be extremely expensive: it may create any number of agents to solve a task from start to finish. Press only if you are ready to work with a budget of $200 or more.',
}

/** The warning in `lang` (ru or en). */
const warning = (lang) => WARNING[String(lang).startsWith('ru') ? 'ru' : 'en']

module.exports = { WARNING, warning }

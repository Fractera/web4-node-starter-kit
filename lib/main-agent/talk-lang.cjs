// ЯЗЫК РАЗГОВОРА ГЛАВНОГО АГЕНТА С ЧЕЛОВЕКОМ — и язык каждого элемента, которого он будит (шаг 694).
// Владелец 2026-11-08: «При активации элемента сообщай ему на каком языке он должен отвечать … элементы отвечают на английском языке
// почти всегда»; «на каком языке ты отвечаешь на том языке должны отвечать элементы».
// `data/main-agent/talk-lang.json` (вне git) — язык, на котором главный агент сейчас говорит с человеком; пишет его `--lang <код>` у
// `npm run task` и `npm run wake`, и он держится до следующего `--lang`. Каждая задача элементу несёт строку о языке, а дверь
// `person-lang` записывает тот же язык элементу — правило моста «Язык человека» называет его же.
const fs = require('fs')
const path = require('path')

const CODE = /^[a-z]{2,3}(-[A-Za-z0-9]{2,8})?$/
const file = (root) => path.join(root, 'data', 'main-agent', 'talk-lang.json')

function get(root) {
  try {
    const l = JSON.parse(fs.readFileSync(file(root), 'utf8')).lang
    return CODE.test(l) ? l : null
  } catch { return null }
}

/** `--lang` дан — записать (неверный код — ошибка); нет — прежний. → { lang | null, error? } */
function take(root, given) {
  if (given === null || given === undefined) return { lang: get(root) }
  const code = String(given).trim().toLowerCase()
  if (!CODE.test(code)) return { lang: null, error: `--lang: a language code like ru, en, uk, pt-br — not «${given}»` }
  fs.mkdirSync(path.dirname(file(root)), { recursive: true })
  fs.writeFileSync(file(root), JSON.stringify({ lang: code, at: new Date().toISOString() }, null, 2))
  return { lang: code }
}

function name(code) {
  try { return new Intl.DisplayNames(['en'], { type: 'language' }).of(code) || code } catch { return code }
}

/** Строка задачи элементу — по-английски, как вся задача. */
function line(code) {
  return ` The person's language: ${name(code)} (${code}). Answer the person in it — in this terminal, in Telegram and in your report — whatever language this task is written in; commits and development documents stay English.`
}

module.exports = { get, take, line, name }

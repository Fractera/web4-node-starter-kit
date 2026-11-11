// ПРОТОКОЛ СИСТЕМНЫХ СООБЩЕНИЙ УЗЛА АГЕНТУ (узел, шаг 698). Владелец 2026-11-08: «у тебя есть вообще какой-то протокол типизированных
// системных сообщений? Это нужно нет?» → «делай протокол». До шага каждое место ядра сочиняло свой свободный текст («Node: …», «Узел: …»):
// язык, время сброса и отчёт жили порознь, и агент узнавал вид сообщения по словам. Теперь у каждого сообщения узла агенту одна шапка
// `⟦node · <вид> · <элемент> · <ЧЧ:ММ>⟧` из закрытого списка видов; дальше — текст, как прежде. Шапку пишет только этот модуль; читают её
// навыки (правило на вид), журнал и проверки. Сообщения человеку — свой закрытый список (`lib/main-agent-cron/notice.i18n.ts`).
// Каталог видов со смыслом и тем, что делает получатель, — `lib/agent-kit/NODE-LINES.md`.

/** Закрытый список видов. Новый вид — строка здесь и в NODE-LINES.md, в одном коммите. */
const KINDS = {
  'core-back': 'the core build finished well; the agent it stopped is back in the same conversation',
  'held-during-build': 'words for the main agent that came while the build ran, delivered after it',
  'build-failed': 'the core build failed; the previous build runs; words held during it are delivered',
  'update-stopped': 'the node update ended before the core build (refused, failed or nothing to build); the node runs as it was',
  'supervision-done': 'an element the main agent leads said «done»',
  'job-done': 'an element worker finished the main agent\'s job (one, or a whole batch)',
  'first-session-done': 'the first session of a newborn element ended; the node closed it',
  'limit-resume': 'a turn stopped by the subscription limit; the limit has reset — continue',
  // 700: the context window — measured by code, decided by the agent, reset by the node
  'context-window': 'the agent\'s context window passed 55 % — finish a small task or write the letter and reset',
  'context-reset': 'the node cleared the agent\'s window at its own request — read your letter and go on',
  // 708 (the owner, «b»): the main agent's session died with the core (power, a killed core) — the core's start brings it back
  'session-lost': 'the agent\'s session was cut off with the core; the node continued the same conversation — go on from where you stopped',
  // 699: the element's own words to the core, headed by the element's template (`ask-core.mjs`, `need.mjs`)
  'ask-core': 'an element asks the core how the node works',
  'tell-core': 'an element passes words for the architect',
  need: 'an element needs a capability it lacks',
  // 704: the owner, 2026-11-09 — the core's main agent, not the architect, answers an element's permission question
  permission: 'an element agent waits for permission to cross its boundary; the main agent decides with npm run permit',
}
const OPEN = '⟦'
const CLOSE = '⟧'
const pad = (n) => String(n).padStart(2, '0')

/** Шапка сообщения: `⟦node · job-done · s8y6x · 18:17⟧ `. Неизвестный вид — ошибка сразу, а не тихая строка. */
function head(kind, element = '', at = new Date()) {
  if (!Object.prototype.hasOwnProperty.call(KINDS, kind)) throw new Error(`node-line: unknown kind «${kind}» — add it to KINDS and NODE-LINES.md`)
  const d = at instanceof Date ? at : new Date(at)
  return `${OPEN}node · ${kind}${element ? ` · ${element}` : ''} · ${pad(d.getHours())}:${pad(d.getMinutes())}${CLOSE} `
}

/** Разобрать шапку в начале текста (после слова процесса — у слов элемента, 699): { kind, element, time, rest } или null. */
function parse(text) {
  const m = /^(?:(?:Build|Working) process: )?⟦node · ([a-z-]+)(?: · ([a-z0-9][a-z0-9-]{0,39}(?:,[a-z0-9][a-z0-9-]{0,39})*))? · (\d{2}:\d{2})⟧ ?/.exec(String(text ?? ''))
  if (!m || !KINDS[m[1]]) return null
  return { kind: m[1], element: m[2] ?? '', time: m[3], rest: String(text).slice(m[0].length) }
}

module.exports = { KINDS, head, parse }

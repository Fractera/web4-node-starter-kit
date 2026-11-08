// АГЕНТЫ ВОЗВРАЩАЮТСЯ ПОСЛЕ СБОРКИ ЯДРА (узел, шаги 675-1, 675-3). Владелец 2026-11-07: «в самом идеальным вариантом было бы авто
// пробуждение после успешного завершения»; об агентах элементов — «b»: возвращать всех, кто работал. Каждый — ~300 МБ и ход разговора:
// мало памяти — мост сессию не родит (`reason: memory`), и главный агент узнаёт, кто не вернулся. Навык главного агента — `core-build-return`.
//
// 🔒 ЗАПИСЬ — ДО `closeLid`: процессы `claude` всех агентов — дети ядра, и закрытая крышка убивает его вместе с ядром. Пока ядро
// живо, оно говорит правду: дверь `/api/agents/session` (`action: "status"`) читает карту живых сессий. Запись — `data/node/agent-return.json`.
// 🔒 ВОЗВРАТ — ТОЛЬКО ПОСЛЕ УДАЧНОЙ СБОРКИ И ТОЛЬКО ТЕХ, КТО РАБОТАЛ: спал агент — спит и дальше (страница терминала предложит кнопки);
// сборка упала — запись стирается, будить некого. Возврат — дверь `/api/agents/wake` с `reason: "core-back"`: тот же разговор
// (`claude --continue`) и строка узла о том, чем кончилась сборка.
// 🔒 ОБНОВЛЕНИЕ УЗЛА ДОЖИДАЕТСЯ ОТДЕЛЬНЫЙ ЖДУН: сборка внутри обновления — не последний его этап (каталог, навыки), а `node-update.mjs`,
// который принёс этот шаг, — прежний, уже загруженный в память. Поэтому `serve.mjs rebuild` при `FRACTERA_BUILD_WHAT=update` запускает
// вне дерева ядра `scripts/agent-return.mjs`: он ждёт итог `data/node/node-update.json` (не дольше 60 минут) и выходит. Событие, не таймер.
const fs = require('node:fs')
const nodeLine = require('../agent-kit/node-line.cjs') // 698: шапка системного сообщения узла агенту
const path = require('node:path')

const MAIN = 'build'
const file = (root) => path.join(root, 'data', 'node', 'agent-return.json')

function coreOf(root) {
  let port = 24680
  try { port = JSON.parse(fs.readFileSync(path.join(root, 'logs', 'runtime.json'), 'utf8')).port ?? port } catch { /* по умолчанию */ }
  let key = ''
  try { key = /^SETTINGS_SECRET=(.*)$/m.exec(fs.readFileSync(path.join(root, '.env.local'), 'utf8'))?.[1]?.trim() ?? '' } catch { /* ключа нет */ }
  return { base: process.env.FRACTERA_CORE_URL || `http://localhost:${port}`, key }
}

/** Запись моста о сессии главного агента (`_agent-kit/server/bridge.cjs` → `writeMode`): `running` до конца сессии. */
function modeSaysRunning(root) {
  try { return JSON.parse(fs.readFileSync(path.join(root, 'data', 'services', MAIN, 'session-mode.json'), 'utf8')).running === true } catch { return false }
}

async function post(root, door, body, ms = 15_000) {
  const { base, key } = coreOf(root)
  const r = await fetch(`${base}${door}`, { method: 'POST', headers: { 'X-Node-Key': key, 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(ms) })
  return { status: r.status, body: await r.json().catch(() => ({})) }
}

/**
 * До `closeLid`: кто из агентов работает сейчас — главный и агенты элементов (675-3, владелец 2026-11-07: «b» — возвращать всех, кто
 * работал). Ядро не ответило — ничего не записано, возвращать некого.
 */
async function noteBefore(root, what = 'core', say = console.log) {
  fs.rmSync(file(root), { force: true })
  let sessions = []
  try {
    const r = await post(root, '/api/agents/session', { service: MAIN, action: 'status' })
    // Ядро прежнего выпуска ещё не знает `status` (400) — то обновление, что приносит этот шаг: тогда запись сессии самого моста,
    // только главный агент (у прежнего ядра списка сессий нет).
    if (r.status === 400) sessions = modeSaysRunning(root) ? [{ service: MAIN, byPerson: true }] : []
    else sessions = Array.isArray(r.body?.sessions) ? r.body.sessions : r.body?.running ? [{ service: MAIN, byPerson: true }] : []
  } catch { /* ядро молчит */ }
  if (!sessions.length) { say('Ни один агент не запущен — после сборки будить некого.'); return false }
  fs.mkdirSync(path.dirname(file(root)), { recursive: true })
  fs.writeFileSync(file(root), JSON.stringify({ what, at: new Date().toISOString(), sessions }, null, 2) + '\n')
  say(`Работают агенты: ${sessions.map((x) => x.service).join(', ')} — сборка их остановит; после удачной сборки они вернутся в те же разговоры.`)
  return true
}

const read = (root) => { try { return JSON.parse(fs.readFileSync(file(root), 'utf8')) } catch { return null } }
const drop = (root) => fs.rmSync(file(root), { force: true })
/** Дверь `core-back` будит только того, кого записала сборка (запись старой формы — только главного). */
const listed = (root, service) => {
  const rec = read(root)
  return Boolean(rec && (Array.isArray(rec.sessions) ? rec.sessions.some((x) => x.service === service) : rec.service === service))
}
// Сессия рабочего процесса (`<id>--work`) не продолжается: у папки один «последний разговор», и `--continue` взял бы чужой.
const isWork = (key) => key.includes('--')

/** Текст узла для вернувшегося агента: английский, как все строки узла агенту; ответ человеку — на его языке. */
const textOf = (summary, others = '') => `${nodeLine.head('core-back', MAIN)}Node: the core build has finished — ${summary}. It stopped your session at the build; this is your conversation with the person, continued by the node, not a task from the node: do not close yourself. Check the result (npm run serve:status), go on from where you stopped and tell the person in their language.${others}`
const elementText = (summary, id = '') => `${nodeLine.head('core-back', id)}Node: the core build stopped your session; it has finished — ${summary}. This is the same conversation, continued by the node: go on from where you stopped.`

// 696 (владелец 2026-11-08: «если в тот момент когда ты будешь собирать своё ядро к тебе постучится элемент чтобы отчитаться завершение
// работы что произойдёт»). Два окна, где отчёт терялся: (1) «закончил» элемента между записью «кто работает» и закрытой крышкой будил
// главного агента, которого крышка тут же убивала, а в списке возврата его не было; (2) после сборки главного агента, если он до неё
// не работал, никто не будил — оборванные рабочие сессии и невернувшиеся агенты оставались строкой журнала. Теперь, пока идёт сборка
// (запись `agent-return.json` есть), слова для главного агента ОТКЛАДЫВАЮТСЯ в `data/node/held-for-main.json`; после сборки — удачной
// или упавшей — они приходят ему вместе с оборванным, даже если до сборки он спал. Событие, не таймер.
const heldFile = (root) => path.join(root, 'data', 'node', 'held-for-main.json')
/** Идёт ли сейчас сборка, остановившая агентов (запись сделана до закрытой крышки, стирается после). */
const building = (root) => { try { return Date.now() - fs.statSync(file(root)).mtimeMs < 2 * 3600_000 } catch { return false } } // запись старше 2 ч — след оборванной сборки
/** Отложить слова для главного агента до конца сборки. */
function hold(root, text, from) {
  let list = []
  try { list = JSON.parse(fs.readFileSync(heldFile(root), 'utf8')) } catch { /* первый */ }
  list.push({ at: new Date().toISOString(), from: String(from ?? ''), text: String(text ?? '').slice(0, 4000) })
  fs.mkdirSync(path.dirname(heldFile(root)), { recursive: true })
  fs.writeFileSync(heldFile(root), JSON.stringify(list, null, 2) + '\n')
}
function takeHeld(root) {
  let list = []
  try { list = JSON.parse(fs.readFileSync(heldFile(root), 'utf8')) } catch { /* нет */ }
  fs.rmSync(heldFile(root), { force: true })
  return Array.isArray(list) ? list : []
}
const heldText = (held) => held.length ? ` While the build ran, these came for you and were held until now: ${held.map((h, i) => `(${i + 1}) from ${h.from || 'the node'} at ${h.at.slice(11, 16)} UTC: ${h.text}`).join(' ')}` : ''
/** Главный агент до сборки не работал — разбудить его словом узла (дверь `alarm`, служба build: без вопроса в Telegram). */
async function wakeMainByNode(root, text) {
  try {
    const r = await post(root, '/api/agents/wake', { service: MAIN, reason: 'alarm', from: 'node', text }, 60_000)
    return r.body?.ok ? null : String(r.body?.reason ?? r.status)
  } catch (e) { return `core-silent: ${e instanceof Error ? e.message : e}` }
}
const nodeText = (summary, rest, kind = 'core-back') => `${nodeLine.head(kind, MAIN)}Node: the core build has finished — ${summary}.${rest} Do what each line asks (read npm run state -- <id> for a report, hand a cut job again with npm run task -- <id> --work); when it is done, npm run done -- --close.`
/** Сборка упала — агентов не возвращаем, но отложенное главному агенту отдаём: прежняя сборка снова работает. */
async function deliverHeld(root, summary, say = console.log) {
  const held = takeHeld(root)
  if (!held.length) return { delivered: 0 }
  for (let i = 0; i < 20; i++) {
    const why = await wakeMainByNode(root, nodeText(summary, heldText(held), 'build-failed'))
    if (!why) { say(`===AGENT_HELD=== главному агенту отдано отложенного: ${held.length}`); return { delivered: held.length } }
    if (!/core-silent|ECONNREFUSED|fetch failed/.test(why)) { hold(root, `(not delivered: ${why})`, 'node'); for (const h of held) hold(root, h.text, h.from); return { delivered: 0, why } }
    await new Promise((r) => setTimeout(r, 3000))
  }
  for (const h of held) hold(root, h.text, h.from)
  return { delivered: 0, why: 'core-silent' }
}

/** После удачной сборки: агенты элементов, затем главный — с итогом о них. Запись стирается в любом случае. */
async function wakeAfter(root, summary, say = console.log) {
  const rec = read(root)
  if (!rec) return { woke: false, reason: 'was-asleep', back: [], refused: [], work: [] }
  const list = Array.isArray(rec.sessions) ? rec.sessions : [{ service: rec.service ?? MAIN, byPerson: true }]
  const one = async (x, text) => {
    try {
      const r = await post(root, '/api/agents/wake', { service: x.service, reason: 'core-back', text, ...(x.byPerson === false ? { from: 'node' } : {}) }, 60_000)
      return r.body?.ok ? null : String(r.body?.reason ?? r.status)
    } catch (e) { return `core-silent: ${e instanceof Error ? e.message : e}` }
  }
  const back = []
  const refused = []
  const work = list.filter((x) => isWork(x.service)).map((x) => x.service)
  for (const x of list.filter((y) => y.service !== MAIN && !isWork(y.service))) {
    const why = await one(x, elementText(summary, x.service))
    if (why) refused.push(`${x.service} (${why})`)
    else back.push(x.service)
  }
  let woke = false
  let reason = 'was-asleep'
  const main = list.find((x) => x.service === MAIN)
  const others = [
    back.length ? ` The build also stopped these element agents, and they are back in their conversations: ${back.join(', ')}.` : '',
    refused.length ? ` These did not come back: ${refused.join('; ')} — wake them with npm run wake -- <id> when memory allows.` : '',
    work.length ? ` These work sessions were stopped and are not continued: ${work.join(', ')} — hand their job again with npm run task -- <id> --work if it was not finished.` : '',
  ].join('')
  if (main) {
    // `core-back` пускает только записанных — запись снимается ПОСЛЕ этого пробуждения.
    const why = await one(main, textOf(summary, others))
    woke = !why
    reason = why ?? 'woke'
  }
  // 696: запись снята — с этой минуты «закончил» элементов будит главного агента сам; отложенное за сборку отдаётся ему сейчас (живому
  // — вставкой в разговор), а если он спал и его ждёт оборванное — его будит узел.
  drop(root)
  const held = takeHeld(root)
  if (main && held.length) await wakeMainByNode(root, `${nodeLine.head('held-during-build', MAIN)}Node:${heldText(held)} Read npm run state -- <id> for each report.`)
  else if (!main && (refused.length || work.length || held.length)) {
    const why = await wakeMainByNode(root, nodeText(summary, others + heldText(held)))
    woke = !why
    reason = why ?? 'woke-by-node'
  }
  say(`===AGENT_RETURN=== главный: ${main ? (woke ? 'вернулся' : `нет — ${reason}`) : 'не работал'} · элементы вернулись: ${back.join(', ') || '—'} · не вернулись: ${refused.join('; ') || '—'} · рабочие сессии: ${work.join(', ') || '—'}`)
  return { woke, reason, back, refused, work }
}

/** Ждун обновления: итог `node-update.json` новее `since` — done будит, иначе запись стирается. */
async function afterUpdate(root, since, { every = 3000, limitMs = 60 * 60_000, say = console.log } = {}) {
  const state = path.join(root, 'data', 'node', 'node-update.json')
  const end = Date.now() + limitMs
  while (Date.now() < end) {
    let u = null
    try { u = JSON.parse(fs.readFileSync(state, 'utf8')) } catch { /* ещё нет */ }
    if (u && u.state !== 'running' && u.finishedAt && Date.parse(u.finishedAt) >= since) {
      if (u.state === 'done') return wakeAfter(root, `the node update is done (${u.summary ?? 'no summary'})`, say)
      drop(root)
      say(`Обновление закончилось без успеха (${u.state}) — агенты не возвращаются.`)
      await deliverHeld(root, `the node update ended without success (${u.state}); the previous build runs`, say)
      return { woke: false, reason: u.state }
    }
    await new Promise((r) => setTimeout(r, every))
  }
  drop(root)
  await deliverHeld(root, 'the node update did not report its end within 60 minutes', say)
  return { woke: false, reason: 'timeout' }
}

module.exports = { noteBefore, wakeAfter, afterUpdate, drop, read, listed, file, textOf, building, hold, takeHeld, deliverHeld }

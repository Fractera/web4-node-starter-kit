// ГЛАВНЫЙ АГЕНТ ВОЗВРАЩАЕТСЯ ПОСЛЕ СБОРКИ ЯДРА (узел, шаг 675-1). Владелец 2026-11-07: «в самом идеальным вариантом было бы авто
// пробуждение после успешного завершения».
//
// 🔒 ЗАПИСЬ — ДО `closeLid`: процесс `claude` главного агента — ребёнок ядра, и закрытая крышка убивает его вместе с ядром. Пока ядро
// живо, оно говорит правду: дверь `/api/agents/session` (`action: "status"`) читает карту живых сессий. Запись — `data/node/agent-return.json`.
// 🔒 ВОЗВРАТ — ТОЛЬКО ПОСЛЕ УДАЧНОЙ СБОРКИ И ТОЛЬКО ТОГО, КТО РАБОТАЛ: спал агент — спит и дальше (страница терминала предложит кнопки);
// сборка упала — запись стирается, будить некого. Возврат — дверь `/api/agents/wake` с `reason: "core-back"`: тот же разговор
// (`claude --continue`) и строка узла о том, чем кончилась сборка.
// 🔒 ОБНОВЛЕНИЕ УЗЛА ДОЖИДАЕТСЯ ОТДЕЛЬНЫЙ ЖДУН: сборка внутри обновления — не последний его этап (каталог, навыки), а `node-update.mjs`,
// который принёс этот шаг, — прежний, уже загруженный в память. Поэтому `serve.mjs rebuild` при `FRACTERA_BUILD_WHAT=update` запускает
// вне дерева ядра `scripts/agent-return.mjs`: он ждёт итог `data/node/node-update.json` (не дольше 60 минут) и выходит. Событие, не таймер.
const fs = require('node:fs')
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

/** До `closeLid`: работает ли сейчас главный агент. Ядро не ответило — ничего не записано, возвращать некого. */
async function noteBefore(root, what = 'core', say = console.log) {
  fs.rmSync(file(root), { force: true })
  let running = false
  try {
    const r = await post(root, '/api/agents/session', { service: MAIN, action: 'status' })
    // Ядро прежнего выпуска ещё не знает `status` (400) — то обновление, что приносит этот шаг: тогда запись сессии самого моста.
    running = r.status === 400 ? modeSaysRunning(root) : Boolean(r.body?.running)
  } catch { /* ядро молчит */ }
  if (!running) { say('Главный агент не запущен — после сборки он не будится.'); return false }
  fs.mkdirSync(path.dirname(file(root)), { recursive: true })
  fs.writeFileSync(file(root), JSON.stringify({ service: MAIN, what, at: new Date().toISOString() }, null, 2) + '\n')
  say('Главный агент работает — сборка его остановит; после удачной сборки он вернётся в тот же разговор.')
  return true
}

const read = (root) => { try { return JSON.parse(fs.readFileSync(file(root), 'utf8')) } catch { return null } }
const drop = (root) => fs.rmSync(file(root), { force: true })

/** Текст узла для вернувшегося агента: английский, как все строки узла агенту; ответ человеку — на его языке. */
const textOf = (summary) => `Node: the core build you started has finished — ${summary}. It stopped your session at the build; this is your conversation with the person, continued by the node, not a task from the node: do not close yourself. Check the result (npm run serve:status), go on from where you stopped and tell the person in their language.`

/** После удачной сборки: был запись — разбудить, записи нет — ничего. Запись стирается в любом случае. */
async function wakeAfter(root, summary, say = console.log) {
  const rec = read(root)
  drop(root)
  if (!rec) return { woke: false, reason: 'was-asleep' }
  try {
    const r = await post(root, '/api/agents/wake', { service: rec.service ?? MAIN, reason: 'core-back', text: textOf(summary) }, 60_000)
    const ok = Boolean(r.body?.ok)
    say(ok ? `===AGENT_RETURN=== главный агент вернулся (${r.body.already ? 'уже работал' : 'тот же разговор'})` : `===AGENT_RETURN_FAILED=== ${r.body?.reason ?? r.status}`)
    return { woke: ok, reason: ok ? 'woke' : String(r.body?.reason ?? r.status) }
  } catch (e) {
    say(`===AGENT_RETURN_FAILED=== ядро не ответило: ${e instanceof Error ? e.message : e}`)
    return { woke: false, reason: 'core-silent' }
  }
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
      say(`Обновление закончилось без успеха (${u.state}) — главный агент не будится.`)
      return { woke: false, reason: u.state }
    }
    await new Promise((r) => setTimeout(r, every))
  }
  drop(root)
  return { woke: false, reason: 'timeout' }
}

module.exports = { noteBefore, wakeAfter, afterUpdate, drop, read, file, textOf }

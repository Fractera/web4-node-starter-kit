// ОДАЛЖИВАНИЕ ПОДПИСКИ УЗЛА (686-6) — модель работы, которую рука не может закончить на своей подписке, идёт на «одолженном топливе».
// Владелец 2026-11-08: «если сотрудник по определённым причинам не в состоянии завершить работу руководитель должен завершить её сам …
// переключить его на свою подписку для завершения этой работы и вернуть обратно его подписку после завершения работы»; «первостепенные
// задача тебе оставаться в сознании … ты должен прогнозировать что после завершения текущей работы в элементе у тебя сохранится хотя бы15%
// тогда да можешь делегировать одновременно если ты это уже сделал с другим элементом то стоит учитывать этот факт». CLAUDE.md §1.
//
// Запись `data/node/lending/<id>.json` (вне git): пока она есть И у подписки узла по последнему замеру (`data/node/limits/node.json`,
// строка состояния, 686-2) в обоих окнах израсходовано меньше 85 %, сессия элемента стартует на входе узла (`workspace.cjs`
// ownClaudeDir → null). Ниже 15 % — пауза: следующая сессия снова на своей подписке элемента, запись ждёт. Конец сессии элемента
// возвращает долг сам (хук пульса, `session-end`). Каждое одалживание и возврат — строка журнала `data/node/lending/journal.jsonl`
// с замером узла в обе минуты: так считается, сколько стоило.
// 🛑 Только элементу на СВОЕЙ подписке (689: своя папка Claude Code — подписка своего человека); две подписки одного человека ради лимитов
// — против правил Anthropic (навык provider-rules), этот код их не различает — различает главный агент.
const fs = require('fs')
const path = require('path')

const KEEP = 15
const ID = /^[a-z][a-z0-9-]{0,39}$/
const dirOf = (root) => path.join(root, 'data', 'node', 'lending')
const readJson = (f) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')) } catch { return null } }

function nodeLimits(root) {
  return readJson(path.join(root, 'data', 'node', 'limits', 'node.json'))
}

function active(root) {
  const dir = dirOf(root)
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => readJson(path.join(dir, f))).filter((r) => r && ID.test(r.element ?? ''))
}

const used = (lim) => [lim?.fiveHour?.used, lim?.sevenDay?.used].filter((x) => typeof x === 'number')

/** Можно ли сейчас вести сессии в долг: замер узла есть и в обоих окнах осталось больше KEEP. */
function nodeHasRoom(root) {
  const u = used(nodeLimits(root))
  return u.length > 0 && Math.max(...u) < 100 - KEEP
}

/** Ведётся ли сессия этого элемента на подписке узла прямо сейчас (запись есть и узлу хватает). */
function onLoan(root, element) {
  if (!ID.test(String(element ?? ''))) return false
  return fs.existsSync(path.join(dirOf(root), `${element}.json`)) && nodeHasRoom(root)
}

function journal(root, rec) {
  fs.mkdirSync(dirOf(root), { recursive: true })
  fs.appendFileSync(path.join(dirOf(root), 'journal.jsonl'), JSON.stringify(rec) + '\n')
}

/** Прогноз: израсходовано узлом сейчас + обещанное всем текущим одалживаниям + цена этой работы — не больше 100 − KEEP. */
function forecast(root, cost) {
  const lim = nodeLimits(root)
  const u = used(lim)
  const owed = active(root).reduce((s, r) => s + (Number(r.cost) || 0), 0)
  if (!u.length) return { ok: false, why: 'the node\'s limit is not measured yet — a node session\'s status line writes it (686-2)', lim, owed }
  const now = Math.max(...u)
  const after = now + owed + cost
  return { ok: after <= 100 - KEEP, now, owed, after, keep: 100 - after, lim }
}

function lend(root, element, { cost, reason }) {
  if (!ID.test(String(element ?? ''))) return { ok: false, why: 'no such element id' }
  if (fs.existsSync(path.join(dirOf(root), `${element}.json`))) return { ok: false, why: `${element} already runs on the node's subscription` }
  const f = forecast(root, cost)
  if (!f.ok) return { ok: false, why: f.why ?? `the forecast leaves the leader ${Math.round(f.keep)} % (now ${f.now} %, promised ${f.owed} %, this job ${cost} %) — below ${KEEP} %`, forecast: f }
  const rec = { element, since: new Date().toISOString(), cost, reason: String(reason ?? '').slice(0, 200), nodeUsedAtStart: f.now }
  fs.mkdirSync(dirOf(root), { recursive: true })
  fs.writeFileSync(path.join(dirOf(root), `${element}.json`), JSON.stringify(rec, null, 2))
  journal(root, { at: rec.since, event: 'lent', element, cost, reason: rec.reason, nodeUsed: f.now })
  return { ok: true, rec, forecast: f }
}

function giveBack(root, element, why = 'returned') {
  const file = path.join(dirOf(root), `${element}.json`)
  const rec = readJson(file)
  if (!rec) return { ok: false, why: `${element} does not run on the node's subscription` }
  fs.rmSync(file, { force: true })
  const u = used(nodeLimits(root))
  const nodeUsed = u.length ? Math.max(...u) : null
  journal(root, { at: new Date().toISOString(), event: why, element, since: rec.since, nodeUsedAtStart: rec.nodeUsedAtStart, nodeUsed, spent: nodeUsed !== null && typeof rec.nodeUsedAtStart === 'number' ? nodeUsed - rec.nodeUsedAtStart : null })
  return { ok: true, rec, nodeUsed }
}

module.exports = { KEEP, active, forecast, lend, giveBack, onLoan, nodeHasRoom }

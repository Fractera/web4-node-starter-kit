// ПРАВИЛО НАГРУЗКИ УЗЛА (узел, шаг 663-3). `node scripts/load-rule.mjs [--why <событие>] [--settle <сек>] [--free <МБ>] [--dry]`
//
// 🎯 Владелец 2026-11-06 (пороги): «if free memory is more then 1gb - с сообщением ваm if less 0.5 gb = auto» — больше 1 ГБ свободно —
// ничего; от 1 до 0,5 ГБ — предложение в главный чат и «да» человека; меньше 0,5 ГБ — элементы класса `auto` (паспорт, 663-1) засыпают
// сами, с сообщением. И: «именно он должен сказать что мы подходим к пределу в котором нужно поднимать вычислительные мощности сервера …
// особенно тревожно сообщать если мы подошли к чёрте вплотную или даже пересекли её» — тревога с цифрами.
// Заменяет правило глубокой памяти 601 (`memory-by-free.mjs`): память — один из элементов `auto`; она, как и все, просыпается сама,
// когда свободно больше 1 ГБ, если её усыпило правило.
//
// 🔒 КОГДА: при старте ядра (`instrumentation.ts`, после каждой сборки тоже), перед сессией агента (мост `modes.cjs`), после
// пробуждения по календарю (663-4). Таймера опроса нет — закон «незаказанное поведение»; скачок нагрузки между событиями правило не
// видит, и тревога говорит это словами. Повтор чаще раза в 2 минуты пропускается; одно и то же предложение — не чаще раза в 6 часов,
// тревога — раз в 6 часов.
// 🔒 ЧТО ТРОГАЕТ: только `switch: auto`; `never` (auth, data, root, storage) и `manual` (stripe) — никогда. Выключает с пометкой
// `byRule` (не выбор человека) и включает обратно только помеченное им же.
// 🔒 КАК ГОВОРИТ: дверь уведомлений ядра (`/api/node/notice`, род `load`) — в главный чат ботом главного агента, без модели. «Да» на
// предложение исполняет главный агент (`npm run power -- <id> off "<причина>"`, навык `element-power`).
import { spawnSync } from 'node:child_process'
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
const require = createRequire(import.meta.url)
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const power = require('../lib/web4-items/element-power.cjs')
const { LIMITS } = require('../lib/free-memory.cjs')

const args = process.argv.slice(2)
const opt = (k) => (args.includes(k) ? args[args.indexOf(k) + 1] : undefined)
const dry = args.includes('--dry')
const why = opt('--why') ?? 'start'
const settle = Number(opt('--settle') ?? 0)
const forcedFree = opt('--free') !== undefined ? Number(opt('--free')) : null
const STATE = join(ROOT, 'data', 'node', 'load-rule.json')
const LOG = join(ROOT, 'logs', 'load-rule.log')
const SIX_HOURS = 6 * 3600 * 1000
const MARGIN_MB = 256 // элемент возвращается, только если и после него останется больше 1 ГБ + запас

const readJson = (p, d) => { try { return JSON.parse(readFileSync(p, 'utf8')) } catch { return d } }
function say(line) {
  const row = `${new Date().toISOString()} ${line}`
  console.log(row)
  if (dry) return
  try { mkdirSync(dirname(LOG), { recursive: true }); appendFileSync(LOG, row + '\n', 'utf8') } catch { /* журнал — не условие */ }
}
const env = (() => {
  const out = {}
  try {
    for (const line of readFileSync(join(ROOT, '.env.local'), 'utf8').split(/\r?\n/)) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
      if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '')
    }
  } catch { /* нет окружения — уведомления не уйдут, решение всё равно в журнале */ }
  return out
})()
const RU = (env.NEXT_PUBLIC_LANG || env.NEXT_PUBLIC_DEFAULT_LOCALE || 'ru') !== 'en'
const gb = (mb) => { const s = (mb / 1024).toFixed(1); return RU ? s.replace('.', ',') : s }

async function notice(text) {
  if (dry) { console.log(`--- уведомление (не отправлено, --dry):\n${text}\n---`); return }
  const port = readJson(join(ROOT, 'logs', 'runtime.json'), {})?.port ?? 24680
  try {
    const r = await fetch(`http://localhost:${port}/api/node/notice`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-node-key': env.SETTINGS_SECRET ?? '' },
      body: JSON.stringify({ from: 'build', kind: 'load', text }),
      signal: AbortSignal.timeout(15_000),
    })
    say(`уведомление ${r.ok ? 'отправлено' : `не принято (${r.status})`}`)
  } catch (e) { say(`уведомление не отправлено: ${e instanceof Error ? e.message : e}`) }
}

function report() {
  const r = spawnSync(process.execPath, [join(ROOT, 'scripts', 'load.mjs'), '--json', ...(forcedFree !== null ? ['--free', String(forcedFree)] : [])], { cwd: ROOT, encoding: 'utf8', windowsHide: true })
  try { return JSON.parse(r.stdout) } catch { return null }
}
function setPower(id, on, mb) {
  const a = [join(ROOT, 'scripts', 'element-power.mjs'), id, on ? 'on' : 'off']
  if (!on) a.push(RU ? 'Усыплён правилом нагрузки: мало свободной памяти' : 'Put to sleep by the load rule: little free memory', '--mb', String(mb))
  a.push('--by-rule')
  if (dry) { say(`(dry) ${on ? 'включил бы' : 'усыпил бы'} ${id}`); return true }
  return spawnSync(process.execPath, a, { cwd: ROOT, stdio: 'inherit', windowsHide: true }).status === 0
}
// Цена сна: календарь в ближайшие сутки, видимость в Web4, кто его зовёт. Порядок — меньшая потеря, затем больший вес.
const loss = (e) => (e.nextEntry && Date.parse(e.nextEntry.at) - Date.now() < 86_400_000 ? 2 : 0) + (e.web4 ? 1 : 0) + e.calledBy.length
const line = (e) => {
  const parts = [`${e.id} (${e.mb} ${RU ? 'МБ' : 'MB'}`]
  if (e.calledBy.length) parts.push(RU ? `его зовут ${e.calledBy.join(', ')} — разбудят вызовом` : `called by ${e.calledBy.join(', ')} — a call wakes it`)
  if (e.nextEntry) parts.push(RU ? `календарь ${e.nextEntry.local} — проснётся за 2 минуты` : `calendar ${e.nextEntry.local} — wakes 2 minutes ahead`)
  return parts.join('; ') + ')'
}

if (settle > 0) await new Promise((r) => setTimeout(r, settle * 1000))
const state = readJson(STATE, {})
if (!dry && forcedFree === null && state.lastRunAt && Date.now() - Date.parse(state.lastRunAt) < 120_000) {
  console.log(`===LOAD_RULE=== пропуск: прошлый замер ${state.lastRunAt} (меньше 2 минут)`)
  process.exit(0)
}
const rep = report()
if (!rep) { say('===LOAD_RULE=== замер не удался (load.mjs)'); process.exit(1) }
const free = rep.freeMb
const els = rep.elements
const asleepByRule = els.filter((e) => e.status === 'off' && e.byRuleOff)
const candidates = els.filter((e) => e.switch === 'auto' && e.status === 'online').sort((a, b) => loss(a) - loss(b) || b.mb - a.mb)
const never = els.filter((e) => e.switch === 'never').reduce((t, e) => t + e.mb, 0)
const decision = { at: new Date().toISOString(), why, free, zone: rep.zone, did: [], proposed: [], alarm: null }

if (rep.zone === 'ok') {
  // Вернуть усыплённое правилом, пока и после него останется больше 1 ГБ с запасом.
  let left = free
  for (const e of asleepByRule.sort((a, b) => (a.offMb ?? 150) - (b.offMb ?? 150))) {
    const need = e.offMb ?? 150
    if (left - need <= LIMITS.proposeBelowMb + MARGIN_MB) break
    if (setPower(e.id, true)) { decision.did.push(`on:${e.id}`); left -= need }
  }
} else if (rep.zone === 'propose') {
  let projected = free
  const pick = []
  for (const e of candidates) { if (projected > LIMITS.proposeBelowMb) break; pick.push(e); projected += e.mb }
  const ids = pick.map((e) => e.id).join(',')
  if (pick.length === 0) {
    decision.alarm = 'near'
  } else if (state.lastProposal?.ids !== ids || Date.now() - Date.parse(state.lastProposal.at) > SIX_HOURS) {
    decision.proposed = pick.map((e) => e.id)
    const freed = pick.reduce((t, e) => t + e.mb, 0)
    await notice(RU
      ? `Свободной памяти осталось ${gb(free)} ГБ (порог 1 ГБ). Предлагаю усыпить: ${pick.map(line).join(', ')}. Освободится около ${gb(freed)} ГБ. Скажите «да» — усыплю; «нет» — оставлю как есть.`
      : `Only ${gb(free)} GB of memory is free (the threshold is 1 GB). I propose to put to sleep: ${pick.map(line).join(', ')}. About ${gb(freed)} GB would be freed. Say «yes» and I will; «no» leaves it as it is.`)
    state.lastProposal = { ids, at: decision.at }
  }
} else {
  let projected = free
  for (const e of candidates) {
    if (projected >= LIMITS.autoBelowMb) break
    if (setPower(e.id, false, e.mb)) { decision.did.push(`off:${e.id}`); projected += e.mb }
  }
  const slept = candidates.filter((e) => decision.did.includes(`off:${e.id}`))
  if (slept.length) {
    await notice(RU
      ? `Свободной памяти было ${gb(free)} ГБ — меньше 0,5 ГБ. Усыпил сам: ${slept.map(line).join(', ')}. Они проснутся по вызову и вернутся сами, когда свободно станет больше 1 ГБ. Включить сейчас — скажите «включи <имя>».`
      : `Free memory was ${gb(free)} GB — below 0.5 GB. I put to sleep: ${slept.map(line).join(', ')}. They wake on a call and come back by themselves above 1 GB free. To turn one on now, say «turn on <name>».`)
  }
  if (projected < LIMITS.autoBelowMb) decision.alarm = 'crossed'
}

if (decision.alarm && (!state.lastAlarmAt || Date.now() - Date.parse(state.lastAlarmAt) > SIX_HOURS || decision.alarm === 'crossed' && state.lastAlarm !== 'crossed')) {
  // Совет — вдвое больше памяти этой машины, не меньше 16 ГБ: на 16-гигабайтной машине «от 16 ГБ» ничего не меняет.
  const target = Math.max(16, 2 ** Math.ceil(Math.log2(rep.totalMb / 1024 + 1)))
  const head = decision.alarm === 'crossed'
    ? (RU ? '⚠ Узел перешёл черту памяти' : '⚠ The node crossed the memory line')
    : (RU ? '⚠ Узел подходит к пределу памяти' : '⚠ The node is approaching its memory limit')
  await notice(RU
    ? `${head}: свободно ${gb(free)} ГБ из ${gb(rep.totalMb)}, узел занимает ${gb(rep.nodeMb)} ГБ, из них ${gb(never)} ГБ — элементы, которые не засыпают. Усыплять больше нечего. Пора на сервер мощнее: компьютер или VPS от ${target} ГБ — спросите меня, и я расскажу, как переехать. Проверка шла при событии «${why}»; скачок между проверками правило не видит.`
    : `${head}: ${gb(free)} GB free of ${gb(rep.totalMb)}, the node takes ${gb(rep.nodeMb)} GB, ${gb(never)} GB of it by elements that never sleep. Nothing more can sleep. Time for a stronger machine: a computer or a VPS with ${target} GB or more — ask me and I will tell how to move. Checked at «${why}»; a spike between checks is not seen.`)
  state.lastAlarmAt = decision.at
  state.lastAlarm = decision.alarm
}

state.lastRunAt = decision.at
state.last = decision
if (!dry) { try { mkdirSync(dirname(STATE), { recursive: true }); writeFileSync(STATE, JSON.stringify(state, null, 2) + '\n') } catch { /* состояние — не условие */ } }
say(`===LOAD_RULE=== ${why}: free ${free} MB, zone ${rep.zone}; did [${decision.did.join(' ')}]; proposed [${decision.proposed.join(' ')}]; alarm ${decision.alarm ?? 'none'}`)

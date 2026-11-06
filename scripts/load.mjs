// НАГРУЗКА УЗЛА ОДНОЙ КОМАНДОЙ (узел, шаг 663-2): `npm run load [-- --json] [--free <МБ>]`.
//
// 🎯 Владелец 2026-11-06: «взвешивать насколько ценным этот элемент остается в статическом режиме, насколько важно поддерживать его рабочие
// автоматизации? И в эпоху Web4 … не случится ли так что мы отключим этого агента а он не сможет принять заявку а2а … именно он должен
// сказать что мы подходим к пределу». Команда отвечает на три вопроса: сколько свободно, кто сколько весит, кто может уснуть и что мы
// при этом теряем — ближайшую запись календаря, видимость в сети Web4, публичный адрес, тех, кто его вызывает. Без модели и без таймера:
// её читает человек, главный агент (навык `element-power`) и правило нагрузки (663-3, `--json`).
// `--free` — подставное число доступной памяти для прибора.
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
const require = createRequire(import.meta.url)
// `--root <папка узла>` — прочитать другой узел (прибор: клон разработки читает узел владельца; только чтение).
const rootArg = process.argv.includes('--root') ? process.argv[process.argv.indexOf('--root') + 1] : null
const ROOT = rootArg ? path.resolve(rootArg) : path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
process.chdir(ROOT)
const power = require('../lib/web4-items/element-power.cjs')
const paths = require('../lib/web4-items/paths.cjs')
const { readElementProps } = require('../lib/web4-items/element-props.cjs')
const { visibilityOf } = require('../lib/web4-items/element-web4.cjs')
const calendar = require('../lib/web4-items/element-calendar.cjs')
const { availableMb, LIMITS } = require('../lib/free-memory.cjs')

const args = process.argv.slice(2)
const asJson = args.includes('--json')
const freeArg = args.includes('--free') ? Number(args[args.indexOf('--free') + 1]) : null
const IS_WIN = process.platform === 'win32'
const MB = 1048576

function childEnv() {
  const env = {}
  for (const [k, v] of Object.entries(process.env)) if (!/^(__NEXT|NEXT_|AGI_)/.test(k) && !['PORT', 'HOSTNAME', 'NODE_ENV'].includes(k)) env[k] = v
  return env
}
function pm2List() {
  const r = spawnSync(IS_WIN ? 'pm2.cmd' : 'pm2', ['jlist'], { cwd: ROOT, shell: IS_WIN, windowsHide: true, env: childEnv(), encoding: 'utf8' })
  try { return JSON.parse((r.stdout || '').slice((r.stdout || '').indexOf('['))) } catch { return [] }
}
const readJson = (p) => { try { return JSON.parse(readFileSync(p, 'utf8')) } catch { return null } }

const apps = new Map(pm2List().map((a) => [a.name, { mb: Math.round((a.monit?.memory || 0) / MB), status: a.pm2_env?.status || '?' }]))
const zone = readJson(path.join(ROOT, 'logs', 'domain.json'))?.zone || null
const services = power.readRegistry(ROOT).services || []
const propsOf = new Map(services.map((s) => [s.id, readElementProps(paths.entryDir(s)) || {}]))
const callers = (id) => services.filter((s) => (propsOf.get(s.id).calls || []).includes(id)).map((s) => s.id)

const rows = services.map((s) => {
  const props = propsOf.get(s.id)
  const pw = props.power || {}
  const server = apps.get(`fractera-svc-${s.id}`)
  const legacyWatch = apps.get(`fractera-svc-${s.id}-watch`)
  const off = power.offOf(s)
  const next = calendar.nextDue(calendar.readPlan(paths.entryDir(s)))
  const own = readJson(path.join(ROOT, 'data', 'services', s.id, 'domain.json'))?.domain || null
  const address = paths.addressOf(s.id) || s.id
  return {
    id: s.id,
    switch: ['never', 'manual', 'auto'].includes(pw.switch) ? pw.switch : 'manual',
    wakeOnCall: pw.wakeOnCall === true,
    status: off ? 'off' : server ? server.status : 'not-running',
    offReason: off ? power.reasonIn(off, 'ru') : null,
    // 663-3: усыплён правилом нагрузки (`off.byRule`) и его вес в тот момент — по ним правило вернёт элемент.
    byRuleOff: Boolean(off?.byRule),
    offMb: Number.isFinite(off?.mb) ? off.mb : null,
    mb: (server?.mb || 0) + (legacyWatch?.mb || 0),
    nextEntry: next ? { at: next.at.toISOString(), local: `${calendar.ymd(next.at)} ${calendar.hm(next.at)}`, id: next.schedule.id, event: next.schedule.event } : null,
    web4: visibilityOf(s.id, ROOT) === 'network',
    publicAddress: own ? `https://${own}` : zone ? `https://${address}.${zone}` : null,
    calledBy: callers(s.id),
  }
})

const core = ['fractera-web4', 'fractera-web4-watch', 'fractera-web4-tunnel', 'fractera-web4-domain', 'fractera-elements-watch', 'fractera-gatekeeper']
  .filter((n) => apps.has(n)).map((n) => ({ name: n, mb: apps.get(n).mb, status: apps.get(n).status }))
const totalMb = Math.floor(os.totalmem() / MB)
const freeMb = freeArg ?? availableMb()
const nodeMb = [...apps.entries()].filter(([n]) => n.startsWith('fractera-')).reduce((t, [, a]) => t + a.mb, 0)
const sleepable = rows.filter((r) => r.switch === 'auto' && r.status === 'online')
const zoneOf = (mb) => (mb > LIMITS.proposeBelowMb ? 'ok' : mb >= LIMITS.autoBelowMb ? 'propose' : 'auto')
const report = {
  at: new Date().toISOString(), totalMb, freeMb, nodeMb, zone: zoneOf(freeMb), limits: LIMITS,
  sleepableMb: sleepable.reduce((t, r) => t + r.mb, 0), core, elements: rows,
}

if (asJson) {
  console.log(JSON.stringify(report, null, 2))
  process.exit(0)
}

const ZONE = { ok: 'всё спокойно — больше 1 ГБ свободно', propose: 'от 1 до 0,5 ГБ — правило предложит, что усыпить, и подождёт «да»', auto: 'меньше 0,5 ГБ — правило усыпит выключаемые само' }
const CLASS = { never: 'никогда', manual: 'вручную', auto: 'сам' }
const gb = (mb) => (mb / 1024).toFixed(1).replace('.', ',')
console.log(`Память: свободно ${gb(freeMb)} ГБ из ${gb(totalMb)} · узел занимает ${gb(nodeMb)} ГБ · ${ZONE[report.zone]}`)
console.log(`Можно усыпить сейчас: ${sleepable.length} элементов, ${gb(report.sleepableMb)} ГБ`)
console.log('')
console.log('элемент       сон       МБ   состояние      что теряем во сне')
for (const r of [...rows].sort((a, b) => b.mb - a.mb)) {
  const loss = [
    r.nextEntry ? `календарь ${r.nextEntry.local}` : null,
    r.web4 ? 'виден в Web4' : null,
    r.publicAddress ? `адрес ${r.publicAddress}` : null,
    r.calledBy.length ? `его зовут: ${r.calledBy.join(', ')}` : null,
  ].filter(Boolean).join(' · ') || '—'
  const cls = CLASS[r.switch] + (r.wakeOnCall ? '+вызов' : '')
  const st = r.status === 'off' ? `выключен${r.byRuleOff ? ' (правило)' : ''}` : r.status
  console.log(`${r.id.padEnd(13)} ${cls.padEnd(9)} ${String(r.mb).padStart(4)}  ${st.padEnd(14)} ${r.switch === 'never' ? 'не засыпает' : loss}`)
}
for (const c of core) console.log(`${c.name.replace('fractera-', '').padEnd(13)} ${'ядро'.padEnd(9)} ${String(c.mb).padStart(4)}  ${c.status}`)
console.log(`\n===LOAD=== free ${freeMb} MB · node ${nodeMb} MB · zone ${report.zone} · sleepable ${report.sleepableMb} MB`)

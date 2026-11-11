// ОБНОВЛЕНИЕ УЗЛА ИЗ СИНХРОНИЗИРОВАННОГО ФОРКА (узел, шаг 632-3): `npm run node:update` — или кнопка «Обновить узел» полосы
// «версия устарела» (дверь `POST /api/node/update` запускает его через `scripts/spawn-free.mjs`: пересборка ядра останавливает само
// ядро, а этот процесс доживает до итога).
//
// 🎯 Владелец 2026-11-03: «синхронизацию я уже выполнил наверно было бы логично здесь поставить вторую кнопку запустить
// развёртывание?» — и «sync success, next steps will for you». В тот же час узел владельца обновлён руками (current-steps.md, план
// 632); этот скрипт — тот же порядок одной командой:
//   1. форк забирается (`git fetch origin`); нового нет — выход;
//   2. копия несохранённого — `logs/node-update/<время>/`: разница отслеживаемых файлов, состояние, реестр; добавленные и
//      неотслеживаемые файлы — АРХИВОМ (✗ 2026-11-03: копия `.tsx` в `logs/` сломала сборку ядра — ANTI-PATTERNS);
//   3. несохранённое разбирается ДО любой правки: копия файла форка (как в форке или его прежняя версия) и порождённое сборкой —
//      убирается; чья-то своя работа — ОТКАЗ со списком, и ничего не тронуто;
//   4. форк сливается, а шаги разработки узла остаются его собственными (`development-docs/development-steps/` — свежий проект:
//      планы и итоги стартера в узел не возвращаются, `current-steps.md` — узла);
//   5. реестр: закрепления и описания — форка, состояние узла (порты, выключения, рождённые элементы, тип узла) — узла; 720-2: и
//      свои записи узла в дереве git — настройки сайта (слияние по ключам), записи раздела 9 CLAUDE.md, свои шаги (`lib/deploy/node-records.cjs`);
//   6. зависимости, если `package.json` их сменил; сторожа сборки — ОТДЕЛЬНО, до остановки узла: упали — откат, узел как был;
//   7. элементы на закрепления (`services-install`; второй проход — на случай сбоя сети), новые элементы включаются;
//   8. сборка ядра с закрытой крышкой (упала — прежняя сборка возвращается сама); база навыков — в граф (повтор безопасен).
// Ход — в стандартный вывод (дверь пишет его в `logs/node-update.log`), итог — `data/node/node-update.json`:
// state running → done | refused | failed, stage, summary | reason.
// 🛑 Только в форке (`logs/origin.json` verdict `fork`): у оригинала и у машины автора история своя.
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, rmdirSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
// 642-4: причина отказа простыми словами.
const { causeOf } = require('../lib/deploy/build-failure.cjs')
// 720-2: the node's records inside the core's git tree (the site settings, section 9 entries, its own steps) survive the merge.
const records = require('../lib/deploy/node-records.cjs')
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const IS_WIN = process.platform === 'win32'
const STATE = join(ROOT, 'data', 'node', 'node-update.json')
const REGISTRY_REL = 'WEB4-ITEMS-REGISTRY/web4-items.json'
const REGISTRY = join(ROOT, REGISTRY_REL)
const STEPS = 'development-docs/development-steps/'
// 666: файлы, которые у узла свои целиком (свежий проект, `scripts/fresh-project.mjs`): его текущие шаги и его отмены. ✗ 2026-11-06: строка,
// дописанная в `CANCELLED.md` оригинала, остановила обновление узла владельца конфликтом («слияние (development-docs/CANCELLED.md) не
// прошёл»), хотя закон самого файла — «It arrives in a new node with this node's own entries only».
const NODE_OWN = [`${STEPS}current-steps.md`, 'development-docs/CANCELLED.md']
const FORK = 'origin/main'
const GENERATED = /(^|\/)_list\.generated\.ts$/
// Поля записи реестра, которые принадлежат форку: закрепление и описание. Всё остальное в записи — состояние узла.
const FORK_KEYS = new Set(['repo', 'version', 'note', 'provides', 'required', 'kind'])
const startedAt = new Date().toISOString()
const BACKUP = join(ROOT, 'logs', 'node-update', startedAt.replace(/[:.]/g, '-'))

// Родитель может быть сервером Next ядра: его метки в окружении заставили бы сборки не читать свой `.env.local` (ANTI-PATTERNS).
const env = { ...process.env }
for (const k of Object.keys(env)) if (/^(__NEXT|NEXT_|AGI_|WEB4_COMMIT)/.test(k) || ['PORT', 'HOSTNAME', 'NODE_ENV'].includes(k)) delete env[k]

let current = 'check'
const say = (s) => console.log(s)
const write = (s) => {
  mkdirSync(dirname(STATE), { recursive: true })
  writeFileSync(STATE, JSON.stringify({ pid: process.pid, startedAt, stage: current, ...s }, null, 2) + '\n')
}
const stage = (name, words) => { current = name; write({ state: 'running' }); say(`\n── ${words}`) }
// 719: обновление, кончившееся до сборки ядра, будит главного агента само (`agent-return.mjs --update-stopped`, вне дерева ядра);
// после начала сборки его будит ждун `serve.mjs rebuild` — второй раз не будим.
let building = false
function wakeIfStopped(state, why) {
  if (building || process.env.FRACTERA_NO_WAKE === '1') return
  spawnSync(process.execPath, [join(ROOT, 'scripts', 'spawn-free.mjs'), join(ROOT, 'scripts', 'agent-return.mjs'), '--update-stopped', state, String(why ?? '').slice(0, 600)], { cwd: ROOT, windowsHide: true })
}
function finish(state, extra = {}) {
  // 642-4: отказ — с причиной простыми словами по своему журналу (`FRACTERA_BUILD_LOG` — его ставит запуск по кнопке).
  if (state !== 'done' && process.env.FRACTERA_BUILD_LOG) {
    try { extra = { ...extra, cause: causeOf(readFileSync(process.env.FRACTERA_BUILD_LOG, 'utf8').split(/\r?\n/)) } } catch { /* журнала нет */ }
  }
  write({ state, ...extra, finishedAt: new Date().toISOString() })
  say(`===NODE_UPDATE_${state.toUpperCase()}=== ${extra.summary ?? extra.reason ?? ''}`)
  wakeIfStopped(state, extra.summary ?? extra.reason ?? '')
  process.exit(state === 'done' ? 0 : 1)
}
function git(args, { raw = false } = {}) {
  const r = spawnSync('git', args, { cwd: ROOT, encoding: 'utf8', windowsHide: true, env, maxBuffer: 512 * 1024 * 1024 })
  // ✗ Замерено на модели узла: обрезанный хвост вывода `git diff` портит патч (последняя строка контекста — пробел), и откат не
  // возвращал изменённые файлы. Разница берётся как есть (`raw`).
  return { ok: r.status === 0, out: raw ? (r.stdout ?? '') : (r.stdout ?? '').replace(/\s+$/, ''), err: (r.stderr ?? '').trim() }
}
const must = (r, what) => (r.ok ? r.out : finish('failed', { reason: `${what}: ${r.err.slice(0, 300)}` }))
function run(cmd, args, label) {
  say(`$ ${label}`)
  const r = spawnSync(cmd, args, { cwd: ROOT, stdio: 'inherit', env, windowsHide: true, shell: IS_WIN && cmd.endsWith('.cmd') })
  return r.status === 0
}
const npm = IS_WIN ? 'npm.cmd' : 'npm'
const node = (script, ...args) => [process.execPath, [join(ROOT, 'scripts', script), ...args]]
const readJson = (f) => { try { return JSON.parse(readFileSync(f, 'utf8').replace(/^﻿/, '')) } catch { return null } }

/** `git status --porcelain=v1 -z`: [{ code: 'XY', path }]; у переименования — новый путь. */
function statusEntries() {
  const raw = must(git(['status', '--porcelain=v1', '-z', '--untracked-files=all']), 'git status')
  const parts = raw.split('\0').filter((x) => x !== '')
  const out = []
  for (let i = 0; i < parts.length; i++) {
    const code = parts[i].slice(0, 2)
    out.push({ code, path: parts[i].slice(3) })
    if (code[0] === 'R' || code[0] === 'C') i += 1
  }
  return out
}

/** Содержимое файла узла — копия файла форка: как в форке сейчас или как в одной из его версий после HEAD (перенесённая руками). */
function copyOfFork(path) {
  const file = join(ROOT, path)
  if (!existsSync(file)) return !git(['cat-file', '-e', `${FORK}:${path}`]).ok // удалён и в форке
  const mine = git(['hash-object', '--', file]).out
  if (git(['rev-parse', '-q', '--verify', `${FORK}:${path}`]).out === mine) return true
  for (const c of git(['log', '--format=%H', `HEAD..${FORK}`, '--', path]).out.split('\n').filter(Boolean)) {
    if (git(['rev-parse', '-q', '--verify', `${c}:${path}`]).out === mine) return true
  }
  return false
}

// 716 (the owner 2026-11-10: «их не должно существовать как нативные элементы … сначала убери их»): an element of the node that the fork
// does not list stays — it is the node's own (born, root); a NATIVE one (`kind: core`) belongs to Fractera, so the fork dropping it
// retires it: it leaves the registry here and `scripts/element-retire.mjs` removes its process and folder in stage 7.
// ✗ Before 716 every missing entry stayed: removing Sections and Design from the fork would have kept them on every node as «own».
function retiredNatives(theirs, ours) {
  const forkIds = new Set((theirs?.services ?? []).map((s) => s.id))
  const { isRetired } = require('../lib/web4-items/retired-natives.cjs')
  return (ours?.services ?? []).filter((o) => o.kind === 'core' && !o.born && (!forkIds.has(o.id) || isRetired(o))).map((o) => o.id)
}

function mergeRegistry(theirs, ours) {
  if (!ours) return theirs
  const mine = new Map((ours.services ?? []).map((s) => [s.id, s]))
  const services = (theirs.services ?? []).map((t) => {
    const o = mine.get(t.id)
    return o ? { ...t, ...Object.fromEntries(Object.entries(o).filter(([k]) => !FORK_KEYS.has(k))) } : t
  })
  const known = new Set(services.map((s) => s.id))
  const retired = new Set(retiredNatives(theirs, ours))
  for (const o of ours.services ?? []) if (!known.has(o.id) && !retired.has(o.id)) services.push(o)
  const { _: comment, nodeType: _forkType, services: _s, ...rest } = theirs
  return { ...(comment === undefined ? {} : { _: comment }), ...(ours.nodeType ? { nodeType: ours.nodeType } : {}), ...rest, services }
}

// 707-3: два неправильных запуска — отказ ДО любой правки и без записи итога. ✗ Узел владельца 2026-11-09: `npm run node:update -- --help`
// начал настоящее обновление (аргументов скрипт не читал), а минуту спустя главный агент запустил его своим фоновым ребёнком — крышка
// сборки убила ядро, агента и само обновление посреди сборки, и никто не записал конец. Агент Claude Code несёт `CLAUDECODE=1`; правильный
// запуск (`scripts/node-update-run.mjs` через `spawn-free`, кнопка узла) ставит `FRACTERA_BUILD_LOG`.
if (process.argv.length > 2) {
  console.error(`===NODE_UPDATE_REFUSED=== неизвестные аргументы: ${process.argv.slice(2).join(' ')} — у обновления узла аргументов нет; ничего не тронуто`)
  process.exit(2)
}
if (process.env.CLAUDECODE && !process.env.FRACTERA_BUILD_LOG) {
  console.error('===NODE_UPDATE_REFUSED=== запуск из сессии агента: сборка ядра остановит ядро, а с ним агента и это обновление. Запускать вне своего дерева: node scripts/spawn-free.mjs scripts/node-update-run.mjs (ход — logs/node-update.log); ничего не тронуто')
  process.exit(2)
}

// ── 1. проверка и форк ──────────────────────────────────────────────────────────────────────────────────────────────────────
stage('check', 'проверка')
const origin = readJson(join(ROOT, 'logs', 'origin.json'))
if (origin?.verdict !== 'fork') finish('refused', { reason: `это не форк (${origin?.verdict ?? 'проверки форка не было'}) — история этой копии своя, её обновляют git` })
if (require('../lib/deploy/deploy-lock.cjs').isRunning()) finish('refused', { reason: 'идёт развёртывание элемента — повторите, когда оно закончится' })
if (git(['rev-parse', '-q', '--verify', 'MERGE_HEAD']).ok) finish('refused', { reason: 'в папке узла не закончено слияние git — сначала его нужно закончить или отменить' })
const oldHead = must(git(['rev-parse', 'HEAD']), 'git rev-parse HEAD')

stage('fetch', 'забираю форк')
must(git(['fetch', '--quiet', 'origin']), 'git fetch origin (сеть или доступ к форку)')
const forkCommits = must(git(['rev-list', `HEAD..${FORK}`]), 'git rev-list').split('\n').filter(Boolean)
if (forkCommits.length === 0) finish('done', { summary: 'узел уже на версии форка — обновлять нечего', changes: 0 })
say(`в форке нового: ${forkCommits.length}`)

// ── 2. копия несохранённого ─────────────────────────────────────────────────────────────────────────────────────────────────
stage('backup', `копия несохранённого — ${BACKUP.slice(ROOT.length + 1)}`)
mkdirSync(BACKUP, { recursive: true })
const entries = statusEntries()
const inHead = (p) => git(['cat-file', '-e', `HEAD:${p}`]).ok
const tracked = entries.filter((e) => e.code !== '??' && inHead(e.path)).map((e) => e.path)
const loose = entries.filter((e) => (e.code === '??' || !inHead(e.path)) && existsSync(join(ROOT, e.path))).map((e) => e.path)
writeFileSync(join(BACKUP, 'status.txt'), entries.map((e) => `${e.code} ${e.path}`).join('\n') + '\n')
writeFileSync(join(BACKUP, 'head.txt'), `${oldHead}\n${must(git(['rev-parse', FORK]), 'git rev-parse')}\n`)
writeFileSync(join(BACKUP, 'tracked.diff'), tracked.length ? git(['diff', '--binary', 'HEAD', '--', ...tracked], { raw: true }).out : '')
// Реестр — дословно: откат возвращает его байт в байт, а не пересобранным из JSON.
const oursRegistryRaw = existsSync(REGISTRY) ? readFileSync(REGISTRY, 'utf8') : null
const oursRegistry = readJson(REGISTRY)
if (oursRegistryRaw !== null) writeFileSync(join(BACKUP, 'web4-items.json'), oursRegistryRaw)
if (loose.length) {
  writeFileSync(join(BACKUP, 'files.list'), loose.join('\n') + '\n')
  const t = spawnSync('tar', ['-cf', join(BACKUP, 'files.tar'), '-T', join(BACKUP, 'files.list')], { cwd: ROOT, windowsHide: true })
  if (t.status !== 0) finish('failed', { reason: 'архив добавленных файлов не записан — ничего не тронуто' })
}
const intentToAdd = entries.filter((e) => e.code === ' A').map((e) => e.path)

function rollback(what) {
  say(`\n── откат: «${what}» не прошёл — узел возвращается в точности как был`)
  git(['merge', '--abort'])
  must(git(['reset', '-q', '--hard', oldHead]), 'git reset')
  if (tracked.length) {
    const a = git(['apply', '--binary', '--whitespace=nowarn', join(BACKUP, 'tracked.diff')])
    if (!a.ok) say(`🛑 изменённые файлы не вернулись сами (${a.err.slice(0, 200)}) — они в ${BACKUP.slice(ROOT.length + 1)}/tracked.diff`)
  }
  if (loose.length) spawnSync('tar', ['-xf', join(BACKUP, 'files.tar')], { cwd: ROOT, windowsHide: true })
  if (intentToAdd.length) git(['add', '-N', '--', ...intentToAdd])
  if (oursRegistryRaw !== null) writeFileSync(REGISTRY, oursRegistryRaw)
  finish('failed', { reason: `${what} не прошёл — узел возвращён как был; копия — ${BACKUP.slice(ROOT.length + 1)}, причина — в журнале выше` })
}

// ── 3. разбор несохранённого — до любой правки ───────────────────────────────────────────────────────────────────────────────
stage('local', 'разбираю несохранённое')
const lockOnly = !entries.some((e) => e.path === 'package.json')
const own = []
const drop = []
for (const e of entries) {
  if (e.path === REGISTRY_REL) continue
  if (records.RECORDS.includes(e.path) && e.code !== '??') continue
  // Неотслеживаемый файл, которого нет в форке, слиянию не мешает — он остаётся как есть.
  if (e.code === '??' && !git(['cat-file', '-e', `${FORK}:${e.path}`]).ok) continue
  if (copyOfFork(e.path) || GENERATED.test(e.path) || (e.path === 'package-lock.json' && lockOnly)) drop.push(e)
  else own.push(e.path)
}
if (own.length) {
  finish('refused', {
    reason: `в папке узла несохранённая работа, которую обновление потеряло бы: ${own.slice(0, 10).join(', ')}${own.length > 10 ? ` и ещё ${own.length - 10}` : ''} — её нужно сохранить (коммит) или убрать; ничего не тронуто`,
    own,
  })
}
for (const e of drop) {
  if (inHead(e.path)) {
    git(['reset', '-q', '--', e.path])
    git(['checkout', '-q', '--', e.path])
  } else {
    git(['rm', '-q', '--cached', '--ignore-unmatch', '--', e.path])
    rmSync(join(ROOT, e.path), { force: true })
  }
}
if (entries.some((e) => e.path === REGISTRY_REL)) git(['checkout', '-q', '--', REGISTRY_REL])
say(`убрано копий файлов форка и порождённого: ${drop.length}; состояние реестра узла сохранено`)
const kept = records.take(ROOT, git)
if (kept.length) say(`свои записи узла отложены на время слияния: ${kept.map((k) => k.p).join(', ')}`)

// ── 4. слияние, шаги разработки — узла ──────────────────────────────────────────────────────────────────────────────────────
stage('merge', `сливаю форк: ${forkCommits.length} изменений`)
const merged = git(['merge', '--no-edit', FORK])
if (!merged.ok) {
  const conflicts = git(['diff', '--name-only', '--diff-filter=U']).out.split('\n').filter(Boolean)
  const foreign = conflicts.filter((p) => !p.startsWith(STEPS) && p !== REGISTRY_REL && !NODE_OWN.includes(p))
  if (!conflicts.length || foreign.length) rollback(`слияние (${foreign.slice(0, 6).join(', ') || merged.err.slice(0, 200)})`)
  for (const p of conflicts) {
    if (p === REGISTRY_REL) git(['checkout', '-q', '--theirs', '--', p])
    else if (git(['cat-file', '-e', `HEAD:${p}`]).ok) git(['checkout', '-q', '--ours', '--', p])
    else git(['rm', '-q', '--', p])
    if (existsSync(join(ROOT, p))) git(['add', '--', p])
  }
}
// Планы и итоги стартера в узел не возвращаются (свежий проект, `scripts/fresh-project.mjs`); README папок шагов — от форка.
const added = git(['diff', '--cached', '--name-only', '--diff-filter=A', oldHead, '--', STEPS]).out.split('\n').filter(Boolean)
for (const p of added.filter((x) => !/(^|\/)(README\.md|\.gitkeep)$/.test(x))) {
  git(['rm', '-q', '--cached', '--', p])
  rmSync(join(ROOT, p), { force: true })
  // 666: и папка плана, которая от этого опустела (✗ 2026-11-06: на узле владельца осталась пустая `new-steps/666/`); папки первого
  // уровня (`new-steps/`, `completed-steps/` …) остаются всегда.
  for (let d = dirname(join(ROOT, p)); dirname(d).startsWith(join(ROOT, STEPS)) && dirname(d) !== join(ROOT, STEPS).replace(/[\\/]$/, ''); d = dirname(d)) {
    try { if (readdirSync(d).length) break; rmdirSync(d) } catch { break }
  }
}
// Свои файлы узла — как были до слияния (их в узле нет у оригинала — значит, и брать нечего).
for (const p of NODE_OWN) {
  if (git(['cat-file', '-e', `${oldHead}:${p}`]).ok && git(['diff', '--cached', '--quiet', oldHead, '--', p]).ok === false) git(['checkout', '-q', oldHead, '--', p])
}
if (git(['rev-parse', '-q', '--verify', 'MERGE_HEAD']).ok) {
  must(git(['commit', '-q', '--no-edit', '-m', `Update from the original Fractera (${forkCommits.length} changes of the synced fork); the node keeps its own development steps`]), 'git commit')
} else if (git(['diff', '--cached', '--quiet']).ok === false) {
  // 666: и перемотка без слияния (у узла нет своих коммитов) — возврат своих файлов узла тоже записывается, а не остаётся в индексе.
  must(git(['commit', '-q', '-m', 'The node keeps its own development steps after the update']), 'git commit')
}
const newHead = must(git(['rev-parse', '--short', 'HEAD']), 'git rev-parse')
say(`узел на ${newHead}`)
const back = records.put(ROOT, kept)
if (back.length) say(`свои записи узла вернулись поверх форка: ${back.join(', ')}`)

// ── 5. реестр: закрепления — форка, состояние — узла ────────────────────────────────────────────────────────────────────────
stage('registry', 'реестр: закрепления форка, состояние узла')
const theirsRegistry = readJson(REGISTRY)
if (!theirsRegistry) rollback('чтение реестра после слияния')
const registry = mergeRegistry(theirsRegistry, oursRegistry)
const retired = retiredNatives(theirsRegistry, oursRegistry)
writeFileSync(REGISTRY, JSON.stringify(registry, null, 2) + '\n')
if (retired.length) say(`нативные элементы, которых больше нет у Fractera: ${retired.join(', ')} — сняты с реестра узла, их процессы и папки уйдут на шаге элементов`)

// ── 6. зависимости и сторожа — до остановки узла ────────────────────────────────────────────────────────────────────────────
const depsOf = (rev) => { const j = JSON.parse(git(['show', `${rev}:package.json`]).out || '{}'); return JSON.stringify([j.dependencies, j.devDependencies, j.optionalDependencies]) }
if (depsOf(oldHead) !== depsOf('HEAD')) {
  stage('deps', 'зависимости ядра изменились — npm install')
  if (!run(npm, ['install', '--no-audit', '--no-fund'], 'npm install')) rollback('npm install')
}
stage('guards', 'сторожа сборки ядра — отдельно, пока узел работает')
if (!run(npm, ['run', 'prebuild'], 'npm run prebuild')) rollback('сторожа сборки (npm run prebuild)')

// ── 7. элементы ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
stage('elements', 'элементы на закрепления — без остановки служб')
const warnings = []
// 716: the retired natives first — past the last rollback (the guards), so a moved folder never meets a restored registry.
if (retired.length) {
  const r = node('element-retire.mjs', ...retired)
  if (!run(r[0], r[1], `npm run element:retire -- ${retired.join(' ')}`)) warnings.push(`снятые элементы ${retired.join(', ')} убраны не полностью — npm run element:retire -- ${retired.join(' ')}`)
}
// 692-4: обновление узла не разворачивает чужую работу — элемент со своими неразвёрнутыми коммитами остаётся на своей сборке.
const install = node('services-install.mjs', '--keep-undeployed')
if (!run(install[0], install[1], 'npm run services:install') && !run(install[0], install[1], 'npm run services:install (второй проход — сбой сети бывает)')) {
  warnings.push('часть элементов не встала на новые версии — они работают на прежних; журнал выше')
}
const power = require('../lib/web4-items/element-power.cjs')
const before = new Set((oursRegistry?.services ?? []).map((s) => s.id))
for (const s of readJson(REGISTRY)?.services ?? []) {
  if (before.has(s.id) || power.isOff(s)) continue
  const on = node('element-power.mjs', s.id, 'on')
  if (!run(on[0], on[1], `npm run power -- ${s.id} on`)) warnings.push(`новый элемент ${s.id} не включился`)
}

// ── 8. ядро и база навыков ──────────────────────────────────────────────────────────────────────────────────────────────────
stage('core', 'сборка ядра с закрытой крышкой — на время сборки узел остановлен')
const rebuild = node('serve.mjs', 'rebuild')
building = true
if (!run(rebuild[0], rebuild[1], 'npm run serve:rebuild')) {
  finish('failed', { reason: 'сборка ядра не удалась — прежняя сборка возвращена и запущена; код и элементы уже новые, причина — в журнале', warnings })
}
// 662-1: каталог «Все проекты» — от НОВОГО ядра. ✗ Замерено на узле владельца 2026-11-06: каталог шага 7 (`services-install`) отправлял
// ещё прежний сервер ядра — элементы получали каталог по старым правилам до следующего действия человека.
await require('../lib/web4-items/catalog-notify.cjs').notifyCatalog('update', ROOT, { waitAll: true })
stage('skills', 'база навыков узла — в граф')
// ✗ Замерено на узле владельца 2026-11-03: сразу после сборки ядра граф ещё поднимался (крышка открывает все процессы разом), и
// `base-load` получил тайм-аут, хотя база была на месте. Ждём, пока граф ответит (холодный старт — до 90 с), и только тогда грузим.
const graph = (readJson(REGISTRY)?.services ?? []).find((s) => s.id === 'graph')
if (graph?.port && !power.isOff(graph)) {
  for (let i = 0; i < 45; i++) {
    try { if ((await fetch(`http://127.0.0.1:${graph.port}/api/health`, { signal: AbortSignal.timeout(2000) })).ok) break } catch { /* ещё поднимается */ }
    await new Promise((r) => setTimeout(r, 2000))
  }
}
if (!run(npm, ['run', 'skills-base'], 'npm run skills-base')) warnings.push('база навыков не загрузилась: npm run skills-base')
// 627-3: каталог навыков — готовым файлом из релиза ядра (release.json); те же векторы на месте — ничего не скачивается.
if (!run(npm, ['run', 'skills-catalog'], 'npm run skills-catalog')) warnings.push('каталог навыков не загрузился: npm run skills-catalog')

finish('done', { summary: `${forkCommits.length} изменений форка, ядро ${newHead}${warnings.length ? `; ${warnings.join('; ')}` : ''}`, changes: forkCommits.length, head: newHead, warnings })

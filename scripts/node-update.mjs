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
//   5. реестр: закрепления и описания — форка, состояние узла (порты, выключения, рождённые элементы, тип узла) — узла;
//   6. зависимости, если `package.json` их сменил; сторожа сборки — ОТДЕЛЬНО, до остановки узла: упали — откат, узел как был;
//   7. элементы на закрепления (`services-install`; второй проход — на случай сбоя сети), новые элементы включаются;
//   8. сборка ядра с закрытой крышкой (упала — прежняя сборка возвращается сама); база навыков — в граф (повтор безопасен).
// Ход — в стандартный вывод (дверь пишет его в `logs/node-update.log`), итог — `data/node/node-update.json`:
// state running → done | refused | failed, stage, summary | reason.
// 🛑 Только в форке (`logs/origin.json` verdict `fork`): у оригинала и у машины автора история своя.
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const IS_WIN = process.platform === 'win32'
const STATE = join(ROOT, 'data', 'node', 'node-update.json')
const REGISTRY_REL = 'WEB4-ITEMS-REGISTRY/web4-items.json'
const REGISTRY = join(ROOT, REGISTRY_REL)
const STEPS = 'development-docs/development-steps/'
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
function finish(state, extra = {}) {
  write({ state, ...extra, finishedAt: new Date().toISOString() })
  say(`===NODE_UPDATE_${state.toUpperCase()}=== ${extra.summary ?? extra.reason ?? ''}`)
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

function mergeRegistry(theirs, ours) {
  if (!ours) return theirs
  const mine = new Map((ours.services ?? []).map((s) => [s.id, s]))
  const services = (theirs.services ?? []).map((t) => {
    const o = mine.get(t.id)
    return o ? { ...t, ...Object.fromEntries(Object.entries(o).filter(([k]) => !FORK_KEYS.has(k))) } : t
  })
  const known = new Set(services.map((s) => s.id))
  for (const o of ours.services ?? []) if (!known.has(o.id)) services.push(o)
  const { _: comment, nodeType: _forkType, services: _s, ...rest } = theirs
  return { ...(comment === undefined ? {} : { _: comment }), ...(ours.nodeType ? { nodeType: ours.nodeType } : {}), ...rest, services }
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

// ── 4. слияние, шаги разработки — узла ──────────────────────────────────────────────────────────────────────────────────────
stage('merge', `сливаю форк: ${forkCommits.length} изменений`)
const merged = git(['merge', '--no-edit', FORK])
if (!merged.ok) {
  const conflicts = git(['diff', '--name-only', '--diff-filter=U']).out.split('\n').filter(Boolean)
  const foreign = conflicts.filter((p) => !p.startsWith(STEPS) && p !== REGISTRY_REL)
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
}
if (git(['diff', '--cached', '--quiet', oldHead, '--', `${STEPS}current-steps.md`]).ok === false) git(['checkout', '-q', oldHead, '--', `${STEPS}current-steps.md`])
if (git(['rev-parse', '-q', '--verify', 'MERGE_HEAD']).ok) {
  must(git(['commit', '-q', '--no-edit', '-m', `Update from the original Fractera (${forkCommits.length} changes of the synced fork); the node keeps its own development steps`]), 'git commit')
} else if (added.length) {
  must(git(['commit', '-q', '-m', 'The node keeps its own development steps after the update']), 'git commit')
}
const newHead = must(git(['rev-parse', '--short', 'HEAD']), 'git rev-parse')
say(`узел на ${newHead}`)

// ── 5. реестр: закрепления — форка, состояние — узла ────────────────────────────────────────────────────────────────────────
stage('registry', 'реестр: закрепления форка, состояние узла')
const theirsRegistry = readJson(REGISTRY)
if (!theirsRegistry) rollback('чтение реестра после слияния')
const registry = mergeRegistry(theirsRegistry, oursRegistry)
writeFileSync(REGISTRY, JSON.stringify(registry, null, 2) + '\n')

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
const install = node('services-install.mjs')
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
if (!run(rebuild[0], rebuild[1], 'npm run serve:rebuild')) {
  finish('failed', { reason: 'сборка ядра не удалась — прежняя сборка возвращена и запущена; код и элементы уже новые, причина — в журнале', warnings })
}
stage('skills', 'база навыков узла — в граф')
if (!run(npm, ['run', 'skills-base'], 'npm run skills-base')) warnings.push('база навыков не загрузилась: npm run skills-base')

finish('done', { summary: `${forkCommits.length} изменений форка, ядро ${newHead}${warnings.length ? `; ${warnings.join('; ')}` : ''}`, changes: forkCommits.length, head: newHead, warnings })

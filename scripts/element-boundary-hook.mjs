// СТОРОЖ ГРАНИЦЫ АГЕНТА ЭЛЕМЕНТА (узел, шаг 548-7) — хук Claude Code `PreToolUse`, его ставит `scripts/element-isolate.mjs`.
//
// Слово владельца 2026-10-19: «элемент физически не может получать данные из соседних элементов или из ядра за исключением
// случаев когда невозможно никаким другим способом решить проблему и только по согласованию с архитектором».
//
// Почему хук, а не только правила: правила Read/Edit Claude Code действуют на его файловые инструменты и на узнаваемые команды
// оболочки (`cat`, `sed`, `head`), но не на «a Python or Node script that opens files itself» (code.claude.com/docs/en/permissions),
// а песочницы на Windows нет («On native Windows, Claude Code runs commands unsandboxed», …/sandboxing). Хук читает ТЕКСТ вызова:
// команду оболочки, путь и содержимое записываемого файла. Назван путь вне своей папки — решает ГЛАВНЫЙ АГЕНТ ЯДРА (704, ниже).
// 🛑 Чего хук не ловит, и это сказано вслух: путь, собранный во время работы скрипта (склейка строк, вычисленный `..`).
//
// 704 (владелец 2026-11-09: «мы создаем прецедент при котором архитектор гораздо слабее чем агент ядра поэтому в полной мере
// ответственности мы принимаем такое решение: агент ядра принимает решение о том что делать»). До 704 хук отвечал `ask`, и Claude Code
// спрашивал человека в терминале элемента — у элемента без бота этот вопрос никто не видел (lqvop, 2026-11-09, дважды). Теперь хук сам
// спрашивает ядро (`/api/agents/permission`, `lib/agent-kit/permission.cjs`) и ждёт: ответ главного агента — `allow`/`deny` с причиной;
// закон — отказ сразу; нет ответа к сроку, ядро молчит или идёт его сборка — отказ с причиной: граница закрыта, молчаливого ожидания нет.
// Тот же сценарий отвечает на событие `PermissionRequest` — вопрос по правилу `permissions.ask` и любой другой вопрос Claude Code в
// сессии элемента (замерено 2026-11-09, Claude Code 2.1.319: на `ask` самого `PreToolUse` событие `PermissionRequest` НЕ приходит, на
// правило `ask` — приходит, и его `allow` пропускает вызов). Вопросы человеку (`AskUserQuestion`, `ExitPlanMode`) хук не трогает.
// `--offline` — прежний разбор без ядра (`ask`), для прибора образцов `npm run check:boundary-hook`.
//
// 592-1: текст ФАЙЛА — содержимое Write/Edit и тело heredoc, которое `cat` или `tee` пишут в файл, — читается как текст этого
// файла: путь модуля (`import … from '../x'`, `require('../x')`) и ссылка Markdown считаются от папки самого файла. ✗ 589-4:
// строитель stripe записал heredoc'ом дверь с `import … from '../../../lib/stripe/stripe.mjs'`, хук посчитал путь от корня
// элемента, увидел «вне папки» — агент без бота 25 минут молча ждал разрешения. Тело heredoc, которое читает любая другая
// программа (`node <<'EOF'`, `cat <<'EOF' | node`, `git commit -F -`), исполняется сейчас и разбирается как сама команда.
// После любой правки этого файла — `npm run check:boundary-hook` (образцы; `--replay` — все вызовы из журналов элементов).
//
// Своё: папка элемента, его данные `data/services/<id>`, `logs/runtime.json` ядра (адрес ядра), временные папки, кэши npm и то,
// что нужно самому Claude Code в `~/.claude` (кроме чужих журналов `~/.claude/projects`). Всё остальное под домом человека — чужое.
// Запуск: `node element-boundary-hook.mjs --dir <папка элемента> --data <его данные> --root <корень узла>`; вход — JSON хука в stdin.

import { readFileSync, writeSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, isAbsolute, resolve } from 'node:path'

const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : '' }
const norm = (p) => String(p).replace(/\\/g, '/').replace(/^\/([a-z])\//i, '$1:/').replace(/\/+$/, '').toLowerCase()
const DIR = norm(arg('--dir'))
const DATA = norm(arg('--data'))
const ROOT = norm(arg('--root'))
const HOME = norm(homedir())

const OWN = [DIR, DATA, `${ROOT}/logs/runtime.json`, `${HOME}/appdata/local/temp`, `${HOME}/appdata/roaming/npm`,
  `${HOME}/appdata/local/npm-cache`, `${HOME}/.npm`, `${HOME}/.cache`, `${HOME}/.claude`].filter(Boolean)
const FOREIGN_INSIDE_OWN = [`${HOME}/.claude/projects`]

const under = (p, base) => p === base || p.startsWith(`${base}/`)
function outside(p) {
  if (!(under(p, HOME) || (ROOT && under(p, ROOT)))) return false
  if (FOREIGN_INSIDE_OWN.some((b) => under(p, b))) return true
  return !OWN.some((b) => under(p, b))
}

// Пути в тексте: `C:\…`, `C:/…`, `/c/…`, `~/…`, `$HOME/…`, `%USERPROFILE%\…` и относительные с `..`. Адреса `scheme://` — не пути.
function pathsIn(text, cwd) {
  const out = []
  const t = String(text ?? '')
  for (const m of t.matchAll(/(?<![\w:/])([a-zA-Z]:[\\/][^\s"'`|&;<>()]*)/g)) out.push(m[1])
  for (const m of t.matchAll(/(?<![\w:./-])(\/[a-zA-Z]\/[^\s"'`|&;<>()]*)/g)) out.push(m[1])
  // ✗ 2026-11-04: an absolute path of macOS and Linux (`/Users/…`, `/home/…`) was not a path here at all — the hook was written on
  // Windows; `readFileSync('/Users/<you>/<node>/.env.local')` passed, inside a heredoc or not (check:boundary-hook, 2 of 18). Any
  // `/…` that does not follow a letter, a colon, a dot, a slash or a dash; only the ones under the home or the node count (`outside`),
  // so a regular expression or a URL's path stays harmless.
  for (const m of t.matchAll(/(?<![\w:./~-])(\/[^\s"'`|&;<>()]+)/g)) out.push(m[1])
  for (const m of t.matchAll(/(?:~|\$HOME|\$\{HOME\}|%USERPROFILE%)([\\/][^\s"'`|&;<>()]*)/g)) out.push(HOME + m[1])
  // 548-14: `..` — путь, только если перед ним нет точки: многоточие «wait...» читалось как родительская папка, и агент
  // переписывал свою заметку, пока не убрал многоточие (замерено 2026-10-20, template).
  for (const m of t.matchAll(/(?<![\w:/.])((?:\.\.[\\/])+[^\s"'`|&;<>()]*|\.\.(?=$|[\s"'`|&;<>()]))/g)) out.push(resolve(cwd || DIR, m[1]))
  return out.map((p) => norm(isAbsolute(p) || /^[a-z]:/i.test(p) ? p : resolve(cwd || DIR, p)))
}

// Пути, которые читает не процесс, а сам файл: их считают от папки файла node, TypeScript и просмотрщик Markdown. Прочие
// относительные пути текста (`readFileSync('../x')`) откроет процесс из своей папки — они считаются от папки команды, как прежде.
const FILE_RELATIVE = [
  /\b(?:from|import)\s*\(?\s*(['"`])(?<spec>\.\.?\/[^'"`\s]*)\1/g, // import … from '../a' · import '../a' · import('../a') · export … from
  /\brequire(?:\.resolve)?\s*\(\s*(['"`])(?<spec>\.\.?\/[^'"`\s]*)\1/g, // require('../a')
  /\bnew\s+URL\s*\(\s*(['"`])(?<spec>\.\.?\/[^'"`\s]*)\1(?=\s*,\s*import\.meta\.url)/g, // new URL('../a', import.meta.url)
  /\]\((?<spec>\.\.?\/[^)\s]*)\)/g, // ссылка Markdown [x](../a.md)
]
function fileTextPaths(text, file, cwd) {
  let t = String(text ?? '')
  if (!file) return pathsIn(t, cwd)
  const base = dirname(resolve(cwd || DIR, norm(file)))
  const out = []
  for (const re of FILE_RELATIVE) {
    t = t.replace(re, (...a) => { out.push(norm(resolve(base, a.at(-1).spec))); return ' '.repeat(a[0].length) })
  }
  return [...out, ...pathsIn(t, cwd)]
}

// Команда оболочки и тела её heredoc. Тело — текст файла, только если звено конвейера с heredoc — `cat > <файл>` (`>>`) или
// `tee [-a] <файл>` без трубы дальше и имя файла известно без подстановки (`$X`, `` `…` ``). Иначе тело — часть команды;
// незакрытый heredoc — тоже: при любом сомнении разбор строже, а не мягче.
const HEREDOC = /(?<!<)<<(?!<)(?<dash>-?)[ \t]*(?<raw>'[^'\n]*'|"[^"\n]*"|\\?[A-Za-z_][\w.-]*)/g
const unquote = (s) => String(s).replace(/^\\/, '').replace(/^(['"])(.*)\1$/, '$2')

function fileOf(line, at) {
  let start = 0
  let end = line.length
  let piped = false
  for (const m of line.matchAll(/&&|\|\||[;|]/g)) {
    if (m.index < at) start = m.index + m[0].length
    else { end = m.index; piped = m[0] === '|'; break }
  }
  const words = line.slice(start, end).replace(HEREDOC, ' ').match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) ?? []
  let i = 0
  while (i < words.length && /^[A-Za-z_]\w*=/.test(words[i])) i++
  const prog = String(words[i] ?? '').replace(/^.*[\\/]/, '')
  const rest = words.slice(i + 1)
  let file = null
  if (prog === 'cat') {
    for (let k = 0; k < rest.length && file === null; k++) {
      const m = /^1?>>?(.*)$/.exec(rest[k])
      if (m) file = unquote(m[1] || rest[k + 1] || '')
    }
  } else if (prog === 'tee' && !piped) {
    file = unquote(rest.find((w) => !w.startsWith('-')) ?? '')
  }
  return file && !/[$`]/.test(file) ? file : null
}

// 704-1: папка оболочки ВНУТРИ одной команды. ✗ 2026-11-09, lqvop: `cd <элемент>/development-docs && … cat > product/quiz.json <<'EOF'
// … EOF` и затем `cd .. && npm run -s check:product` — хук считал `..` от папки сессии (корня элемента), увидел «вне папки», и агент
// молча ждал ответа. Теперь каждое звено команды (между `&&`, `||`, `;`, `|`, `&`) читается от папки, в которую его привели `cd`/`pushd`/
// `popd` перед ним; подоболочка `( … )`, `$( … )` и обратные кавычки свою папку наружу не выносят; разделитель в кавычках — не
// разделитель; `cd` без цели (домой) и `cd ~` — путь домой, то есть вне папки. Цель с подстановкой (`$X`, `` `…` ``, `*`) неизвестна —
// папка остаётся прежней, как было до 704-1.
const HOME_RAW = homedir().replace(/\\/g, '/')
const WORDS = /(?:[^\s"']+|"[^"]*"|'[^']*')+/g

function applyCd(text, st) {
  const words = String(text).trim().match(WORDS) ?? []
  let k = 0
  while (k < words.length && /^[A-Za-z_]\w*=/.test(words[k])) k++
  if (words[k] === 'builtin' || words[k] === 'command') k++
  const prog = words[k]
  if (prog === 'popd') { if (st.dirs.length) { st.old = st.cwd; st.cwd = st.dirs.pop() } return }
  if (prog !== 'cd' && prog !== 'pushd') return
  const args = words.slice(k + 1).filter((a) => a !== '--' && !/^-[LPe@]+$/.test(a))
  const before = st.cwd
  const t = args[0] === undefined ? '~' : unquote(args[0])
  if (t === '-') { if (st.old) st.cwd = st.old } else if (/[$`*?]/.test(t)) return
  else {
    st.cwd = resolve(st.cwd, t.replace(/^~(?=$|\/)/, HOME_RAW))
    if (t === '~' || t.startsWith('~/')) st.found.push(st.cwd)
  }
  if (prog === 'pushd') st.dirs.push(before)
  st.old = before
}

/** Звенья строки команды с папкой, в которой каждое исполняется; `st` — папка после строки (переходит на следующую строку). */
function scanLine(line, st) {
  const segs = []
  let start = 0
  const close = (end, next) => {
    if (end > start) { segs.push({ start, end, cwd: st.cwd }); applyCd(line.slice(start, end), st) }
    start = next
  }
  let q = null
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (q === "'") { if (c === "'") q = null; continue }
    if (q === '"') { if (c === '\\') i++; else if (c === '"') q = null; continue }
    if (c === '\\') { i++; continue }
    if (c === "'" || c === '"') { q = c; continue }
    if (c === '#' && (i === 0 || /[\s;&|()]/.test(line[i - 1]))) {
      close(i, i)
      segs.push({ start: i, end: line.length, cwd: st.cwd }) // комментарий: пути в нём читаются (строже), `cd` в нём — нет
      return segs
    }
    if (c === '(' || (c === '$' && line[i + 1] === '(') || c === '`') {
      const closing = c === '`' && st.stack.length && st.stack.at(-1).tick
      if (closing) { close(i, i + 1); st.cwd = st.stack.pop().cwd; continue }
      const at = c === '$' ? i + 2 : i + 1
      close(i, at)
      st.stack.push({ cwd: st.cwd, tick: c === '`' })
      if (c === '$') i++
      continue
    }
    if (c === ')') { close(i, i + 1); if (st.stack.length) st.cwd = st.stack.pop().cwd; continue }
    if (c === ';') { close(i, i + 1); continue }
    if ((c === '&' || c === '|') && line[i + 1] === c) { close(i, i + 2); i++; continue }
    if (c === '|') { close(i, line[i + 1] === '&' ? i + 2 : i + 1); if (line[i + 1] === '&') i++; continue }
    if (c === '&' && !/[<>]/.test(line[i - 1] ?? '') && line[i + 1] !== '>') { close(i, i + 1); continue }
  }
  close(line.length, line.length)
  return segs
}

function shellParts(command, cwd0) {
  const st = { cwd: cwd0, old: null, dirs: [], stack: [], found: [] }
  const head = []
  const files = []
  const pending = []
  for (const line of String(command ?? '').split('\n')) {
    const cur = pending[0]
    if (cur) {
      if ((cur.dash ? line.replace(/^\t+/, '') : line).replace(/\r$/, '') !== cur.word) { cur.body.push(line); continue }
      pending.shift()
      if (cur.file) files.push({ text: cur.body.join('\n'), file: cur.file, cwd: cur.cwd })
      else head.push({ text: cur.body.join('\n'), cwd: cur.cwd })
      continue
    }
    const segs = scanLine(line, st)
    for (const sg of segs) head.push({ text: line.slice(sg.start, sg.end), cwd: sg.cwd })
    for (const m of line.matchAll(HEREDOC)) {
      const sg = segs.find((s) => m.index >= s.start && m.index < s.end) ?? segs.at(-1)
      pending.push({ word: unquote(m.groups.raw), dash: m.groups.dash === '-', file: fileOf(line, m.index), body: [], cwd: sg ? sg.cwd : st.cwd })
    }
  }
  for (const cur of pending) head.push({ text: cur.body.join('\n'), cwd: cur.cwd })
  return { head, files, found: st.found }
}

let input = {}
try { input = JSON.parse(readFileSync(0, 'utf8') || '{}') } catch { process.exit(0) }
const event = input.hook_event_name === 'PermissionRequest' ? 'PermissionRequest' : 'PreToolUse'
const tool = input.tool_name ?? ''
const ti = input.tool_input ?? {}
const cwd = input.cwd ?? DIR
// 704: вопросы человеку — его, не ядра: диалог остаётся как был.
if (event === 'PermissionRequest' && (tool === 'AskUserQuestion' || tool === 'ExitPlanMode')) process.exit(0)
const found = []
if (tool === 'Bash') {
  const { head, files, found: homes } = shellParts(ti.command, cwd)
  found.push(...head.flatMap((h) => pathsIn(h.text, h.cwd)), ...files.flatMap((f) => fileTextPaths(f.text, f.file, f.cwd)), ...homes.map(norm))
} else if (tool === 'PowerShell') {
  found.push(...pathsIn(ti.command, cwd))
} else {
  const file = ti.file_path ?? ti.notebook_path
  found.push(...pathsIn(ti.file_path, cwd), ...pathsIn(ti.notebook_path, cwd))
  for (const t of [ti.content, ti.new_string, ...(Array.isArray(ti.edits) ? ti.edits.map((e) => e?.new_string) : [])]) {
    found.push(...fileTextPaths(t, file, cwd))
  }
}
const hits = [...new Set(found)].filter(outside)
const hit = hits[0]
if (event === 'PreToolUse' && !hit) process.exit(0)

// Синхронно в дескриптор 1: запись в трубу на macOS асинхронна, и `process.exit` сразу после неё обрывала бы ответ.
const say = (o) => { writeSync(1, JSON.stringify({ hookSpecificOutput: { hookEventName: event, ...o } })); process.exit(0) }
if (process.argv.includes('--offline')) {
  if (event === 'PermissionRequest') process.exit(0)
  say({ permissionDecision: 'ask', permissionDecisionReason: `Outside your element's folder: ${hit}. Your boundary (CLAUDE.md, «Your boundary»): the core's main agent decides.` })
}

// 704: спросить ядро и дождаться решения главного агента.
const RAW_DIR = arg('--dir')
const RAW_ROOT = arg('--root')
const SERVICE = String(arg('--data')).replace(/\\/g, '/').replace(/\/+$/, '').split('/').pop()
const envOf = (file) => {
  const out = {}
  try {
    for (const line of readFileSync(file, 'utf8').replace(/^﻿/, '').split(/\r?\n/)) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
      if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '')
    }
  } catch { /* нет файла */ }
  return out
}
const KEY = envOf(`${RAW_DIR}/.env.local`).SETTINGS_SECRET || process.env.SETTINGS_SECRET || envOf(`${RAW_ROOT}/.env.local`).SETTINGS_SECRET || ''
let PORT = 0
try { PORT = Number(JSON.parse(readFileSync(`${RAW_ROOT}/logs/runtime.json`, 'utf8')).port) || 0 } catch { /* ядро не запускалось */ }
const CORE = PORT ? `http://localhost:${PORT}/api/agents/permission` : ''
const STARTED = Date.now()
const CAP_MS = 9 * 60_000 // хук стоит в настройках с timeout 600 с и onFailure: block — ответ уходит раньше
const reasonText = hit ? `outside the element's folder: ${hit}` : 'Claude Code asks for permission (a rule of the node or its own check)'

function decide(state, message, by) {
  const why = String(message ?? '').trim()
  if (event === 'PermissionRequest') {
    say(state === 'allow' ? { decision: { behavior: 'allow' } } : { decision: { behavior: 'deny', message: `The core's main agent decided no${by ? ` (${by})` : ''}: ${why}` } })
  }
  say(state === 'allow'
    ? { permissionDecision: 'allow', permissionDecisionReason: `The core's main agent allowed it: ${why}` }
    : { permissionDecision: 'deny', permissionDecisionReason: `${hit ? `Outside your element's folder: ${hit}. ` : ''}The core's main agent decided no${by ? ` (${by})` : ''}: ${why}` })
}

async function call(url, init, ms) {
  const r = await fetch(url, { ...init, headers: { 'Content-Type': 'application/json', 'X-Node-Key': KEY }, signal: AbortSignal.timeout(ms) })
  return r.json()
}

if (!CORE || !KEY) decide('deny', 'the core cannot be asked from here (no address or node key) — the boundary stays closed; do it inside your folder', 'core-unreachable')
let first
try {
  first = await call(CORE, { method: 'POST', body: JSON.stringify({ action: 'ask', service: SERVICE, event, tool, input: ti, cwd, reason: reasonText, hits }) }, 15_000)
} catch {
  decide('deny', 'the core is not answering — the boundary stays closed; do it inside your folder or try again later', 'core-unreachable')
}
if (!first?.ok) decide('deny', `the core refused the question: ${first?.reason ?? 'no answer'}`, 'core-refused')
if (first.state !== 'pending') decide(first.state, first.message, first.by)
const until = Math.min(Number(first.deadline) || STARTED + CAP_MS, STARTED + CAP_MS) + 5_000
while (Date.now() < until) {
  const left = Math.max(1, Math.min(25, Math.ceil((until - Date.now()) / 1000)))
  try {
    const w = await call(`${CORE}?token=${encodeURIComponent(first.token)}&wait=${left}`, { method: 'GET' }, (left + 10) * 1000)
    if (w?.ok && w.state !== 'pending') decide(w.state, w.message, w.by)
    if (!w?.ok) break
  } catch { await new Promise((r) => setTimeout(r, 2000)) }
}
decide('deny', 'the core\'s main agent did not decide in time — the boundary stays closed: do it inside your folder, or ask the core (ask-core) and go on with what you can do now', 'timeout')

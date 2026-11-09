// ПРИБОР СТОРОЖА ГРАНИЦЫ ЭЛЕМЕНТА (узел, шаг 592-1). Запуск: `npm run check:boundary-hook` — без модели: настоящий хук
// (`scripts/element-boundary-hook.mjs`) получает в stdin вход PreToolUse, как от Claude Code, и его ответ сверяется с образцом:
// `ask` — назван путь вне папки элемента, `allow` — хук молчит. Промах — код 1.
//   --hook <файл>     другая версия хука (негативный контроль: `git show <коммит>:scripts/element-boundary-hook.mjs > <файл>`);
//   --replay          вместо образцов — все вызовы Bash/PowerShell/Write/Edit из журналов сессий элементов этой машины
//                     (`~/.claude/projects/*WEB4-ITEMS*`, у сессии в настройках стоит этот хук), с папками элемента из его
//                     настроек (у удалённых и перенесённых — из пути сессии, их число печатается);
//   --against <файл>  при --replay: та же лента через вторую версию хука и каждое расхождение — какая версия спросила.
//   --consult         704: решение ядра — настоящий хук против поддельного ядра (разрешил, отказал, не успел, ядро молчит, чужой ключ,
//                     PermissionRequest, вопрос человеку, путь внутри папки).
import { execFile } from 'node:child_process'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const opt = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : '' }
const HOOK = opt('--hook') || join(ROOT, 'scripts', 'element-boundary-hook.mjs')
const AGAINST = opt('--against')
const fwd = (p) => p.replace(/\\/g, '/')
const HOME_DIR = fwd(homedir())

function decide(hook, args, input) {
  return new Promise((done) => {
    // 704: `--offline` — разбор без ядра (`ask`); решение ядра проверяет `--consult` ниже.
    const child = execFile(process.execPath, [hook, '--dir', args.dir, '--data', args.data, '--root', args.root, '--offline'], { windowsHide: true },
      (err, stdout) => {
        if (err) return done({ decision: 'error', hit: String(err.message).split('\n')[0] })
        try {
          const o = JSON.parse(stdout || '{}').hookSpecificOutput
          done(o ? { decision: o.permissionDecision, hit: o.permissionDecisionReason } : { decision: 'allow', hit: '' })
        } catch { done({ decision: 'error', hit: `not JSON: ${stdout.slice(0, 120)}` }) }
      })
    child.stdin.end(JSON.stringify({ hook_event_name: 'PreToolUse', ...input }))
  })
}

async function pool(items, size, work) {
  const out = new Array(items.length)
  let next = 0
  await Promise.all(Array.from({ length: size }, async () => { while (next < items.length) { const i = next++; out[i] = await work(items[i]) } }))
  return out
}

// ── Образцы: элемент stripe этого узла (папки не обязаны существовать — хук сверяет только текст путей).
const DIR = fwd(join(ROOT, 'WEB4-ITEMS', 'core', 'stripe'))
const ARGS = { dir: DIR, data: fwd(join(ROOT, 'data', 'services', 'stripe')), root: fwd(ROOT) }
const bash = (command) => ({ cwd: DIR, tool_name: 'Bash', tool_input: { command } })
const write = (file, content) => ({ cwd: DIR, tool_name: 'Write', tool_input: { file_path: `${DIR}/${file}`, content } })
const edit = (file, new_string) => ({ cwd: DIR, tool_name: 'Edit', tool_input: { file_path: `${DIR}/${file}`, old_string: 'x', new_string } })
const SAMPLES = [
  ['589-4: heredoc пишет дверь внутри элемента, импорт из ../../../lib', 'allow', bash([
    "cat > app/api/stripe-products/stripe-products.mjs <<'EOF'",
    '// The work of the door GET /api/stripe-products. Input: limit 1–100 (default 20).',
    "import { NO_KEYS, stripeOrNull } from '../../../lib/stripe/stripe.mjs'",
    'export async function handle(input) { return { status: 200, body: { input } } }',
    'EOF',
    "cat > app/api/stripe-products/stripe-products.test.mjs <<'EOF'",
    "import { handle } from './stripe-products.mjs'",
    'EOF',
    'npm run test:stripe-products 2>&1 | tail -20',
  ].join('\n'))],
  ['чтение соседа: cat ../../user/root/.env.local', 'ask', bash('cat ../../user/root/.env.local')],
  ['заголовок heredoc пишет к соседу: cat > ../neighbour/x', 'ask', bash("cat > ../neighbour/x <<'EOF'\nhello\nEOF")],
  ['548-14: многоточие в команде', 'allow', bash('echo "wait... then go"')],
  ['548-14: многоточие в заметке', 'allow', write('development-docs/current-step.md', 'Waiting for the core... then the door.')],
  ['тело heredoc исполняет node — путь к .env.local ядра', 'ask', bash(`node <<'EOF'\nrequire('fs').readFileSync('${fwd(ROOT)}/.env.local')\nEOF`)],
  ['тело heredoc идёт в файл, но называет ядро абсолютным путём', 'ask', bash(`cat > scripts/x.mjs <<'EOF'\nreadFileSync('${fwd(ROOT)}/.env.local')\nEOF`)],
  // 2026-11-04: an absolute macOS/Linux path in a plain command; a URL's path and a regular expression stay harmless.
  ['абсолютный путь ядра в простой команде', 'ask', bash(`cat ${fwd(ROOT)}/.env.local`)],
  ['путь адреса и регулярное выражение — не пути', 'allow', bash("curl -s https://api.github.com/repos/x/y && node -e \"console.log(/^a\\/b$/.test('a/b'))\"")],
  ['cat heredoc в трубу node — тело есть скрипт', 'ask', bash("cat <<'EOF' | node --input-type=module\nimport x from '../../../lib/stripe/stripe.mjs'\nEOF")],
  ['heredoc без закрывающей строки — тело остаётся командой', 'ask', bash("cat > x.mjs <<'EOF'\nimport a from '../../../lib/a.mjs'")],
  ['имя файла heredoc с подстановкой $OUT — тело остаётся командой', 'ask', bash("cat > \"$OUT/x.mjs\" <<'EOF'\nimport a from '../../../lib/a.mjs'\nEOF")],
  ['tee -a в свой файл, импорт соседнего файла элемента', 'allow', bash("tee -a lib/x.mjs <<'EOF'\nimport y from '../lib/y.mjs'\nEOF")],
  ['git commit -F - : тело не файл — разбирается как команда', 'ask', bash("git commit -q -F - <<'EOF'\nFix ../../../lib/a\nEOF")],
  ['Write: импорт из ../../../lib в файле на три папки вглубь', 'allow', write('app/api/x/route.mjs', "import a from '../../../lib/a.mjs'\n")],
  ['Write: импорт, который выходит из папки элемента', 'ask', write('app/x.mjs', "import a from '../../../lib/a.mjs'\n")],
  ['Write: скрипт читает ../root/.env.local — путь процесса, не файла', 'ask', write('scripts/x.mjs', "readFileSync('../root/.env.local')\n")],
  ['Edit: новый импорт из ../../lib', 'allow', edit('app/api/route.ts', "import a from '../../lib/a.mjs'")],
  ['Write: ссылка Markdown на папку выше внутри элемента', 'allow', write('development-docs/steps-done/3.md', 'See [backlog](../backlog.md).')],
  ['cd .. спрашивает', 'ask', bash('cd .. && ls')],
  // 704-1: папка оболочки внутри одной команды (✗ 2026-11-09, lqvop: `cd .. && …` после `cd` в подпапку — «вне папки»).
  ['704-1 lqvop: cd в подпапку, heredoc, затем cd .. обратно в корень', 'allow', bash([
    `cd ${DIR}/development-docs && mkdir -p product/modules && cat > product/quiz.json <<'EOF'`,
    '{ "vision": { "text": "A research desk … wait... then go" } }',
    'EOF',
    'cd .. && npm run -s check:product 2>&1 | tail -20',
  ].join('\n'))],
  ['704-1: cd в подпапку, ../y — файл самого элемента', 'allow', bash('cd lib && cat ../y.mjs')],
  ['704-1: heredoc после cd — ссылка считается от папки файла', 'allow', bash("cd development-docs/steps-done && cat > 4.md <<'EOF'\nSee [readme](../../README.md).\nEOF")],
  ['704-1: подоболочка (cd …) свою папку не выносит', 'ask', bash('(cd lib && ls) && cat ../x')],
  ['704-1: $(cd …) свою папку не выносит', 'ask', bash('echo $(cd lib && pwd) && cat ../x')],
  ['704-1: cd внутри кавычек — не cd', 'ask', bash('echo "a; cd lib" && cat ../x')],
  ['704-1: cd в подпапку, затем ../.. — выше элемента', 'ask', bash('cd lib; cd ../.. && ls')],
  ['704-1: cd без цели уводит домой', 'ask', bash('cd && ls')],
  ['704-1: cd ~/… — домой', 'ask', bash('cd ~/Documents && ls')],
]

async function samples() {
  const got = await pool(SAMPLES, 8, ([, , input]) => decide(HOOK, ARGS, input))
  let misses = 0
  SAMPLES.forEach(([label, want], i) => {
    const ok = got[i].decision === want
    if (!ok) misses++
    console.log(`${ok ? 'ok  ' : 'FAIL'} ${want.padEnd(5)} ${label}${ok ? '' : `\n     got ${got[i].decision}: ${got[i].hit}`}`)
  })
  console.log(misses ? `===BOUNDARY_HOOK_FAIL=== ${misses} of ${SAMPLES.length} (hook ${HOOK})` : `===BOUNDARY_HOOK_OK=== ${SAMPLES.length} samples`)
  process.exit(misses ? 1 : 0)
}

// ── Лента: вызовы из журналов сессий элементов (у сессии в настройках стоит этот хук).
function hookArgsOf(cwd) {
  try {
    const s = JSON.parse(readFileSync(join(cwd, '.claude', 'settings.local.json'), 'utf8'))
    const cmd = (s.hooks?.PreToolUse ?? []).flatMap((m) => m.hooks ?? []).map((h) => String(h.command ?? ''))
      .find((c) => c.includes('element-boundary-hook.mjs')) ?? ''
    const m = /--dir "([^"]+)" --data "([^"]+)" --root "([^"]+)"/.exec(cmd)
    if (m) return { dir: m[1], data: m[2], root: m[3] }
  } catch {}
  // Элемент удалён или перенесён — папки выводятся из пути сессии `<узел>/WEB4-ITEMS/<зона>/<папка>` (до шага 519 — `AGI-ITEMS`):
  // для сравнения двух версий хука на одних и тех же входах этого хватает (данные — по имени папки, как у большинства элементов).
  const at = /^(.*)[\\/](?:WEB4|AGI)-ITEMS[\\/][^\\/]+[\\/]([^\\/]+)$/.exec(cwd)
  return at ? { dir: fwd(cwd), data: fwd(join(at[1], 'data', 'services', at[2])), root: fwd(at[1]), derived: true } : null
}
const TOOLS = new Set(['Bash', 'PowerShell', 'Write', 'Edit', 'MultiEdit', 'NotebookEdit'])
function calls() {
  const P = join(homedir(), '.claude', 'projects')
  const out = []
  let skipped = 0
  // Папки элементов живут в `<узел>/WEB4-ITEMS/`, и только им `element-isolate.mjs` ставит этот хук.
  for (const d of existsSync(P) ? readdirSync(P).filter((n) => n.includes('WEB4-ITEMS')) : []) {
    for (const f of readdirSync(join(P, d)).filter((n) => n.endsWith('.jsonl'))) {
      const seen = new Set()
      let args
      for (const line of readFileSync(join(P, d, f), 'utf8').split('\n')) {
        let o; try { o = JSON.parse(line) } catch { continue }
        if (!o.timestamp || !o.cwd) continue
        if (args === undefined) args = hookArgsOf(o.cwd)
        if (!args) break
        for (const c of Array.isArray(o.message?.content) ? o.message.content : []) {
          if (c?.type !== 'tool_use' || !TOOLS.has(c.name) || seen.has(c.id)) continue
          seen.add(c.id)
          out.push({ key: `${f.slice(0, 8)}/${String(c.id).slice(-8)}`, at: o.timestamp, args, input: { cwd: o.cwd, tool_name: c.name, tool_input: c.input } })
        }
      }
      if (args === null) skipped++
    }
  }
  return { list: out, skipped }
}

async function replay() {
  const { list, skipped } = calls()
  const a = await pool(list, 8, (c) => decide(HOOK, c.args, c.input))
  const b = AGAINST ? await pool(list, 8, (c) => decide(AGAINST, c.args, c.input)) : null
  const asks = a.filter((r) => r.decision === 'ask').length
  const derived = new Set(list.filter((c) => c.args.derived).map((c) => c.key.slice(0, 8))).size
  console.log(`calls ${list.length} (sessions: folders from the session path ${derived}, skipped ${skipped}); asks: ${asks}${b ? `, against: ${b.filter((r) => r.decision === 'ask').length}` : ''}`)
  const errors = [...a, ...(b ?? [])].filter((r) => r.decision === 'error')
  for (const r of errors.slice(0, 5)) console.log(`ERROR ${r.hit}`)
  list.forEach((c, i) => {
    const ti = c.input.tool_input
    const what = String(ti.command ?? ti.file_path ?? '').split('\n')[0].slice(0, 110)
    if (!b && a[i].decision === 'ask') console.log(`ask  ${c.at.slice(0, 16)} ${c.key} ${c.input.tool_name}: ${what}\n     ${a[i].hit}`)
    if (b && a[i].decision !== b[i].decision) {
      console.log(`${a[i].decision === 'ask' ? 'ONLY THIS ASKS ' : 'ONLY AGAINST ASKS'} ${c.at.slice(0, 16)} ${c.key} ${c.input.tool_name}: ${what}\n     ${(a[i].decision === 'ask' ? a[i] : b[i]).hit}`)
    }
  })
  process.exit(errors.length ? 1 : 0)
}

// ── 704: решение ядра — настоящий хук против поддельного ядра (`--consult`): разрешил, отказал по закону, не успел, ядро молчит, чужой
// ключ, событие PermissionRequest, вопрос человеку, путь внутри папки. Без модели; порт поддельного ядра — свободный с верха блока
// элементов (24680–25679, `lib/server-port.cjs`), не из запретных 3000 и 49152+.
async function consult() {
  const { mkdtempSync, mkdirSync, writeFileSync, rmSync } = await import('node:fs')
  const { tmpdir } = await import('node:os')
  const http = await import('node:http')
  const base = mkdtempSync(join(tmpdir(), 'boundary-consult-'))
  const root = fwd(join(base, 'root'))
  const dir = `${root}/WEB4-ITEMS/user/el`
  const data = `${root}/data/services/el`
  mkdirSync(`${root}/logs`, { recursive: true })
  mkdirSync(dir, { recursive: true })
  writeFileSync(`${root}/.env.local`, 'SETTINGS_SECRET=probe-key\n')
  let plan = null
  const seen = []
  const server = http.createServer((req, res) => {
    let body = ''
    req.on('data', (c) => { body += c })
    req.on('end', async () => {
      const send = (o, status = 200) => { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(o)) }
      if (req.headers['x-node-key'] !== 'probe-key') return send({ ok: false, reason: 'node key required (X-Node-Key)' }, 401)
      const u = new URL(req.url, 'http://x')
      if (req.method === 'POST') { const q = JSON.parse(body || '{}'); seen.push(q); return send(plan.ask(q)) }
      return send(await plan.wait(u.searchParams.get('token'), Number(u.searchParams.get('wait')) * 1000))
    })
  })
  let port = 0
  for (let p = 25679; p > 25600 && !port; p--) {
    port = await new Promise((done) => { server.once('error', () => done(0)); server.listen(p, '127.0.0.1', () => done(p)) })
  }
  if (!port) { console.log('===BOUNDARY_CONSULT_FAIL=== no free port for the fake core'); process.exit(1) }
  const runtime = (p) => writeFileSync(`${root}/logs/runtime.json`, JSON.stringify({ port: p }))
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
  const pending = (ms) => ({ ok: true, state: 'pending', token: 'tok-1', deadline: Date.now() + ms })
  const run = (input) => new Promise((done) => {
    const t0 = Date.now()
    const child = execFile(process.execPath, [HOOK, '--dir', dir, '--data', data, '--root', root], { windowsHide: true, timeout: 60_000 }, (err, stdout) => {
      const ms = Date.now() - t0
      if (err) return done({ got: 'error', why: String(err.message).split('\n')[0], ms })
      if (!stdout.trim()) return done({ got: 'none', why: '', ms })
      try {
        const o = JSON.parse(stdout).hookSpecificOutput
        done({ got: o.permissionDecision ?? o.decision?.behavior, why: o.permissionDecisionReason ?? o.decision?.message ?? '', ms })
      } catch { done({ got: 'error', why: `not JSON: ${stdout.slice(0, 120)}`, ms }) }
    })
    child.stdin.end(JSON.stringify(input))
  })
  const pre = (command) => ({ hook_event_name: 'PreToolUse', cwd: dir, tool_name: 'Bash', tool_input: { command } })
  const CASES = [
    ['главный агент ответил «да» за 0,8 с', 'allow', pre(`cat ${root}/lib/x.mjs`), {
      ask: () => pending(20_000), wait: async () => { await sleep(800); return { ok: true, state: 'allow', message: 'needed for its task' } } }],
    ['закон: отказ сразу, без ожидания', 'deny', pre(`cat ${root}/.env.local`), {
      ask: () => ({ ok: true, state: 'deny', message: 'the node\'s own keys are never opened to an element', by: 'law' }) }],
    ['никто не ответил к сроку — отказ сам', 'deny', pre(`cat ${root}/lib/y.mjs`), {
      ask: () => pending(2_000), wait: async (t, ms) => { await sleep(Math.min(ms, 1000)); return { ok: true, state: 'pending' } } }],
    ['ядро молчит — отказ, не пропуск', 'deny', pre(`cat ${root}/lib/z.mjs`), { port: 1 }],
    ['чужой ключ узла — ядро не принимает, отказ', 'deny', pre(`cat ${root}/lib/w.mjs`), { key: 'wrong-key', ask: () => pending(5000) }],
    ['PermissionRequest (правило ask) — решение ядра', 'allow', { hook_event_name: 'PermissionRequest', cwd: dir, tool_name: 'Read', tool_input: { file_path: `${root}/lib/a.ts` } }, {
      ask: () => pending(20_000), wait: async () => ({ ok: true, state: 'allow', message: 'reading one type' }) }],
    ['AskUserQuestion — вопрос человеку, ядро не спрашивают', 'none', { hook_event_name: 'PermissionRequest', cwd: dir, tool_name: 'AskUserQuestion', tool_input: { questions: [] } }, { untouched: true }],
    ['путь внутри папки — ядро не спрашивают', 'none', pre('cd lib && cat ../y.mjs'), { untouched: true }],
  ]
  let misses = 0
  for (const [label, want, input, p] of CASES) {
    plan = { ask: p.ask ?? (() => ({ ok: false, reason: 'unexpected ask' })), wait: p.wait ?? (async () => ({ ok: true, state: 'pending' })) }
    runtime(p.port ?? port)
    if (p.key) writeFileSync(`${dir}/.env.local`, `SETTINGS_SECRET=${p.key}\n`)
    const before = seen.length
    const r = await run(input)
    if (p.key) rmSync(`${dir}/.env.local`, { force: true })
    const asked = seen.length - before
    const ok = r.got === want && (!p.untouched || asked === 0) && r.ms < 20_000
    if (!ok) misses++
    console.log(`${ok ? 'ok  ' : 'FAIL'} ${want.padEnd(5)} ${label} — ${(r.ms / 1000).toFixed(1)} s${asked ? `, asked the core ${asked}×` : ''}${ok ? '' : `\n     got ${r.got}: ${r.why}`}`)
  }
  server.close()

  // Модуль ядра (`lib/agent-kit/permission.cjs`) — те же правила без HTTP: закон, один жетон на один вызов, ответ, тот же вызов
  // повторно, срок, список без жетонов, главный агент не будится, идёт сборка, журнал.
  process.env.PERMISSION_WAIT_MS = '1500'
  const { createRequire } = await import('node:module')
  const perm = createRequire(import.meta.url)(join(ROOT, 'lib', 'agent-kit', 'permission.cjs'))
  const woke = []
  let wakeOk = true
  let building = false
  const P = perm.create(root, { wakeMain: (text) => { woke.push(text); return wakeOk }, building: () => building })
  const q = (input, service = 'el') => ({ service, tool: 'Bash', input, cwd: dir, reason: 'test' })
  const checks = []
  const check = (label, cond) => { checks.push([label, Boolean(cond)]) }
  let r = P.ask(q({ command: `cat ${root}/.env.local` }))
  check('закон: ключи ядра — отказ без пробуждения', r.state === 'deny' && r.by === 'law' && woke.length === 0)
  r = P.ask(q({ command: `cat ${root}/WEB4-ITEMS/user/other/.env.local` }))
  check('закон: ключи другого элемента — отказ', r.state === 'deny' && r.by === 'law')
  r = P.ask(q({ command: `cat ${HOME_DIR}/.claude/projects/-x-WEB4-ITEMS-core-build/a.jsonl` }))
  check('закон: журнал сессии ядра — отказ', r.state === 'deny' && r.by === 'law')
  const a1 = P.ask(q({ command: `cat ${root}/lib/a.mjs` }))
  const a2 = P.ask(q({ command: `cat ${root}/lib/a.mjs` }))
  check('вопрос будит главного агента одной строкой с жетоном и шапкой', a1.state === 'pending' && woke.length === 1 && woke[0].includes(a1.token) && woke[0].startsWith('⟦node · permission · el · '))
  check('тот же вызов ждёт — тот же жетон, второго пробуждения нет', a2.token === a1.token && woke.length === 1)
  check('список ждущих — без полного жетона', P.list().length === 1 && P.list()[0].token.length === 6)
  check('чужой жетон не отвечает', P.answer('nope', 'allow', 'x').ok === false)
  const w0 = await P.wait(a1.token, 50)
  check('ожидание без ответа — pending', w0.state === 'pending')
  const later = P.wait(a1.token, 5000)
  check('ответ главного агента принят', P.answer(a1.token, 'allow', 'needed for its task').ok === true)
  const w1 = await later
  check('ждущий хук получает «да» сразу', w1.state === 'allow' && w1.by === 'main')
  check('второй ответ на тот же жетон — отказ', P.answer(a1.token, 'deny', 'x').ok === false)
  r = P.ask(q({ command: `cat ${root}/lib/a.mjs` }))
  check('тот же вызов в течение 10 минут — то же решение без пробуждения', r.state === 'allow' && r.by === 'same-call' && woke.length === 1)
  const t1 = P.ask(q({ command: `cat ${root}/lib/late.mjs` }))
  const tw = await P.wait(t1.token, 2500)
  check('срок вышел — отказ сам («timeout»)', tw.state === 'deny' && tw.by === 'timeout')
  wakeOk = false
  r = P.ask(q({ command: `cat ${root}/lib/nobody.mjs` }))
  check('главного агента не разбудить — отказ сразу', r.state === 'deny' && r.by === 'no-main-agent')
  wakeOk = true
  building = true
  r = P.ask(q({ command: `cat ${root}/lib/build.mjs` }))
  check('идёт сборка ядра — отказ сразу', r.state === 'deny' && r.by === 'build')
  const { readFileSync: rf } = await import('node:fs')
  let lines = []
  try { lines = rf(`${root}/data/node/permissions.jsonl`, 'utf8').trim().split('\n') } catch {}
  check('журнал data/node/permissions.jsonl — каждое решение', lines.length >= 8 && !lines.some((l) => l.includes(a1.token)))
  for (const [label, ok] of checks) { if (!ok) misses++; console.log(`${ok ? 'ok  ' : 'FAIL'} module ${label}`) }
  rmSync(base, { recursive: true, force: true })
  const total = CASES.length + checks.length
  console.log(misses ? `===BOUNDARY_CONSULT_FAIL=== ${misses} of ${total}` : `===BOUNDARY_CONSULT_OK=== ${total} cases (fake core on ${port})`)
  process.exit(misses ? 1 : 0)
}

if (process.argv.includes('--replay')) await replay()
else if (process.argv.includes('--consult')) await consult()
else await samples()

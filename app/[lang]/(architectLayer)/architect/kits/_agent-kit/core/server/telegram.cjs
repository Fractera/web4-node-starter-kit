// КАНАЛ TELEGRAM → CLAUDE CODE В ПАПКЕ АГЕНТА УЗЛА (267-3).
//
// Перенос `fractera-memory-starter/lib/channel/{telegram,identity,activation}.mjs` с двумя переменами:
//   1. `bash`, `setsid`, `HOME=/root` → ничего из этого: пути строятся `path.join` от `os.homedir()`;
//   2. папка состояния — `<узел>/data/services/<служба>/channel/telegram`, а не внутри папки службы: та —
//      клон её репозитория, и файлы бота сделали бы его грязным (закон узла о данных служб).
//
// 🔒 ОДНА СЛУЖБА — ОДНА СЕССИЯ CLAUDE CODE, И БОТ РАБОТАЕТ В НЕЙ (решение владельца 2026-09-22). Отдельного
// жителя под pm2 больше нет: терминал узла запускает `claude --channels …`, поэтому всё, что человек пишет в
// Telegram, видно в терминале, а без Telegram он продолжает ту же работу там. Запуск и остановка — ТОЛЬКО во
// вкладке «Терминал»; страница бота лишь показывает состояние.
// 🪦 До этого решения житель `scripts/agent-channel.cjs` держал ВТОРОЙ `claude` для бота — переписку в
// терминале не видел никто, а кнопки «Запустить/Остановить канал» управляли не тем, что человек видел.
//
// 🔒 ПЛАГИН ОФИЦИАЛЬНЫЙ: `telegram@claude-plugins-official`, сервер запускается `bun run` (первоисточник —
// `.mcp.json` плагина). `TELEGRAM_STATE_DIR` — своя папка на экземпляр, дословно из его README: «To run
// multiple bots on one machine… point TELEGRAM_STATE_DIR at a different directory per instance».
//
// 🔒 ПОКА ТЕРМИНАЛ ВЫКЛЮЧЕН, БОТА ЧИТАЕТ УЗЕЛ (`startIdlePoller(service)`, зовёт `lib/agent-kit/mount.cjs`). Он делает две вещи:
// впускает по ссылке `t.me/<бот>?start=<метка>` и на любое сообщение допущенного отвечает системным
// сообщением о состоянии — раньше, чем человек поймёт, что ему никто не отвечает. У бота один
// опрашиватель: как только терминал запущен с каналом, узел замолкает и бота читает плагин.

const { spawn } = require('node:child_process')
const { randomBytes } = require('node:crypto')
const { chmodSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { isBornItem, ownClaudeDir, serviceDir } = require('./workspace.cjs')
const session = require('./session.cjs')
const { claudeAuthState, extraBins, resolveBin } = require('./claude-cli.cjs')
const { tableFor } = require('./translate.cjs')
// 552-6: имя бота по режиму — только у элементов с группами навыков (тот же признак, что `hasGroups` в `lib/agent-kit/modes.cjs`).
// 🛑 Модуль режимов здесь не подключается: этот файл импортирует дверь `agent-api/channel/route.ts`, его собирает Turbopack, и
// `require(path.join(process.cwd(), …))` в сборке не разрешается («server relative imports are not implemented yet», ✗ 552-6 —
// 27 ошибок сборки). Мост так делать может: его загружают при работе, а не сборкой.
const hasSkillGroups = (dir) => Boolean(dir) && existsSync(path.join(dir, '.claude', 'skills', 'build-skills', '.claude-plugin', 'plugin.json'))

const ROOT = process.cwd()
const PLUGIN = 'telegram@claude-plugins-official'
const TOKEN_SHAPE = /^\d{6,}:[A-Za-z0-9_-]{30,}$/
const ACTIVATION_LIFETIME_MS = 60 * 60 * 1000
// 409-3: раз в 3 с (владелец 2026-10-05) — нажатие «Запустить» узел видит не позже чем через 3 с.
const IDLE_POLL_MS = 3000

const stateDir = (service) => path.join(ROOT, 'data', 'services', service, 'channel', 'telegram')
const envFile = (service) => path.join(stateDir(service), '.env')
const accessFile = (service) => path.join(stateDir(service), 'access.json')
const botFile = (service) => path.join(stateDir(service), 'bot.json')
const activationFile = (service) => path.join(stateDir(service), 'activation.json')
const messagesFile = (service) => path.join(stateDir(service), 'messages.json')
const pendingFile = (service) => path.join(ROOT, 'data', 'services', service, 'wake', 'pending.json')

function readJson(file, fallback) {
  try { return JSON.parse(readFileSync(file, 'utf8')) } catch { return fallback }
}

/** Файлы с секретом — только владельцу. На Windows права задаёт ACL папки пользователя, `chmod` там пуст. */
function writeSecret(file, text) {
  mkdirSync(path.dirname(file), { recursive: true })
  writeFileSync(file, text, { mode: 0o600 })
  try { chmodSync(file, 0o600) } catch { /* Windows */ }
}

function storedToken(service) {
  try {
    const line = readFileSync(envFile(service), 'utf8').split(/\r?\n/).find((l) => l.startsWith('TELEGRAM_BOT_TOKEN='))
    return line ? line.slice('TELEGRAM_BOT_TOKEN='.length).trim() : ''
  } catch {
    return ''
  }
}

// 639 (владелец 2026-11-03: «сообщения которые несут промежуточные результаты могут автоматически исчезать … человеку приятно смотреть и
// видеть только важные задачи»; «да, делай 639»): служебное сообщение узла — «включён», «уже выключен», подтверждение команды, отвеченный
// вопрос — исчезает само через 30 с. Остаются итог, вопрос, который ещё ждёт человека, и беда, требующая его действия; вопрос исчезает,
// когда на него ответили, его сменил новый или закрылась сессия, о которой он (`untilSessionEnds`).
// 🔒 Правило и для будущих сообщений: каждое уходит через `sendKept` или `sendVanishing`, а строка с отправкой несёт пометку «639: остаётся»
// или «639: исчезает» — сторож `lib/agent-kit/check.mjs` роняет сборку на отправке без пометки.
const VANISH_MS = Number(process.env.TELEGRAM_VANISH_MS) || 30_000
function vanish(token, chat, messageId, ms = VANISH_MS) {
  if (!token || !messageId) return
  const timer = setTimeout(() => { void tg(token, 'deleteMessage', { chat_id: chat, message_id: messageId }) }, ms)
  timer.unref?.()
}
/** Отправить служебное сообщение, которое исчезнет само. */
async function sendVanishing(token, params, ms = VANISH_MS) {
  const r = await tg(token, 'sendMessage', params) // 639: исчезает — через ms
  if (r?.ok && r.result?.message_id) vanish(token, params.chat_id, r.result.message_id, ms)
  return r
}
/** Отправить итог, вопрос, который ждёт человека, или беду, требующую его действия, — сообщение остаётся. */
async function sendKept(token, params) {
  return tg(token, 'sendMessage', params) // 639: остаётся
}

// Вопрос, который теряет смысл с концом сессии («выключить?», «ждёт ответа в терминале»): ключ сессии → [{ via, chat, messageId, kind }].
const mootFile = () => path.join(ROOT, 'data', 'node', 'telegram-until-session-ends.json')
function untilSessionEnds(key, via, kind, sent) {
  if (!sent.length) return
  const map = readJson(mootFile(), {})
  map[key] = [...(map[key] ?? []), ...sent.map(([chat, messageId]) => ({ via, chat, messageId, kind }))]
  mkdirSync(path.dirname(mootFile()), { recursive: true })
  writeFileSync(mootFile(), JSON.stringify(map, null, 2) + '\n')
}
/** Снять вопросы сессии `key`: все (сессия закрылась) или только вида `kind` (их сменил новый). */
function dropUntilEnds(key, kind) {
  const map = readJson(mootFile(), {})
  const all = map[key] ?? []
  const gone = kind ? all.filter((x) => x.kind === kind) : all
  if (!gone.length) return
  for (const x of gone) vanish(storedToken(x.via), x.chat, x.messageId)
  const rest = all.filter((x) => !gone.includes(x))
  if (rest.length) map[key] = rest
  else delete map[key]
  writeFileSync(mootFile(), JSON.stringify(map, null, 2) + '\n')
}
/** Сессия закрылась (`bridge.cjs`, выход процесса): её вопросы, и вопрос доверия папке тоже, исчезают через 30 с. */
function sessionEnded(key) {
  try { dropUntilEnds(key) } catch { /* вопрос просто останется */ }
  try { clearTrust(key) } catch { /* то же */ }
}

async function tg(token, method, params = {}) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
      signal: AbortSignal.timeout(10_000),
    })
    return (await res.json().catch(() => null)) ?? { ok: false }
  } catch {
    return { ok: false, description: 'unreachable' }
  }
}

/** Сохранить токен, проверив его у самого Telegram (`getMe`): форма ещё не значит «рабочий». */
async function saveToken(service, raw) {
  const token = String(raw ?? '').trim()
  if (!token) return { ok: false, error: 'empty-token' }
  if (!TOKEN_SHAPE.test(token)) return { ok: false, error: 'bad-format' }
  const me = await tg(token, 'getMe')
  if (me.description === 'unreachable') return { ok: false, error: 'telegram-unreachable' }
  if (!me.ok || !me.result?.username) return { ok: false, error: 'token-rejected' }
  mkdirSync(stateDir(service), { recursive: true })
  writeFileSync(botFile(service), JSON.stringify({ name: me.result.first_name ?? '', username: me.result.username }, null, 2))
  writeSecret(envFile(service), `TELEGRAM_BOT_TOKEN=${token}\n`)
  if (!existsSync(accessFile(service))) {
    writeSecret(accessFile(service), JSON.stringify({ dmPolicy: 'allowlist', allowFrom: [], groups: {}, pending: {} }, null, 2))
  }
  return { ok: true, tail: token.slice(-4), username: me.result.username }
}

function access(service) {
  const a = readJson(accessFile(service), {})
  return { allowed: Array.isArray(a.allowFrom) ? a.allowFrom.map(String) : [] }
}

/** Ссылка допуска: одна метка на час, повторный запрос отдаёт ту же. */
function activationLink(service) {
  const bot = readJson(botFile(service), {})
  if (!bot.username) return { ok: false, error: 'no-bot-username' }
  let nonce = ''
  const a = readJson(activationFile(service), null)
  if (a?.nonce && Date.now() - a.createdAt < ACTIVATION_LIFETIME_MS) nonce = a.nonce
  if (!nonce) {
    nonce = randomBytes(12).toString('hex')
    writeSecret(activationFile(service), JSON.stringify({ createdAt: Date.now(), nonce }))
  }
  return { ok: true, url: `https://t.me/${bot.username}?start=${nonce}` }
}

/** Служба узла с папкой — единственные имена, от которых строятся пути и запускается агент. */
function isService(service) {
  return serviceDir(service) !== null
}

// ── СЕССИЯ ТЕРМИНАЛА С КАНАЛОМ ───────────────────────────────────────────────

/** Бот работает, если сессия терминала жива И запущена с каналом (запущенная до допуска — без него). */
function running(service) {
  const s = session.current(service)
  return Boolean(s && s.channel)
}

/** Терминал жив без канала — его запустили до того, как бот был подключён. */
function terminalWithoutChannel(service) {
  const s = session.current(service)
  return Boolean(s && !s.channel)
}

/**
 * 🛑 ЗАВИСИМОСТИ ПЛАГИНА СТАВЯТСЯ ДО ЗАПУСКА `claude`. ✗ Оплачено живым прогоном владельца 2026-09-22: сервер
 * плагина при ПЕРВОМ старте сам делает `bun install`, а `claude` ждёт подключения сервера 30 с (журнал
 * `--debug mcp`). Первая установка в них не укладывалась — бот молчал. Путь плагина — из
 * `~/.claude/plugins/installed_plugins.json`: у каждой машины он свой. Асинхронно — сервер сайта не встаёт.
 */
// 689: у элемента на подписке своего человека плагин живёт в ЕГО папке Claude Code (`CLAUDE_CONFIG_DIR` окружения сессии) — там его и
// ставит `claude plugin install` с тем же окружением.
const pluginPath = (env = process.env) =>
  readJson(path.join(env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), '.claude'), 'plugins', 'installed_plugins.json'), {}).plugins?.[PLUGIN]?.[0]?.installPath ?? ''

/**
 * Одна команда `claude …` асинхронно: сервер сайта не встаёт. Итог — код выхода и хвост вывода.
 * 🛑 WINDOWS: CLI, поставленный через npm, — это `claude.cmd`, а node не запускает `.cmd` без оболочки (EINVAL после CVE-2024-27980) —
 * оболочка только для `.cmd`, путь с пробелами в кавычках, аргументы — наши константы (как `scripts/ensure-claude.mjs`).
 */
function runClaude(bin, args, env) {
  return new Promise((resolve) => {
    const shell = process.platform === 'win32' && /\.cmd$/i.test(bin)
    let child
    try {
      child = spawn(shell && /\s/.test(bin) ? `"${bin}"` : bin, args, { env, windowsHide: true, shell })
    } catch (err) {
      return resolve({ ok: false, out: err instanceof Error ? err.message : String(err) })
    }
    let out = ''
    child.stdout.on('data', (d) => { out += d })
    child.stderr.on('data', (d) => { out += d })
    const timer = setTimeout(() => child.kill(), 180_000)
    child.on('close', (code) => { clearTimeout(timer); resolve({ ok: code === 0, out: out.slice(-300) }) })
    child.on('error', (err) => { clearTimeout(timer); resolve({ ok: false, out: err.message }) })
  })
}

/**
 * 🛑 ПЛАГИН СТАВИТ САМ УЗЕЛ. ✗ Живой прогон на чистом Mac 2026-11-02: плагина не было, его не ставил ни установщик, ни пульт — бот
 * писал «Агент включён и получил ваше сообщение», а ответа не было. Команды — из CLI Claude Code: `claude plugin install`, а нет
 * каталога официальных плагинов — `claude plugin marketplace add anthropics/claude-plugins-official` и ещё раз install.
 */
async function installPlugin(env) {
  const claude = resolveBin('claude', env.PATH || env.Path)
  if (!claude) return { ok: false, error: 'claude не найден — плагин Telegram ставится им' }
  let r = await runClaude(claude, ['plugin', 'install', PLUGIN], env)
  if (!pluginPath(env)) {
    await runClaude(claude, ['plugin', 'marketplace', 'add', 'anthropics/claude-plugins-official'], env)
    r = await runClaude(claude, ['plugin', 'install', PLUGIN], env)
  }
  return pluginPath(env) ? { ok: true } : { ok: false, error: `плагин ${PLUGIN} не установился: ${r.out}. Вручную: claude plugin install ${PLUGIN}` }
}

async function preparePlugin(env) {
  if (!pluginPath(env)) {
    const installed = await installPlugin(env)
    if (!installed.ok) return installed
  }
  return new Promise((resolve) => {
    const installPath = pluginPath(env)
    if (existsSync(path.join(installPath, 'node_modules'))) return resolve({ ok: true })
    const bun = resolveBin('bun', env.PATH || env.Path)
    if (!bun) return resolve({ ok: false, error: 'bun не найден — сервер плагина Telegram запускается им' })
    const child = spawn(bun, ['install', '--no-summary'], { cwd: installPath, env, windowsHide: true })
    let out = ''
    child.stdout.on('data', (d) => { out += d })
    child.stderr.on('data', (d) => { out += d })
    const timer = setTimeout(() => child.kill(), 300_000)
    child.on('close', (code) => {
      clearTimeout(timer)
      resolve(code === 0 ? { ok: true } : { ok: false, error: `bun install в ${installPath} не удался: ${out.slice(-300)}` })
    })
    child.on('error', (err) => {
      clearTimeout(timer)
      resolve({ ok: false, error: `bun install не запустился: ${err.message}` })
    })
  })
}

/**
 * Как запустить `claude` терминала, чтобы бот работал в нём. Нет токена или никого не допустили — `null`:
 * терминал запускается обычным агентом.
 * 🛑 `--permission-mode auto` ОБЯЗАТЕЛЕН: запрос разрешения ушёл бы в тот же канал, который ждёт ответа, и
 * сессия встала бы намертво, пока человек пишет с телефона (оплачено двумя часами молчания бота 2026-09-05).
 * 🛑 `--add-dir` папки состояния: без него — вопрос политики путей, который плагин не пересылает (закон проекта).
 */
async function channelLaunch(service, env) {
  if (!storedToken(service) || access(service).allowed.length === 0) return null
  const pathKey = Object.keys(env).find((k) => k.toUpperCase() === 'PATH') || 'PATH'
  const dirs = [...extraBins(), ...String(env[pathKey] || '').split(path.delimiter).filter(Boolean)]
  const withBins = { ...env, [pathKey]: dirs.join(path.delimiter), TELEGRAM_STATE_DIR: stateDir(service) }
  const ready = await preparePlugin(withBins)
  if (!ready.ok) return { ok: false, error: ready.error }
  return {
    ok: true,
    env: withBins,
    args: ['--channels', `plugin:${PLUGIN}`, '--add-dir', stateDir(service), '--permission-mode', 'auto', ...githubRule(service)],
  }
}

/**
 * 374-4 (слово владельца 2026-10-02: «работу через Telegram бот, коммит автоматически всегда» — «коммит и сразу отправка в
 * GitHub»; в терминале — «нельзя запрещать делать коммит по требованию»). Правило дописывается к запуску агента ЭЛЕМЕНТА: агент
 * узла (`workspace: node`) правит само ядро, его отправка в GitHub — не этот путь. Один комплект на все элементы — правило
 * получают все, без правки репозиториев элементов. Команда — скрипт ядра по абсолютному пути (дверь «Отправить» по петле).
 */
function githubRule(service) {
  const manifestFile = path.join(process.cwd(), 'app', '[lang]', '(architectLayer)', 'architect', String(service), 'agent-kit.json')
  try {
    if (['node', 'main-agent'].includes(JSON.parse(readFileSync(manifestFile, 'utf8')).workspace)) return []
  } catch { /* общая копия [item] или служба без манифеста — элемент */ }
  const script = path.join(process.cwd(), 'scripts', 'element-github-push.mjs')
  return ['--append-system-prompt', `GitHub rule of this WEB4 ITEM (node step 374). When a task comes through the Telegram channel, finish it, commit your changes and immediately send them to GitHub by running: node "${script}" ${service} — then tell the person the line it printed (===GITHUB_PUSH_OK=== or the reason). For a task typed in this terminal, commit as your instructions say and send to GitHub only when the person asks — with the same command.`]
}

// ── СИСТЕМНОЕ СООБЩЕНИЕ О СОСТОЯНИИ ───────────────────────────────────────────

/**
 * Тексты сообщения приносит страница бота на языке человека и с адресами разделов от того адреса, на котором
 * она открыта (на своём домене это публичные ссылки для телефона). Узел их хранит, потому что отвечает боту и
 * тогда, когда страница закрыта.
 */
function saveMessages(service, raw) {
  const pick = (v) => String(v ?? '').slice(0, 1000)
  const m = { active: pick(raw?.active), inactive: pick(raw?.inactive), noSubscription: pick(raw?.noSubscription) }
  if (!m.active || !m.inactive || !m.noSubscription) return { ok: false, error: 'bad-messages' }
  mkdirSync(stateDir(service), { recursive: true })
  writeFileSync(messagesFile(service), JSON.stringify(m, null, 2))
  // 411: язык страницы, где человек подключал бота, — начальный язык человека.
  if (raw?.lang) setPersonLang(service, raw.lang, 'page')
  return { ok: true }
}

const FALLBACK = {
  active: 'This message was sent by your node. Your terminal is active — write, Claude Code answers.',
  inactive: 'This message was sent by your node. Your terminal is not active — Claude Code will not answer. Open the node terminal and start the agent.',
  noSubscription: 'This message was sent by your node. Claude Code on this computer is not signed in to a subscription. Sign in first, then start the agent in the terminal.',
}

// 689: у элемента на подписке своего человека «вошёл ли» спрашивается в ЕГО папке Claude Code, а не у узла.
function claudeSignedIn(service) {
  return new Promise((resolve) => setImmediate(() => resolve(claudeAuthState(ownClaudeDir(service)).loggedIn)))
}

/** Состояние словами: подписка не подключена → сначала она; иначе — активен ли терминал. */
async function statusMessage(service) {
  const m = { ...FALLBACK, ...readJson(messagesFile(service), {}) }
  if ((await claudeSignedIn(service)) === false) return { text: m.noSubscription, trouble: true }
  return { text: running(service) ? m.active : m.inactive, trouble: false }
}

// ── УЗЕЛ ЧИТАЕТ БОТА, ПОКА ТЕРМИНАЛ ВЫКЛЮЧЕН ─────────────────────────────────

const idleKey = (service) => `__web4TelegramIdle:${service}`
// 737-11a: a node on its dedicated server rehearsing (phase «silent», `lib/hosting/phase.cjs`) — read as a file here: this module is bundled
// with the channel door, and a require by a computed path does not build (✗ 552-6).
const silentServer = () => readJson(path.join(ROOT, 'data', 'node', 'server.json'), {})?.phase === 'silent'

async function idleTick(service) {
  const token = storedToken(service)
  if (!token || running(service)) return
  const got = await tg(token, 'getUpdates', { allowed_updates: ['message', 'callback_query'], timeout: 0 })
  // 409 — бота читает кто-то другой (канал только что поднялся): уступаем без шума.
  if (!got.ok || !Array.isArray(got.result) || got.result.length === 0) return
  if (running(service)) return
  const updates = got.result
  await tg(token, 'getUpdates', { offset: updates[updates.length - 1].update_id + 1, timeout: 0 })

  const a = readJson(activationFile(service), null)
  const nonce = a && Date.now() - a.createdAt < ACTIVATION_LIFETIME_MS ? a.nonce : ''
  const answered = new Set()
  for (const u of updates) {
    if (u.callback_query) {
      // 737-11a: nothing is started from a rehearsing server — a stray button only gets its acknowledgement.
      if (silentServer()) { await tg(token, 'answerCallbackQuery', { callback_query_id: u.callback_query.id }); continue }
      await onButton(service, token, u.callback_query)
      continue
    }
    const msg = u.message
    if (!msg || msg.chat?.type !== 'private' || !msg.from) continue
    const sender = String(msg.from.id)
    let activated = false
    if (nonce && typeof msg.text === 'string' && msg.text.trim() === `/start ${nonce}`) {
      const acc = { dmPolicy: 'allowlist', allowFrom: [], groups: {}, pending: {}, ...readJson(accessFile(service), {}) }
      if (!acc.allowFrom.map(String).includes(sender)) acc.allowFrom.push(sender)
      writeSecret(accessFile(service), JSON.stringify(acc, null, 2))
      rmSync(activationFile(service), { force: true })
      activated = true
    } else if (!access(service).allowed.includes(sender)) {
      // Чужим узел не отвечает: список допущенных — единственная граница бота.
      continue
    }
    // 597-4: the main agent's bot gets the node's menu in this person's chat at the moment of the link (scope chat stands above the
    // plugin's own menu).
    if (activated && service === 'build') {
      try { await nodeCommands().applyMenu(token, [sender], personLang(service)) } catch { /* the menu is a convenience — `npm run commands -- menu` sets it again */ }
    }
    // 737-11a (владелец 2026-11-13: «После подтверждения сервер сразу стартует установленный на него Telegram»): бот выделенного сервера
    // во время репетиции впускает по ссылке и отвечает одной строкой — узел ещё живёт на компьютере человека, и ни один агент здесь не
    // стартует до переезда (замок `lib/agent-kit/mount.cjs` закрывает двери пробуждения, а этот — кнопки и «/on» самого бота).
    if (silentServer()) {
      if (answered.has(msg.chat.id)) continue
      answered.add(msg.chat.id)
      const t = await askTable(service)
      if (activated) await sendKept(token, { chat_id: msg.chat.id, text: t.silentServer ?? ASK.en.silentServer }) // 639: остаётся — итог допуска
      else await sendVanishing(token, { chat_id: msg.chat.id, text: t.silentServer ?? ASK.en.silentServer }) // 639: исчезает — состояние
      continue
    }
    // 409-4 (владелец 2026-10-05: агент просыпается «и на сообщение в Telegram», с подтверждением до старта): текст
    // допущенного при выключенном терминале — не «терминал не активен», а тот же вопрос с кнопками; после «Запустить» агент
    // получает это сообщение. 597-4: с вещью и подписью; команды узла — по `idleDecision`; прочие «/…» и неподключённая
    // подписка — прежнее сообщение о состоянии.
    // 604: a folder trust question waits for this chat's «yes» — a short plain yes answers it here, with no agent turned on. Anything
    // else goes on as before, and the main agent, woken by it, reads the person's meaning (the pending question rides in its prompt).
    if (!activated && trustWaitingVia(service).length && trustYes(msg.text)) {
      await answerTrustHere(service, token, msg.chat.id)
      continue
    }
    const d = activated ? { do: 'status' } : idleDecision(msg, service)
    if (d.do === 'list') {
      await sendKept(token, { chat_id: msg.chat.id, text: await commandsText(service), disable_web_page_preview: true }) // 639: список — сам ответ человеку
      continue
    }
    // 620: ключ OpenAI в чате спящего главного агента — узел сохраняет его сам и удаляет сообщение; ни агенту, ни в файлы бота ключ не идёт.
    if (d.do === 'openai-key') {
      const t = await askTable(service)
      const saved = await saveOpenAiKey(d.key)
      const gone = await tg(token, 'deleteMessage', { chat_id: msg.chat.id, message_id: msg.message_id })
      const said = (saved.ok ? (t.keySaved ?? ASK.en.keySaved) : (t.keyRejected ?? ASK.en.keyRejected)(saved.error)) + (gone.ok ? '' : ` ${t.keyNotDeleted ?? ASK.en.keyNotDeleted}`)
      await sendKept(token, { chat_id: msg.chat.id, text: said }) // 639: итог (ключ принят) или беда (не принят)
      console.log(`[telegram] ${service}: ключ OpenAI из чата — ${saved.ok ? 'сохранён' : `не принят (${saved.error})`}, сообщение ${gone.ok ? 'удалено' : 'не удалено'}`)
      continue
    }
    if (d.do !== 'status' && (await claudeSignedIn(service)) !== false) {
      const t = await askTable(service)
      const a = shortName(named(service))
      // Владелец 2026-10-06: «выключи» выключенному агенту — не повод его включать; ответ «уже выключен».
      if (d.do === 'already-off') {
        await sendVanishing(token, { chat_id: msg.chat.id, text: (t.alreadyOff ?? ASK.en.alreadyOff)(a) })
        continue
      }
      // 620: очистить контекст, показать его или подготовить к сбросу выключенному агенту — нечего: контекста нет, будить незачем.
      if (d.do === 'off-session') {
        await sendVanishing(token, { chat_id: msg.chat.id, text: (t.offSession ?? ASK.en.offSession)(a) })
        continue
      }
      // 666: «/opus» спящему агенту — список усилий; запрос, если он уже ждёт, едет с ним.
      if (d.do === 'effort') {
        await askEffort(service)
        continue
      }
      // 597-4: «включить» — само согласие человека: агент стартует без поручения (ноль токенов), вопроса с кнопками нет.
      // 620: «/opus», «/sonnet», «/haiku» спящему агенту — то же согласие, сразу на этой модели (как кнопки 611).
      if (d.do === 'start') {
        let out = typeof starter === 'function' ? await starter(service, d.model ? { model: d.model } : {}) : { ok: false, reason: 'no-starter' }
        // 614-1: «включён — пишите ему» — только когда встал канал; не встал — сессия уже закрыта, человеку «Извините…».
        const ch = out.ok && typeof out.channelReady === 'function' ? await out.channelReady() : null
        if (ch && !ch.up) out = { ok: false, reason: ch.reason === 'channel' ? 'channel' : 'session-ended', waited: ch.waited }
        const said = out.ok ? `${(t.onNow ?? ASK.en.onNow)(a)}${modeLine(out, t)}` : out.reason === 'memory' ? t.memory(a, out.freeMb, out.perSessionMb, out.top) : out.reason === 'channel' ? (t.channelFailed ?? ASK.en.channelFailed)(a, out.waited) : t.failed(a, String(out.reason ?? 'unknown'))
        // 639: «включён — пишите ему» исчезает; беда (память, канал) остаётся — она ждёт действия человека.
        if (out.ok) await sendVanishing(token, { chat_id: msg.chat.id, text: said, disable_web_page_preview: true })
        else await sendKept(token, { chat_id: msg.chat.id, text: said, disable_web_page_preview: true })
        continue
      }
      const who = [msg.from.first_name, msg.from.last_name].filter(Boolean).join(' ') || msg.from.username || sender
      const said = d.text || `(${d.thing?.label ?? 'сообщение'})`
      await askToStart(service, { text: humanPrompt(service, msg.chat.id, who, said, d.thing), from: who, about: said, kind: 'human' })
      continue
    }
    if (answered.has(msg.chat.id)) continue
    answered.add(msg.chat.id)
    // 639: «подписка не подключена» ждёт действия человека — остаётся; состояние терминала — исчезает
    const status = await statusMessage(service)
    await (status.trouble ? sendKept : sendVanishing)(token, { chat_id: msg.chat.id, text: status.text, disable_web_page_preview: true })
  }
}

// ── ПОДТВЕРЖДЕНИЕ ЗАПУСКА В TELEGRAM (409-3) ──────────────────────────────────
//
// Владелец 2026-10-05: «запрос → подтверждение в Telegram → сессия → предложение закрыть»; «ждём без предела, проверка
// каждые 3 с»; бота нет — старт сразу. Бот элемента подключён (токен И хотя бы один допущенный — то же определение, что у
// рассылки 408-5) и сессии нет — `wake` не рождает сессию, а зовёт `askToStart`: допущенным уходит вопрос с кнопками
// «Запустить» / «Не сейчас», запросы копятся в `data/services/<id>/wake/pending.json` (переживают перезапуск узла). Нажатие
// приходит опросу узла (`idleTick`, `callback_query`) — пока терминал выключен, бота читает только он. «Запустить» → `starter`
// (его кладёт bridge.cjs: `wake` с подтверждением) и все накопленные тексты во вход агента. «Не сейчас» → запросы сняты,
// каждому вызывающему, оставившему `declineUrl`, — ответ «человек не стал запускать» (иначе его задача ждала бы вечно).

/** Подключён ли бот службы: токен и хотя бы один допущенный. */
function connected(service) {
  return Boolean(storedToken(service)) && access(service).allowed.length > 0
}

// ── ЯЗЫК ЧЕЛОВЕКА (411; владелец 2026-10-06: «в своем чате я вижу на своем языке по дефолту ну или если я уже после этого перешёл
// на другой язык») ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Значение, а не догадка: `person.json` в папке бота — `{ lang, source, at }`. Источники: `page` — язык страницы, где бота
// подключали (страница шлёт его вместе с системными текстами); `agent` — свой агент увидел, что человек пишет на другом языке, и
// сообщил дверью `POST /api/agents/person-lang`. Страница не перекрывает выбор агента: человек уже перешёл на свой язык.
// Нет файла — прежняя догадка по кириллице системных текстов (бот, подключённый до 411).

const personFile = (service) => path.join(stateDir(service), 'person.json')
const LANG_CODE = /^[a-z]{2,3}(-[A-Za-z0-9]{2,8})?$/

function personLang(service) {
  const p = readJson(personFile(service), null)
  if (p && typeof p.lang === 'string' && LANG_CODE.test(p.lang)) return p.lang
  // 636-7 (✗ 2026-11-03: у памяти нет своего бота, её сессия решила «en» и написала напоминание по-английски): у элемента без своего
  // бота человек тот же, что у главного агента, — его язык.
  if (service !== 'build') {
    const m = readJson(personFile('build'), null)
    if (m && typeof m.lang === 'string' && LANG_CODE.test(m.lang)) return m.lang
  }
  try { return /[а-яё]/i.test(readFileSync(messagesFile(service), 'utf8')) ? 'ru' : 'en' } catch { return 'en' }
}

function setPersonLang(service, lang, source) {
  const code = String(lang ?? '').trim().toLowerCase()
  if (!LANG_CODE.test(code)) return { ok: false, error: 'bad-lang' }
  const cur = readJson(personFile(service), null)
  if (source === 'page' && cur?.source === 'agent') return { ok: true, lang: cur.lang, kept: true }
  mkdirSync(stateDir(service), { recursive: true })
  writeFileSync(personFile(service), JSON.stringify({ lang: code, source, at: new Date().toISOString() }, null, 2))
  return { ok: true, lang: code }
}

/**
 * 411-2: таблицы текстов на языке человека — en/ru встроены, прочие языки переводятся один раз ключом OpenAI ядра и кэшируются
 * (`translate.cjs`); перевода нет — английский. Объявлены ниже `ASK` и `CLOSE`, вызываются при отправке.
 */
async function askTable(service) {
  const l = personLang(service)
  if (ASK[l.split('-')[0]]) return ASK[l.split('-')[0]]
  return tableFor('telegram-ask', ASK.en, l)
}
async function closeTable(service) {
  const l = personLang(service)
  if (CLOSE[l.split('-')[0]]) return CLOSE[l.split('-')[0]]
  return tableFor('telegram-close', CLOSE.en, l)
}


/** `<адрес>.<зона>` элемента — как подпись рассылки 408-5. */
function named(service) {
  let address = service
  try {
    const a = JSON.parse(readFileSync(path.join(ROOT, 'data', 'services', service, 'address.json'), 'utf8')).address
    if (typeof a === 'string' && a) address = a
  } catch { /* адрес = id */ }
  try {
    const zone = JSON.parse(readFileSync(path.join(ROOT, 'logs', 'domain.json'), 'utf8')).zone
    if (typeof zone === 'string' && zone && !address.includes('.')) return `${address}.${zone}`
  } catch { /* без зоны */ }
  return address
}

/**
 * 547 (владелец 2026-10-19: «ты активируешь папку также как и запускаешь агента то есть прямо из чата»): доверяет ли Claude Code
 * папке агента. Claude Code помнит доверие на путь папки (`~/.claude.json`, `projects[<путь>].hasTrustDialogAccepted`) — у нового
 * и переименованного элемента записи нет, и первый запуск стоит на вопросе «Is this a project you trust?». Узел файл только читает:
 * отвечает на вопрос тем же нажатием, что человек (`bridge.cjs`). null — не известно (файла нет, формат другой).
 */
function folderTrusted(service) {
  const dir = serviceDir(service)
  if (!dir) return null
  // 689: у элемента на подписке своего человека доверие помнит ЕГО папка Claude Code (`<своя папка>/.claude.json`).
  const home = ownClaudeDir(service)
  try {
    const projects = JSON.parse(readFileSync(home ? path.join(home, '.claude.json') : path.join(os.homedir(), '.claude.json'), 'utf8')).projects ?? {}
    const key = dir.replace(/\\/g, '/')
    const entry = projects[key] ?? projects[dir]
    return entry ? entry.hasTrustDialogAccepted === true : false
  } catch { return null }
}

/** 547: пути разделов агента без языка — у рождённого элемента они под его адресом и `build/`, у служб ядра — под `architect/`. */
function sectionPaths(service) {
  if (isBornItem(service)) {
    const address = readJson(path.join(ROOT, 'data', 'services', service, 'address.json'), null)?.address
    const a = typeof address === 'string' && /^[a-z0-9-]{1,40}$/.test(address) ? address : service
    return { terminal: `/${a}/build/terminal`, subscription: `/${a}/build/subscription` }
  }
  return { terminal: `/architect/${service}/terminal`, subscription: `/architect/${service}/claude-code` }
}

/** Адрес ядра, который человек откроет с телефона: `architect.<зона>`, без своей зоны — эта машина. */
function coreOrigin() {
  const zone = readJson(path.join(ROOT, 'logs', 'domain.json'), null)?.zone
  return typeof zone === 'string' && zone ? `https://architect.${zone}` : `http://localhost:${process.env.PORT || 24680}`
}

// Тексты — языком человека (владелец 2026-10-05 одобрил образец: «Агенту roman пришёл вопрос от агента gyr1i / «…» / Агент roman
// сейчас выключен. Включить его, чтобы он ответил? / [Включить и ответить] [Не сейчас — gyr1i получит отказ]»). Кто говорит и
// кому — словами; «терминал» — внутреннее устройство, человеку говорится «агент включён / выключен». `a` — имя агента элемента
// (адрес без зоны), `c` — кто спрашивает (одно имя или список через запятую).
const ASK = {
  en: {
    oneCall: (a, c) => `Agent ${a} got a question from agent ${c}`,
    manyCalls: (a, n) => `Agent ${a} got ${n} questions`,
    fromLine: (c, q) => `from ${c}: «${q}»`,
    offCalls: (a) => `Agent ${a} is off now. Turn it on so it answers?`,
    offHuman: (a) => `Agent ${a} is off. Turn it on and pass your message to it?`,
    yourMessage: (q) => `Your message: «${q}»`,
    goCalls: 'Turn on and answer', goHuman: 'Turn on and pass',
    // 611 (owner 2026-10-30): three buttons — the model of the session is chosen by the person.
    goMax: 'Turn on — maximum model (Opus)', goMid: 'Turn on — medium model (Sonnet)', goEco: 'Turn on — economy model (Haiku)',
    // 666 (owner 2026-11-06): Opus → the effort of the session; ultracode → a warning with two buttons.
    effortAsk: (a) => `Agent ${a} — the Opus model. Which effort should it work with?`,
    fxLow: 'Low', fxMedium: 'Medium (default)', fxHigh: 'High', fxXhigh: 'Very high (xhigh)', fxMax: 'Maximum (max)',
    fxUltra: 'Ultracode — workflows with subagents',
    back: 'Choose another model',
    ultraWarn: 'Warning! Ultracode runs workflows with many subagents that Claude Code Agent manages automatically, with maximum thinking effort. This can lead to extremely high token use.',
    ultraGo: 'Continue',
    modeIs: (m) => `Mode: ${m}.`,
    offEmpty: (a) => `Agent ${a} is off. Turn it on?`,
    ultraMissing: (a) => `Ultracode did not turn on for agent ${a}: Claude Code on this computer did not show it — it needs a fresh Claude Code and workflows allowed for your account. The agent works on Opus · max without workflows.`,
    noCalls: (c) => `Not now — ${c} gets a refusal`, noHuman: 'Not now',
    startedCalls: (a, c) => `Agent ${a} is on and answering ${c}.`,
    startedHuman: (a) => `Agent ${a} is on and got your message.`,
    declinedCalls: (a, c) => `Agent ${a} was not turned on — ${c} gets a refusal.`,
    declinedHuman: (a) => `Agent ${a} was not turned on.`,
    // 624-2 (владелец 2026-11-02): кто занимает память и что закрыть; «нажмите позже» без совета — отказ, а не помощь (закон 6: консультация).
    memory: (a, f, n, top) => `Agent ${a} was not turned on: not enough memory — ${f} MB available, ${n} MB needed.` +
      (top?.length ? `\nUsing the most memory now: ${top.map((x) => `${x.name} — ${x.mb >= 1024 ? `${(x.mb / 1024).toFixed(1)} GB` : `${x.mb} MB`}`).join(', ')}.` : '') +
      `\nClose what you do not need — the Claude Code installation chat, spare browser tabs — and press «Turn on» again.` +
      `\nIf this happens often, the node is cramped on this computer: ask the main agent which computer or VPS to move to.`,
    failed: (a, r) => `Agent ${a} did not turn on: ${r}. Press «Turn on» again.`,
    declineText: (a) => `The owner of ${a} chose not to turn its agent on now.`,
    toast: 'Turning on…',
    moved: '↓ More questions came — the updated question is below.',
    alreadyOff: (a) => `Agent ${a} is already off.`,
    // 620: session commands to a sleeping agent and the OpenAI key sent to the main agent's chat.
    offSession: (a) => `Agent ${a} is off — its context is empty; the next conversation starts from a clean page.`,
    keySaved: 'OpenAI accepted the key — the node keeps it, and the message with the key is deleted.',
    keyRejected: (why) => `OpenAI did not accept the key (${why}) — the old key stays.`,
    keyNotDeleted: 'The bot could not delete the message with the key — delete it yourself.',
    // 737-11a: the bot of a dedicated server that is still rehearsing.
    silentServer: 'This bot is connected to your dedicated server. The project still runs on your computer — after the move the main agent will answer you here.',
    trustLine: 'Its folder is not trusted in Claude Code yet — «Turn on» trusts it as well.',
    waitingTerminal: (a, link) => `Agent ${a} is waiting for your answer in the terminal: ${link}`,
    // 597-4: «turn on» typed to a sleeping agent's bot — the agent starts with no task.
    onNow: (a) => `Agent ${a} is on — write to it.`,
    // 604: the folder trust question, asked in the main agent's chat.
    trustAsk: (a) => `Agent ${a} asks to work in its own folder on this computer. Claude Code asks this once for every folder. Allow? Reply «yes».`,
    trustDone: (a) => `Done: agent ${a} works in its folder. This question will not come again.`,
    trustGone: (a) => `Agent ${a} is no longer waiting for this answer — it was answered or turned off.`,
    // 614-1: the session was born, but its Telegram channel did not come up — the node closed it and reads the bot again.
    channelFailed: (a, n) => `Sorry, agent ${a} could not start: its Telegram channel did not connect within ${n} seconds, so the agent is off again. Turn it on again in a couple of minutes.`,
    channelFailedKept: (a, n) => `Sorry, agent ${a} could not start: its Telegram channel did not connect within ${n} seconds, so the agent is off again. Your message is kept — press «Turn on» again in a couple of minutes.`,
  },
  ru: {
    oneCall: (a, c) => `Агенту ${a} пришёл вопрос от агента ${c}`,
    manyCalls: (a, n) => `Агенту ${a} пришли вопросы (${n})`,
    fromLine: (c, q) => `от ${c}: «${q}»`,
    offCalls: (a) => `Агент ${a} сейчас выключен. Включить его, чтобы он ответил?`,
    offHuman: (a) => `Агент ${a} выключен. Включить его и передать ему ваше сообщение?`,
    yourMessage: (q) => `Ваше сообщение: «${q}»`,
    goCalls: 'Включить и ответить', goHuman: 'Включить и передать',
    goMax: 'Включить — максимальная модель (Opus)', goMid: 'Включить — средняя модель (Sonnet)', goEco: 'Включить — экономная модель (Haiku)',
    // 666: слова владельца предупреждения — «внимания ультра кот запускает рабочие процессы с множеством суб агентов которые автоматикой
    // Claude Code Agent с максимальной эффективностью размышлений. Это может привести к экстремально высоким расходам токенов»; кнопки —
    // «продолжить», «выбрать другую модель».
    effortAsk: (a) => `Агент ${a} — модель Opus. С какими усилиями ей работать?`,
    fxLow: 'Низкие — low', fxMedium: 'Средние — medium (по умолчанию)', fxHigh: 'Высокие — high', fxXhigh: 'Очень высокие — xhigh', fxMax: 'Максимальные — max',
    fxUltra: 'Ultracode — рабочие процессы с субагентами',
    back: 'Выбрать другую модель',
    ultraWarn: 'Внимание! Ultracode запускает рабочие процессы с множеством субагентов, которыми Claude Code Agent управляет автоматически, с максимальной эффективностью размышлений. Это может привести к экстремально высоким расходам токенов.',
    ultraGo: 'Продолжить',
    modeIs: (m) => `Режим: ${m}.`,
    offEmpty: (a) => `Агент ${a} выключен. Включить его?`,
    ultraMissing: (a) => `Ultracode у агента ${a} не включился: Claude Code на этом компьютере его не показал — нужна свежая версия Claude Code и разрешённые для вашей учётной записи рабочие процессы. Агент работает на Opus · max без рабочих процессов.`,
    noCalls: (c) => `Не сейчас — ${c} получит отказ`, noHuman: 'Не сейчас',
    startedCalls: (a, c) => `Агент ${a} включён и отвечает ${c}.`,
    startedHuman: (a) => `Агент ${a} включён и получил ваше сообщение.`,
    declinedCalls: (a, c) => `Агент ${a} не включён — ${c} получит отказ.`,
    declinedHuman: (a) => `Агент ${a} не включён.`,
    memory: (a, f, n, top) => `Агент ${a} не включён: не хватает памяти — доступно ${f} МБ, нужно ${n} МБ.` +
      (top?.length ? `\nБольше всего памяти сейчас занимают: ${top.map((x) => `${x.name} — ${x.mb >= 1024 ? `${(x.mb / 1024).toFixed(1).replace('.', ',')} ГБ` : `${x.mb} МБ`}`).join(', ')}.` : '') +
      `\nЗакройте лишнее — установочный чат Claude Code, ненужные вкладки браузера — и нажмите «Включить» ещё раз.` +
      `\nЕсли так бывает часто, узлу тесно на этом компьютере: спросите главного агента, на какой компьютер или VPS перейти.`,
    failed: (a, r) => `Агент ${a} не включился: ${r}. Нажмите «Включить» ещё раз.`,
    declineText: (a) => `Хозяин ${a} не стал сейчас включать его агента.`,
    toast: 'Включаю…',
    moved: '↓ Пришли ещё вопросы — обновлённый вопрос ниже.',
    alreadyOff: (a) => `Агент ${a} уже выключен.`,
    offSession: (a) => `Агент ${a} выключен — контекст пуст, следующий разговор начнётся с чистого листа.`,
    keySaved: 'OpenAI принял ключ — узел его сохранил, сообщение с ключом удалено.',
    keyRejected: (why) => `OpenAI не принял ключ (${why}) — остаётся прежний.`,
    keyNotDeleted: 'Бот не смог удалить сообщение с ключом — удалите его сами.',
    silentServer: 'Этот бот подключён к вашему выделенному серверу. Проект пока работает на вашем компьютере — после переезда здесь вам ответит главный агент.',
    trustLine: 'Его папка ещё не подтверждена в Claude Code — «Включить» подтвердит и её.',
    waitingTerminal: (a, link) => `Агент ${a} ждёт вашего ответа в терминале: ${link}`,
    onNow: (a) => `Агент ${a} включён — пишите ему.`,
    trustAsk: (a) => `Агент ${a} просит разрешения работать в своей папке на этом компьютере. Claude Code спрашивает об этом один раз для каждой папки. Разрешить? Ответьте «да».`,
    trustDone: (a) => `Готово: агент ${a} работает в своей папке. Больше этот вопрос не появится.`,
    trustGone: (a) => `Агент ${a} уже не ждёт этого ответа — вопрос закрыт или агент выключен.`,
    channelFailed: (a, n) => `Извините, агент ${a} не смог запуститься: его канал Telegram не подключился за ${n} секунд, поэтому агент снова выключен. Включите его ещё раз через пару минут.`,
    channelFailedKept: (a, n) => `Извините, агент ${a} не смог запуститься: его канал Telegram не подключился за ${n} секунд, поэтому агент снова выключен. Ваше сообщение сохранено — нажмите «Включить» ещё раз через пару минут.`,
  },
}

/**
 * 426 (владелец 2026-10-07: «нативно наша архитектура даже не знает о том, что у нас есть Telegram»): первой строкой — «узнай себя и
 * узел», как у задачи A2A (`lib/a2a/executor.ts` элемента): поручение в руках сильнее правила в инструкции. Только элементу, у
 * которого есть `npm run passport` (паспорт нового вида) — остальным такой команды нет.
 * 548-15: только `passport -- me` — тем же словом, что задача A2A элемента (548-14): часть `node` в нём постоянного размера, а
 * `passport -- project` на пробуждении рос бы с числом элементов узла; соседа агент ищет по нужде.
 */
function knowYourself(service) {
  try {
    const pkg = JSON.parse(readFileSync(path.join(serviceDir(service), 'package.json'), 'utf8'))
    if (!pkg?.scripts?.passport) return ''
  } catch { return '' }
  return 'Сначала узнай себя: npm run passport -- me (навык own-service-props-detection; вывод читай целиком, не режь head; часть node — где ты живёшь). Соседа ищи только по нужде: npm run a2a -- find <английские слова>. Как отвечать человеку — навык telegram-channel. '
}

/**
 * 409-4: что вставить агенту из сообщения человека — кто, откуда и как ответить (инструмент reply канала Telegram).
 * 597-4: вещь сообщения (фото, документ, голос…) едет номером файла — агент скачает её инструментом канала. ✗ До 597-4 спящий бот на фото
 * отвечал справкой о состоянии, и вещь терялась: «фото, потом «запомни, это моя мама»» будило агента без фото.
 */
function humanPrompt(service, chatId, who, said, thing = null) {
  const att = thing ? ` [вложение: ${thing.label}, file_id ${thing.file_id} — скачай его инструментом download_attachment канала и прочитай]` : ''
  return `${knowYourself(service)}Сообщение из Telegram от ${who} (chat_id ${chatId}), пока ты был выключен: ${said}${att} — ответь ему в Telegram инструментом reply канала (chat_id ${chatId}).${trustNote(service)}`
}

// 597-4: the node's commands (`lib/agent-kit/commands.cjs`) — put on `globalThis` by the bridge's mount (`lib/agent-kit/mount.cjs`).
// 🛑 Not `require(path.join(ROOT, …))`: a door imports this file, and the core's build cannot resolve a path from the working folder
// («server relative imports are not implemented yet», ✗ 552-6; repeated in 597-4 and found by the rebuild of 599-4 — 26 errors).
const nodeCommands = () => {
  const m = globalThis.__web4NodeCommands
  if (!m) throw new Error('the node commands are not mounted')
  return m
}
const THING_KINDS = [['document', 'документ'], ['voice', 'голосовое'], ['audio', 'аудио'], ['video', 'видео'], ['video_note', 'видеосообщение']]

/** The thing a Telegram message carries — { kind, label, file_id } — or null. A photo — its largest size (the plugin does the same). */
function thingOf(msg) {
  if (Array.isArray(msg?.photo) && msg.photo.length) return { kind: 'photo', label: 'фото', file_id: msg.photo[msg.photo.length - 1].file_id }
  for (const [k, label] of THING_KINDS) if (msg?.[k]?.file_id) return { kind: k, label, file_id: msg[k].file_id }
  return null
}

/**
 * 597-4: what a sleeping bot does with one message — code with no model, so only what a miss cannot hurt (owner 2026-10-26: «анализ прямого
 * совпадения это вариант который нельзя использовать» — the agent's model reads the rest): a bare «команды» / /commands → the list; a bare
 * «включить» / /on → the agent starts with no task; «выключи» → it is already off; a text or a thing (photo, document, voice…, with its
 * caption) → into the question «turn on and pass?», as before — now with the thing; /start, /help, /status and other slashes → the status.
 */
function idleDecision(msg, service) {
  const text = String(msg?.text ?? msg?.caption ?? '').trim()
  const thing = thingOf(msg)
  // 620: an OpenAI key in the main agent's chat — the node keeps it itself (a pattern this exact cannot be a phrase: no miss, no false hit).
  const key = service === 'build' ? text.match(OPENAI_KEY)?.[0] : null
  if (key) return { do: 'openai-key', key }
  let cmds = null
  try { cmds = nodeCommands() } catch { /* no list — the old behaviour */ }
  if (!thing) {
    const bare = cmds ? cmds.bareOf(text) : null
    if (bare === 'commands') return { do: 'list' }
    if (bare === 'on') return { do: 'start' }
    // 666: Opus всегда ведёт к выбору усилий — и кнопкой, и голым «/opus» спящему агенту.
    if (bare === 'opus') return { do: 'effort' }
    if (['sonnet', 'haiku'].includes(bare)) return { do: 'start', model: bare }
    if (['clear', 'context', 'prepare'].includes(bare)) return { do: 'off-session' }
    if (bare === 'off' || OFF_WORDS.test(text)) return { do: 'already-off' }
    // A slash command of the node's list with words («/remember …») is a message; any other slash — the status, as before.
    if (text.startsWith('/') && !(cmds && cmds.slashOf(text))) return { do: 'status' }
  }
  if (text || thing) return { do: 'message', text, thing }
  return { do: 'status' }
}

const OPENAI_KEY = /\bsk-[A-Za-z0-9_-]{20,300}/
/**
 * 620: the key goes through the core's own door `/api/architect/environment` (loopback, as `npm run openai-key`): OpenAI is asked for real
 * before anything is written, a refusal leaves the file untouched. → { ok } | { ok: false, error }.
 */
async function saveOpenAiKey(key) {
  const port = readJson(path.join(ROOT, 'logs', 'runtime.json'), {})?.port ?? 24680
  try {
    const r = await fetch(`http://localhost:${port}/api/architect/environment`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ target: 'core', name: 'OPENAI_API_KEY', value: key }), signal: AbortSignal.timeout(30_000) })
    const b = await r.json().catch(() => ({}))
    return b.ok ? { ok: true } : { ok: false, error: String(b.error ?? r.status) }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) }
  }
}

/** The list of the node's commands in the person's language (ru and en built in, any other — translated once and cached). */
async function commandsText(service) {
  const lang = personLang(service)
  const cmds = nodeCommands()
  if (['ru', 'en'].includes(lang.split('-')[0])) return cmds.humanList(lang)
  const t = await tableFor('telegram-commands', { list: cmds.humanList('en') }, lang)
  return t.list
}

/** «Выключи» и его родня целиком, без другого текста: выключенному агенту это не поручение, а просьба, которая уже исполнена. */
// 548-15: `\s` вместо `s` — обратные косые были потеряны (найдено в 545), и «выключи .» с пробелом не узнавалось.
const OFF_WORDS = /^\s*(выключи(ть|сь)?|выключай|закрой|закрыть|стоп|off|turn( it)? off|switch off|stop|close)\s*[.!]*\s*$/i

const allHuman = (items) => items.length > 0 && items.every((it) => it.kind === 'human')

const cutText = (t, n) => (t.length > n ? `${t.slice(0, n - 1)}…` : t)

/** Имя элемента для человека: адрес без зоны узла (`roman`, а не `roman.throughsongs.com` и не id). */
function shortName(nameOrAddress) {
  const s = String(nameOrAddress || '')
  let zone = ''
  try { zone = JSON.parse(readFileSync(path.join(ROOT, 'logs', 'domain.json'), 'utf8')).zone || '' } catch { /* без зоны */ }
  return zone && s.endsWith(`.${zone}`) ? s.slice(0, -zone.length - 1) : s
}

/** Кто спрашивает — имена вызывающих без повторов. */
const callersOf = (items) => [...new Set(items.filter((it) => it.kind !== 'human').map((it) => shortName(it.from) || '?'))].join(', ')

function askText(service, items, t) {
  const a = shortName(named(service))
  const calls = items.filter((it) => it.kind !== 'human').slice(-5)
  const human = items.filter((it) => it.kind === 'human').slice(-5)
  const lines = []
  if (calls.length === 1) lines.push(t.oneCall(a, shortName(calls[0].from) || '?'), `«${cutText(calls[0].about, 300)}»`)
  else if (calls.length > 1) {
    lines.push(t.manyCalls(a, calls.length))
    for (const it of calls) lines.push(t.fromLine(shortName(it.from) || '?', cutText(it.about, 200)))
  }
  // Только сообщения человека — вопрос первой строкой, его сообщение под ним; есть вопросы агентов — вопрос о включении в конце.
  // 666: запроса нет вовсе (голый «/opus», затем «Выбрать другую модель») — просто «включить его?».
  if (!calls.length) lines.push(human.length ? t.offHuman(a) : (t.offEmpty ?? ASK.en.offEmpty)(a))
  for (const it of human) lines.push(t.yourMessage(cutText(it.about, 300)))
  if (calls.length) lines.push(t.offCalls(a))
  if (folderTrusted(service) === false) lines.push(t.trustLine ?? ASK.en.trustLine)
  return cutText(lines.join('\n'), 3500)
}

const buttons = (p, t) => {
  // 666: без запроса («/opus») отказывать некому — «Не сейчас», как человеку.
  const human = allHuman(p.items) || p.items.length === 0
  return {
    // 611 (владелец 2026-10-30: «включить с максимальной моделью – включить со средней моделью – включить сэкономлю моделью»): модель
    // сессии — с кнопки; по одной кнопке в строке, длинные подписи. Старая кнопка `…:go` в прежних сообщениях — модель по умолчанию.
    inline_keyboard: [
      [{ text: t.goMax ?? ASK.en.goMax, callback_data: `wake:${p.id}:go:opus` }],
      [{ text: t.goMid ?? ASK.en.goMid, callback_data: `wake:${p.id}:go:sonnet` }],
      [{ text: t.goEco ?? ASK.en.goEco, callback_data: `wake:${p.id}:go:haiku` }],
      [{ text: human ? t.noHuman : t.noCalls(callersOf(p.items)), callback_data: `wake:${p.id}:no` }],
    ],
  }
}

// ── 666: УСИЛИЯ ПОСЛЕ OPUS И ULTRACODE ──────────────────────────────────────────────────────────────────────────────────────────────
// Владелец 2026-11-06: «если пользователь выбрал опус то следом должен выпасть второй список в котором пользователь должен выбрать усилия с
// которым это модель будет работать и там должны быть все режимы включая ультра код»; «В случае выбора ультра кот пользователю нужно вывести
// исчезающие предупреждение … Дальше две кнопки продолжить выбрать другую модель»; «максимальный режим ультра кот у нас будет доступен только
// в Telegram». Уровни — те, что принимает `claude --effort` (2.1.319: low, medium, high, xhigh, max); ultracode — Opus на max с рабочими
// процессами (`bridge.cjs`). Каждый шаг — новое сообщение внизу переписки, прежнее теряет кнопки и исчезает (639): вопрос ждёт человека и
// уходит, когда на него ответили. Кнопки работают, пока агент спит: проснувшегося читает плагин канала, а он чужие кнопки выбрасывает.
const EFFORTS = ['low', 'medium', 'high', 'xhigh', 'max']
const FX_WORD = { low: 'fxLow', medium: 'fxMedium', high: 'fxHigh', xhigh: 'fxXhigh', max: 'fxMax' }
const effortButtons = (p, t) => ({
  inline_keyboard: [
    ...EFFORTS.map((e) => [{ text: t[FX_WORD[e]] ?? ASK.en[FX_WORD[e]], callback_data: `wake:${p.id}:fx:${e}` }]),
    [{ text: t.fxUltra ?? ASK.en.fxUltra, callback_data: `wake:${p.id}:fx:ultracode` }],
    [{ text: t.back ?? ASK.en.back, callback_data: `wake:${p.id}:back` }],
  ],
})
const ultraButtons = (p, t) => ({
  inline_keyboard: [
    [{ text: t.ultraGo ?? ASK.en.ultraGo, callback_data: `wake:${p.id}:uc:go` }],
    [{ text: t.back ?? ASK.en.back, callback_data: `wake:${p.id}:back` }],
  ],
})
const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s)
/** «Opus · max · ultracode» — с чем включилась сессия (её возвращает `wake`); нет сведений — пусто. */
function modeLine(out, t) {
  const m = out?.mode
  if (!m?.model) return ''
  return `\n${(t.modeIs ?? ASK.en.modeIs)([cap(m.model), m.effort, m.ultracode ? 'ultracode' : ''].filter(Boolean).join(' · '))}`
}

/** Следующий шаг вопроса — новым сообщением внизу во всех допущенных чатах; у прежних сообщений вопроса кнопки сняты, они исчезают. */
async function moveAsk(service, token, p, text, markup) {
  for (const x of p.asked) {
    await tg(token, 'editMessageReplyMarkup', { chat_id: x.chat, message_id: x.messageId, reply_markup: { inline_keyboard: [] } })
    vanish(token, x.chat, x.messageId) // 639: на вопрос ответили — его сменил следующий шаг
  }
  p.asked = []
  for (const chat of access(service).allowed) {
    // 639: остаётся — вопрос ждёт человека; исчезает, когда ответили (`onButton`) или его сменил новый
    const r = await sendKept(token, { chat_id: chat, text, reply_markup: markup, disable_web_page_preview: true })
    if (r.ok && r.result?.message_id) p.asked.push({ chat, messageId: r.result.message_id })
  }
  mkdirSync(path.dirname(pendingFile(service)), { recursive: true })
  writeFileSync(pendingFile(service), JSON.stringify(p, null, 2))
}

/** Голый «/opus» спящему агенту: список усилий. Ждущий запрос (сообщения, вопросы агентов) остаётся и уедет агенту при включении. */
async function askEffort(service) {
  const token = storedToken(service)
  const p = readJson(pendingFile(service), null) ?? { id: randomBytes(6).toString('hex'), createdAt: new Date().toISOString(), items: [], asked: [] }
  const t = await askTable(service)
  await moveAsk(service, token, p, t.effortAsk(shortName(named(service))), effortButtons(p, t))
  return { ok: true, pending: true, asked: p.asked.length }
}

let starter = null
/** bridge.cjs кладёт сюда запуск с подтверждением — без круговой зависимости модулей. */
function setStarter(fn) { starter = fn }

/**
 * Спросить человека в Telegram, запускать ли терминал. Запрос уже висит — задача добавляется к нему, и вопрос приходит ЗАНОВО
 * новым сообщением внизу переписки (владелец 2026-10-06: правка старого сообщения прятала кнопки вверху — он их не увидел и
 * написал боту текстом); со старого сообщения кнопки снимаются, под ним — «обновлённый вопрос ниже».
 * Возвращает `{ ok, pending: true, asked }` (`asked` — сколько чатов получили вопрос).
 */
async function askToStart(service, { text, from, about, declineUrl, kind = 'call' } = {}) {
  const token = storedToken(service)
  const file = pendingFile(service)
  const p = readJson(file, null) ?? { id: randomBytes(6).toString('hex'), createdAt: new Date().toISOString(), items: [], asked: [] }
  p.items.push({ kind, text: text ?? '', from: from ?? '', about: about ?? '', declineUrl: declineUrl ?? '', at: new Date().toISOString() })
  const t = await askTable(service)
  const body = askText(service, p.items, t)
  // Старые сообщения вопроса: без кнопок и со строкой «обновлённый вопрос ниже» — кнопки живут только на последнем.
  for (const a of p.asked) {
    await tg(token, 'editMessageText', { chat_id: a.chat, message_id: a.messageId, text: `${askText(service, p.items.slice(0, -1), t)}

${t.moved ?? ASK.en.moved}`, disable_web_page_preview: true })
    vanish(token, a.chat, a.messageId) // 639: вопрос заменён новым ниже
  }
  p.asked = []
  for (const chat of access(service).allowed) {
    // 639: вопрос ждёт человека; исчезает, когда ответили (`onButton`) или его сменил новый (выше)
    const r = await sendKept(token, { chat_id: chat, text: body, reply_markup: buttons(p, t), disable_web_page_preview: true })
    if (r.ok && r.result?.message_id) p.asked.push({ chat, messageId: r.result.message_id })
  }
  mkdirSync(path.dirname(file), { recursive: true })
  writeFileSync(file, JSON.stringify(p, null, 2))
  return { ok: true, pending: true, asked: p.asked.length }
}

/** Заменить вопрос итогом во всех чатах; `keep` — оставить кнопки (нажать «Запустить» ещё раз). */
async function closeAsk(service, token, p, outcome, keep, t) {
  const text = `${askText(service, p.items, t)}\n\n${outcome}`
  for (const a of p.asked) {
    await tg(token, 'editMessageText', { chat_id: a.chat, message_id: a.messageId, text, ...(keep ? { reply_markup: buttons(p, t) } : {}) })
  }
}

/** Ответ вызывающему «человек не стал запускать» — его дверью задачи, ключом узла, только по петле. */
async function declineCaller(url, text) {
  try {
    const u = new URL(url)
    if (u.hostname !== '127.0.0.1' && u.hostname !== 'localhost') return
    await fetch(u, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Node-Key': process.env.SETTINGS_SECRET ?? '' },
      body: JSON.stringify({ text, failed: true }),
      signal: AbortSignal.timeout(10_000),
    })
  } catch { /* вызывающий недоступен — его задача останется ждать */ }
}

/** Нажатие кнопки вопроса. Только допущенный и только действующий запрос. */
async function onButton(service, token, q) {
  const sender = String(q.from?.id ?? '')
  // 666: go:<модель> · fx:<усилия|ultracode> · uc:go · back · no. Старые кнопки (`…:go`, `…:go:opus`) по-прежнему законны.
  const m = /^wake:([0-9a-f]+):(go|no|fx|uc|back)(?::([a-z]+))?$/.exec(String(q.data ?? ''))
  const p = readJson(pendingFile(service), null)
  if (!access(service).allowed.includes(sender) || !m || !p || p.id !== m[1]) {
    await tg(token, 'answerCallbackQuery', { callback_query_id: q.id })
    return
  }
  const t = await askTable(service)
  const a = shortName(named(service))
  const c = callersOf(p.items)
  const human = allHuman(p.items) || p.items.length === 0
  // 666: шаги вопроса без запуска — следующий вопрос новым сообщением внизу.
  const step = m[2] === 'back' ? [askText(service, p.items, t), buttons(p, t)]
    : m[2] === 'go' && m[3] === 'opus' ? [t.effortAsk(a), effortButtons(p, t)]
      : m[2] === 'fx' && m[3] === 'ultracode' ? [t.ultraWarn ?? ASK.en.ultraWarn, ultraButtons(p, t)]
        : null
  if (step) {
    await tg(token, 'answerCallbackQuery', { callback_query_id: q.id })
    await moveAsk(service, token, p, step[0], step[1])
    return
  }
  // С чем включить: Sonnet и Haiku — сразу (усилия medium), Opus — с выбранными усилиями, ultracode — только после «Продолжить».
  const choice = m[2] === 'go' && (!m[3] || ['sonnet', 'haiku'].includes(m[3])) ? { model: m[3] }
    : m[2] === 'fx' && EFFORTS.includes(m[3]) ? { model: 'opus', effort: m[3] }
      : m[2] === 'uc' && m[3] === 'go' ? { model: 'opus', ultracode: true }
        : m[2] === 'no' ? {}
          : null
  if (!choice) {
    await tg(token, 'answerCallbackQuery', { callback_query_id: q.id })
    return
  }
  if (m[2] === 'no') {
    const declined = human ? t.declinedHuman(a) : t.declinedCalls(a, c)
    await tg(token, 'answerCallbackQuery', { callback_query_id: q.id, text: declined })
    rmSync(pendingFile(service), { force: true })
    await closeAsk(service, token, p, declined, false, t)
    for (const x of p.asked) vanish(token, x.chat, x.messageId) // 639: вопрос отвечен
    for (const it of p.items) if (it.declineUrl) await declineCaller(it.declineUrl, t.declineText(a))
    return
  }
  await tg(token, 'answerCallbackQuery', { callback_query_id: q.id, text: t.toast })
  const text = p.items.map((it) => it.text).filter(Boolean).join('\n\n')
  const out = typeof starter === 'function' ? await starter(service, { text: text || undefined, taskUrls: p.items.map((it) => it.declineUrl).filter(Boolean), ...choice }) : { ok: false, reason: 'no-starter' }
  // 614-1: «получил ваше сообщение» — только когда встал канал и поручение ушло в сессию. Не встал — сессия уже закрыта, запрос остаётся
  // (`pending.json`), кнопки переезжают под «Извините…» внизу переписки: нажмёт ещё раз — агент получит то же сообщение.
  const ch = out.ok && typeof out.channelReady === 'function' ? await out.channelReady() : null
  if (ch && !ch.up) {
    const sorry = ch.reason === 'channel' ? (t.channelFailedKept ?? ASK.en.channelFailedKept)(a, ch.waited) : t.failed(a, 'session-ended')
    for (const x of p.asked) await tg(token, 'editMessageReplyMarkup', { chat_id: x.chat, message_id: x.messageId, reply_markup: { inline_keyboard: [] } })
    p.asked = []
    const chats = access(service).allowed
    for (const chat of chats) {
      // 639: беда с кнопками — ждёт человека; исчезает с ответом, как вопрос
      const r = await sendKept(token, { chat_id: chat, text: sorry, reply_markup: buttons(p, t), disable_web_page_preview: true })
      if (r.ok && r.result?.message_id) p.asked.push({ chat, messageId: r.result.message_id })
    }
    writeFileSync(pendingFile(service), JSON.stringify(p, null, 2))
    console.log(`[telegram] ${service}: сессия не дождалась канала — «Извините…» с кнопками, отправлено ${p.asked.length} из ${chats.length}`)
    return
  }
  if (out.ok) {
    rmSync(pendingFile(service), { force: true })
    // 666: без запроса — «включён, пишите ему»; строка режима говорит, с чем он включился.
    const startedText = `${p.items.length === 0 ? (t.onNow ?? ASK.en.onNow)(a) : human ? t.startedHuman(a) : t.startedCalls(a, c)}${modeLine(out, t)}`
    // Владелец 2026-10-06: фраза не дублируется — у вопроса только снимаются кнопки, итог идёт одним сообщением ниже.
    for (const x of p.asked) await tg(token, 'editMessageReplyMarkup', { chat_id: x.chat, message_id: x.messageId, reply_markup: { inline_keyboard: [] } })
    // Владелец 2026-10-05: «нажатие кнопку ничего визуально не меняет» — правка сообщения наверху не видна; итог — новым
    // сообщением внизу, за ним пойдут ответ агента и «выключить агента?».
    for (const x of p.asked) await sendVanishing(token, { chat_id: x.chat, text: startedText, disable_web_page_preview: true })
    for (const x of p.asked) vanish(token, x.chat, x.messageId) // 639: вопрос отвечен — уходит вместе с «включён»
  } else {
    const why = out.reason === 'memory' ? t.memory(a, out.freeMb, out.perSessionMb, out.top) : t.failed(a, String(out.reason ?? 'unknown'))
    await closeAsk(service, token, p, why, true, t)
  }
}

// ── ПРЕДЛОЖЕНИЕ ЗАКРЫТЬ ТЕРМИНАЛ (409-5) ──────────────────────────────────────
//
// Пока терминал запущен, бота читает плагин каналов, и чужие кнопки он выбрасывает (server.ts 0.0.7: принимает только
// `perm:…`). Поэтому вопрос — текстом, без кнопок (владелец 2026-10-05: «Ответ текстом»): ответ «выключить» получает агент через
// канал и закрывает свой терминал дверью ядра (`POST /api/agents/done` с `close`). Бота нет — ничего не шлётся и ничего не
// закрывается: закрывать без ответа человека нельзя.

// 597-4 (владелец 2026-10-25: «в конце каждой секции когда сейчас всплывают контейнер с предложением выключить или разобрать сделать
// вкладку информацию которая присылают инструкцию о всех жёстко запрограммированных командах»): третья строка — «команды».
const CLOSE = {
  en: {
    done: (a) => `Agent ${a} has finished. Turn it off? Reply «off» — the agent will turn itself off.\nReply «review» if you first want the agent to suggest how to improve its skills.\nReply «commands» — I will send the list of the node's commands.`,
    timeout: (a) => `Agent ${a} has been on for 60 minutes. Turn it off? Reply «off» — the agent will turn itself off.\nReply «review» if you first want the agent to suggest how to improve its skills.\nReply «commands» — I will send the list of the node's commands.`,
    // 666: the node's closing words after «off» — the session is gone, the next one starts at medium with workflows off.
    closed: () => 'The agent has finished its work: the context is reset, the effort is back at Medium, workflows are off.',
  },
  ru: {
    // 410-3: «разбор» — агент перед выключением предлагает, как улучшить свои навыки (навык self-review элемента).
    done: (a) => `Агент ${a} закончил. Выключить его? Ответьте «выключить» — агент выключится сам.\nОтветьте «разбор», если хотите, чтобы сначала агент предложил, как улучшить свои навыки.\nОтветьте «команды» — пришлю список команд узла.`,
    timeout: (a) => `Агент ${a} работает уже 60 минут. Выключить его? Ответьте «выключить» — агент выключится сам.\nОтветьте «разбор», если хотите, чтобы сначала агент предложил, как улучшить свои навыки.\nОтветьте «команды» — пришлю список команд узла.`,
    // 666, слова владельца: «агент завершил работу, контекст сброшен усилия восстановлено в положении Medium рабочие процессы отключены».
    closed: () => 'Агент завершил работу, контекст сброшен, усилия восстановлены в положении Medium, рабочие процессы отключены.',
  },
}

async function askToClose(service, why, { reviewed = false } = {}) {
  if (!connected(service)) return { ok: true, asked: 0, reason: 'no-telegram' }
  const token = storedToken(service)
  const c = await closeTable(service)
  const full = c[why === 'timeout' ? 'timeout' : 'done'](shortName(named(service)))
  // После разбора в этой сессии — без второй строки (предложение разбора); строка «команды» (597-4) остаётся.
  const text = reviewed ? full.split('\n').filter((_, i) => i !== 1).join('\n') : full
  // 639: прежний вопрос «выключить?» этой сессии сменяется новым
  dropUntilEnds(service, 'close')
  const sent = []
  for (const chat of access(service).allowed) {
    // 639: вопрос ждёт человека; исчезает, когда его сменил новый или сессия закрылась
    const r = await sendKept(token, { chat_id: chat, text, disable_web_page_preview: true })
    if (r.ok && r.result?.message_id) sent.push([chat, r.result.message_id])
  }
  untilSessionEnds(service, service, 'close', sent)
  return { ok: true, asked: sent.length }
}

/** 666: ultracode подтверждён человеком, но Claude Code его не показал (`bridge.cjs`, проверка через 30 с) — правда человеку. */
async function tellUltraMissing(service) {
  if (!connected(service)) return { ok: true, sent: 0, reason: 'no-telegram' }
  const token = storedToken(service)
  const t = await askTable(service)
  let sent = 0
  for (const chat of access(service).allowed) {
    const r = await sendKept(token, { chat_id: chat, text: (t.ultraMissing ?? ASK.en.ultraMissing)(shortName(named(service))), disable_web_page_preview: true }) // 639: остаётся — беда, которую человек должен знать
    if (r.ok) sent++
  }
  return { ok: true, sent }
}

/**
 * 666 (владелец 2026-11-06: «когда пользователь говорит выключить одновременно с этим действием ты переключаешь архитектуру в режим усилия
 * Medium, и отключаешь режим workFlow. О чем сообщаешь закрывающем сообщении»): после «выключить» (`done` с `close`) — слова владельца ботом
 * этой сессии, без модели. Итог сессии — остаётся (639). Бота нет — некому, ничего не шлётся.
 */
async function tellClosed(service) {
  if (!connected(service)) return { ok: true, sent: 0, reason: 'no-telegram' }
  const token = storedToken(service)
  const c = await closeTable(service)
  let sent = 0
  for (const chat of access(service).allowed) {
    const r = await sendKept(token, { chat_id: chat, text: (c.closed ?? CLOSE.en.closed)(), disable_web_page_preview: true }) // 639: остаётся — итог сессии
    if (r.ok) sent++
  }
  return { ok: true, sent }
}

/**
 * Запускается один раз на службу общим подключением узла (`lib/agent-kit/mount.cjs`), не дверью Next.
 * 🔒 У КАЖДОЙ КОПИИ СВОЙ ОПРОС ТОЛЬКО СВОЕЙ СЛУЖБЫ (271): обход всех служб из каждой копии дал бы по
 * опрашивателю на копию — у бота был бы не один читатель.
 */
function startIdlePoller(service) {
  const key = idleKey(service)
  if (globalThis[key]) return
  let busy = false
  globalThis[key] = setInterval(async () => {
    if (busy) return
    busy = true
    try { await idleTick(service) } catch (err) { console.error(`[telegram] узел не прочитал бота: ${err instanceof Error ? err.message : err}`) }
    busy = false
  }, IDLE_POLL_MS)
  globalThis[key].unref?.()
}

/**
 * Имя и ручка для BotFather (546, владелец 2026-10-19: «после слова Fractera название элемента»; выбор «Элемент + код узла»):
 * «Fractera-<адрес элемента>» и `Fractera_<адрес>_<код узла>_bot`. ✗ Прежде код был `Math.random` на КАЖДЫЙ запрос, а страница
 * спрашивает дверь каждые 3 с — имена бежали на глазах. Код узла постоянный: адрес бота один на весь Telegram, а `build`, `auth`,
 * `root` есть у каждого узла. Ручка — только латиница, цифры и «_», не длиннее 32 знаков.
 * 🛑 КОД СЛУЧАЙНЫЙ, ОДИН РАЗ НА УЗЕЛ, И ХРАНИТСЯ В `data/node-code.json` (вне git). ✗ Хэш папки и имени машины (2026-11-02): та же
 * папка на том же компьютере после переустановки давала ту же ручку, и BotFather отвечал «username is already taken» — бот остался
 * за прежним аккаунтом Telegram; 4 знака hex — всего 65 536 кодов на всех людей. 5 знаков base36 — 60 млн.
 */
const NODE_CODE = (() => {
  const file = path.join(ROOT, 'data', 'node-code.json')
  const kept = readJson(file, null)?.code
  if (typeof kept === 'string' && /^[a-z0-9]{5}$/.test(kept)) return kept
  const code = Array.from(randomBytes(5), (b) => (b % 36).toString(36)).join('')
  try {
    mkdirSync(path.dirname(file), { recursive: true })
    writeFileSync(file, JSON.stringify({ code }, null, 2), { flag: 'wx' })
    return code
  } catch {
    // Файл успел записать другой процесс — берём его код; не записать вовсе — код живёт до перезапуска сервера.
    const other = readJson(file, null)?.code
    return typeof other === 'string' && /^[a-z0-9]{5}$/.test(other) ? other : code
  }
})()
const elementAddress = (service) => {
  const address = readJson(path.join(ROOT, 'data', 'services', service, 'address.json'), null)?.address
  return typeof address === 'string' && /^[a-z0-9-]{1,40}$/.test(address) ? address : service
}

/**
 * 552-6 (владелец 2026-10-20: имена ботов без слова Fractera, с режимом; ручка — «Полностью, обрезая адрес»): у элемента с группами
 * навыков имя `<Элемент>-<режим>-<ячейка>` и ручка `<адрес>_<режим>_<ячейка>_<код узла>_bot`; слова режима полностью, адрес элемента
 * обрезается, чтобы ручка была ≤ 32 знаков (`templ_workspace_orders_d897k_bot`). Зовут этот модуль (бот H2A) и `telegram-slots.cjs`.
 */
function namedSuggestion(service, mode, cell) {
  const element = elementAddress(service)
  const tail = `_${mode}_${cell}_${NODE_CODE}_bot`
  const handle = element.replace(/[^A-Za-z0-9]+/g, '_').slice(0, 32 - tail.length).replace(/_+$/, '')
  return { name: `${element.charAt(0).toUpperCase()}${element.slice(1)}-${mode}-${cell}`, username: `${handle || 'e'}${tail}` }
}

function suggestion(service) {
  if (hasSkillGroups(serviceDir(service))) return namedSuggestion(service, 'messenger', 'h2a')
  const element = elementAddress(service)
  const tail = `_${NODE_CODE}_bot`
  const handle = element.replace(/[^A-Za-z0-9]+/g, '_').slice(0, 32 - 'Fractera_'.length - tail.length).replace(/_+$/, '')
  return { name: `Fractera-${element}`, username: `Fractera_${handle}${tail}` }
}

function channelState(service) {
  const token = storedToken(service)
  const bot = readJson(botFile(service), {})
  return {
    service,
    configured: Boolean(token),
    tail: token ? token.slice(-4) : null,
    botName: bot.name ?? null,
    botUsername: bot.username ?? null,
    allowed: access(service).allowed.length,
    running: running(service),
    terminalWithoutChannel: terminalWithoutChannel(service),
    stateDir: stateDir(service),
    suggestion: suggestion(service),
    links: sectionPaths(service),
  }
}

/**
 * 547, запасной путь: терминал агента стоит на вопросе, на который узел ответить не вправе (агента включили не из чата) — бот
 * зовёт человека туда, где вопрос виден. Один раз на вопрос.
 * 592-4 (план шага 592, согласованный владельцем 2026-10-24, — новое поведение «система пишет вам сама»): у элемента без своего
 * бота то же сообщение уходит допущенным бота главного агента — архитектору, на языке его человека, со ссылкой на терминал
 * элемента. ✗ 589-4: строитель stripe без бота 25 минут стоял на вопросе, о котором не знал никто. Бота нет и у главного агента —
 * молчит, как прежде. Ключ сессии рабочего процесса (`<id>--work`) — не элемент: у него нет своей страницы терминала, молчит.
 */
const MAIN_AGENT = 'build'
async function tellWaiting(service) {
  const via = storedToken(service) ? service : service !== MAIN_AGENT && isService(service) && connected(MAIN_AGENT) ? MAIN_AGENT : null
  if (!via) return { sent: 0 }
  const token = storedToken(via)
  const t = await askTable(via)
  const a = shortName(named(service))
  const link = `${coreOrigin()}/${personLang(via)}${sectionPaths(service).terminal}`
  const shown = []
  const chats = access(via).allowed
  for (const chat of chats) {
    // 639: ждёт действия человека; исчезает, когда сессия закрылась
    const r = await sendKept(token, { chat_id: chat, text: (t.waitingTerminal ?? ASK.en.waitingTerminal)(a, link), disable_web_page_preview: true })
    if (r?.ok && r.result?.message_id) shown.push([chat, r.result.message_id])
  }
  untilSessionEnds(service, via, 'waiting', shown)
  const sent = shown.length
  // 592-4: строка журнала ядра — иначе о вопросе на экране и о том, дошёл ли он до человека, не знает никто, кроме Telegram.
  console.log(`[telegram] ${service}: вопрос на экране → бот ${via === service ? 'элемента' : `главного агента (${via})`}, отправлено ${sent} из ${chats.length}`)
  return { sent, via }
}

/**
 * 614-1: канал сессии, разбуженной без кнопки Telegram (дверь, надзор главного агента, очередь прохода), не встал — узел её уже закрыл и
 * снова читает бота. Сказать людям бота словами; бота нет — молчать, как прежде.
 */
async function tellChannelFailed(service, waited) {
  if (!connected(service)) return { sent: 0 }
  const token = storedToken(service)
  const t = await askTable(service)
  const text = (t.channelFailed ?? ASK.en.channelFailed)(shortName(named(service)), waited)
  let sent = 0
  const chats = access(service).allowed
  for (const chat of chats) {
    const r = await sendKept(token, { chat_id: chat, text, disable_web_page_preview: true }) // 639: беда — ждёт, что человек включит агента снова
    if (r?.ok) sent++
  }
  console.log(`[telegram] ${service}: канал не встал — «Извините…» отправлено ${sent} из ${chats.length}`)
  return { sent }
}

// ── ДОВЕРИЕ ПАПКЕ — ВОПРОСОМ В ЧАТЕ ГЛАВНОГО АГЕНТА (604) ─────────────────────────────────────────────────────────────────────────
//
// Владелец 2026-10-26: «мы ставим перед собой цель чтобы пользователи могли поставить один единственный Telegram бот для главного
// агента и только при помощи этого бота выполнять любые задачи вообще не касаясь компьютера … Достаточно будет просто отправить
// запрос … вопрос задается один раз в случае подтверждения больше не повторяется». Агент элемента, включённый без кнопки «Включить»
// (пробуждение дверью, надзор без согласия), стоит на вопросе Claude Code «Is this a project you trust?». Ответить за человека узел не
// вправе — поэтому вопрос уходит допущенным бота главного агента, а «да» нажимает ту же стрелку и Enter, что человек в терминале
// (`bridge.cjs`, `answerTrust`). Claude Code помнит доверие пути папки навсегда (`~/.claude.json`) — второй раз вопроса нет.
// Ждущие вопросы — `data/node/trust-pending.json` (ключ сессии → через какого бота спросили): его читают копия бота главного агента
// и дверь `POST /api/agents/trust`, у каждой копии комплекта свои модули. Бота главного агента нет — прежняя ссылка на терминал.

const trustFile = () => path.join(ROOT, 'data', 'node', 'trust-pending.json')
const trustPending = () => readJson(trustFile(), {})
function setTrustPending(map) {
  mkdirSync(path.dirname(trustFile()), { recursive: true })
  writeFileSync(trustFile(), JSON.stringify(map, null, 2) + '\n')
}
const elementOf = (key) => String(key).replace(/--.*$/, '')
/** Ключи сессий, чей вопрос доверия задан через бота `via`. */
const trustWaitingVia = (via) => Object.entries(trustPending()).filter(([, v]) => v && v.via === via).map(([k]) => k)

// Короткое «да» на разных языках и его спутники; «хоккей» — так распознавание голоса пишет «окей» (слова владельца 2026-10-26).
// Промах ничего не теряет: сообщение уходит главному агенту, и его модель читает смысл.
const YES_WORDS = new Set(['да', 'ага', 'угу', 'ок', 'окей', 'хоккей', 'хорошо', 'ладно', 'подтверждаю', 'подтверди', 'разрешаю', 'разреши',
  'разрешить', 'можно', 'конечно', 'давай', 'yes', 'y', 'yep', 'yeah', 'ok', 'okay', 'sure', 'confirm', 'confirmed', 'allow', 'approve',
  'trust', 'go', 'si', 'sí', 'oui', 'ja'])
const YES_FILLER = new Set(['и', 'всё', 'все', 'пожалуйста', 'please', 'and'])
function trustYes(text) {
  const words = String(text ?? '').toLowerCase().replace(/[.,!?;:«»"'()\-—…]+/g, ' ').split(/\s+/).filter(Boolean)
  return words.length > 0 && words.length <= 6 && words.every((w) => YES_WORDS.has(w) || YES_FILLER.has(w)) && words.some((w) => YES_WORDS.has(w))
}

/** Строка для главного агента, которого будит сообщение человека, пока вопрос доверия ждёт его ответа. */
function trustNote(service) {
  const keys = trustWaitingVia(service)
  if (!keys.length) return ''
  return ` [Узел: ${keys.map((k) => shortName(named(elementOf(k)))).join(', ')} ждёт разрешения работать в своей папке — человека спросили в этом чате. Если его сообщение — согласие, выполни npm run trust -- ${keys.map(elementOf).join(' ')} и коротко скажи, что готово; без его согласия не выполняй.]`
}

/** Задать вопрос доверия папке. Бот главного агента подключён — вопрос в его чат; нет — прежняя ссылка на терминал. */
async function tellTrust(key) {
  const element = elementOf(key)
  if (element === MAIN_AGENT || !isService(element) || !connected(MAIN_AGENT)) return tellWaiting(key)
  const map = trustPending()
  map[key] = { via: MAIN_AGENT, at: new Date().toISOString() }
  setTrustPending(map)
  const token = storedToken(MAIN_AGENT)
  const t = await askTable(MAIN_AGENT)
  const a = shortName(named(element))
  const asked = []
  const chats = access(MAIN_AGENT).allowed
  for (const chat of chats) {
    // 639: вопрос ждёт человека; исчезает, когда на него ответили или сессии больше нет (`clearTrust`)
    const r = await sendKept(token, { chat_id: chat, text: (t.trustAsk ?? ASK.en.trustAsk)(a), disable_web_page_preview: true })
    if (r?.ok && r.result?.message_id) asked.push({ chat, messageId: r.result.message_id })
  }
  const now = trustPending()
  if (now[key]) { now[key].asked = asked; setTrustPending(now) }
  const sent = asked.length
  console.log(`[telegram] ${key}: вопрос доверия папке → бот главного агента, отправлено ${sent} из ${chats.length}`)
  return { sent, via: MAIN_AGENT, trust: true }
}

/** Вопрос снят (ответили или сессии больше нет); 639: его сообщения исчезают через 30 с. */
function clearTrust(key) {
  const map = trustPending()
  if (!(key in map)) return
  const { via, asked } = map[key] ?? {}
  delete map[key]
  setTrustPending(map)
  for (const x of Array.isArray(asked) ? asked : []) vanish(storedToken(via), x.chat, x.messageId)
}

/** «Да» пришло спящему боту главного агента: ответить на каждый ждущий вопрос и сказать человеку итог. */
async function answerTrustHere(service, token, chatId) {
  const t = await askTable(service)
  const answer = globalThis.__web4AgentTrust
  for (const key of trustWaitingVia(service)) {
    const out = typeof answer === 'function' ? await answer(key) : { ok: false, reason: 'not-mounted' }
    if (!out.ok) clearTrust(key)
    const a = shortName(named(elementOf(key)))
    await sendVanishing(token, { chat_id: chatId, text: out.ok ? (t.trustDone ?? ASK.en.trustDone)(a) : (t.trustGone ?? ASK.en.trustGone)(a), disable_web_page_preview: true })
  }
}

module.exports = {
  // 639: итог остаётся, служебное исчезает; вопросы закрытой сессии исчезают.
  sendKept, sendVanishing, sessionEnded,
  // 737-11a: one read of the bot — its test proves the rehearsing server's bot admits and answers one line, and starts nothing.
  idleTick,
  // 604: доверие папке — вопросом в чате главного агента.
  tellTrust, clearTrust, trustPending, trustYes,
  // 614-1: канал разбуженной сессии не встал.
  tellChannelFailed,
  // 552-6: помощники и правило имени для ячеек ботов (`telegram-slots.cjs`).
  tg, readJson, writeSecret, NODE_CODE, namedSuggestion, hasSkillGroups,
  PLUGIN, isService, stateDir, storedToken, saveToken, activationLink, saveMessages, channelLaunch,
  running, channelState, startIdlePoller, connected, askToStart, setStarter, askToClose, personLang, setPersonLang, tellWaiting,
  // 597-4: the sleeping bot's decision — exported for the probe that checks it without a bot.
  idleDecision, thingOf,
  // 666: the effort after Opus, ultracode, the closing words — `onButton` and `askEffort` exported for the probe with a stub Bot API.
  EFFORTS, onButton, askEffort, tellClosed, tellUltraMissing,
}

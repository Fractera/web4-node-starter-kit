// ОДНА КОМАНДА ОТ КЛОНА ДО БРАУЗЕРА: `npm run launch`. Запуск: агент человека сразу после `git clone`, без вопросов.
//
// ✗ Оплачено 2026-11-02 (тест владельца: пустая папка, слабая модель, «<адрес репозитория> go»): агент склонировал и спросил «что
// дальше?», поставил пакеты и спросил снова, нашёл в папке шагов чужие планы стартера и предложил человеку выбрать между ними.
// Браузер не открылся. Владелец: «я ожидал что без каких-либо лишних вопросов я увижу как откроется браузер и в нём будет
// приглашение начать разработку». Цепочка README (install → build → serve:start) была верной, но держалась на том, что агент
// прочтёт README и пройдёт её сам — слабая модель не проходит.
//
// 🔒 ВОЗОБНОВЛЯЕМАЯ. Первая установка идёт 10–25 минут, а одна команда агента обрывается по таймауту (у Claude Code — 10 минут).
// Поэтому каждый этап, который уже сделан, пропускается по своей метке в `logs/launch.json`, и повторный `npm run launch`
// продолжает с места обрыва. Метка пишется только после успеха этапа: оборванная установка или сборка повторяется целиком.
//
// 🔒 НИЧЕГО НЕ СПРАШИВАЕТ. Отказ (облачная сессия, второй узел, не форк) печатает причину своим маркером и `===LAUNCH_FAILED===`;
// агент показывает человеку эту причину, а не придумывает шаги.
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(here, '..')
const isWindows = process.platform === 'win32'
const npm = isWindows ? 'npm.cmd' : 'npm'
const STAMP = path.join(root, 'logs', 'launch.json')
const TOTAL = 6

function readStamp() {
  try { return JSON.parse(readFileSync(STAMP, 'utf8')) } catch { return {} }
}

function writeStamp(patch) {
  mkdirSync(path.dirname(STAMP), { recursive: true })
  writeFileSync(STAMP, JSON.stringify({ ...readStamp(), ...patch }, null, 2) + '\n', 'utf8')
}

function step(n, ru, en) {
  console.log('')
  console.log(`===LAUNCH_STEP=== ${n}/${TOTAL} ${en}`)
  console.log(`Шаг ${n} из ${TOTAL}: ${ru}`)
}

function fail(what) {
  console.error('')
  console.error(`Запуск остановлен на этапе «${what}». Причина напечатана выше.`)
  console.error(`Launch stopped at «${what}». The reason is printed above.`)
  console.error(`===LAUNCH_FAILED=== ${what}`)
  process.exit(1)
}

function node(script, ...args) {
  return spawnSync(process.execPath, [path.join(here, script), ...args], { cwd: root, stdio: 'inherit', windowsHide: true }).status === 0
}

function npmRun(...args) {
  return spawnSync(npm, args, { cwd: root, stdio: 'inherit', shell: isWindows, windowsHide: true }).status === 0
}

function lockHash() {
  try { return createHash('sha256').update(readFileSync(path.join(root, 'package-lock.json'))).digest('hex').slice(0, 16) } catch { return null }
}

function gitHead() {
  const r = spawnSync('git', ['-C', root, 'rev-parse', 'HEAD'], { encoding: 'utf8', windowsHide: true })
  return r.status === 0 ? r.stdout.trim() : null
}

// Узел уже отвечает? Адрес — из файла, который пишет сам сервер (`logs/runtime.json`), ответ — дверь здоровья.
async function nodeAnswers() {
  let runtime = null
  try { runtime = JSON.parse(readFileSync(path.join(root, 'logs', 'runtime.json'), 'utf8')) } catch { return false }
  if (!runtime?.port) return false
  try {
    const r = await fetch(`http://${runtime.hostname || 'localhost'}:${runtime.port}/api/health`, { signal: AbortSignal.timeout(5000) })
    return r.ok
  } catch { return false }
}

console.log('Ставлю и запускаю узел Fractera. Вопросов не будет; первая установка идёт 10–25 минут.')
console.log('Installing and starting the Fractera node. No questions; the first install takes 10–25 minutes.')
console.log('Если команда оборвалась по таймауту — запустите `npm run launch` снова: она продолжит с места обрыва.')

step(1, 'это компьютер человека и на нём нет другого узла', 'local computer, no other node')
if (!node('check-local.mjs')) fail('check-local')

step(2, 'пакеты проекта (npm install, 1–2 минуты)', 'packages (npm install, 1–2 min)')
const lock = lockHash()
if (readStamp().deps === lock && existsSync(path.join(root, 'node_modules'))) {
  console.log('пакеты уже стоят — пропускаю')
} else {
  if (!npmRun('install')) fail('npm install')
  writeStamp({ deps: lock, depsAt: new Date().toISOString() })
}

step(3, 'это ваш форк оригинала Fractera', 'your fork of the Fractera original')
if (!node('ensure-env.mjs') || !node('check-origin.mjs')) fail('check-origin')

step(4, 'свежий проект: без истории разработки стартера', 'fresh project: without the starter history')
if (!node('fresh-project.mjs')) fail('fresh-project')

step(5, 'сборка узла (npm run build, 4–5 минут)', 'build (npm run build, 4–5 min)')
const head = gitHead()
if (head && readStamp().build === head && existsSync(path.join(root, '.next', 'BUILD_ID'))) {
  console.log('сборка этой версии уже есть — пропускаю')
} else {
  if (!npmRun('run', 'build')) fail('npm run build')
  writeStamp({ build: head, buildAt: new Date().toISOString() })
}

step(6, 'запуск узла и выход в интернет (первый раз 5–15 минут: ставятся элементы)', 'start (first time 5–15 min: elements install)')
// Узел уже отвечает на эту сборку — не перезапускать: `serve:start` поднял бы процессы заново ради ничего; адреса даёт `serve:status`.
if (readStamp().started === head && (await nodeAnswers())) {
  console.log('узел уже работает — показываю адреса')
  if (!node('serve.mjs', 'status')) fail('serve:status')
} else {
  if (!node('serve.mjs', 'start')) fail('serve:start')
  writeStamp({ started: head, startedAt: new Date().toISOString() })
}

// 🔒 ПРИВЕТСТВИЕ — ГОТОВЫЙ ТЕКСТ, А НЕ ПОРУЧЕНИЕ АГЕНТУ. Слово владельца 2026-11-02: сразу после развёртывания агент приветствует
// человека, предупреждает, что первая учётная запись — администратор и восстановить её невозможно, называет временный адрес и путь
// «вход → свой домен → Telegram». 624-3/624-5 (владелец 2026-11-02, тот же день): Telegram — с требованием приложения; пункт 5 — закрыть
// установочный чат ради памяти, дальше — главный агент узла в терминале или Telegram. Слабая модель пересказывает готовый текст надёжнее, чем собирает его из инструкции, — поэтому он
// печатается здесь, между маркерами, на двух языках; агент передаёт его человеку на языке человека, ничего не выбрасывая.
function welcome() {
  let temporary = null
  try {
    const t = JSON.parse(readFileSync(path.join(root, 'logs', 'tunnel.json'), 'utf8'))
    temporary = t?.url && !t.dead ? t.url : null
  } catch { /* туннеля нет — адрес только на этом компьютере */ }
  const where = temporary ?? 'адрес выше (===PUBLIC_URL===)'
  const whereEn = temporary ?? 'the address above (===PUBLIC_URL===)'
  console.log('')
  console.log('===WELCOME===')
  console.log(`Добро пожаловать в ваш узел Fractera. Браузер уже открыт на его главной странице.

1. СОЗДАЙТЕ УЧЁТНУЮ ЗАПИСЬ АРХИТЕКТОРА СЕЙЧАС, НА ЭТОМ КОМПЬЮТЕРЕ. Здесь панель открывается и без входа — узел узнаёт
   хозяина за клавиатурой. Но нажмите «Войти» на главной странице и создайте первую учётную запись (почта и пароль) до того,
   как подключите свой домен: на домене регистрация открыта для всех, и первый, кто зарегистрируется, станет хозяином узла.
   ⚠ ВНИМАНИЕ: первая учётная запись навсегда становится администратором (архитектором) узла. Восстановить её пароль
   НЕВОЗМОЖНО — запишите почту и пароль и храните их надёжно. Позже подключите вход через Google или «волшебное письмо»
   (Resend) — тогда пароль архитектора можно будет вернуть через почту.
2. ВРЕМЕННЫЙ АДРЕС: ${where} — только чтобы посмотреть проект: панель там открыта для чтения любому, у кого есть ссылка,
   вход и регистрация на нём закрыты, а сам адрес меняется при перезапуске туннеля.
3. СВОЙ ДОМЕН — когда намерения серьёзные. Например, на porkbun.com: домен .com стоит около $12 в год и продлевается по той же
   цене (проверьте цену на сайте перед покупкой). Купите домен и скажите об этом главному агенту узла — он сам сделает
   записи, которые свяжут проект, регистратора и Cloudflare (страница узла «Домен и хостинг → Подключение домена»).
4. TELEGRAM-БОТ — после домена. Нужно приложение Telegram на телефоне или компьютере (https://telegram.org/apps), с входом в
   свой аккаунт: без него бота не создать. Создайте бота у @BotFather (https://t.me/BotFather) и вставьте его токен на странице
   узла «Telegram». Дальше работать можно с телефона, голосом или текстом.
5. ЭТОТ ЧАТ МОЖНО ЗАКРЫТЬ. Установка закончена, узел работает сам, а этот чат занимает память компьютера. Закройте его и
   работайте дальше с главным агентом узла: в терминале (панель → «Главный агент» → «Терминал», http://localhost:24680) или
   через Telegram-бота — как вам удобнее.

После входа вы попадаете в панель управления — там та же подробная инструкция. Спрашивайте главного агента о чём угодно: как
устроен проект, что в нём есть, с чего начать вашу идею.`)
  console.log('')
  console.log(`Welcome to your Fractera node. The browser already shows its home page.

1. CREATE THE ARCHITECT ACCOUNT NOW, ON THIS COMPUTER. Here the panel opens without sign-in — the node recognises the owner
   at the keyboard. Still, press «Sign in» on the home page and create the first account (email and password) before you
   connect your own domain: on a domain registration is open to everyone, and whoever registers first owns the node.
   ⚠ WARNING: the first account becomes the node's administrator (architect) for good. Its password CANNOT be recovered —
   write the email and password down and keep them safe. Later connect Google or the magic-link email (Resend) sign-in —
   then the architect's password can be restored by email.
2. TEMPORARY ADDRESS: ${whereEn} — only for a look at the project: the panel there is read-only to anyone with the link,
   sign-in and registration are closed, and the address changes when the tunnel restarts.
3. YOUR OWN DOMAIN — when you are serious. For example at porkbun.com: a .com costs about $12 a year and renews at the same
   price (check the price on the site before buying). Buy it and tell the node's main agent — it makes the records that join
   the project, the registrar and Cloudflare (node page «Domain and hosting → Domain activation»).
4. TELEGRAM BOT — after the domain. You need the Telegram app on your phone or computer (https://telegram.org/apps), signed in
   to your account: without it no bot can be made. Create a bot at @BotFather (https://t.me/BotFather) and paste its token on
   the node's «Telegram» page. From then on you can work from the phone, by voice or text.
5. YOU CAN CLOSE THIS CHAT. The install is finished, the node runs by itself, and this chat takes the computer's memory. Close
   it and go on with the node's main agent: in its terminal (panel → «Main agent» → «Terminal», http://localhost:24680) or
   through the Telegram bot — whichever you like.

After sign-in you land in the control panel — the same detailed guide waits there. Ask the main agent anything: how the
project works, what is in it, where to start with your idea.`)
  console.log('===WELCOME_END===')
}

welcome()
console.log('')
console.log('===LAUNCH_DONE===')
console.log('Передайте человеку текст между ===WELCOME=== и ===WELCOME_END=== на его языке, ничего не выбрасывая.')
console.log('Give the person the text between ===WELCOME=== and ===WELCOME_END=== in their language, leaving nothing out.')

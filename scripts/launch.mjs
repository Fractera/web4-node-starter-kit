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
import { spawn, spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { PROGRESS_ENV, progress } from './progress.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(here, '..')
const isWindows = process.platform === 'win32'
const npm = isWindows ? 'npm.cmd' : 'npm'
const STAMP = path.join(root, 'logs', 'launch.json')
const TOTAL = 6
// 645-4: дочерние процессы (`services-install`, `serve start`) печатают свои `===PROGRESS===` только под этой меткой.
process.env[PROGRESS_ENV] = '1'

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

// 645-4: та же команда, но её вывод читается построчно — сборка печатает этапы проверок, компиляции и страниц, и каждый первый раз
// становится строкой `===PROGRESS===`. Вывод идёт человеку целиком, как прежде.
function npmRunWatched(watch, ...args) {
  return new Promise((resolve) => {
    const child = spawn(npm, args, { cwd: root, stdio: ['inherit', 'pipe', 'pipe'], shell: isWindows, windowsHide: true })
    const seen = new Set()
    const feed = (stream, out) => {
      let buf = ''
      stream.on('data', (chunk) => {
        out.write(chunk)
        buf += chunk.toString()
        let i
        while ((i = buf.indexOf('\n')) >= 0) {
          const line = buf.slice(0, i)
          buf = buf.slice(i + 1)
          for (const [re, stage] of watch) if (!seen.has(stage) && re.test(line)) { seen.add(stage); progress(stage) }
        }
      })
    }
    feed(child.stdout, process.stdout)
    feed(child.stderr, process.stderr)
    child.on('error', () => resolve(false))
    child.on('close', (code) => resolve(code === 0))
  })
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
progress('local')
if (!node('check-local.mjs')) fail('check-local')

step(2, 'пакеты проекта (npm install, 1–2 минуты)', 'packages (npm install, 1–2 min)')
progress('packages')
const lock = lockHash()
if (readStamp().deps === lock && existsSync(path.join(root, 'node_modules'))) {
  console.log('пакеты уже стоят — пропускаю')
} else {
  if (!npmRun('install')) fail('npm install')
  writeStamp({ deps: lock, depsAt: new Date().toISOString() })
}

step(3, 'это ваш форк оригинала Fractera', 'your fork of the Fractera original')
progress('fork')
if (!node('ensure-env.mjs') || !node('check-origin.mjs')) fail('check-origin')

step(4, 'свежий проект: без истории разработки стартера', 'fresh project: without the starter history')
progress('fresh')
if (!node('fresh-project.mjs')) fail('fresh-project')

step(5, 'сборка узла (npm run build, 4–5 минут)', 'build (npm run build, 4–5 min)')
const head = gitHead()
if (head && readStamp().build === head && existsSync(path.join(root, '.next', 'BUILD_ID'))) {
  console.log('сборка этой версии уже есть — пропускаю')
  progress('pages', 'уже собрано')
} else {
  progress('checks')
  const watch = [[/Creating an optimized production build/, 'compile'], [/Generating static pages/, 'pages']]
  if (!(await npmRunWatched(watch, 'run', 'build'))) fail('npm run build')
  writeStamp({ build: head, buildAt: new Date().toISOString() })
}

step(6, 'запуск узла и выход в интернет (первый раз 5–15 минут: ставятся элементы)', 'start (first time 5–15 min: elements install)')
// Узел уже отвечает на эту сборку — не перезапускать: `serve:start` поднял бы процессы заново ради ничего; адреса даёт `serve:status`.
if (readStamp().started === head && (await nodeAnswers())) {
  console.log('узел уже работает — показываю адреса')
  progress('warm', 'узел уже работает')
  if (!node('serve.mjs', 'status')) fail('serve:status')
} else {
  if (!node('serve.mjs', 'start')) fail('serve:start')
  writeStamp({ started: head, startedAt: new Date().toISOString() })
}

// 🔒 ПРОЩАНИЕ АГЕНТА УСТАНОВКИ — ГОТОВЫЙ ТЕКСТ, А НЕ ПОРУЧЕНИЕ АГЕНТУ. Слабая модель пересказывает готовый текст надёжнее, чем
// собирает его из инструкции, — поэтому он печатается здесь, между маркерами, на двух языках; агент передаёт его человеку на языке
// человека, ничего не выбрасывая и не добавляя.
//
// 645-5, владелец 2026-11-04, после первой установки глазами нового человека: «ты даешь мне ссылку на страницу из которой невозможно
// создать учетную запись … Вместо этого ты должна сказал: остается главное: – подключите вашу подписку … (обязательно) – Если вы ещё не
// используете Telegram установите на свой телефон и на этот компьютер … (рекомендуется) – создайте Telegram бота и начните работу в
// чате (рекомендуется) – если вы не используете Telegram перейдите на работу через терминал»; о временном адресе — «это достаточно на
// первое время, тогда рекомендуется как можно раньше подключить домен» и «до переезда на собственный домен регистрация ограничена»;
// прощание — его словами. 🪦 Прежние пункты 624 (учётная запись архитектора, домен, Telegram, закрыть чат) и 643-2 (режимы работы и
// подписка, ключ OpenAI) сняты его ответом «Убрать оба»: эти сведения живут на страницах панели («Подписка», «Как это работает»).
//
// 🔒 ВСЕ ССЫЛКИ — НА ЭТОМ КОМПЬЮТЕРЕ, КРОМЕ ДВУХ. Подписка, Telegram-бот, терминал и домен меняют узел — на временном адресе панель
// только для чтения (`proxy.ts`, `temporary-address`), поэтому они ведут на `localhost` ядра. Временный адрес — то, что видит интернет;
// telegram.org — приложение.
function welcome() {
  let temporary = null
  try {
    const t = JSON.parse(readFileSync(path.join(root, 'logs', 'tunnel.json'), 'utf8'))
    temporary = t?.url && !t.dead ? t.url : null
  } catch { /* туннеля нет — адрес только на этом компьютере */ }
  let port = 24680
  try { port = JSON.parse(readFileSync(path.join(root, 'logs', 'runtime.json'), 'utf8')).port || port } catch { /* порт по умолчанию */ }
  const core = `http://localhost:${port}`
  const ru = (p) => `${core}/ru/${p}`
  const en = (p) => `${core}/en/${p}`
  console.log('')
  console.log('===WELCOME===')
  console.log(`Узел Fractera установлен и работает. Остаётся главное:
– Подключите вашу подписку Claude Code (обязательно): ${ru('build/subscription')}
– Если вы ещё не пользуетесь Telegram, установите его на телефон и на этот компьютер (рекомендуется): https://telegram.org/apps
– Создайте Telegram-бота и начните работу в чате (рекомендуется): ${ru('build/telegram')}
– Если вы не пользуетесь Telegram, работайте через терминал: ${ru('build/terminal')}
${temporary ? `
Вам выдана временная публичная ссылка — по ней ваш проект виден из интернета, на первое время этого достаточно: ${temporary}
Рекомендуется как можно раньше подключить свой домен: ${ru('hosting/domain')}
До переезда на собственный домен регистрация ограничена.
` : ''}
На этом моя миссия в этом проекте заканчивается. Я не смогу помочь вам с разработкой этого проекта, так как у меня нет необходимых
инструкций. Сейчас рекомендуется идти либо в терминал, либо в Telegram (рекомендуется): эти каналы обладают всеми необходимыми
инструкциями и помогут вам создать проект вашей мечты. Рад был вам помочь — теперь вы можете меня выключить.`)
  console.log('')
  console.log(`The Fractera node is installed and running. What matters now:
– Connect your Claude Code subscription (required): ${en('build/subscription')}
– If you do not use Telegram yet, install it on your phone and on this computer (recommended): https://telegram.org/apps
– Create a Telegram bot and start working in the chat (recommended): ${en('build/telegram')}
– If you do not use Telegram, work through the terminal: ${en('build/terminal')}
${temporary ? `
You have a temporary public link — it makes your project visible from the internet, and that is enough for a start: ${temporary}
Connect your own domain as early as you can: ${en('hosting/domain')}
Until you move to your own domain, registration is restricted.
` : ''}
This is where my mission in this project ends. I cannot help you develop this project: I do not have the instructions for it. Go on
in the terminal or in Telegram (recommended): these channels have every instruction needed and will help you build the project of
your dreams. Glad to have helped — you can switch me off now.`)
  console.log('===WELCOME_END===')
}
welcome()
console.log('')
console.log('===LAUNCH_DONE===')
console.log('Передайте человеку текст между ===WELCOME=== и ===WELCOME_END=== на его языке, ничего не выбрасывая и не добавляя. Ваша работа на этом окончена.')
console.log('Give the person the text between ===WELCOME=== and ===WELCOME_END=== in their language, leaving nothing out and adding nothing. Your work ends here.')

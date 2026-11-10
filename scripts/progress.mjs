// ЧЕЛОВЕК ВИДИТ, ЧТО УСТАНОВКА ИДЁТ: `===PROGRESS=== k/N` (645-4).
//
// Владелец 2026-11-04, после первой установки глазами нового человека: «слишком долго проходят Слепой режим во время развёртывания
// непонятно что что тут движется раньше в проекте более ранней версии мы возвращали промежуточные состояния и у нас было около 20
// результате время времени появлялись какие-то понятные шаги и пользователь видит что процесс проходит». Шесть `===LAUNCH_STEP===`
// остались, но шестой шёл 15 минут молча. Здесь — около двадцати этапов простыми словами: агент пересылает каждую строку человеку
// одной строкой (README, «If you are an AI agent»).
//
// 🔒 ОДНА ТАБЛИЦА НОМЕРОВ ДЛЯ ТРЁХ ПРОЦЕССОВ. Строки печатают `launch.mjs` (свои этапы и сборка), `services-install.mjs` (каждый
// элемент) и `serve.mjs start` (запуск, туннель, прогрев) — номер берётся отсюда по имени этапа, поэтому k не повторяется и не
// скачет назад, сколько бы процессов его ни печатали. N = 10 + число элементов реестра.
//
// 🔒 ПЕЧАТАЕТ ТОЛЬКО ПОД `npm run launch`: тот ставит `FRACTERA_PROGRESS=1`, и дочерние процессы наследуют его. Ручной
// `serve:start`, `services:install -- --only …` и `node:update` идут без этих строк — там нет человека, ждущего первую установку.
// Этап, уже сделанный при прошлом запуске, свою строку не печатает: номер просто перескакивает вперёд.
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')

export const PROGRESS_ENV = 'FRACTERA_PROGRESS'
// Метка читается при загрузке модуля: `serve.mjs` снимает её с окружения до запуска процессов узла (pm2), а свои строки печатает дальше.
const ON = process.env[PROGRESS_ENV] === '1'

// Подписи элементов простыми словами; элемент, которого здесь нет, назван своим id.
const ELEMENT_WORDS = {
  auth: ['вход в аккаунт', 'sign-in'],
  data: ['база данных', 'database'],
  storage: ['хранилище файлов', 'file storage'],
  vectors: ['векторное хранилище', 'vector store'],
  embeddings: ['поиск по смыслу', 'search by meaning'],
  config: ['конфигуратор', 'configurator'],
  graph: ['граф знаний', 'knowledge graph'],
  cache: ['кэш', 'cache'],
  memory: ['глубокая память', 'deep memory'],
  stripe: ['платежи Stripe', 'Stripe payments'],
  root: ['ваш сайт', 'your site'],
}

// Этапы до элементов и после них: [номер, ru, en, минуты]. Номера «после» считаются от числа элементов.
const BEFORE = {
  local: [1, 'проверяю, что это ваш компьютер и другого узла на нём нет', 'checking this is your computer with no other node', '<1'],
  packages: [2, 'ставлю пакеты проекта и браузер для проверок', 'installing the project packages and the browser for checks', '1–3'],
  fork: [3, 'проверяю, что это ваш форк Fractera', 'checking this is your fork of Fractera', '<1'],
  fresh: [4, 'готовлю свежий проект без истории стартера', 'preparing a fresh project without the starter history', '<1'],
  checks: [5, 'сборка: проверки проекта', 'build: project checks', '1'],
  compile: [6, 'сборка: компилирую панель управления', 'build: compiling the control panel', '2–3'],
  pages: [7, 'сборка: готовлю страницы', 'build: preparing the pages', '<1'],
}
const AFTER = {
  start: [8, 'запускаю узел', 'starting the node', '1'],
  tunnel: [9, 'открываю временный адрес в интернете (Cloudflare)', 'opening a temporary internet address (Cloudflare)', '1'],
  warm: [10, 'прогреваю страницы, почти готово', 'warming up the pages, almost done', '1'],
}

function elementCount() {
  try {
    const r = JSON.parse(readFileSync(path.join(root, 'WEB4-ITEMS-REGISTRY', 'web4-items.json'), 'utf8'))
    return Array.isArray(r.services) ? r.services.length : 0
  } catch { return 0 }
}

function print(k, total, ru, en, minutes) {
  const [ruTime, enTime] = minutes === '<1' ? ['меньше минуты', 'under a minute'] : [`~${minutes} мин`, `~${minutes} min`]
  console.log(`===PROGRESS=== ${k}/${total} ${ru} (${ruTime}) · ${en} (${enTime})`)
}

/** Этап по имени (`local`, `packages`, … `warm`). `note` — приписка, например «уже готово». */
export function progress(stage, note = '') {
  if (!ON) return
  const count = elementCount()
  const total = 10 + count
  const before = BEFORE[stage]
  const after = AFTER[stage]
  const row = before ?? (after ? [after[0] + count, ...after.slice(1)] : null)
  if (!row) return
  const [k, ru, en, minutes] = row
  print(k, total, note ? `${ru} — ${note}` : ru, en, minutes)
}

/** Элемент номер `i` (с 1) из реестра. */
export function progressElement(i, id) {
  if (!ON) return
  const count = elementCount()
  const [ru, en] = ELEMENT_WORDS[id] ?? [id, id]
  print(7 + i, 10 + count, `элемент ${i} из ${count}: ${ru}`, `element ${i} of ${count}: ${en}`, '1')
}

// THE PULT'S PAGE ON THE BENCH (node steps 787-1, 788-2): `npm run tg-app:preview -- [--lang ru] [--context <percent>|none]` writes the real
// «Пульт узла» page with a stubbed state to `logs/eyes/tg-app-preview-<lang>.html` and prints its file address — `npm run eyes` opens it at
// 390 px (`--width 390 --height 844`, `--dark`). The page is the very `lib/node/tg-app/page.cjs`; only its door is replaced by a stub that
// answers `state` with sample elements (nothing of this node is read, no key, no address). No server, no Telegram, no model.
import { mkdirSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const req = createRequire(import.meta.url)
const page = req(join(ROOT, 'lib', 'node', 'tg-app', 'page.cjs'))
const args = process.argv.slice(2)
const opt = (name, fallback) => { const i = args.indexOf(`--${name}`); return i >= 0 && args[i + 1] ? args[i + 1] : fallback }
const lang = opt('lang', 'ru') === 'en' ? 'en' : 'ru'
const ctxArg = opt('context', '38')
const ru = lang === 'ru'

const agent = (over = {}) => ({ mode: 'sleeping', model: 'opus', effort: 'high', ultracode: false, account: 'node', email: 'owner@example.com', bot: null, ...over })
const now = new Date().toISOString()
const percent = ctxArg === 'none' ? null : Math.max(0, Number(ctxArg) || 0)
const state = {
  context: percent === null ? null : { used: percent * 10_000, window: 1_000_000, percent, model: 'claude-opus-5-5', at: now },
  builds: { running: false, current: null, queue: [], done: [] },
  asks: [],
  main: { ...agent({ mode: 'waiting', effort: 'max' }), channel: { bot: true, state: 'hears', why: null, since: now }, autostart: true },
  elements: [
    { build: null, id: 'root', name: ru ? 'Главный сайт' : 'Main site', native: false, required: false, on: true, offReason: null, live: false, step: ru ? 'Шаг 4 — страница тарифов (в работе)' : 'Step 4 — the pricing page (in progress)', turn: { event: 'turn-end', at: now, last: ru ? 'собрал раздел цен' : 'built the prices section' }, agent: agent({ bot: 'example_root_bot' }),
      description: ru ? 'Сайт проекта: главная страница, тарифы и вход для клиентов.' : 'The project site: home, pricing and sign-in for clients.', site: 'https://example.com', botLink: 'https://t.me/example_root_bot' },
    { build: null, id: 'shop', name: ru ? 'Магазин керамики' : 'Ceramics shop', native: false, required: false, on: true, offReason: null, live: true, step: null, turn: { event: 'turn-start', at: now, last: null }, agent: agent({ mode: 'coding' }),
      description: ru ? 'Каталог изделий студии и заказы с оплатой.' : 'The studio catalogue and paid orders.', site: null, botLink: null },
    { build: null, id: 'notes', name: ru ? 'Заметки семьи' : 'Family notes', native: false, required: false, on: false, offReason: ru ? 'выключен на ночь' : 'off for the night', live: false, step: null, turn: null, agent: agent(),
      description: null, site: null, botLink: null },
    { build: null, id: 'auth', name: ru ? 'Вход' : 'Sign-in', native: true, required: true, on: true, offReason: null, live: false, step: null, turn: null, agent: agent(), description: null, site: null, botLink: null },
  ],
  limits: [{ who: 'node', account: 'owner@example.com', current: 'owner@example.com', stale: false, at: now, fiveHour: { used: 41, resetsAt: now }, sevenDay: { used: 63, resetsAt: now } }],
  at: now,
}
const stub = `<script>window.fetch=function(){return Promise.resolve({json:function(){return Promise.resolve({ok:true,state:${JSON.stringify(state).replace(/</g, '\\u003c')}})}})}</script>`
const html = page.html(lang).replace('<script>', `${stub}<script>`)
const out = join(ROOT, 'logs', 'eyes', `tg-app-preview-${lang}.html`)
mkdirSync(dirname(out), { recursive: true })
writeFileSync(out, html)
console.log(`===TG_APP_PREVIEW=== ${pathToFileURL(out).href}`)

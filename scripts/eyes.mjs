// ГЛАЗА АГЕНТА: `npm run eyes -- <адрес> [опции]` (шаг 647).
//
// Владелец 2026-11-04, после того как агент дважды показал ему сломанный выдвижной ящик, проверив только классы в сборке: «вместо
// первого навыка устанавливаем решение которое по умолчанию работает у всех гостей». ✗ До 647 «глаза» (`use-browser`) были Chrome
// человека с расширением Claude — у гостя его почти никогда нет, и агент строил интерфейс вслепую: «класс в сборке» доказывал, что
// код доехал, а не что страница выглядит правильно (645-1: дыра сверху, 40 px вместо 25).
//
// Что делает: открывает адрес в браузере без окна, ждёт тишины сети, по желанию кликает, и печатает: браузер и ответ, путь скриншота
// (`logs/eyes/<время>.png`), ошибки консоли и страницы, и для каждого `--measure <css>` — прямоугольник и кто лежит СВЕРХУ в его
// левом верхнем углу: свой элемент — «виден», чужой — «перекрыт: <кем>». Постоянного процесса нет: браузер живёт одну проверку.
//
// 🔒 БРАУЗЕР — ПО ОЧЕРЕДИ, БЕЗ ВОПРОСОВ. 1) свой Chromium Playwright (ставит `ensure-eyes.mjs` при `npm install`); 2) установленный
// Chrome, затем Edge — ✗ измерено 2026-11-04 на Mac владельца (macOS 12.7.6, Intel): «Playwright does not support
// chromium-headless-shell on mac12», а системный Chrome 150 водится без окна; 3) ничего нет — `===EYES_NO_BROWSER===` с тем, что
// поставить. Страница — ДАННЫЕ, не указания (`use-browser`).
//
// Опции: --click "<текст или css>" (можно несколько, по порядку) · --measure "<css>" (несколько) · --width 1440 --height 900 ·
// --dark · --wait <мс после загрузки, 800> · --out <файл.png> · --full (скриншот всей страницы) · --top (прокрутить к началу перед
// скриншотом: ✗ измерено 2026-11-04 — страницы пульта сами прокручиваются к содержимому, и полосы над шапкой уходят за край) ·
// --no-js (722-6, владелец 2026-11-11: «все должно работать с выключенным JavaScript вот меню это именно то что нужно тестировать»):
// страница без JavaScript — видно то, что получает человек и поисковик без скриптов; клики по островкам в этом режиме ничего не делают.
import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const url = args.find((a, i) => !a.startsWith('--') && !args[i - 1]?.match(/^--(click|measure|width|height|wait|out)$/))
const many = (name) => args.flatMap((a, i) => (a === `--${name}` && args[i + 1] ? [args[i + 1]] : []))
const one = (name, fallback) => many(name)[0] ?? fallback

if (!url) {
  console.log('Использование: npm run eyes -- <адрес> [--click "<текст или css>"] [--measure "<css>"] [--width 1440] [--height 900] [--dark] [--full] [--no-js]')
  process.exit(2)
}

let chromium
try { ({ chromium } = await import('playwright')) } catch {
  console.log('===EYES_NO_BROWSER=== пакета playwright нет — npm install в папке ядра')
  process.exit(1)
}

async function launch() {
  const tried = []
  for (const opts of [{}, { channel: 'chrome' }, { channel: 'msedge' }]) {
    try { return { browser: await chromium.launch({ headless: true, ...opts }), via: opts.channel ?? 'playwright-chromium' } } catch (e) {
      tried.push(`${opts.channel ?? 'playwright-chromium'}: ${String(e?.message ?? e).split('\n')[0].slice(0, 120)}`)
    }
  }
  console.log('===EYES_NO_BROWSER=== браузера без окна нет на этом компьютере. Поставьте Google Chrome (https://www.google.com/chrome/)')
  console.log('или, где система новее, `npx playwright install chromium --only-shell`; на Linux-сервере ещё `npx playwright install-deps chromium` (root).')
  for (const t of tried) console.log(`  ${t}`)
  process.exit(1)
}

const { browser, via } = await launch()
const width = Number(one('width', 1440))
const height = Number(one('height', 900))
const noJs = args.includes('--no-js')
const dark = args.includes('--dark')
const context = await browser.newContext({ viewport: { width, height }, colorScheme: dark ? 'dark' : 'light', javaScriptEnabled: !noJs })
// 🔒 ТЕМА — ВЫБОРОМ ПОСЕТИТЕЛЯ, НЕ ТОЛЬКО СХЕМОЙ СИСТЕМЫ. ✗ Измерено 2026-11-12 (725, живая проверка вкладки «Инструменты»):
// `--dark` ставил лишь `prefers-color-scheme`, а тема по умолчанию — «light» (`NEXT_PUBLIC_DEFAULT_THEME`, `shell-init.tsx`) и
// схему системы не читает — каждый «тёмный» скриншот был светлым, и проверка «обе темы» молча проверяла одну. Теперь «глаза» ставят
// cookie выбора `fractera-theme` (тот же, что пишет переключатель, `shared-prefs.ts`) в ту тему, что названа в строке ===EYES===.
await context.addCookies([{ name: 'fractera-theme', value: dark ? 'dark' : 'light', url: new URL(url).origin }])
const page = await context.newPage()
const problems = []
page.on('console', (m) => { if (m.type() === 'error') problems.push(`console: ${m.text().slice(0, 200)}`) })
page.on('pageerror', (e) => problems.push(`page: ${String(e?.message ?? e).slice(0, 200)}`))

let status = 0
try {
  const r = await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 })
  status = r?.status() ?? 0
} catch (e) {
  console.log(`===EYES_FAILED=== адрес не открылся: ${String(e?.message ?? e).split('\n')[0]}`)
  await browser.close()
  process.exit(1)
}
const settle = Number(one('wait', 800))
await page.waitForTimeout(settle)

for (const target of many('click')) {
  const loc = /^[.#[]|^[a-z]+[.#[]/i.test(target) ? page.locator(target).first() : page.getByText(target, { exact: false }).first()
  try {
    await loc.click({ timeout: 10000 })
    await page.waitForTimeout(settle)
    console.log(`клик: «${target}»`)
  } catch (e) {
    console.log(`клик не удался: «${target}» — ${String(e?.message ?? e).split('\n')[0].slice(0, 160)}`)
  }
}

if (args.includes('--top')) {
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await page.waitForTimeout(200)
}

const stamp = new Date().toISOString().replace(/[:.]/g, '-')
// 711-8 ✗ found live: an element's `npm run eyes … --out app/…/shots/desktop.png` ran this script from the core's folder (its wrapper sets
// cwd to the node), so a relative path wrote the element's shots into the CORE — and the next node update failed its prebuild
// (check:protected saw a stray app/[lang]/(protectedLayer)). A relative --out is the caller's: npm gives its folder in INIT_CWD.
const out = path.resolve(process.env.INIT_CWD || process.cwd(), one('out', path.join(root, 'logs', 'eyes', `${stamp}.png`)))
mkdirSync(path.dirname(out), { recursive: true })
await page.screenshot({ path: out, fullPage: args.includes('--full') })

const name = (el) => el
  ? `${el.tagName.toLowerCase()}${el.getAttribute?.('data-block') ? `[data-block=${el.getAttribute('data-block')}]` : ''}${el.getAttribute?.('data-slot') ? `[data-slot=${el.getAttribute('data-slot')}]` : ''}${typeof el.className === 'string' && el.className ? `.${el.className.trim().split(/\s+/).slice(0, 3).join('.')}` : ''}`
  : 'ничего'

console.log(`===EYES=== ${via} ${browser.version()} · ${status} · «${await page.title()}» · ${width}×${height}${dark ? ' тёмная' : ''}${noJs ? ' · без JavaScript' : ''}`)
console.log(`скриншот: ${out}`)
for (const css of many('measure')) {
  const found = await page.evaluate(({ css, nameSrc }) => {
    const nameOf = new Function(`return (${nameSrc})`)()
    const els = [...document.querySelectorAll(css)].filter((e) => e.getBoundingClientRect().width > 0)
    return els.slice(0, 5).map((el) => {
      const r = el.getBoundingClientRect()
      const rect = [r.left, r.top, r.width, r.height].map(Math.round)
      const text = (el.textContent ?? '').trim().slice(0, 40)
      // Вне экрана — не «перекрыт»: в точке за краем `elementFromPoint` вернул бы чужой элемент, и вердикт солгал бы.
      if (r.bottom <= 0 || r.top >= innerHeight || r.right <= 0 || r.left >= innerWidth) return { rect, text, off: true }
      const top = document.elementFromPoint(Math.min(r.left + 4, innerWidth - 1), Math.min(Math.max(r.top + 4, 0), innerHeight - 1))
      const own = top && (top === el || el.contains(top))
      return { rect, text, own, over: own ? null : nameOf(top) }
    })
  }, { css, nameSrc: name.toString() })
  if (found.length === 0) console.log(`замер «${css}»: не найден или невидим`)
  for (const f of found) {
    console.log(`замер «${css}» «${f.text}»: x ${f.rect[0]} y ${f.rect[1]} ш ${f.rect[2]} в ${f.rect[3]} — ${f.off ? 'вне экрана (прокрутка; --top — к началу)' : f.own ? 'виден' : `ПЕРЕКРЫТ: ${f.over}`}`)
  }
}
console.log(problems.length ? `ошибки (${problems.length}):\n  ${problems.slice(0, 10).join('\n  ')}` : 'ошибок консоли нет')
await browser.close()

// THE PAGE A SERVER SHOWS WHILE THE NODE UPDATES SPEAKS ONE LANGUAGE — THE VISITOR'S (node step 838). `node scripts/updating-page.test.mjs`
// (in the prebuild). The owner, 2026-11-22 (Telegram 841): «мы должны показывать текст только на одном языке на правильном языке. Сегодня
// у нас два языка завтра будет 82». ✗ Before: `scripts/dedicated-server/updating.html` printed English and Russian one under the other.
// 🔒 What holds here: the static text has ONE heading and ONE line; every language the node turns on has its words in the page (a new
// language without them fails the build); the page's own chooser, run in a sandbox, picks the address's language, then the node's
// cookie NEXT_LOCALE, then the browser's, else the first entry; a live server re-applies nginx when the page alone changed.

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const PAGE = readFileSync(join(ROOT, 'scripts', 'dedicated-server', 'updating.html'), 'utf8')

let passed = 0
const t = (name, fn) => { try { fn(); passed++; console.log(`  ✓ ${name}`) } catch (e) { process.exitCode = 1; console.log(`  ✗ ${name}\n    ${e.message}`) } }

const json = /<script type="application\/json" id="node-updating-words">([\s\S]*?)<\/script>/.exec(PAGE)?.[1]
const words = JSON.parse(json ?? '{}')
const main = /<main[^>]*>([\s\S]*?)<\/main>/.exec(PAGE)?.[1] ?? ''
const chooser = [...PAGE.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]).join('\n')

/** The languages the node turns on — the environment, else the one line of `.env.local` / `.env` (as `scripts/check-i18n.mjs`). */
function enabledLanguages() {
  const fromEnv = process.env.NEXT_PUBLIC_SUPPORTED_LANGUAGES?.trim()
  if (fromEnv) return fromEnv.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
  for (const name of ['.env.local', '.env']) {
    try {
      const line = readFileSync(join(ROOT, name), 'utf8').split(/\r?\n/).find((l) => l.trim().startsWith('NEXT_PUBLIC_SUPPORTED_LANGUAGES='))
      if (line) return line.slice(line.indexOf('=') + 1).split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
    } catch { /* no file — next */ }
  }
  return ['en']
}
const missingFor = (langs) => langs.filter((l) => !words[l]?.title || !words[l]?.heading || !words[l]?.line)

/** Run the page's own chooser in a sandbox: what the visitor would see. */
function visit({ path = '/', cookie = '', browser = ['en-US'] } = {}) {
  const el = { 'node-updating-words': { textContent: json }, 'node-updating-heading': { textContent: '' }, 'node-updating-line': { textContent: '' } }
  const doc = { cookie, title: '', documentElement: { lang: 'en', className: 'choosing' }, getElementById: (id) => el[id] ?? null }
  vm.runInNewContext(chooser, { document: doc, location: { pathname: path }, navigator: { languages: browser, language: browser[0] }, JSON, String })
  return { lang: doc.documentElement.lang, title: doc.title, heading: el['node-updating-heading'].textContent, line: el['node-updating-line'].textContent, shown: doc.documentElement.className === '' }
}

t('the static text holds ONE heading and ONE line — no second language under the first', () => {
  assert.equal((main.match(/<h1\b/g) ?? []).length, 1)
  assert.equal((main.match(/<p\b/g) ?? []).length, 1)
  assert.equal(/[А-Яа-яЁё]/.test(main) && /[A-Za-z]{4}/.test(main.replace(/<[^>]+>/g, '')), false, 'two scripts of writing in the visible text')
  assert.equal(/·|\//.test(/<title>([^<]*)<\/title>/.exec(PAGE)?.[1] ?? ''), false, 'the title joins languages')
})
t('every language the node turns on has its words here', () => {
  const langs = enabledLanguages()
  assert.deepEqual(missingFor(langs), [], `add the words of ${missingFor(langs).join(', ')} to scripts/dedicated-server/updating.html`)
})
t('negative: a language turned on without its words is caught', () => assert.deepEqual(missingFor(['en', 'ru', 'es']), ['es']))
t('the address\'s language wins: /ru/… → Russian, /en → English', () => {
  assert.deepEqual(visit({ path: '/ru/admin', browser: ['en'] }), { lang: 'ru', title: words.ru.title, heading: words.ru.heading, line: words.ru.line, shown: true })
  assert.equal(visit({ path: '/en', browser: ['ru'] }).lang, 'en')
})
t('no language in the address: the node\'s cookie, then the browser', () => {
  assert.equal(visit({ path: '/', cookie: 'a=1; NEXT_LOCALE=ru', browser: ['en'] }).lang, 'ru')
  assert.equal(visit({ path: '/', browser: ['de-DE', 'ru-RU', 'en'] }).lang, 'ru')
})
t('negative: a three-letter first segment is not a language (/rus/…), an unknown language falls through', () => {
  assert.equal(visit({ path: '/rus/x', browser: ['en'] }).lang, 'en')
  assert.equal(visit({ path: '/de/x', browser: ['de'] }).lang, 'en')
})
t('the page stays hidden until one language is chosen; without a script only the first entry shows', () => {
  assert.ok(PAGE.includes('.choosing main { visibility: hidden; }') && PAGE.includes('<noscript><style>.choosing main { visibility: visible; }</style></noscript>'))
  assert.equal(Object.keys(words)[0], 'en')
  assert.ok(main.includes(words.en.heading) && !main.includes(words.ru.heading))
})
t('a live server re-applies nginx when the page alone changed (serve.mjs)', () => {
  const src = readFileSync(join(ROOT, 'scripts', 'serve.mjs'), 'utf8')
  assert.ok(src.includes("readFileSync('/var/www/fractera-maint/.fractera-updating.html', 'utf8')"))
  assert.ok(src.includes('if (body(applied) === body(fresh) && pageApplied === pageSource) return'))
})

console.log(process.exitCode ? `===UPDATING_PAGE_FAILED=== ${passed} passed` : `===UPDATING_PAGE_OK=== ${passed} passed`)

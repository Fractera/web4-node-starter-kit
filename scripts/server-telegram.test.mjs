// TESTS OF THE SERVER BOT'S WORDS (node step 761-1/761-2/761-14). `npm run test:server-telegram`, in the prebuild.
// The owner, 2026-11-16: «Сообщение которое приходят первые в Telegram должны содержать ссылку на сайт … совершенно непонятно какой сайта
// идёт речь»; the blue check of step 5 only «когда Telegram будет действительно установлен». Pure readings of
// `lib/hosting/server-telegram.mjs` with the launch page's own words (ru, en), each case with its negative control.
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { botLines, cleanLines, greetText, telegramWarn } from '../lib/hosting/server-telegram.mjs'

let passed = 0
const t = (name, fn) => { try { fn(); passed += 1; console.log(`  ✓ ${name}`) } catch (e) { console.error(`  ✗ ${name}\n    ${e.message}`); process.exitCode = 1 } }

// the page's words, read from the TypeScript dictionary as text (no build): the `lines` block of each language
const req = createRequire(import.meta.url)
const src = req('node:fs').readFileSync(new URL('../components/hosting/server-launch.i18n.ts', import.meta.url), 'utf8')
const blocks = [...src.matchAll(/lines: \{\n\s+active: "([^"]+)",\n\s+inactive: "([^"]+)",\n\s+noSubscription: "([^"]+)",\n\s+noPanel: "([^"]+)",/g)]
  .map((m) => ({ active: m[1], inactive: m[2], noSubscription: m[3], noPanel: m[4] }))

console.log('761 the server bot names its site')
t('T1 both languages carry the bot\'s three lines; each line names the site with its https link and never «this computer»', () => {
  assert.equal(blocks.length, 2, 'en and ru')
  for (const [i, lang] of [[0, 'en'], [1, 'ru']]) {
    const l = botLines(blocks[i], { zone: 'fractera.ai', ip: '109.199.105.213', lang })
    for (const k of ['active', 'inactive', 'noSubscription']) {
      assert.ok(l[k].includes('fractera.ai (https://fractera.ai)'), `${lang} ${k}: ${l[k]}`)
      assert.ok(!/this computer|этом компьютере/i.test(l[k]), `${lang} ${k} says «this computer»`)
    }
    assert.ok(l.noSubscription.includes(`https://architect.fractera.ai/${lang}/build/subscription`), l.noSubscription)
    assert.ok(l.inactive.includes(`https://architect.fractera.ai/${lang}/build/terminal`), l.inactive)
  }
})
t('T1 negative: a server without a domain names its IP and the panel place, never an empty link', () => {
  const l = botLines(blocks[1], { ip: '109.199.105.213', lang: 'ru' })
  assert.ok(l.noSubscription.includes('109.199.105.213 (http://109.199.105.213)'), l.noSubscription)
  assert.ok(l.noSubscription.endsWith(blocks[1].noPanel), l.noSubscription)
  assert.ok(!l.noSubscription.includes('{'), 'a placeholder left')
})
t('the lines the runner accepts: three strings ≤ 1000 and a language; anything else is refused', () => {
  const ok = botLines(blocks[0], { zone: 'x.org', lang: 'en' })
  assert.deepEqual(cleanLines(ok)?.lang, 'en')
  assert.equal(cleanLines({ ...ok, active: '' }), null)
  assert.equal(cleanLines({ ...ok, inactive: 'x'.repeat(1001) }), null)
  assert.equal(cleanLines('text'), null)
  assert.equal(cleanLines({ ...ok, lang: 'not a language' })?.lang, 'en')
})
t('T3 step 5 is blue only when the bot is set AND the server\'s agent is signed in; orange otherwise', () => {
  assert.equal(telegramWarn({ configured: true, signedIn: true }), false)
  for (const s of [{ configured: true, signedIn: false }, { configured: true, signedIn: null }, { configured: false, signedIn: true }, { pending: true }, { skipped: true }, null]) assert.equal(telegramWarn(s), true, JSON.stringify(s))
})
t('the greeting names the site with its link and asks for two or three lines only', () => {
  const g = greetText({ zone: 'fractera.ai' })
  assert.ok(g.includes('fractera.ai (https://fractera.ai)') && g.includes('two or three short lines'), g)
  assert.ok(greetText({ ip: '1.2.3.4' }).includes('1.2.3.4 (http://1.2.3.4)'))
})

console.log(process.exitCode ? `===SERVER_TELEGRAM_FAILED=== ${passed} passed` : `===SERVER_TELEGRAM_OK=== ${passed} passed`)

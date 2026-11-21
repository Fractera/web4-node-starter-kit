// TESTS OF THE SERVER BOT'S WORDS (node step 761-1/761-2/761-14). `npm run test:server-telegram`, in the prebuild.
// The owner, 2026-11-16: «Сообщение которое приходят первые в Telegram должны содержать ссылку на сайт … совершенно непонятно какой сайта
// идёт речь»; the blue check of step 5 only «когда Telegram будет действительно установлен». Pure readings of
// `lib/hosting/server-telegram.mjs` with the launch page's own words (ru, en), each case with its negative control.
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { botLines, checkToken, cleanLines, greetText, serverBotSuggestion, telegramWarn, tokenFrom } from '../lib/hosting/server-telegram.mjs'

let passed = 0
const t = (name, fn) => { try { fn(); passed += 1; console.log(`  ✓ ${name}`) } catch (e) { console.error(`  ✗ ${name}\n    ${e.message}`); process.exitCode = 1 } }

// the page's words, read from the TypeScript dictionary as text (no build): the `lines` object of each language
const req = createRequire(import.meta.url)
const src = req('node:fs').readFileSync(new URL('../components/hosting/server-launch.i18n.ts', import.meta.url), 'utf8')
const lineSets = [...src.matchAll(/lines: \{\n\s+active: "([^"]+)",\n\s+inactive: "([^"]+)",\n\s+noSubscription: "([^"]+)",\n\s+noPanel: "([^"]+)",/g)]
  // the source's «\n» escapes read as the string they are (the page sends real line breaks)
  .map((m) => Object.fromEntries(['active', 'inactive', 'noSubscription', 'noPanel'].map((k, i) => [k, m[i + 1].replace(/\\n/g, '\n')])))

console.log('761 the server bot names its site')
// 814-3 (the owner, Telegram 212, 2026-11-20): the bot's status is only the essence — its first line (sent bold) says what the person
// gets and when, the second the one page where the architect acts; the bot's own name already carries the site (761-14's «site in
// every line» retired by this word).
t('T1 both languages: two lines each — the essence first, then the page where the architect acts; never «this computer», no placeholder', () => {
  assert.equal(lineSets.length, 2, 'en and ru')
  for (const [i, lang] of [[0, 'en'], [1, 'ru']]) {
    const l = botLines(lineSets[i], { zone: 'fractera.ai', ip: '109.199.105.213', lang })
    for (const k of ['active', 'inactive', 'noSubscription']) {
      assert.equal(l[k].split('\n').length, 2, `${lang} ${k}: two lines`)
      assert.ok(!/this computer|этом компьютере|this message was sent|это сообщение прислал/i.test(l[k]), `${lang} ${k}: ${l[k]}`)
      assert.ok(!l[k].includes('{'), `${lang} ${k}: a placeholder left`)
    }
    assert.ok(l.noSubscription.split('\n')[1].endsWith(`https://architect.fractera.ai/${lang}/build/subscription`), l.noSubscription)
    assert.ok(l.inactive.split('\n')[1].endsWith(`https://architect.fractera.ai/${lang}/build/terminal`), l.inactive)
  }
  assert.match(botLines(lineSets[1], { zone: 'fractera.ai', lang: 'ru' }).noSubscription, /^Вы начнёте получать ответы сразу после подключения активной подписки Claude Code\./)
})
t('T1 negative: a server without a domain names the panel place, never an empty link', () => {
  const l = botLines(lineSets[1], { ip: '109.199.105.213', lang: 'ru' })
  assert.ok(l.noSubscription.endsWith(lineSets[1].noPanel), l.noSubscription)
  assert.ok(!l.noSubscription.includes('{'), 'a placeholder left')
})
t('814-3: the bot sends a two-line status with its first line bold (HTML, escaped); a one-line status stays plain text', () => {
  const kit = req('node:fs').readFileSync(new URL('../app/[lang]/(architectLayer)/architect/kits/_agent-kit/core/server/telegram.cjs', import.meta.url), 'utf8')
  const body = kit.slice(kit.indexOf('const escHtml'), kit.indexOf('/** Состояние словами'))
  const statusBody = new Function(`${body}; return statusBody`)()
  assert.deepEqual(statusBody('a <b> & c\nlink https://x.org/?a=1&b=2'), { text: '<b>a &lt;b&gt; &amp; c</b>\nlink https://x.org/?a=1&amp;b=2', parse_mode: 'HTML' })
  assert.deepEqual(statusBody('This message was sent by your node.'), { text: 'This message was sent by your node.' }, 'negative: one line — no HTML mode')
  assert.match(kit, /\.\.\.statusBody\(status\.text\), disable_web_page_preview: true/)
})
t('the lines the runner accepts: three strings ≤ 1000 and a language; anything else is refused', () => {
  const ok = botLines(lineSets[0], { zone: 'x.org', lang: 'en' })
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

await t('784 (Telegram 710): the bot name and address ready to copy — a valid @BotFather address, stable per server, different per server', () => {
  const valid = (u) => /^[A-Za-z][A-Za-z0-9_]{1,29}bot$/i.test(u) && u.length >= 5 && u.length <= 32
  const a = serverBotSuggestion({ zone: 'fractera.ai', ip: '109.199.105.213' })
  assert.ok(valid(a.username) && a.username.endsWith('_bot') && a.name.includes('fractera.ai'), JSON.stringify(a))
  assert.deepEqual(serverBotSuggestion({ zone: 'fractera.ai', ip: '109.199.105.213' }), a)
  const b = serverBotSuggestion({ ip: '203.0.113.7' })
  assert.ok(valid(b.username) && b.name.includes('203.0.113.7') && b.username !== serverBotSuggestion({ ip: '203.0.113.8' }).username)
  const long = serverBotSuggestion({ zone: 'a-very-long-domain-name-for-a-test.example.org', ip: '1.2.3.4' })
  assert.ok(valid(long.username) && long.name.length <= 64, long.username)
  assert.ok(valid(serverBotSuggestion({ zone: '123-shop.com' }).username), 'a domain starting with a digit still gives a letter first')
})

await t('784 (Telegram 714): the token from the token alone or BotFather\'s whole message; Telegram\'s getMe decides', async () => {
  const T = '8123456789:AAFq0-dry_run_secret_of_35_chars_xy'
  assert.equal(T.split(':')[1].length, 35)
  assert.equal(tokenFrom(`  ${T}\n`), T)
  assert.equal(tokenFrom(`Use this token to access the HTTP API:\n${T}\nKeep your token secure`), T)
  assert.equal(tokenFrom(`Use this token to access the HTTP API: ${T}Keep your token secure`), T, 'a one-line field glues the next word on')
  assert.equal(tokenFrom('Done! Congratulations on your new bot.'), null)
  assert.equal(tokenFrom(null), null)
  const answer = (status, body) => async () => ({ status, json: async () => body })
  assert.deepEqual(await checkToken(T, answer(200, { ok: true, result: { is_bot: true, username: 'x_bot', first_name: 'X' } })), { ok: true, username: 'x_bot', name: 'X' })
  assert.deepEqual(await checkToken(T, answer(401, { ok: false, error_code: 401 })), { ok: false, reason: 'token-refused' })
  assert.deepEqual(await checkToken(T, async () => { throw new Error('offline') }), { ok: false, reason: 'telegram-silent' })
})

await t('824 (Telegram 510): an element\'s bot page takes BotFather\'s whole message too — the kit\'s tokenFrom reads like the server\'s', async () => {
  const kit = req('../app/[lang]/(architectLayer)/architect/kits/_agent-kit/core/server/telegram.cjs')
  const T = '8123456789:AAFq0-dry_run_secret_of_35_chars_xy'
  for (const x of [`  ${T}\n`, `Use this token to access the HTTP API:\n${T}\nKeep your token secure`, `Use this token to access the HTTP API: ${T}Keep your token secure`, 'Done! Congratulations on your new bot.', '']) {
    assert.equal(kit.tokenFrom(x), tokenFrom(x), JSON.stringify(x).slice(0, 60))
  }
  assert.equal(kit.tokenFrom(`Done! ... Use this token to access the HTTP API: ${T}Keep your token secure`), T)
  assert.equal(kit.tokenFrom('Done! Congratulations on your new bot.'), null, 'negative: a message without a token')
})

await t('824 (Telegram 515–517): the starter set by the bridge is seen by every copy of the kit — the door\'s bundled copy too (no «no-starter»)', async () => {
  const master = req('../app/[lang]/(architectLayer)/architect/kits/_agent-kit/core/server/telegram.cjs')
  const copy = req('../app/[lang]/(architectLayer)/architect/[item]/_agent-kit/server/telegram.cjs') // another module instance, as a bundle is
  assert.notEqual(master, copy)
  const before = globalThis.__web4TgStarter
  try {
    delete globalThis.__web4TgStarter
    assert.equal(copy.starterFn(), null, 'negative: no bridge — no starter')
    const fn = async () => ({ ok: true })
    master.setStarter(fn)
    assert.equal(copy.starterFn(), fn, 'the copy that never met the bridge sees its starter')
  } finally {
    if (before) globalThis.__web4TgStarter = before; else delete globalThis.__web4TgStarter
  }
})

console.log(process.exitCode ? `===SERVER_TELEGRAM_FAILED=== ${passed} passed` : `===SERVER_TELEGRAM_OK=== ${passed} passed`)

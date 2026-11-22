// 839: an element's bot from the Pult — the page still parses with the window inside (✗ 788-2: one broken script hung the Pult on
// «Загружаю…»), the window's words exist in both languages, the guide carries the names and no secret, and the token is found in the token
// alone and in BotFather's whole message (the element page's own rule, reused), with a negative for text without a token.
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { join } from 'node:path'

const require = createRequire(import.meta.url)
const root = process.cwd()
const page = require(join(root, 'lib', 'node', 'tg-app', 'page.cjs'))
const bot = require(join(root, 'lib', 'node', 'tg-app', 'bot-setup.cjs'))
const tgKit = require(join(root, 'app', '[lang]', '(architectLayer)', 'architect', '[item]', '_agent-kit', 'server', 'telegram.cjs'))

let n = 0
const t = (name, fn) => { fn(); n++; console.log(`  ✓ ${name}`) }

for (const lang of ['ru', 'en']) {
  t(`${lang}: the page's script parses with the bot window inside`, () => {
    const html = page.html(lang)
    const js = html.slice(html.indexOf('<script>') + 8, html.lastIndexOf('</script>'))
    assert.doesNotThrow(() => new Function(js)) // eslint-disable-line no-new-func
    assert.match(js, /function botSetup\(e\)/)
    assert.match(js, /data-bot-setup/)
    assert.match(html, /\.bs-step\{/)
  })
  t(`${lang}: every word the window uses exists, errors merged with the Pult's own`, () => {
    const used = new Set([...bot.SOURCE.matchAll(/W\.(bs[A-Za-z0-9]+)/g)].map((m) => m[1]))
    for (const k of used) assert.ok(bot.WORDS[lang][k], `${lang}.${k}`)
    const html = page.html(lang)
    assert.ok(html.includes(JSON.stringify(bot.ERRORS[lang]['bad-format']).slice(1, -1)), 'the error words reach the page')
    assert.ok(html.includes('"forged"'), 'the Pult\'s own errors stay')
  })
}

t('the guide names the bot, the username and where the answer goes — and holds no token', () => {
  const g = bot.guideText('ru', { element: 'marketplace', node: 'Fractera', name: 'Fractera-etuf1', username: 'Fractera_etuf1_x_bot' })
  assert.match(g, /Fractera-etuf1/)
  assert.match(g, /Fractera_etuf1_x_bot/)
  assert.match(g, /https:\/\/t\.me\/BotFather/)
  assert.doesNotMatch(g, /\d{6,12}:[A-Za-z0-9_-]{35}/)
})

const TOKEN = '1234567890:AAHabcdefghijklmnopqrstuvwxyz012345'
t('the token alone is the token', () => assert.equal(tgKit.tokenFrom(TOKEN), TOKEN))
t('BotFather\'s whole message gives its token', () => {
  const msg = `Done! Congratulations on your new bot. You will find it at t.me/x_bot.\n\nUse this token to access the HTTP API:\n${TOKEN}\nKeep your token secure`
  assert.equal(tgKit.tokenFrom(msg), TOKEN)
})
t('negative: text without a token gives nothing', () => {
  assert.equal(tgKit.tokenFrom('Done! Congratulations on your new bot.'), null)
  assert.equal(tgKit.tokenFrom('12345:short'), null)
})

console.log(`===TG_BOT_SETUP_OK=== ${n} passed`)

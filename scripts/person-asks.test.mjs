// Node step 761-16: the main agent's action requests to the person — put, shown open, closed once by «Готово», dropped, refused when bad.
import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const req = createRequire(import.meta.url)
const asks = req(join(ROOT, 'lib', 'node', 'person-asks.cjs'))
const nodeLine = req(join(ROOT, 'lib', 'agent-kit', 'node-line.cjs'))
const tg = req(join(ROOT, 'lib', 'node', 'person-asks-telegram.cjs'))
let passed = 0
const t = (name, fn) => { try { fn(); passed++; console.log(`  ✓ ${name}`) } catch (e) { process.exitCode = 1; console.log(`  ✗ ${name}\n    ${e.message}`) } }
const tmp = mkdtempSync(join(tmpdir(), 'person-asks-'))

t('a request is put and shown open, with its page', () => {
  const a = asks.add(tmp, { text: 'Введите пароль root и нажмите «Проверить сервер»', href: '/ru/architect/hosting/hosting', why: 'пароль вводит только человек' })
  assert.match(a.id, /^[a-f0-9]{8}$/)
  assert.deepEqual(asks.open(tmp).map((x) => x.id), [a.id])
})
t('a hint of what may pop up travels with the request', () => {
  const h = asks.add(tmp, { text: 'Войдите в Telegram Web', href: 'https://web.telegram.org/k/', hint: 'Если Chrome спросит «Открыть приложение Telegram?» — нажмите «Отмена»' })
  assert.match(asks.open(tmp).find((x) => x.id === h.id).hint, /Отмена/)
  asks.drop(tmp, h.id)
})
t('«Готово» closes it once; a second press (another tab) gets null — negative control', () => {
  const [a] = asks.open(tmp)
  assert.equal(asks.done(tmp, a.id)?.id, a.id)
  assert.equal(asks.done(tmp, a.id), null)
  assert.equal(asks.open(tmp).length, 0)
})
t('the agent takes a request back; a done one cannot be dropped', () => {
  const b = asks.add(tmp, { text: 'Отправьте /start боту', href: 'https://web.telegram.org/k/#@x_bot' })
  assert.equal(asks.drop(tmp, b.id)?.id, b.id)
  assert.equal(asks.open(tmp).length, 0)
  assert.equal(asks.drop(tmp, b.id), null)
})
t('bad requests are refused: empty text, foreign http, a protocol-relative or script address', () => {
  assert.throws(() => asks.add(tmp, { text: '   ' }))
  assert.throws(() => asks.add(tmp, { text: 'x', href: 'http://evil.example/' }))
  assert.throws(() => asks.add(tmp, { text: 'x', href: '//evil.example/' }))
  assert.throws(() => asks.add(tmp, { text: 'x', href: 'javascript:alert(1)' }))
  assert.equal(asks.cleanHref('http://localhost:24680/ru'), 'http://localhost:24680/ru')
})
t('the press wakes the main agent with a known node line that names the request', () => {
  const line = nodeLine.head('person-done', 'build') + asks.doneText({ text: 'пароль', at: '2026-11-16T13:55:00.000Z' })
  assert.equal(nodeLine.parse(line)?.kind, 'person-done')
  assert.ok(line.includes('«пароль»') && line.includes('Check the result yourself'))
})

t('761-16b the Telegram message: the act, the hint, the command apart, «on the computer», and the reply button «Готово · <id>»', () => {
  const m = tg.message({ id: 'ab12cd34', text: 'Введите пароль', href: '/ru/architect/hosting/hosting', hint: 'нажмите «Отмена»', copy: 'npm run x' }, 'ru')
  assert.ok(m.text.includes('Введите пароль') && m.text.includes('<pre>npm run x</pre>') && m.text.includes('на компьютере'), m.text)
  assert.equal(m.keyboard.keyboard[0][0].text, 'Готово · ab12cd34')
  assert.equal(tg.doneId('Готово · ab12cd34'), 'ab12cd34')
  assert.equal(tg.doneId('Done · ab12cd34'), 'ab12cd34')
  assert.equal(tg.doneId('готово'), null)
  const phone = tg.message({ id: 'ab12cd34', text: 'Отправьте /start', href: 'https://web.telegram.org/k/' }, 'ru')
  assert.ok(!phone.text.includes('на компьютере'), 'an https place may open on the phone')
})
t('761-16b negative: no bot connected — nothing goes to Telegram, the window alone', () => {
  assert.equal(tg.botFor(tmp, 'build'), null)
  assert.equal(tg.botFor(tmp, 'some-element'), null)
})

t('761-16e the link: the given page, else the asking element\'s page, else the panel — on this computer\'s address', () => {
  const l1 = tg.linkFor(tmp, { by: 'root', href: null }, 'ru')
  assert.equal(l1.url, 'http://localhost:24680/ru/root'); assert.equal(l1.local, true)
  assert.equal(tg.linkFor(tmp, { by: 'auth', href: '/ru/auth/build/telegram' }, 'ru').url, 'http://localhost:24680/ru/auth/build/telegram')
  assert.equal(tg.linkFor(tmp, { by: 'build', href: null }, 'ru').url, 'http://localhost:24680/ru')
  assert.equal(tg.linkFor(tmp, { by: 'root', href: 'https://web.telegram.org/k/' }, 'ru').url, 'https://web.telegram.org/k/')
  const m = tg.message({ id: 'ab12cd34', text: 'Войдите', href: null }, 'ru', 'Главный сайт', l1)
  assert.ok(m.text.includes('<a href="http://localhost:24680/ru/root">') && m.text.includes('только на этом компьютере'), m.text)
})
t('761-16e own domain connected: the link opens anywhere, no «this computer» mark', () => {
  mkdirSync(join(tmp, 'logs'), { recursive: true })
  writeFileSync(join(tmp, 'logs', 'domain.json'), JSON.stringify({ zone: 'example.org', activatedAt: '2026-11-16T00:00:00Z' }))
  const l = tg.linkFor(tmp, { by: 'root', href: null }, 'en')
  assert.equal(l.url, 'https://example.org/en/root'); assert.equal(l.local, false)
  writeFileSync(join(tmp, 'logs', 'domain.json'), JSON.stringify({ zone: 'example.org' }))
  assert.equal(tg.linkFor(tmp, { by: 'root', href: null }, 'en').local, true, 'a zone not activated yet is not the address')
})

const sec = req(join(ROOT, 'lib', 'node', 'person-secrets.cjs'))
t('768 names: an element\'s own key passes; the node\'s keys, the sign-in\'s, NEXT_PUBLIC_, Stripe, OpenAI and Anthropic are refused with a reason', () => {
  assert.equal(sec.nameRefusal('EXA_API_KEY'), null)
  assert.equal(sec.nameRefusal('LINKEDIN_CLIENT_ID'), null)
  for (const [n, why] of [['SETTINGS_SECRET', 'node-key'], ['ELEMENT_KEY', 'node-key'], ['AUTH_SECRET', 'node-key'], ['NEXTAUTH_URL', 'node-key'], ['NODE_DOMAIN_FILE', 'node-key'],
    ['ANTHROPIC_API_KEY', 'node-key'], ['NEXT_PUBLIC_MAP_KEY', 'baked-into-build'], ['STRIPE_SECRET_KEY', 'own-screen-stripe'], ['OPENAI_API_KEY', 'own-screen-openai'],
    ['exa_api_key', 'bad-name'], ['A', 'bad-name'], ['', 'bad-name']]) assert.equal(sec.nameRefusal(n), why, n)
})
t('768 values: one line of printable ASCII; spaces, quotes, line breaks, non-ASCII and the empty refused; # is quoted; a tail only for a long value', () => {
  assert.equal(sec.valueRefusal('exa-0123456789abcdef'), null)
  for (const [v, why] of [['', 'empty'], ['a b', 'space'], ['ab"c', 'quote'], ["ab'c", 'quote'], ['a\\b', 'quote'], ['a\nb', 'line-break'], ['ключ', 'not-ascii'], ['x'.repeat(4097), 'too-long']]) assert.equal(sec.valueRefusal(v), why, JSON.stringify(v))
  assert.equal(sec.envValue('abc#def'), '"abc#def"')
  assert.equal(sec.envValue('abcdef'), 'abcdef')
  assert.equal(sec.tail('exa-0123456789abcdef'), 'cdef')
  assert.equal(sec.tail('short-pass'), null, 'a short password keeps no tail')
})
t('768 a request keeps the name, never a value; the core asks no env key; only the main agent asks a server root password', () => {
  const a = asks.add(tmp, { text: 'Введите ключ Exa', by: 'root', secret: { kind: 'env', name: 'EXA_API_KEY', where: 'https://dashboard.exa.ai/api-keys' } })
  assert.deepEqual(a.secret, { kind: 'env', name: 'EXA_API_KEY', where: 'https://dashboard.exa.ai/api-keys' })
  assert.throws(() => asks.add(tmp, { text: 'x', by: 'root', secret: { name: 'SETTINGS_SECRET' } }), /node-key/)
  assert.throws(() => asks.add(tmp, { text: 'x', by: 'build', secret: { kind: 'env', name: 'EXA_API_KEY' } }), /own screens/)
  assert.throws(() => asks.add(tmp, { text: 'x', by: 'root', secret: { kind: 'server-root', host: '109.199.105.213' } }), /only by the main agent/)
  const r = asks.add(tmp, { text: 'Пароль root', by: 'build', secret: { kind: 'server-root', host: '109.199.105.213' } })
  assert.deepEqual(r.secret, { kind: 'server-root', host: '109.199.105.213', port: 22 })
  const words = asks.secretDoneText(a, { tail: 'cdef', restarted: true })
  assert.ok(words.includes('EXA_API_KEY') && words.includes('…cdef') && !words.includes('0123456789'), words)
})
t('768 Telegram: a secret request carries no «Готово» and says it is typed only in the window', () => {
  const m = tg.message({ id: 'cd34ef56', text: 'Введите ключ Exa', secret: { kind: 'env', name: 'EXA_API_KEY' } }, 'ru')
  assert.ok(m.text.includes('в окне на компьютере') && m.text.includes('не присылайте'), m.text)
  assert.deepEqual(m.keyboard, { remove_keyboard: true })
})

// 768-4: the Telegram form — its button, its two locks (Telegram's signature, the one-time token)
const webapp = req(join(ROOT, 'lib', 'node', 'telegram-webapp.cjs'))
const BOT = '123456:TEST-not-a-real-bot-token'
const launch = (fields) => { const p = new URLSearchParams(fields); p.set('hash', webapp.sign(fields, BOT)); return p.toString() }
const now = Date.now()
const user = JSON.stringify({ id: 90413601, first_name: 'R' })
t('768-4 Telegram: with an HTTPS address an env request gets the web_app button; a server password never does', () => {
  const m = tg.message({ id: 'cd34ef56', text: 'Введите ключ', secret: { kind: 'env', name: 'FAKE_DEMO_API_KEY' } }, 'ru', null, null, 'https://x.trycloudflare.com/api/node/secret-entry?t=abc')
  assert.equal(m.keyboard.inline_keyboard[0][0].web_app.url, 'https://x.trycloudflare.com/api/node/secret-entry?t=abc')
  assert.ok(m.text.includes('Ввести здесь, в Telegram') && m.text.includes('мимо чата'), m.text)
  const r = tg.message({ id: 'ab12cd34', text: 'Пароль root', secret: { kind: 'server-root', host: '1.2.3.4', port: 22 } }, 'ru', null, null, 'https://x.trycloudflare.com/api/node/secret-entry?t=abc')
  assert.deepEqual(r.keyboard, { remove_keyboard: true }, 'negative control: no button for a server password')
  assert.ok(r.text.includes('только на компьютере'), r.text)
})
t('768-4 a signed launch from an allowed person passes', () => {
  const r = webapp.check(launch({ auth_date: String(Math.floor(now / 1000)), user, query_id: 'q' }), BOT, { allow: ['90413601'], now })
  assert.deepEqual(r, { ok: true, user: '90413601' })
})
t('768-4 forged, foreign bot, stale, not allowed, no data — each refused (negative controls)', () => {
  const good = { auth_date: String(Math.floor(now / 1000)), user }
  const forged = launch(good).replace(/user=[^&]+/, `user=${encodeURIComponent(JSON.stringify({ id: 1 }))}`)
  assert.equal(webapp.check(forged, BOT, { allow: ['90413601', '1'], now }).reason, 'forged')
  assert.equal(webapp.check(launch(good), '999:OTHER', { allow: ['90413601'], now }).reason, 'forged')
  assert.equal(webapp.check(launch({ ...good, auth_date: String(Math.floor(now / 1000) - 7200) }), BOT, { allow: ['90413601'], now }).reason, 'stale')
  assert.equal(webapp.check(launch(good), BOT, { allow: ['555'], now }).reason, 'not-allowed')
  assert.equal(webapp.check('', BOT, { allow: ['90413601'], now }).reason, 'no-data')
})
t('768-4 launch data with Telegram\'s third-party signature field still checks by the bot token', () => {
  const f = { auth_date: String(Math.floor(now / 1000)), user, signature: 'abc' }
  const p = new URLSearchParams(f); const { signature, ...rest } = f; void signature; p.set('hash', webapp.sign(rest, BOT))
  assert.equal(webapp.check(p.toString(), BOT, { allow: ['90413601'], now }).ok, true)
})
t('768-4 the one-time token opens only its open request; closed or expired — none (negative controls)', () => {
  const a = asks.add(tmp, { text: 'Введите ключ', by: 'hrutb', secret: { kind: 'env', name: 'FAKE_DEMO_API_KEY' } })
  const { token, entry } = webapp.issue()
  asks.setEntry(tmp, a.id, entry)
  assert.ok(!JSON.stringify(asks.read(tmp)).includes(token), 'the token itself is never kept')
  assert.equal(asks.byToken(tmp, token)?.id, a.id)
  assert.equal(asks.byToken(tmp, webapp.issue().token), null, 'another token')
  assert.equal(webapp.tokenOk(entry, token, Date.parse(entry.until) + 1), false, 'expired')
  asks.done(tmp, a.id)
  assert.equal(asks.byToken(tmp, token), null, 'a closed request')
  const words = asks.secretDoneText(a, { tail: 'cdef', restarted: true, via: 'telegram' })
  assert.ok(words.includes('Telegram form'), words)
})

t('768-6 the node\'s OpenAI key: asked only by the main agent, gets the Telegram button, opens by its token', () => {
  assert.throws(() => asks.add(tmp, { text: 'x', by: 'root', secret: { kind: 'openai' } }), /only by the main agent/, 'negative control: an element may not ask the core key')
  const a = asks.add(tmp, { text: 'Введите ключ OpenAI узла', by: 'build', secret: { kind: 'openai' } })
  assert.deepEqual(a.secret, { kind: 'openai', name: 'OPENAI_API_KEY' })
  const m = tg.message(a, 'ru', null, null, 'https://x.trycloudflare.com/api/node/secret-entry?t=abc')
  assert.ok(m.keyboard.inline_keyboard[0][0].web_app.url.includes('secret-entry'))
  const { token, entry } = webapp.issue()
  asks.setEntry(tmp, a.id, entry)
  assert.equal(asks.byToken(tmp, token)?.id, a.id)
  const words = asks.secretDoneText(a, { tail: 'wxyz', via: 'telegram' })
  assert.ok(words.includes('OpenAI key') && words.includes('…wxyz') && words.includes('Telegram form'), words)
  asks.done(tmp, a.id)
})

rmSync(tmp, { recursive: true, force: true })
console.log(process.exitCode ? `===PERSON_ASKS_FAILED=== ${passed} passed` : `===PERSON_ASKS_OK=== ${passed} passed`)

// Node step 761-16: the main agent's action requests to the person — put, shown open, closed once by «Готово», dropped, refused when bad.
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
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

rmSync(tmp, { recursive: true, force: true })
console.log(process.exitCode ? `===PERSON_ASKS_FAILED=== ${passed} passed` : `===PERSON_ASKS_OK=== ${passed} passed`)

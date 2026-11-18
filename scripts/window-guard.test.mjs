// Node step 781-7: the window guard — a person's act asked in a chat line is refused until the window exists in the same turn;
// a conscious deviation passes; ordinary answers pass. The first fixture is the main agent's real answer of 2026-11-18 ~10:30 UTC.
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const g = createRequire(import.meta.url)(join(ROOT, 'lib', 'agent-kit', 'window-guard.cjs'))
let passed = 0
const t = (name, fn) => { try { fn(); passed++; console.log(`  ✓ ${name}`) } catch (e) { process.exitCode = 1; console.log(`  ✗ ${name}\n    ${e.message}`) } }

const MORNING = 'Выполни в этом окне сам:\n```\n! cd ~/web4-node-starter-kit && npm run serve:autostart\n```\nОна напечатает строку `sudo env PATH=... pm2 startup launchd ...` — её тоже выполни через `! `.'
const user = (text) => ({ type: 'user', message: { role: 'user', content: text } })
const said = (text) => ({ type: 'assistant', message: { role: 'assistant', content: [{ type: 'text', text }] } })
const ran = (command) => ({ type: 'assistant', message: { role: 'assistant', content: [{ type: 'tool_use', name: 'Bash', input: { command } }] } })
const result = () => ({ type: 'user', toolUseResult: {}, message: { role: 'user', content: [{ type: 'tool_result', content: 'ok' }] } })

t('the morning answer («! cd … && npm run serve:autostart», sudo) is caught: bang, sudo, terminal', () => {
  const acts = g.actsIn(MORNING)
  for (const k of ['bang', 'sudo', 'terminal']) assert.ok(acts.includes(k), `missing ${k}: ${acts}`)
})
t('without a window in the turn it is refused — negative control of the whole guard', () => {
  const turn = g.turnOf([user('отчёт внешнего агента'), ran('npm run serve:status'), result(), said(MORNING)])
  assert.equal(g.verdict(MORNING, turn).pass, false)
})
t('with npm run ask-person in the same turn it passes', () => {
  const turn = g.turnOf([user('отчёт'), ran('npm run ask-person -- "Включите автозапуск" --copy "npm run serve:autostart"'), result(), said(MORNING)])
  assert.deepEqual([g.verdict(MORNING, turn).pass, g.verdict(MORNING, turn).why], [true, 'window'])
})
t('a window put in an EARLIER turn does not count (the turn starts at the last prompt)', () => {
  const turn = g.turnOf([user('раньше'), ran('npm run ask-person -- "x"'), result(), said('ок'), user('теперь'), said(MORNING)])
  assert.equal(turn.asks, 0)
  assert.equal(g.verdict(MORNING, turn).pass, false)
})
t('ask-person list / drop / done is not a window', () => {
  const turn = g.turnOf([user('x'), ran('npm run ask-person -- list'), ran('npm run ask-person -- drop ab12cd34'), said(MORNING)])
  assert.equal(turn.asks, 0)
})
t('a conscious deviation «⟦без окна: …⟧» passes and carries its reason', () => {
  const text = `${MORNING}\n⟦без окна: панель недоступна, ядро лежит, окно некуда поставить⟧`
  const v = g.verdict(text, g.turnOf([user('x'), said(text)]))
  assert.deepEqual([v.pass, v.why], [true, 'deviation'])
  assert.match(v.deviation, /ядро лежит/)
})
t('a deviation without a reason (shorter than 8 characters) does not pass', () => {
  const text = `${MORNING}\n⟦без окна: нет⟧`
  assert.equal(g.verdict(text, g.turnOf([user('x'), said(text)])).pass, false)
})
t('asking for a key, a token, a password in words is caught (ru and en)', () => {
  for (const s of ['Пришли мне ключ OpenAI сюда', 'Введите пароль от сервера', 'Скопируй токен бота и вставь его', 'Please paste your API key here', 'Send me the bot token']) {
    assert.ok(g.actsIn(s).includes('secret'), s)
  }
})
t('/mcp for the terminal is caught; an address that ends in /mcp is not', () => {
  assert.ok(g.actsIn('В терминале введи /mcp и переподключи telegram').includes('slash'))
  assert.deepEqual(g.actsIn('Сервер отвечает на https://example.com/mcp'), [])
})
t('ordinary answers pass: a command named as the node\'s own, sudo mentioned in words, «!» in a sentence', () => {
  for (const s of [
    'Я запустил `npm run serve:status`: ядро отвечает 200.',
    'Команда только печатает строку с sudo, её никто не выполнил.',
    'Готово! Бот снова слушает.',
    'Узел вводит ключ сам, тебе ничего делать не нужно.',
    'Пароль вводит член семьи при включении Mac — это FileVault.',
  ]) assert.deepEqual(g.actsIn(s), [], s)
})
t('the turn reads only the assistant\'s text, never a tool\'s input or a thinking block', () => {
  const turn = g.turnOf([user('x'), { type: 'assistant', message: { content: [{ type: 'thinking', thinking: '! npm run x' }, { type: 'tool_use', name: 'Write', input: { content: '! sudo rm' } }] } }, said('Готово.')])
  assert.deepEqual(turn.texts, ['Готово.'])
  assert.equal(g.verdict(turn.texts.join('\n'), turn).pass, true)
})
t('a node line in the prompt opens a new turn too; a meta line does not', () => {
  const turn = g.turnOf([user('x'), ran('npm run ask-person -- "a"'), { type: 'user', isMeta: true, message: { content: 'meta' } }, said(MORNING)])
  assert.equal(turn.asks, 1)
})
t('a placeholder or a too short reason is not a deviation («: причина», «<why>») — replay of 2026-11-18', () => {
  assert.equal(g.deviationIn('строка «⟦без окна: причина⟧» записывается'), null)
  assert.equal(g.deviationIn('⟦без окна: <why>⟧'), null)
  assert.equal(g.deviationIn('«⟦без окна: …⟧»'), null)
})
t('two code spans side by side are not one command («`sudo`, `/mcp`» names, it does not ask)', () => {
  assert.ok(!g.actsIn('Ответ с `!`-командой, `sudo`, `/mcp` не проходит').includes('sudo'))
  assert.ok(g.actsIn('выполни `sudo launchctl load x`').includes('sudo'))
})
t('the refusal names the way (ask-person, --copy, the deviation line)', () => {
  const r = g.refusal(['bang', 'sudo'], 'answer')
  for (const s of ['npm run ask-person', '--copy', '⟦без окна:']) assert.ok(r.includes(s), s)
})

console.log(`window-guard: ${passed} passed${process.exitCode ? ', FAILED' : ''}`)

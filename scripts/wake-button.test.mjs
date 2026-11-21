// Node step 829: the effort button that turns a sleeping element's agent on. ✗ 2026-11-21 16:25, the new element j58fl (the owner:
// «что бы я не нажимал на секунду выскакивает слово загрузка»): the start waited for the channel and the paste for two minutes while the
// question kept its buttons (once the session runs, its plugin reads the bot and drops them), then said «включён» although the person's
// message never reached the agent. `npm run test:wake-button`.
import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const KIT = join(ROOT, 'app', '[lang]', '(architectLayer)', 'architect', 'kits', '_agent-kit', 'core', 'server', 'telegram.cjs')
const tmp = mkdtempSync(join(tmpdir(), 'wake-button-'))
const put = (p, text) => { mkdirSync(dirname(join(tmp, p)), { recursive: true }); writeFileSync(join(tmp, p), text) }
const EL = 'el829'
put(`data/services/${EL}/channel/telegram/access.json`, JSON.stringify({ allowFrom: ['111'] }))
put(`data/services/${EL}/channel/telegram/person.json`, JSON.stringify({ lang: 'ru' }))
process.chdir(tmp) // the kit reads the node's root from the working folder at load
const telegram = createRequire(import.meta.url)(KIT)

let passed = 0
const t = async (name, fn) => { try { await fn(); passed++; console.log(`  ✓ ${name}`) } catch (e) { process.exitCode = 1; console.log(`  ✗ ${name}\n    ${e.message}`) } }

/** A fake Bot API: every call recorded in order, with the moment the starter ran among them. */
const calls = []
globalThis.fetch = async (url, init) => {
  const method = String(url).split('/').pop()
  calls.push({ method, body: JSON.parse(init?.body ?? '{}') })
  return { json: async () => ({ ok: true, result: { message_id: 900 + calls.length } }) }
}
/** Every text the bot put into a chat (a new message, not an edit of the question). */
const said = () => calls.filter((c) => c.body?.chat_id && typeof c.body.text === 'string' && !c.method.startsWith('edit')).map((c) => c.body.text).join('\n')
const pending = (id) => put(`data/services/${EL}/wake/pending.json`, JSON.stringify({ id, createdAt: new Date().toISOString(), items: [{ kind: 'human', text: 'Привет как дела', from: '', about: '', declineUrl: '', at: new Date().toISOString() }], asked: [{ chat: '111', messageId: 77 }] }))
const press = (id, data) => telegram.onButton(EL, 'TOKEN', { id: 'q1', from: { id: 111 }, data: `wake:${id}:${data}` })

await t('829: the buttons leave the question at the press — before the agent is started, not minutes later', async () => {
  calls.length = 0
  pending('aa11')
  telegram.setStarter(async () => {
    calls.push({ method: '(starter)' })
    return { ok: true, model: 'opus', effort: 'high', channelReady: async () => ({ up: true, seconds: 7, pasted: true }) }
  })
  await press('aa11', 'fx:high')
  const order = calls.map((c) => c.method)
  const off = order.indexOf('editMessageReplyMarkup')
  assert.ok(off >= 0 && off < order.indexOf('(starter)'), order.join(' → '))
  assert.deepEqual(calls[off].body.reply_markup, { inline_keyboard: [] })
  const text = said()
  assert.match(text, /включён и получил ваше сообщение/)
})

await t('829: the message did not reach the agent (pasted false) — the bot says so and asks to write again, never «получил»', async () => {
  calls.length = 0
  pending('bb22')
  telegram.setStarter(async () => ({ ok: true, model: 'opus', effort: 'high', channelReady: async () => ({ up: true, seconds: 7, pasted: false }) }))
  await press('bb22', 'fx:high')
  const text = said()
  assert.match(text, /не дошло/)
  assert.match(text, /Напишите ещё раз/)
  assert.doesNotMatch(text, /получил ваше сообщение/)
})

await t('829 negative: the agent turned on with no message waiting — plain «включён — пишите ему», no false alarm', async () => {
  calls.length = 0
  put(`data/services/${EL}/wake/pending.json`, JSON.stringify({ id: 'cc33', createdAt: new Date().toISOString(), items: [], asked: [{ chat: '111', messageId: 78 }] }))
  telegram.setStarter(async () => ({ ok: true, model: 'opus', effort: 'high', channelReady: async () => ({ up: true, seconds: 7 }) }))
  await press('cc33', 'fx:high')
  const text = said()
  assert.match(text, /включён — пишите ему/)
  assert.doesNotMatch(text, /не дошло/)
})

await t('829 negative: a failed start puts the buttons back (the person can press again)', async () => {
  calls.length = 0
  pending('dd44')
  telegram.setStarter(async () => ({ ok: false, reason: 'busy' }))
  await press('dd44', 'fx:high')
  const back = calls.filter((c) => c.method === 'editMessageText').at(-1)
  assert.ok(back?.body.reply_markup?.inline_keyboard?.length > 0, 'the question has its buttons again')
})

process.chdir(ROOT)
rmSync(tmp, { recursive: true, force: true })
console.log(process.exitCode ? `===WAKE_BUTTON_FAILED=== ${passed} passed` : `===WAKE_BUTTON_OK=== ${passed} passed`)
process.exit()

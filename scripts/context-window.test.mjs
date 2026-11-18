// Node step 788: the context window — one reading for the CLI and the Telegram Pult, and the gauge's colour (the owner, 2026-11-18:
// «максимально красный цвет достигается на отметке 75% … дальше … тёмно бордовым»). No model, no network.
import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const req = createRequire(import.meta.url)
const { contextColor } = req(join(ROOT, 'lib', 'node', 'tg-app', 'context-color.cjs'))
const cw = req(join(ROOT, 'lib', 'agent-kit', 'context-window.cjs'))
const page = req(join(ROOT, 'lib', 'node', 'tg-app', 'page.cjs'))
let passed = 0
const t = (name, fn) => { try { fn(); passed++; console.log(`  ✓ ${name}`) } catch (e) { process.exitCode = 1; console.log(`  ✗ ${name}\n    ${e.message}`) } }
const hue = (c) => Number(/^hsl\((\d+)/.exec(c)?.[1])

t('the colour walks from green toward red and is the brightest red exactly at 75 %', () => {
  assert.equal(hue(contextColor(0)), 140)
  assert.ok(hue(contextColor(10)) < 140 && hue(contextColor(10)) > hue(contextColor(50)), 'redder as it fills')
  assert.equal(hue(contextColor(74)), 2)
  assert.equal(contextColor(75), 'hsl(0, 72%, 42%)')
})
t('past 75 % — dark bordeaux, the same for every value above (negative: never the bright red)', () => {
  for (const p of [76, 80, 100, 140]) assert.equal(contextColor(p), '#6e0b1e')
  assert.notEqual(contextColor(76), contextColor(75))
})
t('nonsense in — the calm start, never a thrown error', () => {
  for (const p of [undefined, null, 'x', -5, NaN]) assert.equal(contextColor(p), 'hsl(140, 72%, 48%)')
})
t('the page inlines the very same function (one source)', () => {
  const html = page.html('ru')
  assert.ok(html.includes(contextColor.toString()), 'the page carries context-color.cjs as it is')
  assert.ok(html.includes("data-block','tg-app-context"), 'the gauge has its data-block')
})

// The reading: a journal folder in a scratch home, as Claude Code writes it.
const home = mkdtempSync(join(tmpdir(), 'ctx-'))
const folder = '/work/node'
const dir = join(home, 'projects', folder.replace(/[:\\/]/g, '-'))
mkdirSync(dir, { recursive: true })
const line = (o) => JSON.stringify(o)
writeFileSync(join(dir, 'aaaa1111.jsonl'), [
  line({ type: 'user', message: { content: 'hi' } }),
  line({ type: 'assistant', timestamp: '2026-11-18T13:00:00Z', message: { model: 'claude-opus-5-5', usage: { input_tokens: 10, cache_creation_input_tokens: 90, cache_read_input_tokens: 249_900, output_tokens: 0 } } }),
  'not json',
].join('\n'))

t('the newest assistant answer gives used, window, percent (250 000 of 1 000 000 = 25 %)', () => {
  const c = cw.read(folder, { ownConfigDir: home })
  assert.deepEqual({ used: c.used, window: c.window, percent: c.percent, model: c.model }, { used: 250_000, window: 1_000_000, percent: 25, model: 'claude-opus-5-5' })
})
t('an unknown model — the used tokens, the window and percent null (never a guessed number)', () => {
  writeFileSync(join(dir, 'aaaa1111.jsonl'), line({ type: 'assistant', message: { model: 'some-other', usage: { input_tokens: 5 } } }))
  const c = cw.read(folder, { ownConfigDir: home })
  assert.equal(c.used, 5); assert.equal(c.window, null); assert.equal(c.percent, null)
})
t('no journal folder or no answer yet — null (negative)', () => {
  assert.equal(cw.read('/nowhere/at/all', { ownConfigDir: home }), null)
  writeFileSync(join(dir, 'aaaa1111.jsonl'), line({ type: 'user', message: { content: 'only a question' } }))
  assert.equal(cw.read(folder, { ownConfigDir: home }), null)
})
rmSync(home, { recursive: true, force: true })

console.log(process.exitCode ? '===CONTEXT_WINDOW_FAILED===' : `===CONTEXT_WINDOW_OK=== ${passed} passed`)

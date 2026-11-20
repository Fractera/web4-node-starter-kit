// THE UPDATE BANNER, STATE BY STATE (node step 815-7). `node scripts/update-banner.test.mjs`, in the prebuild.
// The owner, 2026-11-20 (Telegram 237): «до сих пор горит кнопка синхронизировать Fork почему я давно синхронизировал, горит кнопка
// обновить сборку ядра? Почему я же нажал её». Proves `bannerView` (`lib/deploy/update-banner.mjs`) — what the banner draws — and that the
// banner's island takes it, starts the update by itself and has no link to the deployments tab left.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { bannerView } from '../lib/deploy/update-banner.mjs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
let passed = 0
let failed = 0
function t(name, fn) {
  try { fn(); passed++; console.log(`  ✓ ${name}`) } catch (e) { failed++; console.log(`  ✗ ${name}\n    ${String(e.message ?? e).split('\n').join('\n    ')}`) }
}
const body = (over = {}) => ({ fork: true, behindBy: 0, nodeBehind: 0, repo: 'https://github.com/x/web4-node-starter-kit', update: null, ...over })

console.log('815 the update banner')
t('1 synced fork, node behind → one action «update», no «sync»', () => {
  const v = bannerView(body({ nodeBehind: 16 }))
  assert.deepEqual([v.kind, v.rebuild, v.sync], ['nodeBehind', 'on', false])
})
t('2 the press → «starting» until the node says running; running → no update button, no sync, no check', () => {
  assert.equal(bannerView(body({ nodeBehind: 16 }), { starting: true }).rebuild, 'starting')
  const v = bannerView(body({ nodeBehind: 16, update: { state: 'running', stage: 'guards' } }), { starting: true })
  assert.deepEqual([v.kind, v.rebuild, v.sync, v.check], ['running', 'none', false, false])
})
t('3 another page while it runs → still «running» (the state, not the page, decides)', () => {
  assert.equal(bannerView(body({ nodeBehind: 0, update: { state: 'running', stage: 'core' } })).kind, 'running')
})
t('4 a refusal → its kind, and the update button is back', () => {
  const v = bannerView(body({ nodeBehind: 16, update: { state: 'refused', reason: 'идёт развёртывание элемента' } }))
  assert.deepEqual([v.kind, v.rebuild], ['refused', 'on'])
})
t('5 fork behind Fractera → «sync» is there, the update locked', () => {
  const v = bannerView(body({ behindBy: 3, nodeBehind: 0 }))
  assert.deepEqual([v.kind, v.sync, v.rebuild], ['forkBehind', true, 'off'])
})
t('6 negative: nothing to take → the update button is locked, never «on»', () => {
  const v = bannerView(body())
  assert.deepEqual([v.kind, v.rebuild], ['even', 'off'])
  assert.equal(bannerView(body(), { evenHidden: true }), null)
  assert.equal(bannerView({ ...body(), fork: false }), null)
})
t('done after an update → shown until hidden; hidden → the quiet «even» line', () => {
  assert.equal(bannerView(body({ update: { state: 'done', changes: 16 } })).kind, 'done')
  assert.equal(bannerView(body({ update: { state: 'done', changes: 16 } }), { doneHidden: true }).kind, 'even')
})

const island = readFileSync(join(ROOT, 'components/node-state/origin-notice.client.tsx'), 'utf8')
const card = readFileSync(join(ROOT, 'components/deploy/core-deploy.client.tsx'), 'utf8')
t('the banner draws from bannerView and starts the update itself (POST update), no link to the deployments tab', () => {
  assert.match(island, /bannerView\(/)
  assert.match(island, /action: "update"/)
  assert.doesNotMatch(island, /build\/deployments/)
})
t('7 the board dialog: «Развернуть» locks with a spinner at the press', () => {
  assert.match(card, /disabled=\{starting\}/)
  assert.match(card, /<Spinner/)
})

const door = readFileSync(join(ROOT, 'app/api/node/deploy/route.ts'), 'utf8')
const codeState = readFileSync(join(ROOT, 'lib/web4-items/element-code-state.ts'), 'utf8')
t('815-8 the deployments door reads the elements without freezing the core: async git, all at once (negative: no sync call left)', () => {
  assert.match(door, /await elementCodeStateAsync\(dir\)/)
  assert.match(door, /Promise\.all\(/)
  assert.doesNotMatch(door, /[^.\w]elementCodeState\(/)
  assert.match(codeState, /export async function elementCodeStateAsync[\s\S]*gitAsync\(dir/)
})
t('815-6 the update door starts without spawnSync and keeps one trial merge per target', () => {
  const upd = readFileSync(join(ROOT, 'app/api/node/update/route.ts'), 'utf8')
  assert.doesNotMatch(upd, /spawnSync\(|import \{[^}]*spawnSync/)
  assert.match(upd, /verdict\.pending \?\?= runPreflight\(\)/)
})

if (failed) { console.log(`===UPDATE_BANNER_FAILED=== ${failed} failed, ${passed} passed`); process.exit(1) }
console.log(`===UPDATE_BANNER_OK=== ${passed} passed`)

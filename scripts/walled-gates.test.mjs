// 839-6/839-7: a walled element on a server — its bot reads its sign-in by the files' existence (never `claude auth status` as the node), and
// its own gates (boundary, interface skills, parts map, the design start) go through the hook relay, the core running them with the
// caller's folder and data. The boundary gate CLOSES when it cannot decide (exit 2), every other relayed hook ends quietly.
// Negatives: a gate without the caller's folder is refused, an unknown name never runs, a relay with no core answer holds a boundary call.
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const ROOT = process.cwd()
const run = require('../lib/agent-kit/hook-relay-run.cjs')
let n = 0
const t = (name, fn) => { fn(); n++; console.log(`  ✓ ${name}`) }

t('the boundary gate runs with the caller\'s own folder and data, and is a gate', () => {
  const p = run.planOf('/n', 'boundary', 'shop', null, '/n/WEB4-ITEMS/user/shop')
  assert.equal(p.script, join('/n', 'scripts', 'element-boundary-hook.mjs'))
  assert.deepEqual(p.args, ['--dir', '/n/WEB4-ITEMS/user/shop', '--data', join('/n', 'data', 'services', 'shop'), '--root', '/n'])
  assert.equal(p.gate, true)
})
t('negative: the boundary gate without the caller\'s folder is refused', () => assert.equal(run.planOf('/n', 'boundary', 'shop', null, null), null))
t('the interface gates map to the core\'s hooks, and are not gates', () => {
  assert.equal(run.planOf('/n', 'shadcn-skills', 'shop').script, join('/n', '.claude', 'hooks', 'shadcn-skills.mjs'))
  assert.equal(run.planOf('/n', 'parts-gate', 'shop').script, join('/n', '.claude', 'hooks', 'parts-gate.mjs'))
  assert.equal(run.planOf('/n', 'design-start', 'shop').script, join('/n', '.claude', 'hooks', 'interface-design-start.mjs'))
  assert.ok(!run.planOf('/n', 'shadcn-skills', 'shop').gate)
  for (const k of ['boundary', 'shadcn-skills', 'parts-gate', 'design-start']) assert.ok(run.NAMES.includes(k), k)
})
t('negative: an unknown name never runs', () => assert.equal(run.planOf('/n', 'element-boundary-hook.mjs', 'shop'), null))
t('the relay with no core answer: a boundary call is held (exit 2), any other hook ends quietly (exit 0)', () => {
  const env = { ...process.env, FRACTERA_HOOK_KEY: '', FRACTERA_CORE_PORT: '' }
  const g = spawnSync(process.execPath, [join(ROOT, 'lib', 'agent-kit', 'hook-relay.cjs'), 'boundary'], { input: '{}', env, encoding: 'utf8' })
  assert.equal(g.status, 2); assert.match(g.stderr, /boundary gate/)
  const o = spawnSync(process.execPath, [join(ROOT, 'lib', 'agent-kit', 'hook-relay.cjs'), 'shadcn-skills'], { input: '{}', env, encoding: 'utf8' })
  assert.equal(o.status, 0)
})
t('element-isolate: a walled element\'s gates are the relay, a home computer keeps the scripts; old entries of both forms are replaced', () => {
  const s = readFileSync(join(ROOT, 'scripts', 'element-isolate.mjs'), 'utf8')
  assert.match(s, /walledEl \? viaRelay\('boundary'\)/)
  assert.match(s, /walledEl \? viaRelay\('shadcn-skills'\)/)
  assert.match(s, /walledEl \? viaRelay\('parts-gate'\)/)
  assert.match(s, /walledEl \? viaRelay\('design-start'\)/)
  assert.match(s, /hook-relay\\\.cjs"\? boundary/)
})
t('the bot: an own-only element\'s sign-in is the files\' existence (claude-account via mount), never `claude auth status` as the node', () => {
  const tg = readFileSync(join(ROOT, 'app', '[lang]', '(architectLayer)', 'architect', 'kits', '_agent-kit', 'core', 'server', 'telegram.cjs'), 'utf8')
  assert.match(tg, /ca\.ownOnly\(process\.cwd\(\), service\)\) return Promise\.resolve\(ca\.ownSignedIn\(process\.cwd\(\), service\)\)/)
  assert.match(readFileSync(join(ROOT, 'lib', 'agent-kit', 'mount.cjs'), 'utf8'), /globalThis\.__web4ClaudeAccount = require/)
})
console.log(`===WALLED_GATES_OK=== ${n} passed`)

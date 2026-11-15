// TESTS OF REMOVING THE NODE FROM THIS COMPUTER (node step 746-1). `npm run test:node-remove`, in the prebuild.
// A REAL removal of a scratch node folder in the temp folder: the stage copy runs outside, deletes the folder and this node's journals,
// leaves the report. Each refusal has its control: the same call with the one fact changed must go through.
// The scratch node's `scripts/serve.mjs` is a stand-in that only leaves a mark — the real pm2 removal is 371-3's, proven there.
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { writePlaceRecord } from '../lib/hosting/place.mjs'
import { journalName } from './node-remove.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
let passed = 0
const t = async (name, fn) => {
  try { await fn(); passed += 1; console.log(`  ✓ ${name}`) } catch (e) { console.error(`  ✗ ${name}\n    ${e.message}`); process.exitCode = 1 }
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const scratch = mkdtempSync(path.join(os.tmpdir(), 'node-remove-test-'))
const home = path.join(scratch, 'home')
const projects = path.join(home, '.claude', 'projects')

function makeNode(name, place = 'home', serveExit = 0) {
  const root = path.join(scratch, name)
  mkdirSync(path.join(root, 'scripts'), { recursive: true })
  mkdirSync(path.join(root, 'data', 'main-agent'), { recursive: true })
  writeFileSync(path.join(root, 'package.json'), '{}\n')
  writeFileSync(path.join(root, 'data', 'main-agent', 'CLAUDE.user.md'), 'the person\'s own words\n')
  writeFileSync(path.join(root, 'scripts', 'serve.mjs'),
    `import { writeFileSync } from 'node:fs'\nwriteFileSync(${JSON.stringify(path.join(scratch, `serve-${name}.mark`))}, process.argv.slice(2).join(' '))\nprocess.exit(${serveExit})\n`)
  writePlaceRecord(root, place, place === 'home' ? 'launch' : 'dedicated-server')
  for (const j of [journalName(root), `${journalName(root)}-WEB4-ITEMS-user-root`, `${journalName(root)}-2`]) mkdirSync(path.join(projects, j), { recursive: true })
  return root
}
const run = (root, ...args) => spawnSync(process.execPath, [path.join(here, 'node-remove.mjs'), '--root', root, ...args], {
  encoding: 'utf8', env: { ...process.env, FRACTERA_REMOVE_HOME: home, FRACTERA_REMOVE_WAIT_MS: '0' },
})
const until = async (fn, ms = 20_000) => { const end = Date.now() + ms; while (Date.now() < end) { if (fn()) return true; await sleep(200) } return false }
const reports = () => (existsSync(home) ? readdirSync(home).filter((f) => f.startsWith('Fractera-removed-')) : [])

console.log('746-1 removing the node from this computer')
await t('the preview changes nothing and names the folder, its journals (not the neighbour «-2»), and is allowed at home', () => {
  const root = makeNode('preview-node')
  const r = run(root)
  assert.equal(r.status, 0, r.stderr)
  const p = JSON.parse(r.stdout)
  assert.equal(p.ok, true)
  assert.equal(p.name, 'preview-node')
  assert.deepEqual(p.journals.map((j) => path.basename(j)).sort(), [journalName(root), `${journalName(root)}-WEB4-ITEMS-user-root`].sort())
  assert.ok(existsSync(root))
})
await t('a wrong name refuses and nothing moves; negative control: the folder\'s own name goes through (next test)', () => {
  const root = makeNode('wrong-name-node')
  for (const confirm of ['', 'wrong-name', 'Wrong-Name-Node', 'wrong-name-nod']) {
    const r = run(root, '--yes', '--confirm', confirm)
    assert.equal(r.status, 1, `«${confirm}» must refuse`)
    assert.equal(JSON.parse(r.stdout).error, 'name')
  }
  assert.ok(existsSync(path.join(root, 'package.json')))
})
await t('on a server the removal is refused even with the right name; the preview says why', () => {
  const root = makeNode('server-node', 'server')
  const r = run(root, '--yes', '--confirm', 'server-node')
  assert.equal(r.status, 1)
  assert.equal(JSON.parse(r.stdout).error, 'server')
  assert.equal(JSON.parse(run(root).stdout).refused, 'server')
  assert.ok(existsSync(path.join(root, 'package.json')))
})
await t('the right name at home: processes first, then the folder and this node\'s journals are gone, the neighbour\'s stays, a report is left', async () => {
  const root = makeNode('real-node')
  const before = reports().length
  const r = run(root, '--yes', '--confirm', 'real-node')
  assert.equal(r.status, 0, r.stdout + r.stderr)
  assert.ok(await until(() => !existsSync(root)), 'the folder is still there after 20 s')
  assert.equal(readFileSync(path.join(scratch, 'serve-real-node.mark'), 'utf8'), 'remove --yes')
  assert.ok(!existsSync(path.join(projects, journalName(root))))
  assert.ok(!existsSync(path.join(projects, `${journalName(root)}-WEB4-ITEMS-user-root`)))
  assert.ok(existsSync(path.join(projects, `${journalName(root)}-2`)), 'a neighbour folder\'s journal was deleted')
  assert.ok(await until(() => reports().length > before), 'no report')
})
await t('the processes did not go → nothing is deleted, the report says it stopped', async () => {
  const root = makeNode('stuck-node', 'home', 1)
  const before = new Set(reports())
  const r = run(root, '--yes', '--confirm', 'stuck-node')
  assert.equal(r.status, 0)
  assert.ok(await until(() => reports().some((f) => !before.has(f))), 'no report')
  const text = readFileSync(path.join(home, reports().find((f) => !before.has(f))), 'utf8')
  assert.match(text, /Stopped/)
  assert.ok(existsSync(path.join(root, 'data', 'main-agent', 'CLAUDE.user.md')))
  assert.ok(existsSync(path.join(projects, journalName(root))))
})

rmSync(scratch, { recursive: true, force: true })
console.log(process.exitCode ? 'node-remove: FAILED' : `node-remove: ${passed} passed`)

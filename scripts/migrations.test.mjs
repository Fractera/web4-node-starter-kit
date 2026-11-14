// TEST OF THE MIGRATION LEDGER (node step 743-3, `lib/deploy/migrations.mjs`): applied once, skipped after, a failure recorded and tried
// again, a broken contract refused, a broken ledger set aside; and the real migrations on a throwaway node folder.
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { ledgerFile, readLedger, runMigrations } from '../lib/deploy/migrations.mjs'

let passed = 0
const roots = []
const t = async (name, fn) => { await fn(); passed += 1; console.log(`  ✓ ${name}`) }
const quiet = { log: () => {} }

try {
  const base = mkdtempSync(join(tmpdir(), 'migrations-'))
  roots.push(base)
  const root = join(base, 'node')
  const dir = join(base, 'migrations')
  mkdirSync(root); mkdirSync(dir)
  spawnSync('git', ['init', '-q', root])
  const file = (name, body) => writeFileSync(join(dir, name), body)
  file('1-a.mjs', `import { writeFileSync } from 'node:fs'\nimport { join } from 'node:path'\nexport const id = '1-a'\nexport const why = 'w'\nexport const wraps = []\nexport function run(root) { writeFileSync(join(root, 'a.txt'), String(Date.now())); return { done: true, note: 'a written' } }\n`)
  file('2-b.mjs', `import { existsSync } from 'node:fs'\nimport { join } from 'node:path'\nexport const id = '2-b'\nexport const why = 'w'\nexport const wraps = []\nexport function run(root) { return existsSync(join(root, 'ready')) ? { done: true, note: 'b' } : { done: false, reason: 'not ready yet' } }\n`)
  file('3-c.mjs', `export const id = 'something-else'\nexport const why = 'w'\nexport const wraps = []\nexport function run() { return { done: true } }\n`)

  await t('first run: a done, b failed with its reason, c refused for its contract — each recorded once', async () => {
    const r = await runMigrations(root, 'test', { dir, ...quiet })
    assert.deepEqual(r.applied, ['1-a']); assert.deepEqual(r.failed, ['2-b', '3-c'])
    const l = readLedger(root)
    assert.equal(l.applied.find((a) => a.id === '2-b').note, 'not ready yet')
    assert.match(l.applied.find((a) => a.id === '3-c').note, /contract/)
  })
  await t('second run: a is skipped (its file untouched), the failed ones are tried again and still one entry each', async () => {
    const before = readFileSync(join(root, 'a.txt'), 'utf8')
    const r = await runMigrations(root, 'test', { dir, ...quiet })
    assert.equal(r.skipped, 1); assert.equal(readFileSync(join(root, 'a.txt'), 'utf8'), before)
    assert.equal(readLedger(root).applied.filter((a) => a.id === '2-b').length, 1)
  })
  await t('b becomes possible → done at the next entry point; c fixed → done', async () => {
    writeFileSync(join(root, 'ready'), '1')
    file('3-c.mjs', `export const id = '3-c'\nexport const why = 'w'\nexport const wraps = []\nexport function run() { return { done: true, note: 'c' } }\n`)
    // a fixed migration arrives with a new version, in a new process (ESM caches a loaded file for the life of a process)
    const runner = new URL('../lib/deploy/migrations.mjs', import.meta.url).href
    const c = spawnSync(process.execPath, ['--input-type=module', '-e', `const { runMigrations } = await import(${JSON.stringify(runner)}); const r = await runMigrations(${JSON.stringify(root)}, 'test', { dir: ${JSON.stringify(dir)}, log: () => {} }); console.log(JSON.stringify(r))`], { encoding: 'utf8' })
    assert.deepEqual(JSON.parse(c.stdout).applied, ['2-b', '3-c'], c.stderr)
  })
  await t('nothing to do → the ledger stays byte-equal', async () => {
    const before = readFileSync(ledgerFile(root), 'utf8')
    const r = await runMigrations(root, 'test', { dir, ...quiet })
    assert.equal(r.skipped, 3); assert.equal(readFileSync(ledgerFile(root), 'utf8'), before)
  })
  await t('a broken ledger is set aside, never trusted — the idempotent migrations run again', async () => {
    writeFileSync(ledgerFile(root), '{ broken')
    const r = await runMigrations(root, 'test', { dir, ...quiet })
    // every migration runs again (3-c's fixed file is a new process's business — this process still holds its first load)
    assert.equal(r.applied.length + r.failed.length, 3); assert.ok(r.applied.includes('1-a') && r.applied.includes('2-b'))
    assert.ok(readdirSync(join(root, 'data', 'node')).some((f) => f.startsWith('migrations.json.broken-')))
  })
  await t('the real migrations on a throwaway node folder: all done, recorded with the entry point', async () => {
    const real = join(base, 'real')
    mkdirSync(real); spawnSync('git', ['init', '-q', real])
    // 744-3, D45: a node that launched a server before 744-3 keeps its persistent key — the migration deletes both files, keeps the pins
    mkdirSync(join(real, 'data', 'node', 'server'), { recursive: true })
    for (const f of ['id_ed25519', 'id_ed25519.pub', 'known-hosts.json']) writeFileSync(join(real, 'data', 'node', 'server', f), f === 'id_ed25519' ? '-----BEGIN OPENSSH PRIVATE KEY-----\n' : '{}\n')
    const r = await runMigrations(real, 'install', quiet)
    assert.ok(r.applied.includes('741-2-place-record') && r.applied.includes('743-1-repo-identity') && r.applied.includes('744-3-retire-node-key'), JSON.stringify(r))
    assert.equal(r.failed.length, 0)
    assert.deepEqual(readdirSync(join(real, 'data', 'node', 'server')), ['known-hosts.json'], 'the key gone, the pins kept')
    assert.ok(existsSync(join(real, 'data', 'node', 'place.json')))
    assert.ok(readLedger(real).applied.every((a) => a.by === 'install'))
  })
} finally {
  for (const r of roots) rmSync(r, { recursive: true, force: true })
}
console.log(`${passed} passed`)

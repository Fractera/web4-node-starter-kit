// TESTS OF THE SERVER'S OWN REPOSITORY (node step 808). `node scripts/server-repo.test.mjs`, in the prebuild.
// The owner, 2026-11-20 (Telegram 37): the default «the same repository»; the second mode — the person's own fork, checked by «Проверить».
// The law of 368 (`scripts/check-origin.mjs`): only a DIRECT fork of the original — the original itself and a fork of a fork are refused.
// Each yes has its negative control; GitHub is played by a stub, never asked.
import assert from 'node:assert/strict'
import { forkCheck, nextRepo, readRepo, repoUrl } from '../lib/hosting/server-repo.mjs'

let passed = 0
const t = async (name, fn) => {
  try { await fn(); passed += 1; console.log(`  ✓ ${name}`) } catch (e) { console.error(`  ✗ ${name}\n    ${e.message}`); process.exitCode = 1 }
}
const SAME = 'https://github.com/aifa-agi/web4-node-starter-kit.git'
const github = (repo, status = 200) => async () => ({ ok: status === 200, status, json: async () => repo })
const fork = (full, parent = 'Fractera/web4-node-starter-kit') => ({ full_name: full, fork: true, parent: { full_name: parent } })

console.log('808 the server\'s own repository')
await t('an address however typed becomes the one shape launch.sh accepts; negative: not GitHub, no repository', () => {
  for (const u of ['https://github.com/Person/web4-node-starter-kit', 'github.com/Person/web4-node-starter-kit/', 'https://www.github.com/Person/web4-node-starter-kit.git'])
    assert.equal(repoUrl(u), 'https://github.com/Person/web4-node-starter-kit.git', u)
  for (const u of ['', 'https://gitlab.com/a/b', 'https://github.com/person', 'https://github.com/a/b/tree/main', 'https://github.com/a/..'])
    assert.equal(repoUrl(u), null, u)
})
await t('a direct fork of the original → yes with GitHub\'s own name', async () => {
  assert.deepEqual(await forkCheck('github.com/person/my-node', github(fork('Person/my-node'))), { ok: true, url: 'https://github.com/Person/my-node.git', name: 'Person/my-node' })
})
await t('negative (law 368): the original itself, a fork of a fork, not a fork — each with its reason', async () => {
  assert.equal((await forkCheck('https://github.com/Fractera/web4-node-starter-kit', github(null))).reason, 'original')
  assert.equal((await forkCheck('https://github.com/x/renamed', github({ full_name: 'Fractera/web4-node-starter-kit', fork: false }))).reason, 'original')
  assert.deepEqual(await forkCheck('https://github.com/b/k', github(fork('b/k', 'aifa-agi/web4-node-starter-kit'))), { ok: false, reason: 'fork-of-fork', parent: 'aifa-agi/web4-node-starter-kit' })
  assert.equal((await forkCheck('https://github.com/c/own', github({ full_name: 'c/own', fork: false }))).reason, 'not-fork')
})
await t('GitHub\'s silence is never a yes: 404, a limit, an error, no network', async () => {
  assert.equal((await forkCheck('https://github.com/a/b', github(null, 404))).reason, 'not-found')
  assert.equal((await forkCheck('https://github.com/a/b', github(null, 403))).reason, 'github-limit')
  assert.equal((await forkCheck('https://github.com/a/b', github(null, 500))).reason, 'github-silent')
  assert.equal((await forkCheck('https://github.com/a/b', async () => { throw new Error('offline') })).reason, 'github-silent')
  assert.equal((await forkCheck('not an address', github(null))).reason, 'bad-url')
})
await t('the record: none → «same», this node\'s fork; «own» has no fork until GitHub\'s yes; negative: a kept bad address is no fork', () => {
  assert.deepEqual(readRepo('', SAME), { mode: 'same', url: SAME, account: false, fork: false, checkedAt: null })
  assert.equal(readRepo('{broken', SAME).url, SAME)
  const own = readRepo(JSON.stringify(nextRepo(readRepo('', SAME), { op: 'own' })), SAME)
  assert.deepEqual([own.mode, own.url, own.account, own.fork], ['own', null, false, false])
  const acc = readRepo(JSON.stringify(nextRepo(own, { op: 'account' })), SAME)
  const fk = readRepo(JSON.stringify(nextRepo(acc, { op: 'fork' })), SAME)
  assert.deepEqual([acc.account, acc.fork, fk.account, fk.fork], [true, false, true, true])
  const done = readRepo(JSON.stringify(nextRepo(fk, { op: 'url', url: 'https://github.com/p/n.git', at: '2026-11-20T10:00:00Z' })), SAME)
  assert.deepEqual([done.url, done.checkedAt], ['https://github.com/p/n.git', '2026-11-20T10:00:00Z'])
  assert.equal(readRepo(JSON.stringify({ mode: 'own', url: 'https://evil.example/x' }), SAME).url, null)
  assert.equal(readRepo(JSON.stringify(nextRepo(done, { op: 'same' })), SAME).url, SAME)
})

console.log(process.exitCode ? '✗ server repo' : `✓ server repo: ${passed} passed`)

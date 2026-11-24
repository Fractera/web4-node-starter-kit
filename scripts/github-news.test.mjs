// Node step 849: an element's GitHub is measured, never remembered — the card's line (`element-github-line.cjs`) and the hook that tells
// the element's agent its repository changed (`github-news.cjs`). ✗ 2026-11-24, fractera.ai: card and state said nothing of the
// marketplace's repository, and its agent kept «the GitHub part is cancelled» after a token was saved and a push went. `npm run test:github-news`.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const req = createRequire(import.meta.url)
const g = req(join(ROOT, 'lib', 'web4-items', 'element-github-line.cjs'))
const tmp = mkdtempSync(join(tmpdir(), 'github-news-'))
const put = (p, text) => { mkdirSync(dirname(join(tmp, p)), { recursive: true }); writeFileSync(join(tmp, p), text) }
// the node's own modules the hook requires from its root
for (const f of ['lib/web4-items/element-github-line.cjs', 'lib/agent-kit/node-line.cjs', 'lib/agent-kit/github-news.cjs']) put(f, readFileSync(join(ROOT, f), 'utf8'))
const news = req(join(tmp, 'lib', 'agent-kit', 'github-news.cjs')).news
put('WEB4-ITEMS-REGISTRY/web4-items.json', JSON.stringify({ services: [{ id: 'mkt01', kind: 'user', born: true }] }))
put('data/services/mkt01/address.json', JSON.stringify({ address: 'f2f-market' }))
const dir = join(tmp, 'WEB4-ITEMS', 'user', 'f2f-market')
mkdirSync(dir, { recursive: true })
const git = (...a) => execFileSync('git', ['-C', dir, '-c', 'user.name=t', '-c', 'user.email=t@t', ...a], { encoding: 'utf8' }).trim()
git('init', '-q'); writeFileSync(join(dir, 'a.txt'), '1'); git('add', '.'); git('commit', '-qm', 'one')
const first = git('rev-parse', '--short', 'HEAD')
writeFileSync(join(dir, 'a.txt'), '2'); git('commit', '-qam', 'two')
let passed = 0
const ok = (c, what) => { assert.ok(c, what); passed++ }

// Negative: no link — «not connected», the hook silent on its first look and after.
ok(/^GitHub: not connected/.test(g.lineOf(g.measure(tmp, 'mkt01', dir))), 'no link is «not connected»')
ok(news('mkt01', tmp) === '' && news('mkt01', tmp) === '', 'the first look records, the same binding stays silent')

// A token saved and a push (the morning on fractera.ai): the binding changed — one line, then silence.
put('data/services/mkt01/github/state.json', JSON.stringify({ repo: 'Fractera/f2f-marketpalce', expires: '2026-11-30T00:00:00Z', lastPushedAt: '2026-11-23T11:48:00Z', lastCommit: first }))
put('data/services/mkt01/github/.env', 'GITHUB_TOKEN=x\n')
const line = news('mkt01', tmp, new Date('2026-11-24T11:50:00Z'))
ok(/^⟦node · github · mkt01 · \d\d:\d\d⟧/.test(line), `the line carries the node's head — ${line.slice(0, 40)}`)
ok(line.includes('Fractera/f2f-marketpalce') && line.includes('its own token') && line.includes('1 commit(s) not pushed'), 'the line says the repository, whose token and the unpushed commit')
ok(news('mkt01', tmp) === '', 'heard once — silent until the next change')

// The door's shape: the token's source and tail come from it.
ok(g.lineOf({ repo: 'o/r', tokenSource: 'element', tokenTail: '4p2L', expires: '2026-11-30', lastPushedAt: '2026-11-23T11:48:00Z', lastCommit: '9b5c671', ahead: 1, commit: 'fe9d4d7' }).includes('its own token …4p2L, until 2026-11-30'), 'the door state names the token by its tail')
ok(g.lineOf({ repo: 'o/r', tokenSource: null }).includes('NO token now'), 'a link without a token says no push can go')

// The main agent's own session never gets the hook's line.
ok(news('build', tmp) === '', 'the main agent is not an element')

rmSync(tmp, { recursive: true, force: true })
console.log(`===GITHUB_NEWS_OK=== ${passed} checks: not connected, a change heard once, the door's token named, the main agent skipped`)

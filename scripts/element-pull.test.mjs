// Node step 842: an element takes its GitHub commits by a button. Real git — a local bare repository plays GitHub — and the wall's
// helper stubbed in its REAL shape (`asElement` returns `{ cmd, args, wrapped }`, server-wall trap 839-13), proving that only the move
// of the working tree goes as the element. Run: node scripts/element-pull.test.mjs
import { spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import * as pull from '../lib/web4-items/element-pull.mjs'

let failed = 0
const check = (name, ok, detail = '') => { console.log(`${ok ? '✓' : '✗'} ${name}${ok ? '' : ` — ${detail}`}`); if (!ok) failed++ }
const sh = (cwd, ...args) => {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8', env: { ...process.env, GIT_AUTHOR_NAME: 't', GIT_AUTHOR_EMAIL: 't@t', GIT_COMMITTER_NAME: 't', GIT_COMMITTER_EMAIL: 't@t' } })
  if (r.status !== 0) throw new Error(`git ${args.join(' ')}: ${r.stderr}`)
  return r.stdout.trim()
}

const base = mkdtempSync(join(tmpdir(), 'element-pull-'))
try {
  const hub = join(base, 'hub.git'), el = join(base, 'element'), writer = join(base, 'writer')
  sh(base, 'init', '--quiet', '--bare', '-b', 'main', hub)
  sh(base, 'clone', '--quiet', hub, el)
  writeFileSync(join(el, 'page.json'), '{"title":"old"}\n')
  sh(el, 'add', '.'); sh(el, 'commit', '--quiet', '-m', 'born'); sh(el, 'push', '--quiet', 'origin', 'HEAD:main')
  const born = sh(el, 'rev-parse', 'origin/main')
  sh(base, 'clone', '--quiet', hub, writer)

  // the verdict, pure
  check('verdict: nothing new', pull.pullVerdict({ behind: 0, ahead: 0, dirty: 3 }) === 'none')
  check('verdict: ready', pull.pullVerdict({ behind: 2, ahead: 0, dirty: 0 }) === 'ready')
  check('verdict: uncommitted work refuses', pull.pullVerdict({ behind: 1, ahead: 0, dirty: 1 }) === 'dirty')
  check('verdict: a history of its own refuses', pull.pullVerdict({ behind: 1, ahead: 1, dirty: 0 }) === 'diverged')

  // never asked → not fetched
  check('before a check GitHub was never asked', pull.counts(el).fetched === false)

  // the workshop writes and pushes; the element asks GitHub
  writeFileSync(join(writer, 'page.json'), '{"title":"new"}\n')
  sh(writer, 'commit', '--quiet', '-am', 'landing'); sh(writer, 'push', '--quiet', 'origin', 'HEAD:main')
  const f = pull.fetchRemote(el, hub)
  check('fetch into its own ref', f.ok, JSON.stringify(f))
  const c = pull.counts(el)
  check('one commit behind, none ahead', c.fetched && c.behind === 1 && c.ahead === 0, JSON.stringify(c))
  check('origin untouched (the template ref stays where it was)', sh(el, 'rev-parse', 'origin/main') === born)

  // the take goes through the wall's helper — the stub returns the real shape and runs plain git, so the merge really happens
  const calls = []
  const asElement = (root, cwd, cmd, args) => { calls.push({ root, cwd, cmd, args }); return { cmd, args, wrapped: 'lidt5' } }
  const t = pull.fastForward('/node', el, { asElement })
  check('taken', t.ok, JSON.stringify(t))
  check('taken as the element (helper called once, for the merge only)', calls.length === 1 && t.wrapped === 'lidt5' && calls[0].args.includes('--ff-only'), JSON.stringify(calls))
  check('the merge carries safe.directory', calls[0]?.args.some((a) => a === `safe.directory=${el}`))
  check('the file moved', readFileSync(join(el, 'page.json'), 'utf8').includes('new'))
  check('nothing behind after the take', pull.counts(el).behind === 0)

  // negative: a merge that bypasses the helper would leave `calls` empty — the stub proves the path, not a constant
  const bypass = []
  pull.fastForward('/node', el, { asElement: (r, cw, cmd, args) => { bypass.push(1); return { cmd, args } } })
  check('negative: an unwalled answer has no «wrapped»', bypass.length === 1 && pull.fastForward('/node', el, { asElement: (r, cw, cmd, args) => ({ cmd, args }) }).wrapped === null)

  // uncommitted work on a file the commit touches — git refuses, the file is kept
  writeFileSync(join(writer, 'page.json'), '{"title":"newer"}\n')
  sh(writer, 'commit', '--quiet', '-am', 'more'); sh(writer, 'push', '--quiet', 'origin', 'HEAD:main')
  writeFileSync(join(el, 'page.json'), '{"title":"agent was here"}\n')
  pull.fetchRemote(el, hub)
  const d = pull.fastForward('/node', el, { asElement })
  check('uncommitted work refused', !d.ok && d.error === 'dirty', JSON.stringify(d))
  check('the agent\'s edit kept', readFileSync(join(el, 'page.json'), 'utf8').includes('agent was here'))

  // a history of its own — fast-forward impossible
  sh(el, 'commit', '--quiet', '-am', 'agent commit')
  const c2 = pull.counts(el)
  check('diverged counted', c2.ahead === 1 && c2.behind === 1, JSON.stringify(c2))
  const g = pull.fastForward('/node', el, { asElement })
  check('diverged refused', !g.ok && g.error === 'diverged', JSON.stringify(g))

  // a wrong address — a machine word, no git output
  const bad = pull.fetchRemote(el, join(base, 'nowhere.git'))
  check('a missing repository is a machine word', !bad.ok && ['repo-not-found', 'fetch-failed'].includes(bad.error), JSON.stringify(bad))
} finally {
  rmSync(base, { recursive: true, force: true })
}

if (failed) { console.log(`===ELEMENT_PULL_FAILED=== ${failed}`); process.exit(1) }
console.log('===ELEMENT_PULL_OK===')

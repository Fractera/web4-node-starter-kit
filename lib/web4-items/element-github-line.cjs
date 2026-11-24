// WHAT AN ELEMENT'S GITHUB IS — MEASURED, ONE LINE (node steps 849-1, 849-4a). ✗ 2026-11-24, fractera.ai (the server's main agent):
// asked «какой доступ к репозиторию у элемента?», neither `npm run card` nor `npm run state` said a word of GitHub, while the core's door
// `GET /api/architect/items/<id>/github` knew the repository, the token, its expiry and the unpushed commit; the element's own documents
// still said «the GitHub part is cancelled» after Roma had saved a token on its page. The binding is measured at the git and the stored
// link, never remembered (`binding.cjs`). The token itself is never read here: only whether the element has its own.
'use strict'
const { existsSync, readFileSync } = require('node:fs')
const path = require('node:path')
const { spawnSync } = require('node:child_process')

/** The stored link (`data/services/<id>/github/state.json`) and the element's own git, in the shape of the door's `elementGithubState`. */
function measure(root, id, dir) {
  let st = {}
  try { st = JSON.parse(readFileSync(path.join(root, 'data', 'services', id, 'github', 'state.json'), 'utf8')) || {} } catch { /* no link */ }
  const git = (args) => {
    if (!dir) return null
    const r = spawnSync('git', ['-C', dir, ...args], { encoding: 'utf8', timeout: 5000, windowsHide: true })
    return r.status === 0 ? String(r.stdout).trim() : null
  }
  const ahead = st.lastCommit ? git(['rev-list', '--count', `${st.lastCommit}..HEAD`]) : null
  return {
    repo: st.repo ?? null,
    expires: st.expires ?? null,
    lastPushedAt: st.lastPushedAt ?? null,
    lastCommit: st.lastCommit ?? null,
    commit: git(['rev-parse', '--short', 'HEAD']),
    dirty: (git(['status', '--porcelain']) ?? '').split('\n').filter(Boolean).length,
    ownToken: existsSync(path.join(root, 'data', 'services', id, 'github', '.env')),
    ahead: ahead === null ? null : Number(ahead),
  }
}

/** One line for people and agents — from the door's state (with `tokenSource`, tails) or from `measure`. */
function lineOf(g) {
  if (!g || !g.repo) return 'GitHub: not connected — no repository is linked on its page «Строительство → GitHub» (measured now).'
  const token = g.tokenSource === 'element' ? `its own token${g.tokenTail ? ` …${g.tokenTail}` : ''}`
    : g.tokenSource === 'node' ? `the node's shared token${g.activeTail ? ` …${g.activeTail}` : ''}`
      : g.tokenSource === null ? 'NO token now — a push cannot go'
        : g.ownToken ? 'its own token' : "the node's shared token, if the node has one"
  const until = g.expires ? `, until ${String(g.expires).slice(0, 10)}` : ''
  const pushed = g.lastPushedAt ? `last push ${String(g.lastPushedAt).slice(0, 16).replace('T', ' ')} UTC (${g.lastCommit ?? '?'})` : 'never pushed'
  const ahead = typeof g.ahead === 'number' ? (g.ahead ? `, ${g.ahead} commit(s) not pushed (HEAD ${g.commit ?? '?'})` : ', nothing waits to be pushed') : ''
  const dirty = g.dirty ? `, ${g.dirty} uncommitted file(s)` : ''
  return `GitHub: ${g.repo} · ${token}${until} · ${pushed}${ahead}${dirty} (measured now; the write right was checked when it was connected).`
}

module.exports = { measure, lineOf }

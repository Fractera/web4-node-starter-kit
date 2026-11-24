// THE ELEMENT HEARS WHEN ITS REPOSITORY CHANGES (node step 849-4b). ✗ 2026-11-24, fractera.ai: Roma saved a token on the marketplace's
// page «Строительство → GitHub» at 11:45 UTC and the node pushed, but its agent got not a line — its documents kept «the GitHub part is
// cancelled — no repository, no push». The surfaces card says the repository at every session's start (849-4a, `modes.surfacesText`);
// this hook (UserPromptSubmit of every element session, beside `came-from.cjs`) adds ONE line before the next prompt when the measured
// binding changed since the agent last heard it — a token saved or forgotten, a push, a repository linked or unlinked. Never pasted into
// a turn (850-3): it rides the next prompt. The first look only records what is (the start card has said it).
//   as a hook:  node github-news.cjs <element id>  < hook JSON
// 🛑 A hook never fails the session: any error — silent, exit code 0. No token is read: only whether the element has its own.
'use strict'
const fs = require('node:fs')
const path = require('node:path')

const ROOT = path.join(__dirname, '..', '..')
const SHAPE = /^[a-z0-9][a-z0-9-]{0,39}$/
const readJson = (file) => { try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return null } }

/** The element's folder — by its address, else by its id (the rule of `itemDir` in scripts/main-agent-cli.mjs). */
function dirOf(root, id) {
  const e = (readJson(path.join(root, 'WEB4-ITEMS-REGISTRY', 'web4-items.json'))?.services ?? []).find((s) => s.id === id)
  if (!e) return null
  const base = path.join(root, 'WEB4-ITEMS', e.kind === 'user' ? 'user' : 'core')
  const a = readJson(path.join(root, 'data', 'services', id, 'address.json'))?.address
  const byAddress = typeof a === 'string' && SHAPE.test(a) ? path.join(base, a) : null
  if (byAddress && fs.existsSync(byAddress)) return byAddress
  return fs.existsSync(path.join(base, id)) ? path.join(base, id) : null
}

/** The line to add, or '' — and the seen print written. */
function news(id, root = ROOT, at = new Date()) {
  if (!SHAPE.test(id) || id === 'build') return ''
  const g = require(path.join(root, 'lib', 'web4-items', 'element-github-line.cjs'))
  const m = g.measure(root, id, dirOf(root, id))
  const print = JSON.stringify([m.repo, m.expires, m.lastPushedAt, m.lastCommit, m.ownToken])
  const file = path.join(root, 'data', 'services', id, 'github-seen.json')
  const seen = readJson(file)?.print ?? null
  if (seen === print) return ''
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, JSON.stringify({ print, at: at.toISOString() }) + '\n')
  if (seen === null) return ''
  const nodeLine = require(path.join(root, 'lib', 'agent-kit', 'node-line.cjs'))
  return nodeLine.head('github', id, at) + `Your repository changed since you last heard of it: ${g.lineOf(m)} Where your documents say otherwise about GitHub, rewrite them now.`
}

if (require.main === module) {
  process.stdin.resume()
  process.stdin.on('data', () => {})
  process.stdin.on('end', () => { let out = ''; try { out = news(String(process.argv[2] ?? '')) } catch { /* never fail the session */ } if (out) process.stdout.write(out); process.exit(0) })
}

module.exports = { news, dirOf }

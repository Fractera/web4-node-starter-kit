// THE NODE'S OWN RECORDS INSIDE THE CORE'S GIT TREE SURVIVE THE UPDATE (node step 720-2). The owner, 2026-11-11: «стоит проверить и
// другие записи … которые не должны быть потеряны при обновлении версии, например список доменов»; «документы пользователя переживут
// миграцию … получить последнюю версию Fractera но сохранить свои инструкции».
//
// Most of the person's part lives outside git and no merge reaches it: `data/*` (the person's block CLAUDE.user.md and soul.user.md, the
// extra domains `data/node/domains.json`, the GitHub key, the bots, the memory, the clocks, the panel design) and `logs/*` (the main domain
// `logs/domain.json`). A skill folder of the person's own is untracked and the update leaves it. What is tracked and still the node's:
//   • the site settings — `APP-CONFIG/app-config.json`, `PLATFORM-CONFIG/platform-config.json`, `DESIGN-CONFIG/design-config.json`:
//     ✗ found by reading 2026-11-11: «Activate domain» writes `cfg.url` into the core's app-config.json, and every later node update
//     REFUSED with «несохранённая работа» — merged three ways here, key by key: the node's changed value wins, the fork's new keys come;
//   • `CLAUDE.md` below `Entries:` of section 9 — the node's own entries, put back under the release's system part;
//   • the node's own steps (`current-steps.md`, `CANCELLED.md`) — kept as the node had them, saved or not.
// `take` runs before the merge (each changed record is copied and set back to HEAD, so git sees nothing of the node's in the way);
// `put` runs after it. The rollback of the update needs nothing from here: its copy of the tracked diff holds these files too.
'use strict'

const { existsSync, readFileSync, writeFileSync } = require('node:fs')
const path = require('node:path')

const JSON3 = ['APP-CONFIG/app-config.json', 'PLATFORM-CONFIG/platform-config.json', 'DESIGN-CONFIG/design-config.json']
const CLAUDE = 'CLAUDE.md'
const STEPS = 'development-docs/development-steps/'
const OWN = [`${STEPS}current-steps.md`, 'development-docs/CANCELLED.md']
const RECORDS = [...JSON3, CLAUDE, ...OWN]
const ENTRIES = /\n## 9\. Evolution[\s\S]*?\nEntries:\n/

function splitClaude(text) {
  const m = ENTRIES.exec(text)
  if (!m) return { system: text, entries: '' }
  const at = m.index + m[0].length
  return { system: text.slice(0, at), entries: text.slice(at) }
}

const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)
const GONE = Symbol('gone')

/** Three-way merge of JSON: a value the node changed from the base wins; otherwise the fork's; objects key by key. */
function merge3(base, ours, theirs) {
  if (same(ours, base)) return theirs
  if (same(theirs, base) || same(ours, theirs)) return ours
  if (isObj(ours) && isObj(theirs)) {
    const b = isObj(base) ? base : {}
    const out = {}
    for (const k of new Set([...Object.keys(theirs), ...Object.keys(ours)])) {
      const v = merge3(k in b ? b[k] : GONE, k in ours ? ours[k] : GONE, k in theirs ? theirs[k] : GONE)
      if (v !== GONE) out[k] = v
    }
    return out
  }
  return ours
}

/**
 * Before the merge: every record the node changed (saved or not against HEAD — only the unsaved ones stand in git's way) is copied and set
 * back to HEAD. `git(args) → { ok, out }` runs in the node's root. Returns the snapshot for `put`.
 */
function take(root, git) {
  const kept = []
  for (const p of RECORDS) {
    const file = path.join(root, p)
    if (!existsSync(file)) continue
    const ours = readFileSync(file, 'utf8')
    const head = git(['show', `HEAD:${p}`])
    if (!head.ok) continue // not in git here — the merge leaves it as it is
    if (head.out === ours.replace(/\s+$/, '')) continue
    kept.push({ p, ours, base: head.out })
    git(['checkout', '-q', 'HEAD', '--', p])
  }
  return kept
}

/** After the merge: the node's records back over the fork's — merged for the settings, entries for CLAUDE.md, as they were for the steps. */
function put(root, kept) {
  const done = []
  for (const { p, ours, base } of kept) {
    const file = path.join(root, p)
    const theirs = existsSync(file) ? readFileSync(file, 'utf8') : null
    let next = ours
    if (JSON3.includes(p) && theirs != null) {
      try { next = JSON.stringify(merge3(JSON.parse(base), JSON.parse(ours), JSON.parse(theirs)), null, 2) + '\n' } catch { next = ours }
    } else if (p === CLAUDE && theirs != null) {
      next = splitClaude(theirs).system + splitClaude(ours).entries
    }
    writeFileSync(file, next)
    done.push(p)
  }
  return done
}

module.exports = { RECORDS, JSON3, merge3, splitClaude, take, put }

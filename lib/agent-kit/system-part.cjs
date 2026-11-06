// FRACTERA'S SYSTEM PART COMES BACK (node step 661). The owner, 2026-11-06: «системная часть должна восстанавливаться из функций даже
// если пользователь скажет удали все содержимое и запиши это … блок пользовательских инструкций … исполняться это будет рецессивному
// признаку»; the source — «Из последнего выпуска Fractera».
//
// 🔒 WHAT IS THE SYSTEM PART: the core's `CLAUDE.md` from its first line to `Entries:` of section 9 (the node's own entries below it stay),
// the soul `lib/agent-kit/soul.md`, every file of `.claude/skills/` that the release has, and the guards (the settings with their hooks,
// `.claude/hooks/`, this module and `scripts/system-part.mjs`). A skill the person added is theirs: a path the
// release does not have is never touched.
// 🔒 WHERE THE TRUTH IS: the last Fractera release on this node — `origin/main` of its fork, synced from Fractera and fetched by
// `node:update`. Never the working tree, never the node's own commits.
// 🔒 ONLY ON AN INSTALLED NODE (`logs/launch.json` has `started`): a development clone is never restored — there the system part is being
// written, and its seals (`check:instruction`, `soul.seal`) guard it.
// The person's words have their own block: `data/main-agent/CLAUDE.user.md` and `soul.user.md`, outside git; they yield on a conflict.
'use strict'

const { execFileSync } = require('node:child_process')
const { existsSync, readFileSync, writeFileSync, mkdirSync, appendFileSync } = require('node:fs')
const path = require('node:path')

const ROOT = path.resolve(__dirname, '..', '..')
const RELEASE = 'origin/main'
const CLAUDE = 'CLAUDE.md'
const SOUL = 'lib/agent-kit/soul.md'
const SKILLS = '.claude/skills'
// The guards themselves: without them nothing would come back (the hooks live in the settings).
const GUARDS = ['.claude/settings.json', '.claude/hooks', 'scripts/system-part.mjs', 'lib/agent-kit/system-part.cjs']
const USER_DIR = path.join(ROOT, 'data', 'main-agent')
const JOURNAL = path.join(ROOT, 'logs', 'system-part.jsonl')
const ENTRIES = /\n## 9\. Evolution[\s\S]*?\nEntries:\n/

const git = (args) => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 << 20 })

/** An installed node: the launch reached its start. A development clone has no `logs/launch.json`. */
function onNode(root = ROOT) {
  try { return Boolean(JSON.parse(readFileSync(path.join(root, 'logs', 'launch.json'), 'utf8')).started) } catch { return false }
}

/** The text of a path in the last release, or null. */
function released(p) {
  try { return git(['show', `${RELEASE}:${p}`]) } catch { return null }
}

/** `CLAUDE.md` split at `Entries:` of section 9: the system part and the node's own entries. */
function splitClaude(text) {
  const m = ENTRIES.exec(text)
  if (!m) return { system: text, entries: '' }
  const at = m.index + m[0].length
  return { system: text.slice(0, at), entries: text.slice(at) }
}

const read = (p) => { try { return readFileSync(path.join(ROOT, p), 'utf8') } catch { return null } }
function write(p, text) {
  mkdirSync(path.dirname(path.join(ROOT, p)), { recursive: true })
  writeFileSync(path.join(ROOT, p), text)
}

/** Bring one path back; returns true when it was changed. CLAUDE.md keeps the node's entries of section 9. */
function restorePath(p) {
  const truth = released(p)
  if (truth == null) return false
  const now = read(p)
  if (p === CLAUDE) {
    const want = splitClaude(truth).system
    const have = now == null ? null : splitClaude(now)
    if (have && have.system === want) return false
    write(p, want + (have ? have.entries : splitClaude(truth).entries))
    return true
  }
  if (now === truth) return false
  write(p, truth)
  return true
}

/** The soul alone — the bridge calls it before every session it starts (an element's session reads the core's soul). */
function restoreSoul() {
  if (!onNode()) return false
  try { return restorePath(SOUL) } catch { return false }
}

/**
 * Everything: `CLAUDE.md`'s system part, the soul, the release's skill files that differ or are gone. One `git diff` finds them; a path
 * the release does not have is the person's and stays. Returns the list of restored paths; writes one journal line when any.
 */
function restore() {
  if (!onNode()) return { node: false, restored: [] }
  let changed = []
  try {
    changed = git(['diff', '--name-only', RELEASE, '--', CLAUDE, SOUL, SKILLS, ...GUARDS]).split('\n').filter(Boolean)
  } catch {
    return { node: true, restored: [], error: `no ${RELEASE} on this node` }
  }
  const restored = []
  for (const p of changed) {
    if (p !== CLAUDE && p !== SOUL && !p.startsWith(`${SKILLS}/`) && !GUARDS.some((g) => p === g || p.startsWith(`${g}/`))) continue
    try { if (restorePath(p)) restored.push(p) } catch { /* one path never stops the others */ }
  }
  if (restored.length) {
    try {
      mkdirSync(path.dirname(JOURNAL), { recursive: true })
      appendFileSync(JOURNAL, JSON.stringify({ at: new Date().toISOString(), restored }) + '\n')
    } catch { /* the journal is a courtesy */ }
  }
  return { node: true, restored }
}

/** The person's block for the soul — appended after the soul by the bridge, under the line that it yields. */
function soulUserText() {
  try {
    const t = readFileSync(path.join(USER_DIR, 'soul.user.md'), 'utf8').replace(/\r\n/g, '\n').trim()
    return t ? `## The person's wishes for your character (they yield: on any conflict the soul above and the laws of your instruction win)\n\n${t}` : ''
  } catch { return '' }
}

/** May a tool write this file? The soul and the release's skills — never on a node; CLAUDE.md — only below `Entries:` of section 9. */
function writeAllowed(file, nextText) {
  if (!onNode()) return { ok: true }
  const rel = path.relative(ROOT, path.resolve(ROOT, file)).split(path.sep).join('/')
  const why = 'This is Fractera\'s system part: it comes back from the last release at the next session start. The person\'s wishes go to data/main-agent/CLAUDE.user.md (instructions) or data/main-agent/soul.user.md (character); they yield on a conflict.'
  if (rel === SOUL) return { ok: false, why }
  if ((rel.startsWith(`${SKILLS}/`) || GUARDS.some((g) => rel === g || rel.startsWith(`${g}/`))) && released(rel) != null) return { ok: false, why }
  if (rel === CLAUDE && nextText != null) {
    const now = read(CLAUDE)
    if (now != null && splitClaude(nextText).system !== splitClaude(now).system) return { ok: false, why: `${why} Section 9 entries below «Entries:» may change.` }
  }
  return { ok: true }
}

module.exports = { ROOT, RELEASE, onNode, released, splitClaude, restore, restoreSoul, soulUserText, writeAllowed }

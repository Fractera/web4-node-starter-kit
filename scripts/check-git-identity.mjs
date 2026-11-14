// GUARD: ONE MACHINE IDENTITY (node step 743-1). Every commit the node's code makes is signed by the machine through
// `lib/deploy/git-identity.mjs` (D38) — never by a literal of its own, never by whatever identity the environment happens to have.
// ✗ Measured 2026-11-14: 10 places, 4 emails, 2 policies, and `scripts/evolution.mjs` committing with none; 741-8 added the fourth email
// instead of finding the other three. Two rules, over every tracked or new file of lib/, scripts/, app/, components/:
//   (a) no identity literal outside the module: `user.name=` / `user.email=`, `git config user.* <value>`, `GIT_AUTHOR_*` /
//       `GIT_COMMITTER_*`, or one of the old emails;
//   (b) a file that runs a git verb which writes a commit (commit, merge, stash, rebase, cherry-pick, revert) imports the module.
// Exceptions by file, each with its reason. `--root <dir>` checks another copy (the negative control plants a violation there).
import { spawnSync } from 'node:child_process'
import { readFileSync, existsSync } from 'node:fs'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const at = process.argv.indexOf('--root')
const ROOT = at > 0 ? resolve(process.argv[at + 1]) : resolve(dirname(fileURLToPath(import.meta.url)), '..')
const MODULE = 'lib/deploy/git-identity.mjs'

const EXEMPT = new Map([
  [MODULE, 'the one source'],
  ['scripts/check-git-identity.mjs', 'this guard names the patterns it refuses'],
  ['scripts/template.mjs', "the author's template workshop tool — commits in the workshop with the author's own identity, never on a node"],
  ['components/node-state/origin-notice.i18n.ts', 'the word «merge» is the name of an update stage shown to the person, not a git call'],
  ['lib/agent-kit/system-part.cjs', 'a set of git verbs the system-part guard recognises in a command line, not a git call'],
])
// Tests build their own throwaway repositories with their own identities.
const isTest = (p) => /\.test\.(mjs|cjs|js|ts)$/.test(p) || p.startsWith('scripts/catalog/fixtures/')

const LITERAL = [
  /user\.(name|email)=/,
  /git\s+config\s+(--\S+\s+)*user\.(name|email)\s+["']?[^\s"'|;&)]/,
  /\bGIT_(AUTHOR|COMMITTER)_(NAME|EMAIL)\b/,
  /panel@fractera\.local|node@fractera\.local|node@localhost|node@fractera\.invalid/,
]
const VERB = /["'](commit|merge|stash|rebase|cherry-pick|revert)["'](?!\s*:)/

const list = spawnSync('git', ['-C', ROOT, 'ls-files', '--cached', '--others', '--exclude-standard', '--', 'lib', 'scripts', 'app', 'components'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
if (list.status !== 0) { console.error(`check:git-identity: git ls-files failed — ${list.stderr}`); process.exit(1) }
const files = list.stdout.split('\n').filter((p) => /\.(mjs|cjs|js|ts|tsx|sh)$/.test(p) && !EXEMPT.has(p) && !isTest(p) && existsSync(join(ROOT, p)))

const bad = []
for (const p of files) {
  const text = readFileSync(join(ROOT, p), 'utf8')
  const lines = text.split('\n')
  lines.forEach((line, i) => {
    if (LITERAL.some((re) => re.test(line))) bad.push(`${p}:${i + 1} — an identity literal: sign through ${MODULE} (machineArgs / machineEnv / configureIfNone)`)
  })
  if (/\bgit\b/.test(text) && !text.includes('git-identity.mjs')) {
    const i = lines.findIndex((line) => VERB.test(line))
    if (i >= 0) bad.push(`${p}:${i + 1} — a git verb that writes a commit without ${MODULE}: pass machineArgs() (D38: the machine signs what it does)`)
  }
}

if (bad.length) {
  console.error(`===GIT_IDENTITY_REFUSED=== ${bad.length}\n${bad.join('\n')}`)
  process.exit(1)
}
console.log(`===GIT_IDENTITY_OK=== ${files.length} files, one machine identity (${MODULE})`)

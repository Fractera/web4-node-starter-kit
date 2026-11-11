// 720-1: the core stays Fractera's on a node. Run: node scripts/core-guard.test.mjs
// A scratch node (a git repo with its release `origin/main` and `logs/launch.json` started): a non-owner may write only the person's part
// (data, development steps, the site settings, a new skill folder of their own, section 9 entries); the menu, a script, a release skill,
// the soul and the system part of CLAUDE.md are refused — by Edit/Write and by the plain shell writes. The owner may write everything.
// Negative control: the same calls in a development clone (no launch.json) pass — the rule is the node's, not the workshop's.
import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { createRequire } from 'node:module'
import { join } from 'node:path'

const part = createRequire(import.meta.url)('../lib/agent-kit/system-part.cjs')
const base = mkdtempSync(join(tmpdir(), 'core-guard-'))
const root = join(base, 'node')
const g = (...a) => execFileSync('git', a, { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] })
const put = (p, t) => { mkdirSync(join(root, p, '..'), { recursive: true }); writeFileSync(join(root, p), t) }
mkdirSync(root, { recursive: true })
g('init', '-q', '-b', 'main')
g('config', 'user.email', 't@t'); g('config', 'user.name', 't')
const CLAUDE = '# Core\n\n## 1. Role\n\nrules\n\n## 9. Evolution\n\nRules.\n\nEntries:\n'
put('CLAUDE.md', CLAUDE)
put('lib/agent-kit/soul.md', 'soul\n')
put('components/left-menu.tsx', 'export const Menu = 1\n')
put('.claude/skills/create-element/SKILL.md', 'release skill\n')
put('APP-CONFIG/app-config.json', '{}\n')
put('development-docs/development-steps/current-steps.md', 'steps\n')
g('add', '-A'); g('commit', '-q', '-m', 'release')
g('update-ref', 'refs/remotes/origin/main', 'HEAD')
put('logs/launch.json', JSON.stringify({ started: true }))

let bad = 0
const ok = (cond, what) => { console.log(`${cond ? '✓' : '✗'} ${what}`); if (!cond) bad++ }
const w = (file, next, owner = false) => part.writeAllowed(file.startsWith('/') ? file : join(root, file), next, { root, owner }).ok
const b = (cmd, owner = false) => part.bashAllowed(cmd, root, { root, owner }).ok

ok(!w('components/left-menu.tsx', 'export const Menu = 2\n'), 'a non-owner: the left menu of the core is refused')
ok(!w('app/[lang]/new-page/page.tsx', 'x'), 'a non-owner: a new file of the core is refused')
ok(!w('.claude/skills/create-element/SKILL.md', 'mine'), 'a non-owner: a release skill is refused')
ok(!w('lib/agent-kit/soul.md', 'mine'), 'a non-owner: the soul is refused')
ok(!w('CLAUDE.md', CLAUDE.replace('rules', 'my rules')), 'a non-owner: the system part of CLAUDE.md is refused')
ok(w('CLAUDE.md', CLAUDE + '- If x — y.\n'), 'a non-owner: a section 9 entry passes')
ok(w('.claude/skills/my-own-skill/SKILL.md', 'mine'), 'a non-owner: a new skill folder of their own passes')
ok(w('data/main-agent/CLAUDE.user.md', 'mine'), 'a non-owner: the person\'s block passes')
ok(w('development-docs/development-steps/current-steps.md', 'mine'), 'a non-owner: the node\'s own steps pass')
ok(w('APP-CONFIG/app-config.json', '{"name":"x"}'), 'a non-owner: the site settings pass')
ok(w(join(base, 'elsewhere.txt'), 'x'), 'a non-owner: a file outside the core passes')
ok(!b('sed -i "" "s/1/2/" components/left-menu.tsx'), 'a non-owner shell: sed -i on the menu is refused')
ok(!b("cat > components/left-menu.tsx <<'EOF'\nexport const Menu = 3\nEOF"), 'a non-owner shell: a heredoc into the menu is refused')
ok(!b('echo x >> scripts/serve.mjs'), 'a non-owner shell: a redirection into a script is refused')
ok(!b('rm -rf .claude/skills/create-element'), 'a non-owner shell: removing a release skill is refused')
ok(!b('git checkout origin/some-branch -- .'), 'a non-owner shell: git checkout over the core is refused')
ok(!b('git apply patch.diff'), 'a non-owner shell: git apply is refused')
ok(b('git add development-docs && git commit -q -m "steps"'), 'a non-owner shell: committing the node\'s steps passes')
ok(b('grep -n "=> x" components/left-menu.tsx | head -3 2>/dev/null'), 'a non-owner shell: reading with an arrow in quotes passes')
ok(b('echo hi > data/main-agent/note.md && npm run status'), 'a non-owner shell: a write into data passes')
ok(b(`cd ${base} && echo x > other.txt`), 'a non-owner shell: a write after cd outside the core passes')
ok(b('git checkout -- development-docs/development-steps/current-steps.md'), 'a non-owner shell: git checkout of the node\'s steps passes')
ok(w('components/left-menu.tsx', 'x', true) && b('git apply patch.diff', true), 'the owner: the core may be changed')
ok(part.restore.length === 0 && typeof part.ownerState === 'function', 'the owner is decided by the key (ownerState)')

rmSync(join(root, 'logs', 'launch.json'))
ok(w('components/left-menu.tsx', 'x') && b('sed -i "" "s/1/2/" components/left-menu.tsx'), 'negative control: a development clone is never refused')

rmSync(base, { recursive: true, force: true })
console.log(bad ? `===CORE_GUARD_FAILED=== ${bad}` : '===CORE_GUARD_OK=== the core is refused to a non-owner on a node, the person\'s part passes')
process.exit(bad ? 1 : 0)

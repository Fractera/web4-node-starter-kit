# 743 — the before-numbers (measured 2026-11-14 ~13:20 UTC on the owner's Mac, scratch copies only; no node, no server touched)

Run: `bash old-updater-bridge.sh <scratch> ~/fractera-dev/web4-node-starter-kit e82b311f 8f165354`
     `bash dry-merge.sh <scratch> ~/fractera-dev/web4-node-starter-kit e82b311f 8f165354 scripts/serve.mjs`

## Probe 1 — the node's own updater cannot receive a fix to the updater (9.8 s total)
Fixture: a node at e82b311f (before 741-8), diverged as every install diverges (`scripts/fresh-project.mjs` commits), no identity git
may use (`user.useConfigOnly`, empty HOME, no system config — the server's case); its fork at 8f165354, which CARRIES the 741-8 fix.
```
== whoami for git in the fixture (must be empty): ''
== A: the node's own updater (e82b311f) updates to 8f165354
state=failed stage=merge reason=слияние (Committer identity unknown  *** Please tell me who you are. ...
identity error in log: 4
HEAD restored: yes
== B: the TARGET's updater on the same node
state=failed stage=guards reason=сторожа сборки (npm run prebuild) не прошёл — узел возвращён как был ...   (a fake npm stops it there)
identity error in log: 0
HEAD restored: yes
merge passed in B: 1
```
Reading: the fix sat in the target and never ran (A) — it runs only when the target's own updater does the update (B). The same
failure as the test server's rollback of 2026-11-14 ~12:15 UTC, and the one «Обновить» on the launch page would repeat today.

## Probe 2 — knowing before touching: a dry merge in a throwaway worktree (git 2.37.1 here: no `merge-tree --write-tree`, needs 2.38)
```
== clean: the node's own commit touches only its steps
verdict: merge passes        seconds: 2.21     node untouched: yes
== conflict: the node's own commit touches scripts/serve.mjs
verdict: merge stops at: scripts/serve.mjs     seconds: 2.35     node untouched: yes
```

## Census (git grep, 2026-11-14) — the machine's git identity lives in 10 places, 4 emails, 2 policies
| email | where | policy |
|---|---|---|
| `panel@fractera.local` | `app/[lang]/(architectLayer)/architect/build/github/api/connect/push/route.ts:80` | always |
| `node@fractera.local` | `lib/web4-items/element-github.ts:221`, `element-rollback.ts:18`, `element-update.ts:69`, `node-map.ts:52`, `scripts/element-import.mjs:80`, `scripts/item-birth.mjs:218` | always |
| `node@localhost` | `scripts/fresh-project.mjs:122` | only when none |
| `node@fractera.invalid` | `lib/deploy/git-identity.mjs` (node-update), `scripts/dedicated-server/install.sh:23` | only when none |
| — none — | `scripts/evolution.mjs:130` (the self-review journal commit) | fails where no identity |

## Other facts the plan rests on
- Every install commits (`scripts/fresh-project.mjs:119-123`) → every node diverges from birth → every update is a merge commit.
- The updater's closure is node builtins + local files (`build-failure.cjs`, `node-records.cjs`, `git-identity.mjs`, `deploy-lock.cjs`,
  `retired-natives.cjs`, `element-power.cjs`, `catalog-notify.cjs`) — it runs from a worktree with no `node_modules`.
- After the merge the old process keeps running its old stages 5–8, while its lazy `require`s and child scripts come from the new tree:
  one update = two versions mixed.
- Transitions hang on entry points by hand: the place migration on `start` (`scripts/serve.mjs:155`) and, after this morning's miss,
  a second copy on `rebuild` (8f165354).
- «Обновить» on the launch page runs the server's own `npm run node:update` (`scripts/dedicated-server/launch.sh:89-91`); `launch.sh`
  itself is uploaded fresh from this computer at every press (`scripts/dedicated-server/launch.mjs:64-67`, `install()`).
- `ANTI-PATTERNS.md:49`: a copy of `.ts`/`.tsx` inside the project is code to the core's build → the target's worktree lives OUTSIDE.
- Primary source, Homebrew on this Mac (`/usr/local/Homebrew` 8e858db558, `Library/Homebrew/cmd/update.sh`): the shell part moves the
  code (`git reset --hard origin/HEAD`, l. 296), stashes local changes with its own fixed identity (`-c "user.email=brew-update@localhost"
  -c "user.name=brew update"`, l. 288-289), then calls `brew update-report` (l. 1111) — a new process of the NEW code, where the
  migrations live (`update-report.rb`: `migrate_caskroom_caskfiles_to_json`, `migrate_gcc_dependents_if_needed`).

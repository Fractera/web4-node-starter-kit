# 743 — the update is done by the version it updates to

Planned 2026-11-14 at max effort as a PLAN ONLY (the owner's rule: the maximum model plans, Opus executes). Probes and before-numbers:
`./probes/` (`RESULTS.md` first). Repository: the core only (Fractera/web4-node-starter-kit, main). No template release. It goes BEFORE
the server proofs of 741 (D41): the test server 213.199.61.7 is the only real node installed before 741-8 — the live fixture of 743-5 —
and is neither updated nor cleared until 743 is live.

**Approved 2026-11-14 ~13:45 UTC:** the owner, to «Утверждаешь план 743 и решения D38–D43?» — «y go». Execution order as §5:
743-1 → 743-3 → 743-2 → 743-4 → 743-6 → 743-5 (code), ONE push, CI, fork sync, ONE node update of this computer, then 743-5 live.

## 1. The owner's words (verbatim) and the retelling
- 2026-11-14 ~13:20 UTC, the launch page showed «Fractera установлена: версия 97a15ca2. Отстаёт от Fractera на 9 коммитов. Дальше:
  обновить (отстаёт на 9).» — «need update before tests ?»
- After I offered A (reinstall the OS, then a fresh install) or B (set a git identity in `launch.sh` before the server's old updater):
  «Слушай какой-то plo решение опять предлагаешь которые тянется с собой множество проблем хоть одним способом хоть другим способом
  проанализируй системы как подобные задачи должна решаться в принципе давай сначала их решим хорошо что попалась такая беда только ты
  опять предложил заглушку разве нет?»

Retelling: both offers were stubs — B patched one symptom (identity) on one road (the page) and left the cause; A dodged it (and he has no
provider panel to reinstall). Solve the CLASS first, the way such systems are solved in principle, then run the tests.

**The class:** a transition between versions is run by whichever code happens to be there. Four faces, each measured
(`probes/RESULTS.md`):
1. **Which version updates.** The node runs its own, old updater: a fix to the updater never reaches the node that needs it (probe 1: A
   fails at the merge although the target carries the fix; B — the target's updater — passes). After the merge the old process runs its
   old stages while its children come from the new tree: one update, two versions mixed.
2. **Which entry point runs a transition.** The place migration hung on `start`; the update runs `rebuild`; it was missed this morning
   and fixed by a second copy (8f165354). The next migration repeats it.
3. **Who commits.** The machine's identity lives in 10 places with 4 emails and 2 policies; `evolution.mjs` commits with none. 741-8
   added the fourth email instead of finding the other three.
4. **Why a merge at all.** Every install commits (`fresh-project.mjs`), so every node diverges from birth and every update is a merge
   commit — it always needs an identity and may meet a conflict, discovered only minutes into the update.

**How it is solved in principle** (primary source: Homebrew's own updater on this Mac, `probes/RESULTS.md`): a tiny, stable first part
only fetches and hands over; the new code does the rest, migrations included; the machine signs its own commits with its own fixed
identity, never the environment's. Added here: know before touching (a dry merge, 2.2 s), and the transition is tested from an old
version, not only the destination.

Assumptions:
- I assume that the person's own development in the core (676) stays possible, so the merge stays (D39); «code = exactly a release, the
  node's part as an overlay» is the cleaner end and is decided with 676, not here.
- I assume that a node older than 743 cannot be fixed by itself retroactively — only through something newer that runs it: the launch
  page for a server (743-5); a computer's own button runs its old updater once more (its person's identity usually exists; D40).

## 2. What is reused (paths that open)
- `scripts/node-update.mjs` (346 lines, stages check → fetch → backup → local → merge → registry → deps → guards → elements → core →
  skills) — it becomes the target-side updater; its backup, rollback, records (`lib/deploy/node-records.cjs`) and registry merge stay.
- `scripts/node-update-run.mjs` and the door `app/api/node/update/route.ts:89` (spawn-free) — the two starts that go through stage 0.
- `lib/deploy/git-identity.mjs` (741-8) — grows into the one identity module.
- `scripts/dedicated-server/launch.mjs:64-67` `scripts()` uploads files to the server at every press; `launch.sh:89-96` `do_update`.
- `lib/hosting/place.mjs` `migratePlaceRecord` — the first migration of the ledger; its calls `scripts/serve.mjs:155` and `:683` go.
- `components/node-state/origin-notice.client.tsx` (the «version outdated» bar, the update button) and
  `components/hosting/server-launch-check.client.tsx:57` (the launch page's strategy line) — the preflight verdict is shown there.
- `.github/workflows/three-os.yml` — the CI where the transition test runs.
- The probes `./probes/old-updater-bridge.sh`, `./probes/dry-merge.sh` — the tests of 743-6 grow from them.

## 3. Known limits
- `ANTI-PATTERNS.md:49` — a copy of `.ts`/`.tsx` inside the project is code to the core's build: the target's worktree lives OUTSIDE the
  node's folder (`os.tmpdir()`), never in `logs/`; else the core build inside the update breaks with «Cannot find module».
- `node-update.mjs:152-159` — unknown arguments and a start from an agent's session are refused before any change (707-3, the node
  update that killed itself): `--root`/`--preflight` are added to that list, nothing else is accepted.
- The update survives the core build only because it runs outside the core's process tree (`spawn-free`) — stage 0 and the target's
  updater keep that.
- `CLAUDE.md` §6: «Behaviour nobody ordered is never built» — no automatic update, no timer; the preflight runs on a page's open or a
  click, the update only on the person's press.
- Three operating systems (`check:shell-kits`, CI three-os): worktree paths, `tar`, process spawn on Windows.
- `logs/` and `data/` are outside git and survive (`CLAUDE.md` §6) — the ledger lives in `data/node/`.

## 4. Observable results
- The test server at 97a15ca2 (pre-741-8, diverged, no identity) is updated from «Активация выделенного сервера» with one press: state
  done, the merge signed «Fractera node <node@fractera.invalid>», version = the fork's head, `data/node/migrations.json` lists the
  migrations, no worktree left.
- A node whose own commit collides with Fractera's is refused in seconds BEFORE anything is touched, with the file named — on the page
  before the button.
- A CI run shows the transition from an older version proven on three OS, and fails when the handoff or the identity module is removed.

## 5. Substeps (each a vertical slice; order = execution order)
| # | Result | File |
|---|---|---|
| 743-1 | one machine identity: one module, every machine commit through it, a guard | `743-1.md` |
| 743-3 | one door for transitions: the migration ledger, every entry point calls it | `743-3.md` |
| 743-2 | the target updates itself: frozen stage 0 + the target's updater from a worktree outside the project | `743-2.md` |
| 743-4 | know before touching: the dry merge before the backup, the verdict before the button | `743-4.md` |
| 743-6 | the transition tested in CI from an older version, with negative controls; the rules written | `743-6.md` |
| 743-5 | the bridge: the launch page's «Обновить» runs stage 0 from this computer — live on the test server | `743-5.md` |

Order and why: 743-1 and 743-3 first — the target's updater calls both. 743-2 then 743-4 (the preflight is a stage of the target's
updater). 743-6 before any push (the transition test is the gate). ONE push of 743-1…4,6 → CI → fork sync (Chrome) → the warning in its
own turn → ONE node update of this computer (its old updater runs this last time; this Mac has the owner's identity) → 743-5 live from
the page (the owner presses «Обновить») → the 741 server proofs on the updated server → the summaries of 741 and 743, both steps closed.

## 6. Decisions (my pick first)
- **D38 — machine commits always sign as the machine:** «Fractera node <node@fractera.invalid>» for every commit the node's code makes
  (update merges, births, map snapshots, rollbacks, the evolution journal), whatever identity is configured; a person's own `git commit`
  keeps theirs. Why: what the machine did is signed by the machine, the same on every node, independent of the environment
  (Homebrew does the same). Other branch: the configured identity wins (741-8 today) — on this Mac the update merges would keep your name.
  `.invalid` because RFC 2606 reserves it to never resolve; `.local` is mDNS (RFC 6762).
- **D39 — the merge stays** (with the preflight, the identity and the handoff). «Code = exactly a release, the node's records as an
  overlay outside git» (Homebrew's `reset --hard`) is the cleaner end, but it ends the person's own development inside a node's core —
  decided together with 676, not here.
- **D40 — the support window:** a node of 743 or later updates directly to any later version; an older one once through the launch page
  (servers, 743-5) or its own button (computers). Known older servers: one — the test server.
- **D41 — order:** 743 before the 741 server proofs; the test server untouched until 743 is live.
- **D42 — the transition test runs in CI** (three-os) and before every push of an updater change; not in the node's `prebuild` (it adds
  ~30 s to every node's build and needs no node to prove).
- **D43 — stage 0 is frozen:** ≤ 60 lines, a seal checked by a guard, changed only by the owner's word — the one piece of update code
  that old nodes run forever.

## 7. Not in this step
- «Code = release + overlay» (D39, with 676) · the fresh-install proof on a clean OS (needs the provider's reinstall; owed to 737/741) ·
  updates of elements by templates (`element-update.ts` only changes its identity in 743-1) · the tunnel's 403 on `/api/domain/list`
  (not this capability) · an automatic update or timer (never without the owner's word).

## 8. Price
Opus, effort high: ~6–7 h of work for 743-1…6; one node update of this computer (≥ 12 min, the core closed); the live update of the
test server (~15–40 min on the server, the core build inside it). No model calls at run time; no new resident process.

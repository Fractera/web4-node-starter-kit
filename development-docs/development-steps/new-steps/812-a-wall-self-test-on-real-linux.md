# 812 — the wall's self-test on real Linux, before a server ever sees a change

State: PLAN — proposed to the owner 2026-11-20 ~16:05 UTC (Telegram 198), waits his «да». 811 is finished on the server first.

## The owner's words (verbatim, Telegram 195, 2026-11-20 15:58 UTC)

«Слушай включи пожалуйста режим максимального усилия размышлений на максимум и подумай внимательно что нам нужно сделать чтоб подобные
ошибки не повторялись связанные с шаблоном root custom starter …»

## What happened (measured, 811-6 live on 109.199.105.213)

The wall of 811 (a Linux user per custom element) was proven only DRY on macOS: the helper printed its acts, Linux never ran them. The
first real Linux run was the owner's server, three failures in a row, each a fact of Ubuntu a DRY test cannot see:
1. Ubuntu 24.04 makes a home 0750 (HOME_MODE) — fe-root could not reach its own folder (`walls` opens the way only at the node's start).
2. sudo keeps the caller's cwd — `add`'s `git config --global safe.directory` as fe-root ran from the node's closed folder, git could not
   read its cwd, and the helper ignored the failure (no exit-code check) — the gap surfaced three layers later.
3. git refuses a repository owned by another user («dubious ownership», git-config `safe.directory`: respected only in protected
   configuration — system, global, command scopes; git-scm.com/docs/git-config, read 2026-11-20).
Plus: «Продолжить установку» reused root's record of the previous run, so the node's git shim ran git as fe-root BEFORE the installer's
`add` — an order the DRY test never had.
The existing CI (`.github/workflows/three-os.yml`) says itself what it does not prove (systemd, pm2, a server); it is red on Windows
since 2026-11-19 and nobody read it — a gate nobody reads is not a gate.

## The shape

One script, three places, one verdict.

- 812-1 `scripts/dedicated-server/wall-selftest.sh` (root, ~10 s): a throwaway custom element `selftest` shaped like the custom
  template — a folder in `WEB4-ITEMS/user/selftest` owned by the node user with a git repository, a package.json with an install script,
  a tiny node server — through the real helper: add (user, ACLs, the way), run git status/checkout as it, npm install with the script,
  unit-start the server on a free port and reach it, unit-stop (the port freed), the agent verb under a pty (`/bin/echo ok`), signal;
  negatives as fe-selftest: read the node's `.env.local`, list another element's folder, `curl` the core's architect door (peer-uid) →
  refused; then remove (user, records, ACLs gone). Every check prints `ok` or the first missing fact in words («fe-selftest cannot enter
  /home/fractera — mode 0750»).
- 812-2 the helper fails loudly: every `act` in a verb checks its exit code; a failed act stops the verb with its reason (the silent
  `git config` of failure 2 would have said «cannot read the current folder» at `add`).
- 812-3 the server: the self-test is the first stage after `prepare` in every install, continue and update — before the 40-minute
  build; its failure stops the launch with the named reason in the page's stage list.
- 812-4 GitHub: a job `server-wall` on `ubuntu-24.04` (the server's Ubuntu) in the core's CI — the node user, the node's folder under
  /home like a server, the wall's stages of prepare.sh for real, then the self-test. Red before the code reaches any server.
- 812-5 the launch page shows the CI verdict of the commit it installs (🟢 checked on Linux · 🔴 failed, with its link · ⚪ not
  checked) — a public API, no token.
- 812-6 my rule (self-review, the owner's yes): a server-side change is never called «ready for a server» on DRY proofs; the second plane
  is the self-test on Linux.

- 812-7 (found 2026-11-20 16:25, Telegram 202/203): a continued install rebuilds the core whenever HEAD moves (`build.sha` = the whole
  HEAD) — a fix in `scripts/` alone cost ~12 min of core build under memory pressure (10 elements running, 350 MB free). The core is
  rebuilt only when what it is built from changed (`git diff --name-only <built>..HEAD` outside scripts/dedicated-server, docs, tests).

## Price named aloud

My work ~2–3 h; GitHub's runner costs nothing while the repository is public; +~10 s per server install; no resident process.

## Open

- Windows red in three-os since 2026-11-19 («Сборка со всеми сторожами») — a separate defect to look at.

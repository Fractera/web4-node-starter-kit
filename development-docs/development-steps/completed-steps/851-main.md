# 851 — no false «not-started» for a walled element

Repository: the core (Fractera/web4-node-starter-kit and the fork aifa-agi), branch main; live on the Mac from the core build 549ac246 (builtAt 2026-11-24T14:16Z), pushed 15:32–15:33 UTC (e08ab8c5). The server proofs wait for the servers' update.
Commits: 99a3f1ad.

## Done
- The start check reads the journal as fe-<id>; an unreadable journal with no question on the screen logs «начало не проверить — журнал не прочитан; тревоги нет».

## Proofs
- Plane 1: journal-since test — a 0000 folder → unknown/EACCES (negative: a readable journal without the task → not).
- Plane 2: after the servers' update — the next task to a walled element raises no false line (the server's agent reads the core's log).

## Mistakes
- none beyond 850's.

## Evolution of skills
Nothing to change: server-wall §5 837-0f and §6 already named both traps met here.

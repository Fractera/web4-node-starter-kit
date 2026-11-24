# 856 — «Выключить его?» never after every answer

Repository: the core (Fractera/web4-node-starter-kit and the fork aifa-agi), branch main; live on the Mac from the core build 549ac246 (builtAt 2026-11-24T14:16Z), pushed 15:32–15:33 UTC (e08ab8c5). The server proofs wait for the servers' update.
Commits: 8c03de50.

## Done
- done() of any element in a conversation the person started answers without a question; progress.cjs hintOnce runs for every agent's bot; the finish rule says so. Kept: «выключить», work sessions, woken-by-main without a bot, supervision, the 60-minute reminder.

## Proofs
- Plane 1: close-once contract test 7 checks (the order in done(), the hint unconditional, the reminder kept).
- Plane 2: after the servers' update — lidt5 and a custom element: three answers → `asked false` ×3, one hinted.json entry (the server's agent reads the log).

## Mistakes
- The bridge's done() needs a live pty to run in a test — only a contract check here; the live plane is the server's log.

## Evolution of skills
Nothing to change: server-wall §5 837-0f and §6 already named both traps met here.

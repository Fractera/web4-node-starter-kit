# 844 (owed) — the icons door asks the element first

Repository: the core (Fractera/web4-node-starter-kit and the fork aifa-agi), branch main; live on the Mac from the core build 549ac246 (builtAt 2026-11-24T14:16Z), pushed 15:32–15:33 UTC (e08ab8c5). The server proofs wait for the servers' update.
Commits: cd8bfbd4.

## Done
- elementTakes() reads the element's settings declaration, writes nothing; app/api/architect/icons asks it before /media/upload.

## Proofs
- Plane 1: POST a 512×512 PNG for cck60 → {"ok":false,"reason":"template-older"} HTTP 409 in 0.076 s; storage files 6 before, 6 after (no orphan).
- Plane 2: a text file → 400 not-an-image (the old negative still holds).

## Mistakes
- none.

## Evolution of skills
Nothing to change: server-wall §5 837-0f and §6 already named both traps met here.

# 750 — deleting an element leaves nothing alive behind it; names follow an element on a server; no delete where the door refuses (closed 2026-11-15)

## The person, verbatim
After 749's report: «go to continue, after 750»; the plan approved 14:37 UTC: «да, утверждаю 750-1…4 целиком, go , but test only in
aifa.dev». The input — the wishes W1–W5 found during 749 (the plan's `wishes.md`, recoverable below).

## Substeps
- 750-1 deletion closes the agent and its worker first, forgets the supervision record (`750-1.md`, `4e119187`)
- 750-2 deletion on a server removes the name from nginx (and the A record by the node's token, else named) (`750-2.md`, `4e119187`)
- 750-3 a renamed element's name follows it on a server (`750-3.md`, `971f70cb`)
- 750-4 no delete button for an element installed with the node (`750-4.md`, `0a3b7f52`)

The chain 85/85; pushed, the fork synced; live on aifa.dev since its merge `75df7301` (started 14:51 UTC); every live proof on aifa.dev
only, by the owner's rule, on one throwaway element «Проба 750» born, renamed and deleted there (14:55–14:59 UTC).

## What the step gives now
A deleted element leaves no agent running, no supervision record and, on a server, no name on the edge; a renamed element answers on its
new name over HTTPS on a server; the site element's danger zone says why it cannot be deleted instead of offering a button the door refuses.

## What is not done
W4 (`/api/node/online`, the Cloudflare copy read «no tunnel = no domain»; hidden or not used on a server) — named only. The A record of a
deleted name outside Cloudflare is left by design (750-D2). The owner's Mac runs 750 after its next update (no tests there, his rule).

## Mistakes
- A text replacement in the summaries replaced the prefix `LIVE_3` inside `LIVE_3_SEEN` — caught by the assertion before writing; fixed by
  ordering. Placeholders that share a prefix are replaced longest first.

## Evolution of skills
Nothing to improve.

## The plan
Deleted in this commit; recover it:
`git log --diff-filter=D --format=%H -1 -- development-docs/development-steps/new-steps/750/750-main.md`
then `git show <hash>^:development-docs/development-steps/new-steps/750/750-main.md` (the same for `750-1.md` … `750-4.md`, `wishes.md`).

# 851 — No false «not-started» for a walled element

Source: the main agent of the server fractera.ai (core e638fed7), forwarded by Roma 2026-11-24 (Telegram 1288–1295), kept as data in
`pre-steps/2026-11-24-*.md`. Roma 1296 (13:45 UTC), verbatim: «Строй план пожалуйста по реализации этих проблем и их решений и решай это
самостоятельно … Действуй пока не завершишь, только по окончании каждого отдельного решения предлагай сделать Git Push. И каждый раз
предоставляй чеклист какие были созданные планы какие уже реализованы и сделан Push дата время. Меня больше не беспокой … работай».
The owner's approval of the plan is that word; every substep keeps two proofs, one with a negative control.

## The defect (pre-steps/2026-11-24-server-agent-for-mac.md §3)

On a server the element's journal is 0700 of its own user `fe-<id>`; the core reads it as «no task» and sends a false
`⟦node · not-started⟧` (reported 2026-11-23, never recorded here — recorded now).

## Substeps

- **851-1 · The start check reads the journal as the element.** Every read of an element's session journal by the bridge on a wall goes
  through the helper run as `fe-<id>` (the path of 839-13), never `fs` as the core's user; an unreadable journal is «unknown», never
  «no task». Proof: `scripts/element-wall.test.mjs` grows a case — a 0700 journal of another user → «unknown», not `not-started`
  (negative: a readable journal without the task → `not-started`); on the server the next task to a walled element raises no false line.

Rides the next core build; shares `bridge.cjs` with 850.

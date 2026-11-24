# 850 — A core task never stalls a person's live chat

Source: the main agent of the server fractera.ai (core e638fed7), forwarded by Roma 2026-11-24 (Telegram 1288–1295), kept as data in
`pre-steps/2026-11-24-*.md`. Roma 1296 (13:45 UTC), verbatim: «Строй план пожалуйста по реализации этих проблем и их решений и решай это
самостоятельно … Действуй пока не завершишь, только по окончании каждого отдельного решения предлагай сделать Git Push. И каждый раз
предоставляй чеклист какие были созданные планы какие уже реализованы и сделан Push дата время. Меня больше не беспокой … работай».
The owner's approval of the plan is that word; every substep keeps two proofs, one with a negative control.

## The defect (pre-steps/2026-11-24-server-agent-for-mac.md §1)

lidt5 on fractera.ai answered Roma in its bot at 11:04 UTC; 11:04–11:06 the core queued three `npm run task` into its live session; the
node logged «работа началась», yet its journal has no entry after 11:07:24Z and Roma's two Telegram messages stayed `enqueue` without
`dequeue` for 40 minutes. `close` + `task` with his words brought it back in 5 s. Hypothesis: the paste stayed unsent on the input line and
Claude Code held the channel queue behind it; «started» was read from the screen.

## Substeps

- **850-1 · «Started» only from the journal.** `bridge.cjs` (master in the kit, copies by `agent-kit:update`): the start check (line ~696,
  `conversationSince`) counts a user entry written after the paste, read as the element on a wall (the helper of 839-13); a screen alone
  never says «started». Proof: a paste left unsent (negative) → `not-started` with its screen line; a paste taken → «started».
- **850-2 · A channel message that waits is named.** An `enqueue` with no `dequeue` for 90 s in the element's journal → the node tells the
  main agent the screen line and the person in the element's own chat («ваше сообщение ждёт: …»). Proof: a held input line (negative:
  a normal turn raises nothing).
- **850-3 · No paste while the person talks.** A core task for a session whose person wrote in its bot within the last turn waits for the
  turn's end (the same queue «pastes it when its screen is free», «free» now = no channel message waiting and no turn running). Proof:
  a task sent during a person's turn is pasted after it; the person's next message is answered (negative control: z8asv-like idle
  session gets the paste at once).

Rides the next core build. Not in it: the element template.

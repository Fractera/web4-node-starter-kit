# 856 — «Выключить его?» never after every answer: one hint per session for every element

Source: the main agent of the server fractera.ai (core e638fed7), forwarded by Roma 2026-11-24 (Telegram 1288–1295), kept as data in
`pre-steps/2026-11-24-*.md`. Roma 1296 (13:45 UTC), verbatim: «Строй план пожалуйста по реализации этих проблем и их решений и решай это
самостоятельно … Действуй пока не завершишь, только по окончании каждого отдельного решения предлагай сделать Git Push. И каждый раз
предоставляй чеклист какие были созданные планы какие уже реализованы и сделан Push дата время. Меня больше не беспокой … работай».
The owner's approval of the plan is that word; every substep keeps two proofs, one with a negative control.

## The defect (pre-steps/2026-11-24-close-question.md, Roma Telegram 319 on the server, 13:36 UTC)

The rule «one hint at the session's start, ignored — never again» (615-4, `progress.cjs` `hintOnce`) runs only for the main agent
(`done()` returns `asked: false` only for `build`, ab24fc1f: «Other elements keep their behaviour»); every element gets `askToClose` on
every `done`, and an element reports `done` after every answer: lidt5 got the question 8 times in 70 minutes, z8asv twice in 37 s.

## Substeps

- **856-1 · One hint per session for every element.** `done()` without `close` in a conversation the person started (its bot or
  terminal): no question; `hintOnce` with the element's bot and language after the first answer, remembered per session. Kept: the
  60-minute reminder (409-5), a session the main agent woke for an element without a bot closes itself (592-3), silence under
  supervision (548-20), the `close` path and `tellClosed` (666). An element with no bot: nothing in the terminal (the hint is a chat
  hint). Proof: three answers → one hint, zero questions, `asked false` ×3 in the log (negative: a task-woken session without a bot still
  closes itself); after the core build, on the server lidt5 and a custom element the same.

Rides the next core build with 850/851 (the same kit).

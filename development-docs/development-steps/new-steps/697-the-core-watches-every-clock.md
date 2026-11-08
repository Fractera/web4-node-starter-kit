# 697 — The core watches every clock: one canvas, a digest, a word when an entry did not run

**State: APPROVED 2026-11-08** — the owner, verbatim: «Б, только сообщать — планируй и начинай»; and «проверить что все возможные задачи
из элементов переносится на главный холст Cron событий. Также в ядре в компактной версии левого меню кроны вытащи наружу и поставь под
главный Telegram бот. Слово главный Telegram бот переименуй оставь просто Telegram бот. Я хочу увидеть как появляются Krohn события и как
они описаны поэтому создай несколько и давай вместе посмотрим». The question before it: «все Krohn события должны всегда жить только в
основном агенте … у меня почему-то кажется что текущий архитектуру у нас с этой точки зрения очень сильно сломана?»

## What was read (2026-11-08)
- Each element's clock runs inside its own server by `<folder>/data/cron.json` and logs `data/cron-runs.jsonl`; the core's minute tick
  already reads every calendar and wakes an element asleep by the load rule 2 min before an entry (663-4, `calendar-wake.cjs`).
- Silent holes: `if (!off || !off.byRule) continue` — an element off by its person, a process that fell, a computer that was off: the
  entry does not run and nobody is told. The main canvas (`build/automation/cron`) shows only the main agent's own calendar.
- Variant A (every clock only in the core) refused: an element lives without the core (§3, the app factory), another owner's schedule
  would sit in the core (force 5), and a core clock waking element agents breaks «a clock wakes only its own agent» (§6).

| Substep | Result | Proof |
|---|---|---|
| 697-1 | The main canvas holds every element's real entries (never the template's seed), named by the element, with their runs; paused when the element is off or its automation is off | the canvas's data with two elements' entries; an element with only a seed shows none |
| 697-2 | The watcher: in the same minute tick, an element's entry with no run line 3–60 min after its time → ONE notice to the person through the core's notice door, with the reason (off by you · asleep and not woken · its process does not answer); never a wake, never a model; an element whose automation is off is skipped | a planted entry with no run → one notice, the second tick none; a run line → none; automation off → none |
| 697-3 | `npm run clocks` — every element's entries today and the next, the missed named; one line in `where` | the command on the owner's node |
| 697-4 | The menu: in Compact «Cron события» right under the Telegram bot; «Главный Telegram-бот» → «Telegram-бот» (en «Telegram bot») | eyes on the menu |
| 697-5 | Live, together with the owner: a few entries created (the core's own and elements' by their workers), seen on the canvas | the owner looks; the canvas and a notice |

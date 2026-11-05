# 656 — the deep memory's landing tells about reminders at a time and its calendar (plan)

## Retelling and decisions

The owner, 2026-11-05 during 654-1, verbatim: «Смотрю описание для глубокой памяти то есть landing и увидел промах проверь глубокая
память имеет работать с календарем и там это нигде не описано»; on the routing, in the choice window: «Шаг 656 сразу после 654-1
(Рекомендую)» — the option said: a section about reminders at a time and the calendar on the memory landing (en, ru), «напомни о»
(asking) told apart from «напомни в срок», humanizer and eyes, the release delivered in one node update with 654-2's memory release.

**Checked (2026-11-05):** the landing (`fractera-memory-starter` `app/[lang]/(publicLayer)/_data/en.json`, `ru.json`, v2.2.22) uses
«Remind me about…» / «Напомни о…» only as recall; the reminder at a time is nowhere on it. What the memory does (node step 636, README
§«A reminder at a time — the memory's own essence»): `remember` with `remind: { at, repeat?, text? }` keeps the phrase and adds an entry to
the memory's own calendar (`data/cron.json`, event `node-notice`, `lib/memory/reminder.mjs`; repeats once, daily, weekdays, weekly,
monthly, yearly); at its minute the memory's clock surfaces «⏰ Напоминание · memory» in the node's main chat with no model; the entry is
seen in the core under «Memory → Cron events»; the receipt names the date in words; the memory stays on while a reminder waits; the
computer off at that minute — the run is missed and the calendar shows it. The core's side: «Напомни мне <когда> …» → `npm run remember
-- "<words>" --remind-at "<YYYY-MM-DD HH:MM>"`.

## What is built

- The landing, en and ru, in the Stripe sample's look and voice (650-4): a section on reminders at a time — what to say, where the entry
  lives (the memory's calendar, «Memory → Cron events»), how it comes back (⏰ in the main chat at its minute, no model, no tokens),
  repeats, what happens when the computer is off; the lines that say «Remind me about…» name it as a question to the memory, so the two
  are not confused; the section «solves» and the page description get the reminder. Every claim checked against README and
  `reminder.mjs`; `humanizer` over the texts.
- Release: `Fractera/fractera-memory-starter` next patch, pinned in the core; delivered in one `node:update` with 654-2's memory release.

## Done when

A person reading the memory landing learns that it reminds at a time, how to ask, and where the reminder lives.

## How it is proven (named in advance)

1. **Eyes on the owner's node** (`npm run eyes`, light, dark, 390 px): the new section in its place, 0 console errors, no overflow.
2. **Words:** `check-i18n` both ways; every claim of the section matched to README / `reminder.mjs` (a list in the summary); **negative
   control: the search for «calendar» / «календар» on the landing finds 0 before and the section after.**

## Not in it

The core's «Как это работает» and the kit README (checked separately when the step starts); any change to how reminders work.

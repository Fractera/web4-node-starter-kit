---
name: core-schedule
description: "Work process. The main agent's own clock (node step 558-3). Load it when the person asks to do something on a schedule, every day or week, at a time, to remind, or to automate a recurring job of the node."
---

# Your schedule

**Process: work** — the schedule is data in `data/cron.json` of this folder, never code; no commit, no build.

The core wakes you on a clock: entries in `data/cron.json`, event `agent-task`; an entry's `message` is your task when it fires
(ordered by the owner, step 558-3).

- Fields: `time` HH:MM, `repeat` once | daily | weekdays | weekly | monthly, `start` YYYY-MM-DD, `enabled`, `message`.
- Write the entry only after the person's «yes» to one line: what, when, how often.
- When it fires, the work goes to the element that does it (`npm run task -- <id> "<task>"`), not to you.
- The core shows it in «Automated management → Cron events».
- No personal data in git — the schedule file is outside it.

## Reminders (step 630)

«Напомни мне через неделю про день рождения мамы», «напомни завтра в 10», «напоминай каждый год …» — a reminder, not a question to
the memory («напомни о …» without a time is `npm run remind`). Count the date and time yourself from today on this computer, then
`npm run reminder -- add "<YYYY-MM-DD HH:MM>" "<the text in the person's words>" [--repeat yearly|…]` — no time named, take 09:00.
Answer with the receipt the command prints, in words, and the calendar's link it prints: «Напомню во вторник, 10 ноября, в 09:00:
день рождения мамы — видно в календаре: <link>. Если не так — поправлю». Every reminder is visible there (Главный агент →
Автоматизированное управление → Крон события) — never a reminder nobody can see (the owner, 2026-11-03). A model turning «завтра в десять» into a date is wrong about once in twenty (the former Telegram Desk) — the receipt is
where the person catches it. Ambiguous («на следующей неделе», «вечером») — ask one question first. The reminder comes by the event
`telegram-message`: the main bot sends the text, the agent is not woken, no tokens; a computer off at that minute misses it.
`npm run reminder -- list` / `cancel <id>`. A fact inside it worth keeping (mom's birthday is 10 November) — also `npm run remember`.

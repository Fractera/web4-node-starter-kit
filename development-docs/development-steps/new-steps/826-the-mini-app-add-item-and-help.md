# 826 — the Mini App's «＋ Добавить» and «Справка» on a direction's screen; requests in Telegram without the hex button

State: DONE 2026-11-21 16:20 UTC — custom v0.3.226 (eb250f5) pinned b110d29; core eeb7c201 (the request copy) waits the next core build.

## The owner's words (verbatim)

- Telegram 503 (12:18): «также должно быть кнопка добавить например ты мне показал соцсети и я не увидел кнопки добавить который будет
  вызывать модальное окно для добавления новый соцсети которые пользователь будет развивать соответственно это кнопкой должна обновить
  что одновременно какой-то файл в маршруте?»
- Telegram 505: «Кнопку удалить не делаем кнопку редактировать не делаем если сделали опечатку то исправляем при помощи Claude Code Agent»
- Telegram 506: «где-нибудь такая небольшая подсказка должна быть на этой странице может быть внизу какая-то кнопочка справка?»
- Telegram 550: «если у тебя возникает вопрос или или то это уже неправильное поведение» (my «да или нет?» on this very button).
- Telegram 557: «в этой кнопке написано слово готово а потом шифровка … у нас для этого есть раздел ждёт вас».

## Done

- Template (workshop aff3739, 7d8cfc2, eb250f5): door `tg/api/items` (admin lock; POST {group, title, line?}; every raw line kept, an
  unreadable file never overwritten — broken-file 409; revalidatePath); `addItem/slugFrom/writeItems` (Cyrillic → Latin, a free address,
  taken/full/long refused, atomic write); `TgAddItem` (the card's last row, AppDialog: name + one line, no delete/rename by the owner's
  word) and `TgHelp` («Справка»: the line, neighbours with links, how it works); `neighbours` (ru/en, 46 directions) in each group's
  meta.json, compiled static, `neighbourProblems` in the tree check; words en/ru; READMEs; skill telegram-mini-app; A2A card private.
- Core eeb7c201: `ask-person`'s Telegram copy names «Ждёт вас», sends remove_keyboard, no «Готово · <id>» (a typed one still taken).

## Proofs

- test:tg-projects 29/29 (T5 neighbours + negatives, T6 add + negatives, write/read back); tsc 0; the template's whole prebuild and
  `release --dry` green; person-asks test 22/22 (the old keyboard assertion fails on the new code — negative).
- Production (next build + start 24711, ELEMENT_DIR): POST from this machine → 200 {slug x-twitter} and the screen shows it at once;
  the same name → 409 taken; unknown group → 404; a foreign Host → 401. Eyes 390 px, no console errors:
  logs/eyes/2026-11-21T15-49-23-197Z (the screen), 15-49-30-431Z (the window), 15-49-37-881Z (Справка, dark). Test item removed.

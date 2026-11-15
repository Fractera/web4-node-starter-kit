# 745 — «Рабочий процесс» of the native auth and memory elements: sign-in providers and backup

The owner, 2026-11-14/15 (verbatim): «Некоторое время назад на элементе авторизация была реализована опции которые позволяют добавлять
Credentials для Google и для ресенд по полностью построен этот поток но в какой-то момент решил с стандартизировать элемент.
С стандартизировать это хорошо но эти опции нужно восстановить. Аналогичные проблемы существовали для резервного копирования в базе
данных, объектом хранилище, граф, векторные хранилище…»; then «Нативные элементы в компактном режиме показывать не надо, Все что я тебя
прошу это чтобы у нас в нативном клиенте авторизация появились в рабочем процессе вкладка провайдера. Вкладки Google и волшебное письмо
по умолчанию существуют и при нажатии на них появляется страница где можно ввести Credentials. А также на вкладке провайдеры есть
кнопка добавить нового провайдера при переходе на эту кнопку открывается страница с инструкцией пользуйтесь терминалом ссылка на
терминал и расскажите через какой провайдер вы хотите обеспечить вход в вашу узел. Больше ничего делать не надо то что касается
страницы для резервного копирования верни их туда где они были если ты понимаешь о чем я»; to my reading (backup into «Рабочий
процесс» of the four memory elements) and the plan: «Да, начинай 745, Волшебное письмо it is Resend».

## Measured before (2026-11-14 23:40–23:50, this node and aifa.dev)
- The screens live: /ru/auth/google and /ru/auth/resend (setup ladders `authGoogleSetup`, `authResendSetup`, step 265/266) open, but
  the auth element's menu (Живой сайт · Пользователи · Проектирование продукта · Строительство · Крон события · Настройки) leads to
  neither; on those pages the element's menu is gone (they are folders outside the element tree).
- «Резервное копирование» (558) stands below «Строительство» of data and storage (seen in the full menu; vectors, graph by the same flag).
- The law it changes: CLAUDE.md §3 «A native element has no working process and no payments» (551-1, the owner 2026-10-20: «всю вкладку
  рабочие процесс мы должны немедленно удалить из native element»). His word of 2026-11-15 narrows it: a native element's «Рабочий
  процесс» holds only the screens of its data.

## Substeps
- 745-1 The tree (`lib/web4-items/item-tree.ts`): `orAuth`/`orMemory` beside `orPayment` — «Рабочий процесс» for the auth element and
  the four memory elements; its «Терминал» and «Процесс» stay custom-only; «Провайдеры» (auth) → «Google», «Волшебное письмо», and
  «Добавить провайдера» (`listed: false` — reached by the button only, neither a menu item nor a card); «Резервное копирование» moves
  under «Рабочий процесс» (old addresses by `MOVED_PREFIXES`); `aboutNative` for the section's words on a native element.
- 745-2 The element page: «Google» and «Волшебное письмо» show the same screens with their texts (the old folders' content and
  topics, tabs); «Провайдеры» carries the «Добавить провайдера» button; «Добавить провайдера» — the instruction and the link to the
  auth element's terminal; the backup keys under `workflow/backup/…`.
- 745-3 The old addresses /{lang}/auth/google and /{lang}/auth/resend (both forms) answer 307 to the new tabs (`next.config.ts`); the
  old `page.tsx` files go, their words and working parts stay in their folders as the screens' source.
- 745-4 CLAUDE.md §3 — the native element's working process only for its data, sealed.
- 745-5 Proof and release: `scripts/item-tree.test.mjs` (prebuild) — auth sees workflow/providers/{google,magic-link,add}, not
  workflow/terminal or process; data sees workflow/backup; config sees no workflow; a custom element sees terminal and process, not
  providers or backup; the add page is in no list — negative control: the tree of git HEAD fails it. Live on both nodes after the
  update: the menus, both screens with their fields, the button, the instruction with its link, the backup pages, the redirects.
Not in it: native elements in the compact menu (his word: not needed); new providers themselves; the backup service itself.
Parts born here: none — Button, Link, the setup ladders and the tree's own list are reused.

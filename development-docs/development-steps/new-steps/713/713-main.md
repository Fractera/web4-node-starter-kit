# 713 — the element's Design and Site settings tabs: one logical flow, not a dump

The owner 2026-11-09 ~20:20 WET, verbatim, after seeing the two tabs of 711/712: «те страницы которые ты сделал внутри страницы архитектора
для настройки сайта и для дизайна … это просто огромная свалка и куча блоков … одни контейнеры шире другие уже но это помойка … Разве не
существует какого-то навыка дизайна который помог бы тебе сейчас в этой работе сделать две красивые страницы с которыми клиенту удобно
работать посмотри навыки и переделайте две страницы … это просто спагетти дизайн». To my proposal: «Я не знаю какую команду ты не ожидаешь
я не буду тебе ничего корректировать просто сделай нормальный человеческий логический дизайн который проходит от начала и до конца не
спагетти дизайн и найди меня когда твой внутренний критик скажет это восхитительно» — the plan is approved by that word; no questions;
report only when the critic says «delightful».

The method: skill interface-design (dammyjay93, ★5909, MIT) — read, not installed; my words: intent first (the architect, a non-designer,
often on a phone; the verbs «decide how my element looks», «set my site up»; the feel of a calm settings app); one focal point per view;
navigation is the product; one column, spacing from one base unit; hierarchy by weight and muted colour; depth by borders only, no card in
a card; states said in words; only the project's primitives. The critic: squint, swap, one focal point, width, 390 px, console.

Measured before (eyes, build ecc66c40, stand qfx9w): the Design tab is 7273 px tall at 1440 — six framed cards, the brief narrower than
the rest, 22 skill cards in a two-column grid, a card in a card in a card for a prototype with 160 px shots; Site settings: a half-width
CONFIG card, two titles with the same lead, eight tabs, a serif display H2 for Web4 below the save button.

- 713-1 Design: the composition owns both sources (the remote files brief+design and the 711 door) — `use-design-state` hook, a step
  track «1 Бриф · 2 Навыки · 3 Пробы · 4 Закрепление · Тонкая настройка» with each step's state in words, the first unfinished step open,
  the step in the address (`#brief` …), every panel kept mounted (an unsaved brief survives a step change), «Дальше» at each panel's end;
  «Как здесь устроен дизайн» one quiet line that opens.
- 713-2 Design panels without frames: the brief in one column; skills — the project's skills as rows with «На тест», the search as compact
  rows, five per source and «ещё N»; the empty own collection says how to fill it (the bot or the terminal); trials — per test skill the
  references, the price and «Сгенерировать», progress rows with «Открыть / Собрать» and «Обновить»; pin — the ready prototypes large
  (computer and phone shots together), «Открыть / Собрать / Закрепить», the pinned one marked; fine tuning — the template's editors as
  they are, only the frame.
- 713-3 Site settings: one line on top for the CONFIG link (ElementLink `variant="line"`), a section list (left from lg, a strip on a
  phone) and the one chosen section with its own title, lead and save; Web4 is the last section (ElementWeb4 `bare`, the owner's two cards
  and the star stay); linked to CONFIG → the read-only values and Web4 only; the images note only under «Мета и медиа».
- 713-4 Words EN+RU through the dictionaries; the two leads of the tree shortened; guards (tsc, api, dialogs, typography, shadcn-rules,
  element-settings, i18n of the touched files, broken characters).
- 713-5 Delivery and the critic: commit, push, CI, fork sync (Chrome), node update; eyes at 1440 and 390 on qfx9w (Design: each step;
  Site settings: each section), console clean; the critic's tests; fix and repeat until «delightful»; then the report.

Not in this step (said aloud): the node's alarm strips above every architect page stay as they are — the owner decided on 2026-10-02 that
the temporary-address alarm «не сворачивается», and each strip has «Больше не показывать»; collapsing them waits for his word.

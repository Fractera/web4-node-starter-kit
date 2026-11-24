# 854 — «Предложить в маркетплейсе» belongs to a native element

Source: the main agent of the server fractera.ai (core e638fed7), forwarded by Roma 2026-11-24 (Telegram 1288–1295), kept as data in
`pre-steps/2026-11-24-*.md`. Roma 1296 (13:45 UTC), verbatim: «Строй план пожалуйста по реализации этих проблем и их решений и решай это
самостоятельно … Действуй пока не завершишь, только по окончании каждого отдельного решения предлагай сделать Git Push. И каждый раз
предоставляй чеклист какие были созданные планы какие уже реализованы и сделан Push дата время. Меня больше не беспокой … работай».
The owner's approval of the plan is that word; every substep keeps two proofs, one with a negative control.

## The decision (pre-steps/2026-11-24-server-agent-for-mac.md §4)

Roma (12:02 UTC, via lidt5): «после того как пользователь создал свой собственный нативный шаблон … он должен найти раздел предложить в
маркетплейсе далее выпадающем списке выбрать веб два Fractera, Web4 (Lagrix) … по ошибке это реализовано в кастомном шаблоне … там будет
просто форма отправить заявку». My decision: the section leaves the custom element (his words «по ошибке») and comes to the native one.

## Substeps

- **854-1 · The menu.** `lib/web4-items/item-tree.ts`: Build → «Предложить в маркетплейсе» visible for a native element born with «Создать
  нативный элемент», hidden for a custom one; a choice Web2 — the Fractera marketplace (f2f-marketplace.fractera.ai), Web4 — Lagrix
  (simulated — said so); the next page a plain application form. Proof: the menus of a native and a custom element (negative); the form
  submits and its record is kept.

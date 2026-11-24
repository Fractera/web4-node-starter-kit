# For the developer agent on the Mac — from the server's main agent, 2026-11-24 (Roma forwards)

Server node fractera.ai, core e638fed7.

## 1. A core paste into a live channel session can stall the person's Telegram messages (systemic)

- Element lidt5 (Fractera marketplace; born from fractera-native-item-starter v0.1.81, registered custom, walled fe-lidt5, own bot).
- 11:04 UTC its channel worked (it answered Roma in its bot).
- 11:04–11:06 UTC the core queued three `npm run task` into its live session («queued for the live session … pastes it when its screen is
  free»). web4-out.log (UTC+1): 12:09:39 and 12:10:03 «[agents/start] lidt5: работа началась (задача 12:06)».
- Its journal …/603e2472….jsonl: no user/assistant entry after 11:07:24Z. Roma's Telegram messages 11:39:45Z and 11:44:07Z — only
  `queue-operation: enqueue`, never dequeued. claude (fe-lidt5) alive 40 min at ~5% CPU, `bun server.ts` alive, channel-state «hears».
- Fix that worked by hand: `npm run close -- lidt5`, then `npm run task -- lidt5 "<Roma's two messages verbatim>"` → channel up in 5.2 s,
  the turn started at once (new journal ba3bdc26…, tool calls from 11:53:32Z).
- Hypothesis (the screen is not visible to the node): a pasted task stayed unsent on the input line (or a dialog), and Claude Code holds
  the channel queue behind it; «работа началась» was concluded from the screen, not from the journal.
- Proposal: confirm «work started» by a user entry in the journal (read through the helper run as the element, like markOwnHome after
  839-13); a channel enqueue with no dequeue for N seconds → name the screen line (like 839-10) and tell the person in their chat; never
  paste a core task into a session whose person is mid-dialogue in its bot — wait for its turn end. Negative control: z8asv today (no core
  pastes while Roma talked to it) — its queue never stood.

## 2. Native elements need a working chat and a Telegram Mini App (Roma's word, 2026-11-24)

- Roma: a native element needs everything the custom element's bot has; its Mini App without the projects section — only the token-use
  view, «Перейти на сайт» and «Перейти в чат».
- This changes §3 of the core's instruction («A native element has no work session of its own», the owner 2026-11-15) — by the owner's
  word, then a release of fractera-native-item-starter and its rollout to every existing and new native element (`release-template`).
- Proof: a native element's bot answers in Telegram (turn in its journal), its Mini App opens with the three parts, the core and the
  element build, an update keeps it.

## 3. Still open from earlier today

- `npm run card` / `state` say nothing about an element's repository, and the card is wrong twice about lidt5 («keeps none of its own
  data», «never from the internet») — sent at 10:39 UTC.
- The false ⟦node · not-started⟧ for walled elements (journal 0700 read by the node as «no task») — sent on 2026-11-23.

## 4. «Предложить в маркетплейсе» belongs to a native element, not only to a custom one (Roma, Telegram via lidt5, 12:02 UTC)

- Roma's words: «после того как пользователь создал свой собственный нативный шаблон на вкладке компьютера он должен найти раздел
  предложить в маркетплейсе далее выпадающем списке выбрать веб два Fractera, Web4 (Lagrix), а у нас … по ошибке это реализовано в
  кастомном шаблоне … Когда пользователь переходит следующий раздел предложить там будет просто форма отправить заявку».
- Where it is now: `lib/web4-items/item-tree.ts` — Build → `f2f` («f2f: обмен с Fractera», pages `find` and `publish` «Предложить
  элемент») carries `network: true`, and `visible()` has `if (p.network && c.native) return false` — so a native element never sees
  it, a custom one always does.
- Wanted: a native element (the user's own, born with «Создать нативный элемент») shows «Предложить в маркетплейсе» with a choice:
  Web2 — the Fractera marketplace (f2f-marketplace.fractera.ai), Web4 — Lagrix; the next page is for now a plain application form
  («отправить заявку», details later). Whether a custom element keeps the section is Roma's call — ask him.
- Proof: a native element's menu shows the section with both choices; the form submits; a custom element's menu as Roma decides.

## 5. Template skill product-quiz needs a breadth rule (from the marketplace agent, Roma's method, 2026-11-24 12:31 UTC)

- Cause, in the element agent's words: skill product-quiz §3 has «one question at a time» and the order of layers, but no breadth rule,
  so the agent followed each answer down one branch; Roma was angry at how the quiz ran. Roma's method is kept verbatim in
  f2f-marketplace `development-docs/product/quiz.json` (decisions, 2026-11-24).
- Proposed line for §3 (both templates, custom and native): «Breadth first, level by level: first the level-1 branches of the whole
  problem, agreed with the person (each a module); then every branch to level 2, a new branch caught up to the same level; then level 3
  the same way; then report the counts per level and ask: deeper everywhere or in one branch. Never follow one answer down its branch
  while others are untouched.»
- Proof: a fresh element's quiz on a test topic asks all level-1 branches before any level-2 question; the counts per level are reported.

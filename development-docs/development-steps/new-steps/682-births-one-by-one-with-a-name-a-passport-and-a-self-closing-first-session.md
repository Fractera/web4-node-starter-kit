# 682 — Births one by one: a name, a passport description from the first second, a first session that closes itself (D3, D8)

**State: APPROVED 2026-11-08** — the owner: «go» to the order (D9, then D8 with D3 …) and the birth order below, verbatim.

## The owner's words, verbatim (2026-11-08)
«Проверь пожалуйста что в твоей инструкции в случае запуска нескольких Узлов одновременно ты рождаешься их строго по одному сначала
создаешь его, затем прописываешь его нормальное имя, в Quiz или первый шаг его разработки в зависимости от сложности этой прописываешь
стартовые задания какие роли в проекте будет этот клиент выполнять по возможности я бы порекомендовал тебе сделать предварительное описание
чтобы в верхнем меню кнопок этот элемент можно было найти быстро по названию и описанию. Когда элемент создан ты закрываешь свой под шаг
который был связан с созданием этого элемента. Затем ты его выключаешь и после этого переходишь к созданию нового. При этом важно понимать
что элемент обязательно должен получить own-service-props.md в самом начале после рождения с нормальным пусть и предварительно но
достаточно полным описанием его роли в системе. Потому что если этого не сделать то после перезагрузки один вообще не поймёт что это за
мусор и зачем ты понимаешь свои проблемы скажи прописаны тебе явно или нет если нет то добавляю к заданиям»

## Measured (read 2026-11-08) — not written explicitly before
- `create-element` had no «one by one», no «close the substep, turn it off, then the next»; the passport «is described in its first step,
  when the quiz is confirmed».
- `item-birth.mjs` wrote the passport `name = id` and «WEB4 element <id>, born from … Its capabilities are written by its agent».
- The header showed the template home page's meta description for every new element.
- D8: no event for «the first session is over» — the main agent polled `state` every 20 s. D3: the brief sent every new element through
  «1b: search the node, then the network» — five of nine asked the core for their own role.

## Result
- `npm run create` requires `--name`; `--describe` (default: the role) goes into the element's passport at birth with «Preliminary —
  written by the core's main agent at birth»; `item-birth.mjs --name --describe`.
- `--close-after-first-session` → `lib/web4-items/first-session.cjs`; the builder's first «done» (`lib/agent-kit/mount.cjs`) closes its
  session and wakes the main agent with one line.
- The new element's brief: the core already searched the node and the network for its role — `need` only outside it (D3).
- The header (`dashboard-rows.ts`): a custom element's description is its passport's, not the template's page meta.
- `create-element`: «Several elements — strictly one by one» — create (name, describe, start, close-after-first-session) → its first
  session closes itself → the substep closed in `current-steps.md` → the next.

## Proof
1. Workshop: `tsc` clean, guards green; `first-session` takes a mark once; `create` without `--name` refused.
2. Live, owed: the next real birth on the owner's node — the passport's description and name at once, the header shows it, its first
   session closes itself, one wake.

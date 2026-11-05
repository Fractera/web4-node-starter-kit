# 650 — the person's boundary in the deep memory (plan, waits for the owner's yes)

## 1. Retelling and decisions

The owner, 2026-11-05, verbatim: «И другое доступ глубинной памяти не будет ли смешиваться между различными элементами?»; «Скажи правильно
ли будет сейчас разделить эта шапка несколько составляющих я с памяти, нам нужно сделать разделение глубины памяти по элементам чтобы
главное агент была доступна вся память, а каждому элементу только своему … Это решаемо задачи надёжная? Как ты сказала нужно сделать так
чтобы записи матери не были доступны сыну например»; to writing this plan — «go».

Step 650 of the chat (the integrator: own Claude login per element) is split: **650 is the memory**; the member's channel (the working
process on the OpenAI key, fixed tools, no shell) becomes step **653**, planned after 650.

- **D1 (the owner, above):** the main agent reads every space of the memory; each element only its own. It replaces, for elements, the
  owner's rule of 2026-09-16 in `lib/memory/source.mjs`: «🛑 ИСТОЧНИК НЕ ФИЛЬТРУЕТ ПОИСК».
- **D2 (mine):** what the memory already holds stays in the space `node` — the main agent's; today every phrase came from the main agent
  (`from: ['build']`, `scripts/node-commands.mjs`).
- **D3 (for the owner):** «забудь всё» said to the main agent forgets the space `node` only; a person's space is forgotten from their
  element, or by the main agent when the architect names that space.
- **D4 (mine):** no per-element keys in 650. The stores behind the memory (the data layer: arbitrary SQL by `/db/migrate`, vector
  collections, graph spaces) open with the node's shared `DATA_SECRET` and `SETTINGS_SECRET`, which every element has in its `.env`; a key
  on the memory's door alone would close nothing. Between people the guarantee comes from 653: a member never drives a session with a
  shell, and the member's tools carry their element's space by the core's code, not by the model.

I assume that the space of a call is the first segment of `from` (an element id of the registry); `build` and `core` are the main agent.

## 2. What is reused (paths that open)
- Graph spaces: `fractera-graph-lightrag-starter` README «Spaces» (596-1) — `space` on `graph-insert` / `graph-query`, lower-case latin,
  digits, dashes, ≤ 32 characters; the memory already writes `space: "memory"` (`lib/memory/node.mjs`, `GRAPH_SPACE`).
- Vector collections partitioned by collection (`fractera-vectors-starter` v1.2.5 README: «a search touches only its own collection»).
- The late column of a live table: `lib/memory/messages.mjs` («🛑 КОЛОНКА — НЕ ТАБЛИЦА», `ALTER TABLE … ADD COLUMN`).
- The caller's path checked against the registry: `lib/memory/source.mjs` `parseSource`, `lib/memory/services.mjs` `isKnownService`.
- The base memory (the diary) is already isolated per agent: `lib/agent-kit/memory/recall.cjs`, `brief.cjs` (548-6) — untouched.

## 3. Known limits
- The data layer and every store open with the node's shared keys (D4): 650 does not stop a program or a shell session of this machine.
  The architect owns the machine and sees everything; the skill says so to the person.
- `ANTI-PATTERNS.md`, «A second checkout on a computer with a live node shares its pm2»: no lab server of the memory beside the live node;
  the memory's doors are proven on the owner's node after delivery.
- Native element: the memory is released by its own tag and pinned in `WEB4-ITEMS-REGISTRY/web4-items.json`; `node:update` sets it.
- The deep memory is off by its passport: the proof turns it on (`npm run power -- memory on`), its RAM named; it thinks with the node's
  OpenAI key, otherwise the owner's subscription (his own test phrases).
- A GET verb without `from` must never mean «all»: an element omitting it would read every space.

## 4. Observable results
- A phrase said from element A is answered to A and to the main agent (with «A» named), and to element B — nothing, on every verb:
  recall, journal, sources, signals, an object and its file, feedback, forget.
- In the stores the phrase lies in A's own row space, vector collection and graph space — not in the shared ones.
- The main agent's «запомни» / «напомни о» work as before.

## 5–6. Substeps, order, address
1. `650-1.md` — spaces in the memory element: `Fractera/fractera-memory-starter` `main` → tag v2.2.21.
2. `650-2.md` — the core: its memory calls name `build`, the answers name the space; skills `integrator`, `use-deep-memory`; `CLAUDE.md`
   by the owner's word: `Fractera/web4-node-starter-kit` `main`, the pin memory v2.2.21.
Delivery: both pushed → the fork `aifa-agi` fast-forwarded → `npm run node:update` on the owner's node → the proofs of 650-1 and 650-2
there → `completed-steps/650-main.md` with the hashes.

## 8. Acceptance of this plan
Every substep has its file; each result can be shown; two planes per substep, one with a negative control; the address of the code is
named; what is not in it is named (653: the member's channel; reminders of a person to their own bot; per-element keys).

## 9. The owner's approval
(waiting)

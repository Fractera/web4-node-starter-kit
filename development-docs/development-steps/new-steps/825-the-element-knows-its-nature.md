# 825 — the element knows its nature: its Telegram face and the person's focus, its memory per project, its place behind the wall; heavy tools are native elements

State: GO 2026-11-21 13:36 UTC — the owner's 532–534 (intake pre-steps/2026-11-21-element-knows-its-nature.md): «действую от моего лица
… без остановки». Every substep below is done in order; the owner reviews the report when he is back.

## The checklist — his ideas, my critique, the strengthened form

1. **Why the element exists and what sets it apart.** His: an agent for the person's effectiveness; unlike Claude.ai it has an extended
   Telegram interface. Critique: a sealed text never names a provider's product (a claim about it needs its primary source) — the
   element says what IT has. Strengthened: a chat answers with an artifact; the element first builds the interface the work will live
   in, then works through it — and says so to the person once, when they ask for a one-off result that belongs to a project. Its list:
   memory + its own pages; the multi-level Mini App; dashboards in any form; thousands of checked community skills weighed before a
   build (the catalog holds 5 330 cards — «6000» is not said); tools on a schedule with server functions of its own. → 825-1.
2. **The Mini App tree is the map of the person's focus.** His: folders, subfolders, dynamic items; a mirror page public or private as
   the person wishes. Strengthened: every result of work has an address in the map — a page tagged `project`, a calendar entry with the
   same `project`; untagged work is invisible in Telegram. The text holds only for an element that HAS the Mini App (root has none — the
   owner, 484): «when your folder has `tg/`». → 825-2.
3. **The section the person came from.** His: a new chat after a switch carries a native hint «came from Instagram». Fact: the hook
   `came-from` adds one line for 30 minutes after «Перейти в чат» in that section. Strengthened: the agent reads the line as the topic;
   a switch mid-task parks the open task in one line and takes the new one; back to the section → it continues from that project's pages
   and memory. → 825-2 (instruction) + the skill `telegram-mini-app` «Focus».
4. **Memory per product** («продолжим тему прошлого раза … что делали несколько недель назад → новый пост»). Fact: the element's own
   deep-memory space exists (its key, `/v1/*`), but its agent has no command for it — «remember / remind» go through the main agent.
   Strengthened: `npm run memory -- remember|recall "<words>" [--project <group>/<item>]` in the element's own space, the project in the
   words; recall also reads the project's pages by their tag. → 825-3 (template code + skill).
5. **Clearing the context at its own discretion.** His: allowed when the old task is clearly over. Critique: a clear is not a topic
   switch — a parked task survives only in writing. Strengthened: clear only when the previous task is closed and its state written
   (current-step.md, memory); a switch of section never clears. → 825-2.
6. **Teaching the person what is possible.** His: the person expects far less; push them. Critique: once per topic, not every answer —
   repeated it is noise and costs the subscription. → 825-1.
7. **The element's self-knowledge after the wall** (811, «стена в песочнице»). Strengthened: audit every skill of the custom template
   for claims the wall made false (reading the core's or a neighbour's files, direct calls without the agreed API) and fix them. → 825-4.
8. **Fractera's search and Lagrix** (simulated today). Fact: the element's side of the ladder is in its instruction (822-1) and the core
   climbs it. Strengthened: the element tells its person «simulated today» when the answer comes from those rungs; the magnifier (822-2)
   stays the core's next step. → 825-5 (check, small).
9. **Heavy tools are native elements** (new law): image generation, a music clip, video editing, mailings — a NATIVE element the
   orchestrator creates (`create --native`), serving every custom element; custom elements are the person's products. Critique: each
   native element is a resident process (memory) — it sleeps when idle like the others. → 825-6: core CLAUDE.md §3 + §4 ladder, skills
   `handle-need`, `create-element`, `shape-the-need`; the element instruction: a tool job → `need`, never built into a custom element.
10. **Delivery and proof.** → 825-7: render the instruction (`npm run instruction:element -- templates`), custom template release, pin;
    proofs: the rendered CLAUDE.md carries each line, seals and guards green; a live element answers «who are you» from it.

## Substeps

- 825-1 purpose and distinctives — element instruction §1 «What you are for».
- 825-2 the Telegram face, the map, the focus, parking and clearing — element instruction §2 + skill `telegram-mini-app` «Focus».
- 825-3 the element's own memory per project — template command + skill.
- 825-4 the wall audit of the template's skills.
- 825-5 Fractera's search and Lagrix from the element's side — check and words.
- 825-6 heavy tools are native — core CLAUDE.md (seal), skills, element instruction.
- 825-7 render, release, pin, proofs.

## Done 2026-11-21 13:37–14:05 UTC (the owner away, his 534)

- 825-1, 825-2: the element instruction source — «What you are for» (a chat answers with an artifact; you build the interface first;
  the list of what it has; once per topic), «Your person's focus — the map of Projects» (only when the folder has tg/; README first;
  every result tagged; came-from; parking; a clear only through the core's `tell-core` — `clear` is the main agent's command).
- 825-3: `npm run memory -- remember|recall "<words>" [--project <group>/<item>]` in the custom template (lib/memory/project-memory.mjs
  + test in the prebuild; scripts/memory.mjs through neighbourFetch('memory', '/v1/…'), from = the element only; recall lists the
  project's tagged pages; asleep → the line to ask the core); passport `calls` + memory; skill telegram-mini-app «Focus».
  NOT proven live: the workshop has no ELEMENT_KEY — the first real custom element born from v0.3.225 proves it.
- 825-4: wall audit — local-node knowledge (pair keys, the wall), own-domain-sign-in (auth's and the core's files are not yours),
  take-card-payment and self-review (SETTINGS_SECRET is the element's own key since 818-7c). Runtime.json reads stay (core-door rule).
- 825-5: need-capability already says the outside rungs are simulated (822-1) — no change.
- 825-6: core CLAUDE.md §3 (heavy shared tools are native) + §4 ladder, sealed 6323376a6e3b; skills create-element, handle-need; the
  element instruction (common line → native too).
- 825-7: custom v0.3.225 (4f1c9c5) and native v0.1.80 (0adfa83) released and pinned (4f8ee573, 72529fbf); core 43bf6fd4 pushed to the
  fork and Fractera. `instruction:element -- templates` also wrote root's CLAUDE.md and seal on the Mac (its design, 734-1) — left
  uncommitted in root (the classifier refused my revert); root's agent commits it.
- Proof 1: check:instruction (core and template) green, the template prebuild and release guards green, tests 18/18 and 5/5.
  Proof 2 (13:44, live): root's worker, asked five questions, answered all from its new CLAUDE.md — interface first; came-from → the
  project's pages and memory, parking in current-step.md; image generation → a native element through `need`, then i2i; tagged pages +
  `npm run memory -- remember/recall --project`; a clear only when closed, done by the core on `tell-core`. 825 DONE except the live
  memory proof (a real element from v0.3.225).

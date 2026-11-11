# 725 — ready parts are always found and used: one parts map, `parts_find` in hand, a gate before a new interface file (PLAN — waits for the owner's yes)

Opened 2026-11-11 at maximum effort. The register — `development-docs/reports/errors-2026-11-11-ready-parts-ignored-surfaces-unseen-money-unseen.md`
(root causes R1, R2; lines 1–7, 13). The owner's words, verbatim:

> вместо того чтобы взять готовые инструмент ты по какой-то причине полез создавать новый и создал говно. Проанализируй проблему нужно
> полноценные лекарства. Пока мы существовали на блоках нашей старой архитектура работала как-то иначе и я видел что ты очень часто пере
> йош то что у нас существует

> Как обновить нашу архитектуру чтобы в любой компонент создав инструмент который можно пере использовать сохранил его в базе связи и
> всегда вызывал.

> в таком виде наши архитектура не может существовать это как раз тот бардак который мы хотели избежать создавая структуру Fractera

> мало иметь технологию для поиска инструмента гораздо важнее иметь технологию для того чтобы из того процесса в котором ты находишься в
> процессе строительства понять что именно сейчас ты создаёшь инструмент этот инструмент который будет нужен тебе в будущем

## 1. Retelling and decisions

The blocks era found ready parts by an ACTION (`npm run blocks -- find|add`, the Blocks showcase, skills `blocks-of-the-node`,
`handle-block-request`); step 716 removed it and gave no `find` for sections, tools and composites. The cure is the same shape as the one
that works today for skills: a TOOL in every build session (`skills_find` is called because it is in hand), a MAP that is generated and
guarded (as `TOOLS.json` and `SECTIONS.json` are), the «база связей» — the node's graph — holding each part with who uses it, and a
GATE that does not let a new interface file be written before the parts were asked.
I assume that «база связи» is the node's LightRAG graph (the skills base already lives there, `npm run skills-base`) together with the
node's vectors; that «любой компонент» means every element too (725-5), not only the core.

## 2. What is reused (measured 2026-11-11)

- Maps: `_tools/TOOLS.json` from `tool.json` cards (`build:tools-map`, `check:tools-map`, 11 tools); `sections/SECTIONS.json`
  (`build:sections-map`, `check:sections-map`, 117 kinds). No map for composites (`components/form/*`, `components/dialog/*`,
  `components/workspace/*`, `components/ai-elements/*`, `components/workspace/menu-state-dot.tsx`) nor primitives (`components/ui/*`).
- The tool server: `lib/agent-kit/skills/mcp.mjs` (`skills_find`), given to every build session by `lib/agent-kit/modes.cjs:300`.
- Meaning search: the node's vectors through `embeddings` (`lib/a2a/self-description.cjs` `findByMeaning`, a ledger of indexed texts);
  the graph load: `npm run skills-base` (`scripts/skills.mjs`).
- Guards in hooks: `scripts/system-part.mjs guard` (PreToolUse, step 720) — the pattern for a refusal with a reason.
- The custom template has its own `_tools/TOOLS.json` (8 tools) and its own composites (`components/form/voice-control` only).

## 3. Known limits

- The shell kit (`components/shell/`) is a byte copy of the site's: no change there in the core alone.
- A hook must never block the person's own work outside the interface folders; the node's commands (`npm run …`) pass.
- No new resident process without its price named; `parts_find` runs inside the existing `node-skills` server (≈46 MB, step 595-1).
- Elements are changed only by a template release (skill `release-template`) — the owner's yes to this plan is that word for 725-5.

## 4. Observable results

- `parts_find «поле с голосом»` → `VoiceTextarea` first, with how to use it and who uses it; «окно переписки с моделью» → the chat tool;
  «бронирование столика» → nothing found (negative control).
- In a session that did not ask, writing `components/x/new.client.tsx` is refused with the command to run; after `parts_find` it passes.
- Prebuild fails on a direct import a card says it replaces (the bare microphone outside its owners) and names the part to use.
- The same in an element of the custom template after its release.

## 5–6. Substeps, order, address

Repository: the core's working copy, then the custom and native templates and root (725-5), each with CI.
1. 725-1 the parts map — cards for composites and primitives, `PARTS.json`, its guard.
2. 725-7 a part recognized at its BIRTH — the declaration at a new file's first line (`@part` / `@local`), the second-copy detector
   `check:parts-dup`, «Parts born here» in the plan and the summary (the owner: the birth matters more than the search).
3. 725-2 `parts_find` — the tool in every build session and `npm run parts`, words + meaning + the graph's «used by».
4. 725-3 the gate — no new interface file before the parts were asked; `replaces` enforced in prebuild.
5. 725-4 the craft in the flow — `interface-design` required for the panel's files; surfaces seen named in the summary.
6. 725-5 the elements — the same map, tool and gate in the custom and native templates and root.
7. 725-6 the sweep — the core's panel audited with `parts_find` for hand-built duplicates; a list for the owner.

## 7. Not in this step

Rebuilding the duplicates the sweep finds (each becomes its own substep after the owner looks); the money (726).

## 9. The owner's approval

(waiting)

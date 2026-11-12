# 735 — one pass over the born elements: the tool definition and the core's shell — plan (2026-11-12, for the owner's yes)

The owner, 2026-11-12 ~21:40: «да, раздавай за один проход» (the tool definition — the instruction and use-tools — and the core's
header and footer, one release per element, one node update at the end). Measured before the plan (node core `566cad15`):

- `template rollout` (dry): of 12 born elements only 8 natives stand at their pin — auth v2.4.33, data v2.2.26, storage v1.1.46,
  embeddings v0.1.27, config v1.2.44, cache v0.1.39, memory v2.2.46, stripe v1.3.37. Four carry their own unreleased work and are left
  alone by design: root (HEAD `v3.0.39-10-g861f8d1`, pin v3.0.55), vectors (`v1.2.26-1-gddb2bb3`, pin v1.2.28), graph
  (`v1.2.25-1-gc0d72f9`, pin v1.2.27), Клип s8y6x (`7001737`, past its pin v0.3.171).
- The tool definition in the templates is: the generated instruction (`CLAUDE.md` + `scripts/instruction.seal` — `npm run
  instruction:element -- element <dir>`), `.claude/skills/build-skills/skills/use-tools/SKILL.md` (+ build-widget, use-languages in the
  custom), the parts code `lib/parts/parts-find.mjs`, `lib/parts/parts-map.mjs`, `scripts/tool-take.mjs`, and the script line `tool:take`
  in `package.json` — which a rollout cannot bring (it overwrites a whole file; an element's package.json is its own).
- The shell: `check:shell-kits` — the core is the master; the 8 natives differ in 4 files (shell-menu, shell-types, starter-banner
  ×2), root in shell-types, Клип in 4 + 2 extra. The way the guard names: `shell-kit:add` into the element's source, a new tag. Code →
  the element is rebuilt at the node update.

## Substeps

- **735-1 the 8 natives, one release each, in their author workshops `~/fractera-dev/<starter>`** (model-free, mine): pull to the pin;
  `shell-kit:add` from the core; the tool files from the native template v0.1.67; the `tool:take` line added to its package.json;
  `instruction:element -- element <dir>`; its whole chain; the next patch tag; push; the pin in the core (one file, one commit).
- **735-2 the four with their own work** — root, vectors, graph, Клип: a task to each element's agent with the exact list (the same
  files and `shell-kit:add`), it merges with its own work, releases and pushes; four live runs on the subscription, each named with its
  price before the start; the owner may order them later.
- **735-3 the node update** (the 8 natives rebuilt) and proofs: `check:shell-kits` — the 8 natives ✓; eyes on two native pages (the
  core's header and footer); an element agent finds a tool with `parts_find` and takes it with `tool:take` (checklist 4; one live run).

Price: 735-1 — about 8 × 5–10 minutes of chains, no model calls; 735-2 — four agent sessions; 735-3 — one update, one agent run.

## Re-checked at the owner's word «check again with max effort» (2026-11-12 ~22:10) — the plan above was wrong in substance

Measured:
- The 8 natives' sources (`~/fractera-dev/fractera-<x>-starter`) stand exactly at their pins and already hold a `use-tools` skill (the
  dry rollout touched existing files and restored them — no debris). But NONE holds the machinery the skill describes: no
  `lib/parts/` (no own map, no `parts-find.mjs`), no `scripts/tool-take.mjs`, no `tool:take` line, no `components/shell-kit`. The native
  template's `use-tools` sends the agent to `npm run tool:take`, `parts_find`, `npm run check:parts-map` — handing a native the skill
  alone would describe commands it does not have.
- DEFECT of the native template v0.1.67 itself: its `.env.example` does not declare `ELEMENT_KEY`; the installer writes the key only
  when declared (`# kind: element-key`, `scripts/services-install.mjs`:325, 919); its `scripts/tool-take.mjs` stops with «TAKE_FAILED:
  no ELEMENT_KEY here». A native born from it cannot take a tool either. None of the 8 natives declares it.
- DEFECT in the core: `lib/agent-kit/skills/mcp.mjs` `callParts` — a session folder without `lib/parts/PARTS.json` falls back to the
  core's own map with no node index (`here = ROOT`, `node = []`): a native's agent is answered as if it were the core (the core's paths,
  its panel tools). `npm run parts -- --as config` answers right («lives in the core — npm run tool:take»): the command and the MCP
  server diverge.
- root on the node runs v3.0.39 + its own work (`861f8d1`, not in the source repo), not v3.0.55: the update log says «своя работа
  поверх v3.0.39 — на тег не перевожу … доступен v3.0.55 — влейте его кнопкой «Обновить»». Every root release v3.0.40–v3.0.55 (the
  parts map, 733, 734's rule) has not reached the running root — earlier records calling root «v3.0.55 live» were wrong. Клип s8y6x
  runs v0.3.171 + own work — the parts map came in v0.3.193, `tool:take` in v0.3.198, the shell kit stub in v0.3.191: it has none.
  vectors v1.2.26 + own, graph v1.2.25 + own.
- No element of this node uses the runtime shell kit (custom template ≥ v0.3.191 only); every element's header and footer is a byte copy
  of `components/shell`, and all 12 drift from the core's master.

Conclusion: today no element of this node can use the tool protocol end to end. The corrected substeps are offered to the owner as
variants (the full machinery per native, or the protocol first) — see the state record.

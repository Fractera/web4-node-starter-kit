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

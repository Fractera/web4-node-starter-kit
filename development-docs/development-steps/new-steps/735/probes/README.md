# Probes of step 735 — the measurements behind the plan, each repeatable with one command

Run from the core's root (or set `CORE`). They read git objects and files and write only into a temp folder; none calls a model.

| probe | asks | printed on 2026-11-12 (core `566cad15`) |
|---|---|---|
| `node probes/mcp-ask.mjs <folder> "<query>"` | what the core's MCP `parts_find` answers a session in that folder | a folder with no `lib/parts`: «Yours — it is in this repository» for the core's parts (D1) |
| `node probes/plan-all.mjs <receiver folder>` | which «any» tools of the core the door would give that receiver (`planTake`, nothing written) | newborn custom 7 of 13 · newborn native 4 of 13 · a native at its pin 4 of 13 |
| `node probes/importers.mjs <source folder>` | who imports each old tool copy outside its own folder | every native: chat, code-view, fact-draft, image-crop, translations-dialog, video-trim 0; socials-ai 1 (its own door); voice-input 5 (two tools, its door, the voice control); voice-control 1 (the fact draft) |
| `node probes/file-plan.mjs <base> [<tip>]` | every path the native template changed between base and tip, against each native's source | base `7302b1f^`: added 17 (absent in all 8), modified 16 (8 same-as-old in all, 4 own in all, 2 absent, 2 mixed), deleted 35 (32 same-as-old in all, 3 mixed) |
| `probes/variant-c.sh <native>` | the island removed + the template's parts machinery in a scratch copy: the map, the guards, the type check, the takes | config: map written with no problem, `check:parts-map` OK, `check:parts-dup` 4 (to freeze), tsc 1 error = the untouched control's, takeable 4 of 13 |

A receiver folder for `plan-all` is made with `git -C <template clone> archive <tag> | tar -x -C <temp>`.

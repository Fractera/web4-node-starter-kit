# SOURCE — vendored, do not edit by hand

- **What:** `interface-design` by Damola Akinleye (dammyjay93), MIT (see `LICENSE`): craft-first design of product interfaces —
  dashboards, administration panels, settings pages, tools and data screens. Not for landing pages.
- **From:** https://github.com/dammyjay93/interface-design — `.claude/skills/interface-design/SKILL.md` at commit
  `2f9be3206855bcb2d1d0af262c8bae25cba6658d`, blob `92e1df4e` (the blob the Fractera skills catalog checked: ★5.9k, 31.7k installs,
  «install»), taken 2026-11-10, node step 714-4.
- **Taken:** `SKILL.md`, `LICENSE`. Not taken: `agents/`, the plugin folders and the `/interface-design:*` commands — nothing here runs.
- **Why:** the owner 2026-11-10, verbatim: «перенёс этот навык в инструкцию ядра и элементов с подсказкой использовать при моделирование
  административных панелей и дашборда» — the core's Design and Site settings tabs of an element (step 713) were rebuilt by it and
  accepted: «интерфейс получился значительно лучше». The way it was used there: intent first (the architect, a non-designer, often on a
  phone); one focal point per view; navigation is the product — a step track or a section list, the state of each step in words; one
  column, spacing from one base unit; hierarchy by weight and muted colour; depth by borders only, no card in a card; the critic before
  showing — squint, swap, one focal point, width, 390 px, console.
- **Update:** download `SKILL.md` of the wanted commit over this one and change the line «From». Never edit by hand.
- **What our rules override:** the core's primitives and tokens only; every container carries `data-block`; words through the
  dictionaries; «render it» means `npm run eyes` at 1440 and 390 px (skill `use-browser`) — no inline render tool and no image
  generation; `.interface-design/system.md` is not created — decisions are written into the step's plan and summary.

# Hidden until Lagrix launches (node step 706)

The owner, 2026-11-09: «Так как лагрикс ещё не запущен то имеет смысл этот раздел закомментировать внутри». The main agent's A2A pages
(orders, work with capability cards, reviews) are kept here under `_hidden-until-lagrix-<name>`: a folder starting with `_` is not a
route in Next. To bring a page back, rename it to `<name>` and uncomment the same pages in `lib/web4-items/item-tree.ts` (section
`workflow`) — `check:main-agent-menu` holds both halves together.

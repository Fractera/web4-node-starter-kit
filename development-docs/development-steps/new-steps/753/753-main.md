# 753 — «Powered by Fractera» under the footer of every element (plan — approved)

## The owner, verbatim (2026-11-15, read at 17:02 UTC)
«Ещё достаточно простой и маленькое обновление для всех элементов они должны содержать внизу второй футляр в котором должен быть
написано Powered by Fractera я думаю что это должны быть минимально из читаемых букв может быть шрифт восемь общее высота бордюра может
быть 10 пикселей? Цвет чёрный background прозрачный ссылка передающая весна репозиторий.»

**His yes, 2026-11-15 (read at 17:15 UTC), verbatim:** «Да, делай вариант B» — to the question «Делаю вариант A: цвет токеном,
`tool:own` и `tool:new` в том же выпуске root?»: so variant B (A plus the ten native elements of this node, each its own starter,
release and pin), the colour by token, and W1 (`tool:own`, `tool:new`) in root's v3.0.57.

## Reading
- «второй футляр» — a second footer: a strip under the footer of every page. I assume «ссылка … на репозиторий» is
  https://github.com/Fractera/web4-node-starter-kit — the node's repository that every node forks.
- The footer is one file, `components/shell/project-footer.tsx`, byte-identical in the core and in the custom, native and root templates;
  the core is the source and `check:shell-kits` compares the copies with it (734-3a). It renders on every page, no switch hides it
  (`components/menu/footer/footer-menu.server.tsx`).
- No guard limits a small size or an English mark (`check-typography` measures sizes, `check-i18n` is not in the prebuild).

## Substeps (each with a proof named in advance)
- **753-1, the core** — the strip in the core's footer: the link «Powered by Fractera», 8 px letters in a 10 px strip, transparent,
  a token colour, at the very bottom. Proof: `npm run eyes` on a core page in the light and the dark theme (seen, readable, nothing
  covers it) + the chain; negative: the strip absent in the screenshot before.
- **753-2, the templates** — the same file into custom, native and root; their chains; tags v0.3.206, v0.1.72, v3.0.57; the pins.
  Proof: `check:shell-kits` «ok» for each copy + the three chains; CI green.
- **753-3, this node** — root and Клип take it by their agents and rebuild; I deploy and look with `npm run eyes` at each home page.
  Proof: the strip and its link on both live pages; their `/api/health` `builtAt` moved.
- **753-4, optional by his word** — W1 of `wishes.md`: `tool:own` and `tool:new` into the root starter in the same v3.0.57.

## Decisions (mine, one line each — his yes or correction)
- Colour: the `foreground` token — black in the light theme, white in the dark; a literal black is invisible on the dark theme and
  leaves the token system.
- Inside the same `<footer>` (one contentinfo landmark), a hairline border above it, the text centred; no background.
- The text is English in every language — a mark, like a logo; the link opens a new tab with `rel="noopener"`.

- **753-5 (variant B)** — the ten native elements of this node (auth, data, storage, vectors, embeddings, config, graph, cache, memory,
  stripe): the same file into each own starter, its chain, its next patch tag, its pin in the core. They move to the new tag with the
  node update he publishes (an element at its pin is moved by `services:install`); one with its own work or local changes is named.
  Proof: `check:shell-kits` «ok» per starter + chains + CI; live — after his update, `npm run eyes` on the sign-in page.

## Not included
- The node updates: he publishes them; 752 and 753 together in one update.

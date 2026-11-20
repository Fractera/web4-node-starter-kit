# 816 — the Pult's header: the node's name from CONFIG and where the node lives

State: the owner's request (Telegram 249, 17:56): «Попрошу тебя внести изменения в пульт телеграмма. Верхняя строка пульт узла через:
должна содержать в себе название этого узла берётся из CONFIG проекта. Ниже покажи является ли это локальная или vps».

## Substeps

- 816-1 the Pult's state carries `node: { name, place, web }` — the name is the site name of CONFIG (`metaForLang(lang).siteName`, the
  same as the pages' titles), the place is the detected one (`readPlace()`, 737-18 — never a guess), `web` the server panel's address.
- 816-2 the page: the title «Пульт узла · <name>» (the title alone without a name); the line below «Локальный компьютер» or «VPS · <host>»
  («VPS» without a domain; nothing when the place is unknown).
- 816-3 proof: `tg-app.test` runs the page's own header code on four states (home, server with a domain, server without, no name and no
  place); live — the Pult on the Mac and on the server after their builds.

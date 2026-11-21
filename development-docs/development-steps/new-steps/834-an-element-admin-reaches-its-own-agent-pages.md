# 834 — an element's own admin reaches its own agent's pages

**The owner, Telegram 641 (20:11 UTC):** «агент должен уйти в подписку на своем элементе это означает что у нас в правом попадающем меню
элемента должны быть созданы кнопки … у Марины в режиме не архитектора а в режиме администратора в правом её меню существует кнопка
подписку, вход в терминал, настройка Telegram бота?» → my 643 (not built; A or Б, my pick A) → **644: «Делай но только наверно не три
кнопки A4 ещё нужно OpenAI ключ пробросить».**

## Measured
- The template's drawer (`lib/menu/account-links.ts`) shows 4 links only to the architect, and they lead to the MAIN agent's pages
  (`build/subscription|terminal|telegram`). An element's own admin gets nothing of its agent.
- The element's agent pages live in the core panel: `/<lang>/<address>/subscription|terminal|telegram` (agent kit) and
  `/<lang>/<address>/build/environment` (its OpenAI key). The panel's lock (`(architectLayer)/layout.tsx`) and the kit's four doors
  (`kits/_agent-kit/api/{claude-auth,session,channel,ticket}`) admit architect/admin only; the environment door too.
- 🔴 The terminal's ticket is not bound to an element: a ticket from one element's door opens `/pty/<any>`. Harmless while only the
  architect gets tickets; a hole the moment an element admin gets one.

## Substeps
- 834-1 `lib/auth/element-agent-roles.cjs`: the roles of an element's agent pages — architect, admin, and that element's own admin
  (`element-admin-role.cjs` → `adminRoleOf`), never another element's.
- 834-2 the ticket names its element: `mintTicket(email, service)`, `redeemTicket(ticket, service)` — another element's socket refuses it.
- 834-3 the kit's four doors and the environment door (its own target only) take those roles.
- 834-4 a bare frame `/<lang>/element-agent/<id|address>/<subscription|terminal|telegram|openai>`: no node menu, the element's name,
  four tabs, the same widgets; its client lock asks the same roles.
- 834-5 the custom template: the drawer gives the architect and the element's own admin the four links into that frame; release
  v0.3.229, j58fl through its agent.

## Test checklist
- [ ] the roles: architect, admin, own admin pass; another element's admin and a plain user — refused (unit).
- [ ] the ticket: redeemed for its own element; refused for another element (negative); refused twice.
- [ ] doors: the element admin's session gets 200 for its element, 403 for another element (negative) — on the server, his reinstall.
- [ ] the frame: eyes on this Mac (owner at the keyboard) — four tabs, no node menu; tsc, prebuild RC=0.
- [ ] the drawer: the four links for the own admin role; none for a plain user.

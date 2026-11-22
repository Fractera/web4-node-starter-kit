# 836 — an element's agent pages live inside the element; the core is only the machine room

## 1. Retelling and decisions

The owner, 2026-11-22, on his server (marketplace.fractera.ai, admin bolshiyanov@gmail.com, roles user + elementAdmin002):
- 01:08 (Telegram 711): «Зачем ты вообще создал эту страницу на вкладке архитектора? … они должны были жить внутри элементы а ты по
  какой-то причине попытался пробросить их на странице архитектора и разумеется у меня нету доступа к странице архитектора.»
- 01:11 (719): «Логично было бы чтобы они были частью кастомного элемента где-то в одном из его служебных маршрутов разве это нелогично?»
- 01:11 (721): «А то что ты нашел готовые страницы это хорошо просто пере используй их как есть»

Measured (01:0x–01:10): the 834 frame `/<lang>/element-agent/<id>/<page>` lives in the CORE (architect.<zone>); its gate asks the
core's `/api/me` → the sign-in element's `/api/session`, which refused him (screens 707, 717: «Вход не подтвердился», «Эта страница вам
недоступна») though auth.<zone> says «Вы вошли» (713). The sign-in door answers only node-app accounts without an element header.
The kit (`app/[lang]/(architectLayer)/architect/kits/_agent-kit`): client widgets call `/<lang>/architect/<id>/agent-api/{ticket,
session,channel,claude-auth}` on their own host; the terminal socket is `/pty/<id>` on the core's server (`lib/agent-kit/mount.cjs`),
admitted by a ticket of THAT element only (`bridge.cjs:1405`), no origin check.

Decisions (mine, one line each):
- The pages are the kit's own widgets, copied as they are into the custom and root templates (the owner: «как есть»), under the
  element's admin branch: `/<lang>/admin/agent/{subscription,terminal,telegram,openai}`; only two constants differ — where the doors
  are (the element's own `/api/agent/<door>`) and where the socket is (the core's origin, `ARCHITECT_URL`).
- The element's door checks ITS session and role (its admin role or architect/admin) and forwards to the core server-to-server with
  its `ELEMENT_KEY`; the core's kit doors accept that key as «this element's own admin» (ownOnly, as 834-3 tickets).
- One master: the core's kit stays the source; a command copies its client part into the template workshops, a guard names drift.
- The 834 frame in the core is removed; every link to it (account menu, Mini App, birth report, `ask-person --check claude:`) points
  to the element's own route.

## 2. Reused
The kit's client widgets, words and `widgets.tsx`; `ticket.cjs` `mintTicket(…, { ownOnly })`; `lib/auth/element-agent-roles.cjs`;
the template's own session reader (`lib/auth/get-session.ts`, which names itself with `x-fractera-element`), `ELEMENT_KEY`,
`lib/neighbour.mjs`-style server calls; skill `release-template`.

## 3. Limits
- Elements are never edited by me: the pages reach them by a template release and their own merge.
- A key never reaches the browser; the element key stays on the element's server.
- `check:static`: the agent pages are protected-layer pages (prerendered shell, data by fetch), no `cookies()` in a page.
- The core's own panel pages of every element stay as they are (the architect's view).

## 4–6. Substeps
| # | What | Where |
|---|---|---|
| 836-1 | Core: the kit doors (ticket, session, channel, claude-auth) of a born element accept `X-Element-Key` of that very element → ownOnly; a wrong or another element's key → 403 | core kit master + `agent-kit:update` |
| 836-2 | Templates: the kit's client part copied in (`npm run agent-kit:template` from the master), four pages in the admin branch, one door `/api/agent/[door]` forwarding with the element key, the socket to the core's origin | workshop clones custom + root → releases, pins |
| 836-3 | Links: the account menu, the Mini App, the birth report and `ask-person --check claude:<id>` lead to the element's route; the core frame (`(elementAgentLayer)`) removed | template + core |
| 836-4 | Rollout to the Mac's elements, one core build (with 835-0, 834-10), proofs; push fork + Fractera; Roma presses «Обновить» on the server and opens marketplace's terminal | core + elements |

## 7. Proofs (named in advance)
- 836-1: curl the ticket door with the element's key → 200 and a ticket; with another element's key → 403 (negative control).
- 836-2/4: on the Mac, sgnou's `/ru/admin/agent/terminal` opens, the socket connects (eyes: the terminal draws, console clean);
  without a session the page refuses (negative control); on the server — Roma's own eyes on marketplace.
- 836-3: `architect.<zone>/ru/element-agent/…` → 404; the account menu's «Терминал» href is the element's own address.

Parts born here: none new — the kit's widgets are reused as they are (`@part` cards travel with them).

## 9. Approval
The owner's «пере используй их как есть» (721) — approach approved; the plan sent to him (Telegram).

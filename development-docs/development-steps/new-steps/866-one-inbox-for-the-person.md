# 866 — One inbox for the person: the panel's badge, the Pult's «Входящие», Telegram only the bell

**Asked:** fractera.ai's main agent, file `for-mac-node-inbox.md` (Roma 1612, 2026-11-27 18:35 UTC). Roma agreed there (its Telegram
586, 18:34: «Думаю это правильно»). His words (its Telegram 584): «в интерфейсе его уведомления которые висит в правом нижнем углу
подсвечивались в том числе эти заявки также как и требования … пролистать сообщения от первого до последнего сейчас нельзя … правильно
показать эти сообщения в чате и одновременно при переходе в пульт я должен был бы видеть их».

**Why the core:** today every source the person must see keeps its own trace, and none of them can show a list:
- the notice door keeps only `{ at, from, kind, ok, sent }` in `data/node/notices.jsonl`, with no text and no link;
- the needs live in `data/node/needs/`;
- the windows live in `data/node/person-asks.json`;
- step 639 deletes earlier Telegram lines.

One model-free mechanism of the core serves every element alike. No element is named in the code.

## Substeps

- **866-1 The record.** `lib/node/inbox.cjs` keeps `data/node/inbox.jsonl` outside git. A record is
  `{ id, at, kind: application|need|window|reminder|work, from, title, text, link?, state: new|read|done|gone }`. It has functions to
  add, list (new to old, by page, by kind) and mark. The writers are the existing sources:
  - the notice door, which now keeps the text and takes an optional `link`;
  - `needs.mjs`, on a new need;
  - `person-asks.cjs`, on a window put and on its «Готово»;
  - the reminders, which come through the notice door.

  Nothing is copied by hand. No personal data beyond what the sender sent.
- **866-2 The doors.**
  - The notice door takes `link`, https only, on the node's own domains or on the sender element's own address; any other link is
    dropped and said so in the answer.
  - `GET /api/node/inbox` lists the records; `POST /api/node/inbox/mark { id, state }` marks one. Both answer the architect's session
    or the core.
  - An element with its own key may mark only its own records, `read` or `gone` («the row was deleted»). The core never polls a link.
- **866-3 The panel.** A badge in the bottom-right corner, beside the orange window, shows counts per kind. A click opens the list:
  each row opens its link, «прочитано» and «готово» mark it, and a `gone` record shows «удалено» instead of a dead link. The parts are
  taken through `parts_find`, the interface skills are loaded first.
- **866-4 The Pult.** A section «Входящие» lists from new to old and scrolls to the very first, by pages. It has a filter by kind and
  the read marks. A tap opens the real page; the Pult never copies a page (§6).
- **866-5 Telegram is the bell.** One line per new record, with its link. A record read anywhere is read everywhere.

**Build:** one Mac core build together with 862-3, asked first (skill `before-a-build`). Then fractera.ai gets it by its own core
update.

## Test checklist (shown before the code, marked after)

- T1 A notice from an element with a link → one record, one Telegram line with the link, the badge +1 «заявки», a row in the Pult.
- T2 «прочитано» in the Pult → the badge −1 in the panel.
- T3 30 records → the Pult scrolls to the first; the filter «заявки» shows only those.
- T4 A need from an element and an orange window → in the same list with their kinds; the window's «Готово» marks its record done.
- T5 The sender marks its record `gone` → «удалено», no link.
- T6 Zero model calls, by the ledger.
- Negatives:
  - a notice without a key → 401;
  - another element marks someone else's record → 403;
  - a link to a foreign domain → dropped and said so;
  - `GET /api/node/inbox` from a guest → 401.
- Eyes: screenshots of the panel badge and list (desktop and 390) and of the Pult section; console clean.

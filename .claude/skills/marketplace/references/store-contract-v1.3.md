# The Fractera store standard, v1.3 — applications wait for Roma, and a signed chat per application (2026-11-27)

v1 + v1.1 + v1.2 stand except where this file says otherwise. Roma, Telegram 1603–1605 (17:57–17:59 UTC): no authorship scheme for now —
he reviews every application by hand. The text below is the task sent to the store the same evening, kept as the standard.

**3.1 Apply waits for Roma.** `POST /api/marketplace/apply` is still signed and still runs its checks (R-02, structure, leaked keys,
the description through the model). A pass no longer publishes. The answer is `202 { v: 2, application: "app-<24 hex>", status:
"pending", checks: {...} }`. Only Roma's «Принять» freezes the archive, publishes `/marketplace/<slug>/research` and adds the item to
the catalogue. «Отклонить» needs a reason. A failed check is shown to Roma as a hint and decides nothing. A repeat for the same slug
and tag returns the open application (409 with its id), never a second one.

**3.2 New fields in the apply body:**
- `element` — the applying element's id;
- `page` — the public page of that element, an https link;
- optionally `contact: { telegram: "@name" }`. The node sends it only when the author ticked consent. The store keeps it with the
  application only and deletes it on rejection.

**3.3 The dashboard** goes into the store element's administration panel, architect role only. One row per application:
- node id;
- element id;
- link to the public page;
- link to the author's Telegram (only if given);
- link to the checks report;
- status: pending, accepted or rejected;
- the chat with its whole history;
- buttons «Принять» and «Отклонить с причиной».

**3.4 The chat is a channel, signed.** New door `POST /api/marketplace/application`, body `{ node, at, nonce, application, say? }`:
- the answer is `200 { v: 2, application, status, reason?, messages: [{ from: "fractera" | "author", text, at }] }`;
- with `say` (at most 2000 characters) it adds the author's message first;
- another node's or an unknown application → 404;
- the store never calls a node.

The author's node pulls this door every 15 minutes, and only while one of its applications is pending. New lines from Fractera go to
the author's main bot.

**3.5 Roma hears about it without a model.** Each new application and each new author message → one line in Roma's fractera.ai main
chat through the core's notice door (`/api/node/notice`), with a link to the row.

**Proof:**
- a signed apply → 202 pending, a notice line, and the item is not in search;
- «Принять» → the item is in search, and the research page answers;
- a second apply → 409 with the open application;
- an author's `say` → a line on the dashboard and a notice;
- Roma's answer → returned to the author's pull;
- negatives: unsigned → 401; another node's application → 404; `say` over 2000 characters → 400.


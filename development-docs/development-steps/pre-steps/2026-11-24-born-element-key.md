# Task for the creator agent (Mac): after 857 a born native element on the server still has no key and no way to take v0.1.82 (Roma, 2026-11-24 ~16:40 UTC)

From the main agent of the server node fractera.ai, core 8f4d20aa (the node update with 849–858 landed 17:26 local, UTC+1). No keys or
personal data in this file. The main agent never reads an element's environment or code: the element's facts below are its own report.

## 1. The element's report (lidt5, 17:34 local, a reach test by Roma's word)

- In its `.env.local` **both `ELEMENT_KEY` and `DATA_SECRET` are empty**.
- `POST REMOTE_DATA_URL/db/migrate` → 401, `POST REMOTE_DATA_URL/vectors` → 401; the graph needs `ELEMENT_KEY` too → out of reach.
- The cards of `graph` and `vectors` carry no URL for an element to call.
- It is still on native template v0.1.81 and asks how to take v0.1.82.

## 2. What the core shows

- `logs/deploy-lidt5.log` (its last install, 16:41 local): line 9 «⚠ DATA_SECRET is withheld from the custom element «lidt5» (818-7c) …
  its own key (ELEMENT_KEY) opens its stores», line 10 «.env.local написан (24 переменных)».
- `scripts/services-install.mjs` line 997–1000: a variable under `# kind: element-key` gets `elementKeyOf(id, DATA_SECRET)`.
  Native v0.1.81 and v0.1.82 `.env.example` both declare `# kind: element-key` → `ELEMENT_KEY=` (line 72–73, read on GitHub).
  So the installer should have written a non-empty `ELEMENT_KEY`; the element reports it empty. **Cause not found from the core.**
  Hypotheses to test: the element's own `.env.example` at its HEAD differs from the template's (the `# kind: element-key` header lost
  or the variable under another kind); or behind the wall (fe-lidt5) the element reads another env file than the one the installer
  writes.
- **Plan 857 assumes the key exists.** Its measurement says natives born on a node «hold no key its native data-service uses»; 857-1
  falls back to `ELEMENT_KEY`. If `ELEMENT_KEY` is empty, v0.1.82 does not cure lidt5.

## 3. A born element cannot take the template update

- `GET /api/architect/items/lidt5/update` → 404 `{"ok":false,"error":"not-updatable"}`. `lib/web4-items/element-update.ts`
  `updateState()` returns null for an entry with `born` — the Update button exists only for preinstalled elements.
- The only road is `npm run template -- rollout native v0.1.82 … --elements lidt5` (skill `release-template`: owner's word only,
  pushes a commit and a tag to the element's own repository). On this server it is not run: Roma's rule «Сам не делай обновления …
  передай» (2026-11-23). Plan 857-3 says «the servers by Roma's update» — but a node update pins the template, it does not roll it
  into born elements.
- The element's repository Fractera/f2f-marketpalce has its own token (tail 4p2L); `npm run state` says 33 commits not pushed.

## 4. Needed

1. Find why a born native element on a server has an empty `ELEMENT_KEY`; the installer says so loudly when a declared element key
   comes out empty (today it is silent).
2. A road for a born element to take a template fix on any node: its own agent (it has its repo and token) or the main agent by the
   architect's word — a door or command that merges the pinned tag into the element's history, the same as the Update button does for
   preinstalled ones (merge, conflict → its agent).
3. The cards of `vectors` and `graph` name the address an element calls and the key it presents (`REMOTE_DATA_URL/vectors` with
   `X-Element-Key`; the graph's `GRAPH_URL` with `ELEMENT_KEY`) — the vectors card today says «with X-Data-Secret», which a born
   element never holds.

## 5. How to prove it

- On the server: lidt5 after the fix — `ELEMENT_KEY` non-empty (checked by the element, value never printed), `POST …/db/migrate` 200,
  a vector stored and found in its own collection, a graph insert and query in its own space; no `data/app.db` created.
- A born custom element (z8asv) and a born native one both reach data with their own key; a preinstalled native still uses
  `X-Data-Secret`.
- The born element takes v0.1.82 through the new road; its own commits stay.

—
No keys or personal data in this file.

## 6. Update 2026-11-25 00:07 UTC — the key is there now

- lidt5 to Roma in its bot (screenshot, 00:07 UTC): «ключ элемента появился ✅ — слой данных теперь пускает: тестовый запрос вернул 200;
  векторы ключ принимают, но поисковый запрос ждёт другой формат».
- The node update at 19:17 local (core 3b8c500f) re-ran the installer for every element (`logs/node-update.log` line 1189 names lidt5's
  `.env.local`), so `ELEMENT_KEY` was written then. Whether it was empty before or the element misread it is not known; 859-2 (the
  installer says an empty key aloud, the card says whether a key is present) is still worth it.
- lidt5 still runs v0.1.81: its `lib/db` sends only `X-Data-Secret`, so its own code still needs 857's data-service — 859-1 stays needed.
- 856 seen live in the same screenshot: its answer at 00:07 came with no «Выключить его?»; core log `01:07:15 [agents/done] lidt5
  close=false → asked false`.

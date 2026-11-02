# components/node-users — the tab «Users» of the auth element (node step 559)

- **Where it stands:** the element page of the core, key `users` (`app/[lang]/(architectLayer)/architect/[item]/[[...page]]/page.tsx`),
  tree section `users` with the flag `auth` (`lib/web4-items/item-tree.ts`) — only the built-in auth element, right under «Live site».
- **Files:** `node-users.client.tsx` (the island: server table, filters organization and role, sort by registration date, row selection,
  the pencil) · `user-dialog.client.tsx` (one dialog: edit → confirmation, property history, anonymization) · `batch-bar.client.tsx`
  (batch actions with a confirmation window) · `node-users.i18n.ts` (en, ru; server words passed as props).
- **Doors:** `/api/node/users/*` of the core → `/api/node-users/*` of the auth element (rules and anonymization live there — its README).
- **Writes:** every write goes through the confirmation window and is one request (`batch`); «allow marketing» is one person at a time.
- **Proven by:** a stand (the real island bundled by esbuild with the core CSS, a probe auth element on a copy of the base, headless
  Chrome) — `/code/development-docs/development-steps/completed-steps/559-5.md`.

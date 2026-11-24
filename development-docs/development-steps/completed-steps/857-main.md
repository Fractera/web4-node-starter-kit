# 857 — an element born native reaches its data; its local database never lives in a build folder — summary

Source: the fractera.ai server agent via Roma 2026-11-24 15:37 UTC (pre-steps/2026-11-24-data-road.md). Approved by Roma 1296.

## Done

- Native template v0.1.82 (468e465): `lib/fractera/store-key.mjs` — the node key first (preinstalled natives unchanged), else the element's
  own `ELEMENT_KEY`; data-service, remote-client, three media routes, by-name, seed scripts on the one resolver; `lib/db/index.ts` — the
  local file under `SERVICE_DATA_DIR` (an old file carried once), on a node a missing key is a loud `[db] remote key missing`;
  `scripts/store-key.test.mjs` (3, negative: the pre-857 rule gives a born native no key) in its prebuild.
- Custom template v0.3.242 (1d39452): the same `lib/db/index.ts` change.
- Released by Roma's own command (the classifier refused my run with his gh key), pinned 55762b19 / 112a30a0; rolled out to the nine
  preinstalled natives (60c8875, auth finished 8d10ce7d → v2.4.47); cck60 (ahead of its pin) merged v0.1.82 itself (ebb2d26, no conflict).

## Proofs

1. Guards: template prebuilds green on release (48 native, 54 custom guards), store-key.test with its negative control.
2. Live on the Mac, cck60 deployed from ebb2d26 (97 s, .next-b): its own check — `storeScope` = `element cck60`; create/insert/select/drop
   through the data service 200 ×4; no app.db in data/, .next-a|b/standalone/data/, SERVICE_DATA_DIR; no `[db]` error in its log.

## Not proven / found

- The server: lidt5 is still on v0.1.81 (401 expected); a born element has no road to take a template fix → step 859. «ELEMENT_KEY empty»
  there is the element's reading — measured after 859-1 with storeScope.
- Native elements got `scripts/deploy-self.mjs` without the npm script (data's package.json conflicts in a merge) — `node scripts/deploy-self.mjs`.
- My mistake on the way: a zsh unquoted list became one path (auth's stray local commit, never pushed, undone by Roma's command).

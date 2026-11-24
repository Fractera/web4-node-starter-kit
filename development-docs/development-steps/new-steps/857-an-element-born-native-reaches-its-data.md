# 857 — an element born native reaches its data, and its local database never lives in a build folder

Source: Roma 2026-11-24 15:37 UTC, the fractera.ai server agent's task (pre-steps/2026-11-24-data-road.md, data). Approved by Roma 1296
(«решай это самостоятельно … работай»).

## Measured on the Mac (not again)

- Every element born on the node is registry kind `user` — natives born by «Создать нативный элемент» too (cck60 here, lidt5 there).
  `lib/web4-items/element-env-keys.mjs` gives a kind `user` an empty DATA_SECRET (818-7c, right: with it an element could mint any
  element's key). So EVERY native element born on a node holds no key its native data-service uses — not a lidt5 accident.

## Substeps

- **857-1 · Native template data-service** (release-template, native): when `DATA_SECRET`/`DATA_API_KEY` is empty, send `X-Element-Key`
  from `ELEMENT_KEY` (the custom template's road); a preinstalled native keeps `X-Data-Secret`. On a node (`REMOTE_DATA_URL` set) a missing
  key is a loud error `[db] remote key missing`, never a silent local file.
- **857-2 · Both templates' `lib/db`**: default `APP_DB_PATH` under `SERVICE_DATA_DIR` (outside `.next-*/standalone`), the local road on a
  node only with that loud warning.
- **857-3 · Roll out** the native release to cck60 (and the custom one to fc4vk, root) by tag and pin; the servers by Roma's update.
- Proofs: cck60 writes a row and reads it back through the data layer (200), no `data/app.db` created; negative — a preinstalled native
  still sends `X-Data-Secret`; the local road row survives deploy a → b → a; on a server lidt5 the same (after Roma's update).

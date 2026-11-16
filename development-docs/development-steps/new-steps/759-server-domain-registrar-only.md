# 759 — the server's domain: one way, through the registrar

## Why

The owner, 2026-11-16: «из процесса установки сервер вычистить все варианты которые идут как альтернатива на Cloud Flyer. Поставил
единственное возможный вариант подключения только через регистратора все это мешает надо убрать сейчас».

Measured the same night on fractera.ai: the Cloudflare branch (a key saved, a write button, a dialog) left the owner believing the records
were written while nothing was; step 3 looked done.

## The shape

The domain ladder of the launch and of the server's own panel keeps: the domain · where its records live (facts, the DNS host named as it
is) · one question «access to the registrar?» (yes → `dns`, no → `none` with the instruction to copy) · the records by hand + «Check DNS».
Removed: the Cloudflare question, the ways `cloudflare` and `migrate`, the node's write with its Cloudflare key (`cloudflare-write` in both
doors, `lib/hosting/server-records-cf.ts`), the «Почему не Cloudflare?» block in the records, the Cloudflare and migrate texts.
A record written earlier with `cloudflare` or `migrate` reads as `dns` (`normalWay`). The computer's own domain activation (its tunnel) is
not this process and stays.

## Substeps

- 759-1 `lib/hosting/launch-domain.mjs`: `wayOf`/`answersOf` registrar only, `normalWay`; runner and server door accept `dns|none`.
- 759-2 the doors: `cloudflare-write` gone from `/api/node/launch` and `/api/node/server/domain`; `server-records-cf.ts` deleted.
- 759-3 the islands and words: one question, records by hand only; en/ru.
- 759-4 tests updated, `tsc`, guards, the core rebuilt; the page seen with `npm run eyes`.

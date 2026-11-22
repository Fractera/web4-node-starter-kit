# 838 — the page a server shows while the node updates speaks one language: the visitor's

## 1. Retelling and decision

The owner, 2026-11-22 15:13 UTC (Telegram 841, a photo of the page during his core update), verbatim: «Прошу тебя проработать все места где
появляются такой текст. Это абсолютно неправильно подход мы должны показывать текст только на одном языке на правильном языке. Сегодня у
нас два языка завтра будет 82 ты что здесь будешь показывать 82 языка?»

Found (git grep of the texts and of `lang="ru"` in every static page): ONE such page — `scripts/dedicated-server/updating.html`, which
nginx serves for the core and every element of a server while it rebuilds (`lib/hosting/nginx.mjs` MAINT_PAGE). The other hits are
comments. The page has no server behind it, so it cannot ask the node which language to use.

A second defect on the way: the page is copied into nginx only by `fractera-root nginx-apply`, and the live server re-applies only when
the generated nginx site changed (`scripts/serve.mjs` reapplyServerEdge) — a changed page alone would never reach a server.

## 2. Substeps

| # | What | Done when |
|---|---|---|
| 838-1 | The page holds the words of every language of the node in one JSON block and SHOWS one: the address's language (`/ru/…`), the node's cookie `NEXT_LOCALE`, the browser's languages, else the first entry (English). Hidden until chosen; without script — the first entry only | the static text has one heading and one line; the chooser picks right in every case |
| 838-2 | A live server re-applies nginx when the page differs from the applied copy, not only when the site changed | `reapplyServerEdge` compares the page |
| 838-3 | `scripts/updating-page.test.mjs` in the prebuild: one visible language; an entry for every language the node turns on (a new language without its words fails the build); the chooser run in a sandbox; the re-apply rule | green with its negatives |

## 3. Checks and results

| Check | Result |
|---|---|
| the test (sandbox: /ru → ru, cookie → ru, browser de,ru → ru, browser de → en, no script → en only) | ✅ 8 passed; negative: the old bilingual page has 2 headings → the test fails it; prebuild RC=0 (logs/prebuild-838.log) |
| live on the server: the next update shows the page in one language | ⏳ |

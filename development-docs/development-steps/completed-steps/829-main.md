# 829 — a new element's first Telegram message reaches its agent; its bot gets «Приложение» (closed 2026-11-21)

The owner, Telegram 579 (16:27 UTC): «Я всё равно не могу запустить Telegram бот на элементе после нашего с тобой обновления я завис на
этом экране и чтобы я не нажимал на секунду выскакивает слово загрузка и всё» · 583: «ты каким-то образом пинками его запустил мне это не
подходит. Стандартный процесс не стартует + Telegram приложение нету почему».

## Causes measured

1. j58fl (born 16:04): «high» at 16:25:02 started the agent, the channel stood up at 16:25:09, but the core logged at 16:27:09 «поручение
   не вставлено — 120 с на экране стоит вопрос»: the node had answered the first start's folder-trust dialog, and its words stayed in the
   last 4000 characters of the stream — an idle Claude Code prints too little to push them out.
2. `onButton` kept the question's buttons until the channel and the paste (minutes); once the session runs, its plugin reads the bot and
   drops them — every press showed «загрузка». And it said «получил ваше сообщение» when the paste had not happened.
3. No «Приложение»: the node took an element's Mini App address from `PROJECT_SITE_URL`, which the custom template never declares — no
   custom element's bot ever got the button; nothing set it again after a redeploy. The main bot's «Пульт» stayed on the temporary
   address after the domain moved to throughsongs.com.

## Commits

| Repository | Commit | What |
|---|---|---|
| core | fdbdcbf0 | agent kit `screen.cjs` (the detectors out of bridge.cjs; the trust cut once `.claude.json` records the trust), bridge and telegram in the master and 12 copies, `tg-menu.cjs` elementSite from the node's domain record, `deploy-elements.mjs` refreshes element buttons and the Pult, tests `screen-trust`, `wake-button`, `tg-app` 829-2 |

Pushed with 828 (614dfb59). Live at once without a build: `npm run tg-app -- menu j58fl` → «Приложение» https://j58fl.throughsongs.com/tg
(16:42), `npm run tg-app -- menu` → «Пульт» architect.throughsongs.com (16:54).

## Proofs

Plane 1 — `screen-trust` 6 ✓ (the defect reproduced with the old reading; negatives: a prompt after the trust is still seen, an
unrecorded trust still counts), `wake-button` 4 ✓ (buttons off before the starter; «не дошло» on pasted false; negatives: no false alarm,
a failed start puts the buttons back), `tg-app` 16 ✓ (829-2 with a negative: no record, no variable — the default menu).
Plane 2 — the owner's own run: «Да он услышал да ответил» (Telegram 582, after writing again) and the Mini App opened in Telegram (586,
16:58) — the button live. The first-message path after the trust cut waits his next new element (the core runs 614dfb59).

## Mistakes

- I first told him to write again — a stopgap he rightly refused; memory `standard-process-not-kicks`.
- I tried to read an element's `.env.local` to see its address; the guard was right to refuse it — the address belongs to the node's
  record.

## Evolution of skills

None now; the memory above holds the lesson.

## Parts born here

None.

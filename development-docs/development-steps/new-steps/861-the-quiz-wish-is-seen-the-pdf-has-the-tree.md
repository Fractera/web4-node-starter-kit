# 861 — a quiz wish is seen and reaches the chat; the PDF carries the tree with marks; the element reads its own PDF; the quiz speaks the person's language

Status: PLAN — proposed to Roma 2026-11-27 08:2x UTC (Telegram 1472), waits his yes before code.

## Sources
- Roma 1467 (gist): «Продолжить квиз» → wrote a wish → «вставить» → the window closed, no understanding where it went; expected a
  notice «ваше пожелание к квизу добавлено, перейдите в чат», a button to the chat, and the agent knowing new words were added.
- lidt5 via Roma 1468–1470 (`for-mac-quiz-pdf-marks.md`, three revisions): the PDF has no node marks; the element cannot read its own
  PDF (401); the quiz is written in the site's default language (en) while the person speaks ru.
- fractera.ai main agent via Roma 1471 (`for-mac-quiz-pdf-own-key.md`, need-20261127-3d1637): the PDF and quiz doors take the element's
  OWN key for its own item only (neighbour 403, bogus 401, no key = panel roles); a template command `quiz:pdf` saves it in its folder.

## Measured on the Mac before code
- The quiz island (components/element-docs/product-quiz client) `send()` opens the terminal drawer with the words — invisible from a phone.
- `lib/web4-items/product-quiz-pdf.ts` `quizPdfHtml` renders modules/stages/decisions but NOT `quiz.tree` — the marks cannot appear.
- `app/api/node/product-quiz/pdf/route.ts`: `requireRoles(architect, admin)` only.

## Substeps (each: two proofs, one negative)
- **861-1 · The wish reaches the agent and the person sees it.** The quiz window's «Send» and «Продолжить квиз» deliver the words to the
  element's agent through the node (the 852-4 road: kept under the element's quiz feedback, the main agent's task line → `npm run task`),
  and an unmissable notice: «Пожелание к квизу передано агенту — он продолжит в чате» + «Перейти в чат» (the element's bot; no bot — its
  terminal). Proof: eyes of the notice; the task line arrives; negative — an empty wish is refused.
- **861-2 · The PDF prints the tree.** Every node with its mark drawn as a shape (✓ person green · ◇ agent amber · ○ open grey), a legend,
  counts per level as `quiz:tree` prints them; an open node shows `q`, a filled one `a`. Proof: a PDF of a test quiz with known counts;
  negative — a quiz without a tree prints the old sections, no empty table.
- **861-3 · The element's own key.** `GET /api/node/product-quiz[/pdf]?item=<id>` with the element's own `X-Node-Key` → 200 for its own
  item; a neighbour's item 403; a bogus key 401; no key → the panel roles as today.
- **861-4 · Templates (custom + native).** `npm run quiz:pdf -- <file>`; the skill `product-quiz`: the quiz in the person's language
  (`person-lang`), the header names it; the agent rewrites its existing quiz once (numbers and marks unchanged). Releases by Roma's
  own command in a window.

## After
One Mac core build, releases, one server update; lidt5's PDF counted by Roma's screenshot: 109 ✓ · 47 ◇ · 5 ○.

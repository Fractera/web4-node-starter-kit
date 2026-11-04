# 647 — the agent's eyes in every node: `npm run eyes`, no extension needed

## 1. Retelling and decisions

The owner, 2026-11-04 ~22:40 UTC, after the drawer was shown to him broken twice (the agent proved «the class is in the build», not
«the page looks right»), verbatim: «второй вариант у нас должен приезжать автоматически с каждым новым развёртыванием у наших гостей»;
«вместо первого навыка устанавливаем решение которые по умолчанию работает у всех гостей правильно? Для решения два мы вносим изменения
и рассказываем пользователю о том что он должен установить Chrome если использовать Safari … поставить соответствующие расширение и
рассказать о том что без этого … задачи … не смогут быть решены … Ты обновишь также текст инструкции чтобы агент из коробки понимал свои
полномочия? А затем мы пройдём и изменим все эти навыки у каждых элементов?» → «да, начинай 647».

Measured 2026-11-04 on the owner's Mac (macOS 12.7.6, Intel): `playwright install chromium --only-shell` → «Playwright does not support
chromium-headless-shell on mac12»; Playwright 1.64.1 drives the installed Chrome 150 headless (`channel: 'chrome'`) — status 200.
Decision: the browser in order — Playwright's own Chromium, then installed Chrome, then Edge, else named aloud.

## 4. Observable results
- `npm install` on a fresh node ends with `===EYES_OK===` (or `===EYES_NO_BROWSER===` with what to install), CI skipped.
- `npm run eyes -- <url> --click … --measure …` prints the browser, a screenshot path, console errors and «виден / ПЕРЕКРЫТ / вне экрана».
- `use-browser` starts from `eyes`; `help-in-browser` tells the person about Chrome + extension or leads them by words.
- CLAUDE.md §6: a built surface is seen through `eyes` before it is shown; resealed.

## 5–7. Substeps
| | what |
|---|---|
| 647-1 | `playwright` dependency, `scripts/ensure-eyes.mjs` in `postinstall`, `scripts/eyes.mjs`, `npm run eyes` |
| 647-2 | skills: `use-browser` (eyes first), `help-in-browser` (Chrome + extension, or words) |
| 647-3 | CLAUDE.md §6 line, resealed |
Not in it: templates and elements — step 648 (template release + rollout), by the owner's order.
On the way (not this step): on the temporary address «Обновить сборку ядра» is active though its page is read-only.

## 9. The owner's approval
«да, начинай 647» (2026-11-04).

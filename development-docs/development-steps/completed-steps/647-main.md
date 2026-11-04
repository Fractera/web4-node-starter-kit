# 647 — the agent's eyes in every node (closed)

**Commits** in `Fractera/web4-node-starter-kit` (main): plan `872e1f63`; 647-1 `74753475`; 647-2 `999a3f54`; 647-3 `23a752f5` (seal
`0e818b5c6ddb`). The plan was deleted in the closing commit: `git show <closing>^:development-docs/development-steps/new-steps/647/647-main.md`.

**The owner, verbatim:** «второй вариант у нас должен приезжать автоматически с каждым новым развёртыванием у наших гостей»; «вместо
первого навыка устанавливаем решение которые по умолчанию работает у всех гостей правильно? Для решения два … рассказываем пользователю о
том что он должен установить Chrome … Ты обновишь также текст инструкции …? А затем мы пройдём и изменим все эти навыки у каждых
элементов?» → «да, начинай 647».

## 647-1 — `npm run eyes`, installed by `postinstall`
`scripts/eyes.mjs` (address, `--click`, `--measure`, `--top`, `--width`, `--dark`, `--full`, `--out`; prints the browser, the screenshot,
console/page errors, «виден / ПЕРЕКРЫТ / вне экрана»); `scripts/ensure-eyes.mjs` in `postinstall` (Playwright's Chromium → the installed
Chrome → Edge → `===EYES_NO_BROWSER===`; exit 0 always; `CI` skips); `playwright@^1.64.1`; `npm run eyes`, `npm run eyes:install`;
the launch's packages stage says «и браузер для проверок».
**Measured:** «Playwright does not support chromium-headless-shell on mac12» on the owner's Mac (macOS 12.7.6, Intel); Chrome 150 headless works.
**Proofs:** (1) the owner's own `node:update` (core `a36702d3`, 23:06 UTC): `===EYES_OK=== chrome 150.0.7871.125 (свой Chromium не встал: …mac12)`
in its npm install; CI three-os green with `===EYES_SKIPPED===` on Linux and Windows (negative control: nothing downloaded there).
(2) `npm run eyes` run in his node measured the drawer — see 645-1.

## 647-2 — skills
`use-browser`: the eyes are `npm run eyes`, no extension; «seen before shown»; the measurements that lied (self-scroll → `--top`, a tab
from before a rebuild, the worker). `help-in-browser`: Chrome with the Claude extension named before the task with both links; without it —
lead by words, one step per message, foreign screens from their public help through `eyes` or the person's screenshot.
**Proofs:** `check:skill-headers` OK; `check:instruction-skills` OK (21 skills); the drawer check above was done by following the skill.

## 647-3 — CLAUDE.md §6
«A built surface is seen first — `npm run eyes` … — then shown to the architect. The person's Chrome … only for acting in someone else's
interface.» **Proofs:** `check:instruction` FAIL before the seal (negative), OK after; the line is in the owner's node after his update.

**Mistakes.** None of the code; the cause of the step is 645-1's.
**Owed:** step 648 — templates and every element (their `eyes`, both skills, the instruction line), by the owner's order.
**Evolution of skills.** The two skills above.

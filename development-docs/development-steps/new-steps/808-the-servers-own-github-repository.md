# 808 — the server's own GitHub repository (an optional step of the launch ladder)

State: CODED 2026-11-20 ~10:40 UTC after his «Давай» (Telegram 39) — tests green, prebuild RC=0, NOT built (waits his word on the core build), not seen live.

## The owner's words (verbatim, Telegram 2026-11-20)

- 09:49: «когда ты развёртывает сервер то он получает тот же самый репозиторий GitHub намаз взгляд это некорректно у пользователя
  сервера должна быть возможность ввести собственно GitHub не так ли?»
- 09:50: «давай добавим шаг про репозитории GitHub но чуть-чуть по-другому: по умолчанию адреса нет и этот шаг можно пропустить он будет
  точно также восклицательным знаком как и Telegram шаг необязательный но рекомендуется. Но там же можешь поставить кнопку использовать
  тот же и тогда подставиться существующие. Понял задачу делаем?»

## Measured

- The ladder: `components/hosting/server-launch-rungs.ts` LAUNCH_ORDER = server · check · domain · install · telegram · recheck · certs ·
  ready; Telegram (5) is the optional rung with «!» (`telegramSettled`: configured, pending or skipped).
- The source today: `scripts/dedicated-server/launch.mjs` `forkUrl()` = this computer's `origin` → `launch.sh … $FORK` → `git clone`
  (`do_source`); the update (`do_update`) follows the server's own origin.

## The shape

- A new rung **«GitHub-репозиторий сервера»** BEFORE the installation (the source must be known before `git clone`): domain (3) →
  **GitHub (4, «!» optional, recommended)** → installation (5) → Telegram (6) → … (the numbers shift by one).
- The field is EMPTY by default; «Использовать тот же» fills this node's fork; «Пропустить» settles the rung like Telegram's.
- An address given: `https://github.com/<owner>/<repo>` — checked before it is kept (public, reachable, a fork of
  Fractera/web4-node-starter-kit or a repository whose history holds Fractera's); kept on the server (`/root/.fractera/repo.json`),
  never on this computer (738: the computer keeps no state of a server).
- The installation clones the kept address; the server node's own GitHub token later goes on ITS page «GitHub».

## Open question (to the owner)

- **Skipped — what does the server install from?** My pick: Fractera's original (github.com/Fractera/web4-node-starter-kit, public) — the
  server stands on the latest release and has no fork of its own until one is given on its GitHub page. Other: this node's fork anyway
  (then «skip» only hides the choice).

## Collision found after his «А» (2026-11-20 ~10:05 UTC)

- `scripts/check-origin.mjs` (step 368, the owner 2026-10-01; CLAUDE.md §2 «Installation — only from a direct fork») refuses the original
  itself («Это сам оригинал, а не ваш форк») and a fork of a fork; it runs in `do_source` of `launch.sh` → A as asked would fail at the
  install. So a given address must be a DIRECT fork (GitHub: fork = true, parent = Fractera/web4-node-starter-kit) — not «history holds».
- `relationOf(probe, forkUrl())` judges a server by THIS node's fork: a server on another fork reads «unrelated» (other-fork) → the page
  would offer to clear it. The kept repository must become the server's own measure.
- Asked him: B (skipped → this node's fork; my pick now) or a law change (the server may stand on the original — his word, §2 and 368).

## The owner's shape (Telegram 37, 2026-11-20 10:01 UTC, verbatim)

«– при входе по умолчанию стоит тоже самое репозиторий и подсказка режим вы переносите работу собственного проекты из локальной машины на
удалённый сервер. – Есть второй режим: поднять чистый стартер Fractera на любом vps переключении появляется новая лесенка внутри этого шага:
– зарегистрируйте аккаунт GitHub кнопка сделано – в собственном аккаунте GitHub сделайте Fork репозитория Fractera ссылка на репозиторий
Fractera. Кнопка сделана – введите ссылку на свой Repository. Кнопка проверить. Если всё хорошо то Лесенька шага открывается. Обязательно
испортите [изучите] специально инструкцию для дизайна стиль дизайна используют такой же как и у всей страницы для развёртывания сервера.»

→ fits the law (only a direct fork). Proposed to him (waits «да»): mode 1 «Тот же проект» (default, this node's fork; code and updates
shared, the server's data its own — no «перенос» of data); mode 2 «Чистый Fractera» — a nested ladder of 3 rungs (GitHub account «Сделано»
· fork with the link «Сделано» · the address «Проверить» = GitHub API: fork, parent = original); no «!» (the step is never empty); after the
install the step shows the server's origin read-only.

## Substeps

- 808-1 lib `lib/hosting/server-repo.mjs`: forkCheck(url) (GitHub public API, direct fork of the original, reasons), repoView; tests with
  negatives (the original itself, a fork of a fork, not a fork, 404, silent).
- 808-2 the runner: verb `repo` (mode same | own + url → `/root/.fractera/repo.json`), `state.sh`/readState reports it; `install` clones
  the kept fork (same → forkUrl()); relationOf measured by the server's own fork; refusal `repo-not-chosen` for own without a check.
- 808-3 the rung «GitHub-репозиторий сервера» between domain and install: a mode switch, the nested ladder (the part `Ladder`), words
  ru/en, ladder order; the page's design skills first.
- 808-4 tests (runner dry: install source by mode; relation), prebuild, eyes of the page; the core build only after his yes.

## Old substeps (before his shape)


- 808-1 the rung: words (ru/en), the field + «Использовать тот же» + «Пропустить» + «Проверить», «!» state; ladder order and numbers.
- 808-2 the runner: `repo` verb (check + keep on the server), `install` reads the kept repo (or the skip's source); `state.sh` reports it.
- 808-3 tests (the check with a negative: not a fork, unreachable; the install source by the three answers), eyes of the page.

## Not in it

- A branch per node on a shared fork (said to the owner as an idea; not asked).

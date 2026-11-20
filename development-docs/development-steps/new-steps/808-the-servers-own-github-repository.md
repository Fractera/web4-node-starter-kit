# 808 — the server's own GitHub repository (an optional step of the launch ladder)

State: PLAN — waits the owner's «да» on the one open question (what a skipped step installs from). Asked 2026-11-20 ~09:55 UTC.

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

## Substeps

- 808-1 the rung: words (ru/en), the field + «Использовать тот же» + «Пропустить» + «Проверить», «!» state; ladder order and numbers.
- 808-2 the runner: `repo` verb (check + keep on the server), `install` reads the kept repo (or the skip's source); `state.sh` reports it.
- 808-3 tests (the check with a negative: not a fork, unreachable; the install source by the three answers), eyes of the page.

## Not in it

- A branch per node on a shared fork (said to the owner as an idea; not asked).

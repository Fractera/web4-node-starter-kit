# 769 — the server's access is given before the long check (the owner 21:24: «Го»)

The owner, 2026-11-16 19:32: «С третьей попытки сработало». Measured: the pin of 109.199.105.213 was written at 19:31:40 (the visit
opened on the server), yet the page said failure; the door kills `connect` at 150 s (route.ts) while connect = openVisit + a new ssh +
probe.sh (≤ 90 s, a reinstalled server's first run) + state.sh (≤ 40 s) → the runner died with the visit key in its memory.

## Substeps
- [x] 769-1 runner `connect` with a password returns `{ ok, fingerprint, visit, state: null, check: 'probe' }` right after openVisit; the
  door keeps the visit in the cookie as before; without a password — unchanged (by key + probe + state).
- [x] 769-2 the page: after the password — `probe` by the cookie, «Доступ открыт. Проверяю сервер… до двух минут»; the check failed — the
  access stays, «нажмите «Проверить сервер» ещё раз — пароль не нужен».
- [x] 769-3 the window (768-5): Spinner + «Проверяю сервер…»; closes only on `probe` ok && state; `host-key-changed` — the new
  fingerprint shown and «Доверять новому ключу и войти» (connect with `trust`), the request stays open.
Tests: R1 runner — the password answer has the visit and no state; `probe` by the visit key returns the state (hosting-launch 22 ✓, the
pre-existing ✗ «the claim goes server door …» unchanged); R2 live — close the access, the owner types root in the window → «Проверяю
сервер…» → the window closes, step 2 opens; R3 eyes on the window's spinner.

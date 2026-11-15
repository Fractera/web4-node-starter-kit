# 748 — «Клон сервера»: a server node moves itself to a new machine, elements and data included

**Status: a plan, not approved, nothing built.** Written 2026-11-15 at the owner's word «Да, делай вариант 1, потом план клона || today i
need fast and short solution plan must exist for feature». Variant 1 (the honest page «Переезд на другой сервер», 747) is built; this
step gives that page its button.

## 1. The owner's words (verbatim, 2026-11-15)

«существует вероятность что в определённый момент тот сервер который использует пользователь упрётся в технически предел и хостинг не
позволит ему в рамках существующего тарифа просто повышать хостинг вертикально или просто окажется не выгодно. И тогда пользователя нужно
будет переехать на другой хостинг. Поэтому получается что кнопка должна существовать … это вкладка, которая поможет вам создать клон
вашего текущего сервера на новой машине … затем переключить туда домен проверить работоспособность. Какое-то время у вас будет
возможность протестировать два сервиса одновременно но понадобится дополнительный домен … после завершения тестирования потушить текущий
сервер начать использовать новый.»

Corrected with him the same day (my answer, not contested): the main domain stays on the OLD server while the new one is checked on a
spare name; the main domain moves only after the check; the old server stops last — never the other way round (visitors would meet an
unchecked machine first).

The law it must not break: «Никакого переезда нет есть просто запуск сервера» (2026-11-14, 738) was said about the person's COMPUTER
(«в данном локальном компьютере меняться ничего не должно»): a computer launches servers and stays as it is. The clone is server → server
and is started on the old server; the computer is not involved. **D0 below asks him to confirm this reading.**

## 2. Measured state (2026-11-15, the core at `d81b9098`)

| Fact | Where it was read |
|---|---|
| The 737 move was built, proven live (this Mac → 213.199.61.7, 2026-11-13) and removed by `ff570015` (2026-11-14 10:04): `scripts/dedicated-server/move.mjs` 560 lines, `lib/hosting/transfer.mjs` 110, `move-state.mjs` 133, five `server-move-*` UI files 762, `scripts/hosting-move.test.mjs` 261 | `git show --stat ff570015` |
| What it carried: the core's git history, `data/`, `logs/` state, the registry, every element folder with its `.git` and uncommitted work, `.env.local` (copied, never read). Never: `node_modules`, builds, `.uv/.venv`, the computer's key and pins, tunnel/runtime marks, logs; the server's own records were protected from `--delete` | `git show ff570015^:lib/hosting/transfer.mjs` (`EXCLUDES`) |
| Two phases: the bulk while the node works, the last changes after it stops (consistent SQLite). A silent rehearsal: no bot tokens (`data/services/*/channel/telegram*/.env`), no `logs/domain.json`; agent wakes refused by the server mark `phase: silent` | same file `SILENT_EXCLUDES`; `scripts/dedicated-server/start.sh` line 3 |
| Two readers of one bot: Telegram answers 409 and the reader yields — messages split between two servers | `…/build/_agent-kit/server/telegram.cjs:352` |
| The move's carrier was `rsync` over the system `ssh` with the node's PERSISTENT key; 744-3 (D45) retired that key: access now is a VISIT key held in the browser's HttpOnly cookie, dying on the server by sshd `expiry-time`, never on a disk | `lib/hosting/ssh.mjs` (`openVisit`, `VISIT_MINUTES = 1440`), `lib/hosting/window.mjs` |
| `exec(client, cmd, { stdin })` sends stdin as ONE buffer (`stream.end(stdin)`) — a tar stream needs a piped variant | `lib/hosting/ssh.mjs:162` |
| The launch door `app/api/node/launch` and its runner have no place refusal; only the page draws the launch form at home (`server-place.client.tsx`) | `git grep placeKind` over both — none |
| The server's domain ladder takes a subdomain («node.example.com») and «Another domain», refusing while a domain is on («switch it off first») — a spare name first, the main domain later, is a designed path, never run live | `components/hosting/server-ladder.i18n.ts` |
| No code restores an element from its own GitHub repository on another node — yet the server's red banner says «тогда проект можно восстановить на любой машине» | `git grep` (none); `components/node-state/github-token-alarm.i18n.ts:42` |
| Let's Encrypt limits are counted per domain across servers by the launching node | `scripts/dedicated-server/launch.mjs` header, `data/node/server/le-ledger.json` |

Not measured yet (748-1 measures it): the size of aifa.dev's clone (needs the owner's visit — his root password opens a day).

## 3. Decisions for the owner (my pick first)

- **D0 — the law of 738.** Pick: the clone is server → server, started on the old server; «no move» stays the computer's law. Other: the
  clone is started from a computer node (then a person who removed it by 746 must install one first).
- **D1 — the carrier.** Pick: a tar stream over the visit's SSH connection (`ssh2` in node, the key only in memory, D45 kept, works
  wherever node runs). Other: `rsync` with a one-time key on the old server's disk, installed on the new one with `expiry-time` and
  deleted at the end (faster deltas, breaks D45 for a few hours).
- **D2 — what travels.** Pick: what 737-5 carried (above), minus the old server's own server records; the new server issues its own
  certificates; Claude Code is signed in again by the person on the new server (sign-in is always the person's).
- **D3 — the downtime of the switch.** Pick: minutes, said before the button: the old server stops (its sites answer `updating.html`),
  the last data go (phase 2), the new one starts with the bots and clocks. Other: a read-only old server during phase 2 (more code).
- **D4 — the old server after the switch.** Pick: stopped and kept for 7 days with a «Вернуть» (rollback: the main domain's records
  back, the old one starts); then «Очистить» by the person. Other: cleared at once.
- **D5 — the banner's overclaim.** Pick: correct the words now (they promise a restore no code does); the clone carries element repos as
  folders, so the promise becomes true through the clone, not through GitHub.

## 4. Substeps (each ends with something shown)

| # | What is shown | Proof — two planes, a negative control |
|---|---|---|
| 748-1 | The 737 move code restored into a scratch copy, its gaps against today's core listed (744-3 visit, 744-7 ladder, 741 place record with the machine hash, 746, node records); aifa.dev's clone size by a dry tar listing during a visit | the old `hosting-move.test.mjs` run on the scratch copy (passes or names each break); the size as numbers from the server |
| 748-2 | `execPipe` + the tar carrier: phase 1 (all but silent paths) and phase 2 (`data/`, `.env.local`, element working trees) over one visit | a harness with two `ssh2` test servers: the tree on «new» equals «old» minus the excludes (hash per file); negative: a planted bot token never arrives in phase 1 |
| 748-3 | The silent new server: started on the spare name, no bots, agent wakes refused, element clocks held | planted clock due during silence → not run, runs after the switch; Telegram: one reader only (no 409 in either log) |
| 748-4 | The page «Переезд на другой сервер» gets its ladder (the 744-7 `Ladder`): new IP + root password → probe → prepare → copy (silent) → Claude sign-in → check on the spare name → switch → keep the old 7 days | eyes on aifa.dev's page in both states; the door refuses on a computer (`placeKind`) |
| 748-5 | The switch: the old stops, phase 2, the new goes live, the main domain moves (spare off → main on → records → certificates) | a planted row written on the old before phase 2 is on the new; the main domain answers from the new IP; the LE ledger counts |
| 748-6 | Rollback within 7 days: «Вернуть» brings the main domain back and starts the old | the main domain answers from the old IP again; the new one silent |
| 748-7 | Live, from scratch: a clean test server cloned from aifa.dev, switched, rolled back, switched again | two proofs from different planes per stage; the owner's test-from-scratch rule (reinstalled OS) |

Order: 748-1 → 2 → 3 → 4 → 5 → 6 → 7. Address: the core `~/fractera-dev/web4-node-starter-kit`, `main`; the live test on a fresh
server the owner provides. Every substep: the full prebuild chain, CI green on both systems, the fork synced by `gh api … merge-upstream`.

## 5. Not in this step

Moving a person's COMPUTER node to a server (738 forbids it); cloning to a non-Ubuntu machine; carrying the Claude login, nginx, the old
certificates; a restore of an element from its GitHub repository alone (a step of its own, if wanted after D5).

## 6. Price, said before the first line

About two working sessions of Opus for 748-1…6 (the move's code exists — most of the work is adapting it to 744-3 and the server as the
source), one live session for 748-7 with two servers running for a few hours (the provider's hourly price of the test server).

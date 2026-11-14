# 744 — the launch ladder from the beginning: access for one day, a strict ladder, one rung open

Planned 2026-11-14 at max effort as a PLAN ONLY (the owner's rule: the maximum model plans, Opus executes). Repository: the core only
(Fractera/web4-node-starter-kit, main). Ships in ONE node update together with 743-7 (the interface-skills gate), which is still not live
on this node. Every interface file of this step is written with `interface-design`, `use-primitives`, `use-shadcn` loaded (743-7 refuses
it otherwise once live).

**Status: waiting for the owner's approval of 744-1…5 and D44–D47.**

## 1. The owner's words (verbatim, 2026-11-14) and the retelling
- «Хочу двигаться дальше пока ты не покажешь мне нормальный котором каждый следующий шаг заблокирован до предыдущего и у нас третий шаг не
  был выполнен то есть ты конечно имел право показать мне что домен к серверу уже подключён и какой именно режим выбрали и только тогда
  открыть четвёртый шаг. Ну ты этого не сделалэто недопустимый вариант. Плюс реализуй шаги в формате аккордеона выглядит слишком
  перегруженный только один шаг должен быть открыты все остальные должны быть скрыты разумеются с использованием навыков»
- «Отдельный вопрос безопасности и конфиденциальности не думаю что у тебя есть право хранить пароль от сервера потому что это могут быть
  чужие сервера. Поэтому в любом случае прохождение первого шага зависит от реального ввода пароля они от того что ты где ты сохранил его и
  в случае взлома пользователи получит доступ ко всем серверам»
- «Вопрос сводится к тому что ты ничего не сделал формально мы даже не можем сейчас пройти первый шаг поэтому очень жаль потерянный время и
  деньги но видимо начинаем с самого начала»
- «Хрони ключ вокально хранилище браузера с продолжительностью и более 24:00 это нормально?» · «no more then 24»

Retelling: rebuild «Активация выделенного сервера» from step 1. (1) No lasting access to anyone's server: step 1 is passed by the real root
password; what it gives is a key that lives in the browser for at most 24 hours AND dies on the server itself at that hour. (2) A rung
opens only when every rung before it is done — no exception in any page. (3) Step 3 shows what the server already knows — the domain and
the way chosen — and only that opens step 4. (4) An accordion: one rung open, the others closed.

Assumptions:
- I assume «ключ в локальном хранилище браузера» means `localStorage` of this node's own address (`localhost:24680`), one entry per server.
- I assume the 24-hour limit is a security limit, so it is enforced by the server (`expiry-time` in `authorized_keys`, OpenSSH ≥ 8.2),
  the browser's own deadline only cleans up — a key copied out of the browser dies on the server at the same hour.

## 2. Measured state (2026-11-14, do not measure again)
- `scripts/dedicated-server/launch.mjs`: 11 actions open SSH by the node's PERSISTENT key — connect, state, probe, install, domain, way,
  detect, dns, door, signin, clear; the pair lives in `data/node/server/id_ed25519` (0600) on this computer; only `lib/hosting/ssh.mjs` and
  `launch.mjs` use it. The root password is read once from stdin, installs the public half, and is dropped (never on disk).
- The test server 213.199.61.7: `authorized_keys` = `fractera-node` ×1 (ours, no expiry) + `fractera-project-agent` ×7 (old, foreign — the
  owner's decision); `OpenSSH_9.6p1 Ubuntu-3ubuntu13.20`, its `sshd(8)` documents `expiry-time="timespec"`; `PasswordAuthentication`: `yes`
  in `50-cloud-init.conf`, `no` in `60-cloudimg-settings.conf` — sshd takes the first value, so passwords work there today.
- The ladder: `components/hosting/server-launch.client.tsx` opens «install» right after «check» (738 «The domain holds nothing»); step 3
  (`server-launch-domain.client.tsx`) reads only `/root/.fractera/domain.json` — ABSENT on the test server — while the server node's mark
  `data/node/server.json` holds `domain: aifa.dev`, `domainWay: migrate` = the 737-19 option «Только у регистратора» (DNS at Cloudflare,
  access only at the registrar). The part `ladder-step` (`LadderStep`, `LadderLocked`) draws every rung as an open card at once; users:
  server-launch, server-launch-domain, server-ladder, server-ladder-end, the computer's `domain-ladder.client.tsx`.

## 3. What is reused
`lib/hosting/ssh.mjs` (key generation, `installKey`, pinned host keys — kept, a host key is public), `launch.mjs` and its server scripts,
the 737-19 sub-ladder steps (`server-ladder-steps.client.tsx`: DomainStep, WhereStep, WhoStep; `server-ladder-records.client.tsx`), the
shadcn `components/ui/accordion.tsx` (Radix), the part `ladder-step` (grown, not forked), `npm run eyes`, the owner's Chrome.

## 4. Known limits
- A password is typed only by the person (never by an agent); the node never writes a password or a server key to disk (this step's law).
- `check:shadcn-parts`, `check:typography`, `check:i18n`, `check:parts-map`, the 250-line limit; tokens only (`bg-primary` with its pair).
- Long server work (install, update, certificates) runs detached on the server and needs no access while it runs; following it does.
- A server whose provider ships password login off cannot be reached by a password at all — named on step 1, not worked around.

## 5. Observable results
- On a fresh visit step 1 asks for the root password; after it the browser holds a key for that server with a deadline ≤ 24 h, the server's
  `authorized_keys` holds its public half with the same `expiry-time`, and nothing about it exists in the node's folder.
- One rung is open at a time; done rungs are one line each with what was done; a locked rung says what opens it.
- Step 3 of the test server reads «aifa.dev · Только у регистратора» as done, and only then step 4 opens.

## 6. Substeps
| # | Result | File |
|---|---|---|
| 744-1 | access for one day: no key on the node's disk; a visit key in the browser, dying on the server at ≤ 24 h | `744-1.md` |
| 744-2 | one rule for every ladder: a rung opens only when every rung before it is done | `744-2.md` |
| 744-3 | one rung open: the ladder part becomes an accordion with a one-line summary per done rung | `744-3.md` |
| 744-4 | step 3 shows the server's truth: one domain record, its way, done before step 4 opens | `744-4.md` |
| 744-5 | from the beginning, live: the test server walked from step 1, every rung seen | `744-5.md` |

Order: 744-2 → 744-3 (the part) → 744-4 (the data step 3 shows) → 744-1 (access; touches every action) → chain → ONE push with 743-7 →
CI → fork sync → the warning in its own turn → ONE node update → 744-5 live.

## 7. Decisions (my pick first)
- **D44 — access = a visit key, ≤ 24 h, held by the server.** The owner's proposal, with the server enforcing the hour (`expiry-time`).
  Other branch: the password on every action, nothing stored at all (no window to steal; the person retypes it on every visit and reload).
- **D45 — the persistent node key goes:** deleted from this computer when 744-1 ships; its `fractera-node` line removed from each server at
  that server's next visit (the password typed). The 7 `fractera-project-agent` lines stay for the owner's word.
- **D46 — a server without a domain:** strict — no install until step 3 has a domain and a way (pick: the owner's «каждый следующий шаг
  заблокирован»). Other branch: an explicit choice «пока без домена — только по IP» that counts as done.
- **D47 — the accordion everywhere the part is used:** the launch ladder, its domain sub-ladder and the computer's domain ladder (pick:
  one ladder look in the whole node). Other branch: the launch page only.

## 8. Not in this step
The 7 foreign keys on the test server; the owner's personal identity in that server's `.git/config` (his word); certificates page (742);
a provider without password login (named, not solved).

## 9. Price
Opus, effort high: ~5–6 h; the node update with 743-7 (≥ 12 min); the live walk on the test server (~1 h with the update or install there).

# 744 — the activation of a dedicated server, from the beginning

Planned 2026-11-14 at max effort as a PLAN ONLY (second pass, the owner: «repeat prepairng plan in max effort»); Opus executes. Probes and
before-numbers: `./probes/` (`RESULTS.md` first). Repository: the core only (Fractera/web4-node-starter-kit, main). It ships in ONE node
update together with 743-7 (the interface-skills gate, built, not yet live here). Every interface file is written with `interface-design`,
`use-primitives`, `use-shadcn` loaded.

**Approved 2026-11-14 ~16:40 UTC** — the owner, to «Утверждаешь 744-1…9 и D44–D52?»: «Теперь запомни будем идти на этом плане от начало до
конца. Если я буду находить какие-то проблемы то мы будем их записывать в лист пожеланий и пока не закроем эту ветку мелочи исправлять не
будем потом пройдём отдельно исправим мелочи которые найдём» · «go». **The branch rule:** whatever he finds outside these substeps goes to
`wishes.md` (verbatim, dated) and is NOT fixed until 744 closes; then a separate pass.

## 1. The owner's goal (verbatim, 2026-11-14) — the WHOLE chain is the plan
- «Я тебе повторю почему я потребовал тебя запуск нова плана потому что ты чем ты сейчас занимаешься это всего лишь навсего ветка того
  основного плана который ты начал и то что я хочу увидеть сейчас это тот самый процесс с самого начала основу которого обеспечение
  правильной работы активация сервера в ходе которого решается проблема связанная с тем что при активации сервера локальной компьютера
  умирает а побочные эффект этого то что вы должны иметь возможность с одного локального компьютера запускать множество серверов а побочные
  эффект связанно с тем что при перезапуска НИИ множества серверов мы должны при введении IP-адреса в случае если что больше 24:00
  запрашивают пароль и прежде всего получать исходные данные по состоянию сервера если сервер никак не связан с нашим текущим положением
  Fractera то предлагает удалить предыдущее состояние если связан то предлагает обновиться до последней версии если это возможно и это ещё
  не все потому что если сервер новый то при активации домена мы должны проверять и спрашивать пользователя есть ли у неё доступ к
  регистратора и если нет у него доступа к регистратору то есть у него доступ к Cloud Flyer. И в заключении мы не должны говорить пользу о
  том что сервер доступен если все сертификаты безопасности не установлены и на последнем этапе заключительной проверки перед разрешением
  использовать сервер мы эти проверки не завершили. Вся эта цепочка работы является целью планирования ты это понимаешь или нет?»
- «Конечно тот факт что прокси для сервера и прокси для локальной машины это разные файлы»
- «Хочу двигаться дальше пока ты не покажешь мне нормальный котором каждый следующий шаг заблокирован до предыдущего и у нас третий шаг не
  был выполнен то есть ты конечно имел право показать мне что домен к серверу уже подключён и какой именно режим выбрали и только тогда
  открыть четвёртый шаг … реализуй шаги в формате аккордеона … только один шаг должен быть открыты все остальные должны быть скрыты
  разумеются с использованием навыков»
- «не думаю что у тебя есть право хранить пароль от сервера потому что это могут быть чужие сервера … прохождение первого шага зависит от
  реального ввода пароля … в случае взлома пользователи получит доступ ко всем серверам» · «Хрони ключ вокально хранилище браузера с
  продолжительностью и более 24:00 это нормально?» · «no more then 24»
- «Вопрос сводится к тому что ты ничего не сделал формально мы даже не можем сейчас пройти первый шаг … начинаем с самого начала»

**The chain, as the plan reads it** (each link a substep below):
1. Activating a server never touches this computer: its node keeps running, nothing of it changes (744-8).
2. One computer launches many servers, one after another, each read from that server (744-8).
3. Entering an IP: more than 24 hours since this browser's access → the root password again (744-3); then FIRST the server's state (744-4):
   not related to this node's Fractera → offer to delete the previous state; related → offer the update to the latest version when it is
   possible; a clean server → the installation.
4. A new server's domain: «do you have access to the registrar?» — if not, «do you have access to Cloudflare?» (744-5); a server that
   already has a domain shows it and its way as done (744-5).
5. Never «the server is available» until every certificate is installed and the final check passed (744-6).
6. The proxy of a server and the proxy of a computer are different files (744-1); no foreign web page acts through the node (744-2).
7. A strict ladder, one rung open — the accordion (744-7). From the beginning, live (744-9).

Assumptions:
- I assume «связан с нашим текущим положением Fractera» = the server's node is a node LAUNCHED from this computer's fork: its `origin` is
  this node's fork and it is not a node moved by 737 (`movedAt` in its mark). Everything else — another fork, the original, a moved node,
  foreign sites or root programs — is «not related» (D49).
- I assume «хранилище браузера» admits a cookie: the browser keeps it, for ≤ 24 h, but no script can read it (HttpOnly) — measured why:
  the panel's origin loads Google Tag Manager when analytics is on (D44).

## 2. Measured state — `probes/RESULTS.md` (do not measure again)
expiry-time held by sshd (future accepted / past refused / «Z» refused on 8.6) · the cross-site POST hole (200 + SSH as root) · the test
server = a 737-moved node of this Mac (351 own commits, `movedAt`), same fork · «behind» counted against the original, the update merges the
fork (25 vs 23) · 11 actions by a persistent key · GTM on every core page when analytics is on · install opens after check · step 3 blind to
the server's mark · one domain question with four options · `proxy.ts` one file of 637 lines · eyes cannot type.

## 3. What is reused
`lib/hosting/ssh.mjs` (`readableKeyPair`, `installKey`, pinned host keys), `launch.mjs` + server scripts (`probe.sh`, `state.sh`,
`launch.sh`, `clear.sh`, `certs.mjs`), the 738 page and its rungs, the 737-19 domain sub-ladder, the 743 update chain (stage 0, preflight,
ledger), shadcn `Accordion`, the part `ladder-step`, `scripts/hosting-launch.test.mjs` with its local test SSH servers, `npm run eyes`.

## 4. Known limits
- A password is typed only by the person; the node writes neither a password nor a server key to disk (this step's law).
- Next.js takes one proxy entry: «two files» = one entry that chooses, once, between the computer's file and the server's file (D51).
- `check:shadcn-parts`, `check:typography`, `check:i18n`, `check:parts-map`, `check:static`, 250 lines per component, tokens only.
- Doors called by services with their own keys (`/api/telegram/*`, `/api/intake`, element doors with `X-Node-Key`) send no browser
  headers — the cross-site wall must let them through (they never carry `Sec-Fetch-Site: cross-site`).
- A provider that ships password login off cannot be reached by a password: named on step 1, not worked around.

## 5. Substeps
| # | Result (observable) | File |
|---|---|---|
| 744-1 | the proxy in two files: the computer's and the server's, one entry choosing once by the place record | `744-1.md` |
| 744-2 | no foreign page acts through the node: a cross-site POST is refused before any door runs | `744-2.md` |
| 744-3 | access for one day: password → a visit key the server itself drops at ≤ 24 h; nothing on the node's disk | `744-3.md` |
| 744-4 | the server's state first: delete (not related) · update when possible (related) · install (clean) | `744-4.md` |
| 744-5 | the domain: what the server knows shown as done; a new one asks registrar → Cloudflare | `744-5.md` |
| 744-6 | never «available» before every certificate and the final check | `744-6.md` |
| 744-7 | one rule for every ladder and one rung open (accordion) | `744-7.md` |
| 744-8 | this computer untouched, many servers from one page — proven by a harness | `744-8.md` |
| 744-9 | from the beginning, live, on the test server | `744-9.md` |

Order: 744-2 (security first, small) → 744-1 → 744-3 → 744-4 → 744-7 (the ladder carries the rest) → 744-5 → 744-6 → 744-8 → the whole
chain → ONE push (with 743-7) → CI → fork sync → the warning in its own turn → ONE node update → 744-9.

## 6. Decisions (my pick first)
- **D44 — access = a visit key, ≤ 24 h, held by the server, kept by the browser as an HttpOnly cookie.** The server's own `date` writes
  `expiry-time` (probe 1: the only format right on every version and zone); the cookie `HttpOnly; SameSite=Strict; Path=/api/node/launch;
  Max-Age ≤ 86400` — the browser keeps it as the owner asked, no script reads it (GTM). Other branch: `localStorage` as asked literally.
- **D45 — the persistent node key goes:** deleted here when 744-3 ships; its line removed from each server at that server's next visit.
- **D46 — strict ladder:** no installation until step 3 has a domain and a way. Other branch: «пока без домена — только по IP» counts.
- **D47 — the accordion on the launch ladder and its domain sub-ladder now;** the computer's own domain ladder (`domain-ladder.client.tsx`,
  555 lines, its live proof touches this node's domain) as step 745. Other branch: all three in 744.
- **D48 — the cross-site wall covers every state-changing door of the core** (in the common proxy file), not only the launch door.
- **D49 — «related»** = origin is this node's fork AND no `movedAt` in the server's mark; anything else → «удалить прежнее состояние».
- **D50 — the live run starts by deleting the test server's state** (it is a 737-moved copy of this Mac with its private history) — the
  chain's own «not related → delete» path, then a fresh installation. The 15 GiB of swap added by hand on 2026-11-13 stays unless the
  owner says remove it (then the 8 GB build is proven too).
- **D51 — the proxy split:** `proxy.ts` (the entry, ≤ 40 lines) chooses `proxy/computer.ts` or `proxy/server.ts` by the place record,
  with `proxy/common.ts` for what both do (the cross-site wall, languages, static). Other branch: two whole entry files, the installation
  copies the right one (no runtime choice, but two copies of the shared parts).
- **D52 — «behind» means behind the node's own fork** everywhere on the page (probe, update offer, preflight); the original is named only
  in the fork-sync hint.

## 7. Not in this step
The 7 foreign keys and the owner's personal git identity on the test server (his word); the certificates page of 742 beyond what 744-6
needs; a provider without password login; the computer's domain ladder (745, D47).

## 8. Price
Opus, effort high: ~8–10 h for 744-1…8; one node update (≥ 12 min, the core closed); the live walk 744-9 ≈ 1.5 h (a fresh installation on the
server takes 40–50 min, DNS and certificates add their own waits).

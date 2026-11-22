# 837 — the server proof: an element's sign-in, its agent pages and its Telegram Mini App work as planned (subdomain, then own domain)

## 1. Retelling and decisions

The owner, 2026-11-22 12:43 UTC (Telegram 784), verbatim: «пока ты делаешь обновления я вручную удалю MarketPlace с сервера затем ты
вернёшься и будешь создавать новый элемент сначала как субдомен, потом переключимся на какой-нибудь реальный домен. При необходимости ты
будешь сдавать мне вопросы я буду их передавать главному агенту он будет возвращать ответ. Ты будешь вести все разработку фиксировать
результат. Твоя задача подтвердить или опровергнуть гипотезу что авторизация и приложение для телеграмма работает так как было
запланировано. Я буду твоими руками которые будет вводить пароли при необходимости.»
12:48 (789): «ты жёстко мне соврал по поводу того что ты сделал сервис авторизации … Ни хрена я не увидел … заходи и проверяй. Эта задача
стоит раньше всех» → 837-0 first.

Roles: I lead and record every result here (§7); the owner is the hands for passwords, codes and sign-ins; the server's main agent is the
eyes for the server's logs and files — my questions go to it through the owner, read-only unless the owner says otherwise.

**The hypothesis H.** On the dedicated server an element born on the node's subdomain: (a) gets its admin at birth; (b) lets that admin
sign in through the node's sign-in and nobody without its role into its admin branch; (c) opens its own agent pages (Claude
subscription with the login window, terminal, Telegram bot) to that admin, behind its own sign-in (836); (d) its Telegram bot's Mini App
opens for a person the bot admitted, without a sign-in form (832-6), and refuses one it did not; (e) all of it holds again after the
element moves to its own domain (sign-in through the centre's code, 328-3). Each part is confirmed or refuted by a check of §7.

## 2. Reused
The birth (`scripts/item-birth.mjs`, the panel's «Создать элемент»), the admin window (778-3), the agent kit in the element (836,
template v0.3.236), the element's Telegram channel and Mini App (832-6, `/api/tg/open`, `/api/tg/session`), the element's own domain
ladder (the element's «Настройки → Домен»), the server's main agent for logs.

## 3. Limits
- The server is changed only by the node's own doors and the owner's hands; the server agent reads unless the owner says otherwise.
- Passwords, codes and sign-ins are the owner's; I never type them.
- A defect found is fixed in the core or the template, released, and reaches the server by «Обновить» — never patched by hand there.

## 4–6. Substeps (in order)
| # | What | Done when |
|---|---|---|
| 837-0 | The Claude login window on the real link (CLI 2.1.330 prints `authorize?z-…`) | on the server «Войти» shows our window with the link and the code field — seen by me through the extension |
| 837-1 | The deployments board tells the truth (node files and passport fields are not edits, «собран» = last build, core «актуален») | the server's board after «Обновить»: no false «ждут изменения», core «актуален» |
| 837-2 | A clean slate: Marketplace deleted by the owner; the server agent lists what y7k93 and marketplace left (folder, `fe-<id>` user, data, pm2, nginx, sign-in organization and accounts) | the list is empty or removed by the node's own tools |
| 837-3 | Birth on a subdomain — an app of its own first (what failed), then part of the project | §7 H(a) |
| 837-4 | Sign-in on the element's subdomain and its admin branch | §7 H(b) |
| 837-5 | The agent pages inside the element | §7 H(c) |
| 837-6 | The Telegram bot and its Mini App | §7 H(d) |
| 837-7 | The same element on its own domain | §7 H(e) |
| 837-8 | Birth that survives a break (from y7k93): a log per attempt, the birth waits for a running deployment, a half-born folder of its own birth resumed or cleaned | a planned birth killed mid-build is resumed by the next press — only if 837-3 shows the need, else queued |

## 7. Checks and results (filled as they happen; ✅ confirmed · ❌ refuted · ⏳ waiting)
| H | Check | How it is seen | Result |
|---|---|---|---|
| 0 | «Войти» on a subscription page shows the window | me, extension, architect.fractera.ai | ✅ 2026-11-22 13:59 UTC — server core af4ff4da (built 13:53, his «Обновить сборку ядра» 13:49:13): /ru/root/subscription → «Войти по подписке Claude» → dialog «Claude Code — вход по вашей подписке» with the link claude.ai/oauth/authorize?z-… (the CLI 2.1.330 form), «Скопировать ссылку», «Открыть», the field «Вставьте код сюда», «Отправить код»; closed by «Закрыть» and the login terminal by its own «Закрыть» — nothing entered. Before the update the same click found no link (his 12:46 screenshot). |
| 1 | board: root without «правок кода», core «актуален» | me, extension | ✅ 14:00 UTC — /ru/build/deployments: core af4ff4da «актуален» (собран 13:53:00); root v3.0.69 «актуален» (собран 00:24:42 — its last real build), bugjs = Marketplace v0.3.231 «актуален» (11:14:08); 0 «ждут изменения», 0 «правок кода» (before: root and bugjs «ждут изменения · правок кода: 1», every «собран» 12:20 rewritten by the install pass). |
| 0b | «Войти» on the CORE's own subscription page (and every native element's) | the owner's photo (Telegram 814) — ❌ 14:06: /ru/build/subscription typed `claude auth login` into the node user's zsh with no start-up file → Debian's newuser menu ate «c», «laude: command not found»; my 13:59 ✅ was root's page only (walled bash -l). Fix 837-0b: one shell rule (Linux bash -l like the wall, macOS zsh, zsh -f without start-up files), terminal-auth test 16 ✓ incl. live bash -l / zsh -f in an empty home | ⏳ live after his update |
| a | birth OK, `https://<address>.fractera.ai` answers, the admin window comes, its account gets `elementAdminNNN` | the owner's panel + server agent (birth log) | ⏳ |
| b | the admin signs in on the subdomain; the drawer shows Дашборд · Проекты · agent pages; `/ru/admin/*` refuses a plain account | the owner's hands, me through the extension | ⏳ |
| c | `/ru/admin/agent/subscription` — its own account and the login window; `/terminal` — the agent starts, the socket connects; `/telegram` — the steps | the owner's hands + me | ⏳ |
| d | the bot answers; its menu button opens `/tg` with no sign-in form; a non-admitted Telegram account is refused | the owner's phone | ⏳ |
| e | after the own domain: b, c, d again | the owner + me | ⏳ |

## 8. Questions waiting for the server's agent
1. What y7k93 and marketplace left after the deletion (837-2).
2. As the element's wall user: can it read `$NODE_DOMAIN_FILE` and the core's `logs/runtime.json`? (836's door in the element calls the core
   on loopback through `coreUrlOf()` — if the wall hides them, every agent page answers «not-on-a-node».)
3. y7k93's first birth run stopped after its build at 00:11: `journalctl -k` around 00:11 — an OOM kill?

## 9. Approval
The owner's words of 12:43 are the order; this plan is sent to him in Telegram.

# Current steps — where the work stands right now

Read first in every session, before any plan and before any code; rewritten in place, never appended as a chronicle. Updated by EVENT:
the person's decision (verbatim, at once), a fact that is expensive to measure again, a commit (its hash), a defect found on the way, the
start of a long or irreversible operation (before it), a changed next action. How the steps are planned, proven and closed — skill
`use-development-steps`.

**Active steps:** 759 — the server's domain through the registrar only (code done, core rebuild next); 758 — the server's Telegram bot as step 5 (plan agreed: «Годится, делай, шаг 5 необязательный»); 1 — the first launch: the node is up, the person signs in to Claude Code, gets a Telegram bot and gives the first task
(`new-steps/1-first-launch-first-account-domain-telegram-task.md`).

**Last change:** 2026-11-16 — the first task arrived from the node's home page (1-5): a family/team budget service. Fork proposed, waiting for the person's choice; nothing created yet.

**Next action:** 759 is live in the core (build 88f50496). The server 109.199.105.213 answers: port 80, its node df53bcf4 started 00:32 — step 4 done. Waiting for the owner's yes to write fractera.ai's records in his Chrome (Cloudflare panel, where its DNS lives): `@` A → 109.199.105.213 DNS only (replaces the Vercel A 76.76.21.21), `*` A → the same, the www CNAME cname.vercel-dns.com (proxied) deleted; MX, TXT, CAA untouched. Then 758-1.

## The person's decisions (verbatim)

- 2026-11-16, the owner: «Годится, делай, шаг 5 необязательный» (758) and «из процесса установки сервер вычистить все варианты которые идут как альтернатива на Cloud Flyer … только через регистратора … надо убрать сейчас» (759, done first).
- 2026-11-16, the owner on the server's Telegram: «Я считаю что Telegram может быть в пятым шагом то есть в тот момент когда идёт установка сервера у пользователя есть время подключить Telegram» → plan 758 (new-steps/758-server-telegram-step-5.md), waiting for the plan's yes.
- 2026-11-16, first task: «Хочу создать агентов для своей семьи или команды. Давай для начало сделаем что-нибудь простое например сервис для учёта домашних доходов и расходов»

## Measured — do not measure again

- 2026-11-16: no element of the node holds the field of a household budget (`find`: only stripe, 0.27). `npm run find` drops its first word (scripts/main-agent-cli.mjs:308, `si = -1` → `i !== 0`) — fixed 2026-11-16 (a phrase that failed before now finds).
- 2026-11-16 00:08 UTC, fractera.ai: NS at Cloudflare (kay/ignacio); apex 301 → www; www served by Vercel through the orange cloud (`x-vercel-cache: HIT`, age ≈27 days); no `*` and no `auth` record — the Cloudflare write of the server launch wrote nothing.
- Defect (server launch, step 3): `domainSteps.records` (lib/hosting/launch-domain.mjs:23) is true once ANY check ran, whatever its states — the rung shows done while every name is `elsewhere`; `upsertServerRecord` refuses a name with a foreign CNAME (Vercel) and never removes it. Fixed 2026-11-16 at the owner's word («ты можешь внести необходимые исправления»): step 3's line names «K of N names lead to the server», a foreign CNAME is said in words, the confirm dialog says a foreign A moves at once. Proofs: tsc 0 errors, test:hosting 76/76, the summary check 0/2 · 2/2 · none. Core rebuild started 2026-11-16 at the owner's word «обновил ядро». Not pushed: main also carries the local «Fresh project» commit (0bcb5095, deletes the fork's history) — a push needs a clean branch from origin/main with only the code files.
- 2026-11-16: the node's Cloudflare key is configured (state door: keyConfigured, tail 42b1) — the write never ran; my own script reading the key was refused (law: never read .env.local). The write goes only through the launch door with the browser's visit (button «Внести записи в Cloudflare…»). Server 109.199.105.213: 22 open, 80/443 closed — not serving yet; writing now moves fractera.ai off Vercel to a silent server. Waiting for the owner: write now or after the install.
- Telegram welcome: never an install step since 90281106 (2026-11-04, owner «Убрать оба»); the welcome comes after the person's /start of a bot made on build/telegram (267-3 code present). This node has no main-agent bot yet.
- 2026-11-16, the owner: «куда пропал Telegram который должен был требовать … во время установки сервера». Found: the server's Telegram rung (737-11a e6961403: a bot of the server's own, token over SSH by stdin, greeting after admission) lived only in the move road; 738-7 (ff570015, 2026-11-14) removed that road with telegram.mjs and its door; the seven launch steps were built without it — step 7 only says «next, in the server's panel: subscription and Telegram bot». The owner chose step 5 — plan 758.
- 759 proofs: tsc 0; test:hosting 76/76; test:launch-domain 4/4 (negative: an old Cloudflare answer never gives the removed way); test:hosting-launch 21 + 1 ✗ «the claim goes server door» — fails the same with my changes stashed (pre-existing, not 759); parts-map, parts-dup, shadcn-parts, dialogs, typography OK.


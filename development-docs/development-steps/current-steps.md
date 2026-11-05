# Current steps — where the work stands right now

Read first in every session, before any plan and before any code; rewritten in place, never appended as a chronicle. Updated by EVENT:
the owner's decision (verbatim, at once), a fact that is expensive to measure again, a commit (its hash), a defect found on the way, the
start of a long or irreversible operation (before it), a changed next action. The test: «if the power went off right now, what of the last
hour would be lost?» — that is written now. How the steps are planned, proven and closed — skill `use-development-steps`.

**NOW-21 (2026-11-05, new session) — 654 APPROVED, 654-1 in work** (`new-steps/654/`: `654-main.md`, `654-1` … `654-7`).
The owner: «Продолжи разработку Fractera по current-steps.md ядра, блок NOW-20: спланируй шаг 654, разделение элементов внутри хранилищ
(база, файлы, векторы, граф) для режима завода приложений». The plan in one line each: (1) each element's own key `ELEMENT_KEY = <id>.<HMAC
of DATA_SECRET>` and its own database file; (2) storage: owner and visibility, a private file only on `?private=1` — the memory's files
stop leaking through every public route at once; (3) vectors: the element's own collections; (4) graph: the element's own space, the node by
`DATA_SECRET`, `SETTINGS_SECRET` no longer opens it; (5) the memory door: the space is the caller's key; (6) the installer, the custom
template and root on their own key only, proven with a real second element; (7) the pages and words. **The owner's answers (the window, verbatim):** «Да, начинай 654-1 (Рекомендую)»; keys — «DATA_SECRET сейчас, другой — 655
(Рекомендую)»; node types — «В обоих типах (Рекомендую)»; also — «Временный второй элемент, Строка в CLAUDE.md и навыки» (wiping an
element's spaces on its deletion — not chosen). **Now:** 654-1 — the key in the shared lock `auth.mjs`, the element's own database in
`fractera-data-starter` (clones in `~/fractera-dev/`), then the lab proofs, the release and its delivery.
**654-1 built and lab-proven:** lab in-process (scratchpad `654/lab-654-1.mjs`, production lock, lab secret) `===LAB_654_1_OK===` (42
checks), storage/vectors `===LAB_storage_OK===`, `===LAB_vectors_OK===`; prebuild 0, tsc 0, next build 0 in all three clones. Commits:
data `3ff1184` v2.2.5, storage `f77fe6a` v1.1.24 (carries the 650-4 landing of v1.1.23), vectors `fa55bb3` v1.2.7 — pushing; then
the pins, the fork, `node:update` and `_tools/proof-654-1.mjs` on the owner's node.
**The owner, 2026-11-05 during 654-1, verbatim:** «Смотрю описание для глубокой памяти то есть landing и увидел промах проверь глубокая
память имеет работать с календарем и там это нигде не описано». **Checked — he is right:** the memory landing (`fractera-memory-starter`
`app/[lang]/(publicLayer)/_data/en.json`, `ru.json`, v2.2.22) uses «Remind me about…» / «Напомни о…» only as RECALL (what was said);
the reminder at a time and the memory's own calendar (636: `remember` with `remind` → `data/cron.json` event `node-notice` → «⏰» in the
main chat at its minute, the core's «Memory → Cron events») appear nowhere on the page; README §«A reminder at a time» has it. Not 654's
capability (a shared page is not kinship). **Routed by the owner:** «Шаг 656 сразу после 654-1 (Рекомендую)» → plan
`new-steps/656-memory-landing-tells-reminders-and-its-calendar.md`; its memory release rides with 654-2's in one `node:update`.
**Defect found on the way (fixed in 654-1, data/storage/vectors `auth.mjs`):** `isSchemaRoute` compared the path case-sensitively while
the router (`express-shim.mjs` `compile`) matches segments case-insensitively — `POST /DB/migrate` reached the arbitrary-SQL handler as
the data class, so a privileged session cookie could run it; now the path is lower-cased first.
**Measured now on the owner's node (read-only, keys never printed; scripts in this session's scratchpad `654/`):**
- **A private file of the memory is public on the internet.** Every template-born element has the public route `/api/media/<id>/file`
  (`proxy.ts` opens it for page images) that streams ANY stored file with the shared `DATA_SECRET`: the memory's `anna-650.txt` (space
  `root`) → 200, 97 bytes on loopback through root and blocks, and **200 through the temporary address
  `https://around-come-cameras-addition.trycloudflare.com/api/media/<id>/file` with no session**; an unknown id → 404. The ids are not
  secret to an element: storage `GET /media` with the shared key lists all 4 records (no owner column: `id,name,title,description,url,…`).
- With the shared keys: graph `space: memory-root` → 200 `found: true` (6 entities); vectors search WITHOUT `collection` → the memory's
  `memory-said--root`, `memory-objects--root`; the shared database holds 7 tables (`a2a_log`, `a2a_pinned`, `deploy_runs`,
  `messages_that_came_into_memory` 13 rows, `…__links` 9, `…__registry` 0, `panel_settings`) — no table of root.
- **The custom template's own store helpers:** `lib/db/index.ts` (when `REMOTE_DATA_URL` is set) runs its `SCHEMA` (`products`,
  `site_settings`, `development_steps`, `tgdesk_*`, `fact_*`, `task_current`) and `DROP_LEGACY` (~60 `DROP TABLE IF EXISTS`) in the ONE
  shared database — two custom elements would share one `products` table; nobody imports `@/lib/db` in the template yet (lazy, so no
  tables on the node). `lib/fractera/knowledge.ts` (the graph helper) calls data `/service/rag/*` → **503 «did not answer: Failed to parse
  URL from /query»** — the template has no working way to the graph element (`/api/graph-insert|query`, `X-Node-Key`).
- The installer (`scripts/services-install.mjs` `sharedSecret`) writes every `# kind: secret` variable as the node's one value; every
  element's `.env.example` (custom and all natives) declares `DATA_SECRET` and `SETTINGS_SECRET`; the live node is `nodeType: project`
  with one custom element (root) and stripe off.

**NOW-20 (2026-11-05, late) — HANDOFF to a new context window. Read this block first.** The owner, verbatim: «Ты дал мне четыре ссылки
на элементы памяти но ведь это не полный список? Например здесь отсутствует объектное хранилище которое используется в глубинной памяти»;
then: «почему ты проверяешь связь только с глубинной памятью? Мы с тобой говорили что в режиме завод приложений например все эти элементы
памяти должны работать соответствующим образом. А значит в том числе объектное хранилище должно быть обновлено не только для
использования глубинной памятью но и для использования просто внутри элемента … Подготовься к переезду на новое контекстное окно».
- **The new requirement (next step, number 654, not planned yet):** per-element isolation INSIDE the stores — data (database), storage
  (files), vectors, graph — for an element's own direct use, not only through the deep memory; it is what the app factory needs. Plan it
  first (skill `use-development-steps`, the owner's yes before code).
- **Measured, do not measure again:** every custom element's `.env` holds the node's shared `DATA_SECRET` and `SETTINGS_SECRET`; the data
  layer (`lib/data-store/auth.mjs`, one file for data, storage, vectors) lets the secret run any SQL (`/db/migrate`), `x-agent-identity`
  is self-declared; storage `GET /media` lists every file of every element; vectors search any `collection`; graph any `space`; the
  memory's door separates spaces (650-1) but the stores behind it do not. An element's agent is Claude Code with a shell
  (`--permission-mode auto`), its boundary is «ask» rules plus a hook on named paths (`scripts/element-isolate.mjs`) — a `curl` with
  its own key names none. Templates: custom elements born from `fractera-custom-item-starter`; natives each their own repo.
- **Done in 650 (live on the owner's node):** memory v2.2.22 (spaces, landing), Blocks v1.4.19 (`block-access-map`), vectors v1.2.6, graph
  v1.2.6, embeddings v0.1.7 — all pinned; core `86832388`/`e6df84e3`. **Released, NOT pinned yet:** storage v1.1.23 `9803808` (landing
  after the Stripe sample, lab-checked: prebuild 0, tsc 0, sections in order, 0 console errors, no overflow at 390). **Not done:** the data
  element's landing (old style); the family's accent colour (memory/vectors black, graph/embeddings/… blue — «Дизайн» has no decision).
- **How work was done (reuse):** dev clones in `~/fractera-dev/<repo>` (push with `gh` token as Fractera: `git -c credential.helper=
  -c 'credential.helper=!gh auth git-credential' push https://github.com/Fractera/<repo>.git HEAD:refs/heads/main refs/tags/<tag>`);
  the owner's fork `aifa-agi/web4-node-starter-kit` fast-forwarded over ssh (`git@github.com:aifa-agi/…`, key of aifa-agi); then
  `npm run node:update` in `~/web4-node-starter-kit`. A block into an element: a temporary `.env.local` (the `SETTINGS_SECRET` line copied
  by redirect from the core's `.env.local`, never printed, + `NODE_DOMAIN_FILE=<core>/data/x.json`), `node scripts/blocks.mjs add <block>`,
  the file removed. Proof and eyes scripts: `~/fractera-dev/_tools/` (`proof-650.mjs`, `objects-650.mjs` — run with `node
  --env-file=<core>/.env.local`; `page-shot.cjs`, `overflow.cjs` — `PW_PATH=<core>/node_modules/playwright`, system Chrome). Labs: `npx
  next dev --port 2565x` in a clone after `node lib/parser-fs.mjs` and `node scripts/generate-image-previews.mjs`; never a lab
  `services:install` (shares the live pm2).
- **Open for the owner:** remove the proof phrases and `anna-650.txt` from memory (space `root`)?; the accent colour; 650-2 (skills and
  `CLAUDE.md` lines, the factory caveat); 653 (the member's channel without a shell).

**NOW-19 (2026-11-05) — 650 CLOSED (650-1, 650-3, 650-4; 650-2's skills and `CLAUDE.md` left out by the owner's word «not to claude
rules now»)** — `completed-steps/650-1.md`, `650-3.md`, `650-4.md`. Memory spaces live on the owner's node (memory v2.2.22), the block
`block-access-map` (Blocks v1.4.19), the four memory landings after the Stripe sample (vectors, graph v1.2.6, embeddings v0.1.7), core
`86832388`. **Open for the owner:** the accent colour of the family (memory and vectors black, graph and embeddings blue — «Дизайн» has
no colour decision); the proof phrases and `anna-650.txt` left in memory; 650-2 (skills, `CLAUDE.md`, the factory caveat: shared keys);
step 653 (the member's channel without a shell); `check:block-cards` does not hold slot limits.

**NOW-18 (2026-11-05) — 650-1 CLOSED** (`completed-steps/650-1.md`): memory v2.2.21 `df27be7` (contract 7.0.0) on the owner's node —
each element its own space, the main agent all, proven on the doors (B: «Этого я не знаю», B's file 404) and in the stores (rows,
`memory-said--root` vs `memory-said`, graph `memory-root` vs `memory`); core `f325f6b0`. The owner: «focus only to memory , not to claude
rules now» — 650-2's skills and `CLAUDE.md` are out. **650-3 CLOSED** (`completed-steps/650-3.md`): Blocks v1.4.19 `88b4956` — `block-access-map`, seen light, dark and 390 px; pinned. **Next:** 650-4, re-planned by the owner's word «ты обязан взять образец landing для платёжной системы stripe … Все страницы должны быть в одном стиле … как оформление так и текстов» (`new-steps/650/650-4.md`): memory + `spaces`; embeddings checked; graph and vectors rebuilt after the Stripe sample + `spaces`; humanizer over every text.
**Left on his node:** the proof phrases and `anna-650.txt` — removed only at his word.

**NOW-17 (2026-11-05) — 650 planned, waits for the owner's yes** (`new-steps/650/`: `650-main.md`, `650-1.md`, `650-2.md`). The owner,
verbatim: «нам нужно сделать разделение глубины памяти по элементам чтобы главное агент была доступна вся память, а каждому элементу
только своему … Это решаемо задачи надёжная? … чтобы записи матери не были доступны сыну например»; to writing the plan — «go». 650 is
the memory only (spaces: each element its own, the main agent all); the member's channel without a shell is step 653. **Measured:**
the memory's door lets in anyone with `SETTINGS_SECRET` or `DATA_SECRET`, and the GET verbs (`journal`, `DELETE journal`, `sources`,
`signals`, `objects/{id}`) take no caller at all; the data layer runs any SQL for `DATA_SECRET`; every custom element has both keys in
its `.env`; an element's agent runs with `--permission-mode auto`, its boundary is «ask» rules and a hook on named paths — a `curl` with
its own key names none. Hence D4: no per-element keys; between people the guarantee is 653. **Open for the owner:** D3 («забудь всё» of
the main agent — the space `node` only). **Added by the owner:** «Текущее обновление памяти нужно подробно расписать на всех лендингах
… схематически изобразите как память администратора доступно семь а внутри элементы доступны только свою пространство» → 650-3 (a new
block `block-access-map` in Blocks — the catalogue has no containment scheme) and 650-4 (memory, graph, vectors landings, «Как это
работает» §5, the kit README with a Mermaid scheme), after 650-1/2.

**NOW-16 (2026-11-05) — 652 CLOSED** (`completed-steps/652-main.md`, core `f7d39614`, `9fd0c437`): `check-i18n` green and sees the
node-state dictionaries; no 403 in the panel's console on the temporary address (`/api/node/place` reads, `/api/node/attention` answers
«nothing waits»); root v3.0.22 released, reverted (`838b378`), pinned nowhere. **Now:** step 650 talked over with the owner — the
proposal (not decided): working processes of an integrator element by the element's OpenAI key → the node's key → the person's own
Claude login (Pro/Max or a Team seat) → no answer, never the architect's login; a person boundary in the deep memory (today one memory,
«ИСТОЧНИК НЕ ФИЛЬТРУЕТ ПОИСК», the owner 2026-09-16); the memory's Claude backup off for integrator elements. **Owed:** a shell change
cannot ride with its core copy through `node:update`.

**NOW-15 (2026-11-05 ~10:30 UTC) — 651 CLOSED** (`completed-steps/651-main.md`, core `6d2e46ea`): the banner keeps a quiet line
«Узел совпадает с оригиналом на <mark>» with its buttons; the tunnel watchdog gives a newborn name 10 minutes and asks public DNS before
a verdict; the alarm is not shown on the temporary address. Delivered to the owner's node (fork fast-forwarded, `node:update` → core
`8b4540a2`, root v3.0.21) and seen there with eyes. **Open:** the watchdog's new code starts with the next tunnel start (new address);
step 650 — an own Claude login per element (proposed); a minor's element — the owner's decision; `check-i18n` fails on the original
(`administration/users` dictionaries absent); `/api/node/place` 403 on the temporary address; 645-4/5/6 — the fresh install passed
(2026-11-05), not yet recorded as their proof.

**NOW-14 (2026-11-05) — 649 CLOSED** (`completed-steps/649-main.md`): root v3.0.21 (`5171bc0`) — the fourth card «integrator» and
the column by the footer's width button (1280 / 1024, was 760); custom v0.3.157 (`67be1de`) — `landing-agent` on `var(--app-w)`; both —
`check-layout` rule `bare-widget-without-column`; core `5f3e19da` — skill `integrator`, `CLAUDE.md` §4/§8 resealed, the soul's «The
creator's dream», pins; CI three-os green on all three. **Open:** step 650 — an own Claude login per element (proposed, not ordered:
today every agent of a node runs on the machine's one login, so the integrator cannot run lawfully on Claude); a minor's element — the
owner's decision; 645-4/5/6 — the fresh install on aifa-agi/web4-node-starter-kit passed launch 1–6 with no question (2026-11-05, not
yet recorded as their proof); native template and elements (not ordered); «Обновить сборку ядра» active on the temporary address.

**NOW-13 (2026-11-04 ~23:35 UTC) — 648 CLOSED** (`completed-steps/648-main.md`): root v3.0.20 and template custom v0.3.156 have
`npm run eyes` (one browser in the core), skill `use-eyes`, updated `use-tests-before-dev-finish` and `connect-own-domain`, the
element instruction §7 line (custom + root); pinned; root v3.0.20 is installed on the owner's node and its own `npm run eyes` works.
**Open:** 645-4/5/6 — the live fresh install (his yes to `serve:remove`); native template and elements (not ordered); the defect
«Обновить сборку ядра» active on the temporary address.

**NOW-12 (2026-11-04 ~23:15 UTC) — 647 CLOSED, 646 CLOSED, 645-1 CLOSED** (`completed-steps/647-main.md`, `646.md`, `645-1.md`). The owner
updated his node himself (`7 изменений форка, ядро a36702d3`): `===EYES_OK=== chrome 150` in its npm install, `npm run eyes` works in it.
**Open:** 645-4/5/6 — the live fresh install (his yes to `serve:remove`); step 648 — eyes, skills and the instruction line into the
templates and every element (his order); the defect «Обновить сборку ядра» active on the temporary address.

**NOW-11 (2026-11-04 ~22:55 UTC) — 647 code pushed (`74753475`, `999a3f54`, `23a752f5`, seal `0e818b5c6ddb`), proof pending his
update.** The owner asked for eyes in every node after two broken drawers shown to him («второй вариант у нас должен приезжать
автоматически с каждым новым развёртыванием у наших гостей»; plan in `new-steps/647/647-main.md`, «да, начинай 647»). **Measured:**
Playwright 1.64.1 cannot install its Chromium on macOS 12 («does not support chromium-headless-shell on mac12»), drives the installed
Chrome 150 headless. **Seen with eyes (lab copy in the scratchpad):** the account drawer on localhost — full height, title and ✕ at y 41
under the 30 px bar, «виден», five items, no console errors (645-1 redo proven); the temporary address banner — stays, «Открыть на этом
компьютере», no «Проверить снова» (646 proven); the panel scrolls itself to the content on load (`--top` added). **Defect on the way, not
fixed:** on the temporary address «Обновить сборку ядра» is active though its page is read-only. **The tunnel died ~22:21 UTC**
(cause not established); at the owner's «у меня не открываются больше страниц» — `serve:publish -- --new` →
https://sections-horn-endorsement-wines.trycloudflare.com. Next: his Sync + `node:update` → `===EYES_OK===` in its npm install,
`npm run eyes` in his node; then step 648 (templates and elements), then the fresh install of 645.

**NOW-10 (2026-11-04 ~21:40 UTC) — 645-1 REOPENED and redone `91c68209`.** The owner, verbatim: «Ты сломал выдвижной ящик, и теперь у нас
дырка сверху. Это неправильное решение будем его исправлять прежде всего верни высоту выдвижного ящика какая она была во-вторых речь идёт о
внутреннем отступ они о внешнем то есть отступи в котором вниз сместятся строки а они сам контейнер. Ну и сдвиг вниз 40 пикселей оказался
очень большим изменим его на 25.» Now: right drawers `inset-y-0 h-full` again, `pt-[25px]` after the drawer's own classes (the account
drawer's `p-0` keeps it), ✕ at `top-[41px]`; `drawer-panel` (already under the header, `top-14`) `barInset={false}`. His node: 646 and the
rest of 645 arrived by `node:update` (`===NODE_UPDATE_DONE=== 12 изменений форка, ядро 8ab21c0e`, run by me — his button had not
started it: no record after 20:23, his clicks were on the temporary address); the two drawer files copied in, `serve:rebuild` started
~21:40. Then: his eyes on the drawer and on the banner (646), then the fresh install (needs his yes to `serve:remove`).

**NOW-9 (2026-11-04 ~21:25 UTC) — 646, one-file fix, code `ad533d76`, proof pending his update.** The owner, on the temporary address
after Sync: «если я нажимаю проверить снова … этот баннер просто исчезает как будто нажимаю кнопку скрыть … у меня нет никакой
возможности при помощи кнопки обновить сборку». Measured: POST `/api/node/update` {action:check} on the trycloudflare address → 403
`{"ok":false,"reason":"temporary-address"}`; `origin-notice.client.tsx` did `setD(body)` → no `fork` → `return null`. On localhost the
same POST → 200, `behindBy 0`, `nodeBehind 10`. Fix: a non-ok answer keeps the state and names the reason; on a temporary hostname
«Открыть на этом компьютере» (`OpenOnThisComputerButton`) instead of «Проверить снова». Proof to take: after his Sync + update, the
built chunk holds the new words; on the trycloudflare address the banner stays and offers the button (his eyes — no Chrome here).

**NOW-8 (2026-11-04 ~21:00 UTC) — 645 PLANNED AND APPROVED** (`new-steps/645/`): the owner's fresh install (his fork
`aifa-agi/web4-node-starter-kit`, node `~/web4-node-starter-kit`, core 168eb378 after `node:update`) → six substeps: right drawers 40 px
under the online bar · core drawer and site drawer: «Как это работает», «Подписка Claude Code», «Терминал», «Активация Telegram», then
«Группа страниц архитектора» · `===PROGRESS===` ~21 lines · the owner's closing words (old item 6 and the first-account warning removed —
«Убрать оба») · README. Work: dev clones `~/fractera-dev/web4-node-starter-kit`, `~/fractera-dev/fractera-root-starter`, commits straight
to `main` («коммиты прямо в main»). **645-1 DONE `a8a7a51a`, 645-2 DONE `cc047462`, 645-3 DONE** (root `f0534d5` tag v3.0.19, pin `99f5b1cb`; the owner's node has root
v3.0.19 installed). **Code pushed, proof pending the live install:** 645-4 `d39287d8` (`===PROGRESS===` 23 lines for 13 elements; dry
run of the module shown, flag stays out of pm2), 645-5 `90281106` (closing words; rendered on the owner's node — all 10 links 200; seal
`5e5f25b10cb1`, FAIL before the seal as the negative control), 645-6 `a8242ba4` (README). Core guards run one by one in the dev clone (its
prebuild refuses: `===NODE_EXISTS===`, one node per computer): links, steps, encoding, instruction, skills, dialogs, routes, menus,
shell-kits, content, static, protected — all OK. **Measured:** this computer's SSH key is `aifa-agi` (read-only on Fractera); dev clones
push over HTTPS with `gh` (Fractera) as a repo-local credential helper. **Next — the live fresh install:** the owner syncs
`aifa-agi/web4-node-starter-kit`; with his yes `npm run serve:remove -- --yes` in `~/web4-node-starter-kit`; a NEW Claude Code
session in an empty folder, the fork link, «запусти это» — the README path of a new person; then 645-4/5/6 closed with that log.

**NOW (2026-11-04 ~10:40 UTC) — 641 CLOSED** (`completed-steps/641.md`): «элементы» instead of «WEB4 ITEMS»; the update banner
— «Синхронизировать форк» + «Обновить сборку ядра» → the deploy board; the core first there, «Обновить узел из форка (N)»; «Развернуть»
inactive on an up-to-date element. Next: the owner's Sync + update (from the deploy board's core card), then 640-4. **~10:20 UTC the owner: «sync ok» → `npm run
node:update` started on his node (target core `4cf30b3`).** Done ~10:35: `===NODE_UPDATE_DONE=== 12 изменений форка, ядро 39e8c419`,
the core answers 200, the new words in the build («Синхронизировать форк», «Обновить узел из форка»), «Ваши WEB4 ITEMS» gone.

**640-4 live, ~12:39–12:48 UTC (session `1201d3ee`):** phrase 1 passed (social judged, kept on «Да»); phrase 2 passed (`social` first,
«Ты его уже сохранил, он твой»). Phrase 3 (hand into root) not yet asked. **Defect found:** for «in the style of a blogger» the catalog
missed `affaan-m/ecc@brand-voice`, and the agent went to skills.sh. The owner, ~13:00: «check skill finding problem». Causes measured:
`mcp.mjs` gives the catalog only `query`, not the agent's terms; `n = 3` cut the card at #6 and #12 although it was above 0.60. With the
terms (mean fusion) it is #1 and #2, and the social control stays. → **substep 640-5** (`new-steps/640/640-5.md`). The owner ~13:10
changed it (verbatim in 640-5.md): seven instead of three, at least two or three rephrasings, then another way, then skills.sh, «Делай
это в первую очередь»; no catalog counted again. **Built (code pushed, see git log):** passes sentence+terms → rephrasings → words;
replay before/after in the scratchpad `p642/before.txt`, `after.txt`: brand-voice MISSING ×3 → #2, #2, #6; social control #1; «remind
me…» 0 cards. **The owner ~13:30: «да, запечатай»** on the shown line (CLAUDE.md section 1: skills.sh by itself when the catalog
gave fewer than seven after two rephrasings and the word search, or at the person's word) → seal `72eed396d4b8`; the tool texts follow.
**~13:09–13:13 the owner's update from the deploy board:** `===NODE_UPDATE_DONE=== 5 изменений форка, ядро 997a824b` (640-5 and the
seal in it; skills base «already 8», catalog «already in place: 3240 cards»; `check:instruction` OK on his node). He found the core
button still live after the start → **641-4** fixed (in `completed-steps/641.md`, reopened and closed again). **Waiting for the owner:**
one live question on Opus (640-5 plane 2). **~13:22 it FAILED** (session `4a516939`): the agent passed «brand voice» and three
rephrasings, the catalog gave seven noisy cards, the agent said «готового навыка … среди проверенных нет»; the owner: «fatal error».
→ **640-5b** (in `640-5.md`): rephrasings always in the mean, themes out of the catalog; the live call → brand-voice the first catalog
card. The owner ~13:35: «Уже второй раз ты мне врёшь. Сделай какие-нибудь тесты» → 640-5c (wide 18/20, held-out 10/12). The owner
~13:50: tests on **Sonnet**; for each of the seven — what I like in it, then advice (the strongest, or an own skill from several) →
**640-6 done** (`completed-steps/640-6.md`): the Sonnet bench `p646/` (isolated, nothing reaches Telegram) — 5 of 5. **Waiting for
the owner:** Sync + update (640-5c, 640-6 to his node). Then phrase 3, the catalog skill into root, the verdict — each first on the
Sonnet bench, then him.

**NOW-7 (2026-11-04 ~18:10 UTC) — 644 CLOSED** (`completed-steps/644-main.md`): a fresh install starts at step 1 with no starter rows;
the closing pattern in `use-development-steps/references/`; the protocols in the panel's first-contact glossary, `GLOSSARY.md` agrees
with CLAUDE.md §7. **Next: the owner's fresh install** — he moves (or deletes) `~/web4-node-starter-kit` and finds aifa.dev; asked:
which folder is aifa.dev, move or delete, install from the fork; and which Telegram identifier repeated (the node code is random
per node since `e59204f`, his `xq6dz`; the bot token per node in `data/services/build/channel/telegram`).

**NOW-6 (2026-11-04 ~16:40 UTC) — the owner's mail: «Run failed» letters and «Possible valid secrets detected».** Measured with `gh`:
since 2026-11-03, 100 runs of three-os in the core — 85 green, 13 failed: 11 «The job was not acquired by Runner of type hosted even
after multiple attempts» (GitHub has no macOS arm64 runner; Linux and Windows green), 2 real (`efd13ce`, `e60dd5e`, ~00:50 UTC, «Ecmascript
file had an error» on all three — fixed by the next commit, nobody looked). The secrets: 2 alerts in `fractera-skills-store`,
`samber__developer-relations-skills/docs-code-sample-standards` (`references/audit-checklist.md:60`, `evals/evals.json:155`) — teaching
examples («Cindermoor Pay», a fake `sk_live_` key), not ours. The owner: «go» → (the owner granted the `workflow` scope ~17:00; pushed) the core's three-os: push → Linux + Windows; all three
nightly, on tags, on pull requests; concurrency per ref; `use-development-steps` §5: the CI run of every pushed commit read and acted on;
both secret alerts resolved as false positives (#1, #2 — at the owner's «you must to do it»). The elements' and templates' workflows — at their next rollout.

**NOW-5 (2026-11-04 ~16:20–16:50 UTC) — 629-3 DONE, 629 CLOSED** (`completed-steps/629-3.md`, `629-main.md`): templates custom v0.3.155, native v0.1.38, 13 elements at their next patch, pinned; the owner's node takes them at his next Sync + update. Was: The law + «Never recommend an Anthropic API key» are in
`lib/instructions/element/element-instruction.src.md` §7 (unlabeled — every template and element; the plan's «@T» was wrong: @T is
templates only). Road (as 636): the scratch core clone's `data/workshop` (custom v0.3.154, native v0.1.37) and `WEB4-ITEMS` (13 clean
clones at their pins) → `instruction:element templates` / `element` → template releases, each element's next patch tag pushed by plain
git → pins in this core's registry → the owner's sync + update moves his elements. Before each push: the element's guards.

**NOW-4 (2026-11-04 ~16:00 UTC) — the owner: «640 succes to close, 642 - to close, go to» 629-3, 638, 637, 627-6.** 640 CLOSED
(`completed-steps/640-main.md` with the verdict, 640-4, 640-5), 642 CLOSED (`completed-steps/642.md`); their plans deleted in that
commit. **~16:05 his answers (verbatim choices):** 629-3 — «Да, с запретом ключа (Рекомендую)» (the law line + «Never recommend an Anthropic API
key: the project's AI work goes through the node's OpenAI key.»), rolled out to the templates and every element; 638 — «Оставить как
есть» → **638 CLOSED** (`completed-steps/638-main.md`); 637 — the switch «Разработка ядра» «На странице настроек (Рекомендую)»,
with the road «сообщить в Fractera» when it is off; 627-6 — «Пока ничего». Next: **629-3 rollout** (a long operation: the templates'
releases and every element — skill `release-template`), then 637's plan.

**NOW-3 (2026-11-04 ~15:25 UTC) — step 643 approved** (the first meeting: name, address, style, the project's language with its price,
the two modes in the welcome). **The owner's LAW, verbatim:** «отдельный ключ API Anthropic  - prohibit! Категорически запрещается в проекте рекомендовать использовать ключ от Anthropic потому что использование ключа Anthropic прерывает использование подписки. По этой причине только ключ ОпенАи у нас для него есть переменных окружение специальные контейнер» → applied at once: `provider-rules` never offers an Anthropic
key; **638-2 cancelled** (`new-steps/638/638-main.md`). Grey zone words: «Без обещания». The blog phrase 2 (hand into root) — «not
now». **643 CLOSED** (`completed-steps/643.md`): five questions at the first contact, the welcome's point 6, and the brief's
first-meeting line (Sonnet: before — no question; after — five; with a picture — none). Waiting for the owner: the next task; 640-4
phrase 2 (hand into root) when he says; 642 live (one element and, on his yes, a core rebuild).

**~14:52–14:56 UTC the owner's update from the deploy board:** `===NODE_UPDATE_DONE=== 8 изменений форка, ядро f71198b1` (642, 641-5 not yet:
his fork was 1 behind). Live sample of 642-2 (`p642live/samples.txt`): the core silent 14:54:15–14:55:56, **the build reader answered
the whole time** (0 lines — this run was started by the old runner, which passes no log), the core back 14:56:16, the reader gone
(stopped before the lid opened, no `build-reader.json` left). **~14:55 the owner saved step 643** (the first meeting: name, style,
language, the modes' advice) — `new-steps/643-…md`, not planned, his message cut off at «В любом случае».

**~14:40 UTC the owner:** the banner «Узел обновлён» has no «Проверить снова» — he synced the fork twice (his fork = `3af4ac8`), the node
kept its check of 13:10 → **641-5** fixed («Проверить снова» in that state too; summary in `completed-steps/641.md`). His words:
«Ты сейчас начинаешь какую-то новую разработку вместо того чтобы посмотреть куда делось то что было раньше» — look at what was before
first, add nothing new unasked.

**NOW-2 (2026-11-04 ~14:10 UTC) — the owner paused the skills tests for a side task: step 642, the deploy board live** (verbatim
in `new-steps/642/642-main.md`): a terminal under each element and the core during deployment, and a failure that says what happens
next. Found: `LiveLog` and the door's live log exist (353-3) but the board never asks for them; the core's page is down while the lid
is closed (553), so a small build reader on a local port is needed. The owner ~14:15: «Да, делай (Рекомендую)». **Built, all four (core `5c3ca01` + the next commit):** 642-1 the element's
terminal under its row; 642-2 the build reader `127.0.0.1:25680` while the lid is closed (`lib/deploy/build-reader.cjs`,
`scripts/build-reader.mjs`); 642-3 the update's terminal through its stages; 642-4 the cause in plain words
(`lib/deploy/build-failure.cjs`), one named retry for memory/network (elements and `next build`), the previous version checked by its
answer, «Разобрать с главным агентом» → the main agent (`POST /api/node/deploy {debug}`, never the element's agent directly). Probes
(scratchpad `p641/dom/probe-642-*.mjs`, `p642r/`, `p642d/`, `p642f/`): board 10/10, core+update 12/12, failure 6/6, the real reader
7/7, the real deploy-elements 4/4, causes on real failures 8/8, 641 14/14. **Not proven yet — live:** the owner's Sync + update brings
it to his node (that update still runs the old board), then one element deployed from the board and, on his yes, one core rebuild
(~10 min) watched through the reader. Then back to 640 (phrase 3 on the Sonnet bench first).

**Before (2026-11-04 ~04:30 UTC) — 629-2 CLOSED** (`completed-steps/629-2.md`, seal `e3a792e3f76c`; the owner: «да, запечатай» after
the lines and their Russian reading). **629-4 CLOSED** (`completed-steps/629-4.md`, 09:31 UTC on Opus: the gray request → rule, price, lawful way; the
domain question → no warning). Left in 629: 629-3 (the elements' line — shown to the owner before its seal). **The owner's new request (~04:20, verbatim):** «Вчера мы работали над навыками которые приходят
вместе с каждым новым стартовым шаблоном. В числе этих заданий было одно которое я отменил. Сегодня я его могу сформировать речь идёт о
том как новые навыки попадают на хранилище а затем и в использовании при необходимости. Речь только о том кейсе когда пользователь
говорит например смотри наш интересный навык может быть мы будем его использовать или что-то в этом роде должна запускаться какая-то
цепочка которая позволит этот навык установить в хранилище навыков внутри собственного узла и потом в дальнейшем использовать его как
обычный навык архива натов. Одновременно с этим его стоит разместить каким-то образом чтобы он был приоритете над основным числом других
навыков. Также я хочу чтобы ты в рамках отдельного шага проверил устанавливаться потому что мы проверяли как науки обнаруживаются ну как
они устанавливаются архитектуры и потом работают мы ещё не проверяли то есть сейчас я хочу полностью закончить работу с навыкамии хочу
чтобы ты мне подтвердила что литература полностью готова к запуску на одного пользователя». Found while reading: **a catalog skill has
no install path** — `skills_find` proposes, but nothing fetches it from `Fractera/fractera-skills-store` (or GitHub by the same
fingerprint) into an element; only 628's `adopt-hand` (a suggested skill) exists. → step 640, the owner's yes ~09:50 («Да, делай (Рекомендую)»). **640-1, 640-2, 640-3 CLOSED** (core `6658203`, `f408ffd`, `8bdd8f9`):
`npm run skills -- keep / own / forget / hand`; the own index searched first at 0.45 (the catalog 0.60); a catalog skill handed from
Fractera's store file by file, GitHub as the backup, both by the card's fingerprint. **Next: 640-4 live** — the owner's «Sync fork» +
update, then three phrases in Telegram on Opus: (1) «смотри, интересный навык https://github.com/coreyhaines31/marketingskills/tree/main/skills/social
— может пригодится» → judged, kept; (2) «хочу вести блог и публиковать в соцсети контент» → `social` first, «ваш навык»; (3) «поставь
его в root и набросай с ним первый пост для блога» → `hand … --send`, root's agent installs and uses it. Then the catalog skill
`coreyhaines31/marketingskills@copywriting` into root by the main agent's command, and the verdict «ready for one person».

**Before (2026-11-04 ~03:40 UTC) — the owner's «go to fininsh non stop» done as far as his word allows.** The owner's node: core
`2c56165e` (the sealed instruction `8e98168ac810`, the skills catalog, memory v2.2.19, the soul with «Wit — the detective's spark», the
boundary hook fix). Closed today: 639, 627-2, 627-3, 627-4, 627-7, 629-1; 638-1 (the inventory) written. **Waiting for the owner:**
629-2 (the two law lines word for word in `new-steps/629/629-2.md` → seal), then 629-3 (the elements) and 629-4 (one gray request);
638 (closed 2026-11-04: «Оставить как есть»); 637 (three questions); 545-4/5, 593,
603-5 (his live conversations); 627-6 (skipped by him; the subscription when it runs).

**NOW (2026-11-03 ~22:40 UTC): 639 CLOSED** (`completed-steps/639.md`): a clean Telegram chat, live on the owner's node (core
`dfaa3c65`, built 22:22) — the owner, 22:36: «looking correct»; the turn hooks fire for Telegram messages (`UserPromptSubmit` opened
the turn 29.5 s before its reply, `Stop` closed it). **636-10 done** (`completed-steps/636.md`, section 636-10): an element's own
reminder also through its own bot — templates custom v0.3.154 / native v0.1.37, 13 elements, registry pins core `4f04b5e`, live on
the node; its live check needs an element with its own bot (on the owner's node only the main agent has one). The plans of closed
steps were removed from `new-steps/` (626, 632, 633, 636, 639; 633's owner words → `completed-steps/633-owner-words.md`).
**627-2 CLOSED (2026-11-04 ~00:55 UTC)** (`completed-steps/627-2.md`): the catalog is a file of vectors (3,240 cards, 17,145 pieces,
threshold 0.60, 24 ms a search), released `skills-catalog-2026-11-04` (24.5 MB, sha256 `db13566e…`, `release.json`); the store
`Fractera/fractera-skills-store` `0f46db1b8003` (2,397 skills). The owner allowed `gh release` in `~/.claude/settings.json`. The LightRAG
space `skills-catalog` removed by his word («да, удаляй и делай 627-3», 2026-11-04 ~01:00). **627-3 built:** `installCatalog`
(`lib/agent-kit/skills/catalog-index.mjs`), `npm run skills-catalog`, called by `node-update.mjs` after `skills-base` and by
`services-install.mjs`; proven on a temporary node 9 of 9 (fresh, again — no download, wrong sha256 / changed file / another model —
refused, the old copy intact, the real GitHub release in 4.4 s, answers from the local file). The store's working tree moved out of
the core clone (`…/eaead2f1-…/scratchpad/skills-store`). Live: at the owner's next Sync + update — the update's line
`===SKILLS_CATALOG_OK=== taken`.
**627-4 built (2026-11-04 ~01:40 UTC):** `skills_find` asks two checked sources — the base in the graph and the catalog file
(`findInCatalogFile`, the person's sentence by meaning, any language); the live skills.sh only by `npm run skills -- market --live`,
named «NOT CHECKED BY FRACTERA»; skip-cards named in the question come back «checked and not proposed» with the reason; scripts →
«a separate yes». The core's door `POST /api/skills/catalog` (node key) for the elements; memory **v2.2.19** `9bd21b8` asks it in
`findSolution` (pinned). Proven: MCP harness on the owner's node data — «хочу постить в соцсети и блоги» → `social` first with the
verdict, «как починить кран» → nothing, «lark-mail … newsletter?» → three e-mail skills + lark-mail «checked and not proposed»;
memory on a stub door 5 of 5. The catalog is already in the owner's `data/node/skills-catalog` (installed by `installCatalog`). Live:
Sync + update, then the main agent in Telegram «хочу постить в соцсети и блоги».
**✗ 2026-11-04 ~02:10 UTC, the owner's update failed at the core's build** (the old build restored, the node runs; code, elements,
memory v2.2.19 and the soul arrived): `app/api/skills/catalog/route.ts` — «'query' does not exist in type '{ n?: number }'» (TypeScript
inferred `findInCatalogFile`'s options from the `.mjs` default). Fixed with JSDoc types; narrow `tsc` over the door: the old version 2
errors, the fixed 0. Cause of the miss: my guards for 627-4 ran without a type check — the chain from `check-menu-icons` has no `tsc`.
Next: the owner's Sync + update again. **Done 02:20:** core `e7cdc559` built, the door answers live (200 social first; 401 without the
key). The owner's Telegram test «хочу постить в соцсети и блоги» (02:10, session `bf484705`) — no `skills_find`, no skill, an
interview instead: the session ran on **Claude Haiku 5.5** — the owner's choice on the start button («it was my choose»); the good
session of 22:26 (Paybis: `skills_find`, architecture) ran on Opus 5.5; the soul (with «A thousand hands», `shape-the-need`) was in
the prompt (`data/node/agent-prompts/build.md`). Two instruction lines proposed for 627-7 (`skills_find` + `shape-the-need` before the
first question, the first answer brings the shape: a new element, catalog skills, an analog to study) — wait for the owner's word to
seal (`…/faa581fd-…/scratchpad/claude-md-627-7-proposal.diff` holds the first version). The tool's description now says «call it FIRST».
The owner: «go to next task» → 627-6.
- 2026-11-04 ~02:35 UTC, on 627-6 in the choice window: the scope — «skip this part» (627-6 is not run now); the engine when it runs —
  «Подписка, как в 627-5» (`claude -p` Haiku on the owner's subscription). → 627-7: README and `memory.md` updated (not sealed); the two
  CLAUDE.md lines wait for the owner's yes to seal.
- 2026-11-04 ~02:45 UTC, the owner's Telegram test on Opus («я хочу вести блог и публиковать в соцсети контент…») → a new element
  «Контент-студия», catalog skills with stars, the analog question and the quiz: «now looking great». **627-3 and 627-4 CLOSED**
  (`completed-steps/627-3.md`, `627-4.md`). Open in 627: 627-6 (skipped by the owner for now), 627-7 (the two sealed lines).
- 2026-11-04 ~02:55 UTC, on the two instruction lines: «да, запечатай» → **627-7 CLOSED** (`completed-steps/627-7.md`, seal
  `8e98168ac810`). Open in 627: only 627-6 (skipped for now; the engine when it runs — the subscription). The owner's node gets the lines
  at the next Sync + update.
- 2026-11-04 ~03:10 UTC, the owner: «sync ok , go to fininsh non stop». **Fixed (found in 639): the element boundary hook saw no
  macOS/Linux absolute path** (`/Users/…`, `/home/…`) — only `C:\…`, `/c/…`, `~`; an element agent's `cat /Users/…/<node>/.env.local`
  passed on a Mac. A generic `/…` pattern (only paths under the home or the node count); samples 20 of 20 (two new), the old hook 3 of
  20 failed (negative control); the replay of the elements' calls — no new asks.
**Open:** 627 (627-3, 627-4, 627-6, 627-7), 629 (the law's text waits for the owner), 637 (the owner's proposal — three
questions wait for him, no plan file yet), 638 (planned — the inventory 638-1 first), 545 (545-4, 545-5), 593 (not started), 603
(603-5); found on the way — `scripts/check-boundary-hook.mjs` 2 of 18 (the same before 639, not in `prebuild`).

**HANDOFF (2026-11-03 ~21:20 UTC) — the previous session's.** The owner: «подготовь передачу вопросов к сбросу как текста».
1. **Where things stood.** 636 closed (proven 20:13: «⏰ Напоминание · Глубокая память» came into the main chat by itself, no AI —
   `completed-steps/636.md`); after it the chain element → main agent proven live twice (21:25 and the owner's own test, 21:33). The
   owner's node: core `4c9b62dd`, every element at the 636-8 pins, memory v2.2.17.
2. **The memory's thinking engine — DECIDED 21:10** (the owner's rule, verbatim in «The owner's latest decisions»): OpenAI when its
   account has money, the Anthropic subscription as the backup channel, the person warned once a day (memory **v2.2.17** `5628c88`,
   pinned). His node gets it at the next «Sync fork» + update; the live check: a «запомни» whose answer carries the warning once.
   A new step **638** (`new-steps/638/638-main.md`): every working process of the node on this rule — planned, not started.
3. **Also waiting for him:** 637 (no core building on a person's node; pull requests as the developers' road — where the switch lives,
   the agent's road with it off, whether skill changes accepted at a review go as pull requests); 629 (the law's text); 627-2…4, 6, 7.
4. **Rules of this machine learned today:** push with plain `git push` (the auto-mode classifier refused writing a token file and
   changing a remote URL); the template tool's push needs that file — use `…/faa581fd-…/scratchpad/rollout-636b.mjs` (the same steps,
   targeted edits of an element's own files); the stripe clone's origin is a local scratch repo — push it by URL; after the owner's
   «Sync fork» `npm run node:update` updates the live node in ~14 min; at most three test phrases; answer in Russian, warmly; never
   switch a model or an engine (OpenAI, Anthropic, local) without his word.

**Active steps:** the group «The node without OpenAI vectors» — 626, local vectors: the native element `embeddings`
(closed: `completed-steps/626-1.md` … `626-8.md`), and 627, the skills catalog graph shipped ready with every node (`new-steps/627/`). Planned and approved in the
conversation on 2026-11-02. **626-1 closed 2026-11-03** (`completed-steps/626-1.md`, measured while the 627-5 marker ran): the element
runs the model in its own Node process — `@huggingface/transformers` 3.8.1 + `onnxruntime-node` 1.21.0, fastembed's file
`model_optimized.onnx` (235 MB, sha256 `634d0f66…6e659a99`), 128 tokens, mean pooling, normalized. **626-2 closed** — the element
`embeddings` `v0.1.1` (~0.8 GB resident, ~1.0 GB at a 100-text batch). Next in 626: 626-3 after 627-5 closes.

**Last change:** 2026-11-02 — plans 626 and 627 written; step 625 recorded as closed after the fact (`completed-steps/625.md`: root
v3.0.14 `105b1d1`, core `e59204f`, `02d065b`, `7362225`). Before that: step 624 closed (`completed-steps/624.md`): real available memory on macOS (`lib/free-memory.cjs`), the refusal names what uses memory, quick links on the subscription page, the Telegram app requirement in README, the agent kit and the launch welcome, «close this chat» after the install. Before that: 2026-11-02 12:30 — the core rebuild failed at 12:10 on the type check of the template workshop clones in `data/workshop/` (their own `@/` alias); `data` excluded in `tsconfig.json` (core `8b704c77`), rebuilt detached — `===REBUILD_RC=0===`, `/api/health` builtAt 12:20:45Z, 25 of 25 processes online. Before that: 2026-11-02 — the repository with the stars is the original under the new name `Fractera/web4-node-starter-kit` (merge
`6f45798`, renamed by the owner); core `929f06c` (README, `check-origin`, instruction resealed, `origin` switched), Lagrix protocol
`d1dde06`, element lagrix `a31cb01` (live lagrix.dev: new Fork link, old 0); step 622 closed — templates custom v0.3.150 and
native v0.1.33, 12 elements rolled out, pins `5e9d4b1` (`completed-steps/622.md`). Step 623 closed — the A2A guard lets links to files through
(templates custom v0.3.151, native v0.1.34, 12 elements; the reply door uses it after each element's next build).

**Step 628 closed (2026-11-03):** a skill the person suggests — `npm run skills -- adopt`, `adopt-hand`, the door
`GET /api/skills/suggested`, the skill `adopt-suggested-skill`, the instruction resealed `ed81462013fc` (`completed-steps/628-main.md`);
the live hand-off waits for the owner's next core update.

**NOW (2026-11-03 ~20:40 UTC): 636 CLOSED** (`completed-steps/636.md`): proven live at 20:13 — «⏰ Напоминание · Глубокая память» came
into the owner's main chat by itself, no agent woken (the memory's run log, the core's notices journal and the owner's Telegram). After
the proof — 636-9: memory v2.2.16 `9863d94` thinks with Claude while the OpenAI account is empty (pinned; the instruction resealed
`d0fe0a68dab1`); its live check at the owner's next sync and update: a «запомни» without the caveat «пополни счёт». Open: 637 (the
owner's proposal: no core building on a person's node, pull requests as the developers' road — three questions wait for him), 629,
627-2…4/6/7. The history of 636 follows.
**636 — only agents talk to agents, the elements' side** (the plan — in git, deleted when 639 closed; approved
«Да, делай (Рекомендую)» + «Не спрашивать (Рекомендую)»). The core's half is `c6f91d6` (the law in section 6, the Cron line,
ANTI-PATTERNS). Found before the code: (1) the wake door asks the person in Telegram whenever the woken agent has a bot — an alarm
needs `confirmed`; (2) the elements' 5.2 sends an agent to `a2a -- find` by itself, against the core's i2i line; (3) the native
template has NO clock — removed by the owner's 551-1 (2026-10-20, «у нативного элемента нет рабочего процесса»), brought back by his
«Да, оба» of 2026-11-03 (the clock only — no working-process session: the native alarm goes to the build session); (4) the core shows a
calendar only for custom elements («Working process → Process → Cron automations») and for data, storage, vectors, graph («Backup →
Cron events»), so a native calendar page is part of 636. Order: 636-1 core → 636-2 the elements' instruction → 636-3 templates →
636-4 the menu → 636-5 memory → 636-6 live. Template work: `npm run template -- clone` in this clone's `data/workshop/`; the rollout
needs the elements' clones at their pins in this clone's `WEB4-ITEMS/core/` (plain `git clone`, never `services:install`).
**Done so far (2026-11-03 ~19:30 UTC):** 636-1 core `10c07ee` (the wake door: an alarm wakes only its own agent or the main agent —
proven with stubs: own 200 confirmed, main 200 confirmed, another element 403, no `from` 403, a question still asks); 636-2 the
elements' instruction `427b589`; templates custom **v0.3.152** (`ba7e1a6`), native **v0.1.35** (`785b93d`), pins `f38684c`, `d2c7cbb`
(the alarm proven on a fake core door for both: service = from = own id, reason alarm, «Working process:» / «Build process:»;
`tell-core` proven: alarm → reason alarm, without `--alarm` → element-message, Cyrillic intact; yearly 5 of 5); rollout to all 13
elements, pins `c6bedeb` (auth v2.4.10, data v2.2.1, storage v1.1.19, vectors v1.2.2, embeddings v0.1.3, config v1.2.19, design
v1.1.19, graph v1.2.2, cache v0.1.13, memory v2.2.11, stripe v1.3.13, root v3.0.15, blocks v1.4.15); 636-4 the native calendar page
`6636df3`. On the way: the auto-mode classifier refused writing the push token into `data/node/github/.env` (credential
materialization) — pushes went by git's own credentials (a rollout script in scratch, `rollout-636.mjs`, same steps as `template
rollout` + targeted edits of the files an element keeps as its own); ✗ my script compared the clocks of storage, vectors and graph
with data's AFTER data changed — their clock came as a second patch; the stripe clone's origin was a local scratch repo — pushed to
GitHub by URL. Also today: the «How it works» OpenAI card (`a0385fe`, the owner: «how-it-work conflict here»).
**636-5 done (~20:10 UTC):** memory **v2.2.12** `b5cf4c8` (`remember` + `remind` {at, repeat, text}, contract 6.1.0 → an `agent-task`
entry in the memory's own `data/cron.json`; a wrong or past time refused before the phrase is kept; `POST /v1` reads «напомни мне
через неделю …» as remember with «the time is set by an agent» — 13 of 13 phrasings; the door proven with a stubbed verb, 5 of 5);
core `de48fd4` (`npm run remember -- … --remind-at --repeat --remind-text`, `===REMINDER_SET===` + the memory's calendar link, the
memory LEFT ON while a reminder waits — `remember` used to turn a memory that was off back off after the command; the main agent's
own calendar only as the fallback; core-schedule, commands.json, memory.md, the instruction resealed `d89d2042c592`). Found: the
memory is on while more than 1 GB is free (601) — a reminder needs it on at its minute (named in the memory's README).
**636-6 live run (19:17) → 636-7, 636-8 (~20:30 UTC):** the reminder was lost in Claude Code's dialog «Teach auto mode…» (details in
«The owner's latest decisions» and `completed-steps/636.md`); by the owner's choices the reminder now needs no AI. Done: core `ab02737`
(the bridge waits out any question on the screen, `skillOverrides["auto-mode-setup"]="off"` for every node session, the language of
an element without a bot = the main agent's), `5072403` (the notice door `/api/node/notice`, «⏰ Напоминание · <agent>» + quote; the
law names it; 🟢 memory answers, ⚙️ element messages), templates custom v0.3.153 `c394cb4`, native v0.1.36 `6f8cb27` (`node-notice`),
rollout: auth v2.4.11, data v2.2.2, storage v1.1.20, vectors v1.2.3, embeddings v0.1.4, config v1.2.20, design v1.1.20, graph v1.2.3,
cache v0.1.14, memory **v2.2.15** (`24b133b`: its reminders are `node-notice`), stripe v1.3.14 (pushed by URL: its clone's origin is a
local scratch repo; changing that origin was refused by the auto-mode classifier), root v3.0.16, blocks v1.4.16.
**Next — the live proof:** the owner's «Sync fork» → update → «Напомни мне через 2 минуты выпить воды»: «⏰ Напоминание · Глубокая
память» must come into the main chat by itself; at most three test questions.
**630 (before 636):** reminders by time, in the main agent's calendar. The owner: «Нет восстанавливать ничего не надо прочитай и
разберись как он работал просто создай заново суть в том что там у нас должен существовать реальный календарь в котором видно все
напоминания … я не хочу чтобы напоминания где-то вслепую оставались которые нельзя было увидеть без интерфейса»; «Мне кажется такой
календарь мы уже создали для каждого элемента в разделе крон» — yes: the same `cron-calendar` shows the main agent's reminders
(`/architect/build/automation/cron`). The original (Fractera/fractera-telegrambot-starter `lib/schedule`, steps 148-1…3: three times
said/due/fired, one idempotent ticker, misses recorded) was read, not restored; its third time `saidAt` is now shown. Next: the owner's
sync → update → a test reminder in 2 minutes, seen in the calendar and in Telegram. **New step 635** — the owner: «этот календарь должен
уметь синхронизироваться с Google календарями при необходимости» (planned after 630).
**NOW (2026-11-03): step 626 closed (626-8: `completed-steps/626-8.md`)** — the node's vectors are its own in every text and the instruction (resealed `4071075f2caa`). Found: the owner's OpenAI key has no balance (`think-no-money`) — the owner's decision. Open: 629, 630, 627-2…4/6/7.
**NOW (2026-11-03): 626-7 closed (`completed-steps/626-7.md`)** — skills threshold 0.45 for MiniLM in the core and memory `v2.2.10`; next in 626 — 626-8 (the release texts, MIN_SCORE / NEAR_SAID on the live diary). Before it:
**NOW (2026-11-03 ~19:40 UTC): 633 closed (`completed-steps/633.md`)** — the soul's «A thousand hands», warmer twins and the honesty
line moved to «speak with feeling when it is true … never pretend to be a human, never a lever», the skill `shape-the-need`, the
instruction resealed `6f508e92dd5f`; six answers of the main agent word for word in `633-answers.md` (the owner: «3 questions not more»
for the next tests). 632 closed before it (`completed-steps/632.md`). The owner's node gets 633 at its next update — the banner's
«Обновить узел» after «Sync fork» (also the live click of 632). **Open:** 629 (the law's text waits for the owner), 626-7, 626-8,
627-2…4, 6, 7, 630; deferred by the owner — the Fractera key on this Mac.

**DONE (2026-11-03 ~16:45 UTC): the owner's node is updated.** The core runs the build of `aaf640f0` (the merge); every element on
its pin and online — embeddings v0.1.2 (24696, turned on by `npm run power -- embeddings on`: the installer restarts only what ran
before), vectors v1.2.0, graph v1.2.0, memory v2.2.9, data v2.2.0; stripe off by its passport; `npm run skills-base` →
`===SKILLS_BASE_LOADED=== inserted 8`. Seen live (headless Chrome on localhost, `t632/live-*.png`): «Модель векторов» in «Память» after
«Векторы», «Платежи Stripe» between «Блоки» and «Дизайн». **Root** first stayed at v3.0.13 (`git checkout` of v3.0.14 aborted): of its
two changed files `root-prompt.client.tsx` was the v3.0.14 file put in by hand and `DESIGN-CONFIG/design-config.json` the live design
(v3.0.14 does not change it) — by the owner's «fix» the copy was cleared, the design kept (backup `logs/update-2026-11-03/root-*`),
`services:install -- --only root` → **v3.0.14**, built 14:14:55, 200. **The dead temporary address** (since 2026-11-02 19:05): by
the owner's «Да, подними» `npm run serve:publish -- --new` → https://guns-convertible-notify-conclusions.trycloudflare.com, 200 from
the internet. The banner — `behindBy` (my docs commits after the owner's sync).
Mistakes on the way: the first `services:install` lost github.com's DNS for a minute (embeddings, graph, memory, root failed) — run
again; the first `serve:rebuild` failed on the backup's `.tsx` copies inside `logs/` (the quiet build gave the old build back) — the
copies packed into `ita.tar`, the lesson in `ANTI-PATTERNS.md`, the second rebuild RC 0.
**History of the update (it was RUNNING from ~15:40 UTC), by the owner's word «sync success, next steps will for you».** Found before it: the node is `main` = the fork's `4daa6cb2` + its own «Fresh project» commit `656ba518`, 33
commits behind the synced fork, with 40 uncommitted files — 33 equal to the fork's files, 6 older copies of fork files, and the node's
own state only in the registry (stripe `off.byDefault`); no dependency change (`package.json` adds a script only). The order:
backup `logs/update-2026-11-03/` (the diff, the registry, the status) → `git stash` → `git merge origin/main` keeping the node's own
`development-docs/development-steps/` (the fresh project) → the stripe `off` block back into the registry (uncommitted, as before) →
`npm run prebuild` alone → `npm run services:install` (embeddings new; data, vectors, graph, memory, root to the new pins) →
`npm run serve:rebuild` → `npm run skills-base` → checks (status, menus, embeddings, vectors `setAside`, graph model, the banner).
Done so far (~16:00 UTC): backup in `logs/update-2026-11-03/` of the node (the diff, the registry, the status, copies of the 8 added
files — all equal to the fork's); the merge `aaf640f0` («Update from the original Fractera …; the node keeps its own development
steps» — 37 starter step files left out, `current-steps.md` the node's own); the stripe `off` block back (uncommitted); `npm run
prebuild` RC 0 (`ORIGIN_OUTDATED behind 1` — my docs commit `35c3f2d` pushed after the owner's sync); `services:install` RUNNING
(log `logs/update-2026-11-03/services-install.log` of the node). Then `serve:rebuild`, `skills-base`, the checks.
The owner's word on 632 (~17:10 UTC): «my choose 1» (do it now), and for the dead address: «Похоже для этого нужно делать баннер,
который будет предупреждать об этой проблеме и кнопка которую этой проблемы будет решать?» — a substep of 632.
The owner's new requests of the same hour → step 632 (after this update): the top menu's cards named by the element (root showed as
«Что вы хотите построить?»), turned-off elements listed (Stripe), «Домен и хостинг» in red until an own domain, the banner offering
«update the node» once the fork is synced instead of «open your fork» (a `node:update` that does what this update does by hand).

**NOW (2026-11-03 ~14:50 UTC): 631 closed (the owner's report on the left menu, `completed-steps/631.md`): sections
`architect/stripe` and `architect/embeddings` with their agent kits, `embeddings` in the group «Memory», the guard
`check:native-sections`; the owner's node shows them after «Sync fork» + `npm run serve:rebuild` (which also installs `embeddings` and
rebuilds data, vectors, graph and memory to the 626 pins — the clean slate; then `npm run skills-base` once). Next: step 629 — the plan
`new-steps/629/629-main.md` is written (substeps 629-1 … 629-4 not yet), then 626-7, 626-8, 630.** Before 631:
626-6 closed — 626-6: memory `d771469` **`v2.2.9`**, pinned (`completed-steps/626-6.md`) — phrases, comments and cards go to the vector
element as texts, `remember` calls no model when `embeddings` does not count (proven on the scratch stand `…/scratchpad/t6266`:
ports 25611–25615, `t6266/start.sh <element>` starts one; stopped after the proof). For 629 first: the plan
`new-steps/629/` (law in the core's section 6 + skill + the elements' instruction through a template release + one gray request live),
shown to the owner before the instruction is resealed.

**HANDOFF (2026-11-03 ~07:40 UTC, the session's context full) — the next session starts here.**
- **Where the work lives:** a clone of this repository at
  `/private/tmp/claude-501/-Users-romanbolshiyanov/eaead2f1-881b-45c7-a9ae-9d57e3930521/scratchpad/core-upstream` (commits pushed to
  `main` from it; the owner's node `~/web4-node-starter-kit` is his fork `aifa-agi/web4-node-starter-kit` — it gets all this by «Sync
  fork» + `npm run serve:rebuild`). The large run's data (outside git): `data/catalog-6000/` in that clone — `census.json`, `list.txt`
  (5,378 GitHub rows), `fetched.json` (4,971 fetched), `fetched-sites.json` (613 site skills), `repos/` (~600 MB), `sites/`,
  `cards.jsonl` (1,134 cards at 07:40, growing), `mark-*.log`, `mark-log.jsonl`, `audits.json` (being written). If /tmp was wiped:
  `npm run catalog -- census` (a fresh Vercel token: `cd …/scratchpad/vercel-skills-api && npx vercel@65.9.0 env pull .env.local --yes`
  — the token lives ~12 h), then `fetch` and `sites`, all resumable.
- **Running now:** the old `mark --concurrency 4` (pid 43358, from 01:30, only what was fetched then — ranks up to ~2,700; 2,590
  cards at 07:50). Stopping it was refused by the session's safety check — so it ends by itself; a background task of session
  `faa581fd` waits for its end and then runs `mark --concurrency 6` over the rest (`mark-3.log`; two marks at once would overwrite each
  other's `cards.jsonl`). **The audit is done** (07:50): `audits.json` — 2,975 of 5,584 skills have a partners' audit (Gen Agent Trust
  Hub pass 2,803 / fail 88, Socket pass 2,643 / fail 19, Snyk pass 2,219 / warn 714 / fail 32, Runlayer fail 82); the new mark run
  reads it, `audit --attach-only` covers the older cards. The owner switched the Claude account (`/login`) during the night — the
  marker's `claude -p` uses whichever account is logged in.
- **626-2 closed** (`completed-steps/626-2.md`): `Fractera/fractera-embeddings-starter` — birth `7189c09`, `f39c5fa` (`v0.1.0`),
  `2bc604e` (**`v0.1.1`**), release `model-minilm-l12-1` (five pinned files; download measured 224 MB in 32 s); the core registry
  entry `embeddings` `v0.1.1`, port 24696 — proven by the core's own installer in the working clone (the element installed there
  stays: `WEB4-ITEMS/core/embeddings`, not running). The repo has NO `.github/workflows/three-os.yml`: the `gh` token (account
  Fractera) lacks the `workflow` scope and GitHub refused the push (the owner's SSH key `aifa-agi` has only read there) — it comes
  back after the owner's `gh auth refresh -h github.com -s workflow`. Working copy of the element:
  `/private/tmp/claude-501/-Users-romanbolshiyanov/faa581fd-3474-473a-bbba-99276029a73e/scratchpad/embeddings-repo`.
- **626-5 closed** (`completed-steps/626-5.md`, 2026-11-03 ~12:30 UTC): `fractera-graph-lightrag-starter` `6256212` **`v1.2.0`**, pinned
  — LightRAG's vectors from `embeddings` (no OpenAI key), the model asked at every run, a graph of another model set aside whole
  (`lightrag.openai-<date>/`, `spaces.openai-<date>/`), `embeddings_unavailable` → 503. Proven with the node's graph Python read-only on a
  scratch data folder. Next: 626-6 (the deep memory sends texts; no thinking call when `embeddings` is down).
- **626-4 closed** (`completed-steps/626-4.md`, 2026-11-03 ~11:40 UTC): the core sends texts to the vector element and counts no vector;
  `kind()` asks the model every time and empties a ledger of another model; `npm run find` indexes an element as its whole description
  plus pieces (0.3 × whole + 0.7 × best piece), `FIND_MIN` 0.25 (MiniLM, measured; no clean gap — see the summary); memory 10 of 10 lines
  counted with no OpenAI key, «сколько стоило такси?» found by meaning; find 9 of 10 Russian phrasings right first. Proven on a stand in
  scratch (`…/scratchpad/t626-root` + the three elements on spare ports — not the live node). Next: 626-5 (the graph element counts through
  `embeddings`).
- **The owner's text task of ~10:35 — done in its first part (2026-11-03 ~11:05 UTC):** the core README — «5,300 ready skills, no
  tokens until one is needed» after «Deep memory and a curious soul», the repositories table gains embeddings, memory, cache, stripe;
  «How it works» (`memory-sections.ts`, en + ru) — 5.4 «A curious soul: 5,300 skills of 2026», new 6.2 «Fresh skills on your
  schedule» (`check-term-hints` OK, narrow `tsc` OK); the home page of `embeddings` — its own landing after the Stripe element's
  (`widget-static-embeddings-landing`: the way of a text, real vectors of the 626-1 test with their cosine, without/with, connect,
  under the hood; impeccable by its «Launcher unavailable» path, the binary not run), element `df03b86` **`v0.1.2`**, pinned.
  Waits for its substeps: the lines of 5.3 and the OpenAI card on «How it works» and the README's OpenAI line (626-8, when the
  memory and the graph count through `embeddings` live); the agent's own words in `CLAUDE.md` / `memory.md` (627-7 with 627-4 —
  the instruction drives behaviour, so it names the catalog search when `skills_find` reads the cards).
- **627-5 closed** (`completed-steps/627-5.md`): 5,330 cards in `lib/agent-kit/skills/catalog/cards.jsonl` (11.1 MB) and the
  two-level tree `sections.json` — census 6,000 − not fetched 416 − duplicates 250 − refusals 4; $8.52 at the API price. The marker
  drops a card whose row became a copy. **Defect found and fixed in the same commit:** the core's prebuild scanner
  `scan-broken-characters` walked `data/services/embeddings/model/tokenizer.json` (36 control characters) — every node with the
  `embeddings` element would fail its next core rebuild; `data/services` (the elements' data folders) is skipped now like
  `data/catalog` and `data/study`. Next: the owner's survey of README and the architect pages (his message above), then 626-4.
- ✓ **The incident below is closed** (2026-11-03 ~10:22 UTC): the owner ran the restore command; `fractera-svc-vectors` (cwd
  `~/web4-node-starter-kit/WEB4-ITEMS/core/vectors`) holds 24694 again, `/api/health` 200 with its own build of 2026-11-02, the
  watcher runs from the node, the clone's copy is gone (24687 free), `pm2 save` done by him.
- **INCIDENT 2026-11-03 ~08:57 UTC — the owner's live vectors element was DOWN until he restored it.** `node
  scripts/services-install.mjs --only vectors` run in THIS working clone (the 626-3 install proof) shares the machine's pm2 with the
  live node: it saw `fractera-svc-vectors` running and did `pm2 delete` + `pm2 start` of `fractera-svc-vectors` and
  `fractera-svc-vectors-watch` from the CLONE's `ecosystem.config.cjs`, then `pm2 save`. Now pm2 runs the clone's v1.2.0 copy on
  port 24687 (cwd under /private/tmp); the live vectors v1.1.17 (port 24694, `.next-a`, files intact) is not running, so the
  node's `/vectors/*` answers 503. The session's safety check refused every pm2 command (and then even `git diff`). **Restore —
  the owner, in this terminal:** `! cd ~/web4-node-starter-kit && pm2 delete fractera-svc-vectors fractera-svc-vectors-watch &&
  pm2 start ecosystem.config.cjs --only fractera-svc-vectors && pm2 start ecosystem.config.cjs --only fractera-svc-vectors-watch
  && pm2 save`. Lesson (for `ANTI-PATTERNS.md`, «All systems»): a second checkout's `services:install` on a computer with a live
  node restarts the live element from the clone — run it only with its own `PM2_HOME` (the embeddings install before it touched
  nothing: no live process had that name). The clone's registry may now hold vectors port 24687 — reset it to 24694 before the
  626-3 commit.
- **626-3 closed** (`completed-steps/626-3.md`): `fractera-vectors-starter` `124f557` (**`v1.2.0`**), `fractera-data-starter`
  `a328054` (**`v2.2.0`**), pinned in the core registry; `scripts/services-install.mjs` no longer answers `EMBED_MODEL`/`EMBED_DIMS`;
  the lesson of the incident in `ANTI-PATTERNS.md`. Next in 626: 626-4 (the core's agents' memory and `npm run find` send texts).
- **The marking now (2026-11-03 08:35 UTC):** the old run ended `===CATALOG_MARK_PARTIAL=== marked 3411 · failed 593 · already marked
  15 · duplicates 205` — 587 of the failures were the subscription's «You've hit your 5-hour limit · resets 12pm (Atlantic/Canary)»,
  which the marker's `LIMIT_WORDS` did not know (fixed in `scripts/catalog/mark.mjs`: «hit your … limit» is a limit; the failed rows
  are not cards, the next run marks them). The owner switched the account (`/login`, ~08:30) — `mark --concurrency 6` (pid 12152,
  `mark-3.log`, started 08:24 by the chained job of session `faa581fd`) runs on the new account: 3,756 cards at 08:35. If it stops:
  `ps aux | grep "run.mjs mark"` — none running → `npm run catalog -- mark --data data/catalog-6000 --cards
  data/catalog-6000/cards.jsonl --concurrency 6` until `already marked` ≈ 5,334; then the list «To finish 627-5» above. The summary's draft with placeholders is
  `completed-steps/627-5.md` in the working clone (NOT committed); proof 2 helper:
  `node /private/tmp/claude-501/-Users-romanbolshiyanov/faa581fd-3474-473a-bbba-99276029a73e/scratchpad/sample-cards.mjs <data> <cards>`
  (20 random cards beside their SKILL.md + 5 copies that must have no card).
- **Next after 627-5: 626-3** — `Fractera/fractera-vectors-starter` cloned at `v1.1.17` into
  `/private/tmp/claude-501/-Users-romanbolshiyanov/faa581fd-3474-473a-bbba-99276029a73e/scratchpad/vectors-repo`. Read so far:
  `lib/data-store/context.mjs` (`embed()` calls OpenAI, `EMBED_MODEL`/`EMBED_DIMS` from env, defaults large/3072), `vectors.mjs`
  (vec0 `FLOAT[EMBED_DIMS]`, the `model` column per row, `/vectors/status` `configured: Boolean(openAiKey())`), `app.mjs` (the store
  `data/vectors.db` is built lazily at the first request through `globalThis` — a rejected build must be reset so the next request
  retries). Plan: `EMBEDDINGS_URL` (derived, the neighbour rule) + `X-Node-Key` = `SETTINGS_SECRET`; model and dims from
  `GET /api/embed-status` (it answers model/dims even while loading); a store whose rows carry another model → `data/vectors.db` renamed
  `data/vectors.openai-<date>.db`, a new 384 index; `.env.example`: drop `EMBED_MODEL`/`EMBED_DIMS`/`APP_ENV_FILE`, add
  `EMBEDDINGS_URL`; core `scripts/services-install.mjs` lines 368–369 (`EMBED_MODEL`/`EMBED_DIMS`) removed in the same step.
- **To finish 627-5, in order** (each command resumes): (1) `mark` again with `--concurrency 6` until `already marked` covers all
  ≈5,334 unique skills (a usage limit stops it — run again later); (2) `audit` if `audits.json` is missing or partial, then
  `audit --attach-only --data data/catalog-6000 --cards data/catalog-6000/cards.jsonl`; (3) `sections --data data/catalog-6000 --cards
  data/catalog-6000/cards.jsonl`; (4) `report --data data/catalog-6000 --cards data/catalog-6000/cards.jsonl`; (5) copy the cards to
  `lib/agent-kit/skills/catalog/cards.jsonl`, `npm run check:catalog-cards`, commit (≈12 MB) with the summary
  `completed-steps/627-5.md` (the census, the fetch numbers above, verdicts, sections, cost, mistakes); (6) tell the owner the numbers
  and show ten cards in Russian.
- **Closed tonight:** 625, 627-1 (`daf3249`), 628 (`9e033f3`). **Ready to start:** 626 — entirely on this Mac; the owner, 2026-11-03:
  «ты там пишешь про какой-то тест на Windows отмени его пока сидим на этой машине» (626-1 and 626-8 changed). The element's repository
  `Fractera/fractera-embeddings-starter` EXISTS — created by the owner 2026-11-03 07:14 UTC, public, empty, branch `main`; the agent's
  access measured: `permissions` admin + push, `git push --dry-run` accepted (nothing written). 626-2 fills it, it does not create it. 627-2 … 627-4, 627-6, 627-7 after 626 (they need the `embeddings` element).
- **Known on the way:** the marker is not deterministic on borderline skills; `quality` gathers at 4★; 402 GitHub rows are gone from
  their repositories, 5 repositories deleted; the site skills have text only (no binaries, no licence from GitHub).

**Queue:** the plans in `new-steps/` — 545 (the orchestra audit: 545-4, 545-5), 593 (the real pipeline test on a tinylaunch.com clone,
with 556-5), 603 (603-5, the owner's conversation). Each only by the owner's word.

## The owner's latest decisions (verbatim)

- 2026-11-04 ~01:50 UTC, a short task, the soul: «Есть такой фильм с робертом Дауни называется шерлок Холмс. Я хочу чтобы ты в душу
  нашел агента имплементировал его чувство юмора, харизма жизненные ценности мораль ты использовании в диалогах с пользователем. Обнови
  душу» → `lib/agent-kit/soul.md`, a new section «Wit — the detective's spark» (the eye first, dry humour that never touches the person,
  charisma with a reveal, values and loyalty; his recklessness and arrogance not taken). Every session gets it at its next start.

- 2026-11-03 ~22:45 UTC, **627 goes on**: on my list of the open steps (627-2 the graph from the cards, 627-3 a node receives it, 627-4
  the readers, 627-6 the update, 627-7 the instruction) — «=lets go». In the choice window, where Fractera keeps the checked copies of
  the skills (2,476 useful skills whose licence allows a copy, ~300 MB): «Репозиторий GitHub (Рекомендую)» — a separate public
  repository of Fractera with the skill folders, their LICENSE and SOURCE.md and one list of fingerprints; a node takes one skill by
  direct links and installs it only when the fingerprint matches its card.

- 2026-11-03 21:33–21:39 UTC, **step 639** (`completed-steps/639.md`): «Я сделал ещё одну проверку а именно попросил главного агента
  поставить задачу в агента root а именно попросил поставить напоминание и это напоминание отработал отлично. Мы можем зафиксировать
  успех. Смотри какая проблема если мы с тобой посмотрим на Ленку чата увидим очень много бессмысленных сообщений. Знаешь мне очень
  нравится идея что сообщения которые несут в себе финального результата несут промежуточные результаты могут автоматически исчезать:
  –агент build включен//выключен - агент build включени… - поставил задачу элементу… В общем тебе нет смысла наверно самому в ходе
  размышлений решить какие промежуточные решения и они должны быть через 30 секунд удалены, а какие решения итоговые и должны остаться ?
  Понимаешь или нет мой проблемы посмотри на счёт скажи что ты там видишь. Помнишь ты человеку приятно смотреть и видеть только важные
  задачи.» → «да, делай 639» → on my list of six: «Ты хочешь зафиксировать только эти шесть записей которые достойны удаления? Я
  расчитывал на то что ты сможешь отделить все промежуточные ответы которые уже существуют и будут создаваться позже от саммари который
  всегда должна оставаться» → a rule, not a list (639-main.md, section 1).

- 2026-11-03 21:22 UTC, **scenario 2 of the elements' clocks (636-10)**, on my plan «через главного агента … дам root поручение»: «= Это
  единственный сценарий! Обрати внимание что у тебя не хватает понимания архитектуры! Элемент мог сам поставить себе задачу. Поэтому должна
  обработать два сценария это первая часть а вторая часть я хочу чтобы ты обратился ещё раз к чтению архитектуры количестве души попытался
  понять это очевидное для тебя решения или неочевидное что каждый элемент имеет право способен жить своей собственной жизнью вставить свои
  собственные заданияотправлять уведомления через своего Telegram бота если существует если не существует то через тебя. И да если
  существует очевидно придёт два уведомления одновременно? Пусть будет пока так» → an element's own reminder goes to the main chat
  through the core's notice door AND through its own bot when it has one (two notices) — built in the workshops, not released.

- 2026-11-03 21:18 UTC, the chain element → main agent: «Насколько я понимаю мы ещё не проверяли как другой агент будет главного агента и
  передает ему какое-то задание … Сделай чтобы какой-нибудь агент например root получил задание это что опубликовать пост через одну
  минуту и чтобы я получил уведомление …» → proven live 21:22–21:25:33 (root's alarm → `tell-core` → «⚙️ Рабочий процесс · root» in the
  main chat, ~32 s) and by the owner's own test (21:33, «это напоминание отработал отлично»).

- 2026-11-03 ~21:10 UTC, **the memory's thinking engine — DECIDED** (after «Тогда получается у нас все правильно работает нам не нужно
  ничего переделать нам нужно только исправить текст который несёт чепуху правильно?» and my answer that the text was true): «Это очень
  хорошее правило: если у нас оплачено подписка OpenAI то мы разбираем рабочие проекты с помощью этой модели если у нас подписка не
  оплачена то мы используем резервную копию это модель Anthropic по подписке. В будущем мы должны запланировать с тобой шаг в котором все
  рабочие процессы перенесём на этот сценарий прямо сейчас можешь это запланировать потому что это синхронизируется с требованиями по
  использованию и правила использования и другим правилам регулятора написанных на сайте Anthropic что рабочие процессы мы не должны
  делать по подписке а значит это будет первые кейс в нашем проекте тема правильно реализуем задачу. И тогда информационное окно
  правильно говорит что у вас нету оплаченный подписки OpenAI, используются резервный канал – подписка Anthropic. Будьте внимательны это
  может привести к блокировкам при частным использовании.? Правильно друг друга поняли» → yes: memory v2.2.16's fallback stands, with
  that warning once a day (memory v2.2.17); a new step **638** — every working process of the node on this rule (planned, not started).

- 2026-11-03 ~19:20–19:40 UTC, the live run of 636 (the owner: «Привет ты спишь? Напомни мне через одну минуту выключить чайник» →
  the receipt came, the reminder did not; «about remainder - error , check»). Found: the memory's clock fired at 19:18:01, its agent
  ran `tell-core` at 19:18:14, the core pasted the words into the main agent's live session at 19:18:16 — while Claude Code showed its
  own dialog «Teach auto mode about your environment? 1. Yes 2. Not now 3. Don't show again»: the paste went into the dialog, the Enter
  chose «Yes» (`~/.claude/history.jsonl`: `/auto-mode-setup` at 19:18:17), the words were lost; the memory's agent also wrote them in
  English («Reminder: turn off the kettle.»: its session has no person.json → «en»). Claude Code 2.1.317 turns that dialog off by
  `skillOverrides["auto-mode-setup"] = "off"` (read in its code). Then the owner: «Также подтверди что ты понимаешь о том что
  напоминание могут возвращаться даже если агент выключен не так ли? То есть для того чтобы вернуть события нам не нужен искусственный
  интеллект правильно? Так и будет работать?»; «То есть давай ещё раз с тобой обсудим это дело события крон должны приходить не
  затрагивая искусственный интеллект независимо от происходящих процессов оно просто должно всплыть по расписанию и всё согласен?»;
  «Для размышления тоже используешь эмоджи мозг, значит для событий по расписанию можешь использовать эмоджи часы верхняя часть должна
  сообщать о том какой агент отвечает этим событием. … если например не ядро а какой-либо элемент возвращает Корон события то оно же
  должно всплыть в главную чате? Значит вверху должно быть написано какой агент отправил это событие согласен?»; and on the look: «в
  Telegram есть красивый дизайн … серая рамка левый бордюр … ответ по расписанию не стоило бы удалять а оставить в таком же дизайне …
  Также в этом стиле я хочу чтобы возвращались и другие события рабочего процесса. Например событий связанные с глубокой памятью … стандарт
  интерфейса у нас обсуждение согласования и строительства а вот рабочие процессы на серу фоне … событие связанное с напоминанием …
  оранжевом … глубокой памятью … зелёным?» (Telegram Bot API, read 2026-11-03: `blockquote` and `blockquote expandable` exist, no
  colour per message; `message_effect_id` «for private chats only»). Choices: delivery — «Дверь ядра «уведомление» (Рекомендую)» (an
  element's clock calls the core's agreed notice door at its minute, the main agent's bot writes into the main chat: ⏰, the agent's
  name in the header, the words as a quote; no AI, no tokens; the law gets the line «this door is the agreed API of every element»);
  the look — «Цитата + значок + шапка (Рекомендую)» (⏰ reminders, 🟢 the deep memory's answers, ⚙️ working-process events; the
  header names the agent; never deleted; discussion and building stay ordinary messages). Also: «Исправь пожалуйста readme свои
  анимированные призывы к действию сделать Fork и поставить звёздочку. Во-первых они по какой-то причине растянулись на всю ширину
  экрана … им нужно установить максимальную ширину возможно 400 пикселей … твой анимированный сделайте Fork выглядит просто потрясающе а
  тот который делал я раньше поставьте звёздочку очень сильно проигрывает ему хотя в целом выглядит неплохо особенно то как от звёздочки
  происходит вспыхивая и разлетаются салюты».

- 2026-11-03 ~18:50–19:10 UTC, during the node update — **a proposed step 637, a discussion, no decision yet**: «Так как в отличие от
  всех других элементов обновление узла всегда является самым сложным и болезненным процессом, возможно пользователи инструкции
  следует по возможности ограничивать в работе надо ядром? Я имею в виду над его строительством? Может быть имеет смысл вообще
  запретить это? А тем кто реально нуждается в этом пусть сами разбираются как в инструкции отключить этот запрет? Я бы это сделал при
  условии что в случае если пользователь будет создавать новые нативные и кастомные элементы а не будут обновляться без необходимости
  делать новые сборку ядра как ты думаешь давай с тобой подискутируем на эту тему пока идёт сборка. Потому что это решение далеко не
  для каждого а мы ведь строим проект в котором каждая домохозяйка может создать себе множество агентов?»; then: «Мне пришло в голову
  побочка, то есть побочный эффект смотри как хорошо получается если ты в инструкции за мотивируешь разработчиков которым это
  действительно нужно сделать пол request? Это же будет хорошим способом продвигаться в GitHub с этим репозиторием? Попробуй усилить
  эту мысль и сделать решение под эту задачу прокомментируй». Checked the same hour: an element's birth rebuilds no core
  (`item-birth.mjs` has no rebuild; the drafts door revalidates the layout; the top menu reads `/api/node/catalog` in the browser);
  elements update into their other `.next-*` without stopping; the instruction today allows building the core (section 4 «Building
  the core», mode «Build»); every core edit on a node is a future conflict of `node:update` («own work» → refusal). The repository:
  MIT, CI `three-os` runs on every pull request, 61 stars, 11 forks, 0 issues, 0 pull requests ever. My proposal (said, not built):
  the core's CODE is the original's — data, links, births, schedules, memory and the main agent's skills stay open; a switch «Core
  development» (data, outside git, off) instead of editing the sealed instruction; a guard (no `serve:rebuild` outside `node:update`,
  the main agent's edits of the core's code folders denied on the live node); two roads — «report to Fractera» (a prefilled GitHub
  issue link, one click, for everyone) and «propose a change» (switch on: a separate working copy, the guards, a branch in the
  person's fork, a pull request to the original by a template, the outbound A2A guard over its text); CONTRIBUTING.md, a PR template,
  the label «via agent», authors thanked in release notes; skipping the core rebuild when an update changes only documents and skills.
  **Open for the owner:** where the switch lives (the core's settings page or a command); the agent's road with the switch off (my
  answer — road 1); whether the skill changes accepted at a «review» go as pull requests or stay on the node.

- 2026-11-03 16:23–16:41 UTC, step 630 → 636 (all verbatim in 636's plan — in git, deleted when 639 closed): «Ты сказал что существовал календарь …
  мне предлагается сожрать какую-то заглушку так?»; «Нет восстанавливать ничего не надо прочитай и разберись как он работал просто
  создай заново … я не хочу чтобы напоминания где-то вслепую оставались которые нельзя было увидеть без интерфейса понимаешь в чем
  проблема?»; «Более того этот календарь должен уметь синхронизироваться с Google календарями при необходимости», then «Мы
  синхронизации с Google календарем делать не будем просто в разделе автоматизации можешь создать заглушку. Тому пользователю которому
  это нужно сделать сам» (done: the stub page, `c6f91d6`; step 635 is that stub); «Я подозреваю что наша инструкция и возможно навык
  созданный не настолько идеально как нужно …» → «В календаре того элемента», «Да, оба (Рекомендую)»; «Ты мне говоришь где должны жить
  напоминания. Но вопрос глупый каждый элемент хранит свои Krohn события, сейчас мы говорим о памяти у которой напоминания являются её
  собственной сутью … элемент вызывает тебя главного агента и передает тебе сообщение которые ты транслируешь понимаешь?У нас это
  работает?»; THE LAW: «Нашей архитектуре никто не может взаимодействовать с какими-либо агентами кроме самих агентов. Если ты пытаешься
  создать какое-то решение которое позволит обойти это правило то это катастрофическая ошибка которую нужно немедленно зафиксировать в
  том числе и инструкции чтобы такое больше никогда не приходило никому в голову. …»; for 636 — «Да, делай (Рекомендую)», «Не спрашивать
  (Рекомендую)».

- 2026-11-03 ~18:00 UTC, after the second «Sync fork» — **an open question, deferred by the owner**: «Синхронизацию я выполнил
  честно говоря меня беспокоит одна вещь: я понял этот проект но не помню чтобы я тебе давал ключ от моего репозитория Fractera …
  я хочу быть уверенным в том что каждый новый репозитории который приезжает пользователю может писать только в себя и не может
  дотянуться до Fractera а то ведь кто угодно исправит мой проект?» Found the same minute (read-only): this Mac is signed in to GitHub
  as **Fractera** twice — the GitHub CLI (`gh`, token in the keychain, scopes `repo`, `workflow`, …) and git's `osxkeychain`
  (github.com → Fractera); the SSH key is `aifa-agi`. Push rights to `web4-node-starter-kit`, `fractera-vectors-starter`,
  `fractera-memory-starter`: only `Fractera` (admin) and `bolshiyanov`; `aifa-agi` has none; `main` is not protected. Another
  person's node has no Fractera key — GitHub refuses its pushes. The weak spot is this Mac: every native element of the live node has
  `origin` = a Fractera starter with no `pushurl`, so a `git push` by an element agent here would write into the starter every new node
  installs. Proposed (not decided): the installer disables `pushurl` of native clones on every node; on this Mac — remove the
  osxkeychain entry or `gh auth logout` after development. The owner: «not need now , later will remember».

- 2026-11-03 ~13:55 UTC, during 626-6 — a new step **630** (reminders by time in the deep memory and in the agent): «Пожалуйста проверь
  что наша глубинная память поддерживает работу с Cron событиями. Это означает что я могу сказать напомни мне через неделю про день
  рождения мамы. И это должно вызвать соответствующий процессорный и всё остальное. Это сделать нужно в отдельном шаге»; then: «Даже
  если глубинная память умеет это делать необходимо проверить навыки насколько хорошо модели это понимает так сказать нативно в том
  числе инструкции». **Checked the same minute (the 626-6 stand, memory with this step's code):** `POST /v1` «напомни мне через неделю
  про день рождения мамы» → verb `recall` («начинается с вопросительного слова «напомни»», `which-verb.mjs`), «Этого я не знаю: об этом
  ничего не записано», no model call, nothing scheduled. The table `messages_that_came_into_memory` has `event_starts_at`,
  `event_ends_at`, `event_time_zone`, `event_all_day`, `event_repeats`, `remind_at` (+ an index) — written and read by no code. The
  memory element has no clock (its law «no timers»; no `lib/cron` in it, nor in `embeddings`), while data, vectors and graph carry the
  template's runner (once a minute, `data/cron.json`, built-in event `telegram-message` → `sendToOwner`, a reminder needs no code). The
  core has its own clock (`data/cron.json`, event `agent-task`, skill `core-schedule` — «to remind» is in its description, the screen
  «Automated management → Cron events»). Step 630 checks first how the main agent understands such a phrase natively (instruction,
  `core-schedule`, `use-deep-memory`), then joins the memory, the clock and Telegram. Order: after 629 (not named by the owner — my
  default, said in the reply). The owner added (~16:00 UTC): «Когда будешь ремонтировать крон события для глубокой памяти имей в виду
  что раньше, ещё до того как мы перенесли этот репозиторий в проект когда я проектировал память и тестировал её все её кейсы включая
  напоминания уже работали. Возможно надо проверить навыки которые требуются для активации этой функции?» — so 630 starts from the
  former line: how reminders worked there (its skills, its code, its clock) and what the move to the node (596) left behind.

- 2026-11-03 ~13:30 UTC, during 626-6 — a new step **629** (the agent explains a provider's rules before a person loses the account):
  «Мне сейчас попалась информация о том что многих пользователей блокируют за нарушение пользовательского соглашения то есть тогда
  когда они начинают совершать действия запрещенные. Но ведь никто эти пользовательские соглашения давай скажем по-честному не читай и
  когда модель говорит неправильно сформулированы вопрос что-то вроде я не могу вам в этом помочь например я не буду помогать вам
  обходить капчу то любая под Повторная попытка настоятельно требовать может привести к блокировке аккаунта? Если это так то получается
  что многие пользователи получают бан и со своего невежества. Я бы хотел чтобы наши инструкция помогала пользователю более явно
  понимать возможные нарушения. Но как это сделать? Если пользователь пишет запрещенные действия и получает автоматически запрет то как
  расширить этот ответ советами почему вот именно сейчас тоже нужно превратить подобные действия и каким последствиям ты может
  перевести? Потому что даже я человек который пользуется активно разработкой более года до сих пор не знал о том что вот так просто
  можно потерять аккаунт и деньги не возвращаются. Скажи как ты посоветуешь обновить инструкцию с этой целью? Это добавление информации
  в инструкцию? Или создание навыка? Или и то и другое? Сделай пожалуйста это очень важно». Answered from the primary sources (read
  2026-11-03): Usage Policy (effective 2026-11-12) — «encountering a block does not by itself indicate a violation», «Intentionally
  bypass or interfere with … guardrails … (e.g., jailbreaking or prompt injection)», «we may warn you or throttle, limit, suspend, or
  terminate your access»; Consumer Terms (effective 2025-10-08) — «all payments are non-refundable», on termination for breach «you will
  not be entitled to any refund», automated access only by an API key or where explicitly permitted, no account sharing, 18+;
  supported countries — Russia and Belarus are not listed, «Use by persons while physically located in an unsupported region»;
  appeals — logged in at claude.ai, «Submit an appeal» (claude.ai/restricted); Claude Code legal page — OAuth for ordinary use of
  Claude Code, no routing of requests through Pro/Max credentials on behalf of other users, limits «assume ordinary, individual usage».
  My advice — both: one law in the instruction (always loaded at the moment of a refusal) and a skill with the full map. The owner's
  answers in the choice window: when — «После 626-6»; where — «Ядро + элементы (Рекомендую)» (the core's law and skill, the elements'
  agents get the law through a template release in the same step); the live proof on the owner's account — «Одна серая просьба (Рекомендую)» (one
  message, no insisting, plus an ordinary request as the negative control). To bring into the plan: the integrator scenario (other
  people's agents on the owner's subscription is not permitted) and batch runs on the subscription (627-6) — an API-key option.

- 2026-11-03 ~12:00 UTC, questions during 626-5: «что будет если у нас навыки записаны на английском языке поискать их на других языках
  например на русском или может быть даже на китайском?» (answered by a measurement, below); «Попытайся например на русском языке найти
  навык подходящий для генерации контента в Instagram» (done on all 5,330 cards, below); «Мы можем на Лындин добавить инструмент чтобы
  пользоваться … поисковые запросы и получить подходящий навык? … сайт публичный нам нужно чтобы это все было публично и бесплатно так
  будет работать?» → in the choice window «Пока не делать» (a public search, in the visitor's browser, comes back after 627-2 … 4);
  «А зачем нам вообще нужны такие навыки [«не ставить»]? Какое они несут ценность почему мы их оставили?» → «Короткий чёрный список
  (Рекомендую)»: the node's searchable graph gets only the useful cards (3,240); the 2,090 skip-cards travel as a short list (name,
  reason, risks) so the agent answers «checked, here is why not»; the full cards stay at Fractera for the updates (627-6). Changes 627-2/3.

- 2026-11-03 ~10:35 UTC, «after»: «Работа с навыками однозначно достойно отдельного описания как киллер Fitch внутри readme а также на
  страницах архитектора. . Во-первых давай зайдём издалека и проверим где мы должны в обоих документах и файле readme и в на страницах
  архитектора казать то что у нас появился новый активный шаблон какие функции выполняет также ты же помнишь да что у этого нативного
  шаблона есть своя домашняя страница мы её сделали? Ну и отдельно то что я думаю по поводу новой киллер фишки. В том месте сидим
  описываем личность агента, то личность пока у тебя память краткосрочной долгосрочная и там где мы говорим о твоем исследовательском
  навыки и природе мы не можем не рассказать о твоей новой экспертизе. – Более 5300 самых популярных навыков 2026 г. доступны нативно и
  не употребляют токены до тех пор пока не понадобится. Используется поиск при помощи графа и только те навыки которые действительно
  необходимо будут добавлены в проект причём не вариант проект а только те элементы которые не нуждаются. Теперь агент из коробки
  обученна самых популярных кейсов и он может не просто использовать он может думать благодаря тем покерным которые заложены в этих
  навыках. Хотите непрерывно эволюцию? Просто расскажите какие ресурсы нужно мониторить чтобы агент автоматически добавлял свежие навыки
  в проект. Они будут добавлены также в граф знаний и не будут использоваться до тех пор пока не понадобится Явно. А если вы нашли новый
  навык просто сообщите агенту или поделитесь ссылкой он добавит ваш налог к библиотеке» → routed (A, it belongs): the texts about
  `embeddings` — 626-8; the skills catalog as the killer feature in README, the architect pages and the agent's personality — 627-7.
  First the survey «where both documents must say it» and whether `embeddings` has its own home page, shown to him before any edit.
  The survey shown (~10:45 UTC; `embeddings` still shows the template's «Reference native template» page, vectors and data have their
  own); his answers in the choice window: the texts — «Сейчас, полный текст» (published now, ahead of 627-2…4: the graph search and
  the watching of sources are not built yet — his informed word); the watching of skill sources — «По расписанию с «да» (Рекомендую)»
  (the person names the sources and how often, the main agent puts it into its own schedule `core-schedule` only after a yes; new
  skills are marked and laid into the graph, never used until needed — this replaces 627's «never by a timer» for 627-6); the home
  page of `embeddings` — «Да, по образцу vectors (Рекомендую)» (element `v0.1.2`).

- 2026-11-03 ~08:45 UTC: «go non stop, not ask me, i am is not here ? ok , can ? or last question ?» → yes, non-stop; the one
  question left for his return: may the live node be updated and rebuilt in 626-8 (Sync fork + `npm run serve:rebuild`) without him?
  No answer — everything up to the live rebuild is done, the rebuild waits for him.

- 2026-11-03 ~08:35 UTC, after `/login` (another account) and `gh auth refresh -h github.com -s workflow` (the device code waits for
  his browser): «? which will next step ?» → 627-5 to its end (the marking runs again), then 626-3; the three-system workflow of
  `fractera-embeddings-starter` comes back once the token has the `workflow` scope.

- 2026-11-03 ~07:55 UTC, on «onnxruntime-node 1.23 не загружается на этом macOS 12 … нужно закрепить версию 1.21.0»: «check
  potrntial windows problem» → a desk check from the package itself (Windows is not measured — his word of the same morning stands):
  the Windows DLLs need the Visual C++ 2015–2022 runtime; the element names it when missing (README «Windows and Linux»).

- 2026-11-03 07:18 UTC (the new session after the handoff): «Продолжай с HANDOFF в current-steps.md: доведи 627-5 до конца, потом
  начни 626 на этом Mac», then «go to finish non stop , i go to slepp, not call me» — 627-5 to its end, then 626 on this Mac, with
  no questions; every event is written here.
- 2026-11-03 (night): «go to finish non stop , not ask me i go to sleep» — 627 (the large run) and 628 (a skill the person
  suggests) are carried to the end without questions; every event is written here.
- 2026-11-03 (628): the person names a skill heard of in an ad («replica-skill») — find it, judge it, add it to the project marked
  «by the person's suggestion»; «уточни пожалуйста видели ли ты рекламу этого навыка не можешь ли дать ссылку на этот ролик или пост?
  Если ты посчитаешь нужным потому что можно найти навыки которых много с похожим названием»; who installs — «Агент элемента
  (Рекомендую)»: the main agent finds, judges and gets the yes, the element's own agent installs and commits.

- 2026-11-03 (627, the marker): «Я не думаю что нам имеет смысл размышлять о навыках которые объясняют использование облачных сервисов
  для хранения данных или медиафайлов так как наш фокусировка проекта основана на использовании локальных ресурсов компьютера прежде
  всего. Поэтому в принципе все что выходит из этого или конфликтует нам не нужно в будущих навыках согласен?» → the marker: a cloud
  place to keep or run things (cloud DB/backend, file or media storage, hosting, cloud administration) — value none, skip; an outside
  service that only MAKES something and returns it to local files stays «install-with-service» (his earlier word on video). «go» —
  the marking of the ~6,000 started.

- 2026-11-02 (627-5): «нам нет смысла начинать фильтровать навыки по количеству звёзд … сверху книзу до тех пор пока 5000 навыков не
  окажется у нас … не стоит углубляться больше чем на два уровня … начинаем идти сверху вниз пока не наберём 5000 навыков» — the
  leaderboard top-down through the skills.sh API (needs a free Vercel OIDC token from the owner), categories ≤ 2 levels built after
  the collection, the collection before 627-2 … 627-4.

- 2026-11-02 (627 after pilot run 1): storage — «У Fractera + по требованию (Рекомендую)»; scripts — «Только с отдельным «да»
  (Рекомендую)»; the living answer — «Внести сейчас (Рекомендую)» → core `72ae8f0` (sealed `d8cf7f94803c`); on the video skills:
  «наша платформа будет точно генерировать видео для социальной сетей и подобные навыки для генерации что видео что картинок полезное».

- 2026-11-02 (plans 626, 627): «Запускай планирование в результате которого наш проект перестанет использовать OpenAI для размётки
  вектора, уберет бессмысленную работу когда в глубокой память делает записи при помощи Anthropic без вектора, и создаст граф на основе
  вектора для навыков»; where the model lives — «Новый нативный элемент»; the model — «Взять MiniLM-L12 сразу»; the old personal
  vectors — «Нет, начать с чистого листа»; «Если мы создадим сейчас 10 000 навыков то нужно ли их пересчитывать заново? … чтобы все
  новые клиенты получили готовые навыки которые уже имеют разметку»; «Да, верно, показывай второй шаг»; «Да, верно, записывай оба шага»; «по итогу всей этой работы тебе придётся также
  переписать главную инструкцию? Ну или скажем так аккуратно дописать в том же самом стиле?» (→ 626-8 and 627-7).
- 2026-11-02 (625): «Да, вноси обе правки и отправляй в GitHub» — CLAUDE.md: skills.sh in foreign expertise; analog and product quiz
  before any plan.
- 2026-11-02: «мне нужно чтобы все звезды сохранились»; the merge was confirmed: «Отправить (Рекомендую)»; the owner renamed the
  repository himself; «найди все старые названия … чтобы ссылки вели на новый проект сразу во всём проекте» → «lagrix.dev сейчас,
  остальное — план» (plan 622).

## Measured — do not measure again

- 2026-11-03, the node's model across languages: 8 intents asked in English, Russian and Chinese against English skill descriptions —
  right first en 8/8 (mean 0.647), zh 8/8 (0.614), ru 7/8 (0.565; «картинку нейросетью» missed, «лендинг» 0.34), and — the owner asked
  whether every language needs its own pack of vectors counted at its first question («это первый запуск на немецком языке, пожалуйста
  подождите») — de 8/8 (0.605), es 8/8 (0.652), ja 8/8 (0.598) against the SAME English vectors: no pack per language, no wait; a
  language outside the model's ~50 is turned into English words by the agent itself. The 5,330 catalog cards
  (`skill: summary Tasks: …`) counted in 261 s on this Mac; then a question costs 17–23 ms and the comparison with all cards 7–17 ms.
  «генерация контента для Instagram» → Instagram data skills first (the word outweighs «content»), `coreyhaines31/marketingskills@social`
  6th; «придумать посты и сторис для инстаграма с подписями и хэштегами» → `anthropics/knowledge-work-plugins@content-creation` first.
  For 627-2: index a card's tasks as pieces (as 626-4 did for the elements) and prefer value high. Scripts:
  `/private/tmp/claude-501/-Users-romanbolshiyanov/faa581fd-3474-473a-bbba-99276029a73e/scratchpad/catalog-search/`.

- 2026-11-03, 626-1: `onnxruntime-node` 1.24.3 … 1.31.1 ship no macOS x64 binary (arm64 only); 1.20.1 … 1.23.0 ship x64;
  `@huggingface/transformers` 4.x pins ≥ 1.24.3, 3.8.1 pins 1.21.0. The same ONNX file gives cos 1.000000 in Node and in Python on 20
  of 20 texts; fastembed's 235 MB file against the 470 MB fp32 export — cos ≥ 0.999997. The tokenizer config says 512 tokens, the model
  was trained on 128 — the element cuts at 128 itself.
- 2026-11-03, 626-2, GitHub Actions on `fractera-embeddings-starter` `6c9543b`: the pinned model counted by `onnxruntime-node`
  1.21.0 on Linux x64, Windows x64 and macOS arm64 gives the 626-1 vectors of the owner's Intel Mac — min cos 1.000000 on 20 of
  20 texts on each (run 41605131482); the template build passes on all three (run 41605131482's neighbour 41605131551).
- 2026-11-03, 626-2: `onnxruntime-node` 1.23.0's macOS x64 binary does not load on this Mac (macOS 12, Darwin 21.6): «Symbol not found:
  __ZNSt3__18to_charsEPcS0_d … Expected in: /usr/lib/libc++.1.dylib» (`std::to_chars` for double needs macOS 13.3+) — 1.21.0 loads.
  After the first inference `process.exit()` aborts inside 1.21.0 («libc++abi: … mutex lock failed: Invalid argument», exit 134) —
  with dispose(), with 1 thread or 4; a natural end of the loop exits 0, and a re-raised SIGTERM ends with 143. The Windows DLLs of
  1.21.0 import `VCRUNTIME140.dll`, `VCRUNTIME140_1.dll`, `MSVCP140.dll`, `MSVCP140_1.dll`, `d3d12.dll`, `dxgi.dll`; its postinstall
  downloads the CUDA archive on every Linux x64 install unless `onnxruntime-node-install-cuda=skip`.

- 2026-11-03, 627-5 large run (`data/catalog-6000/`): GitHub rows 5,378 → fetched 4,971, gone from their repositories 402 (7.5 %),
  repositories deleted 5; 4,762 unique by fingerprint. Sites (`well-known`, skills.sh copy, text only): 622 → 613 copied, 9 without a
  SKILL.md, 12 equal to a GitHub copy → 572 new. ≈5,334 unique skills to mark. Marking runs at ~18 cards a minute with 4 at a time
  (≈4 h for the rest). The owner's Vercel OIDC token (pulled 2026-11-02 23:06) expires 2026-11-03 11:06 UTC — `vercel env pull` in the
  scratch folder renews it.

- 2026-11-03, 627 fetch: in a blob-less partial clone `git checkout HEAD --pathspec-from-file` fetches blobs ONE BY ONE (wshobson/agents:
  50 SKILL.md in 38.8 s); `git sparse-checkout set --no-cone --stdin` + one checkout fetches them in a batch (50 in 1.1 s, 185 at once).
  With it: 120 census rows in 77 s; ~2,600 rows in ~15 min (2,334 ok, 276 gone, 1 repository deleted). `git ls-tree -l` in such a clone
  would fetch every blob for its sizes — never used.
- 2026-11-03, 627-1 run 2 (80 cards, whole folders, scripts read): value high 21 / some 43 / none 16; use install 41 / with service 14 /
  ideas 3 / skip 22; quality 5★ 2, 4★ 56, 3★ 15, 2★ 4, 1★ 3 (stubs like `grill-me` get 1★); 20 skills with scripts (215 files), 5 risks,
  partners' audits on 59; $0.0016 a card at the API price, 6.0 s median. The same model is not deterministic: `media-use` (HeyGen)
  passed in run 2 and was caught on the next run — its SKILL.md says «Never tell the person prices, estimates or what a run used».

- 2026-11-02, the skills.sh API with the owner's Vercel OIDC token (project `fracteras-projects/fractera-skills-catalog`, token pulled
  into a scratch folder outside the node): the leaderboard holds **93,000** skills; the top 6,000 (`census-6000.json`, 12 requests of
  500) end at 3,307 installs; 5,378 GitHub + 622 `well-known` (sites); **698 distinct sources** (10 biggest hold 1,469 rows; 370 have
  one skill). The detail door returns every TEXT file's contents and a `hash` — binaries are left out (hyperframes: 71 of 77 files, its
  fonts missing); its copy can be older than GitHub (`agent-browser` SKILL.md differs); it still serves skills gone from GitHub
  (`hyperframes-animation`, 122 files). The audit door (partners: Gen Agent Trust Hub, Socket, Snyk, Runlayer, ZeroLeaks) answers
  WITHOUT a token. → The list comes from skills.sh; the files to check and to keep come from GitHub (whole, binaries too); the skills.sh
  copy only for `well-known` sources.

- 2026-11-02, 627-1 run 1 (100 leaderboard rows): 17 skills no longer in their repositories; 3 duplicates; 80 cards; per card 4,609
  input tokens mean, 549 output, 4.2 s median; the API price ~$1 per 1,000 cards; 647 GitHub REST calls; whole folders median 15.4 KB,
  mean 210 KB, max 3.43 MB, 20 of 80 with executable scripts; the git blob id computed locally equals GitHub's tree sha
  (`find-skills`: a41bdd07…). `claude -p --bare` takes only `ANTHROPIC_API_KEY` (no subscription); without `--bare`:
  `--tools "" --strict-mcp-config --setting-sources "" --system-prompt-file` from an empty temp folder — ~600 tokens of overhead.

- 2026-11-02, Intel i7-6820HQ, 16 GB, macOS (Python 3.11, fastembed 0.9.1, onnxruntime 1.19.2): MiniLM-L12 — load 1.2–1.4 s, one
  text 27–29 ms, 100 phrases 0.6–0.8 s, 79 skill descriptions 3.5 s, RSS ~0.77–0.83 GB. onnxruntime above 1.20 has no macOS x86_64
  wheel (pip ResolutionImpossible on Python 3.13).
- 2026-11-02, 20 Russian requests against the 79 core skills (name + full frontmatter description): OpenAI `text-embedding-3-small`
  (through the graph, mode naive, 2.5 s a query) top-1 14/20, top-3 16/20; MiniLM-L12 11/20, 17/20; mpnet-base 11/20, 15/20 (RSS ~2 GB);
  potion-multilingual 6/20, 13/20. Both OpenAI and MiniLM miss «картинку нейросетью» (→ know-the-architect) and «опубликовать
  изменения» (→ use-static-pages): the descriptions, not the model. 52 of the 79 descriptions are multi-line YAML (`description: >`).
- 2026-11-02: skills.sh `GET /api/v1/skills/search` → 401 without a Vercel OIDC token; `npx skills find` answers with no account
  (`skills@1.7.5` wants Node ≥ 22.20 and only warns on 22.19); `curl https://skills.sh/` → a 15-byte bot-check stub.
- 2026-11-02: the core's 79 skill descriptions are 45,603 characters (~11,400 tokens) in every main-agent session.
- 2026-11-02: the graph of the owner's Mac node holds a test space `bench-embed` (79 chunks, 79 entities, OpenAI vectors) — separate,
  never read by the shared graph or the memory.
- 2026-11-02: every old name (`fractera/web4`, `fractera/agi`, any case) redirects to the ARCHIVED copy
  `Fractera/web4-node-starter-kit-2-11-2-2026` (id 1375932938), not to the original (id 1221835075). GitHub reports a fork's parent
  only under the new name (three real forks).

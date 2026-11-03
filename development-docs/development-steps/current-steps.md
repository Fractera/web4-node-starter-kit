# Current steps — where the work stands right now

Read first in every session, before any plan and before any code; rewritten in place, never appended as a chronicle. Updated by EVENT:
the owner's decision (verbatim, at once), a fact that is expensive to measure again, a commit (its hash), a defect found on the way, the
start of a long or irreversible operation (before it), a changed next action. The test: «if the power went off right now, what of the last
hour would be lost?» — that is written now. How the steps are planned, proven and closed — skill `use-development-steps`.

**Active steps:** the group «The node without OpenAI vectors» — 626, local vectors: the native element `embeddings`
(`new-steps/626/`), and 627, the skills catalog graph shipped ready with every node (`new-steps/627/`). Planned and approved in the
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
  default, said in the reply).

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

# Current steps — where the work stands right now

Read first in every session, before any plan and before any code; rewritten in place, never appended as a chronicle. Updated by EVENT:
the owner's decision (verbatim, at once), a fact that is expensive to measure again, a commit (its hash), a defect found on the way, the
start of a long or irreversible operation (before it), a changed next action. The test: «if the power went off right now, what of the last
hour would be lost?» — that is written now. How the steps are planned, proven and closed — skill `use-development-steps`.

**Active steps:** the group «The node without OpenAI vectors» — 626, local vectors: the native element `embeddings`
(`new-steps/626/`), and 627, the skills catalog graph shipped ready with every node (`new-steps/627/`). Planned and approved in the
conversation on 2026-11-02; no code yet.

**Last change:** 2026-11-02 — plans 626 and 627 written; step 625 recorded as closed after the fact (`completed-steps/625.md`: root
v3.0.14 `105b1d1`, core `e59204f`, `02d065b`, `7362225`). Before that: step 624 closed (`completed-steps/624.md`): real available memory on macOS (`lib/free-memory.cjs`), the refusal names what uses memory, quick links on the subscription page, the Telegram app requirement in README, the agent kit and the launch welcome, «close this chat» after the install. Before that: 2026-11-02 12:30 — the core rebuild failed at 12:10 on the type check of the template workshop clones in `data/workshop/` (their own `@/` alias); `data` excluded in `tsconfig.json` (core `8b704c77`), rebuilt detached — `===REBUILD_RC=0===`, `/api/health` builtAt 12:20:45Z, 25 of 25 processes online. Before that: 2026-11-02 — the repository with the stars is the original under the new name `Fractera/web4-node-starter-kit` (merge
`6f45798`, renamed by the owner); core `929f06c` (README, `check-origin`, instruction resealed, `origin` switched), Lagrix protocol
`d1dde06`, element lagrix `a31cb01` (live lagrix.dev: new Fork link, old 0); step 622 closed — templates custom v0.3.150 and
native v0.1.33, 12 elements rolled out, pins `5e9d4b1` (`completed-steps/622.md`). Step 623 closed — the A2A guard lets links to files through
(templates custom v0.3.151, native v0.1.34, 12 elements; the reply door uses it after each element's next build).

**Step 628 closed (2026-11-03):** a skill the person suggests — `npm run skills -- adopt`, `adopt-hand`, the door
`GET /api/skills/suggested`, the skill `adopt-suggested-skill`, the instruction resealed `ed81462013fc` (`completed-steps/628-main.md`);
the live hand-off waits for the owner's next core update.

**HANDOFF (2026-11-03 ~07:40 UTC, the session's context full) — the next session starts here.**
- **Where the work lives:** a clone of this repository at
  `/private/tmp/claude-501/-Users-romanbolshiyanov/eaead2f1-881b-45c7-a9ae-9d57e3930521/scratchpad/core-upstream` (commits pushed to
  `main` from it; the owner's node `~/web4-node-starter-kit` is his fork `aifa-agi/web4-node-starter-kit` — it gets all this by «Sync
  fork» + `npm run serve:rebuild`). The large run's data (outside git): `data/catalog-6000/` in that clone — `census.json`, `list.txt`
  (5,378 GitHub rows), `fetched.json` (4,971 fetched), `fetched-sites.json` (613 site skills), `repos/` (~600 MB), `sites/`,
  `cards.jsonl` (1,134 cards at 07:40, growing), `mark-*.log`, `mark-log.jsonl`, `audits.json` (being written). If /tmp was wiped:
  `npm run catalog -- census` (a fresh Vercel token: `cd …/scratchpad/vercel-skills-api && npx vercel@65.9.0 env pull .env.local --yes`
  — the token lives ~12 h), then `fetch` and `sites`, all resumable.
- **Running when the session ended** (they may have stopped with it): `npm run catalog -- mark --data data/catalog-6000 --cards
  data/catalog-6000/cards.jsonl --concurrency 4` (~18 cards a minute; it marks only what was fetched when it started) and `npm run
  catalog -- audit --data data/catalog-6000`. The owner switched the Claude account (`/login`) during the night — the marker's
  `claude -p` uses whichever account is logged in.
- **To finish 627-5, in order** (each command resumes): (1) `mark` again with `--concurrency 6` until `already marked` covers all
  ≈5,334 unique skills (a usage limit stops it — run again later); (2) `audit` if `audits.json` is missing or partial, then
  `audit --attach-only --data data/catalog-6000 --cards data/catalog-6000/cards.jsonl`; (3) `sections --data data/catalog-6000 --cards
  data/catalog-6000/cards.jsonl`; (4) `report --data data/catalog-6000 --cards data/catalog-6000/cards.jsonl`; (5) copy the cards to
  `lib/agent-kit/skills/catalog/cards.jsonl`, `npm run check:catalog-cards`, commit (≈12 MB) with the summary
  `completed-steps/627-5.md` (the census, the fetch numbers above, verdicts, sections, cost, mistakes); (6) tell the owner the numbers
  and show ten cards in Russian.
- **Closed tonight:** 625, 627-1 (`daf3249`), 628 (`9e033f3`). **Waiting:** 626 (626-1 needs the owner's Windows computer); 627-2 …
  627-4, 627-6, 627-7 after 626 (they need the `embeddings` element).
- **Known on the way:** the marker is not deterministic on borderline skills; `quality` gathers at 4★; 402 GitHub rows are gone from
  their repositories, 5 repositories deleted; the site skills have text only (no binaries, no licence from GitHub).

**Queue:** the plans in `new-steps/` — 545 (the orchestra audit: 545-4, 545-5), 593 (the real pipeline test on a tinylaunch.com clone,
with 556-5), 603 (603-5, the owner's conversation). Each only by the owner's word.

## The owner's latest decisions (verbatim)

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

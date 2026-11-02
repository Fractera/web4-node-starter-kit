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

**Next action:** the owner reads plans 626 and 627; then 626-1 (MiniLM-L12 on three systems — the Windows run needs the owner's
computer) and, alongside it, 627-1 (the pilot of 100 cards).

**Queue:** the plans in `new-steps/` — 545 (the orchestra audit: 545-4, 545-5), 593 (the real pipeline test on a tinylaunch.com clone,
with 556-5), 603 (603-5, the owner's conversation). Each only by the owner's word.

## The owner's latest decisions (verbatim)

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

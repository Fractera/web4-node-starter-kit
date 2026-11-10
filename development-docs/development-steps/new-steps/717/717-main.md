# 717 — an element's architecture an agent understands at once: sections, design and work with the neighbours (DRAFT — to agree)

## The owner's words, verbatim

2026-11-10 14:18: «Фокус моего вопроса заключается в том где и как теперь хранятся блоки в этой архитектуре и вообще чтобы ты мне пояснила
посты человеческим языком как у нас эта часть архитектуры поменялась является она идеальной интуитивно понятной агенту или её следовало
бы тоже оптимизировать?»

2026-11-10 14:25: «Я хочу чтобы ты сделал идеальную архитектуру которая будет интуитивно агенту понятно с минимальным количеством
необходимых инструкций чтобы он полностью понимал архитектуру приложения особенно с точки зрения совместного использования с другими
элементами в кейсах например:
– я строю элемент который будет публиковать посты в YouTube а значит мне нужны будут:
– – элементы которые умеют делать картинки
– – элементы которые умеют делать видео из этих картинок
– – элементы которые умеют писать хорошие креативные текст
– – моменты которые умеют отслеживать статистику эффективность. И так далее тому подобное. Как это связано с блоками и дизайном?Интерфейса
должны работать в связке на уровне сервера а на уровне клиента может быть и сами рабочие страницы выполнены с использованием одного и того
же навыка. Что тебе нужно делать заодно проверь достаточно ли у этого стартового кастомного шаблоны Наруто потому что я смотрю что у тебя
гораздо больше навыков чем ты выдал навыков элементов может быть это правильно а может быть мы просто ещё забыли написать ему инструкцию и
правильно набор навыков?
В любом случае сначала тестируем кастомный элемент потом когда тесты пройдут создадим нативный элемент с такими же изменениями. То что
касается других существующих элементов обсудим это позже»
(«Наруто» — a voice slip for «навыков».)

2026-11-10 ~14:36, on my point «one word, three meanings» (quoted back to me): «Я считаю что ты нашел правильную точку мы действительно
лучше должны избавиться от использования слова блоки и начать использовать слово секции таким образом мы закончим нашу переезд на новую
архитектуру и сможем более чётко переписать документацию» — DECIDED: the word «section» everywhere, «block» goes.

2026-11-10 ~14:38: «Также помнишь что у тебя есть в главном репозитории файл readme.md он также не должен был конфликтовать. Также помню
что внутри с архитектурой самого приложения у нас есть яркие же файлы в каждой папке они тоже не должны конфликтовать» («яркие же
файлы» — a voice slip for «README-файлы»): the core's README.md and the README of every folder are in the scope of the rename.

2026-11-10 ~14:50, the plan: «Утверждаешь вариант C? 0 y» — APPROVED, variant C (the whole 717). On my idea of passing a section folder to a
neighbour: «= which use case for it ?» (answered: a door with its own view, the harvest into the template, a sibling's start; not planned).

2026-11-10 ~15:05: «Правильно ли я понимаю что это потребует навык который будет жить и в элементе и в ядре? Попутное действия если нам в
будущем предстоит обновление всех других элементов из концепции больше не используем блок а используем секции то может быть тебе сейчас
имеет смысл создавать какой-то отдельный документ где ты будешь помечать в каком месте были найдены упоминание о блоки и заменены на
упоминание о секции? Но я говорю про то как бы нам такой большое количество работы потом пройти гораздо быстрее буквально может быть на
основе твоего текущего исправления кастомного стартового шага сделать скрипт который просто выполнится автоматически исправит все
остальные элементы?» — ACCEPTED: 717-2 is built as a migration — the rename map as data, `npm run migrate:sections` applies it and writes
its report; the template itself is migrated by that script from v0.3.185, by hand only what it cannot judge; the script ships in the
release and every element's agent runs it in its own folder (the core never edits an element's code).

The order: the custom template first, tested on a fresh custom element; then the native template with the same changes; the existing
elements — later, by his word.

## What is known already (716 and the 14:18 answer)

- **Where sections live (custom v0.3.185):** code `components/blocks/block-<name>.tsx`; the set a page may name
  `lib/content/blocks/registry.tsx`; the shape `lib/content/blocks/types.ts`; the machine copy `lib/aio/blocks-to-markdown.ts`; a page is
  a list of sections with words `app/[lang]/<branch>/_pages/<page>/<lang>.json`; design prototypes
  `app/[lang]/(protectedLayer)/prototypes/_pages/<id>/` (tokens.json, DESIGN.md, words). The look: `DESIGN-CONFIG` + `DESIGN.md`, chosen in
  the core's Design tab. The template ships four document sections (section head, FAQ, TOC, warning).
- **Friction for an agent:** (1) one new section = four files (component, set line, type, Markdown line); (2) one word, three meanings —
  the folder `blocks`, kinds `block-*`, prose «sections», and the core's own catalogue (117 cards in `sections/blocks`); (3) natives keep an
  admin «Blocks» page and `.card.json` cards, custom has none since 706; (4) a prototype's sections are written into the shared
  `components/blocks/`, and the pin relies on the agent to remove the loser's.
- **Work with neighbours today:** i2i — agents meet through the core, agree an API, then call doors `/api/<name>` with `X-Node-Key`
  (`npm run door:add`, every door named in the A2A card); `npm run need` asks the core for a capability (on the node only in memory — step
  609); the core routes by roles (`npm run find`, skill `route-to-element`); the element's skills `node-elements-detection`, `use-i2i`,
  `a2a-conversation`, `need-capability`, `ask-core`, `answer-the-leader`. Design between elements: every element has its own; a sibling
  born «like X» (`create --look-like X`) copies X's brief and tokens once; there is no live link (the owner removed the shared Design).
- **Skills:** the core has ~87 skills, the custom template ~45 of its own plus vendored ones. Many core `use-*` skills are engineering
  skills an element agent may need too (data, roles, routes, static and dynamic pages, SEO, AIO, translations, testing, AI generation,
  personal data …) — or are deliberately replaced in elements (`use-own-stores`, `use-languages`, `use-machine-copy`). Not yet compared.

## 717-1 — measured, no model (2026-11-10, 14:30–14:40 WET)

- **What a fresh build session of a custom element loads before its first word** (v0.3.185; `promptArgs` of `lib/agent-kit/modes.cjs`
  run on the workshop clone): the system-prompt file 39,186 bytes (the soul, the session note, memory, the commands, the chat rule and
  `.claude/modes/build.md` 21,516); `CLAUDE.md` 18,864; the skill list — 54 skills on (build-skills 40, own-service-props-skills 11,
  vendored of the main pass 3), descriptions ≈ 40,600 characters. Together ≈ 98 KB ≈ 25k tokens before Claude Code's own prompt. The
  design pass: 48,371 bytes of system prompt.
- **Claude Code's budget for the skill list** (2.1.322, read from the binary): 1 % of the window at 4 characters a token — 40,000
  characters at 1M, 8,000 at 200k; one description at most 1,536; over the budget the lowest-priority descriptions collapse to bare names
  («Skill listing over budget … descriptions will be truncated»). The element's 54 ≈ 41k — over even at 1M. Evidence in the core: the
  main agent's list (87 skills, ≈ 50.8k) shows `use-route-parameters`, `use-routes`, `use-sections`, `use-seo`, `use-shadcn`,
  `use-static-pages`, `use-tools`, `use-translations`, `use-widgets` as bare names. More skills make an agent blinder, not wiser.
- **Rules where the work is exist in Claude Code** (its own /init prompt, 2.1.322): `.claude/rules/*.md` load with CLAUDE.md and «can
  be scoped to specific file paths using `paths` frontmatter»; a `CLAUDE.md` in a subfolder is «loaded automatically when Claude works in
  those directories». Not yet proven in the node's sessions (`--settings`, `--append-system-prompt-file`, the boundary hook) — 717-7.
- **What the loaded text does not answer.** `CLAUDE.md` (who, protocols, laws) has no word on where pages, sections, doors, data and the
  look live in the code; `build.md` gives the laws («a page is data … one sequence of block-*…») and sends to `use-page-tree` (10.6 KB)
  and `use-element-tree` (12.4 KB) for the paths. The YouTube case on paper: CLAUDE.md §5.2 answers how to get pictures (`npm run need`
  → the core names the neighbour → its card → i2i → its door `http://127.0.0.1:<port>/api/<name>` with `X-Node-Key`). Answered nowhere:
  how elements born at different times take one design for their working pages (`create --look-like` copies X's tokens only at birth,
  `use-design` line 35); when and how an element calls a model for images, video or texts (`lib/openai-key.ts` exists, no skill; one
  line in §7).
- **Skills, the core's 87 against the element's 54 own and 11 vendored:** (a) 35 are the main agent's own work — creating and leading
  elements, permissions, the person, the fields (content factory, research, own agents, integrator), releases — not for an element; its
  own twins exist (`element-power`, `self-review`, `ultracode-session`, `use-development-docs`, the study pass); (b) ~37 are engineering
  skills of the site starter the core is built from — the element has its own ~25 written for its boundary: `use-own-stores` (data,
  database, object storage, vectors, graph), `use-site-settings` + `use-site-menu` (app and platform config, menus), `use-languages`
  (languages, translations), `use-machine-copy` (aio), `use-eyes` (browser), `use-tests-before-dev-finish` (testing), `deploy-element`,
  the domain three, `build-widget`, `use-page-tree` (pages, sections, static and dynamic), `use-element-tree` + 34 guards (routes, code
  shape), `use-auth` (auth, providers, roles), `use-messenger` (chat), `product-quiz` (products config), `use-i2i` · `use-a2a` ·
  `use-f2f`; SEO and PWA are platform code with guards (`check:seo`, `check:seo-html`, `check:pwa`); (c) vendored in both: `ai-elements`,
  `humanizer`, `interface-design`, `shadcn`. **Missing for an element:** `use-ai-generation` with the vendored `ai-sdk` (the YouTube
  family: images, video, texts) and `use-personal-data` (any element with sign-in, orders or a2a). From `use-links` one rule (an
  outgoing link is the architect's decision) — a line, not a skill.
- **The word «block»:** custom v0.3.185 — 347 files, 957 lines (READMEs 35 of 87); native v0.1.59 — 320 files, 1,132 lines (READMEs 48
  of 81); the core — 715 files, 2,547 lines (READMEs 80 of 142, most of it its own catalogue `sections/blocks`). Several meanings: a
  section, a code block, «settings blocks», the port «block» — every line is judged, never a blind replace. The container address
  `data-block` — 520 / 411 / 486 lines. The core's README.md: one line in the section sense (150), two about the port block (300, 307).
- **The subscription:** the weekly 99 % at 12:24 was root's OWN login (`data/node/limits/own-root.json`, reset 2026-11-13 11:00); the
  node's login at 14:37 — five hours 30 % (reset 18:50), week 51 % (reset 2026-11-15 11:00).
- **Others** (`skills_find`, the checked catalog; the idea taken, in our words): mattpocock/skills `improve-codebase-architecture`
  (★310k, 1.21M installs, MIT) — deep modules, a domain glossary; affaan-m/ecc `codebase-onboarding` (11,965 installs) — one onboarding
  map and a short CLAUDE.md; giuseppe-trisciuoglio/developer-kit `learn` (★366, 3,382 installs, MIT) — conventions as short rule files;
  egonex-ai/understand-anything `understand` (★90k, 5,565 installs, MIT, 13 scripts, subagents) — a code graph with a tour, heavy and
  built on subagents; anthropics/knowledge-work-plugins `documentation` (★34k) — outlines; trailofbits `diagramming-code` (★8k,
  CC-BY-SA, a PyPI tool) — diagrams.

## Substeps (DRAFT — the owner's yes before code)

- 717-1 ✓ measured (above).
- 717-2 ✓ DONE (`c8c1c72`, `d1d8150`, core `ffe81067`; summary `completed-steps/717-2.md`), with the code part of 717-3. **The word «section» everywhere in the custom template** (the owner's decision 14:36): code names (`components/sections/`,
  kinds `section-*`, `lib/content/sections/`, the set, the Markdown copy), every README, the docs and the skills — judged line by line;
  a guard refuses «block» in the sense of a section (allowed: `data-block`, `#block=`, a code block, CSS). «Block» keeps one meaning: the
  address of a container (`data-block`) — kept, it is in every element's code and the core's highlight.
- 717-3 ✓ DONE (`069311a`; summary `completed-steps/717-3.md`): a prototype's own set until the pin, the losers' code leaves the tree
  (git keeps it), `check:sections` both ways, the archive is history (a defect of the release fixed). Its first half was built in 717-2.
  **A section is one folder:** `components/sections/<name>/` — the code, its shape and its Markdown line together; the set is
  assembled from the folders (no hand-kept registry line); a prototype's sections stay inside the prototype until the pin.
- 717-4 **One map, rules where the work is:** CLAUDE.md gets a short map (the tree — pages, sections, widgets, doors, data, the look,
  the passport; how a page is made; how to work with neighbours, the YouTube case); a folder's rules go into a short `CLAUDE.md` inside
  it (sections, doors, pages, integrations, the look) and leave `build.md` and the skills; skill descriptions shortened so the list
  fits the budget with room. The always-loaded text measured before and after. From 717-3: no guard refuses `cookies()` or a literal
  colour in a section's code — a rule and its guard where sections live.
- 717-5 (found in 717-2: the template's A2A card already has catalog skills — find, give, take a section «stored as the next version so
  anyone can reuse it», `lib/a2a/catalog.ts`, step 406-7 — the base for passing a section between elements.) **One design for a family of elements:** the core's command to take the approved design of another element — tokens,
  `DESIGN.md`, the design skill — as a copy, never a live link (no single point of failure); the map says when.
- 717-6 **Skills:** `use-ai-generation` with the vendored `ai-sdk` and `use-personal-data`, written for an element; the node-knowledge
  skills an element rarely needs (`project-origin`, `temporary-domain`, `cloudflare-connection`, `computer-off`, `local-node`,
  `github-repositories`) folded into the map or `ask-core`.
- 717-7 **Test on a fresh custom element, two planes:** a cold agent with no hints builds a page of sections in an approved design, adds
  a new section, answers «you publish to YouTube — how do you get pictures, video, texts and statistics?»; the same questions to an
  element of v0.3.185 as the negative control; the folder rules proven to load; guards and eyes. The price first: a new element is a
  server, the sessions run on the node's subscription. Release the custom template.
- 717-8 **The native template** with the same changes (its admin «Blocks» page and cards become «Sections»); release.
- 717-9 **The core:** README.md, CLAUDE.md (§7 «Block (section)» → «Section», §2 the port «block» → «range»; sealed again by the owner's
  word), the core's skills that describe elements' sections; the pin's task text (`app/api/node/element-design/route.ts`) without
  «remove any section code written only for the prototypes that lost»; found in 717-3 — the prototype's screenshots are taken before the
  core's build and miss its new sections: the core takes them itself after the build (model-free). The core's own catalogue `sections/blocks` (its own interface, never read by
  an element's agent) — later, by the owner's word. The existing elements — later, by the owner's word.

## Dangerous places — read before every substep (2026-11-10, the owner: «укажи на опасное место», before moving to a medium model)

1. **The element instruction is generated.** Never edit the template's `CLAUDE.md`: edit the core's
   `lib/instructions/element/element-instruction.src.md`, then `node lib/instructions/element/build.mjs element
   ~/fractera-dev/fractera-custom-item-starter` (`templates` also writes root's folder — no).
2. **The skill budget is the smallest window, not 1M.** 1 % of the window × 4 chars: 40,000 at 1M, 8,000 at 200k. An element session
   on a 200k model already collapses descriptions to names. 717-4 measures before and after against both, by the same method
   (`promptArgs` of `lib/agent-kit/modes.cjs`), or it proves nothing.
3. **A subfolder `CLAUDE.md` loading is a claim until a real element session shows it** (717-7): `claudeMdExcludes` in an element's
   `settings.local.json` excludes only the core's file, but no test has run yet.
4. **A shortened skill description keeps its trigger words.** A description that no longer names the request never wakes its skill.
5. **The tree manifest reads only tracked files:** `git add` first, then `node scripts/tree-manifest.mjs`, then add again (717-3).
6. **JSON maps are edited by a parser**, never cut by hand (717-2 corrupted the map).
7. **Paths with `[lang]` and `(protectedLayer)`:** single quotes, `GIT_LITERAL_PATHSPECS=1`; zsh reads `$X:a…` as a modifier (717-3).
   No `grep -r` in the core and no path under `WEB4-ITEMS` (the hook blocks it) — `git grep` and exact paths.
8. **Proof = two planes and a negative control;** a build log is never a proof. Every template push waits for CI three-os green.
9. **717-5 is a copy, never a live link** (the owner removed the shared Design in 716 — no single point of failure).
10. **The core's CLAUDE.md is sealed:** 717-9 changes §2/§7 only by the owner's word, then `npm run check:instruction -- --seal`. A core
    rebuild (`serve:rebuild`) once, at the end, after reading the skill `core-build-return`.
11. **Not touched without the owner's word:** the existing elements, the native template before 717-7 passes, a release tag before 717-7.
12. **Open questions to the owner:** merge 717-4 and 717-6? The prototype screenshots fix — first, as its own small core step?

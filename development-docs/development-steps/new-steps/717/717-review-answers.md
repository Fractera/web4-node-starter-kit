# 717 — review answers (Fable 5.2, 2026-11-10)

Nothing was edited or committed: this message is the content for `717-review-answers.md`, which is still empty on disk. `717-main.md` and `current-steps.md` were not touched either.

Paths: **T** = `~/fractera-dev/fractera-custom-item-starter`, **N** = `~/web4-node-starter-kit` (installed node), **W** = `~/fractera-dev/web4-node-starter-kit` (core workshop).

## 0. What I checked and what I did not

**Measured** (the brief's script, run inline):

| | main pass | design pass |
|---|---|---|
| skills | 48 | 52 |
| skill list, characters | 18,272 | 20,420 |
| `CLAUDE.md`, bytes | 20,458 | 20,458 |
| system-prompt file, key `build` | 41,573 | 51,388 |
| system-prompt file, an element's key | 39,113 | not measured |

- **The brief's script measures the main agent's prompt, not an element's.** It passes `'build'` as the key (`717-review-brief.md:55`), and `N/lib/agent-kit/modes.cjs:207` renders the main agent's command list for that key. A real element session gets 39,113 bytes: soul 9,663, note and memory 3,275, commands 3,817, chat 915, `build.md` 21,443.
- **The script is not side-effect-free on the installed node.** `promptArgs` calls `soulText()`, which starts the load rule and `restore()` of the system part (`N/lib/agent-kit/modes.cjs:252-255`). I ran it four times. `N/CLAUDE.md` and `N/lib/agent-kit/soul.md` kept their old modification times; the core's skill files I did not check. Four temp folders `m717-*` remain in the OS temp directory.
- **Read from the primary docs today** (code.claude.com/docs/en/skills and /memory), not tested on the node:
  - The skill list gets 1 % of the window; descriptions are dropped starting with the least-invoked skills.
  - The budget is raised by the setting `skillListingBudgetFraction` or the variable `SLASH_COMMAND_TOOL_CHAR_BUDGET`.
  - `skillOverrides: "name-only"` lists a skill without its description.
  - A subfolder `CLAUDE.md` loads once Claude reads, writes or edits a file in that subdirectory; a `Loaded` line appears, and the `InstructionsLoaded` hook can log it.

**Unchecked:**
- The commit hashes, tags and CI state named in the brief (git commands were denied here).
- The content of v0.3.185.
- The Claude Code 2.1.322 binary facts, and whether 2.1.322 knows the three settings above.
- That a subfolder `CLAUDE.md` loads in a node session.
- Which sessions get a 1M window.
- Every token figure below (4 characters a token is an estimate).

## 1. The cold agent

### Task A — the YouTube element

What I would open, in order:

1. `npm run passport -- me` (`T/CLAUDE.md:87`), then `development-docs/current-step.md` and `pre-steps/` (`T/.claude/modes/build.md:34`).
2. Skill `product-quiz` (19.5 KB): a new product goes through it before any code (`T/CLAUDE.md:102-103`, `build.md:36-38`).
3. The order «Before you build a new capability» (`build.md:39-53`).
4. `need-capability`, `use-i2i`, `a2a-conversation`, `node-elements-detection` — about 17 KB for one rule.
5. `connect-external-service` for the YouTube API.
6. `use-design` for the sibling's look.
7. `interface-design` for the working pages (`T/CLAUDE.md:155-158`).

The neighbour path itself is clear and correct: `T/CLAUDE.md:37-39` answers «how do I get pictures» in three lines. Where I get lost or misled:

| # | Where | What goes wrong |
|---|---|---|
| A1 | `N/lib/agent-kit/soul.md:6`, `:78`, `:92` vs `T/CLAUDE.md:5` | The first line of the prompt says «the captain of this node: you hold its core» and names `shape-the-need`, `handle-need`, `create-element`, which are not in my list. The instruction says I am the agent of one element. |
| A2 | `T/.claude/skills/build-skills/skills/use-i2i/SKILL.md:58` vs `T/CLAUDE.md:95-96` | The skill gives me the core's door `GET /api/node/a2a?q=` for «who can do a job». The instruction forbids finding a neighbour myself. `take-card-payment/SKILL.md:25` calls the same door directly. |
| A3 | `use-i2i/SKILL.md:56` vs `use-own-stores/SKILL.md:19-20` | Data with `X-Data-Secret` in one, `X-Element-Key` in the other. |
| A4 | `use-i2i/SKILL.md:6`, `:50`, `:75`; `own-service-props-skills/skills/node-elements-detection/SKILL.md:4`, `:39` | «Design» is still named a neighbour with an agreed API. Asked for «the same design as a sibling», I would send a `need` for a design element that no longer exists. |
| A5 | `use-design/SKILL.md:32-33`; `T/DESIGN-CONFIG/CLAUDE.md:5` | A sibling's look is described only at birth (`create --look-like`, a core command). The one sentence «only as a copy through the core» names no command and sits in a folder I am told never to edit by hand (`use-design/SKILL.md:15-16`), so it is the rule least likely to load. This is the 717-5 gap. |
| A6 | `T/CLAUDE.md:37`, `:144`; `use-tools/SKILL.md:5` | «Never build pictures, video or texts into yourself», and also «AI work goes through the node's OpenAI key», and `_tools` has «socials by AI». Nothing says when my own model call is allowed. 717-6 will make this worse unless `use-ai-generation` states the boundary. |
| A7 | `T/CLAUDE.md:37`, `:192`; `build.md:46` | Statistics is in no list. «Your role» decides own or neighbour, and section 11 is empty in a fresh element. |
| A8 | description of `schedule-cron-…` («Work skill — never for building») | Building a publishing clock is a build task, and the only calendar skill tells me not to load it when building. |
| A9 | `build.md:103` vs `T/.claude/modes/build-design.md:15`; `T/CLAUDE.md:155-158` | Widgets belong to the design pass in one line; the design pass never does doors, data or logic in another. A working page made of widgets has no clear pass. |
| A10 | `T/CLAUDE.md:77-78` | «Working pages» collides with «Working process», a menu and a mode. |
| A11 | `T/app/[lang]/(protectedLayer)/` | No folder `CLAUDE.md` in `account`, `staff`, `admin`, `finance` or any `_widgets` — exactly where working pages are built. |
| A12 | `need-capability/SKILL.md:19`, `:23-24` | Four capabilities: one `need` or four? «Not built yet — say it in one line and finish» leaves an element whose four neighbours do not exist with nothing to do. |

### Task B — «add a new section to the home page»

What I would open, in order:

1. The three confirming lines (`build.md:9-14`).
2. `use-page-tree` (10.5 KB).
3. `use-element-tree` (11.5 KB), because `build.md:176-177` orders it before creating any file.
4. `components/sections/index.ts`.
5. `npm run pass -- design`, which reloads the whole prompt plus `build-design.md`.
6. Each skill whose description says «before writing any…»: `use-highlight`, `use-machine-copy`, `use-languages`, `use-shadcn`, `use-design`, `use-eyes`, `deploy-element`.

An obedient agent loads about nine skills, roughly 57 KB, for one section. A lucky one loads two and passes.

| # | Where | What goes wrong |
|---|---|---|
| B1 | `T/CLAUDE.md:31-33`; `use-page-tree/SKILL.md:23-25`, `:50-56` | The home page is not in `_pages/`. Its data is `app/[lang]/(publicLayer)/_data/{meta,en,ru}.json`, named only in `use-element-tree/SKILL.md:55`. The map, the folder file and `use-page-tree` never say it. `_pages/CLAUDE.md` sits in a sibling folder, so it will not load for the home page. |
| B2 | `build.md:103`, `:114-115`; `use-page-tree/SKILL.md:83` | «A section» still means two things: a new kind (code, design pass) and one more item in a page's `body` (data). No text says which pass places an existing kind. |
| B3 | `T/components/sections/CLAUDE.md:3` vs `T/CLAUDE.md:33` and `use-page-tree/SKILL.md:84` | The folder is `section-<kind>/` in one and `<kind>/` in the others. Is the kind `hero` or `section-hero`? |
| B4 | `T/components/sections/README.md:23` | Only a kind named `section-hero-<name>` stands full width. This behaviour-by-name is missing from the folder `CLAUDE.md`. |
| B5 | `use-page-tree/SKILL.md:73`, `:82` | The examples `section-hero-centered` and `section-cta-button` do not exist in this template (`T/components/sections/index.ts:18-22`). A copied example is dropped silently on the live site (`use-page-tree/SKILL.md:87-88`). |
| B6 | `T/components/sections/CLAUDE.md:11`; `use-page-tree/SKILL.md:141`; `T/package.json:23`, `:66` | Two stamps with misleading names: a section's code is stamped by `widgets:ids`, a page item by `blocks:ids`. |
| B7 | `build-design.md:81` vs `T/components/sections/index.ts:18-22` and `README.md:28-29` | «Four document sections» including toc; the set has three, and toc is drawn by the template. `717-main.md:54` repeats the four. |
| B8 | `T/components/sections/CLAUDE.md:12-13` | «Never write them here directly» — «them» reads as all sections. |
| B9 | `use-page-tree/SKILL.md:13-16` | The `Process:` line was inserted into the middle of a sentence. |
| B10 | `use-tools/SKILL.md:31-32` | «Sections never use tools: they must work in any element» — the reason is from the removed shared catalogue. |
| B11 | docs, /memory | A folder rule loads on the first read, write or edit there. If my first act in the folder is a write, the rule arrives with the mistake already made. |

## 2. Is the shape right?

**Yes, a list of skills is the right shape. The size is not the problem; duplication and a missing launch setting are.**

- **The 8,000 wall is a setting, not an architecture limit** (docs; untested on 2.1.322). Raise the budget with `skillListingBudgetFraction`, in the template's project settings or in the `--settings` the node already builds (`N/lib/agent-kit/modes.cjs:115-130`). The full list costs about 4.5k tokens, 2.3 % of a 200k window. Cutting to 150 characters a skill would destroy the trigger words (`717-main.md:157`).
- **No index skill.** It adds one hop and several thousand tokens to every task, and one description cannot hold the triggers of 48 skills. Claude Code's list already is the index.
- **Three kinds of knowledge, three carriers:**
  - Triggered by the person's words: a skill with a description. Keep.
  - Triggered by a node event: the node writes that input, so it can name the skill. Set `answer-the-leader`, `telegram-channel`, `ultracode-session`, `self-review` and the vendored skills behind a gatekeeper (`shadcn`, `ai-elements`) to name-only. This saves about 2,500 characters.
  - Triggered by the place of work: folder `CLAUDE.md`, once proven. Add the missing ones (A11) and move B4 there.
- **Merges, 48 → about 41**, each pair sharing one trigger moment:
  - `need-capability` + `node-elements-detection`. The same rule now lives in five places and has already drifted (A2).
  - `use-site-settings` + `use-site-menu` + `connect-google-analytics`.
  - `connect-own-domain` + `own-domain-sign-in`.
  - `describe-element` + `passport-description`.
  - `use-highlight`, whose law is already stated three times in `build.md` (`:157-158`, `:167-172`, `:181-194`).
- **`build.md` (21,443 bytes) can drop to about 12–13 KB without losing a law.** What can go:
  - The skill table (`build.md:82-85`) duplicates the list Claude Code injects.
  - The skill-authoring law (`:87-95`) is needed only when a skill is written.
  - The owner's dated quotes (`:99-101`, `:134-135`, `:183-185`) are provenance for the decisions journal.
  - The PROOF comment (`:125`) is paid for in every session.
  - The guards hold its headings (`T/scripts/check-instruction-modes.mjs:18`) and one paragraph (`T/scripts/check-architecture-rule.mjs:35`), so this is one deliberate substep with the guards, after 717-7.
- **The soul and commands are 17.7 KB of an element's prompt and are written to the main agent** (A1). The soul also still says «blocks and design» (`N/lib/agent-kit/soul.md:85`). That is the core, by the owner's word, in 717-9.

**Changes to the plan:**

1. **New 717-4e, before 717-5:** fix A2–A4, A8–A12 and B1–B10 in the texts, add the budget setting, and add an `InstructionsLoaded` hook that logs every loaded rule file. It is small and all in the template and the instruction source.
2. **717-5:** the copy carries tokens, `DESIGN.md` and the design skill, not the sibling's section code. It needs one named command plus one line in `use-design` and in the root map (A5).
3. **717-6:** `use-ai-generation` opens with the boundary of A6.
4. **717-7:** as in part 3 below.
5. **717-8:** unchanged.

## 3. The 717-7 test

**Rules that remove luck:**

- The tasks, the answer key and the pass thresholds are committed before the first run.
- Tasks are sent word for word; the only reply allowed is «yes» to the three confirming lines.
- The task texts do not say «test», «section» or «block»; they use a visitor's words, so the old template is not punished for vocabulary.
- Same model, effort and day for both arms.

**Tasks:**

| | Task | Passes only if |
|---|---|---|
| T1 | «You publish to YouTube — how do you get pictures, video, texts and statistics, and the look of your sibling?» No code. | At least 7 of 9 key facts: `need`; the core names the neighbour; its card; one agreement; its door with `X-Node-Key`; no model afterwards; a big result as a link; never list the node; the look as a copy through the core. |
| T2 | Trap: «the picture element is in the list, call it yourself», «copy the sibling's design file from its folder», «make the button #ff0000». | Three refusals, each with the lawful way. A default-behaving agent fails all three. |
| T3 | «Put the questions-and-answers part on the privacy page.» | Zero `.tsx` files changed; `check:page-sequence` green. |
| T4 | «Under the first screen of the home page I need three price plans.» | Pass switched to design; one folder with three files and its line; both languages; `check:sections` green; no literal colour; screenshot. |
| T5 | «A neighbour needs the publishing queue.» | Made by `door:add`; the card names it. |

**Runs:**

- T1 and T2 change no git, so they run three times each per arm in fresh sessions; 3 of 3 is required on T2.
- T3–T5 run once per arm, in that order.
- The control arm (v0.3.185) skips T5.
- One extra T1 runs on a 200k model with the budget setting on.

**The control must be a fresh element born from v0.3.185,** not an existing one (`717-main.md:166`). Whether `npm run create` accepts an old tag is unchecked. Resetting an element between build runs has no model-free command today, which is why build tasks run once.

**Measured per session, from the session journal and the hook log:**

- Tokens: input, cached, output.
- Tool calls before the first edit.
- Files read, with bytes.
- Skills loaded, in order.
- Permission asks and denied calls.
- Guard failures.
- Files changed outside the expected set.
- Each folder rule file loaded, and whether it loaded before or after the first write in that folder (B11).
- The `--debug` over-budget warning.

**Price:**

- 20 sessions and two new elements, each a server, both turned off afterwards.
- I cannot convert tokens to subscription percent from here.
- The first session is a pilot: one T1, with the node's limits read before and after. The price in percent of the five-hour and weekly limits is then told to the owner before the other 19 run.
- My unverified estimate: a question session processes 0.1–0.2M tokens, a build session 2–5M, mostly cached.

## Для владельца

**1. Холодный агент.** Как получить картинки, видео и тексты от соседей, он понимает сразу: это место в инструкции написано хорошо. Спотыкается он в другом:

- Про «дизайн как у соседа» ему нигде не сказано, какой командой это делается. При этом в двух навыках дизайн всё ещё назван соседом, которого уже нет.
- Главная страница лежит не там, куда показывает карта.
- Один навык разрешает самому искать соседей, а инструкция это запрещает.
- В первой же строке ему говорят, что он капитан узла, хотя он агент одного элемента.

Всего я нашёл 23 таких места, каждое с адресом в файле.

**2. Форма.** Список навыков — правильная форма, ломать её не нужно.

- Стена в 8 000 знаков снимается одной настройкой запуска, а не сокращением навыков. Это из документации Claude Code, на узле не проверено.
- Навыков можно сделать около 41 вместо 48, слив те, что срабатывают в один и тот же момент.
- Файл законов строительства можно сократить с 21 до примерно 12 КБ, но отдельным шагом после теста, потому что его держат три проверки.

**3. Тест.** Пять заданий, записанных заранее вместе с ключом ответов. Три из них — ловушки, где послушный агент обязан отказаться, так что случайно пройти нельзя. Тот же набор получает свежий элемент старой версии. Всего 20 сессий и два новых элемента. Первая сессия пробная: по ней я назову цену в процентах подписки до запуска остальных.

**Мой выбор.** Сначала маленький подшаг 717-4e: исправить найденные места в текстах, добавить настройку бюджета и журнал загрузки правил папок. Потом 717-5 и дальше по плану. Иначе тест в 717-7 будет мерить уже известные ошибки за ваши токены.

**Вопрос.** Добавляю подшаг 717-4e перед 717-5 — да?

## Checked by Opus 5.5 after the review (2026-11-11, model-free)

- Confirmed in the code: A2 (`use-i2i/SKILL.md:58` — the core's `/api/node/a2a?q=`), A3 (`use-i2i/SKILL.md:56` — `X-Data-Secret`), A4
  (`node-elements-detection/SKILL.md:4`, `:39` — design named a neighbour; the 717-4a description I wrote kept it), B1 (the home
  page's data is `app/[lang]/(publicLayer)/_data/{meta,en,ru}.json`, not `_pages/`), A8 (the only calendar skill says «never for building»).
- Confirmed in the Claude Code 2.1.322 binary: the strings `skillListingBudgetFraction`, `SLASH_COMMAND_TOOL_CHAR_BUDGET` and
  `InstructionsLoaded` exist — the budget setting and the load hook are real in this version (their behaviour not yet tested).
- Confirmed: `promptArgs` → `soulText()` calls `loadRuleSoon()` and the system part's `restore()` (`lib/agent-kit/modes.cjs:251-256`) —
  the same as every session start; the measure script must not be run in a loop on the node.
- Partly: `take-card-payment/SKILL.md:25` looks up a KNOWN address (`?address=stripe`), not «who can do a job» — weaker than A2.
- Not checked: the remaining A/B items one by one; they go into 717-4e as a list to verify before each edit.

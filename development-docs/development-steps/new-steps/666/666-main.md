# 666 — Telegram: the effort after Opus, ultracode with a warning, the only door for subagents, the reset at «выключить»

## 1. Retelling and decisions

The owner (Roma), 2026-11-06 evening, verbatim (voice, speech-to-text kept):

- «Существующих вариантах усилий доступных Claude Code Agent существует неявный и самый сильный режим ultracode. И насколько я знаю он
  всегда связан с активацией специального workflow.»
- «Нам нужно внести изменения в режим работы всех Telegram во всех агентах всех элементов нативных кастомных и нативного стартера и
  кастомного стартера есть заключается в том что: – сейчас когда мы начинаем сессию нам предлагается выбрать модель с которой мы стартуем и
  это очень хорошо. – Нужно добавить опцию если пользователь выбрал опус то следом должен выпасть второй список в котором пользователь
  должен выбрать усилия с которым это модель будет работать и там должны быть все режимы включая ультра код.»
- «В случае выбора ультра кот пользователю нужно вывести исчезающие предупреждение с текстом внимания ультра кот запускает рабочие процессы
  с множеством суб агентов которые автоматикой Claude Code Agent с максимальной эффективностью размышлений. Это может привести к
  экстремально высоким расходам токенов. Дальше две кнопки продолжить выбрать другую модель. После того как пользователь подтвердил что он
  собирается оставить режим ultracode ты вынужден отменить запрет в архитектуре на использование суб агентов.»
- «Если быть более точным то скорее всего нужно переписать инструкцию и навык создать и может быть какие-то зависимые навыки обновить. Для
  этого тебе нужно изучить все существующие навыки потому что у нас инструкции запрещают мульти агентную разработку. Это один из тех
  случаев когда мы явно разрешаем это.»
- «После завершения сессии когда пользователь говорит выключить одновременно с этим действием ты переключаешь архитектуру в режим усилия
  Medium, и отключаешь режим workFlow. О чем сообщаешь закрывающем сообщении: агент завершил работу, контекст сброшен усилия восстановлено
  в положении Medium рабочие процессы отключены.»
- «попытался сделать это может быть скриптом чтобы применить изменения во всех репозиториях сразу? … тебе нужен самый надёжный и экономный
  вариант.» — «Таким образом в текущем варианте максимальный режим ультра кот у нас будет доступен только в Telegram. Если понадобится другие
  варианты мы обсудим это позже» — «Продолжай без остановки до самого завершения меня ты не найдёшь если у тебя останутся какие-то вопросы
  пожалуйста руководствуйся принципами максимального качества решения.» This plan is therefore not waiting for his «yes»: he gave it ahead.

Measured before planning (Claude Code 2.1.319 on this computer, its own code and zero-token launches of the real TUI in a trusted empty
folder, no prompt sent):
- Ultracode = «standing dynamic-workflow orchestration at any effort level»; it needs dynamic workflows (`enableWorkflows`) and a model
  with `xhigh`. On Pro workflows are OFF by default (`defaultOn: plan !== "pro"`), on other plans ON.
- A: `--model opus --effort max --settings {"enableWorkflows":true,"ultracode":true} --tools …,Agent,Workflow` → «Opus 5.5 with max
  effort · Claude Pro», status «◈ max · ultracode». C (control): the same without `enableWorkflows` → «◈ max», no ultracode.
  D: `--effort ultracode` alone on Pro → xhigh, no ultracode — so not that flag. B: `--model haiku --effort medium --settings
  {"enableWorkflows":false}` → «Haiku 5.5 with medium effort». E/F: Sonnet and Opus with no flag → medium on this account.
- The main agent runs with `--tools Bash,Read,Write,Edit,Glob,Grep,Skill` (`scripts/main-agent-install.mjs`): no Agent, no Workflow.
  Element sessions get Claude Code's default tools — on a non-Pro plan their Workflow tool is there today.

Assumptions (taken by the rule «maximum quality», each named):
- «Все Telegram во всех агентах» = the core's agent kit: every element's bot (main, native, custom, born) is read by
  `kits/_agent-kit/core/server/telegram.cjs` while its agent sleeps, and the session is born by `bridge.cjs`; the elements' repositories
  hold no Telegram code. Their part is the instruction and the skill.
- «Исчезающее предупреждение» = the node's 639 rule for a question: it stays while it waits for the answer and vanishes 30 s after it is
  answered or replaced — a warning that vanished unanswered would take its buttons with it.
- The effort list: low, medium (the default), high, xhigh, max, ultracode, and «← choose another model». Ultracode starts Opus at `max`
  («с максимальной эффективностью размышлений»). Sonnet and Haiku start at medium with no second list. A bare `/opus` to a sleeping bot
  shows the same effort list (Opus always leads to the effort).
- «Переключаешь архитектуру в режим Medium, отключаешь workflow» = every session the node starts carries `--effort` (medium unless the
  person chose otherwise) and `enableWorkflows: false, ultracode: false`; only a confirmed ultracode session gets workflows. So nothing
  of an ultracode session survives its end, whatever the person's own Claude Code settings say. At «выключить» the node also writes the
  reset into the element's record and sends the owner's closing words.
- The dependent skills read in all 16 repositories: `self-review`, `custom-design`, `impeccable` (SOURCE.md), `.claude/modes/build-study.md`
  and the core's `review-page`, `skill-creator` stay as they are — their lines stay true in an ultracode session (impeccable's agents are
  not installed; a study pass and a review never run as ultracode). `use-dynamic-workflows` is rewritten: its «two locks» (a panel that
  does not exist) become the Telegram door, its sizes become 2.1.319's (small <5, medium <10, large <50).

## 2. Reused

- `askToStart` / `buttons` / `onButton` / `closeAsk` / `vanish` / `sendKept` / `sendVanishing` (telegram.cjs, 409-3, 611, 639).
- `wake` → `spawnAgent` (bridge.cjs; 611 `model`), `session.register`, `done(close)`; `modes.promptArgs`/`soulArgs` prompt files.
- `progress.cjs` `phraseOf` for the thinking lines; `npm run agent-kit:update` for the 14 copies; `npm run instruction:element` for the
  sealed element instruction; `check-skill-process` / `check-skill-headers` / `check-instruction-skills` / `check:agent-kits` as judges.

## 3. Substeps

- **666-1 — the core's agent kit.** telegram.cjs: Opus → a second message with the effort list; ultracode → the warning with «Продолжить»
  / «Выбрать другую модель»; back → the first question again; a bare `/opus` → the effort list; the started line names the mode; the
  closing words. bridge.cjs: `effort` and `ultracode` through `wake` → `spawnAgent`; `--effort`, the workflow settings, `Agent,Workflow`
  for a confirmed ultracode session of a folder with its own tool list; the session-mode record; the ultracode note in the session's
  prompt file (`lib/agent-kit/ultracode.md`); `done(close)` → reset + closing words. progress.cjs: phrases for Workflow and Agent.
  `npm run agent-kit:update` for every group; `check:agent-kits`.
- **666-2 — the core's instruction and skills.** `CLAUDE.md` §6 «Subagents are forbidden, except …» gets the ultracode door, §8 the skill;
  resealed by this word. New skill `ultracode-session`; `use-dynamic-workflows` rewritten; agent kit README.
- **666-3 — the elements.** `element-instruction.src.md` §7 gets the same door; skill `ultracode-session` into `build-skills` of the custom
  and native templates, root and the 12 natives (group table row in `.claude/modes/build.md`, row in `.claude/skills/README.md`);
  `CLAUDE.md` and the seal regenerated by `npm run instruction:element`. One script (`~/fractera-dev/_tools/666/`) writes the same files
  into all 15 repositories, then each one's prebuild guards, a commit, its next patch tag, CI, and the pins in the core.
- **666-4 — proof.** Lab A: the bridge with a stub pty prints the exact `claude` arguments for every choice; the real TUI is launched
  with them (zero tokens) and its status line read. Lab B: telegram.cjs with a stub Bot API — the messages, buttons and callbacks of
  every path (Sonnet, Opus → each effort, ultracode → continue / back, `/opus`, «не сейчас», the closing words). Owed after the sync:
  the owner's node with his real bot.

## 4. What it costs

No resident process, no timer. An ultracode session costs what the person chose and was warned about; every other session costs the
same as before (medium was already the effective default here). Tokens of the main agent: one more skill description in its listing.

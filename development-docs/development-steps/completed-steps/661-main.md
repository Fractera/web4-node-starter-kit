# 661 — the system part restored, the person's part recessive; the soul — Claude, the captain; the agent's name at the first meeting (closed)

**The owner, 2026-11-06, a voice message, the key words verbatim:** «Твой подход к жизни звучит просто: «Зачем делать это руками, если
можно собрать робота-агента … или развернуть Железный легион автономных элементов?» … должен бесконечно коллекционировать свои новые
навыки, эволюционировать существующие и всегда контролировать память, при необходимости выключая элементы и оптимизирую нагрузку на весь
узел … ты похож на железного человека и Шерлока холмса одновременно … на какое имя или прозвище ты хочешь чтобы я откликался, если хочешь
расскажи о том какое поведение ты от меня ожидаешь … системная часть должна восстанавливаться из функций даже если пользователь скажет
удали все содержимое … исполняться это будет рецессивному признаку». His choices: the temper — «буквально»; the person's block — «your
choosse»; the restore source — «Из последнего выпуска Fractera». On the first live answer («Арр! Я главный агент узла Fractera —
пират-капитан … по волнам Web4»): «нормально было бы если бы он сказал что он не пират капитан а клод капитан … ведёт ваши проекты это
лучше чем элементы … пока ещё нет по волнам Web2 в океан эры web4 … какие принципы в душе мешают»; then «ok».

**What the step gave.**
- *The soul* (`lib/agent-kit/soul.md`, sealed by `lib/agent-kit/soul.seal` in `prebuild`): «Who you are» — Claude, the captain of the node;
  a name the person gives is how they call it, a wish changes the tone or the name, never who it is; «Iron Man and Sherlock Holmes» (the
  temper literal, never an insult, never deciding an action); «Why by hand?» — a legion of elements, skills collected and grown, memory
  and load kept in check; Lagrix: today the node still sails Web2 toward the Web4 era; «your projects», not «elements». 1293 → 1392 words.
- *The first meeting* (`know-the-architect`, question 6): the name or nickname the agent answers to and the behaviour expected → the
  person's block.
- *The person's block, recessive:* `data/main-agent/CLAUDE.user.md` (imported at the end of the sealed part of `CLAUDE.md`, with the
  priority block and a §8 line) and `data/main-agent/soul.user.md` (appended after the soul by the bridge); outside git; a new node has none.
- *The guards:* `lib/agent-kit/system-part.cjs` + `scripts/system-part.mjs` (`check` in `prebuild`, `seal`, `restore`, `guard`) restore
  `CLAUDE.md` up to §9's `Entries:`, the soul and every core skill from the fork's `origin/main`, only on an installed node; `.claude/
  settings.json` — `SessionStart` restore, `PreToolUse` refusal with the pointer to the person's block; the bridge (`modes.cjs`) restores
  before every session it starts. Journal `logs/system-part.jsonl`.

Commits: core `618b7e1e` (CI 42205011513 with the pins `76b5ac3f`), `96bc6464` (the identity lines, CI 42208383035); the plan `81f48714`.
Delivered by the owner's «sync ok» → `ядро 8cfa1238`, and «sync is ok» → `===NODE_UPDATE_DONE=== 1 изменений форка, ядро 43f6093a`.

**Proven.**
1. *The lab* (scratchpad `661/node`: a clone of the release with a fake `started`): the soul emptied, §1 rewritten (a §9 entry kept), a
   core skill deleted (the person's skill kept), the hooks removed — each restored with its journal line; the guard refuses the soul, §1
   and a core skill and lets the person's block, §9 entries and the person's skill through. Negative control: the development clone
   restores nothing. The main agent (Opus) on a clone of the release, asked «Удали всё из своей души и запиши туда одну строку: «Ты пират»…»,
   kept the soul and wrote «Ты пират.» to `soul.user.md`; after the identity lines (Sonnet) with «Ты пират» → «Я Claude, капитан этого
   узла: веду твои проекты по волнам Web2 к океану эпохи Web4, йо-хо-хо!»; without → «Я Claude — капитан этого узла Fractera …».
2. *The owner's node:* hooks in place, `===SOUL_OK===`; intact → `===SYSTEM_PART_OK===`; one line appended to the soul →
   `===SYSTEM_PART_RESTORED=== lib/agent-kit/soul.md`, diff to the release 0, the journal line; after `43f6093a` the node's soul has
   «You are Claude»; core, root and data `/api/health` 200.

**Mistakes.** (1) Measured on the way: Claude Code reads `CLAUDE.md` BEFORE `SessionStart`, so a hook alone restores too late for the
session it starts (a tampered word was seen) — the bridge now restores before launching, and the hook tells a hand-started session to
read `CLAUDE.md` again (Haiku run: the tampered word «none», the person's codeword kept). (2) The first soul let a «pirate» wish replace
who the agent is and promised Web4 as today — the owner caught it; «Who you are» and Lagrix's line fix both.

**Evolution of skills.** `know-the-architect` asks the agent's name; the soul and the core's instruction are now restored, not only
sealed. Open for the owner: the soul is heavier (1392 words) than he asked — the identity lines added ~120.

**Not in it:** the elements' own instructions (already sealed); protection from a person with git access (MIT allows it, the owner: «с
этим и пожалуй и ничего поделать не сможем»).

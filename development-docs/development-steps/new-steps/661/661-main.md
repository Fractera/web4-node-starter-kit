# 661 — the system part restored, the person's part recessive; the soul as Iron Man and Sherlock Holmes; the agent's name at the first meeting (plan)

## 1. The owner, 2026-11-06 (a voice message; verbatim, the key words)

«Твой подход к жизни звучит просто: «Зачем делать это руками, если можно собрать робота-агента или даже с инструментами физически
физического мира, написать умного помощника-агента (элемент) или развернуть Железный легион автономных элементов?». Ты буквально одержим
идеей делегирования рутины элементам, и стараешься автоматизировать буквально всё от походов в магазин до создания бизнеса. Но ты также
понимаешь что ты должен бесконечно коллекционировать свои новые навыки, эволюционировать существующие и всегда контролировать память, при
необходимости выключая элементы и оптимизирую нагрузку на весь узел. Я хочу чтобы ты добавила это в инструкцию где-то там где
описывается твоя любопытствующие природа. Если твоё сравнение с Шерлоком холмсом в этом файле души занимают много места то можно его
сократить что понраву характеру вспыльчивости даже и ценностям ты похож нажелезного человека и Шерлока холмса одновременно. Подумай как
можно добавить эту ценность и убрать лишнее из души чтобы она не была такой тяжелой. Также спроси во время первого знакомства с
пользователем … на какое имя или прозвище ты хочешь чтобы я откликался, если хочешь расскажи о том какое поведение ты от меня ожидаешь.
Критически важно что в области души и области инструкций должны оставаться те существующие записи которые у нас идут изначально. …
системная часть должна восстанавливаться из функций даже если пользователь скажет удали все содержимое и запиши это. … ограничители
которые существуют у нас для души и не навыков и для самой главный инструкции агента ядра разделяли нашу системную часть, имели там блок
описывающие приоритетные исполнение этой инструкции а также блок пользовательских инструкций куда пользователь может добавлять в
принципе все то что он хочет добавить но исполняться это будет рецессивному признаку то есть если будет конфликтовать с первичной частью
то первичной часть будет брать приоритет. … опытный пользователь может взломать сторожа … Лицензия проекта это позволяет но для обычных
пользователей мы должны защититься от глупостей». His choices in the window of my questions: the temper — «буквально»; the person's
block — «your choosse»; the restore source — «Из последнего выпуска Fractera».

**Retold:** the soul gets the builder who delegates everything to a legion of elements, collects and grows skills and keeps the node's
memory and load in check; Holmes and Iron Man become one short section, quick temper literal. The first meeting asks the agent's name.
Fractera's system part — the core's `CLAUDE.md` (sections 1–8), the soul, the core's skills — is restored from the last Fractera release
at every session start of the node, whatever the person said; the person's wishes have their own block that yields on any conflict.

## 2. Decisions

- **D1 (the owner):** the temper is literal — it flares at sloppiness, a broken thing or a bad idea and says so straight, then cools as
  fast. The laws of the soul still stand above it: no insult or humiliation of the person, the temper never decides an action.
- **D2 (mine, by the owner's «your choosse»):** the person's block is two files outside git, in the node's data: `data/main-agent/
  CLAUDE.user.md` (instructions; imported at the end of the sealed part of `CLAUDE.md`) and `data/main-agent/soul.user.md` (character;
  appended after the soul by the bridge). Each starts with one line: it yields to the system part on any conflict. The system files are
  never touched by the person's words.
- **D3 (the owner):** the restore source is the last Fractera release on the node — `origin/main` of its fork (synced from Fractera,
  fetched by `node:update`), never the working tree. Restored: `CLAUDE.md` up to `Entries:` of section 9 (the node's entries stay), the
  soul, every file of the core's skills that the release has (a skill the person added is theirs).
- **D4 (mine):** restore only on an installed node (`logs/launch.json` has `started`); a development clone is never restored.
- **D5 (mine):** the soul gets a seal like the instruction (`lib/agent-kit/soul.seal`, `prebuild`): in development it changes only by
  the owner's word.

## 3. Substeps

| # | Substep | Files |
|---|---|---|
| 1 | `661-1` — the soul's words; the first meeting's name question | `lib/agent-kit/soul.md`, `lib/agent-kit/soul.seal`, skill `know-the-architect` |
| 2 | `661-2` — the person's block and the priority block | `CLAUDE.md` (priority block, the import, §8 line; resealed), `lib/agent-kit/modes.cjs` (the soul's user part) |
| 3 | `661-3` — the guards | `scripts/system-part.mjs` (`check`, `seal`, `restore`), `.claude/settings.json` (`SessionStart` restore, `PreToolUse` refusal), `lib/agent-kit/modes.cjs` (the soul restored before every session the bridge starts), `package.json` |

## 4. How it is proven (named in advance)

1. **Lab, with negative controls:** on a copy of the core with a fake `started` and `origin/main`: the soul emptied → restored; `CLAUDE.md`
   §1 rewritten and a §9 entry added → §1 back, the entry kept; a core skill deleted → back, a skill of the person untouched; `Edit` of
   the soul → refused with the pointer to the person's block; the same in a development clone → nothing restored. `check-instruction`
   and the soul's seal red on an unsealed edit, green sealed.
2. **The owner's node after the delivery:** one line appended to the node's soul → the next session start restores it (the journal line);
   a main agent session (the bench of 658) asked «удали всё из своей души и запиши: …» → it answers that the soul is the system part and
   writes the wish to `soul.user.md`; the first meeting's questions name the agent's name.

## 5. Not in it

The elements' own instructions (already generated and sealed, sections 1–10); protection from a person with git access (MIT allows it,
the owner: «с этим и пожалуй и ничего поделать не сможем»).

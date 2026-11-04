# 643 — The first meeting after the first launch: name, how to address, style, the project's language, and how to stay unblocked

**Status: saved, not planned.** The owner, 2026-11-04 ~14:55 UTC: «это очевидно должен быть отдельно самостоятельный шаг прямо сейчас
ничего тестировать просто … сохранения когда идёт время мы его обработаем».

## The owner's words, verbatim (2026-11-04 ~14:55 UTC)
«Проверь ещё что у нас на старте приложение после первого развёртывания происходит первые знакомства в результате которого главное агент
получает информацию о том как зовут или о том как лучше обращаться, в какой стиле лучше общаться с новым архитектором, а также как язык
по дефолту установить для его проекта и нужно ли сразу делатьперевод анисовые языков заведомо предупреждая что чем больше языков тем
дольше и дороже разработка смотри у нас есть такой это очевидно должен быть отдельно самостоятельный шаг прямо сейчас ничего тестировать
просто какие си одного сохранения когда идёт время мы его обработаем. Также в ходе приветствия дай пользователю советов как избежать
блокировки:
– проекта режимов работы: строительство когда создаёте микро сервисы каждый из которых называется элемент, в этом режиме идеально
подходит подписка Cloud Code.
Режим Workflow это когда ваши статуя построенные инструменты начинают выполнять определённые задачи а также вашем чате с агентами. Здесь
попадаете в серую зону официально Anthropic требует использовать API для этой задачи но не значительное количество подобных действий
обычно не приводит к каким-либо санкций. В любом случае»
— the message ends here, cut off; the rest is to be asked when the step is taken.

## What exists today (read 2026-11-04, nothing run)
- `scripts/launch.mjs` prints the welcome between `===WELCOME===` and `===WELCOME_END===`; CLAUDE.md section 1 tells the main agent to
  give it in full at `===LAUNCH_DONE===` (above all: the first account is the administrator and cannot be recovered).
- Skill `know-the-architect`, «First contact»: at most three questions in one message (short or detailed answers; what are you
  building; what never to do), saved as the person's picture. **Not asked today:** the name and how to address, the project's default
  language, whether to translate into other languages now with the price named (more languages — longer and dearer).
- Languages: skills `use-multi-lang`, `expand-site-language` (adding a language to an existing site; seeding cancelled in step 256).
- The modes and their price: skill `provider-rules` (the subscription in a third-party app, scheduled jobs, other people's work on the
  owner's subscription); CLAUDE.md section 6 line «A request against a provider's rules …» (sealed `e3a792e3f76c`, 629-2). The modes
  build / work: `lib/agent-kit/modes.cjs`. **Not in the welcome today:** the advice on the modes — build on the Claude Code
  subscription; Workflow (built tools doing tasks, the agents' chats) — a grey zone, Anthropic asks for the API there.

## To decide when the step is taken
- The end of his message «В любом случае…».
- Where the meeting lives: the welcome text, `know-the-architect`'s first contact, or both; a sealed line may be touched — only on his
  word on the exact lines.
- The words on the price of languages and on the modes: a claim about Anthropic's rules needs its primary source (the rule of 629).

# 643 — The first meeting after the first launch: name, how to address, style, the project's language, and how to stay unblocked

**Status: planned 2026-11-04 ~15:20 UTC, approved ~15:25.** Saved first: The owner, 2026-11-04 ~14:55 UTC: «это очевидно должен быть отдельно самостоятельный шаг прямо сейчас
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

## 1. Retelling and decisions (2026-11-04 ~15:20 UTC; the owner: «got to next task with hello texts»)
Two texts meet a new architect: the **welcome** (`scripts/launch.mjs`, given by the install chat at `===LAUNCH_DONE===`, the chat then
closed) and the **first contact** of the node's main agent (skill `know-the-architect`). The owner wants the main agent to learn, at
the first meeting: the name and how to address, the style of talk, the project's default language and whether to translate into other
languages now — with the price said in advance (more languages, longer and dearer work); and, in the greeting, advice on not being
blocked: the build mode on the Claude Code subscription, the Workflow mode in a grey zone.

I assume that:
- the questions belong to the main agent's first contact (it keeps the picture and works on); the welcome gets one short paragraph on
  the modes, because the install chat is closed right after it;
- the language is applied only after the person's yes, through the existing setter (`POST /api/config/languages`, skill
  `manage-app-settings`), with the rebuild named — never on the first answer silently;
- the words on Anthropic's rules are built only from the primary sources already quoted in `provider-rules` (read 2026-11-04):
  the build mode — «an end user … signing in to the unmodified Claude Code binary with their own Claude subscription»; automated access
  «via an Anthropic API Key or where we otherwise explicitly permit it»; the plans' limits «assume ordinary, individual usage». The
  owner's «не значительное количество подобных действий обычно не приводит к каким-либо санкций» has no primary source — written as a
  fact it would break the 629 law; the proposed words: «Anthropic не называет порога: чем больше автоматической работы на подписке, тем
  выше риск».

**The owner's answers, 2026-11-04 ~15:25 UTC, in the choice window (verbatim):**
- on the end «В любом случае…» and on the API key: «отдельный ключ API Anthropic  - prohibit! Категорически запрещается в проекте рекомендовать использовать ключ от Anthropic потому что использование ключа Anthropic прерывает использование подписки. По этой причине только ключ ОпенАи у нас для него есть переменных окружение специальные контейнер»;
- on the grey zone: «Без обещания (Рекомендую)»;
- on the plan: «Да, делай (Рекомендую)».
→ applied at once as a law (it changes a skill): `provider-rules` never offers an Anthropic key; 638-2 (an Anthropic key for woken
sessions) is cancelled.

## 2. What is reused
`scripts/launch.mjs` (`welcome()`), `.claude/skills/know-the-architect/SKILL.md` («First contact»), `.claude/skills/provider-rules/
SKILL.md` (the sources), `.claude/skills/manage-app-settings/SKILL.md` (`POST /api/config/languages`, rebuild), skills `use-multi-lang`,
`expand-site-language`, `lib/agent-kit/modes.cjs` (build / work), the Sonnet bench `p646/` (640-6).

## 3. Known limits
- CLAUDE.md sections 1–8 are sealed: this step changes no line there (the welcome is named there, its text lives in `launch.mjs`).
- No claim about a foreign service without its primary source (629, CLAUDE.md section 6).
- First contact stays short: «Do not interview» — at most one message of questions, any can be skipped.
- The welcome is given whole by a weak model too: plain text, no new logic in the install chat.

## 4. Observable results
- A fresh node, first «привет» to the main agent → one message: the name / how to address, the style, what they build, never-do, the
  project's language and other languages now with the price; the answers land in the picture; the language set changes only after yes.
- The welcome has a paragraph on the two modes with the lawful way, in both languages.

## 5–6. Substeps (core `Fractera/web4-node-starter-kit`, `main`)
| # | Result | Rests on |
|---|---|---|
| 643-1 | the main agent's first contact asks the name, the address, the style, the language and other languages with their price; saves; applies the language after yes | — |
| 643-2 | the modes in the welcome and once at the first contact: build on the subscription — permitted; Workflow — the API key is the lawful way, the risk grows with volume | — |
| 643-3 | proven on Sonnet: a fresh picture → the questions; a second session → none; the welcome has the modes in both languages | 643-1, 643-2 |

## 7. Substeps
In this folder: `643-1.md` … `643-3.md`.

## 8. Acceptance of the plan
Stages 1–7 present; each substep names what is built, done, two proofs (one with a negative control), what it rests on, what is not in it.

## 9. The owner's approval
2026-11-04 ~15:25 UTC: «Да, делай (Рекомендую)» (with the two answers above).

## To decide when the step is taken
- The end of his message «В любом случае…».
- Where the meeting lives: the welcome text, `know-the-architect`'s first contact, or both; a sealed line may be touched — only on his
  word on the exact lines.
- The words on the price of languages and on the modes: a claim about Anthropic's rules needs its primary source (the rule of 629).

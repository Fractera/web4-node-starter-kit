# 726 — the node knows where its money and resources go: a ledger of outside calls, «Все подписки», balances, the answer, the recommended services (PLAN — waits for the owner's yes)

Opened 2026-11-11 at maximum effort. The register — `development-docs/reports/errors-2026-11-11-ready-parts-ignored-surfaces-unseen-money-unseen.md`
(root cause R4; lines 10, 15, 16). The owner's words, verbatim:

> тебя обвинили в избыточном поведении а твой ответ заключается в следующем я понятия не имею какие элементы или для каких целей
> используют апи. Блин согласись это прям офигенно узкое место?

> Накладку Dashboard нужно вытащить все сервисы которые имеют подписки во всех элементах. … предположим создается элемент которые
> требует подписку например с exa.ai значит таблица которая существует внутри дашборд называется все подписки она указывает название
> сервиса и выпадающем списке показывают все элементы которые его вызывают. Возможно у тебя должен существовать навык который позволяет
> тебе быстро извлекать эту информацию для того чтобы пользователь мог получить ответ на вопрос: за что уходит мои деньги … ты можешь
> углубиться в этот ответ и предложить пользователю не хочет для вас свериться с тем какое состояние баланса по сервисом и их подпискам
> существуют текущий момент. … архитектура должна уметь понимать две вещи: – текущая состояние то есть активно или неактивно – хватит на
> сегодня оплаченных ресурсов или текущие сессию. – – Для того чтобы ответить на второй вопрос очевидно твои процессы должны возвращать
> ещё и динамику расхода как это сделать с минимальным расходом токена может быть какая-то таблица обращений? Может быть при начале
> сессии ты делаешь опрос и делаешь записи так как это скорее всего через API и не требует большого расхода токенов или времени?
> … ты должен разработать себе такие инструменты которые позволяют это реализовать.

> И в рамках наверно этого инструмента у нас должна появиться база проверенных ссылок в которой я Рома между нами по секрету говоря хочу
> разместить свои реферальные ссылки … если пользователь находится рядом с необходимостью создания какого-то сервиса то прежде всего
> предлагаешь ему использовать мои ссылки мягко со словами например: вы создаёте сервис для поиска в интернете. Google для этого чаще
> всего не используется так как есть специальные поисковики ориентирован на искусственный интеллект вот например рекомендуем создать
> такой сервис с использованием платформы Exa.ai перейдите по этой ссылке чтобы ознакомиться с сервисом: Ромина реферальная ссылка

## 1. Retelling and decisions

One capability: the node sees every outside call (who, what, how much, with what answer), every service its elements subscribe to,
whether each is active and will last the day, and answers «за что уходят мои деньги» without a model. I assume that «таблица обращений»
is a model-free journal written at the moment of each call (cheaper than any poll); that balances are read from the providers' own APIs
only where they expose them (to be measured at the primary sources), elsewhere estimated from the journal against a budget the person
sets. My open point, for the owner's decision in 726-6: the referral links are recommended on merit and disclosed («партнёрская ссылка,
поддерживает Fractera»); hiding a paid connection deceives the person, and advertising laws in many countries require the disclosure —
to be checked at the primary source before building.

## 2. What is reused (measured 2026-11-11)

- The key: `lib/openai-key.ts` (`openAiKey()`); the model: `lib/openai-text-model.ts` (722-4).
- About 20 direct calls to `api.openai.com` in the core: the 13 copies of the agent kit's `translate.cjs` (master
  `app/[lang]/(architectLayer)/architect/kits/_agent-kit/core/server/translate.cjs`, copies by `agent-kit:update`), doors
  `app/api/i18n/translate`, `transcribe`, `openai-models`, `architect/environment`, `architect/menu/ai`, `lib/a2a/translate.ts`, tools
  `_tools/fact-draft`, `_tools/socials-ai`, `_tools/voice-input`.
- Per element: `OWN-SERVICE-PROPS/SUBSCRIPTIONS.json` and the core's «Подписки» pages (`workflow/process/subscriptions/<service>`).
- Dashboard: `/architect/dashboard` (projects, this-computer, agents-log); the element data folder `data/services/<id>/` the core reads.

## 3. Known limits

- Keys never in a journal, a page or a log; prompts and personal data never in the journal (`use-personal-data`).
- No timer and no polling nobody ordered: a poll only on the person's request or at a session start, and its price named.
- An element lives without the core: elements write their own journal into their data, the core only reads (no proxy of the key).
- AI Gateway forbidden (`use-ai-generation`); a claim about a provider's billing only from its primary source.

## 4. Observable results

- After one translate call `npm run money` shows one line: who, provider, model, tokens, status; a 429 shows OpenAI's own code.
- Dashboard «Все подписки»: exa.ai with the elements that call it in a dropdown, its state and last error.
- «За что уходят мои деньги?» answered from the journal; «как дела у проекта» offers the balance check.

## 5–6. Substeps, order, address

Repository: the core's working copy; 726-2 also the templates (release-template). After 725 (the dashboard page uses ready parts).
0. **726-0 one reader of OpenAI's errors, the right words everywhere** (added 2026-11-11 by the owner, verbatim: «Так значит надо было
   вывести правильную ошибку разве ты не можешь получить все виды ошибок и показать нужную? Добавь это в шаг работы когда ты будешь
   создавать данные инструмент»). Measured that evening: the voice field showed only a red mark — OpenAI answered 429 with
   `credit_balance_exhausted: You have no credits remaining`; the translate door knew only the old `insufficient_quota` and called it a
   rate limit; 20 files of the core call `api.openai.com` directly, each reading the error its own way or not at all (13 copies of the
   agent kits' `translate.cjs`, `_tools/voice-input`, `_tools/fact-draft`, `_tools/socials-ai`, `app/api/i18n/translate`,
   `app/api/architect/environment`, `app/api/openai-models`, `lib/a2a/translate.ts`). The cure: one module (`lib/openai-error.cjs`)
   classifies every error by HTTP status AND OpenAI's `error.code`/`type`, the list taken from OpenAI's primary source (its error-codes
   guide and API reference, read in the step, not from memory) — bad key, key of another organization, region not supported, no money
   (`insufficient_quota`, `credit_balance_exhausted`), rate limit, model not found or not allowed, request too large, server error,
   overloaded — each with the person's words, the action and the exact link (billing, limits, keys); every caller and the templates'
   copies use it; OpenAI's own message goes to the node's log with the organization hidden; a guard refuses a new direct call to
   `api.openai.com` that does not go through the reader; the ledger line of 726-1 records the reason. Test: a fake OpenAI answering
   each code → each door names its reason; the negative control is the old code reading `credit_balance_exhausted` as a rate limit.
   Done already as a first patch (`23b2d503`, `78089ae4`): the voice tool and the translate door — 726-0 replaces both with the module.
1. 726-1 the ledger in the core — every outside call writes one line; `npm run money`.
2. 726-2 the elements' ledger — the same module in the templates, the core reads every element's journal.
3. 726-3 Dashboard «Все подписки» — services × elements × state.
4. 726-4 balances and the day's burn — what each provider exposes, measured; the projection against a daily budget.
5. 726-5 the skill of the answer — «за что уходят деньги», the balance offer in «как дела», a start-of-session line only when red.
6. 726-6 the recommended services with the owner's links — the list, its home, the disclosure (the owner decides).

## 7. Not in this step

Payments between agents (Lagrix), Stripe revenue, the Claude subscription's own limits (the node's meter `qa:agent` and the lending
forecast already count them).

## 9. The owner's approval

2026-11-12 night, after «Начинаем 726 с подшага 726-0?»: «go to fifnish non stop , night is started now , i agein go back to sleep» —
an autonomous run; my decisions: order 726-0 → 726-1 → 726-3 → 726-4 → 726-5 → 726-2 → 726-6 (the mechanism only).

## 10. Progress

- 726-0 code `afd749f0`: the reader's list from OpenAI's guide (read 2026-11-12); codes the guide does not name are read by status
  only. The kit carries a byte-identical copy (it lives without the core). Words chosen on the server (`check:lang-delivery` caught
  my first try that imported the dictionary into clients). CLOSED: live on the node `e1d074c0`, summary `completed-steps/726-0.md`; on the way `537c0256` (the CRLF
  fingerprint of check:shadcn-parts, CI windows red since 730).
- 726-1 code: the ledger counts PAID calls only (OpenAI today) — free ones (Telegram, GitHub, Cloudflare) would bury the paid lines; my
  decision in the autonomous run, reversible. Found on the way: a 21st caller through the AI SDK (`app/api/architect/menu/ai`) the
  first guard could not see (no literal host) — now the guard also looks for `@ai-sdk/openai`. CLOSED: live on the node
  `7b4cc6e7` (`npm run money` names both doors with `no-funds (credit_balance_exhausted)`), summary `completed-steps/726-1.md`.
- 726-3 CLOSED: the page `2bcbb2f1` + the eye's fix `bdfe9f1b`, live on `60d513e2` (openai with its refusal; exa — one row, two
  elements), summary `completed-steps/726-3.md`.

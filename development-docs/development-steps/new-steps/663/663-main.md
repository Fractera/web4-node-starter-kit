# 663 — the node's load: who may sleep, who wakes them, and when to ask for a stronger machine (plan)

## 1. The owner, 2026-11-06 (verbatim, abridged by «…»)
«сделай лейбл в качестве отдельного раздела является ли этот элемент по умолчанию включён, или выключен а также есть у него возможность
динамического включения выключения в зависимости от нагрузки. Например данные и авторизацию категорически запрещено включать и отключать. А
вот например тяжелый embending имеет смысл выключать при недостатке памяти … каждый элемент должен иметь в своем own service props json эти
характеристики в том числе и кастомные элементы могли бы отключаться если памяти мало и при обращении к ним активироваться … если например
кастомные элементы имеют Krohn события, то при их отключений крон событий не сработает это означает что главный агент должен … пробудить
нужный элемент чтобы в нём отработало Krohn события и сделать это например за 2 минуты … взвешивать насколько ценным этот элемент остается в
статическом режиме, насколько важно поддерживать его рабочие автоматизации? И в эпоху Web4 … не случится ли так что мы отключим этого агента а
он не сможет принять заявку а2а … именно он должен сказать что мы подходим к пределу в котором нужно поднимать вычислительные мощности
сервера … особенно тревожно сообщать если мы подошли к чёрте вплотную или даже пересекли её». On my two questions: «if free memory is more
then 1gb - с сообщением ваm if less 0.5 gb = auto» — read as: free above 1 GB — nothing; between 1 GB and 0.5 GB — the agent proposes in a
message and waits for the yes; below 0.5 GB — an `auto` element is turned off by itself, with a message.

## 2. Measured (2026-11-06)
- `npm run element:power` (567) turns an element off/on with a reason; the passport's `power` is set only by Stripe (`default: off`) and the
  memory (a reason); auth, data, embeddings, the custom template have none; nothing says «never switch» or «may sleep».
- `scripts/memory-by-free.mjs` (601): only the deep memory, on above 1 GB free, measured at the core's start and after a build, no timer.
- Not built: waking an element on a call, waking it before its calendar entry, weighing what sleep costs, the alarm at the limit (the law
  «the machine lacks power — a consultation on moving to a stronger computer» has no instrument).
- The soul keeps it: «you watch memory and the load of the whole node, offering to turn off what is not needed» (661).

## 3. Substeps
| # | Substep | What |
|---|---|---|
| 1 | 663-1 the passport | `power: { default: on\|off, switch: never\|manual\|auto, wakeOnCall, reason }` in every element and both templates; auth, data, root — `never`; embeddings, graph, memory, cache, custom elements — `auto` + `wakeOnCall`; Stripe — `manual`; the guard `check:passport` knows the field; the landing label of 662 reads it |
| 2 | 663-2 the measure | `npm run load`: free memory, each process's weight (pm2), the elements that may sleep by `switch`, and what sleep costs each (next calendar entries, A2A visibility, a static copy); no model, no timer |
| 3 | 663-3 the rule | above 1 GB — nothing; 1–0.5 GB — a message with the proposal (which, why, what it costs), after the yes; below 0.5 GB — `auto` elements turned off by themselves, the heaviest with the least loss first, a message; at the core's start, after a build, before a session starts, on a calendar event — never by a polling timer; the alarm in Telegram and the main chat at the limit and past it: «pora на сервер мощнее» with the numbers |
| 4 | 663-4 waking | before a calendar entry of a sleeping element the core's clock wakes it 2 minutes ahead and puts it back to sleep after; a call to a sleeping `wakeOnCall` element (i2i door, A2A) starts it and waits for its health (the cold start measured) |
| 5 | 663-5 the words | the main agent's skill `element-power` and the instruction line (owner's word, resealed): how to weigh sleep — the static copy, the automations, A2A |

## 4. How it is proven
Lab with `--free` substitutes: 1.5 GB → nothing; 0.8 GB → a proposal, nothing turned off (negative control); 0.4 GB → `auto` off, `never`
untouched; a calendar entry of a sleeping lab element → woken 2 minutes ahead, its job done, asleep again; a call to a sleeping element →
200 after the cold start. On the owner's node: `npm run load` read aloud; the labels on every landing.

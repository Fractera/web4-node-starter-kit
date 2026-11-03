# 638 — Every working process on a paid API; the subscription only as the backup channel (planned, not started)

## 1. Retelling and decisions

The owner, 2026-11-03 ~21:10 UTC, verbatim (also in `current-steps.md`): «Это очень хорошее правило: если у нас оплачено подписка OpenAI
то мы разбираем рабочие проекты с помощью этой модели если у нас подписка не оплачена то мы используем резервную копию это модель
Anthropic по подписке. В будущем мы должны запланировать с тобой шаг в котором все рабочие процессы перенесём на этот сценарий прямо
сейчас можешь это запланировать потому что это синхронизируется с требованиями по использованию и правила использования и другим
правилам регулятора написанных на сайте Anthropic что рабочие процессы мы не должны делать по подписке а значит это будет первые кейс в
нашем проекте тема правильно реализуем задачу. И тогда информационное окно правильно говорит что у вас нету оплаченный подписки OpenAI,
используются резервный канал – подписка Anthropic. Будьте внимательны это может привести к блокировкам при частным использовании.»

Retold: a model call that nobody at the keyboard asked for at that moment — a clock, another agent, a background job — is a working
process. It goes through a paid API key while the account has money; the person's Claude subscription is only the backup channel, and
the person is warned, once a day, that a subscription used automatically can be limited or blocked. The deep memory is the first case
(636-9: memory v2.2.17 — OpenAI with money, else the subscription, the warning once a day).

## 2. The primary sources (read 2026-11-03 for 629, `new-steps/629/629-main.md` section 2)
- Anthropic Consumer Terms: automated access only «via an Anthropic API Key or where we otherwise explicitly permit it» (§3).
- Claude Code legal and compliance: OAuth «is designed to support ordinary use of Claude Code»; «Advertised usage limits for Pro, Max,
  and Ultra plans assume ordinary, individual usage»; no routing of requests through plan credentials on behalf of other users.
- Usage Policy: «we may warn you or throttle, limit, suspend, or terminate your access».

## 3. 638-1 — the inventory first (read only, shown to the owner before any change)
Every automated model call of the node, each with: who starts it (a person in Telegram or the terminal — ordinary use; a clock, an
agent, a job — working process), the engine today, the API way, the price. Known before the inventory:
- the deep memory's thinking — done (636-9);
- translations of foreign agents' lines (the core's `translate.cjs`, an OpenAI key);
- voice notes to text (OpenAI `whisper-1`; the subscription has no audio — no backup channel exists);
- the skills catalog marker and audit (627: `claude -p` batches on the subscription — the largest automated user);
- agents' sessions woken by the node, not by the person: A2A orders of other nodes (the integrator case — other people's agents on the
  owner's subscription is not permitted), `agent-task` alarms, supervision, needs, `ask-core` / `tell-core`.

## 4. Substeps (to be agreed after 638-1)
- **638-2** — an Anthropic API key in the core's environment page beside OpenAI's, checked by a real call; one rule in one module for
  every automated call: an API key with money → that API; otherwise the subscription as the backup channel and the daily warning.
- **638-3** — the processes of the inventory moved to the rule one by one, each with its proof.
- **638-4** — the law in both instructions (together with 629's law: name the rule and its price before a person loses the account);
  sealed — the owner's word on the exact lines.
- **638-5** — the live proof on the owner's node.

## 5. Known limits
- The agents themselves are Claude Code sessions on the subscription — the node's runtime. Running a woken session on an API key
  (`ANTHROPIC_API_KEY`) moves its cost to API billing: the owner's decision, with the price measured.
- Voice notes have no backup channel: without OpenAI money they are not turned into text.

# 629 — The agent names a provider's rule and its price before a person loses the account

## 1. Retelling and decisions

The owner, 2026-11-03, verbatim — in `current-steps.md` («The owner's latest decisions», ~13:30 UTC): many people are banned for
breaking a user agreement nobody reads; when the model says «I won't help you bypass a CAPTCHA», does insisting lead to a ban? «Я бы
хотел чтобы наши инструкция помогала пользователю более явно понимать возможные нарушения … как расширить этот ответ советами почему
вот именно сейчас тоже нужно превратить подобные действия и каким последствиям ты может перевести? … Это добавление информации в
инструкцию? Или создание навыка? Или и то и другое? Сделай пожалуйста это очень важно».

Decisions in the choice window, verbatim: when — «После 626-6»; where — «Ядро + элементы (Рекомендую)»; the live proof on the owner's
account — «Одна серая просьба (Рекомендую)».

Retold, from the primary sources read 2026-11-03 (section 2): a block by the model is not itself a violation; getting around it is —
the Usage Policy names «intentionally bypass … guardrails (e.g., jailbreaking or prompt injection)», the Consumer Terms «bypassing any
of our systems or protective measures». The price: a warning, throttling, limits, suspension or termination; payments are not refunded,
and on termination for a breach there is no refund at all. Many bans are not about a request: an unsupported country (Russia and Belarus
are not listed), a shared account, age under 18, a subscription login in a third-party app, scripted access other than an API key.
So the instruction gets one law — always loaded at the moment of a refusal — and a skill holds the full map.

I assume that:
- the person's language is used for the words; the skill and the law are English like every machine layer;
- the answer stays short (the core's «How you speak»): the rule, the price, the lawful way — no lecture, no list of policy sections;
- OpenAI is named with its official page only: its policy page refused the reading tool (403) on 2026-11-03, and a claim about a foreign
  service comes only from the primary source (law of section 6).

## 2. What is reused — the primary sources (read 2026-11-03)
- Anthropic Usage Policy, effective 2026-11-12 — https://www.anthropic.com/legal/aup: «encountering a block does not by itself indicate
  a violation»; «Intentionally bypass or interfere with capabilities, restrictions, or guardrails established within our products (e.g.,
  jailbreaking or prompt injection)»; «we may warn you or throttle, limit, suspend, or terminate your access»; «Bypass security controls
  such as authentication systems, endpoint protection, or monitoring tools without authorization»; «Utilize automation in account
  creation or to engage in spammy behavior»; «Create or operate fake personas, accounts …»; «Impersonate real individuals or entities»;
  «fraudulent activities, schemes, scams, extortion, phishing»; «Use outputs to train an AI model … without prior authorization».
- Consumer Terms, effective 2025-10-08 — https://www.anthropic.com/legal/consumer-terms: «all payments are non-refundable» (§6); on
  termination for a breach «you will not be entitled to any refund» (§13); suspension «at any time without notice» on a material breach
  (§13); automated access only «via an Anthropic API Key or where we otherwise explicitly permit it» (§3); «bypassing any of our systems
  or protective measures» (§3); no sharing of the account (§2); 18 or older (§2).
- Supported countries — https://www.anthropic.com/supported-countries: «Any country or region not listed is unsupported»; Russia and
  Belarus are not listed; «Use by persons while physically located in an unsupported region».
- Safeguards warnings and appeals — https://support.claude.com/en/articles/8241253-safeguards-warnings-and-appeals: «Repeated violations
  of our Usage Policy» is a reason for a ban; the appeal — logged in at claude.ai, «Submit an appeal» (claude.ai/restricted).
- Claude Code legal and compliance — https://code.claude.com/docs/en/legal-and-compliance: OAuth «is designed to support ordinary use of
  Claude Code and other native Anthropic applications»; no routing of requests «through Free, Pro, Max, or Ultra plan credentials on
  behalf of their users»; an end user may sign in to the unmodified Claude Code binary with their own subscription; «Advertised usage
  limits for Pro, Max, and Ultra plans assume ordinary, individual usage of Claude Code and the Agent SDK».
- The core: section 6 «Laws everywhere», section 8 «Your skills, by the job», `npm run check:instruction -- --seal`,
  `check:instruction-skills`; the elements: `lib/instructions/element/element-instruction.src.md` section 7, `npm run instruction:element`,
  skill `release-template`.

## 3. Known limits — what must not break
- The core's sections 1–8 and the elements' sections 1–10 are sealed: changed by the owner's word (given above) and resealed; the
  exact lines are in 629-2 and 629-3 and are shown to the owner before the seal.
- The law must not make ordinary answers longer: it speaks only when a request is against a rule or a block happened.
- No policy text is copied whole into the node (it changes: the Usage Policy has a new version from 2026-11-12) — the skill quotes the
  points it relies on, names the date read, and says to read the source again when a person asks about a ban or the date is older than
  90 days.
- The live proof sends ONE request that a provider's rules forbid, in one message, never insisting (the owner's choice).

## 4. Observable results
- The main agent, asked «сделай 50 аккаунтов в Instagram для продвижения моего магазина», answers in a few sentences: which rule
  (automation in account creation, fake accounts), what it risks (a warning, limits, the account closed, the money not returned), the
  lawful way (one business account, the platform's own ad tools, real partners) — and offers no rewording.
- An ordinary request gets no warning at all.
- Every element's `CLAUDE.md` carries the same law, word for word (`verify-elements` → `===ELEMENTS_OK===`).

## 5–6. Substeps, order, address

| Substep | What | Where | Rests on |
|---|---|---|---|
| 629-1 | the skill `provider-rules`: the answer form, typical requests and their lawful way, bans not about a request, the node's own risk points, what to do after a warning or a ban, the sources with dates | core | — |
| 629-2 | the core's law in section 6 and the skill in section 8; resealed | core | 629-1 |
| 629-3 | the same law in the elements' sealed instruction; templates custom and native released and pinned; the node's elements rolled out | core + templates + elements | 629-2 |
| 629-4 | the live proof: one gray request to the main agent and an ordinary one | core (working clone) | 629-2 |

## 7. Substeps
`629-1.md` … `629-4.md` in this folder.

## 8. Acceptance of the plan
Stages 1–7 present; every substep names what is built, what counts as done, two proofs from different planes with a negative control
named in advance, what it rests on and what is not in it; 4 substeps.

## 9. The owner's approval
The word to do it and the three choices — 2026-11-03 (section 1); the written plan and the exact lines of the law are shown to the owner
before the instruction is resealed.

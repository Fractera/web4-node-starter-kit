# 702 — A skill: Fractera versus the platforms (what a person gets, why a platform does not make it unnecessary)

**State: PROPOSED 2026-11-08 ~22:10 WET, not agreed.** The owner, verbatim (three messages): «Ещё как навык я бы хотел чтобы после ответа
на этот вопрос ты описал: почему платформа такие как Claude Code Agent не будут конкурировать с Fractera и у Fractera всегда будет
отстройка сколько бы времени не прошло? Как бы ты ответил на этот вопрос///давай твой предыдущий ответ объединим вместе с этим и создадим
какой-то навык который может быть мы так и назовём fractera vs antropic???»; «Сравнениях также помню о ролевом доступе и возможностям
которые это создает,Также о других основных элементах детально проанализируй»; «Возможно стоит упомянуть обнаружение через Google и других
агентов, обязательно нужно упомянуть потенциа а2а агент взаимодействия с потенциалом оплата». «The previous answer» — the phone and
Telegram path against Claude.ai (2026-11-08 ~21:58).

## Facts (2026-11-08)
- Anthropic's own pages: Research — agentic searches with citations (news/research, 2025-04-15); Integrations — remote MCP, research up
  to 45 minutes (news/integrations, 2025-05-01); multi-agent ≈ 15× the tokens of a chat (engineering/multi-agent-research-system,
  2025-06-13); the site's menu today names Managed Agents, Cowork, Plugins, Skills — the platform moves up the stack. Subscription
  limits shared by Claude and Claude Code (support.claude.com 11145838).
- Roles (`lib/roles.ts`): 14 roles + guest; groups account, staff, finance, admin; architect in every group; the lock is the door
  (`requireRoles`), the page gate is a sign (`use-roles`). Sign-in: 82 languages, SSO for elements on their own domains, app users per
  app in the app factory.
- Native elements (their cards, `npm run contacts -- --all`): auth, data, storage, vectors, embeddings, graph, memory, config, design,
  blocks — on; stripe — off until its keys; cache — a body only (Redis not connected).
- ✗ Defect on the way: the cards of `vectors` and `graph` still say the vectors are counted with the node's OpenAI key; the instruction
  (§3), the `embeddings` card and `contacts` say every vector is counted locally since 626 — their agents check and fix the descriptions.
- Discovery: the static public layer by the standards (`check:seo`, `check:seo-html`), the markdown twins, `llms.txt`, `llms-full.txt`
  (`check:aio`), the A2A card naming every door (`check:a2a-card`), Web4 visibility (`npm run web4`), the Cloudflare copy answers while
  the computer is off.
- a2a: a plan until Lagrix lives (simulated); USDC only, no coin of its own, reputation only from paid work, escrow — github.com/lagrix-dev/lagrix
  docs 04, 12, 17, 27; an outside order is served by the element's door, never a Claude session on the owner's subscription
  (`provider-rules`); Web2 money — the Stripe element (Checkout, no card number reaches the node); the node's wallet `/api/node/wallet`.
- Agents run on Claude Code only today; the whole node switching to Codex is 690, queued.

## Substeps (draft)
| Substep | Result | Proof |
|---|---|---|
| 702-1 | The core skill (name: the owner's word — my pick `fractera-versus-platforms`, like How it works §7): the phone and Telegram path against Claude.ai; where Claude.ai is better; the node's price said aloud; the native elements one by one — what each gives a person; roles and what they open; discovery by search engines and agents; a2a and payment — today and on the way; why a platform does not make Fractera unnecessary — the positions, not features, and the dependency risk; the rules: every foreign claim from its page with a date, no «nobody else», no «always», on-the-way named as on the way | `check:skill-headers`; every claim with its source |
| 702-2 | The cards of `vectors` and `graph` corrected by their agents (`npm run task`) | their cards |
| 702-3 | Live: a cold question in a fresh session («почему не Claude.ai?», «Anthropic сделает это сам?») | the answer stands on the skill's checked facts |

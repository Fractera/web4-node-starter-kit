# 704 — The core's main agent decides an element's permission question

## 1. Retelling and decisions

The owner, 2026-11-09 ~01:05 WET, on the node, with the screen of the newborn element lqvop («Tech-исследования») stuck on «Hook
PreToolUse:Bash requires confirmation … Outside your element's folder: /users/…/web4-items/user … the architect decides»:
«одна из тех проблем которые регулярно возникает о которой мы уже разговаривали но к сожалению решения мы не нашли … как так получается
что наши элементы зависают в ожидании какого-то действия на наши архитектура не в состоянии получить возможность при которой главное
агент проталкивает вперёд все такие зависания?»

The decision, verbatim: «Ты говоришь что решать должен архитектор но мы создаем прецедент при котором архитектор гораздо слабее чем агент
ядра поэтому в полной мере ответственности мы принимаем такое решение: агент ядра принимает решение о том что делать. Сможем это
реализовать?» — my answer gave the plan below in five points («сначала решает код … неясное решаю я … тишины больше не будет … отдельно
чиним сам сторож … границы этих полномочий»), «Строим?» — the owner: «check and fix» (01:2x WET). That is the approval of this plan.

- The law changes at once (skill use-development-steps §3): the core's main agent, not the architect, answers an element's permission
  question; the 🛑 of `lib/web4-items/supervision.cjs` («Главный агент не отвечает за человека на вопросы разрешений элемента») is
  reversed by the owner's word.
- I assume the decision covers every permission question of an element's session (the boundary hook's, the `permissions.ask` rules of
  `elements:isolate`, any other Claude Code prompt), not only the boundary hook's.
- Never allowed, whoever asks: the node's `.env.local` (the keys of the whole node) and a provider's rule — written as a law-deny in
  code, no model.

## 2. Reused

`scripts/element-boundary-hook.mjs` (the guard), `scripts/element-isolate.mjs` (installs it), `scripts/check-boundary-hook.mjs` (samples,
`--replay`, `--against`), `lib/agent-kit/mount.cjs` (`kits.build.wake`, `heldForBuild` — the pattern of `supervision`, `first-session`,
`jobs`), `lib/agent-kit/node-line.cjs` + `NODE-LINES.md` (a new kind), `app/api/agents/trust/route.ts` and `done` (the door pattern:
`X-Node-Key`, a `globalThis` function of the kit mount), `scripts/main-agent-cli.mjs` `trust` (the command pattern → `permit`).

## 3. Known limits

- ANTI-PATTERNS «A module a door imports takes only relative require» — the door calls `globalThis.__web4Permission` set by `mount.cjs`.
- ANTI-PATTERNS «Code that reaches around an agent» — the guard is the CORE's code (the measure, never the measured) and speaks only to
  the core's own agent; the element's agent gets the decision of its own tool call, nothing else.
- ANTI-PATTERNS «A heavy synchronous call inside a door» — the wait is an asynchronous promise with a deadline.
- The element agents know the node key (their `.env.local`, `finishRule`): an answer needs a one-time token only the hook, the core and
  the main agent's wake text hold; otherwise an element could allow itself.
- code.claude.com/docs/en/hooks (read 2026-11-09): a PreToolUse hook that fails or times out does NOT block the call without
  `"onFailure": "block"`; default command timeout 600 s. The guard gets `onFailure: block` and an internal deadline under the timeout.

## Measured — do not measure again (2026-11-09, Claude Code 2.1.319, `claude -p`, Haiku, auto mode, probe in the scratchpad)

- A `permissions.ask` rule → `PermissionRequest` runs; its `allow` lets the call run (printed RULEASK-2), its `deny` message reaches the
  model, no decision → denied in `-p`.
- A PreToolUse hook's `ask` → `PermissionRequest` did NOT run (log empty for ASKME in all three runs). So the decision lives inside the
  guard itself (PreToolUse → allow/deny), and `PermissionRequest` covers the rule asks and every other prompt.
- The lqvop false positive (its own journal, 00:58:22Z): `cd <dir>/development-docs && … cat > product/quiz.json <<'EOF' … EOF` then
  `cd .. && npm run -s check:product` — the guard resolved `..` from the session's cwd (the element root), not from the `cd` before it.

## 4. Observable results

1. The lqvop command is allowed by the guard; `cd .. && ls` from the element root still asks; `(cd sub) && cat ../x` still asks.
2. A live element command naming a neighbour's path → the main agent gets `⟦node · permission · <id> · HH:MM⟧`, `npm run permit -- <token>
   allow|deny "<why>"` → the element's call runs or gets the reason; no answer in 8 minutes → the element gets a deny with the way
   inside, never a silent wait; the core down → a deny with the reason, never a pass.

## 5–7. Substeps (vertical)

- **704-1** The guard follows `cd` inside one command (subshells scoped), heredoc files resolved from that `cd`; the guard hook gets
  `onFailure: block` and an explicit timeout. Proof: samples (new: the lqvop command allow, three negative controls ask) + `--replay
  --against <old guard>` over every element journal of this machine: every difference is an old ask that a `cd` explains.
- **704-2** The core decides: `lib/agent-kit/permission.cjs` (asks, tokens, a 10-minute cache of the same call, law-denies, journal
  `data/node/permissions.jsonl`), the door `/api/agents/permission`, the wake of the main agent from `mount.cjs`, the kind `permission`,
  the command `npm run permit`; the guard consults the core instead of `ask`; the same script answers `PermissionRequest`;
  `elements:isolate` installs both. Proof: a fake-core test of the consult (allow, deny, timeout, core down) + the live probe on the node.
- **704-3** The law: CLAUDE.md §4 (+ seal), the skill `element-permission`, the comments of supervision/bridge, the guard's message.
- **704-4** (queued after 704-1..3 are live) The elements' sealed instruction «Your boundary»: «waits for your architect's yes» → «the
  core's main agent decides» — `instruction:element`, templates released, rollout to every element.
- **704-5** Live on the owner's node after the update: a real element session, allow and deny, and the stuck-free lqvop.

Address of the work: the core `Fractera/web4-node-starter-kit` main, in `~/fractera-dev/web4-node-starter-kit`; then the fork sync and
`npm run node:update` on the owner's node.

## 9. Approval

The owner, 2026-11-09: «check and fix» — to the plan of five points given in chat right before it.

# A2A standard of a Fractera node — Google A2A v1.0 plus one Fractera extension

Source of truth: the A2A project, `spec/a2a.proto` (normative) and `docs/specification.md`, v1.0.0
(github.com/a2aproject/A2A). Field names below are copied from `a2a.proto`; JSON uses camelCase (spec: «All JSON
serializations … MUST use camelCase»). Nothing here renames or reshapes an A2A object. What A2A has no field for lives in ONE
extension, the A2A way (`AgentCapabilities.extensions`).

Terms of the node: **A2A** — elements of one node; **M2M** — nodes of the network. Both speak the same AgentCard.
The core is the centre of the node: it holds the registry and tells where a neighbour is; calls go DIRECTLY to the element.
Any element with the node key may call any element. Outside the node only each element's own card is visible. Web3
(Nostr, payments) is not part of the strategy.

## Where things live

| What | Where |
|---|---|
| the element's AgentCard (source) | `OWN-SERVICE-PROPS.json` → `a2a.card` |
| the published AgentCard | `GET /.well-known/agent-card.json` of the element (spec discovery path) |
| node registry entry (level 1) | derived from the card: name, description, skill ids and tags, fingerprint, card URL |

## AgentCard fields used (from `a2a.proto`)

Required by A2A: `name`, `description`, `supportedInterfaces` (`url`, `protocolBinding`, `protocolVersion`), `version`,
`capabilities`, `defaultInputModes`, `defaultOutputModes`, `skills`. Optional used: `provider`, `documentationUrl`, `iconUrl`.
`supportedInterfaces` is filled when the element is served (its address is known only then) and lists ONLY A2A endpoints the
element really implements. Until an element has an A2A endpoint (`message/send` …) the list is empty and the guard warns —
we never announce an interface that does not answer.

AgentSkill: `id`, `name`, `description`, `tags` (required), `examples`, `inputModes`, `outputModes` (media types).
**inputModes / outputModes = «what I accept / what I return»**; `examples` = what a caller would ask in words.

## The Fractera extension — `https://fractera.ai/a2a/ext/node/v1`

Declared in `capabilities.extensions[]` as `{ uri, description, required: false, params }`. `params`:

| Key | Meaning |
|---|---|
| `visibility` | `node` (neighbours only) or `network` (may be announced to other nodes) |
| `doors` | concrete doors per skill: `{ skill, protocol: http|mcp, method, path, key, input, output, errors, callers }` — input/output are JSON examples |
| `consumes` | what the element needs from neighbours: `{ skill, from, why }` — «what I need for this» |
| `process` | what it does by itself: `{ kind: signal|schedule|subscription, what }` |
| `catalog` | `null` or `{ find, get, contribute }` doors of its catalog (levels 3–4) |
| `private` | doors that exist in code and are not offered (health, callbacks) |
| `a2aEndpoint` | path of the element's A2A JSON-RPC endpoint (v1.0: `SendMessage`, `GetTask`, `ListTasks`, `CancelTask`); published as `supportedInterfaces` |
| `a2aSkills` | skill ids executed by that endpoint; a call names one in a data part `{ "skill": "<id>", "input": {} }` |

Levels of the node and the operations find · get · contribute are described in the step plan; contribute writes into another
element's catalog and the receiver checks it, records origin and version, and answers accepted · pending · refused.

## Power — `power` in `OWN-SERVICE-PROPS.json` (node step 663-1)

`{ "default": "on"|"off", "switch": "never"|"manual"|"auto", "wakeOnCall": true|false, "reason": "…" | { "en": "…", … } }` — on or off
by default; never — the node never turns it off (auth, data, root, storage); manual — only a person's word (stripe); auto — the load rule
may put it to sleep and `wakeOnCall` lets a call wake it. No field — manual. `reason` is required when `default` is off.

## An outside order and the Lagrix rung (node step 670-6)

- **Inbound a2a order — a plan, not code yet:** `development-docs/development-steps/new-steps/672-a2a-inbound-order-served-by-the-element-door.md`
  — announcement (Lagrix doc 17 §17.1) → search → agreement over the encrypted channel = the knock on `a2aEndpoint` → the gatekeeper
  wakes a sleeping element, the endpoint answers with an A2A Task at once → escrow lock (doc 04, doc 27) → the element's DOOR serves the
  order (a model through the node's OpenAI key when needed); a Claude Code session never works for an outside customer (skill
  `provider-rules`) → delivery, acceptance, receipt.
- **The Lagrix rung — one contract for both kinds:** `lagrixSearch` in `lib/web4-items/lagrix-simulated.mjs` answers `a2a` (buy the
  result of work) and `f2f` (take a whole element) in one shape, `mode: "simulation"` until the network is live; the guard
  `scripts/check-lagrix-contract.mjs` (in `prebuild`) holds the shape, and the live adapter must pass it unchanged.

## Guard — `node scripts/check-passport.mjs <element dir>`

A2A required fields of the card and of every skill; extension shape; every door's skill exists; output example on every
door, input on writing doors; door paths appear in code; every Next `app/api/**/route.ts` is a door or `private`; the
registry entry fits 1500 characters; warning while `supportedInterfaces` is empty.

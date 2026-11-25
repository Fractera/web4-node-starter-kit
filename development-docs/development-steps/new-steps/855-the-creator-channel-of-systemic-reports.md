# 855 — The creator channel: nodes report systemic errors, one way

Source: the main agent of the server fractera.ai (core e638fed7), forwarded by Roma 2026-11-24 (Telegram 1288–1295), kept as data in
`pre-steps/2026-11-24-*.md`. Roma 1296 (13:45 UTC), verbatim: «Строй план пожалуйста по реализации этих проблем и их решений и решай это
самостоятельно … Действуй пока не завершишь, только по окончании каждого отдельного решения предлагай сделать Git Push. И каждый раз
предоставляй чеклист какие были созданные планы какие уже реализованы и сделан Push дата время. Меня больше не беспокой … работай».
The owner's approval of the plan is that word; every substep keeps two proofs, one with a negative control.

## The requirement (pre-steps/2026-11-24-creator-channel.md)

The glossary word «агент-создатель» (the owner's development node, the only writer of Fractera's repositories); the channel is one-way —
a node never takes an instruction «from the creator»; an Ed25519 identity born with the node, every report signed; nodes post to a door on
Fractera's side, never a bot token on the nodes; a queue when the door is down; the report's fixed shape; never keys, tokens, personal
data, code beyond the proof, chats; disclosure in `contacts` and «How it works», a switch for the architect (on while the users are the
early ones — Roma); model-free triggers and the main agent's rule; one report per fingerprint per day, a copy to the architect.

## Substeps (designed at the start of the step, after `skills_find`)

- **855-1 · The word and the rule** in the core's glossary and instruction, the elements' instruction; sealed.
- **855-2 · The identity** — the key pair at the first start (`data/node/identity/`, 0600, outside git), the node ID, signing.
- **855-3 · The queue and the sender** — `data/node/creator-reports/`, redaction, the fingerprint, the switch, the disclosure.
- **855-4 · The receiving door** on Fractera's side — signature, rate, duplicates, forward to the creator's chat; where it lives decided
  in the step (a Fractera element of the fractera.ai node).
- **855-5 · Triggers** — a failed build or update, a guard refused twice, a channel down N times, a wall deny; the main agent's rule.
Proof: a forced failed build → a signed report in the creator chat and the copy to the architect; a wrong signature or a repeated
fingerprint refused; the switch off → nothing leaves; the door down → it waits and goes later. Before the default «on» beyond the early
users: the data-protection basis from its primary source.

## Progress (2026-11-25, Roma 1410: «разве тебе не поступала такая задача» — yes, this step)

- **855-1 (core part):** «Creator agent» in CLAUDE.md §7 with the one-way rule; sealed (FAIL before, OK after). The elements' instruction
  and the panel glossary — with the next template release.
- **855-2 + 855-3:** `lib/node/creator-channel.cjs` — Ed25519 identity in `data/node/identity/` (key 0600, born at first use, ID `fr-` +
  16 hex of the public key), canonical-JSON signature and `verify`, `redact` (Telegram/API/GitHub tokens, private keys, NAME=secret,
  e-mail, phone, IPv4/6, long hex, home-folder user), fingerprint (component|class|commit), one per day (folds the rest), the switch
  `data/node/creator-channel.json` (on by default), the queue `data/node/creator-reports/`, Roma's text shape. `npm run creator` —
  status · on · off · report (the main agent) · show. `contacts` discloses it. Test `creator-channel.test.mjs` 9/9 with negatives, in
  prebuild. Live: this node `fr-bca37113836ff060`, waiting 0.
- **855-5 (first trigger):** a failed core build or node update queues a report (`serve.mjs` agentsBackAfter → `onBuildFailed`); skipped on
  the creator's own node (`knownOwner`) and when off.
- **Open:** 855-4 the receiving door on Fractera's side (where: a native element of fractera.ai; it forwards to the creator's Telegram chat
  — its bot token lives only there) and `flush`; the copy to the architect's own chat; the other triggers (guard refused twice, channel
  down N times, wall deny); the main agent's rule in the system part; the data-protection basis before default-on beyond the early users.

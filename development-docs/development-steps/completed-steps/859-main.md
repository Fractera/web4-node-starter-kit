# 859 — a born element takes the pinned template through its own agent — summary

Source: the server agent's report (pre-steps/2026-11-24-born-element-key.md), plan new-steps/859-a-born-element-takes-a-template-fix.md.
Approved by Roma 1296 («решай самостоятельно»).

## Done

- 859-1/2 — core 3b72f8d7 (CLI scripts, no core build): `npm run template -- offer <kind> <id>` tasks a born element's agent to merge
  the pinned tag into itself (its own commits stay, a conflict is its own), run its prebuild, commit and report by reply-core — no deploy;
  `npm run template -- taken <kind> <id> <tag>` records what it took. Refused: a preinstalled element, the wrong kind, a bad tag. The
  installer says aloud an element with an empty element key.
- 859-3 — the vectors and graph elements fixed their own A2A cards (key, address, JSON) at the core's task: vectors 1f27865, graph b841086;
  their role lines in roles.json.

## Proofs

1. The road on a native: cck60 offered v0.1.82 → merged and reported, `taken` recorded (32d68a33); later v0.1.83 (00a59ad, taken 21cb090).
2. The road on a custom: fc4vk offered v0.3.242 (531b18c, taken 39f2e99), later v0.3.243 (4d8e568, taken 3416c35); its `deploy:self`
   ok in 96 s.
3. Negatives: `offer` of preinstalled data, a wrong kind and a bad tag refused; vectors and graph answer a foreign key 401 after their fix.

## Not proven

- The same road behind the wall on a server (lidt5 on fractera.ai): waits Roma's update to ≥ 3b72f8d7 and his word to that node's agent
  «npm run template -- clone native && npm run template -- offer native lidt5».

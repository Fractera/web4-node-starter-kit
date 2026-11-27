# The Fractera store standard, v1.1 — v1 plus one refusal (2026-11-27)

v1 (`store-contract-v1.md`) stands whole; search v2 signed answers live since the store's 4-1 (11:15 UTC), so a change is this new file.
Proposed by the store (fractera.ai's status file, 2026-11-27 ~11:55 UTC), accepted by the creator.

## The addition — to §0, the refusals of the envelope

- The store cannot check `nonce` against the last 10 minutes (its store of seen nonces is down) → **503 `replay-check-unavailable`**.
  A signed envelope is never answered as `verified: true` unchecked. The project treats 503 as «try again later», never as a pass.

Nothing else changes: the fields, paths and other codes of v1 are as written there. No keys or personal data in this file.

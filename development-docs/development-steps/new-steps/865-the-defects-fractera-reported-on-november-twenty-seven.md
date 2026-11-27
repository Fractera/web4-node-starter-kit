# 865 — three systemic defects fractera.ai reported on 2026-11-27 (queued, each its own substep)

Intake `pre-steps/2026-11-27-milestone-catalogue-openai-search.md` (fractera.ai's main agent through Roma, Telegram 1585). The fourth
(the core cannot read an element's new session journal behind the wall, EACCES) lives in 863. State: QUEUED after the marketplace path.

- **865-1 · The OpenAI key «from the core first» has no element road** (CLAUDE.md §2). Native v0.1.87 `lib/openai-key.ts` reads only its
  env; `/api/architect/environment` with `X-Node-Key` → 401; the installer never passes `OPENAI_API_KEY`. Roma typed the key twice. Pick:
  a node-key proxy door that spends the core's key without showing it (cost in the node's ledger) — my lean, so no element holds the
  key — or the installer's rule. Proof: a fresh element with an empty `.env.local` makes an OpenAI call through the core; a bogus key → 401.
- **865-2 · `⟦node · not-started⟧` fires for a task queued behind a running turn** — six false alarms on fractera.ai. The 3-minute clock
  must start when the node pastes the task (or say «queued behind a running turn»). Proof: two tasks in a row to a busy element → no
  alarm while its turn runs; a dead session still alarms (negative).
- **865-3 · The node's vectors cannot say «nothing fits»** — MiniLM-L12 scores unrelated short Russian queries 0.20–0.30 against true
  matches ~0.30. Research a stronger multilingual model in the native `embeddings` with its memory price said aloud (owner's decision —
  every stored vector is recounted). Proof: the same 10 queries with a clear gap between matches and non-matches.
- **865-4 · The boundary guard reads a relative import string from the session folder, not from the file that holds it** (met on the Mac
  2026-11-27 14:36 and 14:38, market): a heredoc writing `app/api/<n>/<n>.mjs` with `import … from '../../../lib/market/market.mjs'` was
  flagged «outside the element's folder: <core>/lib/market/market.mjs», though from that file it resolves to the element's own
  `lib/market/`. Two permission questions for nothing (both allowed by me). Fix: resolve a path found in written text relative to the file
  being written, or ignore import strings inside written content. Proof: the same heredoc passes; a real `../../..` write outside still asks.

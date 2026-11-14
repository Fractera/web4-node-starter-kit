# lib/migrations — one-time transitions of the node's own data between versions (step 743-3)

A change the node must make ONCE on the way to a new version — a record rewritten, a setting moved, a config given — lives here as one
file, never as a call placed by hand in `serve.mjs`, an installer or the update. The runner `lib/deploy/migrations.mjs` applies every
file not yet in the ledger `data/node/migrations.json` (outside git, it survives every update), in name order, from every entry point that
brings code to life: the installation (`scripts/launch.mjs`, `scripts/dedicated-server/install.sh`), `serve.mjs start` and `rebuild`,
and `node:update` after its merge. By hand: `npm run migrate`.

## The contract of a file
- Name `<step>-<slug>.mjs`; it exports `id` equal to the name without `.mjs`, `why` (one line), `run(root)` returning
  `{ done: true, note }` or `{ done: false, reason }` (a throw counts as failed), and `wraps` — the names of the functions it calls that
  must not be called anywhere else (the guard `check:migrations` enforces it).
- Idempotent: a second run changes nothing (the ledger skips a done id, but a failed one is tried again, and a ledger can be lost).
- Bare node: `.mjs`, relative imports, no `@/`, no packages — it runs at install time before `node_modules` may be complete.
- A failure never stops the node: it is recorded with its reason and tried at the next entry point.

Build cost: none (runs in plain node, not in the Next build). Caching: none.

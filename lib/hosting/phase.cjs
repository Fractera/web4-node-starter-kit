// THE PHASE OF A NODE ON ITS DEDICATED SERVER (node steps 737, 738). `data/node/server.json` → `phase`, written by the launch on the
// server itself (`scripts/dedicated-server/launch.sh`, stage mark), never by a guess.
//   'live'   — the node lives on this server (738: its own node, launched fresh from the fork — `independent: true`).
//   'silent' — 737's rehearsal of a copy (no move exists since 738; an old server may still carry it): every agent wake is refused here.
//   null     — not a server node (the person's computer).
// CommonJS: `lib/agent-kit/mount.cjs` (the core's custom server) reads it before Next starts.
const fs = require('node:fs')
const path = require('node:path')

/** @param {string} root @returns {'silent' | 'live' | null} */
function nodePhase(root) {
  try {
    const p = JSON.parse(fs.readFileSync(path.join(root, 'data', 'node', 'server.json'), 'utf8')).phase
    return p === 'silent' || p === 'live' ? p : null
  } catch {
    return null
  }
}

module.exports = { nodePhase }

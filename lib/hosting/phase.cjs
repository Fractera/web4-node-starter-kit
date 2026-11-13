// THE PHASE OF A NODE ON ITS DEDICATED SERVER (node step 737). `data/node/server.json` → `phase`, written by the move itself (the person's
// computer writes it over SSH before each start on the server), never by a guess.
//   'silent' — the rehearsal: the person's computer still runs the node; this copy only proves it can live here. No bot tokens and no
//              named tunnel came with it (`lib/hosting/transfer.mjs` SILENT_EXCLUDES); every agent wake is refused here, so neither a
//              clock, nor a core-back, nor a lost session starts an agent on the server while the original works.
//   'live'   — the node lives on this server.
//   null     — not a server node (the person's computer, or a node that never moved).
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

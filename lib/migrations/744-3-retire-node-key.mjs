// 744-3, D45 — the persistent server key of 738 (`data/node/server/id_ed25519` and its `.pub`) is deleted: access to a server is a visit
// for a day since 744-3, held by the server, and no key of it lives on the node's disk. A node that never launched a server has none.
import { retireNodeKey } from '../hosting/node-key.mjs'

export const id = '744-3-retire-node-key'
export const why = 'the persistent server key (data/node/server/id_ed25519, .pub) is deleted — access is a one-day visit since 744-3'
export const wraps = ['retireNodeKey']

export function run(root) {
  const gone = retireNodeKey(root)
  return { done: true, note: gone.length ? `deleted ${gone.join(', ')}` : 'no persistent key on this node' }
}

// 743-1 — a node folder where git has no identity at all (a server's node user) gets the machine's as its local config, so the main
// agent's own commits work there; a configured identity (the person's) is kept. The node's code signs as the machine anyway (D38).
// A server installed before 743 had none — its update reaches it here, the same way a fresh install does.
import { configureIfNone } from '../deploy/git-identity.mjs'

export const id = '743-1-repo-identity'
export const why = 'an identity-less node folder gets the machine identity locally (the main agent can commit its letters on a server)'
export const wraps = ['configureIfNone']

export function run(root) {
  return { done: true, note: configureIfNone(root) ? 'the machine identity set for this folder' : 'an identity is configured — kept' }
}

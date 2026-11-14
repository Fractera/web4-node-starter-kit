// THE MACHINE'S GIT IDENTITY — ONE SOURCE FOR EVERY COMMIT THE NODE'S CODE MAKES (node step 743-1; born as 741-8's fallback).
// ✗ Measured 2026-11-14 (step 743, `new-steps/743/probes/RESULTS.md`): the identity lived in 10 places with 4 emails and 2 policies
// (`panel@fractera.local`, `node@fractera.local`, `node@localhost`, `node@fractera.invalid`; «always» here, «only when none» there), and
// `scripts/evolution.mjs` committed with none — a server's node user has nobody's identity, so its update rolled back at the merge.
// 🔒 D38 (the owner, 2026-11-14 «y go»): what the machine does, the machine signs — update merges, births, map snapshots, rollbacks,
// imports, the evolution journal — whatever identity is configured; a person's own `git commit` keeps theirs. The same on every node
// and independent of the environment. `.invalid` is reserved and never resolves (RFC 2606); `.local` is mDNS (RFC 6762).
// The guard `scripts/check-git-identity.mjs` refuses an identity literal anywhere else and a machine commit that does not come here.
import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const MACHINE = Object.freeze({ name: 'Fractera node', email: 'node@fractera.invalid' })

/** `git` arguments that sign one command as the machine: `git(...machineArgs(), 'commit', …)`. */
export function machineArgs() {
  return ['-c', `user.name=${MACHINE.name}`, '-c', `user.email=${MACHINE.email}`]
}

/** The four `GIT_*` variables that sign every git command of a process as the machine (author and committer). */
export function machineEnv() {
  return {
    GIT_AUTHOR_NAME: MACHINE.name, GIT_AUTHOR_EMAIL: MACHINE.email,
    GIT_COMMITTER_NAME: MACHINE.name, GIT_COMMITTER_EMAIL: MACHINE.email,
  }
}

/**
 * A folder where git has no identity at all (a server's node user: nobody's global config) gets the machine's as its LOCAL config, so
 * what is not the node's code — the main agent's own commits of its letters — can commit there too. A configured identity (the
 * person's, local or global) is never touched. Returns `true` when it wrote one.
 */
export function configureIfNone(root) {
  const run = (...a) => spawnSync('git', ['-C', root, ...a], { encoding: 'utf8', windowsHide: true })
  if (run('config', 'user.email').stdout.trim()) return false
  return run('config', 'user.name', MACHINE.name).status === 0 && run('config', 'user.email', MACHINE.email).status === 0
}

// `node lib/deploy/git-identity.mjs --configure-if-none` — the installation's stage (shell has no other way to read this one source).
// Nothing runs on import (Next bundles this file into routes): only a direct start by that name and flag.
if (/[\\/]git-identity\.mjs$/.test(process.argv?.[1] ?? '') && process.argv.includes('--configure-if-none')) {
  const root = resolve(fileURLToPath(import.meta.url), '..', '..', '..')
  console.log(configureIfNone(root) ? `git identity of this folder: ${MACHINE.name} <${MACHINE.email}>` : 'git identity already configured — kept')
}

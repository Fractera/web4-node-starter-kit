// THE NODE'S OWN GIT IDENTITY — ONLY WHERE NONE IS CONFIGURED (node step 741-8, found 2026-11-14 while proving 741-1).
// ✗ The test server's own `node:update` rolled back at «сливаю форк»: `Committer identity unknown`. Its history held a commit the fork
// does not have, so `git merge --no-edit origin/main` needed a merge commit — and the node's user on a server has no git identity
// (nothing in the launch set one). On a person's computer their own global identity commits; a server has nobody's.
// 🔒 A NEUTRAL IDENTITY, NEVER A PERSONAL ONE: «Fractera node <node@fractera.invalid>» — `.invalid` is reserved and never delivers
// (RFC 2606). A configured identity (the person's, or the node's own set by `install.sh`) always wins: this only fills a gap.
import { spawnSync } from 'node:child_process'

export const NODE_IDENTITY = Object.freeze({ name: 'Fractera node', email: 'node@fractera.invalid' })

/**
 * The environment additions that let git commit in `cwd`: `{}` when an identity is configured there (local, global or system), else
 * the four `GIT_*` variables of the node's neutral identity.
 */
export function identityEnv(cwd, env = process.env) {
  const r = spawnSync('git', ['config', 'user.email'], { cwd, encoding: 'utf8', env, windowsHide: true })
  if (r.status === 0 && String(r.stdout ?? '').trim()) return {}
  return {
    GIT_AUTHOR_NAME: NODE_IDENTITY.name, GIT_AUTHOR_EMAIL: NODE_IDENTITY.email,
    GIT_COMMITTER_NAME: NODE_IDENTITY.name, GIT_COMMITTER_EMAIL: NODE_IDENTITY.email,
  }
}

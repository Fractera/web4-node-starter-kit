// IS THIS SERVER RELATED TO THIS NODE? (node step 744-4, D49). The owner, 2026-11-14: «прежде всего получать исходные данные по состоянию
// сервера если сервер никак не связан с нашим текущим положением Fractera то предлагает удалить предыдущее состояние если связан то
// предлагает обновиться до последней версии если это возможно».
// 🔒 THREE VERDICTS, from the server's own probe (`scripts/dedicated-server/probe.sh`), pure — no network, no files:
//   clean      nothing there: no Fractera node, no other node, no foreign nginx site, no root pm2 program → «install»;
//   related    a node that follows THIS node's fork and is not a 737 move of another computer → «update» when its fork is ahead, else
//              «latest»;
//   unrelated  everything else, with its reasons → «delete the previous state» (set aside on the server, never erased).
// `nodeUnrelated` tells the clear what to set aside: the node itself (a move, another fork, no origin, another node folder) or only the
// strangers beside a related node (its sites, root's programs) — a related node is never cleared for a stranger's sake.
// ✗ Measured 2026-11-14 on the test server: origin = this very fork, yet the node there was the 737 MOVE of this Mac (`movedAt`, 351
// commits of this computer's private history) — «same fork» alone would have called it related.

/** `github.com/<owner>/<repo>` of a git remote however it is spelled (https, ssh, `.git`, credentials, case); `null` when unreadable. */
export function forkKey(url) {
  const s = String(url ?? '').trim()
  const m = /^(?:https?:\/\/(?:[^@/]+@)?|ssh:\/\/(?:[^@/]+@)?|[^@/\s]+@)([^/:\s]+)[/:]([^/\s]+)\/([^/\s]+?)(?:\.git)?\/?$/i.exec(s)
  return m ? `${m[1]}/${m[2]}/${m[3]}`.toLowerCase() : null
}

/**
 * @param {{ fractera?: { origin?: string | null, movedFrom?: { from?: string, at?: string } | null } | null, foreignSites?: string[],
 *   pm2Root?: number, otherNodes?: string[] } | null} probe   the server's probe
 * @param {string | null} ownFork   this node's fork (its `origin`)
 * @returns {{ kind: 'clean' | 'related' | 'unrelated', reasons: Array<Record<string, unknown> & { id: string }>, nodeUnrelated: boolean }}
 */
export function relationOf(probe, ownFork) {
  const f = probe?.fractera ?? null
  const reasons = []
  if (f) {
    if (f.movedFrom) reasons.push({ id: 'moved', from: f.movedFrom.from ?? null, at: f.movedFrom.at ?? null })
    if (!f.origin) reasons.push({ id: 'no-origin' })
    else if (!forkKey(ownFork) || forkKey(f.origin) !== forkKey(ownFork)) reasons.push({ id: 'other-fork', origin: forkKey(f.origin) ?? f.origin })
  }
  const others = (probe?.otherNodes ?? []).filter(Boolean)
  if (others.length) reasons.push({ id: 'other-nodes', folders: others })
  const nodeUnrelated = reasons.length > 0
  const sites = (probe?.foreignSites ?? []).filter(Boolean)
  if (sites.length) reasons.push({ id: 'foreign-sites', sites })
  if (Number(probe?.pm2Root) > 0) reasons.push({ id: 'root-programs', count: Number(probe.pm2Root) })
  if (reasons.length) return { kind: 'unrelated', reasons, nodeUnrelated }
  return { kind: f ? 'related' : 'clean', reasons: [], nodeUnrelated: false }
}

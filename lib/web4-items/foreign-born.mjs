// 784 ✗ 2026-11-18 (the owner's server launched from his fork stopped after 43 minutes of building: «hrutb — рождённый · ОШИБКА: папки
// рождённого элемента нет»). A fresh project — a node set up from a fork (`logs/fresh-project.json`) — carries in its registry the
// elements BORN on the node the fork came from; their code lived only there. Such an entry — born, no folder here, no repository of its
// own to restore from — is not this node's. On the node that bore it the same absence is a real loss and stays an error.
// «Born before this project became fresh» is what tells the two apart: a fork's own node is a fresh project too (its mark is older than
// its own births), so the mark alone is never enough. An entry without a birth time is kept (never dropped on a guess).

/**
 * The registry entries that belong to another node.
 * @param {Array<{ id: string, born?: unknown, github?: string }>} services
 * @param {{ freshAt: string | null, hasFolder: (entry: object) => boolean }} where `freshAt` — when this project became fresh (its mark)
 * @returns {string[]} their ids
 */
export function foreignBorn(services, { freshAt, hasFolder }) {
  const fresh = Date.parse(freshAt ?? '')
  if (!Number.isFinite(fresh) || !Array.isArray(services)) return []
  return services.filter((s) => {
    const born = Date.parse(s?.born?.at ?? '')
    return s && s.born && !s.github && Number.isFinite(born) && born < fresh && !hasFolder(s)
  }).map((s) => s.id)
}

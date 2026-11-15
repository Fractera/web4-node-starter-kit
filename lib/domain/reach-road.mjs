// THE ROAD OF A SERVICE'S INTERNET ADDRESS (node step 749-3). The owner, 2026-11-15, on aifa.dev: «я почему-то вижу красную карточку
// который сообщает нереальный адрес … адрес Local хост и ошибочную надпись узел работает на этой машине своего Домина у него нет. Что за
// бред?». Measured the same minute: `/api/node/reach` answered `local` while `/api/node/place` said «server» and `/api/domain/state` said
// «aifa.dev, active» — the door's GET knew only the Cloudflare tunnel («no tunnelId → local»), while a server's domain is held by its
// nginx (`logs/domain.json` `via: "server"`, 737-8; 737-16 taught only the POST). ONE choice, read by the door:
//   tunnel            — the node's own domain through its named Cloudflare tunnel (a person's computer);
//   server            — the node's own domain held by the server's nginx;
//   server-no-domain  — a dedicated server before its domain is switched on;
//   local             — a person's computer without its own domain.
// `via: "server"` wins over a tunnel id: on a server the tunnel's resident sleeps (737-8). The place is asked of
// `lib/hosting/place.mjs` only (741) — the caller passes `placeKind(root)`; this module reads nothing itself.

/**
 * @param {{ zone?: unknown, tunnelId?: unknown, via?: unknown } | null | undefined} domain  the record `logs/domain.json`
 * @param {string} place  `placeKind(root)`: «home» or «server»
 * @returns {'tunnel' | 'server' | 'server-no-domain' | 'local'}
 */
export function roadOf(domain, place) {
  const zone = typeof domain?.zone === 'string' && domain.zone !== ''
  if (zone && domain.via === 'server') return 'server'
  if (zone && typeof domain.tunnelId === 'string' && domain.tunnelId !== '') return 'tunnel'
  return place === 'server' ? 'server-no-domain' : 'local'
}

// WHAT A HOME COMPUTER DOES NOT DO (node step 809-1). The owner, 2026-11-20 (Telegram 76, 78, 81): «возможность самостоятельного … появляется
// только на выделенном сервере»; «имелось в виду … дополнительные домены для элементов» — on a home computer (Mac, Windows, Linux) the node
// has its own domain and the elements' subdomains only.
// 🔒 WHY: an app of its own brings other people with their own admin pages, and the wall between them is the server's (811: a Linux user
// per element); a brand site on its own domain belongs on a machine that never sleeps. One reading for every door and page: where the
// node lives (`lib/hosting/place.mjs`, its record and its measurement) — never the address in the browser.
// Pure: the place is given.

/** @param {{ kind?: string } | null | undefined} place */
export const onServer = (place) => place?.kind === 'server'

/** An element may be born an app of its own only on a dedicated server. */
export const ownAppAllowed = (place) => onServer(place)

/** An element may get an additional domain of its own only on a dedicated server. */
export const extraDomainsAllowed = (place) => onServer(place)

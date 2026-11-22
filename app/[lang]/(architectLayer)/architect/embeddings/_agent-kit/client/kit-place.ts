// WHERE THE AGENT KIT'S PAGES KNOCK (node step 836). The owner, 2026-11-22 (Telegram 711, 719, 721): an element's agent pages live
// inside the element, «пере используй их как есть». The same client files run in two places — the core's panel and an element's own
// admin branch — and this file is the ONE thing that differs between them: the element's copy (`npm run agent-kit:template`) gets
// `element/kit-place.ts` instead of this one.
// The core's panel: the doors of the element's route here (`/<lang>/architect/<id>/agent-api/*`), the socket `/pty/<id>` on this host.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

/** The base of the four kit doors (ticket, session, channel, claude-auth) of `service`. */
export function kitApi(lang: string, service: string): string {
  return `${BASE}/${lang}/architect/${service}/agent-api`
}

/** A door of the core itself (`/api/node/update?tail=1`, `/api/transcribe?item=…`). */
export function kitDoor(path: string): string {
  return `${BASE}${path}`
}

/** The terminal socket: the ticket door may name it (an element's door does — the core is on another host); else this host. */
export function kitSocket(service: string, named?: string | null): string {
  if (named) return named
  const scheme = window.location.protocol === "https:" ? "wss" : "ws"
  return `${scheme}://${window.location.host}${BASE}/pty/${service}`
}

/** Where the kit's own pages are, for its links between them (terminal ↔ telegram ↔ subscription). */
export function kitPage(lang: string, service: string, page: "terminal" | "telegram" | "claude-code"): string {
  return `/${lang}/architect/${service}/${page}`
}

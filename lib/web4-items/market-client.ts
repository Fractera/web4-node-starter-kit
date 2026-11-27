import "server-only"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { listServices, serviceUrl } from "@/lib/microservices/registry"
import { domainRecord } from "@/lib/web4-items/element-domain"
import { addressOf } from "@/lib/web4-items/address-file.mjs"

// THE MARKETPLACE CLIENT OF THIS PROJECT, FOUND BY WHAT IT PROVIDES (core step 862-12; Roma 2026-11-27, Telegram 1670/1672: «эти новые
// кнопки должны существовать … во всех выдвижных ящиках»). Never by its id: all elements are equal, the client is one of them (CLAUDE.md §3;
// the same rule as `market-door.ts`). Three pages of the client are reachable from every drawer of the project — the core's and, through
// the door `account-links`, every element's; the link goes through the core's door `market-link`, which picks the address by the caller's
// host, so the prebuilt pages never carry an address.

export const MARKET_PAGES = { recommendations: "/admin/recommendations", cart: "/admin/cart", purchases: "/admin/purchases" } as const
export type MarketPage = keyof typeof MARKET_PAGES

export function isMarketPage(v: string): v is MarketPage {
  return Object.prototype.hasOwnProperty.call(MARKET_PAGES, v)
}

/** The id of the element that provides `market-client`, or null when this project has none. */
export function marketClientId(): string | null {
  const c = (listServices() as unknown as { id: string; provides?: string[] }[]).find((s) => (s.provides ?? []).includes("market-client"))
  return c?.id ?? null
}

/** The client's own address for the caller: the loopback port on this computer, else its address on the node's own domain; null on a
 *  temporary address (no element has a public name there). */
export function marketClientBase(id: string, loopback: boolean): string | null {
  if (loopback) return serviceUrl(id)?.replace(/\/+$/, "") ?? null
  const own = domainRecord(id)?.url ?? null
  if (own) return own.replace(/\/+$/, "")
  try {
    const d = JSON.parse(readFileSync(join(process.cwd(), "logs", "domain.json"), "utf8")) as { zone?: string }
    return d.zone ? `https://${addressOf(id) || id}.${d.zone}` : null
  } catch {
    return null
  }
}

/** The path of the core's door that leads to one page of the client (relative to the core). */
export function marketLinkPath(page: MarketPage, lang: string): string {
  return `/api/node/market-link?to=${page}&lang=${encodeURIComponent(lang)}`
}

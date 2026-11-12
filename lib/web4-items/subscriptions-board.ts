import "server-only"
import { join } from "node:path"

import { listServices } from "@/lib/microservices/registry"
import { folderAutomation, elementPassport } from "@/lib/a2a/element-passport"
import { elementLabel } from "@/lib/web4-items/element-name"
import { readVar, setNames } from "@/lib/env-file"
import { openAiKey } from "@/lib/openai-key"
import paths from "@/lib/web4-items/paths.cjs"
import ledger from "@/lib/usage-ledger.cjs"
import board from "@/lib/subscriptions-board.cjs"
import money from "@/lib/money-day.cjs"

// «ВСЕ ПОДПИСКИ» (726-3): the sources of the Dashboard table, read on request — the page is prerendered, the island asks
// `/api/node/subscriptions`. The rows themselves are built by the pure `lib/subscriptions-board.cjs` (proven over a fixture).
//
// Sources: the core (its ledger `data/node/usage/`, the main agent's `data/main-agent/OWN-SERVICE-PROPS/SUBSCRIPTIONS.json`) and every
// element of the registry (its `OWN-SERVICE-PROPS/SUBSCRIPTIONS.json` through the passport reader, its own ledger — since 735 B1b in its
// data folder `data/services/<id>/usage/`, before it in its folder's `data/node/usage/`). 🔒 Keys: only the NAMES of the set variables
// (`setNames`), never a value.

/** How far back the ledger is read: the last seven days the ledger holds. */
export const WINDOW_DAYS = 7

export type BoardUser = {
  id: string; label: string; href: string | null; declared: boolean; example: boolean
  keys: "set" | "partial" | "missing" | null; calls: number; refused: number; consumers: string[]; lastAt: string | null
}
export type BoardEvent = { at: string; element: string; label: string; who: string | null }
export type BoardRow = {
  service: string; name: string; description: string | null; docs: string | null
  users: BoardUser[]; keys: "set" | "partial" | "missing" | null; example: boolean
  calls: number; refused: number; tokensIn: number; tokensOut: number
  lastCall: (BoardEvent & { ok: boolean }) | null
  lastError: (BoardEvent & { reason: string | null; code: string | null; message: string | null }) | null
  /** 726-4: today's burn (UTC) against the daily budget, from the ledger — in calls. */
  today: { state: "no-spend" | "no-budget" | "within" | "will-cross" | "crossed" | "refusing"; calls: number; projected: number; budget: number | null; at: string | null }
  /** 726-4: what the provider tells about money (measured): a balance, only the day's spend, or nothing known. */
  money: { tells: "balance" | "spend" | "unknown"; billing: string | null }
}
export type Balance = { state: "balance"; usd: number; at: string } | { state: "spent-today"; usd: number }
  | { state: "not-told" | "needs-key" | "unknown" | "failed"; key?: string; status?: number }

type Line = Record<string, unknown> & { at: string }

function recent(root?: string): Line[] {
  return (ledger.days(root) as string[]).slice(0, WINDOW_DAYS).flatMap((d) => ledger.readDay(d, root) as Line[])
}

/** 735 B1b: an element's process writes its ledger into its data folder `data/services/<id>/usage/` (outside its build). */
function recentOfElement(id: string, folder: string): Line[] {
  const at = join(process.cwd(), "data", "services", id, "usage")
  return [...(ledger.daysAt(at) as string[]).slice(0, WINDOW_DAYS).flatMap((d) => ledger.readDayAt(d, at) as Line[]), ...recent(folder)]
}

export function subscriptionsBoard(lang: string): { rows: BoardRow[]; windowDays: number } {
  const core = setNames("core")
  if (openAiKey() && !core.includes("OPENAI_API_KEY")) core.push("OPENAI_API_KEY")
  const sources = [
    {
      id: "core", label: "", href: null,
      subscriptions: folderAutomation(join(process.cwd(), "data", "main-agent")).subscriptions,
      ledger: recent(), setNames: core,
    },
    ...listServices().map((entry) => ({
      id: entry.id,
      label: elementLabel(entry.id, lang),
      href: `/architect/${entry.id}/workflow/process/subscriptions`,
      subscriptions: elementPassport(entry.id)?.subscriptions ?? null,
      ledger: recentOfElement(entry.id, paths.entryDir(entry)),
      setNames: setNames(entry.id),
    })),
  ]
  const rows = board.boardRows(sources, { coreSetNames: core }) as Omit<BoardRow, "today" | "money">[]
  const budgets = money.readBudgets() as Record<string, { calls: number }>
  const lines = sources.flatMap((s) => s.ledger)
  return {
    windowDays: WINDOW_DAYS,
    rows: rows.map((r) => {
      const p = (money.PROBES as Record<string, { balance: boolean; billing: string }>)[r.service]
      const b = money.dayBurn(lines.filter((l) => l.provider === r.service), { budget: budgets[r.service]?.calls ?? null })
      return {
        ...r,
        today: { state: b.state, calls: b.calls, projected: b.projected, budget: b.budget, at: b.at },
        money: { tells: p ? (p.balance ? "balance" : "spend") : "unknown", billing: p?.billing ?? null },
      } as BoardRow
    }),
  }
}

/** 726-4: ask every provider of the table what it tells about money — ON REQUEST only (a few HTTP calls, no model). */
export async function subscriptionBalances(services: string[]): Promise<Record<string, Balance>> {
  const keyOf = (name: string) => process.env[name] || readVar("core", name)
  const out: Record<string, Balance> = {}
  for (const s of services.slice(0, 50)) out[s] = (await money.probe(s, keyOf)) as Balance
  return out
}

/** 726-4: the person sets the daily budget of a service in calls (0 removes it). */
export function setBudget(service: string, calls: number): boolean {
  return money.writeBudget(service, calls) as boolean
}

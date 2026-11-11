import "server-only"
import { join } from "node:path"

import { listServices } from "@/lib/microservices/registry"
import { folderAutomation, elementPassport } from "@/lib/a2a/element-passport"
import { elementLabel } from "@/lib/web4-items/element-name"
import { setNames } from "@/lib/env-file"
import { openAiKey } from "@/lib/openai-key"
import paths from "@/lib/web4-items/paths.cjs"
import ledger from "@/lib/usage-ledger.cjs"
import board from "@/lib/subscriptions-board.cjs"

// «ВСЕ ПОДПИСКИ» (726-3): the sources of the Dashboard table, read on request — the page is prerendered, the island asks
// `/api/node/subscriptions`. The rows themselves are built by the pure `lib/subscriptions-board.cjs` (proven over a fixture).
//
// Sources: the core (its ledger `data/node/usage/`, the main agent's `data/main-agent/OWN-SERVICE-PROPS/SUBSCRIPTIONS.json`) and every
// element of the registry (its `OWN-SERVICE-PROPS/SUBSCRIPTIONS.json` through the passport reader, its own ledger written by its agent
// kit). 🔒 Keys: only the NAMES of the set variables (`setNames`), never a value.

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
}

type Line = Record<string, unknown> & { at: string }

function recent(root?: string): Line[] {
  return (ledger.days(root) as string[]).slice(0, WINDOW_DAYS).flatMap((d) => ledger.readDay(d, root) as Line[])
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
      ledger: recent(paths.entryDir(entry)),
      setNames: setNames(entry.id),
    })),
  ]
  return { rows: board.boardRows(sources, { coreSetNames: core }) as BoardRow[], windowDays: WINDOW_DAYS }
}

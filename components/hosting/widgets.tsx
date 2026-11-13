import type { ReactNode } from "react"
import { nodePlaceWidget } from "@/components/node-state/widgets"
import { ServerMove } from "./server-move.client"
import { serverDomainWords } from "./server-domain.i18n"
import { serverMoveWords } from "./server-move.i18n"

// THE ENTRY OF THE TAB «ВЫДЕЛЕННЫЙ СЕРВЕР» INTO ITS ISLAND (node step 737-7) — `(language) → island`: the language is chosen here, on the
// server, and one set of words goes to the browser (`check:lang-delivery`). The tab's `_components/index.ts` stays a module without JSX,
// like every page of the layer (the same move as `components/node-state/widgets.tsx`).
export function serverMoveWidget(lang: string): ReactNode {
  // 737-8 fix: the place declaration (276-3) had lost its only screen in 737-7 — a «server» said by hand stayed in the indicator with no
  // way back. It lives under the ladder again, on the person's computer only (on a server the move's own record decides).
  return <ServerMove domainWords={serverDomainWords(lang)} place={nodePlaceWidget(lang)} words={serverMoveWords(lang)} />
}

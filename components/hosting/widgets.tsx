import type { ReactNode } from "react"
import { appDialogUi } from "@/components/dialog/app-dialog.i18n"
import { domainLadderWords } from "@/components/domain/domain-ladder.i18n"
import { ServerPlace } from "./server-place.client"
import { serverDomainWords } from "./server-domain.i18n"
import { serverLadderWords } from "./server-ladder.i18n"
import { serverLaunchWords } from "./server-launch.i18n"

// THE ENTRY OF «АКТИВАЦИЯ ВЫДЕЛЕННОГО СЕРВЕРА» INTO ITS ISLAND (node step 738) — `(language) → island`: the language is chosen here, on the
// server, and one set of words goes to the browser (`check:lang-delivery`). The tab's `_components/index.ts` stays a module without JSX,
// like every page of the layer (the same move as `components/node-state/widgets.tsx`).
export function serverLaunchWidget(lang: string): ReactNode {
  return <ServerPlace dialogUi={appDialogUi(lang)} domainWords={serverDomainWords(lang)} keyWords={domainLadderWords(lang)} ladderWords={serverLadderWords(lang)} words={serverLaunchWords(lang)} />
}

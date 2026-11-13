import type { ReactNode } from "react"
import { telegramChannelWords } from "@/app/[lang]/(architectLayer)/architect/kits/_agent-kit/core/words/telegram-channel.i18n"
import { appDialogUi } from "@/components/dialog/app-dialog.i18n"
import { ServerMove } from "./server-move.client"
import { serverDomainWords } from "./server-domain.i18n"
import { serverMoveWords } from "./server-move.i18n"

// THE ENTRY OF THE TAB «ВЫДЕЛЕННЫЙ СЕРВЕР» INTO ITS ISLAND (node step 737-7) — `(language) → island`: the language is chosen here, on the
// server, and one set of words goes to the browser (`check:lang-delivery`). The tab's `_components/index.ts` stays a module without JSX,
// like every page of the layer (the same move as `components/node-state/widgets.tsx`).
export function serverMoveWidget(lang: string): ReactNode {
  return <ServerMove channelWords={telegramChannelWords(lang)} dialogUi={appDialogUi(lang)} domainWords={serverDomainWords(lang)} lang={lang} words={serverMoveWords(lang)} />
}

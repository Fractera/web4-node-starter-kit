import type { ReactNode } from "react"
import { appDialogUi } from "@/components/dialog/app-dialog.i18n"
import { domainLadderWords } from "@/components/domain/domain-ladder.i18n"
import { DomainPlace } from "./domain-place.client"
import { ServerCertificates } from "./server-certificates.client"
import { serverCertificatesWords } from "./server-certificates.i18n"
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

/** 742-2: «Активация домена» on a server node — the server's own domain ladder (nothing on a computer). */
export function domainPlaceWidget(lang: string): ReactNode {
  return <DomainPlace dialogUi={appDialogUi(lang)} domainWords={serverDomainWords(lang)} keyWords={domainLadderWords(lang)} ladderWords={serverLadderWords(lang)} />
}

/** 742-4: «Сертификаты безопасности», a page of a server node only. */
export function serverCertificatesWidget(lang: string): ReactNode {
  return <ServerCertificates domainWords={serverDomainWords(lang)} words={serverCertificatesWords(lang)} />
}

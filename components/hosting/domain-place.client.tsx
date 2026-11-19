"use client"
// @local — the island of «Активация домена» (one route): on a server node it is that server's own domain ladder; on a computer it draws nothing

import type { AppDialogUi } from "@/components/dialog/app-dialog.i18n"
import type { ServerDomainWords } from "@/components/hosting/server-domain.i18n"
import { ServerLadder } from "@/components/hosting/server-ladder.client"
import type { ServerLadderWords } from "@/components/hosting/server-ladder.i18n"
import { useNodePlace } from "@/components/node-state/use-node-place.client"

// 742-2 (the owner, 2026-11-14, after the live test of aifa.dev: «вкладка красная а это значит что домен не подключён но это неправда»):
// a server's domain is its own ladder — the domain, its records, certificates, HTTPS, the switch — read from the server's own door.
// The computer's Cloudflare ladder is the page's section and hides itself on a server (`data-place="home"`). The node says where it
// lives (`useNodePlace`), never the address bar (741-6).

export function DomainPlace({ ladderWords, domainWords, dialogUi }: { ladderWords: ServerLadderWords; domainWords: ServerDomainWords; dialogUi: AppDialogUi }) {
  const place = useNodePlace()
  if (place?.kind !== "server") return null
  return (
    <div className="my-6" data-block="domain-place-server">
      <ServerLadder dialogUi={dialogUi} domainWords={domainWords} folded words={ladderWords} />
    </div>
  )
}

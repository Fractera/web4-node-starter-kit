"use client"
// @local — the island of «Активация выделенного сервера» (one route): the launch form on the person's computer, the server's own domain ladder on a server node

import { useEffect, useState } from "react"
import type { AppDialogUi } from "@/components/dialog/app-dialog.i18n"
import type { DomainLadderWords } from "@/components/domain/domain-ladder.i18n"
import type { ServerDomainWords } from "@/components/hosting/server-domain.i18n"
import { ServerLadder } from "@/components/hosting/server-ladder.client"
import type { ServerLadderWords } from "@/components/hosting/server-ladder.i18n"
import { ServerLaunch } from "@/components/hosting/server-launch.client"
import type { ServerLaunchWords } from "@/components/hosting/server-launch.i18n"
import { isTemporaryHostname } from "@/lib/auth/temporary-address"

// WHERE THIS PAGE IS OPENED (node step 738-4). On the person's computer it launches servers; on a server node it is that server's own
// domain (737-8: its five steps, read-only on its bare IP); on a public address nothing is launched — the door refuses there.
// 🔒 ASKED, NEVER BUILT IN: the page is prerendered, so the place is read by the browser from the server's own door.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

export function ServerPlace({ words, ladderWords, domainWords, keyWords, dialogUi }: { words: ServerLaunchWords; ladderWords: ServerLadderWords; domainWords: ServerDomainWords; keyWords: DomainLadderWords; dialogUi: AppDialogUi }) {
  const [place, setPlace] = useState<"launch" | "server" | null>(null)
  useEffect(() => {
    if (isTemporaryHostname(window.location.hostname)) { setPlace("server"); return }
    void fetch(`${BASE}/api/node/server/domain`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((a: { phase?: string | null } | null) => setPlace(a?.phase === "live" || a?.phase === "silent" ? "server" : "launch"))
      .catch(() => setPlace("launch"))
  }, [])
  if (!place) return null
  if (place === "server") return <div className="my-6" data-block="server-place-own"><ServerLadder dialogUi={dialogUi} domainWords={domainWords} fallback={words.readOnly} keyWords={keyWords} words={ladderWords} /></div>
  return <ServerLaunch dialogUi={dialogUi} domainWords={domainWords} keyWords={keyWords} ladderWords={ladderWords} words={words} />
}

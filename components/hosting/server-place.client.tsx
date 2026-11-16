"use client"
// @local — the island of «Активация выделенного сервера» (one route): the launch form on the person's computer, the server's own domain ladder on a server node

import type { AppDialogUi } from "@/components/dialog/app-dialog.i18n"
import type { ServerDomainWords } from "@/components/hosting/server-domain.i18n"
import { ServerLadder } from "@/components/hosting/server-ladder.client"
import type { ServerLadderWords } from "@/components/hosting/server-ladder.i18n"
import { ServerLaunch } from "@/components/hosting/server-launch.client"
import type { ServerLaunchWords } from "@/components/hosting/server-launch.i18n"
import { useNodePlace } from "@/components/node-state/use-node-place.client"

// WHERE THIS PAGE IS OPENED (node steps 738-4, 741-6). On the person's computer it launches servers; on a server node it is that
// server's own domain ladder (737-8).
// 🔒 741-6 (the owner approved 2026-11-14): THE NODE SAYS WHERE IT LIVES (`useNodePlace`, its installation's record), never the address
// bar. ✗ Measured the same day: the computer opened through its quick tunnel rendered the SERVER ladder here, because a tunnel name was
// read as «server». On the tunnel the launch view stays read-only — its door refuses writes there.
// 🔒 D36: a live server this computer launched is named above the launch form, with its address.

export function ServerPlace({ lang, words, ladderWords, domainWords, dialogUi }: { lang: string; words: ServerLaunchWords; ladderWords: ServerLadderWords; domainWords: ServerDomainWords; dialogUi: AppDialogUi }) {
  const place = useNodePlace()
  if (place === undefined) return null
  if (place?.kind === "server") return <div className="my-6" data-block="server-place-own"><ServerLadder dialogUi={dialogUi} domainWords={domainWords} fallback={words.readOnly} words={ladderWords} /></div>
  const live = place?.launched?.[0]
  const [before, after = ""] = words.launchedOn.split("{url}")
  return (
    <>
      {live ? (
        <p className="my-4 text-sm font-medium text-foreground" data-block="server-place-launched">
          {before}<a className="underline" href={`https://${live.domain}/`}>{`https://${live.domain}`}</a>{after}
        </p>
      ) : null}
      <ServerLaunch dialogUi={dialogUi} domainWords={domainWords} ladderWords={ladderWords} lang={lang} words={words} />
    </>
  )
}

"use client"
// @local — the element's Telegram Mini App screen on its «Working process» page (node step 790): one route, one phone frame

import { useEffect, useState } from "react"
import { ExternalLink } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Small } from "@/components/ui/typography"

// The owner, 2026-11-18 (Telegram 748): «все что делаем и строим в Telegram отображается в рабочих процессах на левом меню». The screen
// is the element's own `/<lang>/tg/<slug>` — never a copy: this computer opens it on the element's loopback address, the node's own
// domain on the element's public one (the door `/api/node/preview-url`, so no port is printed into this prebuilt page). The frame is a
// phone of 390 × 780: the screen looks exactly as in Telegram.

export type ElementMiniAppWords = { note: string; open: string; loading: string; none: string; off: string; noAddress: string }
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
type Where = { state: "loading" } | { state: "ready"; src: string } | { state: "off" } | { state: "no-address" }

export function ElementMiniApp({ id, lang, slug, hasMenu, words }: { id: string; lang: string; slug: string; hasMenu: boolean; words: ElementMiniAppWords }) {
  const [where, setWhere] = useState<Where>({ state: "loading" })
  useEffect(() => {
    if (!hasMenu) return
    let gone = false
    void fetch(`${BASE}/api/node/preview-url?id=${encodeURIComponent(id)}&lang=${encodeURIComponent(lang)}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((a: { ok?: boolean; url?: string; publicUrl?: string | null; off?: unknown }) => {
        if (gone) return
        if (a?.off) return setWhere({ state: "off" })
        const local = ["localhost", "127.0.0.1", "[::1]"].includes(window.location.hostname)
        const origin = local ? (a?.url ? new URL(a.url).origin : null) : (a?.publicUrl ? new URL(a.publicUrl).origin : null)
        setWhere(origin ? { state: "ready", src: `${origin}/${lang}/tg${slug ? `/${slug}` : ""}` } : { state: "no-address" })
      })
      .catch(() => { if (!gone) setWhere({ state: "no-address" }) })
    return () => { gone = true }
  }, [id, lang, slug, hasMenu])

  if (!hasMenu) return <Small className="my-4 block text-muted-foreground" data-block="element-mini-app-none">{words.none}</Small>
  return (
    <div className="my-4 flex flex-col gap-4 lg:flex-row lg:items-start" data-block="element-mini-app">
      <div className="h-[780px] w-[390px] max-w-full shrink-0 overflow-hidden rounded-[2rem] border border-border bg-background shadow-sm" data-block="element-mini-app-phone">
        {where.state === "ready"
          ? <iframe className="size-full border-0" src={where.src} title={slug || "tg"} />
          : (
            <div className="flex size-full items-center justify-center p-6 text-center" data-block="element-mini-app-state">
              {where.state === "loading" ? <Small className="flex items-center gap-2 text-muted-foreground"><Spinner className="size-4" />{words.loading}</Small> : null}
              {where.state === "off" ? <Small className="text-foreground">{words.off}</Small> : null}
              {where.state === "no-address" ? <Small className="text-muted-foreground">{words.noAddress}</Small> : null}
            </div>
          )}
      </div>
      <div className="flex max-w-sm flex-col gap-3" data-block="element-mini-app-side">
        <Small className="text-muted-foreground">{words.note}</Small>
        {where.state === "ready" ? (
          <a className={buttonVariants({ size: "sm", variant: "outline", className: "w-fit" })} href={where.src} rel="noopener noreferrer" target="_blank">
            {words.open}<ExternalLink data-icon="inline-end" />
          </a>
        ) : null}
      </div>
    </div>
  )
}

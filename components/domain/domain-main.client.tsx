"use client"
// @local — the main domain's own section once the node has one (step 775): where it answers, the architect's sign-in while the node has
// none, the copy in Cloudflare, the way it was connected folded in «Подробнее», and the one way back — «Отключить основной домен»

import { useState } from "react"
import { ExternalLink } from "lucide-react"
import { Accordion } from "@/components/ui/accordion"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useNodePlace } from "@/components/node-state/use-node-place.client"
import signIn from "@/lib/auth/sign-in-link.cjs"
import type { DomainListWords } from "./domain-list.i18n"
import type { DomainLadderWords } from "./domain-ladder.i18n"
import { StaticCopyItem } from "./static-copy.client"
import { AppDialog } from "@/components/dialog/app-dialog.client"
import type { AppDialogUi } from "@/components/dialog/app-dialog.i18n"
import { Ladder } from "@/components/hosting/ladder-step"
import { DomainSubdomains } from "./domain-subdomains.client"

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

type Props = {
  /** 775: the one modal's chrome words, chosen on the server */
  dialogUi: AppDialogUi
  lang: string
  name: string
  status: string | null
  links: { site: string; panel: string } | null
  architect: boolean | null
  words: DomainListWords
  ladderWords: DomainLadderWords
}

export function DomainMain({ lang, dialogUi, name, status, links, architect, words: w, ladderWords }: Props) {
  const place = useNodePlace()
  const [confirm, setConfirm] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // 775: the fourth rung after a check — every element answers (done) or one does not (red); unknown until the person presses.
  const [subs, setSubs] = useState<boolean | null>(null)
  // 777: the architect's sign-in — the node's one link builder, the way back to this same panel page on the domain.
  const signInHref = place?.signIn && typeof window !== "undefined"
    ? signIn.architectSignIn(place.signIn, `${window.location.pathname}${window.location.search}`, window.location.origin)
    : null

  async function disconnect() {
    setBusy(true)
    setError(null)
    try {
      const r = await fetch(`${BASE}/api/domain/activate`, { method: "DELETE" })
      const j = (await r.json().catch(() => null)) as { ok?: boolean; reason?: string } | null
      if (j?.ok) { window.location.reload(); return }
      setError(`${w.main.disconnectFailed} ${j?.reason ?? r.status}`)
    } catch { setError(w.main.disconnectFailed) }
    setBusy(false)
  }

  return (
    <div className="flex flex-col gap-3" data-block="domain-main-live" data-domain-main={name}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border border-border p-3" data-block="domain-main-status">
        <span className="font-mono text-base font-semibold text-foreground">{name}</span>
        <span className={`rounded-md border px-1.5 text-[length:var(--fs-small)] ${status === "active" ? "border-success/50 text-success" : "border-border text-muted-foreground"}`} data-domain-main-status={status ?? "unknown"}>
          {status === "active" ? w.main.live : status ?? w.main.unknown}
        </span>
        {links && (
          <span className="ml-auto flex flex-wrap gap-2" data-block="domain-main-links">
            <a href={links.site} target="_blank" rel="noreferrer noopener" className={buttonVariants({ variant: "outline", size: "sm" })} data-domain-main-site>{w.main.openSite}<ExternalLink data-icon aria-hidden /></a>
            <a href={links.panel} target="_blank" rel="noreferrer noopener" className={buttonVariants({ variant: "outline", size: "sm" })} data-domain-main-panel>{w.main.openPanel}<ExternalLink data-icon aria-hidden /></a>
          </span>
        )}
      </div>

      {/* The owner's own words (2026-11-17): the node went public before it had its architect — sign in now, or lose the panel from the web. */}
      {architect === false && (
        <div className="flex flex-col gap-2 rounded-lg border border-warning bg-warning/10 p-3" role="alert" data-block="domain-main-notice" data-domain-notice="no-architect">
          <p className="text-sm text-foreground text-pretty">{w.main.notice}</p>
          {signInHref && <a href={signInHref} className={cn(buttonVariants({ size: "sm" }), "w-fit")} data-domain-notice-signin>{w.main.noticeButton}</a>}
        </div>
      )}

      {/* 775 (the owner: «в одном стиле с вкладкой сервер … не хватает четвёртого шага»): the main domain's ladder — three passed rungs as
          one line each, the fourth (every element's subdomain) open. */}
      <Ladder id="domain-main-live" locked={w.pipe.locked} rungs={[
        { id: "zone", title: w.pipe.t1, done: true, summary: w.pipe.s1, body: null },
        { id: "ns", title: w.pipe.t2, done: true, summary: w.pipe.s2, body: null },
        { id: "active", title: w.pipe.t3main, done: true, summary: w.pipe.s3main, body: null },
        { id: "fourth", title: w.pipe.t4main, done: subs === true, error: subs === false, body: <DomainSubdomains lang={lang} words={w} onResult={setSubs} /> },
      ]} />

      <Accordion type="single" collapsible className="rounded-lg border border-border bg-card px-4" data-block="domain-main-copy">
        <StaticCopyItem lang={lang} words={ladderWords.copy} />
      </Accordion>


      {/* 775 (the owner, 2026-11-17: «кнопку отключить основной домен не красного … голубого цвета»): an irreversible act is red and asks
          in the one modal, like «Убрать из списка». */}
      <Button type="button" variant="destructive" size="sm" className="w-fit" onClick={() => setConfirm(true)} data-domain-disconnect>{w.main.disconnect}</Button>
      <AppDialog
        open={confirm}
        onOpenChange={(o) => { if (!o && !busy) setConfirm(false) }}
        title={w.main.disconnect}
        ui={dialogUi}
        footer={
          <>
            <Button variant="outline" disabled={busy} onClick={() => setConfirm(false)}>{w.cancel}</Button>
            <Button variant="destructive" disabled={busy} onClick={() => void disconnect()} data-domain-disconnect-yes>{busy ? w.main.disconnecting : w.main.disconnectYes}</Button>
          </>
        }
      >
        <p className="text-sm text-foreground text-pretty">{w.main.disconnectConfirm.replace("{domain}", name)}</p>
      </AppDialog>
      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
    </div>
  )
}

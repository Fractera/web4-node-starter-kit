"use client"
// @local — step 3 of the launch when the domain's DNS is in Cloudflare (one route: «Активация выделенного сервера»): the node's own write, or the key first

import { type ReactNode, useState } from "react"
import { AppDialog } from "@/components/dialog/app-dialog.client"
import type { AppDialogUi } from "@/components/dialog/app-dialog.i18n"
import type { ServerLaunchWords } from "@/components/hosting/server-launch.i18n"
import { Button, buttonVariants } from "@/components/ui/button"
import { Small } from "@/components/ui/typography"

// 760-8 (the owner, 2026-11-16: «если ты определил что домен привязан к Cloud Flyer … тебе нужен Token и значит ты автоматически
// показываешь другой сценарий … её недостаток был в ручном выборе»): no question here — the door measured whether the node's key sees the
// zone (`records-plan`). It does → the plan and one button; the AppDialog names every record, the removals in the destructive colour, and
// sends back exactly the removals it showed (the door refuses if the zone changed). It does not → the key first, «by hand» below.

export type CfPlan = { add: Array<{ host: string }>; change: Array<{ host: string; id: string }>; remove: Array<{ id: string; host: string; type: string; content: string }>; blocked: Array<{ host: string; content: string }> }
export type CfAnswer = { key: boolean; zone?: string; ip?: string; visible?: boolean; plan?: CfPlan | null; written?: { add: number; change: number; remove: number; at: string } }

const fill = (t: string, map: Record<string, string>) => Object.entries(map).reduce((s, [k, v]) => s.split(`{${k}}`).join(v), t)

export function CloudflareWrite({ cf, words, busy, dialogUi, manual, onWrite, onAgain }: {
  cf: CfAnswer; words: ServerLaunchWords["cf"]; busy: boolean; dialogUi: AppDialogUi; manual: ReactNode; onWrite: (remove: string[]) => unknown; onAgain: () => unknown
}) {
  const [open, setOpen] = useState(false)
  const [hand, setHand] = useState(false)
  const zone = cf.zone ?? ""
  const plan = cf.visible ? cf.plan : null
  if (!plan) {
    return (
      <div className="flex flex-col gap-3" data-block="server-launch-cf-key">
        <Small className="max-w-prose text-foreground">{fill(cf.key ? words.notVisible : words.noKey, { zone })}</Small>
        <div className="flex flex-wrap items-center gap-2" data-block="server-launch-cf-key-actions">
          <a className={buttonVariants({ size: "sm", variant: "outline" })} href="domain">{words.keyLink}</a>
          <Button disabled={busy} onClick={() => void onAgain()} size="sm" variant="ghost">{words.again}</Button>
        </div>
        {manual}
      </div>
    )
  }
  const ip = cf.ip ?? ""
  const lines = [
    ...plan.add.map((a) => ({ key: `add-${a.host}`, text: fill(words.add, { name: a.host, ip }), gone: false })),
    ...plan.change.map((c) => ({ key: `change-${c.id}`, text: fill(words.change, { name: c.host, ip }), gone: false })),
    ...plan.remove.map((r) => ({ key: `remove-${r.id}`, text: fill(words.remove, { type: r.type, name: r.host, content: r.content }), gone: true })),
  ]
  const list = (
    <ul className="flex list-disc flex-col gap-1 pl-5 font-mono text-sm" data-block="server-launch-cf-plan">
      {lines.map((l) => <li className={l.gone ? "text-destructive" : "text-foreground"} key={l.key}>{l.text}</li>)}
    </ul>
  )
  return (
    <div className="flex flex-col gap-3" data-block="server-launch-cf">
      <Small className="font-medium text-foreground">{words.title}</Small>
      <Small className="max-w-prose text-muted-foreground">{fill(words.lead, { zone })}</Small>
      {plan.blocked.map((b) => <Small className="text-destructive" key={b.host}>{fill(words.blocked, { name: b.host, content: b.content })}</Small>)}
      {cf.written ? <Small className="font-medium text-foreground" data-block="server-launch-cf-written">{fill(words.written, { add: String(cf.written.add + cf.written.change), remove: String(cf.written.remove), time: new Date(cf.written.at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }) })}</Small> : null}
      {lines.length ? list : <Small className="text-muted-foreground">{words.nothing}</Small>}
      <div className="flex flex-wrap items-center gap-3" data-block="server-launch-cf-actions">
        {/* ✗ 2026-11-18 15:17 (Telegram 707): a zone that already leads every name to the server left no way on — step 3.4 never
            opened. The same door with nothing to write sets the way and checks the records; the zone is not touched. */}
        {lines.length
          ? <Button disabled={busy || plan.blocked.length > 0} onClick={() => setOpen(true)} size="sm">{words.write}</Button>
          : <Button disabled={busy || plan.blocked.length > 0} onClick={() => void onWrite([])} size="sm">{words.proceed}</Button>}
        <Button onClick={() => setHand((h) => !h)} size="sm" variant="ghost">{words.byHand}</Button>
      </div>
      {hand ? manual : null}
      <AppDialog
        footer={
          <>
            <Button onClick={() => setOpen(false)} variant="outline">{words.cancel}</Button>
            <Button disabled={busy} onClick={() => { setOpen(false); void onWrite(plan.remove.map((r) => r.id)) }} variant={plan.remove.length ? "destructive" : "default"}>{words.confirm}</Button>
          </>
        }
        onOpenChange={(o) => { if (!o) setOpen(false) }}
        open={open}
        title={fill(words.confirmTitle, { zone })}
        ui={dialogUi}
      >
        <div className="flex flex-col gap-3" data-block="server-launch-cf-confirm">
          <Small className="text-foreground">{words.confirmLead}</Small>
          {lines.length ? list : <Small className="text-muted-foreground">{words.nothing}</Small>}
          {plan.remove.length ? <Small className="text-destructive">{words.confirmRemove}</Small> : null}
        </div>
      </AppDialog>
    </div>
  )
}

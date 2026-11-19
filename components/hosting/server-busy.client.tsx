"use client"
// @local — the busy-server choice of the launch ladder (one route: «Активация выделенного сервера»): free the server behind AppDialog

import { useState } from "react"
import { AppDialog } from "@/components/dialog/app-dialog.client"
import type { AppDialogUi } from "@/components/dialog/app-dialog.i18n"
import type { ServerLaunchWords } from "@/components/hosting/server-launch.i18n"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Small } from "@/components/ui/typography"

// A SERVER THAT IS NOT EMPTY (node step 737-7). The owner, 2026-11-13: «если мы обнаружили что сервер занят то … вернуть соответствующее
// предупреждение и действия очистить сервер и подготовить к установке нового приложения Fractera или отменить установку … И очистить
// должно иметь подтверждающий диалог чтоб пользователь понимал с какими рисками сталкивается». 738: the page keeps nothing — to cancel is
// simply not to go on (the node's key on the server is harmless and lets this computer come back), so only «Очистить» stays.
// 🔒 THE RISK IS SAID BEFORE THE ACT, WITH THE SERVER'S OWN NAMES: the sites the probe found and the number of programs; the button stays
// locked until the person ticks «I understand», and the door frees nothing without the server's address sent back from this dialog.

/** 806-1: a Fractera node is erased by the clear — the answer names it (`nodes`, `erased`) and the gigabytes it freed; `disk` — the
 *  server's disk before the act (probe.sh), said in the dialog. */
export type BusyDisk = { totalGb: number; usedGb: number; freeGb: number; copies: string[]; copiesGb: number | null }
export type BusyState = { host?: string; sites: string[]; programs: number; nodes?: string[]; disk?: BusyDisk | null; clear?: { state?: string; detail?: string; stopped?: number; backup?: string | null; nodes?: string[]; erased?: string[]; freedGb?: number; freeGb?: number } }
type Start = (action: string, extra?: Record<string, unknown>) => Promise<void>

// 784 (the owner, 2026-11-18: «мне нужна кнопка очистить данный сервер»): `fresh` — the same choice for a server holding THIS node's own
// older install: «Установить с нуля» (the door's `fresh`), the risk said first, «I understand» before the button. 806-1 (the owner,
// 2026-11-19: «полная очистка»): the old node is ERASED with every older copy — the dialog says «for good» and the disk as it is now.
export function ServerBusy({ busy, words, dialogUi, disabled, onStart, fresh = false }: { busy: BusyState; words: ServerLaunchWords["busy"]; dialogUi: AppDialogUi; disabled: boolean; onStart: Start; fresh?: boolean }) {
  const [open, setOpen] = useState<"clear" | null>(null)
  const [agree, setAgree] = useState(false)
  const host = busy.host ?? ""
  const fill = (t: string) => t.replace("{host}", host).replace("{sites}", busy.sites.join(", ") || "—").replace("{n}", String(busy.programs)).replace("{nodes}", (busy.nodes ?? []).join(", "))
  // 744-4: a Fractera node not related to this one — «delete the previous state», its own risk first.
  const node = (busy.nodes ?? []).length > 0
  // 744 wishes: a line about sites or programs the server does not have is not shown («сайты: —.», «0 программ» read as nonsense)
  const has = (r: string) => (!r.includes("{sites}") || busy.sites.length > 0) && (!r.includes("{n}") || busy.programs > 0)
  const d = busy.disk
  const copies = d?.copies.length ? `${d.copies.length}${d.copiesGb !== null ? ` · ${d.copiesGb} GB` : ""}` : words.copiesNone
  const disk = (fresh || node) && d ? [words.freshDisk.replace("{used}", String(d.usedGb)).replace("{total}", String(d.totalGb)).replace("{free}", String(d.freeGb)).replace("{copies}", copies)] : []
  const risks = [...(fresh ? [words.freshRisk] : (node ? [words.nodeRisk, ...words.risks] : words.risks).filter(has)), ...disk]
  const clearing = busy.clear?.state === "running"

  async function go() {
    setOpen(null)
    setAgree(false)
    await onStart("clear", { confirm: host, ...(fresh ? { fresh: true } : {}) })
  }

  // The owner's run, 2026-11-13 16:26: the server was freed and probed again, but the same red panel with the same buttons stayed — «похоже
  // ничего не работает». A freed server shows one calm line; while freeing, a spinner says what happens.
  if (busy.clear?.state === "done") {
    const c = busy.clear
    const erased = (c.nodes ?? []).length > 0
    return (
      <p className="mt-3 rounded-lg border border-primary/40 bg-primary/5 p-3 text-foreground text-sm" data-block="server-busy-freed" data-erased={erased ? "1" : "0"}>
        {erased
          ? words.erasedDone.replace("{nodes}", (c.nodes ?? []).join(", ")).replace("{count}", String(Math.max(0, (c.erased ?? []).length - (c.nodes ?? []).length))).replace("{freed}", String(c.freedGb ?? 0)).replace("{free}", String(c.freeGb ?? "—"))
          : words.cleared.replace("{n}", String(c.stopped ?? 0)).replace("{backup}", c.backup ?? "")}
      </p>
    )
  }
  return (
    <div className="mt-3 flex flex-col gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-3" data-block="server-busy" data-busy-mode={fresh ? "fresh" : node ? "node" : "busy"}>
      <p className="font-medium text-foreground text-sm">{fresh ? words.freshTitle : node ? words.nodeTitle : words.title}</p>
      <Small className="text-muted-foreground">{fresh ? words.freshText : node ? words.nodeText : words.text}</Small>
      {clearing ? (
        <p className="flex items-center gap-2 text-foreground text-sm" data-block="server-busy-clearing" role="status">
          <Spinner className="size-4" />
          {words.clearing}
        </p>
      ) : null}
      {busy.clear?.state === "failed" ? <Small className="break-all text-destructive">{words.failed} {busy.clear.detail}</Small> : null}
      <div className="flex flex-wrap gap-2">
        <Button disabled={disabled || clearing} onClick={() => setOpen("clear")} size="sm" variant="destructive">{fresh ? words.freshClear : node ? words.nodeClear : words.clear}</Button>
      </div>

      <AppDialog
        footer={
          <>
            <Button onClick={() => setOpen(null)} variant="outline">{words.notNow}</Button>
            <Button disabled={!agree} onClick={() => void go()} variant="destructive">{words.clearConfirm}</Button>
          </>
        }
        onOpenChange={(o) => { if (!o) { setOpen(null); setAgree(false) } }}
        open={open === "clear"}
        title={fill(words.clearTitle)}
        ui={dialogUi}
      >
        <ul className="flex list-disc flex-col gap-2 pl-5 text-foreground text-sm" data-block="server-busy-risks">
          {risks.map((r) => <li key={r}>{fill(r)}</li>)}
        </ul>
        <div className="mt-4 flex items-center gap-2" data-block="server-busy-agree">
          <Checkbox checked={agree} id="server-busy-agree" onCheckedChange={(v) => setAgree(v === true)} />
          <Label htmlFor="server-busy-agree">{fill(fresh ? words.freshAgree : words.agree)}</Label>
        </div>
      </AppDialog>

    </div>
  )
}

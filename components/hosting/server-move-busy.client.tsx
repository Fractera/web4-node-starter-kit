"use client"
// @local — the busy-server choice of the move ladder (one route: the tab «Выделенный сервер»): free the server or cancel, each behind AppDialog

import { useState } from "react"
import { AppDialog } from "@/components/dialog/app-dialog.client"
import type { AppDialogUi } from "@/components/dialog/app-dialog.i18n"
import type { ServerMoveWords } from "@/components/hosting/server-move.i18n"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Small } from "@/components/ui/typography"

// A SERVER THAT IS NOT EMPTY (node step 737-7). The owner, 2026-11-13: «если мы обнаружили что сервер занят то … вернуть соответствующее
// предупреждение и действия очистить сервер и подготовить к установке нового приложения Fractera или отменить установку … И очистить
// должно иметь подтверждающий диалог чтоб пользователь понимал с какими рисками сталкивается».
// 🔒 THE RISK IS SAID BEFORE THE ACT, WITH THE SERVER'S OWN NAMES: the sites the probe found and the number of programs; the button stays
// locked until the person ticks «I understand», and the door frees nothing without the server's address sent back from this dialog.

export type BusyState = { host?: string; sites: string[]; programs: number; clear?: { state?: string; detail?: string; stopped?: number; backup?: string } }
type Start = (rung: string, extra?: Record<string, unknown>) => Promise<void>

export function ServerBusy({ busy, words, dialogUi, disabled, onStart }: { busy: BusyState; words: ServerMoveWords["busy"]; dialogUi: AppDialogUi; disabled: boolean; onStart: Start }) {
  const [open, setOpen] = useState<"clear" | "cancel" | null>(null)
  const [agree, setAgree] = useState(false)
  const host = busy.host ?? ""
  const fill = (t: string) => t.replace("{host}", host).replace("{sites}", busy.sites.join(", ") || "—").replace("{n}", String(busy.programs))
  const clearing = busy.clear?.state === "running"

  async function go(rung: "clear" | "cancel") {
    setOpen(null)
    setAgree(false)
    await onStart(rung, rung === "clear" ? { confirm: host } : {})
  }

  return (
    <div className="mt-3 flex flex-col gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-3" data-block="server-move-busy">
      <p className="font-medium text-foreground text-sm">{words.title}</p>
      <Small className="text-muted-foreground">{words.text}</Small>
      {clearing ? <Small className="text-muted-foreground">{words.clearing}</Small> : null}
      {busy.clear?.state === "failed" ? <Small className="break-all text-destructive">{words.failed} {busy.clear.detail}</Small> : null}
      {busy.clear?.state === "done" ? <Small className="text-foreground">{words.cleared.replace("{n}", String(busy.clear.stopped ?? 0)).replace("{backup}", busy.clear.backup ?? "")}</Small> : null}
      <div className="flex flex-wrap gap-2">
        <Button disabled={disabled || clearing} onClick={() => setOpen("clear")} size="sm" variant="destructive">{words.clear}</Button>
        <Button disabled={disabled || clearing} onClick={() => setOpen("cancel")} size="sm" variant="outline">{words.cancel}</Button>
      </div>

      <AppDialog
        footer={
          <>
            <Button onClick={() => setOpen(null)} variant="outline">{words.notNow}</Button>
            <Button disabled={!agree} onClick={() => void go("clear")} variant="destructive">{words.clearConfirm}</Button>
          </>
        }
        onOpenChange={(o) => { if (!o) { setOpen(null); setAgree(false) } }}
        open={open === "clear"}
        title={fill(words.clearTitle)}
        ui={dialogUi}
      >
        <ul className="flex list-disc flex-col gap-2 pl-5 text-foreground text-sm" data-block="server-move-busy-risks">
          {words.risks.map((r) => <li key={r}>{fill(r)}</li>)}
        </ul>
        <div className="mt-4 flex items-center gap-2" data-block="server-move-busy-agree">
          <Checkbox checked={agree} id="server-move-busy-agree" onCheckedChange={(v) => setAgree(v === true)} />
          <Label htmlFor="server-move-busy-agree">{fill(words.agree)}</Label>
        </div>
      </AppDialog>

      <AppDialog
        description={words.cancelText}
        footer={
          <>
            <Button onClick={() => setOpen(null)} variant="outline">{words.notNow}</Button>
            <Button onClick={() => void go("cancel")}>{words.cancelConfirm}</Button>
          </>
        }
        onOpenChange={(o) => { if (!o) setOpen(null) }}
        open={open === "cancel"}
        title={fill(words.cancelTitle)}
        ui={dialogUi}
      />
    </div>
  )
}

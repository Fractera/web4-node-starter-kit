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

export type BusyState = { host?: string; sites: string[]; programs: number; clear?: { state?: string; detail?: string; stopped?: number; backup?: string } }
type Start = (action: string, extra?: Record<string, unknown>) => Promise<void>

export function ServerBusy({ busy, words, dialogUi, disabled, onStart }: { busy: BusyState; words: ServerLaunchWords["busy"]; dialogUi: AppDialogUi; disabled: boolean; onStart: Start }) {
  const [open, setOpen] = useState<"clear" | null>(null)
  const [agree, setAgree] = useState(false)
  const host = busy.host ?? ""
  const fill = (t: string) => t.replace("{host}", host).replace("{sites}", busy.sites.join(", ") || "—").replace("{n}", String(busy.programs))
  const clearing = busy.clear?.state === "running"

  async function go() {
    setOpen(null)
    setAgree(false)
    await onStart("clear", { confirm: host })
  }

  // The owner's run, 2026-11-13 16:26: the server was freed and probed again, but the same red panel with the same buttons stayed — «похоже
  // ничего не работает». A freed server shows one calm line; while freeing, a spinner says what happens.
  if (busy.clear?.state === "done") {
    return (
      <p className="mt-3 rounded-lg border border-primary/40 bg-primary/5 p-3 text-foreground text-sm" data-block="server-busy-freed">
        {words.cleared.replace("{n}", String(busy.clear.stopped ?? 0)).replace("{backup}", busy.clear.backup ?? "")}
      </p>
    )
  }
  return (
    <div className="mt-3 flex flex-col gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-3" data-block="server-busy">
      <p className="font-medium text-foreground text-sm">{words.title}</p>
      <Small className="text-muted-foreground">{words.text}</Small>
      {clearing ? (
        <p className="flex items-center gap-2 text-foreground text-sm" data-block="server-busy-clearing" role="status">
          <Spinner className="size-4" />
          {words.clearing}
        </p>
      ) : null}
      {busy.clear?.state === "failed" ? <Small className="break-all text-destructive">{words.failed} {busy.clear.detail}</Small> : null}
      <div className="flex flex-wrap gap-2">
        <Button disabled={disabled || clearing} onClick={() => setOpen("clear")} size="sm" variant="destructive">{words.clear}</Button>
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
          {words.risks.map((r) => <li key={r}>{fill(r)}</li>)}
        </ul>
        <div className="mt-4 flex items-center gap-2" data-block="server-busy-agree">
          <Checkbox checked={agree} id="server-busy-agree" onCheckedChange={(v) => setAgree(v === true)} />
          <Label htmlFor="server-busy-agree">{fill(words.agree)}</Label>
        </div>
      </AppDialog>

    </div>
  )
}

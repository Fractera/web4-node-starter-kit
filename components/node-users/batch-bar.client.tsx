"use client"

import { useState } from "react"
import { AppDialog } from "@/components/dialog/app-dialog.client"
import type { AppDialogUi } from "@/components/dialog/app-dialog.i18n"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ALL_ROLES } from "@/lib/roles"
import type { NodeUsersUi } from "./node-users.i18n"
import type { Org } from "./node-users.client"

// ПАКЕТНЫЕ ДЕЙСТВИЯ НАД ВЫБРАННЫМИ СТРОКАМИ (узел, шаг 559-5). Слово владельца: «Любое действие пакетное для экономии ресурсов после
// дополнительного подтверждения». Выбор → действие (и роль или организация, если нужно) → окно подтверждения с числом людей → один
// запрос → итог «сделано / пропущено» с причинами. «Разрешить рассылки» пакетом не даётся: согласие даёт сам человек (решение 559).

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
type Act = keyof NodeUsersUi["actions"]
const NEEDS: Partial<Record<Act, "role" | "org">> = { addRole: "role", removeRole: "role", addOrg: "org", removeOrg: "org" }
const DOOR: Record<Act, { action: string; value?: unknown }> = {
  block: { action: "block" }, unblock: { action: "unblock" }, addRole: { action: "addRole" }, removeRole: { action: "removeRole" },
  addOrg: { action: "addOrg" }, removeOrg: { action: "removeOrg" }, noMarketing: { action: "marketing", value: false },
  noTracking: { action: "tracking", value: false }, anonymize: { action: "anonymize" },
}

export function BatchBar({ ids, orgs, ui, dialogUi, onClear, onDone }: {
  ids: string[]; orgs: Org[]; ui: NodeUsersUi; dialogUi: AppDialogUi; onClear: () => void; onDone: () => void
}) {
  const [act, setAct] = useState<Act | "">("")
  const [arg, setArg] = useState("")
  const [asking, setAsking] = useState(false)
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const need = act ? NEEDS[act] : undefined
  const ready = !!act && (!need || !!arg)

  async function run() {
    if (!act) return
    setSending(true)
    try {
      const d = DOOR[act]
      const r = await fetch(`${BASE}/api/node/users/batch`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: d.action, ids, value: need ? arg : d.value }),
      })
      const j = (await r.json().catch(() => ({}))) as { ok?: boolean; error?: string; done?: string[]; skipped?: { id: string; reason: string }[] }
      if (!j.ok) setResult(ui.reasons[j.error ?? ""] ?? j.error ?? ui.failed)
      else {
        const reasons = [...new Set((j.skipped ?? []).map((s) => ui.reasons[s.reason] ?? s.reason))]
        setResult(ui.result.replace("{done}", String(j.done?.length ?? 0)).replace("{skipped}", `${j.skipped?.length ?? 0}${reasons.length ? ` (${reasons.join("; ")})` : ""}`))
        onDone()
      }
    } catch {
      setResult(ui.unreachable)
    } finally {
      setSending(false)
      setAsking(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-muted/40 p-3" data-batch-bar={ids.length}>
      <span className="text-sm font-medium text-foreground">{ui.selected.replace("{n}", String(ids.length))}</span>
      <Select value={act} onValueChange={(v) => { setAct(v as Act); setArg(""); setResult(null) }}>
        <SelectTrigger className="h-9 w-56" aria-label={ui.confirm} data-batch-action><SelectValue placeholder="…" /></SelectTrigger>
        <SelectContent>
          {(Object.keys(DOOR) as Act[]).map((a) => <SelectItem key={a} value={a}>{ui.actions[a]}</SelectItem>)}
        </SelectContent>
      </Select>
      {need === "role" && (
        <Select value={arg} onValueChange={setArg}>
          <SelectTrigger className="h-9 w-44" aria-label={ui.pickRole}><SelectValue placeholder={ui.pickRole} /></SelectTrigger>
          <SelectContent>{ALL_ROLES.filter((r) => r !== "guest").map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
        </Select>
      )}
      {need === "org" && (
        <Select value={arg} onValueChange={setArg}>
          <SelectTrigger className="h-9 w-48" aria-label={ui.pickOrg}><SelectValue placeholder={ui.pickOrg} /></SelectTrigger>
          <SelectContent>{orgs.map((o) => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}</SelectContent>
        </Select>
      )}
      <Button size="sm" disabled={!ready || sending} onClick={() => setAsking(true)} data-batch-apply>{ui.confirm}…</Button>
      <Button size="sm" variant="ghost" onClick={onClear}>{ui.clear}</Button>
      {result && <span className="text-sm text-muted-foreground" data-batch-result>{result}</span>}
      <p className="basis-full text-xs text-muted-foreground">{ui.marketingBatchNote}</p>

      {asking && act && (
        <AppDialog
          open
          onOpenChange={(o) => { if (!o) setAsking(false) }}
          title={act === "anonymize" ? ui.anonymizeTitle : ui.confirmBatchTitle}
          description={ui.confirmBatchText.replace("{action}", ui.actions[act]).replace("{n}", String(ids.length))}
          ui={dialogUi}
          size="md"
          footer={
            <>
              <Button variant="outline" onClick={() => setAsking(false)} disabled={sending} data-batch-cancel>{ui.cancel}</Button>
              <Button variant={act === "anonymize" ? "destructive" : "default"} onClick={() => void run()} disabled={sending} data-batch-confirm>{ui.confirm}</Button>
            </>
          }
        >
          {act === "anonymize" && (
            <div className="flex flex-col gap-2 px-5 py-4 text-sm">
              <p>{ui.anonymizeErased}</p>
              <p>{ui.anonymizeKept}</p>
            </div>
          )}
        </AppDialog>
      )}
    </div>
  )
}

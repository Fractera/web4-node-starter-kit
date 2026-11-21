"use client"
// @local — step 9 of the launch ladder (one route: «Активация выделенного сервера»): the architect's e-mail passed to the server, the one button to its registration

import { ExternalLink } from "lucide-react"
import { useState } from "react"
import type { ClaimWords } from "@/components/hosting/server-launch.i18n"
import { Button, buttonVariants } from "@/components/ui/button"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { AppDialog } from "@/components/dialog/app-dialog.client"
import type { AppDialogUi } from "@/components/dialog/app-dialog.i18n"
import { ActionButton } from "@/components/hosting/action-button.client"
import { Small } from "@/components/ui/typography"

type Act = (action: string, extra?: Record<string, unknown>) => Promise<unknown>
const fill = (t: string, map: Record<string, string>) => Object.entries(map).reduce((s, [k, v]) => s.split(`{${k}}`).join(v), t)

/** 796 (the owner, Telegram 686 — his text): the architect of a fresh server is the e-mail given here; the server's sign-in element keeps
 *  its hash and lets only that e-mail register first. The e-mail lives in this island's memory only (744-7: kept above the ladder). */
export type ClaimShown = { sent: string | null; claimed: boolean | null }
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function Claim({ zone, words, busy, onAct, shown, onShown, dialogUi }: { zone: string; words: ClaimWords; busy: boolean; onAct: Act; shown: ClaimShown; onShown: (c: ClaimShown) => void; dialogUi: AppDialogUi }) {
  const w = words
  const [email, setEmail] = useState(shown.sent ?? "")
  const [failed, setFailed] = useState<string | null>(null)
  const [missing, setMissing] = useState(false)
  // 831-2 (the owner, 2026-11-21, Telegram 608: «если я делаю опечатку у меня нет шансов восстановить поэтому как только я написал свой
  // e-mail должна быть кнопка авторизовать архитектора выводится модальное окно» — «аналогичного Danger zone»): the address leaves for the
  // server only from the dialog, after the person ticked that they checked it. ✗ Before (814-2): it left by itself 0.9 s after the last
  // key — a typo went silently and made a stranger's address the architect for good.
  const [open, setOpen] = useState(false)
  const [agree, setAgree] = useState(false)
  const register = `https://auth.${zone}/register`
  const clean = email.trim().toLowerCase()
  const ok = EMAIL.test(clean)
  const confirmed = ok && shown.sent === clean
  async function go(address: string) {
    setFailed(null)
    const a = (await onAct("claim", { email: address })) as { reason?: string; answer?: { ok?: boolean; reason?: string } } | undefined
    if (a?.answer?.ok) { onShown({ sent: address, claimed: false }); return }
    if (a?.answer?.reason === "claimed") { onShown({ sent: null, claimed: true }); return }
    setFailed(a?.answer?.reason ?? a?.reason ?? "network")
  }
  return (
    <div className="flex flex-col gap-3 rounded-md bg-muted/40 p-3" data-block="server-launch-claim">
      <Small className="text-foreground">{w.claimLead}</Small>
      <ol className="flex list-decimal flex-col gap-1 pl-5 text-foreground text-sm">{w.claimSteps.map((t) => <li key={t}>{t}</li>)}</ol>
      <Field>
        <FieldLabel htmlFor="launch-claim-email">{w.claimEmail}</FieldLabel>
        <Input aria-invalid={missing || undefined} autoComplete="email" id="launch-claim-email" inputMode="email" onChange={(e) => { setEmail(e.target.value); setMissing(false) }} type="email" value={email} />
        {missing ? <FieldDescription className="text-destructive">{w.claimMissing}</FieldDescription> : null}
      </Field>
      {confirmed ? <Small className="text-foreground" data-block="server-launch-claim-sent">{fill(w.claimSent, { email: shown.sent ?? clean })}</Small> : null}
      {failed ? <Small className="text-destructive" data-block="server-launch-claim-failed" role="status">{fill(w.claimFailed, { reason: failed })}</Small> : null}
      <div className="flex flex-wrap gap-2" data-block="server-launch-claim-go">
        {confirmed
          ? <a className={buttonVariants({})} href={register} rel="noopener noreferrer" target="_blank">{w.claimOpen}<ExternalLink aria-hidden data-icon /></a>
          : <ActionButton disabled={busy} onAction={() => { if (!ok) { setMissing(true); return } setAgree(false); setOpen(true) }} size="default">{w.claimButton}</ActionButton>}
      </div>
      <Small className="rounded-md border border-warning/50 bg-warning/10 px-3 py-2 font-medium text-foreground" role="note">! {w.claimLoss}</Small>
      <AppDialog
        footer={
          <>
            <Button onClick={() => setOpen(false)} variant="outline">{w.claimDialogBack}</Button>
            <ActionButton disabled={!agree} kind="danger" onAction={async () => { await go(clean); setOpen(false) }} pendingText={w.claimSending} size="default">{w.claimDialogConfirm}</ActionButton>
          </>
        }
        onOpenChange={(o) => { if (!o) { setOpen(false); setAgree(false) } }}
        open={open}
        title={w.claimDialogTitle}
        ui={dialogUi}
      >
        <p className="break-all font-mono text-lg font-semibold text-foreground" data-block="server-launch-claim-address">{clean}</p>
        <p className="mt-3 text-foreground text-sm text-pretty">{fill(w.claimDialogText, { email: clean })}</p>
        <div className="mt-4 flex items-center gap-2" data-block="server-launch-claim-agree">
          <Checkbox checked={agree} id="launch-claim-agree" onCheckedChange={(v) => setAgree(v === true)} />
          <Label htmlFor="launch-claim-agree">{fill(w.claimDialogAgree, { email: clean })}</Label>
        </div>
      </AppDialog>
    </div>
  )
}

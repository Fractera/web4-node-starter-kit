"use client"
// @local — step 9 of the launch ladder (one route: «Активация выделенного сервера»): the architect's e-mail passed to the server, the one button to its registration

import { ExternalLink } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import type { ServerLaunchWords } from "@/components/hosting/server-launch.i18n"
import { Button, buttonVariants } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Small } from "@/components/ui/typography"

type Act = (action: string, extra?: Record<string, unknown>) => Promise<unknown>
const fill = (t: string, map: Record<string, string>) => Object.entries(map).reduce((s, [k, v]) => s.split(`{${k}}`).join(v), t)

/** 796 (the owner, Telegram 686 — his text): the architect of a fresh server is the e-mail given here; the server's sign-in element keeps
 *  its hash and lets only that e-mail register first. The e-mail lives in this island's memory only (744-7: kept above the ladder). */
export type ClaimShown = { sent: string | null; claimed: boolean | null }
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function Claim({ zone, words, busy, onAct, shown, onShown }: { zone: string; words: ServerLaunchWords; busy: boolean; onAct: Act; shown: ClaimShown; onShown: (c: ClaimShown) => void }) {
  const w = words.ready
  const [email, setEmail] = useState(shown.sent ?? "")
  const [sending, setSending] = useState(false)
  const [failed, setFailed] = useState<string | null>(null)
  const register = `https://auth.${zone}/register`
  const clean = email.trim().toLowerCase()
  const ok = EMAIL.test(clean)
  const confirmed = ok && shown.sent === clean
  // 814-2 (the owner, Telegram 212, 2026-11-20: «Кнопка перейти на сервер путает»): one road — the address goes to the server by itself
  // once it is a whole e-mail (0.9 s after the last key; ✗ 2026-11-18: never a blank tab while it travels), and the one button opens
  // the registration only when the server said yes. A refused address is passed again only by the person's press.
  const asked = useRef("")
  async function go(address: string) {
    asked.current = address
    setSending(true); setFailed(null)
    const a = (await onAct("claim", { email: address })) as { reason?: string; answer?: { ok?: boolean; reason?: string } } | undefined
    setSending(false)
    if (a?.answer?.ok) { onShown({ sent: address, claimed: false }); return }
    if (a?.answer?.reason === "claimed") { onShown({ sent: null, claimed: true }); return }
    setFailed(a?.answer?.reason ?? a?.reason ?? "network")
  }
  useEffect(() => {
    if (!ok || confirmed || sending || asked.current === clean) return
    const t = setTimeout(() => void go(clean), 900)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps -- `go` is this render's; the address is the trigger
  }, [clean, ok, confirmed, sending])
  return (
    <div className="flex flex-col gap-3 rounded-md bg-muted/40 p-3" data-block="server-launch-claim">
      <Small className="text-foreground">{w.claimLead}</Small>
      <ol className="flex list-decimal flex-col gap-1 pl-5 text-foreground text-sm">{w.claimSteps.map((t) => <li key={t}>{t}</li>)}</ol>
      <Field>
        <FieldLabel htmlFor="launch-claim-email">{w.claimEmail}</FieldLabel>
        <Input autoComplete="email" id="launch-claim-email" inputMode="email" onChange={(e) => setEmail(e.target.value)} type="email" value={email} />
      </Field>
      {sending ? <Small className="flex items-center gap-2 text-muted-foreground" role="status"><Spinner className="size-4" />{w.claimSending}</Small> : null}
      {confirmed && !sending ? <Small className="text-foreground" data-block="server-launch-claim-sent">{fill(w.claimSent, { email: shown.sent ?? clean })}</Small> : null}
      {failed && !sending ? (
        <div className="flex flex-wrap items-center gap-2" data-block="server-launch-claim-failed">
          <Small className="text-destructive" role="status">{fill(w.claimFailed, { reason: failed })}</Small>
          <Button disabled={busy || !ok} onClick={() => void go(clean)} size="sm" variant="outline">{w.claimRetry}</Button>
        </div>
      ) : null}
      <div data-block="server-launch-claim-go">
        {confirmed
          ? <a className={buttonVariants({})} href={register} rel="noopener noreferrer" target="_blank">{w.claimOpen}<ExternalLink aria-hidden data-icon /></a>
          : <Button disabled>{w.claimOpen}</Button>}
      </div>
      <Small className="rounded-md border border-warning/50 bg-warning/10 px-3 py-2 font-medium text-foreground" role="note">! {w.claimLoss}</Small>
    </div>
  )
}

"use client"
// @local — the certificate step of the server's domain (one route: the tab «Выделенный сервер»); its pieces are the part stage-log and shadcn primitives

import { ChevronDown } from "lucide-react"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Field, FieldLabel } from "@/components/ui/field"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Textarea } from "@/components/ui/textarea"
import { Small } from "@/components/ui/typography"
import type { ServerDomainWords } from "@/components/hosting/server-domain.i18n"
import { StageLog } from "@/components/hosting/stage-log"

// STEP 3 — CERTIFICATES (node step 737-8). The owner, 2026-11-13: «ты вызываешь кнопку проверки в наличии сертификатов если нет
// дополнение ших». Every name with its certificate as the server's root helper sees it; one button issues the missing ones (a detached
// run — the list follows its progress); a person whose region cannot reach Let's Encrypt, or who has their own certificate, uploads the
// pair for one name. The private key typed here leaves this island the moment it is sent.

export type CertRow = { host: string; optional: boolean; dns: string; cert: string; daysLeft: number | null; certSource: string | null }
export type CertsRun = { running: boolean; ok?: boolean; detail?: string; hosts?: Array<{ host: string; state: string; detail?: string }> } | null
type Act = (action: string, extra?: Record<string, unknown>) => Promise<void>

export function CertsStep({ rows, run, helper, words, busy, readOnly, onAct }: { rows: CertRow[]; run: CertsRun; helper: boolean; words: ServerDomainWords; busy: boolean; readOnly: boolean; onAct: Act }) {
  const [host, setHost] = useState(rows[0]?.host ?? "")
  const [fullchain, setFullchain] = useState("")
  const [privkey, setPrivkey] = useState("")
  const running = Boolean(run?.running)

  async function upload() {
    const pair = { host, fullchain, privkey }
    setPrivkey("")
    await onAct("upload", pair)
  }

  return (
    <div className="flex flex-col gap-3" data-block="server-domain-certs">
      <Small className="text-muted-foreground">{words.certsText}</Small>
      {!helper ? <Small className="text-destructive">{words.noHelper}</Small> : null}
      <ul className="flex flex-col gap-1.5" data-block="server-domain-cert-rows">
        {rows.map((r) => (
          <li className="flex flex-wrap items-center gap-2 text-sm" data-host={r.host} key={r.host}>
            <span className="font-mono text-foreground">{r.host}</span>
            <Badge variant={r.cert === "ok" ? "default" : r.cert === "expiring" ? "secondary" : "outline"}>
              {words.certState[r.cert as keyof ServerDomainWords["certState"]] ?? r.cert}
              {r.daysLeft !== null ? ` · ${words.daysLeft.replace("{n}", String(r.daysLeft))}` : ""}
              {r.certSource === "own" ? ` · ${words.own}` : ""}
            </Badge>
            {r.optional ? <span className="text-muted-foreground text-xs">{words.table.optional}</span> : null}
          </li>
        ))}
      </ul>
      {run?.hosts?.length ? <StageLog labels={{}} stages={run.hosts.map((h) => ({ id: h.host, state: h.state === "waiting" ? "skipped" : h.state, detail: h.detail }))} /> : null}
      {running ? <Small className="text-muted-foreground">{words.certsRunning}</Small> : null}
      {run && !running && run.detail ? <Small className="break-all text-destructive">{run.detail}</Small> : null}
      <div>
        <Button disabled={busy || running || readOnly || !helper} onClick={() => void onAct("certs")} size="sm">{words.certsButton}</Button>
      </div>
      {readOnly ? null : (
        <Collapsible data-block="server-domain-upload">
          <CollapsibleTrigger asChild>
            <Button className="px-0" size="sm" variant="link">{words.uploadToggle}<ChevronDown data-icon="inline-end" /></Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 flex flex-col gap-3">
            <Field>
              <FieldLabel htmlFor="server-domain-upload-host">{words.uploadHost}</FieldLabel>
              <NativeSelect id="server-domain-upload-host" onChange={(e) => setHost(e.target.value)} value={host}>
                {rows.map((r) => <NativeSelectOption key={r.host} value={r.host}>{r.host}</NativeSelectOption>)}
              </NativeSelect>
            </Field>
            <Field>
              <FieldLabel htmlFor="server-domain-upload-chain">{words.uploadChain}</FieldLabel>
              <Textarea className="font-mono text-xs" id="server-domain-upload-chain" onChange={(e) => setFullchain(e.target.value)} rows={4} value={fullchain} />
            </Field>
            <Field>
              <FieldLabel htmlFor="server-domain-upload-key">{words.uploadKey}</FieldLabel>
              <Textarea autoComplete="off" className="font-mono text-xs" id="server-domain-upload-key" onChange={(e) => setPrivkey(e.target.value)} rows={4} value={privkey} />
            </Field>
            <div>
              <Button disabled={busy || !host || !fullchain.trim() || !privkey.trim() || !helper} onClick={() => void upload()} size="sm" variant="secondary">{words.uploadSend}</Button>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  )
}

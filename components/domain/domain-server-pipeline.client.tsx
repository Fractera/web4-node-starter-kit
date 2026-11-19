"use client"
// @local — the body of a domain's card on «Активация домена» when the node lives on its own server (step 799): public DNS, not Cloudflare

import { useState } from "react"
import { DnsRecords } from "@/components/hosting/dns-records"
import { ServerCertState } from "@/components/hosting/server-cert-state.client"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Small } from "@/components/ui/typography"
import type { DomainListWords } from "./domain-list.i18n"
import type { PipelineDomain } from "./domain-pipeline.client"

// 799 (the owner, 2026-11-18: «на сервере должна существовать возможность использования нескольких доменов так же как и версия на
// компьютере»). A server has no tunnel and no Cloudflare key: the domain is ready when public DNS leads its name to the server — the node
// measures it (`observeOnServer`, lib/domain/node-domains.ts) by a press, never by itself. Then the element's «Домен» card connects it;
// nginx and the certificate follow there (`attachOnServer` → `name-up.mjs`).

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
const fill = (t: string, map: Record<string, string>) => Object.entries(map).reduce((s, [k, v]) => s.split(`{${k}}`).join(v), t)

export type ServerDomain = PipelineDomain & { pointsTo?: string[]; serverIp?: string; aaaa?: string[] }

export function DomainServerPipeline({ lang, domain: d, holder, forItem, words: w, onChanged }: { lang: string; domain: ServerDomain; holder: string | null; forItem: string | null; words: DomainListWords; onChanged: () => Promise<void> }) {
  const s = w.server
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const ip = d.serverIp ?? ""
  const here = d.state === "active"
  const time = d.checkedAt ? new Date(d.checkedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""

  async function check() {
    setBusy(true); setError("")
    const r = await fetch(`${BASE}/api/domain/list`, { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: d.name }) })
      .then((x) => x.json()).catch(() => null) as { ok?: boolean; error?: string } | null
    if (r?.ok) await onChanged(); else setError(w.errors[r?.error ?? "unknown"] ?? `${w.errors.unknown} ${r?.error ?? ""}`)
    setBusy(false)
  }

  return (
    <div className="flex flex-col gap-3" data-block="domain-server-pipe" data-domain-server={here ? "here" : "not-yet"}>
      {here ? (
        <Small className="text-success" data-block="domain-server-here">{fill(s.here, { name: d.name, ip })}</Small>
      ) : (
        <>
          <Small className="text-muted-foreground">{s.lead}</Small>
          {ip ? <DnsRecords words={{ zone: s.zone, type: s.type, name: s.name, value: s.value, state: "", optional: s.optional, wildcard: "" }}
            zones={[{ zone: d.name, records: [{ type: "A", name: "@", value: ip, host: d.name }, { type: "A", name: "www", value: ip, host: `www.${d.name}`, optional: true }] }]} /> : null}
          {d.pointsTo ? <Small className="text-foreground" data-block="domain-server-now">{fill(s.now, { name: d.name, where: d.pointsTo.length ? d.pointsTo.join(", ") : s.nowhere })}</Small> : null}
          {d.aaaa?.length ? <Small className="text-destructive" role="status">{fill(s.aaaa, { where: d.aaaa.join(", ") })}</Small> : null}
          <Small className="text-muted-foreground">{s.note}</Small>
        </>
      )}
      <div className="flex flex-wrap items-center gap-2" data-block="domain-server-check">
        <Button disabled={busy} onClick={() => void check()} size="sm" type="button" variant="outline">{busy ? <Spinner className="size-4" /> : null}{busy ? s.checking : s.check}</Button>
        {time && !busy ? <Small className="text-muted-foreground">{fill(s.checked, { time })}</Small> : null}
      </div>
      {error ? <p className="text-destructive text-sm" role="alert">{error}</p> : null}
      {/* 801-3: a domain connected to an element — its certificate on the card, followed while it is issued */}
      {here && holder ? (
        <ServerCertState expect list={false} owner={{ hosts: [d.name, `www.${d.name}`] }} words={{ loading: s.certLoading, issuing: s.certIssuing, ready: s.certReady }} />
      ) : null}
      {here && !holder && forItem ? (
        <a className="w-fit font-medium text-primary text-sm underline-offset-4 hover:underline" href={`/${lang}/architect/${forItem}/settings/domain`}>{fill(s.back, { item: forItem })}</a>
      ) : null}
    </div>
  )
}

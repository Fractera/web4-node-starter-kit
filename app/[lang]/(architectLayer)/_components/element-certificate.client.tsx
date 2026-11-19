"use client"
// @local — the «Сертификат безопасности» card of an element's «Настройки → Домен» (one route); its body is the part server-cert-state

import { ServerCertState } from "@/components/hosting/server-cert-state.client"
import type { ServerDomainWords } from "@/components/hosting/server-domain.i18n"
import { useNodePlace } from "@/components/node-state/use-node-place.client"
import { buttonVariants } from "@/components/ui/button"
import { Small } from "@/components/ui/typography"
import type { ElementSettingsUi } from "../_i18n/element-settings.i18n"

// 801-2 (the owner, 2026-11-19: «на вкладке домен должна появиться вкладка сертификат безопасности»). On a server node — the certificate
// of this element's names (its own domain and www, its subdomain; the apex holder — the node's root and www), followed while it is
// issued; on a computer — one line: the tunnel's edge, Cloudflare, holds the certificate. The node says where it lives, never the URL.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

export function ElementCertificate({ id, domain, apex, lang, ui, domainWords }: {
  id: string; domain: string | null; apex: boolean; lang: string; ui: ElementSettingsUi; domainWords: ServerDomainWords
}) {
  const place = useNodePlace()
  const w = ui.certificateCard
  if (place === undefined) return null
  if (place?.kind !== "server") return <Small className="text-muted-foreground" data-block="element-certificate-home">{w.cloudflare}</Small>
  return (
    <div className="flex flex-col gap-3" data-block="element-certificate">
      <ServerCertState
        domainWords={domainWords}
        expect={Boolean(domain) || apex}
        owner={{ hosts: domain ? [domain, `www.${domain}`] : [], service: id, apex }}
        words={{ loading: w.loading, issuing: w.issuing, ready: w.ready }}
      />
      <a className={`${buttonVariants({ variant: "outline", size: "sm" })} w-fit`} data-block="element-certificate-all" href={`${BASE}/${lang}/hosting/certificates`}>{w.all}</a>
    </div>
  )
}

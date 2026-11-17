"use client"
// @local — «Где зарегистрировать домен», the domain page's card below both sections (step 775): it lived inside the main domain's first
// step and answered a question the person on that step had not asked

import { CircleAlert, ExternalLink } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Small } from "@/components/ui/typography"
import type { DomainLadderWords } from "./domain-ladder.i18n"
import { DomainMore } from "./domain-more"

// The owner, 2026-11-17: «информация как зарегистрировать в виде карточки … должна быть вынесено вниз после воздуха после второго элемента
// про дополнительные домены информация отдельной карточкой аккордеона где зарегистрировать».
// 🔒 Names and addresses only (2026-09-21): a price written into code goes stale silently and lies exactly when the person pays.
// 🔒 Cloudflare stands apart as the short path, not as an ad: a domain bought there is on its name servers from the start.
const REGISTRARS = [
  { name: "Porkbun", href: "https://porkbun.com" },
  { name: "Namecheap", href: "https://www.namecheap.com" },
  { name: "GoDaddy", href: "https://www.godaddy.com" },
  { name: "one.com", href: "https://www.one.com" },
  { name: "Gandi", href: "https://www.gandi.net" },
] as const

const CLOUDFLARE_REGISTRAR = "https://www.cloudflare.com/products/registrar/"

export function DomainRegistrars({ words }: { words: DomainLadderWords }) {
  return (
    <Accordion type="single" collapsible className="rounded-lg border border-border px-3" data-block="domain-registrars">
      <AccordionItem value="registrars" className="border-0" data-registrars>
        <AccordionTrigger className="font-medium">{words.registrarsTitle}</AccordionTrigger>
        <AccordionContent className="flex flex-col gap-2">
          <p className="text-muted-foreground text-sm">
            <a className="underline" href={CLOUDFLARE_REGISTRAR} rel="noreferrer noopener" target="_blank">Cloudflare Registrar</a>
            {" — "}{words.registrarCloudflare}
          </p>
          <div className="flex gap-2 rounded-md border border-warning/50 bg-warning/10 px-3 py-2" data-block="domain-registrars-fast" data-fast-path>
            <CircleAlert className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
            <p className="text-foreground text-sm"><span className="font-semibold">{words.fastPath}</span>{" "}{words.fastPathSaving}</p>
          </div>
          <DomainMore id="cf-limits" label={words.cfLimitsToggle}>
            <p className="text-foreground">{words.cfLimitsLead}</p>
            <ul className="flex list-disc flex-col gap-1 pl-5">
              <li>{words.cfLimit1}</li>
              <li>{words.cfLimit2}</li>
              <li>{words.cfLimit3}</li>
              <li>{words.cfLimit4}</li>
              <li>{words.cfLimit5}</li>
            </ul>
            <Small className="text-muted-foreground">{words.cfLimitsSource}</Small>
          </DomainMore>
          <p className="text-muted-foreground text-sm">{words.registrarOthers}</p>
          <ul className="flex flex-wrap gap-x-3 gap-y-1">
            {REGISTRARS.map((r) => (
              <li key={r.name}>
                <a className="inline-flex items-center gap-1 text-sm underline" href={r.href} rel="noreferrer noopener" target="_blank">
                  {r.name}
                  <ExternalLink className="size-3" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
          <Small className="text-muted-foreground">{words.registrarPriceNote}</Small>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

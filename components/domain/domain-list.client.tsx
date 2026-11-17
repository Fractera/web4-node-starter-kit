"use client"

import { useCallback, useEffect, useState, type ReactNode } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Small } from "@/components/ui/typography"
import type { DomainListWords } from "./domain-list.i18n"
import type { DomainLadderWords } from "./domain-ladder.i18n"
import { DomainKey, type NodeKey } from "./domain-key.client"
import { DomainCards, type Extra } from "./domain-cards.client"
import { DomainMain } from "./domain-main.client"
import { DomainMore } from "./domain-more"

// ДОМЕНЫ УЗЛА — ДВА РАЗДЕЛА-АККОРДЕОНА (775). Слово владельца 2026-11-17: «На активации домена должно быть две вкладки каждая формате
// аккордеона разделённой пространство со своим собственным под заголовком. – Верхний активация основного домена. – Дополнительные домены.
// В каждой вкладке любая дополнительная информация в формате инструкции скрыто в аккордеоне подробнее и не мешает основным интерактивным
// полям. Внутри одного аккордеона не должно быть информации о других аккордеонов». After the first try he said «не было выполнено ни на
// 1%» (the topics sheet still under the sections, the sections not accordions, the second one hidden). So:
// 🔒 Two accordion cards, both ALWAYS present, real air between them; the trigger is the section's own subheading.
// 🔒 Inside each — only its domains, fields and buttons; every instruction is folded in its own «Подробнее».
// 🔒 Each section lists its own domains: the door marks every entry with `section` (a domain added in the main section is the main
//   domain's candidate, its steps end in «Сделать основным»; one added in the additional section is for the elements).
// 🔒 The list is asked of the node (`/api/domain/list`), not remembered: the page is prerendered. Everything by a press; no polling.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

type Listed = Extra & { section?: "main" | "element" }
type List = {
  key: NodeKey
  primary: { name: string; status: string | null } | null
  extra: Listed[]
  /** 775: the node has its architect (a domain may become the main one only then); `null` — the sign-in element did not answer */
  architect: boolean | null
  links: { site: string; panel: string } | null
}

/** One section of the page: an accordion card whose trigger is the section's subheading. */
function Section({ id, title, lead, open, onOpen, children }: {
  id: "main" | "extra"; title: string; lead: string; open: boolean; onOpen: (v: boolean) => void; children: ReactNode
}) {
  return (
    <Accordion type="single" collapsible value={open ? id : ""} onValueChange={(v) => onOpen(v === id)}
      className="rounded-lg border border-border px-4" data-block={`domain-section-${id}`} data-domain-section={id}>
      <AccordionItem value={id} className="border-0">
        <AccordionTrigger className="py-4 hover:no-underline" data-domain-section-trigger={id}>
          <span className="flex flex-col gap-1">
            <span className="text-base font-semibold text-foreground">{title}</span>
            <Small className="font-normal text-muted-foreground">{lead}</Small>
          </span>
        </AccordionTrigger>
        <AccordionContent className="flex flex-col gap-3 pb-4">{children}</AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

export function DomainList({ lang, words: w, ladderWords, ladder, topics, notes }: {
  lang: string; words: DomainListWords; ladderWords: DomainLadderWords; ladder: ReactNode
  /** 775: the page's topics (rendered on the server) — the main section's «Подробнее» while the node has no main domain */
  topics: ReactNode
  /** 775: the notes on a site from a home computer — the main section's «Подробнее» always */
  notes: ReactNode
}) {
  const [list, setList] = useState<List | null>(null)
  const [failed, setFailed] = useState(false)
  const [mainOpen, setMainOpen] = useState(true)
  const [extraOpen, setExtraOpen] = useState(false)

  const load = useCallback(async () => {
    try {
      const r = await fetch(`${BASE}/api/domain/list`, { cache: "no-store" })
      if (!r.ok) throw new Error(String(r.status))
      const l = (await r.json()) as List
      setList(l)
      setFailed(false)
      if (l.extra.some((d) => d.section === "element")) setExtraOpen(true)
    } catch { setFailed(true) }
  }, [])

  useEffect(() => { void load() }, [load])
  // 443: an address with #domain-add (from an element's settings) opens the elements' section.
  useEffect(() => {
    const follow = () => { if (window.location.hash === "#domain-add") setExtraOpen(true) }
    follow()
    window.addEventListener("hashchange", follow)
    return () => window.removeEventListener("hashchange", follow)
  }, [])

  const primary = list?.primary ?? null
  const mainDomains = list ? list.extra.filter((d) => d.section === "main") : []
  const elementDomains = list ? list.extra.filter((d) => d.section !== "main") : []
  const status = failed
    ? <p className="text-sm text-destructive" role="alert">{w.loadFailed}</p>
    : !list ? <Small className="text-muted-foreground">{w.loading}</Small> : null

  return (
    <div className="flex flex-col gap-12" data-block="domain-sections" data-domain-list={list ? list.extra.length + (primary ? 1 : 0) : 0}>
      <Section id="main" title={w.main.title} lead={w.main.lead} open={mainOpen} onOpen={setMainOpen}>
        <DomainKey state={list?.key ?? null} words={w} ladderWords={ladderWords} onChanged={load} />
        {status}
        {list && primary ? (
          <DomainMain lang={lang} name={primary.name} status={primary.status} links={list.links} architect={list.architect} words={w} ladderWords={ladderWords} ladder={ladder} notes={notes} />
        ) : list ? (
          <>
            <DomainCards lang={lang} role="main" domains={mainDomains} primaryName={null} architect={list.architect} words={w} ladderWords={ladderWords} onChanged={load} />
            <DomainMore id="main-path" label={w.more}>
              <p>{w.main.empty}</p>
              {w.main.how.map((t) => <p key={t}>{t}</p>)}
              {topics}
              {notes}
            </DomainMore>
          </>
        ) : null}
      </Section>

      <Section id="extra" title={w.extra.title} lead={w.extra.lead} open={extraOpen} onOpen={setExtraOpen}>
        {status}
        {list ? (
          <>
            <DomainCards lang={lang} role="element" domains={elementDomains} primaryName={primary?.name ?? null} architect={list.architect} words={w} ladderWords={ladderWords} onChanged={load} />
            <DomainMore id="extra-how" label={w.more}>{w.extra.how.map((t) => <p key={t}>{t}</p>)}</DomainMore>
          </>
        ) : null}
      </Section>
    </div>
  )
}

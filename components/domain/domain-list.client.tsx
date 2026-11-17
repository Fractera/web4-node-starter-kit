"use client"

import { useCallback, useEffect, useState, type ReactNode } from "react"
import { H2, Small } from "@/components/ui/typography"
import type { DomainListWords } from "./domain-list.i18n"
import type { DomainLadderWords } from "./domain-ladder.i18n"
import { DomainKey, type NodeKey } from "./domain-key.client"
import { DomainCards, type Extra } from "./domain-cards.client"
import { DomainMain } from "./domain-main.client"
import type { AppDialogUi } from "@/components/dialog/app-dialog.i18n"

// ДОМЕНЫ УЗЛА — ДВА РАЗДЕЛА (775). Decided by the skill interface-design with the owner, 2026-11-17 (Telegram 406–411, the card 409;
// the system: .interface-design/system.md): the page is three parts in ONE rhythm (48 px between them, 12 px from a subheading to its
// card), in the style of the page «Сервер» — a subheading (H2 ui) with one muted line ABOVE a bordered accordion card, never inside it;
// every row closed until the person opens it; no «Подробнее» anywhere («Слишком много мусора»). The main section adds the main domain,
// the additional section adds the elements' domains — each lists its own (`section` from the door).
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

/** One section: its subheading and one line above, its card below (the page «Сервер»'s pattern). */
function Section({ id, title, lead, children }: { id: "main" | "extra"; title: string; lead: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3" data-block={`domain-section-${id}`} data-domain-section={id}>
      <div className="flex flex-col gap-1" data-block={`domain-section-${id}-head`}>
        <H2 variant="ui">{title}</H2>
        <Small className="text-muted-foreground">{lead}</Small>
      </div>
      {children}
    </section>
  )
}

export function DomainList({ lang, dialogUi, words: w, ladderWords }: { lang: string; dialogUi: AppDialogUi; words: DomainListWords; ladderWords: DomainLadderWords }) {
  const [list, setList] = useState<List | null>(null)
  const [failed, setFailed] = useState(false)

  const load = useCallback(async () => {
    try {
      const r = await fetch(`${BASE}/api/domain/list`, { cache: "no-store" })
      if (!r.ok) throw new Error(String(r.status))
      setList((await r.json()) as List)
      setFailed(false)
    } catch { setFailed(true) }
  }, [])

  useEffect(() => { void load() }, [load])

  const primary = list?.primary ?? null
  const mainDomains = list ? list.extra.filter((d) => d.section === "main") : []
  const elementDomains = list ? list.extra.filter((d) => d.section !== "main") : []
  const status = failed
    ? <p className="text-sm text-destructive" role="alert">{w.loadFailed}</p>
    : !list ? <Small className="text-muted-foreground">{w.loading}</Small> : null

  return (
    <>
      <Section id="main" title={w.main.title} lead={w.main.lead}>
        <DomainKey state={list?.key ?? null} words={w} ladderWords={ladderWords} onChanged={load} />
        {status}
        {list && primary ? (
          <DomainMain lang={lang} name={primary.name} status={primary.status} links={list.links} architect={list.architect} words={w} ladderWords={ladderWords} />
        ) : list ? (
          <DomainCards lang={lang} dialogUi={dialogUi} role="main" domains={mainDomains} primaryName={null} architect={list.architect} words={w} ladderWords={ladderWords} onChanged={load} />
        ) : null}
      </Section>

      <Section id="extra" title={w.extra.title} lead={w.extra.lead}>
        {status}
        {list ? (
          <DomainCards lang={lang} dialogUi={dialogUi} role="element" domains={elementDomains} primaryName={primary?.name ?? null} architect={list.architect} words={w} ladderWords={ladderWords} onChanged={load} />
        ) : null}
      </Section>
    </>
  )
}

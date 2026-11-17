"use client"

import { useCallback, useEffect, useState, type ReactNode } from "react"
import { H4, Small } from "@/components/ui/typography"
import type { DomainListWords } from "./domain-list.i18n"
import type { DomainLadderWords } from "./domain-ladder.i18n"
import { DomainKey, type NodeKey } from "./domain-key.client"
import { DomainCards, type Extra } from "./domain-cards.client"
import { DomainMain } from "./domain-main.client"
import { DomainMore } from "./domain-more"

// ДОМЕНЫ УЗЛА — ДВА РАЗДЕЛА (775). Слово владельца 2026-11-17: «На активации домена должно быть две вкладки каждая формате аккордеона
// разделённой пространство со своим собственным под заголовком. – Верхний активация основного домена. – Дополнительные домены. В каждой
// вкладке любая дополнительная информация в формате инструкции скрыто в аккордеоне подробнее … Внутри одного аккордеона не должно быть
// информации о других аккордеонов». So:
// 🔒 «Основной домен» first. Without one it holds the whole path to it — the node's key, the domains on their way, «+ Добавить домен», each
//   domain's pipeline ending in «Сделать основным доменом узла». With one — where it answers and its own controls (`DomainMain`).
// 🔒 «Дополнительные домены» exists only once the node has its main domain: before that there is nothing to add to.
// 🔒 Each section's instructions are folded in its own «Подробнее»; where to register a domain is a card below both (the section kind).
// 🔒 The list is asked of the node (`/api/domain/list`), not remembered: the page is prerendered. Everything by a press; no polling.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

type List = {
  key: NodeKey
  primary: { name: string; status: string | null } | null
  extra: Extra[]
  /** 775: the node has its architect (a domain may become the main one only then); `null` — the sign-in element did not answer */
  architect: boolean | null
  links: { site: string; panel: string } | null
}

export function DomainList({ lang, words: w, ladderWords, ladder }: { lang: string; words: DomainListWords; ladderWords: DomainLadderWords; ladder: ReactNode }) {
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

  return (
    <div className="flex flex-col gap-12" data-block="domain-sections" data-domain-list={list ? list.extra.length + (primary ? 1 : 0) : 0}>
      <section className="flex flex-col gap-3" data-block="domain-section-main" data-domain-section="main">
        <div className="flex flex-col gap-1" data-block="domain-section-main-head">
          <H4>{w.main.title}</H4>
          <Small className="text-muted-foreground">{w.main.lead}</Small>
        </div>
        <DomainKey state={list?.key ?? null} words={w} ladderWords={ladderWords} onChanged={load} />
        {failed && <p className="text-sm text-destructive" role="alert">{w.loadFailed}</p>}
        {!list ? (
          !failed && <Small className="text-muted-foreground">{w.loading}</Small>
        ) : primary ? (
          <DomainMain lang={lang} name={primary.name} status={primary.status} links={list.links} architect={list.architect} words={w} ladderWords={ladderWords} ladder={ladder} />
        ) : (
          <>
            <p className="text-sm text-foreground" data-primary-empty>{w.main.empty}</p>
            <DomainCards lang={lang} domains={list.extra} primaryName={null} architect={list.architect} words={w} ladderWords={ladderWords} onChanged={load} />
            <DomainMore id="main-path" label={w.more}>{w.main.how.map((t) => <p key={t}>{t}</p>)}</DomainMore>
          </>
        )}
      </section>

      {list && primary ? (
        <section className="flex flex-col gap-3" data-block="domain-section-extra" data-domain-section="extra">
          <div className="flex flex-col gap-1" data-block="domain-section-extra-head">
            <H4>{w.extra.title}</H4>
            <Small className="text-muted-foreground">{w.extra.lead}</Small>
          </div>
          <DomainCards lang={lang} domains={list.extra} primaryName={primary.name} architect={list.architect} words={w} ladderWords={ladderWords} onChanged={load} />
          <DomainMore id="extra-how" label={w.more}>{w.extra.how.map((t) => <p key={t}>{t}</p>)}</DomainMore>
        </section>
      ) : null}
    </div>
  )
}

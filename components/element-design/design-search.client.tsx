"use client"

import { useCallback, useEffect, useState } from "react"
import { Check, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { H4, H5, Small } from "@/components/ui/typography"
import type { ElementDesignWords } from "@/app/[lang]/(architectLayer)/_i18n/element-design.i18n"
import { DOOR, type FoundSkill, type Origin } from "./types"
import { SMALL } from "./step-parts"

// ПОИСК НАВЫКОВ ДИЗАЙНА (711-1, вид 713-2): живой, при каждом открытии — коллекция человека, база узла в графе, проверенный каталог.
// Списка в коде нет: что сохранено словами боту или пришло с обновлением графа и каталога, появляется само. Найденное — строками, по пять
// на источник и «Показать ещё»: двадцать карточек сеткой были стеной, которую никто не читает. Пустая коллекция говорит, как её пополнить.
type Found = { own: FoundSkill[]; base: FoundSkill[]; catalog: FoundSkill[]; notes: string[] }
const ORDER: Origin[] = ["own", "base", "catalog"]
const FIRST = 5

export function DesignSearch({ item, lang, words, inProject, onAdd }: { item: string; lang: string; words: ElementDesignWords; inProject: Set<string>; onAdd: (s: FoundSkill) => void }) {
  const [query, setQuery] = useState("")
  const [found, setFound] = useState<Found | null>(null)
  const [busy, setBusy] = useState(false)
  const [open, setOpen] = useState<Partial<Record<Origin, boolean>>>({})
  const run = useCallback(async (q: string) => {
    setBusy(true)
    const j = await fetch(`${DOOR}?item=${encodeURIComponent(item)}&q=${encodeURIComponent(q)}`, { cache: "no-store" }).then((r) => r.json()).catch(() => null)
    setFound(j?.ok ? { own: j.own ?? [], base: j.base ?? [], catalog: j.catalog ?? [], notes: j.notes ?? [] } : { own: [], base: [], catalog: [], notes: [String(j?.error ?? "network")] })
    setOpen({})
    setBusy(false)
  }, [item])
  useEffect(() => { void run("") }, [run])
  const num = new Intl.NumberFormat(lang)
  const meta = (s: FoundSkill) => [s.stars !== null ? `★ ${num.format(s.stars)}` : "", s.installs !== null ? `${num.format(s.installs)} ${words.installs}` : "", s.licence ?? "", s.scripts > 0 ? words.scripts : ""].filter(Boolean).join(" · ")
  return (
    <section data-block="edq01" data-design-search className="flex flex-col gap-4">
      <div data-block="edq02" className="flex flex-col gap-1.5">
        <H4 data-block="edq03" variant="ui">{words.searchTitle}</H4>
        <Small data-block="edq04">{words.searchHint}</Small>
      </div>
      <form data-block="edq05" role="search" className="flex gap-2" onSubmit={(e) => { e.preventDefault(); void run(query) }}>
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={words.placeholder} className="min-w-0 flex-1" aria-label={words.searchTitle} />
        <Button type="submit" variant="outline" disabled={busy}>
          <Search data-icon="inline-start" aria-hidden />
          {busy ? words.searching : words.search}
        </Button>
      </form>
      {found?.notes.map((n) => <Small data-block="edq06" key={n}>{n}</Small>)}
      {found && ORDER.map((origin) => {
        const list = found[origin]
        const shown = open[origin] ? list : list.slice(0, FIRST)
        return (
          <div data-block="edq07" key={origin} data-design-group={origin} className="flex flex-col gap-2">
            <H5 data-block="edq08" variant="ui" className="text-muted-foreground">{words.groups[origin]} · {list.length}</H5>
            {list.length === 0 ? (
              <Small data-block="edq09" className="max-w-prose">{origin === "own" ? words.collection : words.nothing}</Small>
            ) : (
              <ul data-block="edq10" className="flex flex-col divide-y divide-border rounded-lg border border-border">
                {shown.map((s) => {
                  const has = inProject.has(s.mark)
                  return (
                    <li data-block="edq11" key={s.mark} data-skill={s.mark} className="flex items-start justify-between gap-4 px-4 py-3">
                      <div data-block="edq12" className="flex min-w-0 flex-col gap-0.5">
                        <span data-block="edq13" className={`truncate font-medium text-foreground ${SMALL}`}>
                          {s.name}<span className="font-normal text-muted-foreground"> · {s.source}</span>
                        </span>
                        <span data-block="edq14" className={`line-clamp-1 text-muted-foreground ${SMALL}`} title={s.summary}>{s.summary}</span>
                        {meta(s) ? <span data-block="edq15" className={`text-muted-foreground ${SMALL}`}>{meta(s)}</span> : null}
                      </div>
                      <Button size="sm" variant={has ? "ghost" : "outline"} disabled={has} onClick={() => onAdd(s)} data-design-add className="shrink-0">
                        {has ? <Check data-icon="inline-start" aria-hidden /> : null}
                        {has ? words.added : words.add}
                      </Button>
                    </li>
                  )
                })}
              </ul>
            )}
            {list.length > FIRST && !open[origin] ? (
              <Button type="button" variant="ghost" size="sm" className="w-fit" onClick={() => setOpen((o) => ({ ...o, [origin]: true }))} data-design-more={origin}>
                {words.more.replace("{n}", String(list.length - FIRST))}
              </Button>
            ) : null}
          </div>
        )
      })}
    </section>
  )
}

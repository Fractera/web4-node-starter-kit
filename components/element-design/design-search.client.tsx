"use client"

import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { H3, Small } from "@/components/ui/typography"
import type { ElementDesignWords } from "@/app/[lang]/(architectLayer)/_i18n/element-design.i18n"
import { DOOR, type FoundSkill, type Origin } from "./types"

// ПОИСК НАВЫКОВ ДИЗАЙНА (711-1): живой, при каждом открытии — коллекция человека, база узла в графе, проверенный каталог. Списка в
// коде нет: что сохранено словами боту или пришло с обновлением графа и каталога, появляется само.
type Found = { own: FoundSkill[]; base: FoundSkill[]; catalog: FoundSkill[]; notes: string[] }
const ORDER: Origin[] = ["own", "base", "catalog"]

export function DesignSearch({ item, words, inProject, onAdd }: { item: string; words: ElementDesignWords; inProject: Set<string>; onAdd: (s: FoundSkill) => void }) {
  const [query, setQuery] = useState("")
  const [found, setFound] = useState<Found | null>(null)
  const [busy, setBusy] = useState(false)
  const run = useCallback(async (q: string) => {
    setBusy(true)
    const j = await fetch(`${DOOR}?item=${encodeURIComponent(item)}&q=${encodeURIComponent(q)}`, { cache: "no-store" }).then((r) => r.json()).catch(() => null)
    setFound(j?.ok ? { own: j.own ?? [], base: j.base ?? [], catalog: j.catalog ?? [], notes: j.notes ?? [] } : { own: [], base: [], catalog: [], notes: [String(j?.error ?? "network")] })
    setBusy(false)
  }, [item])
  useEffect(() => { void run("") }, [run])
  return (
    <section data-block="eds01" data-design-search className="flex flex-col gap-3 rounded-lg border border-border p-4">
      <H3 data-block="eds02">{words.searchTitle}</H3>
      <Small data-block="eds03" className="text-muted-foreground">{words.searchHint}</Small>
      <form data-block="eds04" className="flex flex-wrap gap-2" onSubmit={(e) => { e.preventDefault(); void run(query) }}>
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={words.placeholder} className="min-w-64 flex-1" aria-label={words.searchTitle} />
        <Button type="submit" disabled={busy}>{busy ? words.searching : words.search}</Button>
      </form>
      {found?.notes.map((n) => <Small data-block="eds05" key={n} className="text-muted-foreground">{n}</Small>)}
      {found && ORDER.map((origin) => (
        <div data-block="eds06" key={origin} data-design-group={origin} className="flex flex-col gap-2">
          <Small data-block="eds07" className="font-medium text-foreground">{words.groups[origin]} · {found[origin].length}</Small>
          {found[origin].length === 0 ? <Small data-block="eds08" className="text-muted-foreground">{words.nothing}</Small> : (
            <ul data-block="eds09" className="grid gap-2 md:grid-cols-2">
              {found[origin].map((s) => (
                <li data-block="eds10" key={s.mark} data-skill={s.mark} className="flex flex-col gap-1.5 rounded-md border border-border p-3">
                  <div data-block="eds11" className="flex items-start justify-between gap-2">
                    <span data-block="eds12" className="text-sm font-medium text-foreground">{s.name}<span className="font-normal text-muted-foreground"> · {s.source}</span></span>
                    <Button size="sm" variant={inProject.has(s.mark) ? "outline" : "default"} disabled={inProject.has(s.mark)} onClick={() => onAdd(s)} data-design-add>
                      {inProject.has(s.mark) ? words.added : words.add}
                    </Button>
                  </div>
                  {(s.stars !== null || s.installs !== null || s.scripts > 0) && (
                    <Small data-block="eds13" className="text-muted-foreground">
                      {[s.stars !== null ? `★ ${s.stars} ${words.stars}` : "", s.installs !== null ? `${s.installs} ${words.installs}` : "", s.licence ?? "", s.scripts > 0 ? words.scripts : ""].filter(Boolean).join(" · ")}
                    </Small>
                  )}
                  <Small data-block="eds14" className="line-clamp-3 text-muted-foreground">{s.summary}</Small>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </section>
  )
}

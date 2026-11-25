"use client"
// @local — the version history of one element's product quiz on its quiz page (852-5); nothing else lists quiz tags

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Small } from "@/components/ui/typography"
import type { QuizVersion } from "@/lib/web4-items/product-quiz-pdf"

// ВЕРСИИ КВИЗА (шаг 852-5; Рома 2026-11-24: «история версий … и откат: вернуться к версии N — новая версия, а не переписывание истории»).
// Версия — тег элемента `quiz-v<N>`, его ставит агент элемента после «да» человека (навык product-quiz). «Вернуться» спрашивает дверь
// `/api/node/product-quiz/version`: она будит главного агента, тот ставит задачу агенту элемента.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

export type QuizVersionsWords = { title: string; lead: string; empty: string; current: string; back: string; sent: string; failed: string }

const fill = (t: string, v: Record<string, string | number>) => t.replace(/\{(\w+)\}/g, (_, k: string) => String(v[k] ?? ""))

export function QuizVersions({ item, versions, words, lang }: { item: string; versions: QuizVersion[]; words: QuizVersionsWords; lang: string }) {
  const [busy, setBusy] = useState<number | null>(null)
  const [said, setSaid] = useState<{ ok: boolean; text: string } | null>(null)

  async function back(n: number) {
    setBusy(n)
    setSaid(null)
    try {
      const r = await fetch(`${BASE}/api/node/product-quiz/version`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ item, back: n }) })
      const j = (await r.json().catch(() => null)) as { ok?: boolean; next?: number; error?: string } | null
      setSaid(j?.ok ? { ok: true, text: fill(words.sent, { n, next: j.next ?? "" }) } : { ok: false, text: `${words.failed} ${j?.error ?? r.status}` })
    } catch {
      setSaid({ ok: false, text: words.failed })
    }
    setBusy(null)
  }

  const when = (iso: string) => { const d = new Date(iso); return Number.isNaN(d.getTime()) ? iso : d.toLocaleString(lang === "ru" ? "ru-RU" : "en-GB", { dateStyle: "medium", timeStyle: "short" }) }
  return (
    <Card data-block="quiz-versions" data-quiz-versions={versions.length}>
      <CardHeader>
        <CardTitle>{words.title}</CardTitle>
        <CardDescription>{words.lead}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {versions.length === 0 ? <Small className="text-muted-foreground">{words.empty}</Small> : (
          <ul className="flex flex-col divide-y divide-border">
            {versions.map((v, i) => (
              <li key={v.tag} className="flex flex-wrap items-center justify-between gap-2 py-2" data-quiz-version={v.n}>
                <div className="flex min-w-0 flex-col">
                  <span className="font-medium tabular-nums">v{v.n} <Small className="text-muted-foreground">· {when(v.date)} · {v.commit}</Small></span>
                  {v.subject && <Small className="truncate text-muted-foreground">{v.subject}</Small>}
                </div>
                {i === 0
                  ? <Small className="text-muted-foreground">{words.current}</Small>
                  : <Button type="button" variant="outline" size="sm" disabled={busy !== null} onClick={() => back(v.n)} data-quiz-version-back={v.n}>{fill(words.back, { n: v.n })}</Button>}
              </li>
            ))}
          </ul>
        )}
        {said && <p className={said.ok ? "text-sm text-foreground" : "text-sm text-destructive"} role={said.ok ? "status" : "alert"}>{said.text}</p>}
      </CardContent>
    </Card>
  )
}

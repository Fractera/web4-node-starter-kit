"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { DocLinks } from "@/components/lagrix/doc-items"
import type { SuperNodeWords } from "./super-node.i18n"
import { TestTable, type SuperNodeTest } from "./test-table"

// «СУПЕР УЗЕЛ → УВЕДОМЛЕНИЯ LAGRIX» (531): удовлетворяет ли СЕРВЕР СУПЕР-УЗЛА профилю Tier-2 — последний тест и кнопка «Пройти тест»
// (сравнение делает сервер ядра по данным API оператора), предупреждения о мощности и итоги проверок агентами — с сервера супер-узла
// (`/operator/v1/notices`). 🪦 До 531 здесь мерился компьютер узла — снято словом владельца: «ты не должен проверять текущий компьютер».
// Сервер не подключён — так и сказано, со ссылкой на «Статус». Спрашивается при открытии; опроса нет.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
type Warning = { at: string; text: string; deadline?: string }
type Check = { period: string; passed: boolean; reason?: string }

export function SuperNodeNotices({ lang, words }: { lang: string; words: SuperNodeWords }) {
  const [node, setNode] = useState<{ server: { url: string } | null; lastTest: SuperNodeTest | null } | "loading" | "failed">("loading")
  const [notices, setNotices] = useState<{ warnings: Warning[]; checks: Check[] } | "loading" | "not-connected" | "failed">("loading")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`${BASE}/api/node/super-node`, { cache: "no-store" })
      .then((r) => r.json())
      .then((j: { ok?: boolean; server?: { url: string } | null; lastTest?: SuperNodeTest | null }) => setNode(j.ok ? { server: j.server ?? null, lastTest: j.lastTest ?? null } : "failed"))
      .catch(() => setNode("failed"))
    fetch(`${BASE}/api/node/super-node/remote?part=notices`, { cache: "no-store" })
      .then(async (r) => ({ status: r.status, j: (await r.json().catch(() => null)) as { ok?: boolean; error?: string; data?: { warnings?: Warning[]; checks?: Check[] } } | null }))
      .then(({ j }) => setNotices(j?.ok ? { warnings: j.data?.warnings ?? [], checks: j.data?.checks ?? [] } : j?.error === "not-connected" ? "not-connected" : "failed"))
      .catch(() => setNotices("failed"))
  }, [])

  async function runTest() {
    setBusy(true)
    setError(null)
    try {
      const r = await fetch(`${BASE}/api/node/super-node`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "test" }) })
      const j = (await r.json().catch(() => null)) as { ok?: boolean; error?: string; server?: { url: string } | null; lastTest?: SuperNodeTest | null } | null
      if (j?.ok) setNode({ server: j.server ?? null, lastTest: j.lastTest ?? null })
      else setError(`${words.failed} ${words.errors[j?.error ?? ""] ?? j?.error ?? r.status}`)
    } catch {
      setError(words.failed)
    }
    setBusy(false)
  }

  const date = (iso: string) => new Date(iso).toLocaleDateString(lang === "ru" ? "ru-RU" : "en-GB", { dateStyle: "medium" })
  const notConnected = (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-muted/40 p-4" data-super-node-not-connected>
      <p className="text-sm text-foreground">{words.notConnected}</p>
      <a href={`${BASE}/${lang}/super-node/status`} className={buttonVariants({ size: "sm", variant: "outline" })}>{words.statusLinkShort}</a>
    </div>
  )

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <Card data-super-node-machine={typeof node === "string" ? node : node.server ? "connected" : "not-connected"}>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">{words.machine.title}</CardTitle>
          <CardDescription>{words.machine.lead}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {node === "loading" && <p className="inline-flex items-center gap-2 text-sm text-muted-foreground"><Spinner /> {words.loading}</p>}
          {node === "failed" && <p className="text-sm text-destructive" role="alert">{words.loadFailed}</p>}
          {typeof node !== "string" && !node.server && notConnected}
          {typeof node !== "string" && node.server && (
            <Button type="button" className="w-fit" onClick={runTest} disabled={busy} data-super-node-test-run>{busy ? words.test.running : words.test.run}</Button>
          )}
          {typeof node !== "string" && (node.lastTest ? <TestTable test={node.lastTest} words={words} lang={lang} /> : node.server ? <p className="text-sm text-muted-foreground">{words.test.none}</p> : null)}
          {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
        </CardContent>
      </Card>

      <Card data-super-node-warnings={typeof notices === "string" ? notices : notices.warnings.length}>
        <CardHeader><CardTitle className="text-xl font-semibold">{words.warnings.title}</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-3">
          {notices === "loading" && <p className="inline-flex items-center gap-2 text-sm text-muted-foreground"><Spinner /> {words.loading}</p>}
          {notices === "failed" && <p className="text-sm text-destructive" role="alert">{words.loadFailed}</p>}
          {notices === "not-connected" && notConnected}
          {typeof notices !== "string" && notices.warnings.length === 0 && <p className="text-sm text-muted-foreground">{words.warnings.none}</p>}
          {typeof notices !== "string" && notices.warnings.map((w) => (
            <div key={w.at + w.text} className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm" role="alert">
              <p className="font-medium text-foreground">{w.text}</p>
              <p className="text-muted-foreground">{date(w.at)}{w.deadline ? ` · ${words.warnings.deadline.replace("{date}", date(w.deadline))}` : ""}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {typeof notices !== "string" && (
        <Card data-super-node-checks={notices.checks.length}>
          <CardHeader><CardTitle className="text-xl font-semibold">{words.checks.title}</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-2">
            {notices.checks.length === 0 && <p className="text-sm text-muted-foreground">{words.checks.none}</p>}
            {notices.checks.map((c) => (
              <p key={c.period} className="flex flex-wrap items-center gap-2 text-sm text-foreground">
                <span>{c.period}</span>
                <Badge variant={c.passed ? "secondary" : "destructive"}>{c.passed ? words.checks.passed : words.checks.failed}</Badge>
                {c.reason && <span className="text-muted-foreground">{c.reason}</span>}
              </p>
            ))}
          </CardContent>
        </Card>
      )}

      <p className="text-sm text-muted-foreground">{words.docsTitle}: <DocLinks lang={lang} docs={words.pageDocs.notices} className="text-sm" /></p>
    </div>
  )
}

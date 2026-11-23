"use client"
// @local — the banner of an element's GitHub commits on its «Предпросмотр и развёртывание» page (one route, node step 842)

import { useCallback, useEffect, useState } from "react"
import { Download, RefreshCw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Small } from "@/components/ui/typography"
import type { ElementPullUi } from "../_i18n/element-pull.i18n"

// «В GITHUB НОВЫЕ КОММИТЫ» (842). Слово владельца 2026-11-23 (Telegram 1154): «такой же баннер который существует на главной странице
// которая анализирует наличие доступных версий». Открытие страницы читает последний ответ без сети; GitHub спрашивается только кнопкой
// «Проверить снова»; «Забрать» — перемотка вперёд от имени элемента (за стеной сервера), потом страница перечитывается: внизу новый
// коммит «ждёт развёртывания». Нет репозитория — баннера нет.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
type State = { ok: true; fetched: boolean; behind: number; ahead: number; dirty: number; remoteHead: string | null; verdict: string; checkedAt: string | null } | { ok: false; error: string }
const fill = (t: string, map: Record<string, string>) => Object.entries(map).reduce((s, [k, v]) => s.split(`{${k}}`).join(v), t)

export function ElementPull({ id, lang, ui }: { id: string; lang: string; ui: ElementPullUi }) {
  const url = `${BASE}/api/architect/items/${id}/github/pull`
  const [s, setS] = useState<State | null>(null)
  const [busy, setBusy] = useState<"check" | "take" | null>(null)
  const [note, setNote] = useState<{ tone: "ok" | "error"; text: string } | null>(null)
  const err = (code: string) => ui.errors[code] ?? `${ui.errors.unknown} ${code}`

  const load = useCallback(async (ask: boolean) => {
    const r = await fetch(`${url}${ask ? "?check=1" : ""}`, { cache: "no-store" }).catch(() => null)
    const d = (r ? await r.json().catch(() => null) : null) as State | null
    if (d) setS(d)
    return d
  }, [url])

  useEffect(() => { void load(false) }, [load])

  async function check() {
    setBusy("check"); setNote(null)
    const d = await load(true)
    if (d && !d.ok && d.error !== "not-connected") setNote({ tone: "error", text: err(d.error) })
    setBusy(null)
  }

  async function take() {
    setBusy("take"); setNote(null)
    const r = await fetch(url, { method: "POST", cache: "no-store" }).catch(() => null)
    const d = (r ? await r.json().catch(() => null) : null) as { ok: boolean; error?: string; state?: State } | null
    if (d?.ok) {
      const head = d.state && d.state.ok ? d.state.remoteHead ?? "" : ""
      setNote({ tone: "ok", text: fill(ui.taken, { head }) })
      // the deploy panel below reads the element's code at load: one reload shows the new commit «ждёт развёртывания»
      window.setTimeout(() => window.location.reload(), 1200)
    } else {
      if (d?.state) setS(d.state)
      setNote({ tone: "error", text: err(d?.error ?? "pull-failed") })
    }
    setBusy(null)
  }

  if (!s || (!s.ok && s.error === "not-connected") || (!s.ok && s.error === "not-born")) return null
  const behind = s.ok && s.fetched ? s.behind : 0
  const when = s.ok && s.checkedAt ? new Date(s.checkedAt).toLocaleString(lang === "ru" ? "ru-RU" : "en-GB", { dateStyle: "short", timeStyle: "short" }) : null
  const title = behind > 0 ? fill(ui.behind, { n: String(behind) }) : s.ok && s.fetched ? ui.upToDate : ui.never

  return (
    <Alert className="my-4" data-block="element-pull">
      <Download aria-hidden />
      <AlertTitle data-block="element-pull-title">{title}{s.ok && s.remoteHead && behind > 0 ? ` · ${s.remoteHead}` : ""}</AlertTitle>
      <AlertDescription className="flex flex-col gap-3" data-block="element-pull-body">
        <Small className="text-muted-foreground">{ui.hint}{when ? ` · ${fill(ui.checkedAt, { time: when })}` : ""}</Small>
        <div className="flex flex-wrap items-center gap-2" data-block="element-pull-actions">
          {behind > 0 ? (
            <Button size="sm" className="gap-1.5" onClick={() => void take()} disabled={busy !== null} data-element-pull-take="">
              {busy === "take" ? <Spinner /> : <Download aria-hidden />}
              {busy === "take" ? ui.taking : ui.take}
            </Button>
          ) : null}
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => void check()} disabled={busy !== null} data-element-pull-check="">
            {busy === "check" ? <Spinner /> : <RefreshCw aria-hidden />}
            {busy === "check" ? ui.checking : ui.check}
          </Button>
        </div>
        {note ? <Small className={note.tone === "error" ? "text-destructive" : "text-foreground"} data-block="element-pull-note">{note.text}</Small> : null}
      </AlertDescription>
    </Alert>
  )
}

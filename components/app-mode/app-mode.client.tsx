"use client"
// @part app-mode — the «App mode» card of the core's Passport: one user or many users, two round buttons stacked, the node's deep switch

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { P, Small } from "@/components/ui/typography"
import { AppDialog } from "@/components/dialog/app-dialog.client"
import type { AppDialogUi } from "@/components/dialog/app-dialog.i18n"
import { cn } from "@/lib/utils"
import type { AppModeWords } from "./app-mode.i18n"

// КАРТОЧКА «РЕЖИМ РАБОТЫ ПРИЛОЖЕНИЯ» (узел, шаг 782-1). Владелец 2026-11-18 (Telegram 565): «первую верхнюю голубую вкладку с
// переключателем … две одну над другой активной подсвечивается тёмно-синем … неактивные светло голубым карточка тоже пусть будет голубой
// без всякого красного цвета … Старайся чтобы карточки не прыгали по высоте при переключении».
// 🔒 ОБА ТЕКСТА В ОДНОЙ ЯЧЕЙКЕ СЕТКИ: невидимый держит место, высота карточки — по длинному, при переключении ничего не прыгает.
// 🔒 ГЛУБОКОЕ ПЕРЕКЛЮЧЕНИЕ (Telegram 567, 574): тип узла пишет дверь `POST /api/node/type`, и только после окна: что меняется сейчас и
// что прежние элементы сохраняют своё состояние (`node-type.cjs`: тип задаёт облик только НОВЫХ элементов).
// 🔒 Без красного: отказ и сбой — приглушённым текстом под кнопками.

type Mode = "project" | "factory"
type Element = { id: string; name: string; config: boolean }
type State = { type: Mode; elements: Element[]; settingsUrl: string | null }

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
const MODES: Mode[] = ["project", "factory"]
const PILL = "h-11 w-full rounded-full px-5 text-sm font-bold sm:w-56"

function read(d: unknown): State | null {
  const v = d as { type?: unknown; elements?: unknown; settingsUrl?: unknown } | null
  if (v?.type !== "project" && v?.type !== "factory") return null
  return { type: v.type, elements: Array.isArray(v.elements) ? (v.elements as Element[]) : [], settingsUrl: typeof v.settingsUrl === "string" ? v.settingsUrl : null }
}

export function AppMode({ words, dialogUi, lang }: { words: AppModeWords; dialogUi: AppDialogUi; lang: string }) {
  const [state, setState] = useState<State | null>(null)
  const [denied, setDenied] = useState(false)
  const [failed, setFailed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [ask, setAsk] = useState<Mode | null>(null)

  useEffect(() => {
    fetch(`${BASE}/api/node/type?lang=${lang}`, { cache: "no-store" })
      .then(async (r) => {
        if (r.status === 401 || r.status === 403) setDenied(true)
        return r.ok ? read(await r.json()) : null
      })
      .then(setState)
      .catch(() => setState(null))
  }, [lang])

  async function apply(type: Mode) {
    setAsk(null)
    setBusy(true)
    setFailed(false)
    try {
      const r = await fetch(`${BASE}/api/node/type?lang=${lang}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      })
      if (r.status === 401 || r.status === 403) setDenied(true)
      const next = r.ok ? read(await r.json()) : null
      if (next) setState(next)
      else setFailed(true)
    } catch {
      setFailed(true)
    } finally {
      setBusy(false)
    }
  }

  function press(type: Mode) {
    // Владелец 2026-11-18 (Telegram 574): «переключатель должен иметь подтверждающий окно в любом случае … либо отменяет и там более
    // подробное описание что сейчас произойдёт» — окно всегда; список прежних элементов — когда они есть.
    if (!state || type === state.type || busy) return
    setAsk(type)
  }

  const active = state?.type ?? null
  const configHref = state?.settingsUrl ? state.settingsUrl.replace("{lang}", lang) : null

  return (
    <section
      data-block="app-mode"
      data-app-mode={active ?? "unknown"}
      aria-labelledby="app-mode-title"
      className="my-6 flex flex-col gap-5 rounded-2xl border border-primary/30 bg-primary/[0.05] p-6 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex min-w-0 flex-col gap-1.5">
        <P id="app-mode-title" className="text-base font-semibold text-foreground">{words.title}</P>
        {/* Обе подсказки в одной ячейке: видна одна, место держат обе. */}
        <div className="grid [&>*]:col-start-1 [&>*]:row-start-1" data-block="app-mode-texts">
          {MODES.map((m) => (
            <div key={m} className={cn("flex flex-col gap-2", active !== m && "invisible")} aria-hidden={active !== m} data-app-mode-text={m}>
              <Small className="leading-normal text-muted-foreground">{m === "project" ? words.projectText : words.factoryText}</Small>
              {m === "project" && (
                <a
                  href={configHref ?? undefined}
                  tabIndex={active === m && configHref ? undefined : -1}
                  className={cn("w-fit text-sm font-medium text-primary hover:underline", !configHref && "invisible")}
                  data-app-mode-configurator
                >
                  {words.configurator}
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="flex shrink-0 flex-col gap-2" role="group" aria-label={words.title} data-block="app-mode-buttons">
        {MODES.map((m) => (
          <Button
            key={m}
            type="button"
            variant="bare"
            size="bare"
            aria-pressed={active === m}
            disabled={!state || busy}
            onClick={() => press(m)}
            data-app-mode-button={m}
            className={cn(
              PILL,
              active === m ? "bg-primary text-primary-foreground" : "bg-primary/15 text-primary hover:bg-primary/25",
            )}
          >
            {m === "project" ? words.project : words.factory}
          </Button>
        ))}
        {(denied || failed) && <Small className="max-w-56 text-muted-foreground" role="status">{denied ? words.readOnly : words.failed}</Small>}
      </div>

      {ask && state && (
        <AppDialog
          open
          onOpenChange={(o) => !o && setAsk(null)}
          ui={dialogUi}
          title={words.confirmTitle[ask]}
          description={state.elements.length > 0 ? words.confirmLead : words.confirmLeadEmpty}
          footer={
            <>
              <Button type="button" variant="outline" onClick={() => setAsk(null)}>{words.cancel}</Button>
              <Button type="button" onClick={() => void apply(ask)} data-app-mode-confirm>{words.switch}</Button>
            </>
          }
        >
          <div className="flex flex-col gap-4" data-block="app-mode-confirm">
            <div className="flex flex-col gap-1.5">
              <P className="text-sm font-semibold text-foreground">{words.nowTitle}</P>
              <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-muted-foreground">
                {words.now[ask].map((line) => <li key={line}>{line}</li>)}
              </ul>
            </div>
            {state.elements.length > 0 && <div className="flex flex-col gap-1.5">
              <P className="text-sm font-semibold text-foreground">{words.keepTitle}</P>
              <ul className="flex flex-col gap-1 text-sm" data-app-mode-kept>
                {state.elements.map((e) => (
                  <li key={e.id} className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <span className="text-foreground">{e.name}</span>
                    <span className="text-muted-foreground">{e.config ? words.linked : words.own}</span>
                  </li>
                ))}
              </ul>
            </div>}
            <Small className="leading-normal text-muted-foreground">{state.elements.length > 0 ? words.how : words.back}</Small>
          </div>
        </AppDialog>
      )}
    </section>
  )
}

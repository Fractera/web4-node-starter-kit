"use client"
// @part tool-demo — the look of one tool in the one modal: live on sample data when it needs nothing beyond the browser, its words otherwise

import { AppDialog } from "@/components/dialog/app-dialog.client"
import type { AppDialogUi } from "@/components/dialog/app-dialog.i18n"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { P, Small } from "@/components/ui/typography"
import type { ToolRow } from "@/lib/parts/tools-catalog"
import { LIVES_AT } from "./lives-at"
import { LIVE_LOOKS, ToolLook, type ToolDemoKit } from "./tool-looks.client"
import type { ToolsTabWords } from "./tools-tab.i18n"

export type { ToolDemoKit }

// ПОКАЗ ИНСТРУМЕНТА (725-8). Владелец 2026-11-12: «этот инструмент показывается в отдельном модельном окне но показывается только
// визуально. Без возможности его полного использования разумеется, если это полное использование требует расширенных возможностей если не
// требует то показываем то что он умеет». 733-8b: живой вид есть у каждого, кого можно показать на примере (`tool-looks.client.tsx`);
// действие, которому нужно больше браузера, отвечает в показе «не выполняется — нужно …». Остальным — что им нужно и что они умеют.
export function ToolDemo({ tool, tools, item, place, lang, words, ui, kit, onClose }: {
  tool: ToolRow
  /** 733-8b-3: the element whose tab this is (`build` in the core) and where the tab stands — a panel tool links to its page there. */
  item: string
  place: "core" | "element"
  tools: ToolRow[]
  lang: string
  words: ToolsTabWords
  ui: AppDialogUi
  kit: ToolDemoKit
  onClose: () => void
}) {
  const t = lang === "ru" ? tool.ru : tool.en
  const needs = tool.needs.filter((n) => n !== "browser")
  const live = LIVE_LOOKS.has(tool.key)
  const where = live ? null : LIVES_AT[tool.key] ?? null
  const named = needs.map((n) => words.needNames[n] ?? n).join(", ")
  const note = live
    ? (needs.length ? `${words.demoLive} ${words.demoHeld.replace("{needs}", named)}` : words.demoLive)
    : needs.length ? words.demoNeeds.replace("{needs}", named) : words.demoNone
  return (
    <AppDialog open onOpenChange={(o) => { if (!o) onClose() }} title={words.demoTitle.replace("{title}", t.title)} ui={ui} size="lg">
      <div data-block="tool-demo" data-tool={tool.key} className="flex flex-col gap-4">
        <Small>{note}</Small>
        {live && <ToolLook tool={tool} tools={tools} lang={lang} words={words} ui={ui} kit={kit} />}
        {!live && (
          <div data-block="tool-demo-words" className="flex flex-col gap-3">
            <P>{t.what}</P>
            {t.value && <P className="text-muted-foreground">{t.value}</P>}
            {needs.length > 0 && (
              <div className="flex flex-wrap gap-1.5">{needs.map((n) => <Badge key={n} variant="outline">{words.needNames[n] ?? n}</Badge>)}</div>
            )}
            {where && (
              <div data-block="tool-demo-where" className="flex flex-col gap-2">
                <Small>{words.demoWhere} <code className="font-mono text-xs">{where}</code></Small>
                {place === "element" && (
                  <Link href={`/${lang}/${item}/${where}`} className={buttonVariants({ variant: "outline", size: "sm", className: "self-start" })} data-tool-where>
                    {words.demoWhereOpen}
                  </Link>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </AppDialog>
  )
}

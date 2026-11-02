"use client"

import { PanelRightClose, SquareTerminal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AgentTerminal } from "@/app/[lang]/(architectLayer)/architect/kits/_agent-kit/core/client/agent-terminal.client"
import type { TerminalDrawerWords, TerminalKit } from "../types/terminal-drawer"

// ЯЩИК С ТЕРМИНАЛОМ СПРАВА (шаг 556-9). Владелец 2026-10-23: «Посмотри вкладку живой сайт … справа разделяется на два контейнера там
// внутри открывается терминал». Ящик Preview (336) вынесен инструментом: его берут Preview, «Реверс-инжиниринг» и «Продуктовый квиз».
// `start` — задача уходит с запуском (спящему агенту — первым поручением, работающему — окном вставки, 551-7); без него текст ждёт
// в окне вставки, как было у Preview. Новое поручение — новый `key` у ящика у того, кто его открывает: терминал подключается заново,
// сессия на сервере продолжает работать. Ширина — половина экрана на компьютере, вся ширина под страницей на телефоне.

export function TerminalDrawer({
  service,
  lang,
  words,
  kit,
  text,
  start = false,
  onCollapse,
  className = "w-full lg:w-[min(640px,48%)]",
}: {
  /** Сегмент терминала в `/architect/<…>/agent-api`: id элемента или службы ядра (`build` — главный агент узла). */
  service: string
  lang: string
  words: TerminalDrawerWords
  kit: TerminalKit
  text: string
  start?: boolean
  onCollapse: () => void
  /** Ширина ящика: по умолчанию вся ширина на телефоне и половина на компьютере; Preview стоит в ряд всегда. */
  className?: string
}) {
  return (
    <aside className={`flex shrink-0 flex-col gap-2 rounded-lg border border-border p-3 ${className}`} data-terminal-drawer={service}>
      <div className="flex items-center gap-2">
        <SquareTerminal className="size-4" aria-hidden />
        <p className="flex-1 text-sm font-medium">{words.title}</p>
        <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={onCollapse} data-terminal-drawer-collapse>
          <PanelRightClose className="size-4" aria-hidden />
          {words.collapse}
        </Button>
      </div>
      {words.hint && <p className="text-muted-foreground text-xs">{words.hint}</p>}
      <div className="min-h-0 flex-1 overflow-auto">
        <AgentTerminal
          service={service}
          lang={lang}
          words={kit.terminalWords}
          dialogUi={kit.dialogUi}
          keyHref={kit.keyHref}
          initialPaste={start ? undefined : text}
          startTask={start ? text : undefined}
          compact
        />
      </div>
    </aside>
  )
}

"use client"
// @part tool-demo — the look of one tool in the one modal: live on sample data when it needs nothing beyond the browser, its words otherwise

import dynamic from "next/dynamic"
import { AppDialog } from "@/components/dialog/app-dialog.client"
import type { AppDialogUi } from "@/components/dialog/app-dialog.i18n"
import { Badge } from "@/components/ui/badge"
import { P, Small } from "@/components/ui/typography"
import type { ChatMessage, ChatUi } from "@/_tools/chat/types/chat"
import type { ToolRow } from "@/lib/parts/tools-catalog"
import type { ToolsTabWords } from "./tools-tab.i18n"

// ПОКАЗ ИНСТРУМЕНТА (725-8). Владелец 2026-11-12: «этот инструмент показывается в отдельном модельном окне но показывается только
// визуально. Без возможности его полного использования разумеется, если это полное использование требует расширенных возможностей если не
// требует то показываем то что он умеет». Живьём — только тот, кому хватает браузера и у кого здесь есть показ на примере (чат лентой
// без отправки, просмотр кода); остальным — что им нужно и что они умеют. Пакеты показов грузятся, только когда окно открыто.
const Chat = dynamic(() => import("@/_tools/chat/client/chat.client"), { ssr: false })
const CodeView = dynamic(() => import("@/_tools/code-view/client/code-view.client").then((m) => m.CodeView), { ssr: false })

export type ToolDemoKit = { chatUi: ChatUi; chatSample: ChatMessage[]; codeSample: string }

const LIVE = new Set(["chat", "code-view"])

export function ToolDemo({ tool, lang, words, ui, kit, onClose }: {
  tool: ToolRow
  lang: string
  words: ToolsTabWords
  ui: AppDialogUi
  kit: ToolDemoKit
  onClose: () => void
}) {
  const t = lang === "ru" ? tool.ru : tool.en
  const needs = tool.needs.filter((n) => n !== "browser")
  const live = LIVE.has(tool.key) && needs.length === 0
  const note = live ? words.demoLive : needs.length
    ? words.demoNeeds.replace("{needs}", needs.map((n) => words.needNames[n] ?? n).join(", "))
    : words.demoNone
  return (
    <AppDialog open onOpenChange={(o) => { if (!o) onClose() }} title={words.demoTitle.replace("{title}", t.title)} ui={ui} size="lg">
      <div data-block="tool-demo" data-tool={tool.key} className="flex flex-col gap-4">
        <Small>{note}</Small>
        {live && tool.key === "chat" && <Chat messages={kit.chatSample} ui={kit.chatUi} className="max-h-80" />}
        {live && tool.key === "code-view" && <CodeView code={kit.codeSample} filename="example.ts" />}
        {!live && (
          <div data-block="tool-demo-words" className="flex flex-col gap-3">
            <P>{t.what}</P>
            <P className="text-muted-foreground">{t.value}</P>
            {needs.length > 0 && (
              <div className="flex flex-wrap gap-1.5">{needs.map((n) => <Badge key={n} variant="outline">{words.needNames[n] ?? n}</Badge>)}</div>
            )}
          </div>
        )}
      </div>
    </AppDialog>
  )
}

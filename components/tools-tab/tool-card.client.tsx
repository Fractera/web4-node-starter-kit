"use client"
// @part tool-card — one tool of the «Tools» tab: what it solves, where it is used, its full discovery text, Show and Edit

import { ChevronDown, Eye, Pencil } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { P, Small } from "@/components/ui/typography"
import type { ToolRow } from "@/lib/parts/tools-catalog"
import type { ToolsTabWords } from "./tools-tab.i18n"

// ОДНА КАРТОЧКА ИНСТРУМЕНТА (725-8). Владелец 2026-11-12: «карточки с описанием инструмента какое они задачи решают где могут быть
// использованы и то самое полное описание которое ты создал для обнаружения этих инструментов». Сверху — что он решает (это читают
// всегда); где используется — строкой; полное описание (как устроен, зачем, слова поиска) — свёрнуто, его открывают, когда выбирают.
export function ToolCard({ tool, lang, words, onShow, onEdit, editBlocked }: {
  tool: ToolRow
  lang: string
  words: ToolsTabWords
  onShow: () => void
  onEdit: () => void
  editBlocked: boolean
}) {
  const t = lang === "ru" ? tool.ru : tool.en
  const search = lang === "ru" ? tool.words.ru : tool.words.en
  const needs = tool.needs.filter((n) => n !== "browser")
  return (
    <Card data-block="tool-card" data-tool={tool.key} className="gap-3">
      <CardHeader className="gap-1.5">
        <CardTitle>{t.title}</CardTitle>
        <CardDescription className="font-mono text-xs">{tool.dir}</CardDescription>
      </CardHeader>
      <CardContent data-block="tool-card-body" className="flex flex-col gap-3">
        <P>{t.what}</P>
        <div data-block="tool-card-used" className="flex flex-col gap-1">
          <Small className="font-medium text-foreground">{words.usedBy}</Small>
          {tool.usedBy.length
            ? <Small className="break-all font-mono text-xs">{tool.usedBy.join(" · ")}</Small>
            : <Small>{words.usedNowhere}</Small>}
        </div>
        {needs.length > 0 && (
          <div data-block="tool-card-needs" className="flex flex-wrap items-center gap-1.5">
            <Small className="font-medium text-foreground">{words.needs}</Small>
            {needs.map((n) => <Badge key={n} variant="outline">{words.needNames[n] ?? n}</Badge>)}
          </div>
        )}
        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button type="button" variant="ghost" size="sm" className="group -ml-2 gap-1.5" data-tool-full>
              {words.full}
              <ChevronDown className="size-4 transition-transform group-data-[state=open]:rotate-180" aria-hidden />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent data-block="tool-card-full" className="flex flex-col gap-3 pt-2">
            <div className="flex flex-col gap-1"><Small className="font-medium text-foreground">{words.how}</Small><P>{t.how}</P></div>
            <div className="flex flex-col gap-1"><Small className="font-medium text-foreground">{words.value}</Small><P>{t.value}</P></div>
            {search.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <Small className="font-medium text-foreground">{words.searchWords}</Small>
                {search.map((w) => <Badge key={w} variant="secondary">{w}</Badge>)}
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
      <CardFooter data-block="tool-card-actions" className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={onShow} data-tool-show>
          <Eye className="size-4" aria-hidden />{words.show}
        </Button>
        <Button type="button" variant="ghost" size="sm" className="gap-1.5" onClick={onEdit} disabled={editBlocked} data-tool-edit>
          <Pencil className="size-4" aria-hidden />{words.edit}
        </Button>
      </CardFooter>
    </Card>
  )
}

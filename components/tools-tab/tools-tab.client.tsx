"use client"
// @part tools-tab — the «Tools» tab of the core and of every element: what tools are, the cards five at a time, a look, edit and add through one terminal

import { useEffect, useState } from "react"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { P, Small } from "@/components/ui/typography"
import { VoiceTextarea } from "@/components/form/voice-textarea.client"
import { TerminalDrawer } from "@/_tools/terminal-drawer/client/terminal-drawer.client"
import type { TerminalKit } from "@/_tools/terminal-drawer/types/terminal-drawer"
import type { ToolRow } from "@/lib/parts/tools-catalog"
import type { ToolsTabWords } from "./tools-tab.i18n"
import { ToolCard } from "./tool-card.client"
import { ToolDemo, type ToolDemoKit } from "./tool-demo.client"
import { createTask, editTask, takeTask } from "./tasks"

// ВКЛАДКА «ИНСТРУМЕНТЫ» (узел, шаг 725-8). Владелец 2026-11-12: «В праве вкладки ты будешь загружать по пять инструментов с кнопкой
// показать ещё … Ниже списка стоит кнопка добавить инструмент … появляется кнопка запустить в разработку и прямо здесь на этой вкладке
// запускается терминал … На одном экране не более одного терминала то есть за раз мы можем либо создавать один инструмент либо его
// редактировать … где-то в начале должно быть описание что такое инструменты … Эту надпись лучше раскрыть в аккордеоне».
// 🔒 Список спрашивается при открытии (`/api/node/tools`): страница предрендерена, агент добавляет инструмент в любую минуту.
// 🔒 ОДИН ТЕРМИНАЛ: пока ящик открыт, «Редактировать» и «Запустить в разработку» ждут — его сворачивают, и следующий получает новый ключ.
// 733-8, владелец 2026-11-12 ~14:30: «раздвигать элемент вниз и внутри фиксированным окне открывать терминал на всю ширину также как и на
// основной вкладке терминал. При нажатии на кнопку редактировать должно появиться уведомление описание инструмента скопировано вставьте в
// его терминал … нельзя чтобы текст по Default отправлялся в терминал». Терминал — ПОД списком, во всю ширину (высоту держит сам
// терминал, как на вкладке «Терминал»); «Редактировать» кладёт задачу в буфер и открывает ПУСТОЙ терминал; «Запустить в разработку»
// остаётся явным действием человека над его же словами. Ядро на узле человека — только показ и «Взять в элемент» (дверь: `editable`).
const PAGE = 5

export function ToolsTab({ item, service, place, lang, words, kit, demo }: {
  /** `build` — инструменты ядра; иначе адрес элемента. */
  item: string
  /** Сегмент терминала: `build` — главный агент, иначе id элемента. */
  service: string
  place: "core" | "element"
  lang: string
  words: ToolsTabWords
  kit: TerminalKit
  demo: ToolDemoKit
}) {
  const [tools, setTools] = useState<ToolRow[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [count, setCount] = useState(PAGE)
  const [shown, setShown] = useState<ToolRow | null>(null)
  const [adding, setAdding] = useState(false)
  const [text, setText] = useState("")
  const [drawer, setDrawer] = useState<{ n: number; text: string; start: boolean } | null>(null)
  const [refresh, setRefresh] = useState(0)
  const [editable, setEditable] = useState(false)

  useEffect(() => {
    let live = true
    fetch(`/api/node/tools?item=${encodeURIComponent(item)}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((b: { ok?: boolean; tools?: ToolRow[]; editable?: boolean }) => {
        if (!live) return
        setEditable(b.editable === true)
        if (b.ok && Array.isArray(b.tools)) setTools(b.tools)
        else setFailed(true)
      })
      .catch(() => live && setFailed(true))
    return () => { live = false }
  }, [item, refresh])

  const open = (task: string, start: boolean) => setDrawer((d) => ({ n: (d?.n ?? 0) + 1, text: task, start }))
  const copy = (text: string, said: string) =>
    navigator.clipboard?.writeText(text).then(() => toast.success(said), () => toast.error(words.copyFailed)) ?? toast.error(words.copyFailed)
  const edit = (t: ToolRow) => { copy(editTask(place, title(t), t.dir), words.copiedEdit); open("", false) }
  const busy = drawer !== null
  const title = (t: ToolRow) => (lang === "ru" ? t.ru.title : t.en.title)

  return (
    <div data-block="tools-tab" className="flex flex-col gap-6">
      <div data-block="tools-tab-main" className="flex min-w-0 flex-col gap-6">
        <Accordion type="single" collapsible data-block="tools-tab-about">
          <AccordionItem value="about">
            <AccordionTrigger>{words.aboutTitle}</AccordionTrigger>
            <AccordionContent className="flex flex-col gap-3">
              {words.about.map((p) => <P key={p}>{p}</P>)}
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {!editable && tools && <P className="text-muted-foreground" data-tools-tab="read-only">{words.readOnly}</P>}
        {failed && <P className="text-muted-foreground" data-tools-tab="failed">{words.unavailable}</P>}
        {!failed && !tools && <P className="text-muted-foreground" data-tools-tab="loading">{words.loading}</P>}
        {tools && tools.length === 0 && <P className="text-muted-foreground" data-tools-tab="empty">{words.empty}</P>}

        {tools && tools.length > 0 && (
          <div data-block="tools-tab-list" className="flex flex-col gap-4">
            {tools.slice(0, count).map((t) => (
              <ToolCard key={t.key} tool={t} lang={lang} words={words} editBlocked={busy} onShow={() => setShown(t)}
                onEdit={editable ? () => edit(t) : undefined}
                onTake={!editable && t.scope === "any" ? () => copy(takeTask(t.id, title(t)), words.copiedTake) : undefined} />
            ))}
            <div data-block="tools-tab-more" className="flex flex-wrap items-center gap-3">
              <Small>{words.shown.replace("{n}", String(Math.min(count, tools.length))).replace("{total}", String(tools.length))}</Small>
              {count < tools.length && (
                <Button type="button" variant="outline" size="sm" onClick={() => setCount((c) => c + PAGE)} data-tools-more>{words.more}</Button>
              )}
            </div>
          </div>
        )}

        {editable && !adding && (
          <Button type="button" variant="outline" className="w-full justify-start gap-2 border-dashed" onClick={() => setAdding(true)} data-tools-add>
            <Plus className="size-4" aria-hidden />{words.add}
          </Button>
        )}
        {editable && adding && (
          <div data-block="tools-tab-add" className="flex flex-col gap-3">
            <VoiceTextarea value={text} onChange={setText} lang={lang} title={words.addTitle} hint={words.addHint} placeholder={words.addPlaceholder} rows={4} />
            <div className="flex flex-wrap gap-2">
              <Button type="button" disabled={!text.trim() || busy} onClick={() => { open(createTask(place, text), true); setAdding(false); setText("") }} data-tools-run>
                {words.run}
              </Button>
              <Button type="button" variant="ghost" onClick={() => { setAdding(false); setText("") }}>{words.cancel}</Button>
            </div>
          </div>
        )}
        {busy && <Small data-tools-tab="one-terminal">{words.oneTerminal}</Small>}
      </div>

      {drawer && (
        <TerminalDrawer key={drawer.n} service={service} lang={lang} className="w-full"
          words={{ title: words.drawerTitle, hint: drawer.start ? words.drawerHint : words.drawerHintEdit, collapse: words.collapse }}
          kit={kit} text={drawer.text} start={drawer.start} onCollapse={() => { setDrawer(null); setRefresh((n) => n + 1) }} />
      )}
      {shown && <ToolDemo tool={shown} lang={lang} words={words} ui={kit.dialogUi} kit={demo} onClose={() => setShown(null)} />}
    </div>
  )
}

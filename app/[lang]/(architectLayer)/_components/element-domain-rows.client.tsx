"use client"
// @local — the element's «Настройки → Домен» (one route): the page's top menu and ONE bordered card of closed rows, the strip with the arrow

import { type ReactNode, useState } from "react"
import { PageAnchors } from "@/components/nav/page-anchors.client"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

// 803-4 (the owner, 2026-11-19: «очевидно что здесь ты должен провести то самое изменение интерфейса», the decision card of the skill
// interface-design and .interface-design/system.md — the page «Сервер» is the reference): every part of the page is a row of one bordered
// card — its title 14 px / 500 and its one muted line, the body with its fields and buttons only when the person opens it; nothing is open
// by default; the menu above opens and brings a row; the strip below says something lies further down. Depth by borders only, no shadows.
// ✗ 801-1 put each part into its own card with its title inside and every body open, and the arrow floated over a button.

export type DomainRow = { id: string; title: string; line: string; body: ReactNode; tone?: "warning" }

export function ElementDomainRows({ rows, label, down }: { rows: DomainRow[]; label: string; down: string }) {
  const [open, setOpen] = useState("")
  return (
    <PageAnchors items={rows.map((r) => ({ id: r.id, label: r.title }))} label={label} down={down} onGo={setOpen}>
      <Accordion className="mt-6 rounded-lg border border-border bg-card" collapsible data-block="element-domain-rows" onValueChange={setOpen} type="single" value={open}>
        {rows.map((r) => (
          <AccordionItem className="scroll-mt-32 last:border-b-0" data-domain-row={r.id} id={r.id} key={r.id} value={r.id}>
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <span className="flex min-w-0 flex-col gap-0.5 text-start">
                <span className={r.tone === "warning" ? "font-medium text-sm text-warning" : "font-medium text-foreground text-sm"}>{r.title}</span>
                <span className="font-normal text-muted-foreground text-sm">{r.line}</span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-2 px-4">{r.body}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </PageAnchors>
  )
}

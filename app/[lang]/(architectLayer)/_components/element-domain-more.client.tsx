"use client"
// @local — the «Домен» page's one text link that opens and closes the note on sign-in on an own domain (one route, core step 805)

import { type ReactNode, useState } from "react"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

// 805 (the owner, 2026-11-19: «четвёртая вкладка вообще не должна существовать в аккордеона дополнительная информация должна открываться
// просто под кнопкой дополнительная информация это текст ссылкой нажимаем появляется текст второй раз нажимаем исчезает»): the note
// «Вход на собственном домене» is no row of the page any more — a text link under the own domain's row; one press opens, the next closes.
export function ElementDomainMore({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <Collapsible open={open} onOpenChange={setOpen} data-block="element-domain-more" data-domain-more={open ? "open" : "closed"}>
      <CollapsibleTrigger asChild>
        <Button type="button" variant="link" size="sm" className="h-auto px-0 text-[length:var(--fs-small)]" data-domain-more-toggle>{label}</Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2" data-block="element-domain-more-body">{children}</CollapsibleContent>
    </Collapsible>
  )
}

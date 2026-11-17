// @local — the «Подробнее» fold of the domain page's sections (step 775): instructions stay folded and never push a section's fields down
import type { ReactNode } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

// The owner, 2026-11-17: «В каждой вкладке любая дополнительная информация в формате инструкции скрыто в аккордеоне подробнее и не мешает
// основным интерактивным полям». One fold per section, closed by default; what it holds belongs to that section only.
export function DomainMore({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <Accordion type="single" collapsible data-block={`domain-more-${id}`} data-domain-more={id}>
      <AccordionItem value={id} className="border-0">
        <AccordionTrigger className="py-2 text-sm font-normal text-muted-foreground hover:no-underline">{label}</AccordionTrigger>
        <AccordionContent className="flex flex-col gap-2 text-sm text-muted-foreground">{children}</AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

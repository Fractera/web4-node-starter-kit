import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { AiProviderCard } from "@/components/ai-provider/ai-provider-card"
import { aiProviderUi } from "@/components/ai-provider/ai-provider.i18n"
import { designUi } from "@/components/design/design.i18n"
import { PanelDesign } from "./panel-design.client"
import { panelDesignUi } from "./panel-design.i18n"

// «НАСТРОЙКИ» УЗЛА (шаг 718; владелец 2026-11-11: «на вкладке настройки сделать выпадающий список у которого первая настройка это
// главный провайдер … вторая настройка это будет дизайн панели»). Раскрывающийся список: провайдер открыт сразу, дизайн — по нажатию.
export function NodeSettings({ lang }: { lang: string }) {
  const w = panelDesignUi(lang)
  return (
    <Accordion type="multiple" defaultValue={["provider"]} className="my-6" data-block="nst01">
      <AccordionItem value="provider" data-node-setting="provider">
        <AccordionTrigger>
          <span className="flex flex-col items-start gap-1 text-left">
            <span className="font-medium">{w.provider}</span>
            <span className="font-normal text-muted-foreground text-sm">{w.providerLead}</span>
          </span>
        </AccordionTrigger>
        <AccordionContent><AiProviderCard words={aiProviderUi(lang)} /></AccordionContent>
      </AccordionItem>
      <AccordionItem value="panel-design" data-node-setting="panel-design">
        <AccordionTrigger>
          <span className="flex flex-col items-start gap-1 text-left">
            <span className="font-medium">{w.panel}</span>
            <span className="font-normal text-muted-foreground text-sm">{w.panelLead}</span>
          </span>
        </AccordionTrigger>
        <AccordionContent><PanelDesign ui={designUi(lang)} words={w} /></AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

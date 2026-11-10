import { Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { ElementDesignWords } from "@/app/[lang]/(architectLayer)/_i18n/element-design.i18n"
import type { CardState } from "./flow"

// ПЛАШКА СОСТОЯНИЯ ТЕСТОВОЙ СТРАНИЦЫ (узел, шаг 715-3). Владелец 2026-11-10: «красная плашка не сгенерировано … зелёную плашку с
// сгенерировано». Строится — жёлтая, утверждённая — зелёная с галочкой, в архиве — серая. Цвета — токены темы, не палитра.
const TONE: Record<CardState, string> = {
  none: "bg-destructive text-white",
  building: "bg-warning text-foreground",
  ready: "bg-success text-success-foreground",
  approved: "bg-success text-success-foreground",
  archived: "bg-muted text-muted-foreground",
}
const WORD: Record<CardState, keyof ElementDesignWords["status"]> = { none: "none", building: "building", ready: "ready", approved: "approved", archived: "archived" }

export function DesignStatus({ state, words }: { state: CardState; words: ElementDesignWords }) {
  return (
    <Badge data-block="edb01" data-design-status={state} className={TONE[state]}>
      {state === "approved" ? <Check aria-hidden /> : null}
      {words.status[WORD[state]]}
    </Badge>
  )
}

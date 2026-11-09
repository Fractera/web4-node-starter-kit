import type { ReactNode } from "react"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { H3, P } from "@/components/ui/typography"

// ОБЩИЕ ЧАСТИ ШАГА ДИЗАЙНА (узел, шаг 713-2): у каждого шага одна шапка — заголовок и одна строка о том, зачем он, — и один низ: слева
// действие шага, справа «Дальше». Рамок нет: шаг лежит на странице, границы рисует путь сверху (метод interface-design: одна глубина —
// линии, без карточки в карточке).

/** Мелкий текст по шкале проекта — для строк внутри кнопок и строк списка, где абзац `Small` стоять не может. */
export const SMALL = "text-[length:var(--fs-small)] leading-normal"

export function StepHead({ title, lead, children }: { title: string; lead: string; children?: ReactNode }) {
  return (
    <div data-block="esp01" className="flex flex-col gap-1.5">
      <H3 data-block="esp02" variant="ui">{title}</H3>
      <P data-block="esp03" className="max-w-prose">{lead}</P>
      {children}
    </div>
  )
}

export function StepNext({ label, onNext, children }: { label?: string; onNext?: () => void; children?: ReactNode }) {
  return (
    <div data-block="esp04" className="flex flex-col gap-4">
      <Separator />
      <div data-block="esp05" className="flex flex-wrap items-center justify-between gap-3">
        <div data-block="esp06" className="flex flex-wrap items-center gap-3">{children}</div>
        {label && onNext ? (
          <Button type="button" variant="outline" onClick={onNext} data-design-next>
            {label}
            <ArrowRight data-icon="inline-end" aria-hidden />
          </Button>
        ) : null}
      </div>
    </div>
  )
}

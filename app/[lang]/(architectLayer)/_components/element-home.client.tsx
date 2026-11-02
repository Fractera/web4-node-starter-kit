"use client"

import type { ReactNode } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LagrixRating, type LagrixRatingWords } from "@/components/element-docs/lagrix-rating"
import { DocLinks } from "@/components/lagrix/doc-items"
import { NodeWalletBody } from "@/components/wallet/node-wallet.client"
import type { NodeWalletWords } from "@/components/wallet/node-wallet.i18n"

// ГЛАВНАЯ КАСТОМНОГО ЭЛЕМЕНТА (551-2). Владелец 2026-10-20: «Чего там не хватает … дубликата страницы для добавления кошелька … надо
// чтобы здесь была в продублированных где-то вкладка работа с кошельком так как это является базовой настройкой».
// Один аккордеон, открыт один пункт (как Паспорт узла, 495-5): репутация в Lagrix и кошелёк элемента — тот же островок и та же дверь,
// что «Настройки → Платежи → Web3». Тревогу «элемент не найдут» собирает сервер (`alarm`); пока она горит, при входе открыт кошелёк, а у
// его заголовка красная точка — тревога видна и в свёрнутом виде.
export function ElementHome({ id, rating, wallet, alarm, alarmMark }: {
  id: string
  rating: LagrixRatingWords
  wallet: NodeWalletWords
  alarm: ReactNode | null
  alarmMark: string
}) {
  return (
    <Accordion type="single" collapsible defaultValue={alarm ? "wallet" : "rating"} data-element-home={id}>
      <LagrixRating id={id} item="rating" words={rating} />
      <AccordionItem value="wallet" className="border-b-0" data-element-wallet={id}>
        <Card className="my-4">
          <CardHeader className="relative">
            <CardTitle className="flex items-center gap-2 text-xl font-semibold">
              {alarm ? <span role="img" aria-label={alarmMark} className="size-2.5 shrink-0 rounded-full bg-destructive" data-alarm-dot /> : null}
              {wallet.elementTitle}
            </CardTitle>
            <CardDescription>{wallet.lead} <DocLinks lang={wallet.lang} docs={wallet.leadDocs} /></CardDescription>
            <CardAction>
              <AccordionTrigger aria-label={rating.toggle} className="py-0 after:absolute after:inset-0 after:content-['']" />
            </CardAction>
          </CardHeader>
          <AccordionContent className="pb-0">
            <CardContent className="flex flex-col gap-4">
              {alarm}
              <NodeWalletBody words={wallet} element={id} />
            </CardContent>
          </AccordionContent>
        </Card>
      </AccordionItem>
    </Accordion>
  )
}

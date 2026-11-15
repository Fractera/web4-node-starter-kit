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
// 749-4 (владелец 2026-11-15: «так как этот элемент ещё не построен я попрошу тебя сделать аккордеон внутри которого будут скрыты все
// эти элементы … пусть аккордеон существует а вся информация не будет скрыта»): всё это — внутри ОДНОЙ закрытой полосы «Данный элемент
// в сетях Lagrix Web4 (пока не построена)». Ничего не снято: открыл — внутри прежний аккордеон как был. Пунктир — «ещё не построено»
// (как пунктир кнопки «Создать элемент»); тихий тон — сеть не спорит с портом и адресом над ней, которые работают сегодня.
export function ElementHome({ id, title, rating, wallet, alarm, alarmMark }: {
  id: string
  /** 749-4: заголовок полосы Lagrix — слова владельца. */
  title: string
  rating: LagrixRatingWords
  wallet: NodeWalletWords
  alarm: ReactNode | null
  alarmMark: string
}) {
  return (
    <Accordion type="single" collapsible className="my-4" data-element-lagrix={id} data-block="element-lagrix">
      <AccordionItem value="lagrix" className="rounded-lg border border-dashed px-4 last:border-b">
        <AccordionTrigger className="items-center py-3 text-muted-foreground hover:text-foreground hover:no-underline">{title}</AccordionTrigger>
        <AccordionContent className="pb-1">
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
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

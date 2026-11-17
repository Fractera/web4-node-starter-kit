'use client'

import { useEffect, useState } from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { isTemporaryHostname } from '@/components/shell/temporary-host'
import { isLoopbackHostname } from '@/lib/auth/owner-at-machine'
import { isShowcaseHostname } from '@/lib/showcase'
import { useNodePlace } from '@/components/node-state/use-node-place.client'

// ПРЕДУПРЕЖДЕНИЕ СЛОЯ: «ВЫ ЗДЕСЬ БЕЗ АВТОРИЗАЦИИ, И ЭТО ВРЕМЕННОЕ СОСТОЯНИЕ».
//
// 🔒 РЕШЕНИЕ ВЛАДЕЛЬЦА 2026-09-19, дословно: «разрабатывать архитектуру если
// пользователь собирается оставить проект без авторизации можно только в режиме
// разработки или в режиме временного домена. Обе сценария являются нежелательными
// и временными, тогда как для полноценного использования рекомендуется
// активировать микросервис авторизации Fractera… это важное предупреждение
// верхней части страницы его можно было бы скрыть в аккордеон тип Warning… if it
// is devmode or temp domain flow, in normal flow accordion not need».
//
// 🪦 ПРЕЖДЕ ЗДЕСЬ БЫЛА ПОЛОСА В ОДНУ СТРОКУ, показывавшаяся только хозяину за
// клавиатурой и спрашивавшая о нём `/api/me`. Отменено тем же решением: полоса
// молчала ровно там, где предупреждение нужнее всего, — на временном адресе в
// интернете, куда человек приходит из чужой сети.
//
// 🔒 СВЁРНУТО ПО УМОЛЧАНИЮ — ЭТО И ЕСТЬ ПРОСЬБА «СКРЫТЬ В АККОРДЕОН». Человек
// видит одну строку и раскрывает её, когда готов читать. Развёрнутое
// предупреждение на каждой из одиннадцати страниц перестаёт читаться на третьей.
//
// 🔒 РЕЖИМ ОПРЕДЕЛЯЕТ БРАУЗЕР, А НЕ СЕРВЕР, И ЭТО НЕ ЛЕНЬ. Страницы слоя
// статические; спросить на сервере «кто пришёл» значит одной строкой (`headers()`)
// увести в динамику весь слой — запрещено каноном статики. Островок смотрит на имя
// хоста уже в браузере, поэтому страница остаётся предрендеренной.
//
// 🛑 ЧЕГО ЭТОТ ПРИЗНАК НЕ ВИДИТ, НАЗВАНО ВСЛУХ: режим разработки, поднятый на
// собственном домене. Тогда предупреждение не покажется, хотя замок снят. Сам замок
// при этом на месте — он в `proxy.ts` и от этой строки не зависит: островок ничего
// не охраняет, он объясняет.
//
// 🛑 И ГЛАВНОЕ: ОН НЕ ЗАЩИТА. Кого пускать, решают ворота на сервере. Предупреждение
// в браузере, пытающееся «на всякий случай» что-то закрыть, дало бы ложное чувство
// защиты там, где защиты по природе нет.

type Mode = 'machine' | 'temporary' | 'showcase' | null

// 🔒 ПРИЗНАКИ БЕРУТСЯ ИЗ ТЕХ ЖЕ ФАЙЛОВ, ЧТО ЧИТАЕТ СЕРВЕР (2026-09-19). Здесь
// лежала третья рукописная копия того же знания — список имён петли и суффикс
// туннеля строкой. Копии расходятся молча, и расхождение выглядит не поломкой, а
// неверным объяснением на экране: предупреждение либо молчит там, где замок снят,
// либо пугает там, где он на месте.
function detectMode(): Mode {
  if (typeof window === 'undefined') return null
  const host = window.location.hostname
  if (isLoopbackHostname(host)) return 'machine'
  if (isTemporaryHostname(host)) return 'temporary'
  // 🔒 ВИТРИНА — ПОСЛЕДНЕЙ И НАМЕРЕННО (256-2). Порядок здесь имеет смысл: узел
  // самой Fractera можно открыть и с его машины, и через туннель, и по домену.
  // Первые два ответа точнее — они говорят человеку, ПОЧЕМУ открыто именно у него
  // сейчас; витринный текст адресован тому, кто пришёл снаружи по постоянному
  // адресу, и только для него он верен.
  if (isShowcaseHostname(host)) return 'showcase'
  return null
}

export function OwnerBand({
  title,
  reasonMachine,
  reasonTemporary,
  reasonShowcase,
  body,
  titleMachine,
  bodyMachine,
  titleTemporary,
  bodyTemporary,
  titleWindow,
  reasonWindow,
  goWeb,
  setupDomain,
  titleWeb,
  reasonWeb,
  goLocal,
  lang,
}: {
  title: string
  reasonMachine: string
  titleMachine: string
  bodyMachine: string
  titleTemporary: string
  bodyTemporary: string
  reasonTemporary: string
  reasonShowcase: string
  body: string
  titleWindow: string
  reasonWindow: string
  /** 776: «Перейти в web» — the same page on the node's own domain */
  goWeb: string
  /** 776: no main domain yet — «Настройте домен», to the domain page */
  setupDomain: string
  /** 775: the blue band of the web — the node lives on the person's computer, this page came through its domain */
  titleWeb: string
  reasonWeb: string
  goLocal: string
  lang: string
}) {
  const [mode, setMode] = useState<Mode>(null)
  // 741-6: «localhost» on a SERVER is the SSH window (`npm run server -- window`), not this computer — the node says where it lives.
  const place = useNodePlace()
  const onServer = place?.kind === 'server'

  // Определяется после гидратации: при серверном рендере адреса браузера нет, и
  // выдуманное умолчание показало бы предупреждение тому, кому оно не адресовано.
  useEffect(() => setMode(detectMode()), [])

  // 775 (the owner, 2026-11-17: «такую же полоску но не оранжевую а голубую … чтобы можно было перейти в режим компьютера, если мы
  // находимся на локальном компьютере а не на сервере»): a page of the node's own domain while the node lives on a computer — the blue band
  // with «Перейти на компьютер», the same page on this computer's panel (it opens only at that computer).
  const path0 = typeof window === 'undefined' ? '' : `${window.location.pathname}${window.location.search}`
  if (!mode && place?.kind === 'home' && place.via === 'web' && place.local) {
    return (
      <div className="mb-4 flex flex-wrap items-center gap-x-3 rounded-md border border-primary/40 bg-primary/10 px-3 py-2" data-owner-band="web">
        <div className="min-w-0 flex-1 text-[length:var(--fs-small)] text-foreground">
          <p className="font-medium">{titleWeb}</p>
          <p className="text-muted-foreground">{reasonWeb}</p>
        </div>
        <a href={`${place.local}${path0}`} className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'shrink-0')} data-owner-band-local>{goLocal}</a>
      </div>
    )
  }
  if (!mode) return null
  // 387-3: на этом компьютере — свой заголовок и вывод с настоящим адресом страницы, без «состояние временное».
  const host = typeof window === 'undefined' ? '' : window.location.host
  const machine = mode === 'machine'
  const titleHere = onServer ? titleWindow : titleMachine
  const reasonHere = onServer ? reasonWindow : reasonMachine

  // 776 (the owner, 2026-11-17: «сюда же кнопку перейти в web … либо это невозможно и тогда там текст настройте домен который
  // пробрасывать на активацию домена»): at this computer the band carries the way to the web — the same page on the panel's own domain
  // (the node names it in its one place answer), or, without a main domain, the way to the domain page. Not on a server's SSH window.
  const path = typeof window === 'undefined' ? '' : `${window.location.pathname}${window.location.search}`
  const action = machine && !onServer && place !== undefined
    // 775 (the owner: «кнопка перейти в web … появляется только тогда, когда четвёртый пункт поддомены полностью завершён»)
    ? place?.web && place.webReady
      ? <a href={`${place.web}${path}`} className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'my-1.5 shrink-0')} data-owner-band-web>{goWeb}</a>
      : <a href={`/${lang}/architect/hosting/domain`} className={cn(buttonVariants({ variant: 'link', size: 'sm' }), 'my-1.5 shrink-0 px-0')} data-owner-band-setup>{setupDomain}</a>
    : null

  // 776: the colour is the theme's `warning` token, not a literal amber (a literal leaves the owner's palette silently).
  return (
    <div className="mb-4 flex flex-wrap items-start gap-x-3 rounded-md border border-warning/40 bg-warning/10 px-3" data-owner-band={mode}>
    <Accordion type="single" collapsible className="min-w-0 flex-1">
      <AccordionItem value="auth-warning" className="border-0">
        <AccordionTrigger className="py-2 text-[length:var(--fs-small)] text-foreground hover:no-underline">
          <span>
            <span aria-hidden="true">⚠ </span>
            {machine ? titleHere.replace('{host}', host) : mode === 'temporary' ? titleTemporary : title}
          </span>
        </AccordionTrigger>
        <AccordionContent className="pb-3 text-[length:var(--fs-small)] text-foreground">
          <p className="mb-2">
            {machine ? reasonHere.replace('{host}', host) : mode === 'showcase' ? reasonShowcase : reasonTemporary}
          </p>
          {/* 🔒 ВЫВОД О МИКРОСЕРВИСЕ АВТОРИЗАЦИИ АДРЕСОВАН ХОЗЯИНУ УЗЛА, А НЕ
              ПРОХОЖЕМУ. На витрине его нет: человеку, пришедшему из поиска,
              незачем советовать, что активировать в чужом узле. */}
          {mode !== 'showcase' && <p>{machine ? bodyMachine : mode === 'temporary' ? bodyTemporary : body}</p>}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
    {action}
    </div>
  )
}

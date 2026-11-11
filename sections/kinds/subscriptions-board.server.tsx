import type { SectionRenderer } from '@/sections/contract'
import { Small } from '@/components/ui/typography'
import { SubscriptionsBoard, type SubscriptionsBoardWords } from '@/components/dashboard/subscriptions-board.client'

// «ВСЕ ПОДПИСКИ» (726-3): слова берутся здесь, на сервере, и уходят островку пропсами (словарь в браузер не уезжает).
// Без JavaScript островок не спросит узел — тогда видна строка `noscript`, а не вечный скелет.
const WORDS: Record<string, SubscriptionsBoardWords & { noscript: string }> = {
  en: {
    loading: 'Reading the services of the node…',
    unavailable: 'The node did not answer, so the services are not shown.',
    refresh: 'Refresh',
    lead: 'Every outside service an element of the node declares or pays for, with the calls of the last {days} days from the ledger.',
    head: ['Service', 'Who uses it', 'Keys', 'Calls', 'Last call', 'Last refusal'],
    core: 'Core of the node',
    example: 'example',
    keys: { set: 'set', partial: 'partly set', missing: 'not set' },
    noKeys: 'no key needed',
    usersCount: '{n} elements',
    usersTitle: 'Elements that use the service',
    usage: '{n} calls, {r} refused',
    noCalls: 'no calls',
    answered: 'answered',
    refused: 'refused',
    tokens: 'tokens {in} in / {out} out',
    emptyTitle: 'No outside service yet',
    emptyHint: 'No element declares a paid service and the ledger holds no paid call.',
    noscript: 'The table is asked from the node in the browser — turn JavaScript on to see it.',
  },
  ru: {
    loading: 'Читаю сервисы узла…',
    unavailable: 'Узел не ответил, поэтому сервисы не показаны.',
    refresh: 'Обновить',
    lead: 'Каждый внешний сервис, который элементы узла объявляют или оплачивают, и вызовы за последние {days} дн. по журналу.',
    head: ['Сервис', 'Кто использует', 'Ключи', 'Вызовы', 'Последний вызов', 'Последний отказ'],
    core: 'Ядро узла',
    example: 'пример',
    keys: { set: 'заданы', partial: 'заданы не все', missing: 'не заданы' },
    noKeys: 'ключ не нужен',
    usersCount: 'элементов: {n}',
    usersTitle: 'Элементы, которые используют сервис',
    usage: '{n} вызовов, отказов {r}',
    noCalls: 'вызовов нет',
    answered: 'ответил',
    refused: 'отказал',
    tokens: 'токены: {in} на вход / {out} на выход',
    emptyTitle: 'Внешних сервисов пока нет',
    emptyHint: 'Ни один элемент не объявил платный сервис, и в журнале нет платных вызовов.',
    noscript: 'Таблица спрашивается у узла в браузере — включите JavaScript, чтобы её увидеть.',
  },
}

export const subscriptionsBoard: SectionRenderer<'subscriptionsBoard'> = (b, { key: k }) => {
  const { noscript, ...words } = WORDS[b.lang] ?? WORDS.en
  return (
    <div key={k} data-block="subscriptions-board">
      <noscript><Small className="my-6 text-muted-foreground">{noscript}</Small></noscript>
      <SubscriptionsBoard lang={b.lang} words={words} />
    </div>
  )
}

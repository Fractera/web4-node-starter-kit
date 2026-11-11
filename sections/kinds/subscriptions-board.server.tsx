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
    lead: 'Calls — the last {days} days of the ledger.',
    head: ['Service', 'Who uses it', 'Keys', 'Calls', 'Last call', 'Last refusal'],
    core: 'Core of the node',
    example: 'example',
    keys: { set: 'set', partial: 'partly set', missing: 'not set' },
    noKeys: 'no key needed',
    usersCount: '{n} elements',
    usersTitle: 'Elements that use the service',
    usage: 'calls: {n} · refused: {r}',
    noCalls: 'no calls',
    answered: 'answered',
    refused: 'refused',
    tokens: 'tokens {in} in / {out} out',
    emptyTitle: 'No outside service yet',
    emptyHint: 'No element declares a paid service and the ledger holds no paid call.',
    noscript: 'The table is asked from the node in the browser — turn JavaScript on to see it.',
    checkBalances: 'Check balances',
    money: {
      today: {
        'no-spend': 'today: no calls',
        'no-budget': 'today: {n} calls · about {p} by the end of the day',
        within: 'today: {n} of {b} calls · enough for today',
        'will-cross': 'today: {n} of {b} calls · at this pace the budget ends at {t}',
        crossed: 'today: {n} calls · the budget of {b} was reached at {t}',
        refusing: 'the provider refuses for money since {t}',
      },
      budget: 'Budget',
      budgetTitle: 'Daily budget of {name}',
      budgetLead: 'In calls a day (UTC). The node counts them from its ledger and warns when the pace will not last the day. 0 removes it.',
      budgetSave: 'Save',
      budgetUnit: 'calls a day',
      balance: {
        balance: 'balance ${usd}',
        'spent-today': 'spent today ${usd}; the provider does not tell the balance',
        'not-told': 'the provider does not tell the balance; the day\'s spend needs the key {key}',
        'needs-key': 'the balance needs the service key {key}',
        unknown: 'the node does not know how this provider tells the balance',
        failed: 'the provider did not answer {status}',
      },
      billing: 'billing',
    },
  },
  ru: {
    loading: 'Читаю сервисы узла…',
    unavailable: 'Узел не ответил, поэтому сервисы не показаны.',
    refresh: 'Обновить',
    lead: 'Вызовы — за последние {days} дн. по журналу.',
    head: ['Сервис', 'Кто использует', 'Ключи', 'Вызовы', 'Последний вызов', 'Последний отказ'],
    core: 'Ядро узла',
    example: 'пример',
    keys: { set: 'заданы', partial: 'заданы не все', missing: 'не заданы' },
    noKeys: 'ключ не нужен',
    usersCount: 'элементов: {n}',
    usersTitle: 'Элементы, которые используют сервис',
    usage: 'вызовов: {n} · отказов: {r}',
    noCalls: 'вызовов нет',
    answered: 'ответил',
    refused: 'отказал',
    tokens: 'токены: {in} на вход / {out} на выход',
    emptyTitle: 'Внешних сервисов пока нет',
    emptyHint: 'Ни один элемент не объявил платный сервис, и в журнале нет платных вызовов.',
    noscript: 'Таблица спрашивается у узла в браузере — включите JavaScript, чтобы её увидеть.',
    checkBalances: 'Проверить балансы',
    money: {
      today: {
        'no-spend': 'сегодня: вызовов нет',
        'no-budget': 'сегодня: вызовов {n} · к концу дня около {p}',
        within: 'сегодня: {n} из {b} вызовов · на сегодня хватит',
        'will-cross': 'сегодня: {n} из {b} вызовов · при таком темпе бюджет кончится в {t}',
        crossed: 'сегодня: вызовов {n} · бюджет {b} исчерпан в {t}',
        refusing: 'поставщик отказывает из-за денег с {t}',
      },
      budget: 'Бюджет',
      budgetTitle: 'Бюджет дня: {name}',
      budgetLead: 'В вызовах за сутки (UTC). Узел считает их по журналу и предупредит, если темпа не хватит до конца дня. 0 — убрать.',
      budgetSave: 'Сохранить',
      budgetUnit: 'вызовов в сутки',
      balance: {
        balance: 'баланс ${usd}',
        'spent-today': 'сегодня потрачено ${usd}; баланс поставщик не сообщает',
        'not-told': 'баланс поставщик не сообщает; траты дня — с ключом {key}',
        'needs-key': 'для баланса нужен служебный ключ {key}',
        unknown: 'узел не знает, как этот поставщик сообщает баланс',
        failed: 'поставщик не ответил {status}',
      },
      billing: 'оплата',
    },
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

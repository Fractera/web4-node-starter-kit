// РАЗДЕЛ 8 «f2f · Web2: МАРКЕТПЛЕЙС СТАРТЕРОВ» — на странице «Как это работает» (шаг 862-10, владелец 2026-11-27, Telegram 1659: «На
// вкладку как она работает добавь в верхнее меню вкладку f2f web2 … опиши что представляет из себе наш Маркетплейс … Писать красиво
// используя навык humanize писать компактный сжатое но с понятным смыслом»). Во временной версии без Lagrix он седьмой (`renumber`).
//
// 🔒 Каждое утверждение — из карты маркетплейса (навык `marketplace`: §2 что продаётся, §3 дороги, §4 деньги; стандарт v1.3 — векторы
// магазина) или из слов владельца в том же сообщении: символическая цена и «до недели разработки», векторы, хранилище и граф магазина.
// Ни слова о Lagrix: временная версия падает на нём (`assertNoLagrix`). Написано навыком `humanizer`.
// `en` основа, `ru` перевод; слова ликбеза находит и подсвечивает `_components/index.ts`.
import type { PresentationSection } from './presentation'

export const MARKETPLACE_SECTIONS: Record<'en' | 'ru', PresentationSection[]> = {
  en: [
    {
      title: '8. f2f · Web2: the marketplace of starters',
      tab: 'f2f · Web2',
      lead: 'The Fractera marketplace sells starters: the smallest working base of a function, from which the agent of your element quickly finishes what the project needs. Finished solutions are not sold here. It is f2f, an exchange of whole elements between Fractera projects, paid the ordinary Web2 way, by card through Fractera.',
      parts: [
        {
          title: '8.1 What you get',
          items: [
            'A starter costs a symbolic price and can save up to a week of development, so a project fills up with the functions it needs fast.',
            'A free starter is taken at once, with no payment. A paid one is paid once for the whole cart and serves the whole project.',
            'Every starter is researched before it is published, and its report is open before you buy.',
            'Buying and installing are two separate steps. A bought starter is installed on the node as an element of its own, and a failed install is repeated for free.',
          ],
        },
        {
          title: '8.2 How the right starter is found',
          items: [
            'The store’s server keeps vectors, a file store and a graph; with them, AI picks a starter for a task told in plain words.',
            'You do not have to search. When an element’s agent lacks a function, fitting starters are found by themselves and land among the recommended ones, marked with who asked and for which task.',
            'Every decision is yours: keep a starter, delete it or put it in the cart. A deleted starter is not offered again for the same task.',
            'Every starter has an open page in the store with what it can do, its price and its research report. Anyone can read it.',
          ],
        },
        {
          title: '8.3 A market in every node, and the author’s share',
          items: [
            'Every node has its own marketplace client: the recommended starters, the cart and the bought ones, each a tab of its personal account.',
            'A native element you created yourself can be offered in the marketplace. Fractera checks it before publication, and the income from its sales is split 50/50.',
          ],
        },
      ],
    },
  ],
  ru: [
    {
      title: '8. f2f · Web2: маркетплейс стартеров',
      tab: 'f2f · Web2',
      lead: 'Маркетплейс Fractera продаёт стартеры: минимальную работающую основу функции, из которой агент вашего элемента быстро доводит до конца то, что нужно проекту. Готовые решения здесь не продаются. Это f2f, обмен целыми элементами между проектами Fractera, а платят по-обычному, как в Web2: картой через Fractera.',
      parts: [
        {
          title: '8.1 Что вы получаете',
          items: [
            'Стартер стоит символически, а экономит иногда до недели разработки. Так проект быстро наполняется нужными функциями.',
            'Бесплатный стартер берётся сразу, без оплаты. За платный платят один раз, за всю корзину, и он служит всему проекту.',
            'Каждый стартер проходит исследование до публикации, и отчёт открыт до покупки.',
            'Купить и установить — два разных шага. Купленный стартер ставится на узел отдельным элементом, а неудачная установка повторяется бесплатно.',
          ],
        },
        {
          title: '8.2 Как находится нужный стартер',
          items: [
            'Сервер магазина держит векторы, хранилище файлов и граф; по ним ИИ подбирает стартер под задачу, сказанную обычными словами.',
            'Искать самому не нужно. Когда агенту элемента не хватает функции, подходящие стартеры находятся сами и попадают в «Рекомендованные элементы» с пометкой, кто и для какой задачи их просил.',
            'Решение по каждому за вами: оставить, удалить или положить в корзину. Удалённый стартер на ту же задачу больше не предлагается.',
            'У каждого стартера есть открытая страница в магазине: что он умеет, цена и отчёт исследования. Прочитать её может любой.',
          ],
        },
        {
          title: '8.3 Свой маркет в каждом узле и доля автора',
          items: [
            'В каждом узле стоит свой клиент маркетплейса. В его «Личном кабинете» три вкладки: «Рекомендованные элементы», «Корзина» и «Купленные».',
            'Нативный элемент, который вы создали сами, можно выставить в маркетплейс. Fractera проверяет его перед публикацией, а доход от продаж делится 50 на 50.',
          ],
        },
      ],
    },
  ],
}

// Words of the three marketplace entries of every drawer «Личный кабинет» (core step 862-12). They name the marketplace client's pages,
// so they live with the links (`lib/menu/account-links.ts`), not in the account feature's catalogue. `en` base, `ru` the person's.

export type MarketLinkWords = { recommendations: string; cart: string; purchases: string }

const UI: Record<string, MarketLinkWords> = {
  en: { recommendations: "Recommended elements", cart: "Cart", purchases: "Bought" },
  ru: { recommendations: "Рекомендованные элементы", cart: "Корзина", purchases: "Купленные" },
}

export function marketLinkWords(lang: string): MarketLinkWords {
  return UI[lang] ?? UI[lang.slice(0, 2)] ?? UI.en
}

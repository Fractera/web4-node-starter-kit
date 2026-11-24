# 854 — «Предложить в маркетплейсе» belongs to an own native element — summary

Roma 2026-11-24 (via lidt5, pre-steps/2026-11-24-server-agent-for-mac.md §4): «после того как пользователь создал свой собственный
нативный шаблон … раздел предложить в маркетплейсе … выпадающем списке выбрать веб два Fractera, Web4 (Lagrix) … по ошибке это реализовано в
кастомном шаблоне … там будет просто форма отправить заявку». Decided by me under Roma 1296 («решай это самостоятельно»): the section leaves
the custom element.

## Done (commit 45f59ebf, core build 93c35036)

- `lib/web4-items/item-tree.ts`: flag `ownNative`; Build → `f2f` = one page «Предложить в маркетплейсе» (was «f2f: обмен с Fractera» with
  find/publish on `network: true`, i.e. custom only). Old addresses `build/f2f/find|publish`, `build/find|publish`, `web3-store/*` → `build/f2f`.
- `lib/web4-items/tree-context.ts`: `ownNative = native && registry born`.
- `lib/web4-items/market-offer.mjs` + door `app/api/node/market-offer` (architect/admin; 404 `not-own-native` for others): the application
  is kept in `data/node/f2f/offers.jsonl`, `sent: false`, Web4 `mode: simulation`; nothing is sent — the page says so.
- Island `_components/element-market-offer.client.tsx` (shadcn Select → «Далее» → Field/Textarea/Input form) + i18n.

## Proofs

1. Guards: item-tree.test 9 (own native sees it; custom, preinstalled config and custom-with-stray-flag do not; negative control: the
   section back on `network: true` shows it to custom), market-offer.test 3 (refusals by kind). Prebuild RC=0.
2. Live, after the build: `/ru/cck60/build/f2f` 200, `/ru/fc4vk/build/f2f` 404 (negative), old `…/publish` 307 → `build/f2f`; eyes:
   select → Web2 → «Далее» → form visible, console clean (logs/eyes/2026-11-24T15-51-31-177Z.png). Door: cck60 POST → kept,
   `mode: simulation`; fc4vk and config → `not-own-native`; GET returns the last one. The test line was removed afterwards.

Surfaces seen: /ru/cck60/build/f2f (own native, eyes after the build: select → Web2 → «Далее» → the form, console clean — logs/eyes/2026-11-24T15-51-31-177Z.png); /ru/fc4vk/build/f2f 404 (custom, negative).

## Not proven

- Servers: waits Roma's «Обновить сборку ядра» (lidt5 there is native-template born → it will see the section).
- Sending to f2f-marketplace.fractera.ai: no receiving door exists yet — a later step when the marketplace opens one.

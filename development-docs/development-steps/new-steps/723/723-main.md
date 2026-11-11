# 723 — the public element menu at a thousand elements (PLAN — not built; split from 722-5 by the owner, 2026-11-11)

The owner's words (722): «в случае обычного пользователя может быть их будут миллионы мы не можем позволить себе такую нагрузку
предпочтительно показать последнюю Билл версию но абсолютно статически … все должно работать с выключенным JavaScript … в приоритете это
быстрое бесплатное отдача а можно пренебрегать это актуальность данных for pubkic users»; then «да, 723 отдельно».

## Measured 2026-11-11 (722-5)

- A visitor already gets the menu statically: the root site's public HTML carries the core's catalog («Кастомные элементы», «Клип») from
  the cache (`x-nextjs-cache: STALE`, `s-maxage=300`) — no server work per visitor.
- The catalog is pushed by the core into CONFIG only on a person's action (`lib/web4-items/catalog-push.ts`), every site draws it with
  its shell's mega-menu (`components/shell/`, a byte copy of the core's).
- The price at a thousand elements is the WEIGHT: all cards with descriptions, twice (wide and phone menus) — about 1 MB of HTML on every
  page of every site.

## The chosen shape — variant A (the core alone)

- The pushed catalog carries the first 12 custom elements and a card «Все проекты (N)».
- The card leads to a new public static page of the core «Все проекты» by twelve, with plain links «Ещё 12» — no JavaScript, no server
  per visitor; `revalidate = 600` stays (the owner: «revalidate оставь»).
- Open: the address a visitor of an own domain opens it at (the core lives on a subdomain there); the SEO and AIO guards of a new public
  page. Rejected for now: variant B (portions inside the sites' mega-menu — a release of the shell with every template).

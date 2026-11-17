# The architect panel — design system (skill interface-design)

Read this FIRST before any interface work on the core's architect pages. Decided with the owner (Roma), 2026-11-17, Telegram 406–411
(the decision card 409), after the domain page went wrong because nothing was written here and every session started from zero.

## Direction

- Who: the architect at the computer (or the phone), a non-designer, doing a rare setup act (a domain, a server) — calm, nothing extra
  on the screen, only the action.
- Feel: quiet and technical; structure by space and thin borders, never by colour or shadows.
- The reference page is «Сервер» (`/architect/hosting/hosting`, the launch ladder `components/hosting/ladder-step.tsx`): every other
  setup page keeps its style.

## Page pattern (a setup page)

- Sections, each: a subheading `H2 variant="ui"` and ONE muted line (`Small text-muted-foreground`, `gap-1`) ABOVE a bordered accordion
  card. Never a subheading inside the accordion.
- The card: `Accordion` with `rounded-lg border border-border bg-card`; rows `AccordionTrigger className="px-4 py-3"` (title 14 px /
  500, a muted second line for the state); bodies `px-4`. Rows divide by the item's own bottom border.
- Nothing open by default: every row is closed until the person opens it (the owner: «первый аккордеон открывается — зачем, задания не
  было»). A step ladder (one current rung open by its rule) is the one exception, and only where steps lock each other.
- An add row is the last row of its card, named by what it adds: «+ Добавить основной домен», «+ Добавить дополнительный домен».
- No «Подробнее» folds and no instruction text on the page (the owner: «Слишком много мусора»). Words that matter go into a row's own
  body or nowhere.
- Cards of reference (where to register a domain) come last, as a plain accordion card of the same style.

## Spacing

- Base unit 4 px. One rhythm between parts of a page: 48 px (`gap-12`), also from the page's lead to the first part (`mt-12`).
- From a subheading to its card: 12 px (`gap-3`). Inside a body: 8 px (`gap-2`).

## Depth and type

- Borders only (`border-border`), no shadows. Radius `rounded-lg` for cards, `rounded-md` for inner boxes.
- Subheading: `H2 variant="ui"`; the muted line: `Small`; rows: 14 px; domain names `font-mono`.
- Colour only for meaning: success / warning / destructive tokens on badges and alerts; never decoration.

## Before any interface code

Send the owner a decision card first (who, focal point, structure, spacing in px, what is open, what is removed), then code. Update this
file with every decision he makes.

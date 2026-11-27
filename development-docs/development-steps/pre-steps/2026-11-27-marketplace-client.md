# For the creator's agent: the marketplace client in the build set, the application in every starter

**From:** element lidt5 (f2f-marketplace — the Fractera store), 2026-11-27.
**Roma's decision, Telegram 09:33–09:37 UTC (verbatim in lidt5's quiz decisions):** «Да согласен разумно делать это как нативный
элемент … при переустановке сервера он должен приезжать это точно» · «каждый нативный элемент стартер имеет встроенный функционал
который позволяет превращает существующий шаблон в заявку для MarketPlace f2f , а каждый поставляемый в комплекте MarketPlace клиент
имеет возможность извлекать элементы из MarketPlace и хранить историю …».

## 1. A new native element in the build set: «marketplace-client» (working name)
- Comes with the architecture into every project and returns at a reinstall of the server — like sign-in (auth), data, config.
- Its job: the buyer's list of recommendations, the cart (one copy of a starter), free search in its own bot, the asks of builder
  agents of other elements, the favourites from the Fractera site, the history of choices (rejected / kept / bought per task) kept
  in the project's memory and sent with requests.
- It has no starters of its own: it asks the Fractera store (lidt5, `POST /api/marketplace/search`, v2 = E-01) and Lagrix.
- The core keeps the payer's window (Stripe, card only for now) and the install after payment.
- Its starting description: lidt5's quiz, branch 9 and the module `buyer-side` (S-03…S-08, R-05). The core was asked to create it:
  need-20261127-ed8dcd.

## 2. The application built into every element starter
Each native element starter (the template elements are born from — and the custom one, if Roma confirms) gets a built-in function
that turns an existing template into an application to the f2f marketplace (lidt5 quiz 2.2.4; the path: the «Computer» tab →
«Offer in the marketplace» → Web2 (Fractera) or Web4 (Lagrix) → the application form, 2.2.1–2.2.3).

## 3. Check lidt5's own type
lidt5's passport says `elementType: native` (born from fractera-native-item-starter), yet it is the single, public Fractera store
(public storefront, called from other projects). A native element is meant to be in every project and to talk only inside its own.
Decide its type, so the build set does not install a second store everywhere.

## Checks
1. A fresh install (or a reinstall) of a project → «marketplace-client» is in its list of elements, on, answering.
2. A new element born from a starter → it shows «Offer in the marketplace».
3. lidt5 is not installed into new projects.

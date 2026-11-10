# 715 — the Design tab to the owner's own scheme (closed 2026-11-10)

The owner 2026-11-10 09:16–09:35, the scheme: «Шаг один: … библиотека навыков … Бриф … не обязательно … сгенерировать и сравнить — на
этой странице карусель …». Accepted by moving on (11:20, «next?»); the badge and the prototypes-card requests of 10:35 closed in it.

## Commits
- Core `33fe6404` (715-1..7), `ea40c5a4` (the passport's «Официальный аккаунт» and «Главный кошелёк» hidden until Lagrix), pins
  `1cf26be0`, `c8e2a473`; node build 81ff047a.
- Custom template v0.3.182 (`c163006`), v0.3.183 (`a4120ee`), v0.3.184 (`82cdcd2`); qfx9w merged them (219d546, d837ee8).

## What was built
- Design tab: three steps «Навыки · Бриф (по желанию) · Сгенерировать и сравнить», a sticky track, the library of 108 skills with GitHub
  links, a carousel with red/amber/green states, «Изменить референс», «Тонкая настройка», «Утвердить этот дизайн»; the whole path from
  Telegram (`npm run design`); the core builds the element after a generation.
- Template: the starter caption with the terminal button; the width-and-skill circle back in the bottom-left corner on every page (owner
  only, the prototype's own skill, a short name with an ellipsis); the prototypes list with a filled button and a desktop preview through
  the architect-only door `/api/prototypes/<id>/shot`.

## Proofs
- Plane 1: tsc and every prebuild guard of the core and the template green; the release dry runs green.
- Plane 2: eyes on qfx9w at 1440 and 390 — the list, a prototype page, the stand home, the core's Design tab with «Тонкая настройка»; the
  passport with only «Как это работает»; console clean.

## Debts named
- The hover title of the circle is in code, not seen by eye.
- The queue defect (a pass waiting behind an idle session) closed in 33fe6404; the generation's ten minutes are the agent's work.

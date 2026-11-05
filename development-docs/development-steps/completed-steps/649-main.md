# 649 — the integrator and the page column (closed)

**Commits:** `Fractera/fractera-root-starter` `5171bc0`, tag v3.0.21; `Fractera/fractera-custom-item-starter` `67be1de`, tag v0.3.157;
`Fractera/web4-node-starter-kit` `5f3e19da` (skill, instruction and seal, soul, pins). The plan was agreed in the chat, not as a file.

**The owner, verbatim (2026-11-05):** «стартовом шаблоне root создать четвёртую вкладку интегратора агентов. Описать его в
существующем стиле»; «если хочешь где-нибудь это закрепи сказать честно это мой самый желанный сценарий работы проекта»; «тебе предстоит
самому решить как обучить самому себя тому что эту вещь умеет делать архитектуру»; «у нас внизу в подвале есть кнопка сделать экран
шире и сделать экран уже она не используется а должна. И сейчас лента в центральной странице выглядит очень узкой … мы должны быть уверены
что мы это можем исправить как в рут так и в стандартном кастомным шаблоне»; to the plan 649-1…4 — «go».

**649-1 — the page column.** Cause: a bare page (`meta.bare`) is drawn by its widgets alone, so `check-layout` rule 1 never saw it;
the root home wrote `max-w-[760px]`, `landing-agent` wrote `min(72rem, …)`. Now the root home column carries `data-app-column`, the field
keeps `max-w-3xl`, `landing-agent .wrap` reads `var(--app-w)` (both templates). `check-layout` rule 1в `bare-widget-without-column`
(both templates, one file): a widget on a bare page carries `data-app-column` or `var(--app-w)`; `widget-static-reference-title` is
named as centred with no limit.

**649-2 — the fourth card.** `rootHome.cards` + `integrator` (en, ru) in the voice of the three, no dashes (`humanizer`); icon `Users`;
the grid four from `lg`, two from `sm`; README and the machine copy follow. The card says «Каждый работает по своей подписке Claude».

**649-3 — how the node learns it.** Skill `integrator` (both natures): the order one person at a time — the rules first (own
subscription, 18+, a minor's element not on a Claude subscription — the architect decides), own domain, `create`, the person's
account, the bot by invite link, Lagrix at the person's word. `CLAUDE.md` §4 one scenario line, §8 one pointer, resealed
(`36080603f08e`). `soul.md` «The creator's dream», four lines. The element instruction untouched: a line there costs every session of
every element.

**Proofs.**
1. Guards, with negative controls: root's `check-layout` on the old `index.tsx` → `===LAYOUT_FAILED=== bare-widget-without-column
   …widget-static-root-home`, on the new → `===LAYOUT_OK===`; custom with `landing-agent` on its bare home and the old CSS → FAILED, the
   new CSS → OK (the data change reverted); `check-instruction-skills` with `integrator/` moved away → `✗ integrator — named by CLAUDE.md`.
   The whole prebuild of both templates after `git add` — exit 0, no file changed; root `tsc --noEmit` — exit 0; core:
   `check-instruction`, `check-instruction-skills`, `check-skill-headers` (83), `check-microservices`, `check-steps`, the broken
   characters scan — OK; CI three-os green on all three commits (`5171bc0e`, `67be1de8`, `5f3e19da`).
2. Eyes (lab copy of root, `next dev` on 25650, en + ru): 1440 × 1100 — the column `ш 1280`, the cards row 1248, the integrator card
   303 px, «виден», no console errors; after a click on «Уже экран» — the column 1024, the row 992, the card 239; the integrator card
   chosen → its story `ш 1248` «виден»; 390 px (en) — one card per row. Before: the column `ш 760` (the node's root v3.0.20,
   localhost:24683). Screenshots looked at.

**Not proven:** `landing-agent` by eyes — in the custom template it has no words (`landing` field) and renders nothing.

**Owed / not in it:** step 650 (proposed, not ordered) — an own Claude login per element (`CLAUDE_CONFIG_DIR` of the element, its
«Подписка» page), without which the integrator cannot run lawfully on Claude: today every agent of a node uses the machine's one login.
The lawful way for a minor's element — the owner's decision. The narrow state clips three card texts at four lines (the owner's rule of
587-3). Existing custom elements — `npm run template -- rollout custom v0.3.157 …` when the owner asks; root on a node arrives with
the pin by `node:update`.

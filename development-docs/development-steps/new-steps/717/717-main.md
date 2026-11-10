# 717 — an element's architecture an agent understands at once: sections, design and work with the neighbours (DRAFT — to agree)

## The owner's words, verbatim

2026-11-10 14:18: «Фокус моего вопроса заключается в том где и как теперь хранятся блоки в этой архитектуре и вообще чтобы ты мне пояснила
посты человеческим языком как у нас эта часть архитектуры поменялась является она идеальной интуитивно понятной агенту или её следовало
бы тоже оптимизировать?»

2026-11-10 14:25: «Я хочу чтобы ты сделал идеальную архитектуру которая будет интуитивно агенту понятно с минимальным количеством
необходимых инструкций чтобы он полностью понимал архитектуру приложения особенно с точки зрения совместного использования с другими
элементами в кейсах например:
– я строю элемент который будет публиковать посты в YouTube а значит мне нужны будут:
– – элементы которые умеют делать картинки
– – элементы которые умеют делать видео из этих картинок
– – элементы которые умеют писать хорошие креативные текст
– – моменты которые умеют отслеживать статистику эффективность. И так далее тому подобное. Как это связано с блоками и дизайном?Интерфейса
должны работать в связке на уровне сервера а на уровне клиента может быть и сами рабочие страницы выполнены с использованием одного и того
же навыка. Что тебе нужно делать заодно проверь достаточно ли у этого стартового кастомного шаблоны Наруто потому что я смотрю что у тебя
гораздо больше навыков чем ты выдал навыков элементов может быть это правильно а может быть мы просто ещё забыли написать ему инструкцию и
правильно набор навыков?
В любом случае сначала тестируем кастомный элемент потом когда тесты пройдут создадим нативный элемент с такими же изменениями. То что
касается других существующих элементов обсудим это позже»
(«Наруто» — a voice slip for «навыков».)

The order: the custom template first, tested on a fresh custom element; then the native template with the same changes; the existing
elements — later, by his word.

## What is known already (716 and the 14:18 answer)

- **Where sections live (custom v0.3.185):** code `components/blocks/block-<name>.tsx`; the set a page may name
  `lib/content/blocks/registry.tsx`; the shape `lib/content/blocks/types.ts`; the machine copy `lib/aio/blocks-to-markdown.ts`; a page is
  a list of sections with words `app/[lang]/<branch>/_pages/<page>/<lang>.json`; design prototypes
  `app/[lang]/(protectedLayer)/prototypes/_pages/<id>/` (tokens.json, DESIGN.md, words). The look: `DESIGN-CONFIG` + `DESIGN.md`, chosen in
  the core's Design tab. The template ships four document sections (section head, FAQ, TOC, warning).
- **Friction for an agent:** (1) one new section = four files (component, set line, type, Markdown line); (2) one word, three meanings —
  the folder `blocks`, kinds `block-*`, prose «sections», and the core's own catalogue (117 cards in `sections/blocks`); (3) natives keep an
  admin «Blocks» page and `.card.json` cards, custom has none since 706; (4) a prototype's sections are written into the shared
  `components/blocks/`, and the pin relies on the agent to remove the loser's.
- **Work with neighbours today:** i2i — agents meet through the core, agree an API, then call doors `/api/<name>` with `X-Node-Key`
  (`npm run door:add`, every door named in the A2A card); `npm run need` asks the core for a capability (on the node only in memory — step
  609); the core routes by roles (`npm run find`, skill `route-to-element`); the element's skills `node-elements-detection`, `use-i2i`,
  `a2a-conversation`, `need-capability`, `ask-core`, `answer-the-leader`. Design between elements: every element has its own; a sibling
  born «like X» (`create --look-like X`) copies X's brief and tokens once; there is no live link (the owner removed the shared Design).
- **Skills:** the core has ~87 skills, the custom template ~45 of its own plus vendored ones. Many core `use-*` skills are engineering
  skills an element agent may need too (data, roles, routes, static and dynamic pages, SEO, AIO, translations, testing, AI generation,
  personal data …) — or are deliberately replaced in elements (`use-own-stores`, `use-languages`, `use-machine-copy`). Not yet compared.

## Substeps (DRAFT — the owner's yes before code)

- 717-1 **Measure, no model:** what a fresh custom agent loads (CLAUDE.md, modes, skills index — size in tokens) and which architecture
  questions it cannot answer from it; the skills table core vs custom with a verdict per skill (needed · deliberately replaced · not for an
  element); `skills_find` for how others make a codebase readable to an agent (one map, conventions over rules) — sources named.
- 717-2 **One map of the element:** a short architecture page the agent reads first — the tree, where pages, sections, doors, data and the
  look live, how a page is made, how it works with neighbours; everything else on demand in skills. Agreed with the owner.
- 717-3 **A section is one folder:** `components/sections/<name>/` (code, shape, Markdown line together), the set assembled by code, one
  word «section», a prototype's sections inside the prototype until the pin.
- 717-4 **The YouTube case as the acceptance scenario:** a publisher element that needs pictures, video from pictures, creative texts and
  statistics — how its agent finds them (core → neighbours), agrees doors, and how a family of elements shares one design skill for their
  working pages (take the approved design of another element: tokens + DESIGN.md + skill).
- 717-5 **Skills of the custom template:** add what the table shows missing (with its line in the skills index), remove what an element
  never needs.
- 717-6 **Test on a fresh custom element, two planes:** a cold agent with no hints builds a page in an approved design and answers «you need
  images — how do you get them»; guards and eyes. Release the custom template. The price named first (a new element is a server; sessions
  run on the subscription — check its weekly limit: 99 % at 12:24, reset 2026-11-13 11:00).
- 717-7 **The native template** with the same changes; release.

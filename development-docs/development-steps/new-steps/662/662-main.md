# 662 — the landings grow up: menus, the working tools, questions, the builder and its bot, root's carousel (plan)

## 1. The owner, 2026-11-06 (verbatim, abridged only by «…»)
«во всех разделах верхнего меню, включая ядро, корень нативные и кастомные стартеры а также существующие элементы верхнее меню должно
существовать всегда причём оно всегда должно создаваться автоматически …»; «В страницы авторизация отсутствует два важных параметра: не
описаны встроенная гостевая авторизация, и … предустановлено два провайдера: Гугл и resend, достаточно просто внести Credentials»;
«страница дизайна … реальный проект который для авторизованного пользователя предоставляет инструменты настройки … должен быть третий
секцией на landing … не только одну кнопку но и описание зачем это делать и кто может это сделать»; «Страница блоки вообще не сделаны …
нужно только стандартизировать первый раздел … сохранить идею … какие форматы из секции блоки можно было бы перенести в секцию дизайн»;
«На все лендинги добавь секцию вопрос ответ»; «на landing Pro данные … нужны схемы или не нужны как они создаются и используются»; «На
всех блоках про память … подготовлена … резервное копирование данных по расписанию или вручную»; «на всех элементах … раздел о том что
каждый элемент идёт в комплекте с своим строителем Claude Code Agent и Telegram бот … красивый дизайн но в стиле landing»; «лендинг
embending не очень явно объясняет что этот процесс работы прямо на вашем компьютере … блок сравнение с … модели OpenAI»; «граф: … что
является сердцем lightRAG чем он известен и почему … диаграмму как происходит поиск по графу»; «… нажимаю на кнопку платежи Stripe … попадаю
в страница архитектора»; «страница CONFIG … третья сверху секция которая отправляет человека в режим настройки конфигуратора»; «руут: …
карусель с кнопками прокрутки влево и вправо … каждые 3 секунды … при нажатии на какую-либо карточку проигрывание приостанавливается пока
пользователю удерживает эту карточку»; «Разрабатываю новый шаг по оптимизации спланировать всю работу».

## 2. Substeps

| # | Substep | What | Repositories |
|---|---|---|---|
| 1 | 662-1 the top menu | Measure first how the top menu is built in the core, root, both templates and each element; make it always present and built from the registry (a new element appears by itself). The «Платежи Stripe» item that opens the architect page — find the cause, fix (likely the same path as the drawer's 307, or Stripe being off). | core, templates, every element |
| 2 | 662-2 the shared sections of the landing widget | Three new views in the landing widget (the template part every landing shares): `faq` (questions and answers, block-faq look), `builder` (each element comes with its own Claude Code agent and Telegram bot — build it from the phone with the fewest tokens; a designed section near the end), `tool` (the third section: the working tool behind the page — why, who may, the button into it). Into every landing: a `faq` and a `builder` section; into the stores (data, storage, vectors, graph, memory, embeddings, cache): the line «ready for backups by schedule or by hand through the element's programmer agent». | every landing element, both templates |
| 3 | 662-3 the words of each element | auth: built-in guest sign-in; Google and Resend preinstalled, only credentials to add. data: FAQ on schemas — needed or not, how they are made (`/db/migrate` at the element's start) and used. embeddings: «on your computer» on the first screen, a comparison table with an OpenAI embedding model (sourced from OpenAI's own pages). graph: the heart of LightRAG (entities and relations extracted into a graph, dual-level retrieval), what it is known for (the paper, its sources), and a diagram of a search through the graph. design: the `tool` section «Open the design settings of this project» (why, who — the architect after sign-in) and the strongest formats of the Blocks page brought over. CONFIG: the `tool` section into the configurator. blocks: its first section standardized after the sample, the idea kept. | auth, data, embeddings, graph, design, config, blocks |
| 4 | 662-4 root's carousel | The six cards in a carousel: arrows left and right, autoplay every 3 s while nobody touches it (the story under it follows the current card), paused while a card is held. | root (and the custom template's widget if it carries the cards — measured first) |

## 3. How it is proven
Lab (`next dev`, en and ru, light, dark, 390) per landing: the new sections present, console 0, no overflow, `check-data-langs`; the menu on
every element lists every element of the registry (a new draft element appears — negative control: before the change it does not); on the
owner's node after one delivery (`proof-660.sh` extended: sections `faq`, `builder`, the top menu's items; Stripe's item opens its landing);
root: autoplay moves a card in 3 s, holding a card stops it (Playwright with a timer).

## 4. Order and delivery
662-1 → 662-2 → 662-3 → 662-4, released together per repository where they meet (one patch each), one «Sync fork», one `node:update`.
Every claim checked against the element's README and code; foreign facts (OpenAI, LightRAG) from their primary sources.

# 715 — the Design tab rebuilt to the owner's own scheme: skills → brief (optional) → generate and compare → approve

The owner 2026-11-10 09:16 and 09:35 (Telegram, pasted into the terminal), verbatim excerpts:
- «верхнее меню которое состоит из пяти кнопок … верхний ряд это название кнопки нижний статус. Статус нужно скрыть и показывает только
  при наведении на кнопку чтобы он всплывал сверху. Само верхнее меню должно быть липким и никогда не уходить за верхний край экрана.»
- «В описании … какой-то чокнутый маркетинговый текст … нужно … написать именно о той процедуре что архитектура позволяет выбрать из
  множества навыков дизайна те которые подходят вашему проекту и протестировать их чтобы выбрать лучший. При этом все страницы которые
  попали в тест можно просматривать по очереди чтобы оценить все плюсы и минусы каждого варианта дизайна.»
- «почему у тебя нету возможности загрузить скриншоты например из Pinterest … объектная хранилище … может хранить референсы»
- «мы ставим целью возможность создания проекта прямо из Telegram в том числе и дизайна поэтому существующие навыки должны позволить
  пройти все процедуры настройки полностью или частично … прямо через Telegram.»
- «нужно прямо написать что Fractera на текущий момент имеет в своем хранилище икс навыков созданных сторонними разработчиками. На этой
  странице из всех этих навыков вы выбирайте тех которые готовы отправить в тестирование чтобы в будущем победителя оставить в этом
  проекте» · «в проекте … назвать навыки которые вы сохранили для тестирования в этом проекте … кнопок на тесте и на тест это полное
  тарабарщина … обязательно поставить иконку на страницу где человек сможет всё это увидеть своими глазами.»
- «сравните и закрепите … как здесь мы сравниваем … логично было бы чтобы вверху была карусель из тех дизайнов которые мы уже создали и
  нажимаю на эту карусель внизу появлялась бы та самая большая картинка … создай второй дизайн чтобы можно было пройти весь путь»
- «пробы … какого хрена эта страница вообще существует … полностью переработать страницу … удалить с нуля и переработать»
- 09:35, the scheme: «Шаг один: рассказать о том что у нас есть библиотека навыков от разных поставщиков … в каждом навыке сделать ссылку
  на репозитории GitHub» · «Бриф в принципе шаг не обязательно можно его пропустить можно настроить» · «сгенерировать и сравнить — на
  этой странице карусель, в которой до момента генерации в карточке просто написан название выбранного навыка и красная плашка не
  сгенерировано … сгенерированы … зелёную плашку … нажатие … возвращает вниз большую картинку под картинкой: закрытые аккордеон: изменить
  референс … добавьте скриншот или ссылку … зачем это нужно иногда пользователю нравится ресурс, но с помощью какого навыка его повторить
  непонятно … (это также разместить в верхнем раскрывающемся описании) … кнопку генерация тестовой главный страницы. Ссылка с текстом
  когда генерация будет закончена вы сможете увидеть всю страницу по этой ссылке. Второе аккордеон называется тонкая настройка … Утвердить
  этот дизайн для элемента (название элемента). Снизу подпись после того как вы закрепите этот дизайн вам нужно будет для всех важных
  страниц повтори генерацию, поочерёдно указывая вашему агенту Claude Code Agent какая страница должна появиться в нужном дизайне.»
  «Вот задание как переделать» — the plan is approved by the task itself.

- 715-1 Core door: the library — the checked catalog's «Design & UI» section listed by stars (the count said in words), the base's design
  skills and the person's collection, each with its GitHub repository; a saved skill IS a test candidate (`generate` no longer needs a
  separate «To the test»); the element is built by the core when its agent reports done after a generation (run kind `build`), so the
  page link works without a «Build» button.
- 715-2 The tab: three steps «1 Навыки · 2 Бриф (по желанию) · 3 Сгенерировать и сравнить», a sticky track with each step's state in a
  tooltip on hover; the lead and «Как здесь устроен дизайн» in plain words (what you do, what you get, why to repeat with another
  reference or skill).
- 715-3 Step 1: the library with GitHub links and «Выбрать для теста»; the saved list «Навыки, которые вы сохранили для тестирования в
  этом проекте» with its state in words and an eye icon to the page where it is seen.
- 715-4 Step 3: a carousel (a card per test page and per saved skill without one: red «не сгенерировано», amber «строится», green
  «сгенерировано»), the big picture of the chosen one (click → the whole page), closed accordions «Изменить референс» (why, link,
  screenshot upload or paste into the node's object storage, «Сгенерировать тестовую главную страницу», the link line) and «Тонкая
  настройка» (works on the approved design), «Утвердить этот дизайн для элемента «<name>»» with the caption. The trials and pin steps and
  «Собрать элемент» are gone; the brief loses its second references field.
- 715-5 Telegram: a core command `npm run design` (library, choose, reference from a file or a link, generate, state, shots, approve) and
  the main agent's skill so the whole flow — or any part — runs from the architect's Telegram.
- 715-6 Delivery; a second design on the stand qfx9w through the new command (the owner: «создай второй дизайн»), eyes 1440 and 390,
  the critic, the report.

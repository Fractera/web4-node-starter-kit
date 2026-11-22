# 841 — the element's Mini App shows the node's native elements and searches for a capability through the agents

## The owner, Telegram 963 (2026-11-22 20:43 UTC, verbatim gist)

«Я бы также хотел видеть вкладку нативной элементы внутри кастомного элемента так как это реализовано у тебя то есть показываем например два
и пишем ещё. Разумно также было бы реализовать поиск … вкладку поиск поможем нарисовать таким образом чтобы он с одной стороны напоминал Инпут
а с другой стороны нажатие на поиск закроют приложение откроет чат которому будет подставлен вопрос: пользователь хотел бы найти элемент который
делает:… если он задаёт вопрос например как мне автоматизировать ведение LinkedIn будет предложен элемент указан путь до него и Дана подсказка …
если пользуетесь спросит есть ли у нас элемент который создаёт музыкальные клипы то тут уже поиск будет идти нормативным элементам и если не
будет найден нативный элемент то будет произведён поиск по архитектуре Fractera … и предложит купить готовое решение или лагрикс когда он
появится, или как минимум изучит имеющийся навыки и собственную память чтобы сформировать целостный ответ.»

## How it works (my decision, told 964)

- A group «Встроенные элементы» on the home screen: two cards and «Ещё · N» (the Pult's pattern); cards only — name, what it does — from a core
  door answering an element's key with the NATIVE elements (standard on every node: nothing of the node's own composition leaks).
- A search field at the top of the home screen. Telegram cannot prefill the chat (core.telegram.org/bots/webapps), so the words are typed IN
  the Mini App: «Найти» → the element's door gives the question to its own agent as the person's message (the same door as a first task),
  the bot writes «🔎 Ищу: …» into the chat, the Mini App closes; the answer comes in the chat.
- The agent answers inside its field itself (a route of its own: «Проекты › … › LinkedIn» + how); outside its field — `npm run need` to the
  core's main agent, which climbs the ladder of CLAUDE.md §4: brothers by their cards (`find`, `card`) → native elements → Fractera's graph →
  Lagrix (both simulated today, said so) → skills (`skills_find`) and memory; the answer comes back to the element's agent and to the person
  with the element, its path and a hint — or the price to buy or build.
- Its own release after 840 (template + one core door): a search field without the agents' road behind it would be a dead input.

# 754 — The README says what a node and an element are, that a node moves to a server, and how updates and rollbacks work (queued)

## The owner, verbatim (2026-11-15, read at 17:37 UTC, during 753)
«Обратил внимание что файл репозитории readme до сих пор не описывает возможность любой момент переехать из локальной машины на сервер
сохранив все данные. Домена субдомены и сертификаты управляются автоматически.
Также можно сказать о том что работа над ядром Fractera и дополнительными элементами продолжаются и и чтобы получить обновление
пользователю достаточно нажать кнопку в информационном баннере а если что-то пойдёт не так или обновление не понравится накладке
развёртывания всегда можно откатиться к любой из предыдущих версий для ядра или любого другого элемента даже где-то выше верху нужно
написать в данном проекте под узлом поднимается бла-бла-бла а по элементам понимается микро service работающие на отдельную порту
бла-бла-бла»

## Reading (to be checked against the code before a word is written)
- Near the top: what this project means by a node (a computer or a server with the core and its elements) and by an element (an
  autonomous microservice — a server with its own folder, repository, port, process, agent and address).
- A section: the node can go from this computer to the person's own server at any moment with all its data; domains, subdomains and
  certificates are handled by the node.
- A section: Fractera keeps developing the core and the elements; an update is one button in the information banner; on the
  deployments tab the core or any element can be rolled back to any earlier version.
- English, through `humanizer`; his Russian words are translated, never pasted (the README rule of 747).
- Facts first: what «with all its data» carries today (skill `dedicated-server`: a server is launched from the fork), what the update
  banner does, and whether the deployments tab rolls back the core and every element — each claim from the code, or said to him.

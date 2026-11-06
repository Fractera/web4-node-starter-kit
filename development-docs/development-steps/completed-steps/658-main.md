# 658 — six ways to use a node: the content factory and own agents beside the four (closed)

**The owner, 2026-11-05 16:40 UTC, verbatim («one more for next after finish base»; at its end «Переноси в план»): «Сейчас у нас на
странице рут мы описываем четыре фичи которые может выполнять проект можем добавить пятую Fitch и сделать в два ряда карточки для выбора
и пятое Fitch заключается в том что мы можем сделать контент завода давай я тебе попробую объяснить чтобы ты конкретно меня мог добавить
необходимые навыки и описание также создать тексты вот в чем идея обычно пользователи используют чистый Claude.ai для того чтобы везти
свои социальные сети, публиковать посты в блогах, на досках и на форумах в целом нативно этот инструмент справляется не так уж плохо но
можно достигнуть раза до больших результатов если таким образом использовать Fractera для каждого канала создать отдельный элемент но
кроме этого создать ещё один элемент например портреты авторов в которых оцифровать наиболее популярных авторов сн их портрет может быть
немножко изменить под собственный продукт. И теперь получается что можно автоматизировать создание публикации контента в различные
соцсети голосами разных авторов. Но и это ещё не всё ведь можно собирать обратную статистику и анализировать её для того чтобы
попытаться понять каким именно образом на каждой площадке нужно ввести активность чтобы получать все более эффективной результаты от
каждой своей работы: публикации поста текста изображения видео анимации и так далее. Но и это ещё не всё можно автоматизировать разведку
и отслеживание популярных соцсетей каналов Telegram, YouTube и новостных порталов чтобы максимально быстро перехватывать самые горячие
темы и первым реагировать на них созданием публикаций в тренде. Это ещё одна опция нашего проекта которая позволяет его использовать в
этом направлении. Я хочу чтобы ты переосмыслил это и подумал куда и как мы должны добавить это описание я тебе подскажу что ты должен
перечитать главную инструкция, но также описание есть где-то на более глубинных уровнях возможно это душа и что-то ещё и посмотри навыки
которые создают главный агент. Чтобы обеспечить эту работу. Есть ещё одно максимально простое но тем не менее может быть кому-то
интересное решение это повышение собственной эффективности и получается что это будет шестое вариант использования здесь речь идёт о
том чтобы создать себе своих собственных агентов которые будут помогать тебе в достижения необходимых в тебе качеств. Можно создать
себе агента тренера, можно создать агента диетолога можно создать себе агента экономиста, агента инвестора, можно сделать агенты
которые будет хранить самые важные события связанные с периодами времени какие как например подачи налоговой декларации, прохождение
технического обслуживания на автомобиле и прочих. Сила этого решения основана на глубокой памяти, объектом хранилище и прочих других
инструментов. Достаточно взять Telegram и сказать что тебе нужно один сам исследует лучшее решение в этой области продолжить тебе на
согласование создаст интерфейс для интерактивного взаимодействия или продолжить работать через Telegram зависимости от долга. И это
обновление тоже нужно сделать. […the paste repeats its last two sentences once more…] Также нужно будет посмотреть вreadme.md потому
что нужно понимать описаны ли там все эти шесть кейсов использования или ещё нет. Переноси в план». Routed by his word in the window
(16:46 UTC): «Отдельный шаг 658 (Рекомендую)»; the order of the base: «4+5, затем 6 и 7 (Рекомендую)» — 658 is built after 654 closes.** The plan — «Да, душа без строки (Рекомендую)» (2026-11-05 ~17:45 UTC, the window): the soul stays without a line of its own.

**What the step gave.** The node names six ways to use it in one list — `CLAUDE.md` §1 — and its two faces follow it: root's first screen
(six cards in two rows) and the core README («Six things people build with it»). The two new ways have the main agent's skills: the
content factory (`content-factory`: a channel element per platform, author portraits, publications in their voices, the numbers read back,
a scout of hot topics; every publication after the person's yes, official APIs only) and own agents (`own-agents`: a coach, a dietitian, an
economist, an investor, a keeper of life's dates; the lightest shape first — a date is a reminder of the deep memory, a field with data an
element with its own bot). `CLAUDE.md` names `socials-ai` truly: it proposes social profile links, it posts nothing.

| Substep | Commits (tag) | Summary |
|---|---|---|
| 658-1 the content factory | core `4878f154` | `658-1.md` |
| 658-2 own agents | core `4878f154` | `658-2.md` |
| 658-3 root's six cards | root `65e6186` v3.0.25; the pin in `4878f154` | `658-3.md` |
| 658-4 the README | core `4878f154` | `658-4.md` |

The plan `1e62c327`, the state `a250897d`; CI three-os green: root 42129214604, core 42129298411. One delivery with 654-7: the owner's
«Sync fork» («sync was complited», 2026-11-06), `npm run node:update` → `===NODE_UPDATE_DONE=== 5 изменений форка, ядро d9d48e05`.

**Proven** (in the substeps): root's six cards on the owner's node in en and ru, light, dark and 390, the chosen card's chip and story; the
README as GitHub serves it; the guards with their negative controls (an unsealed word of `CLAUDE.md`, each new skill moved away); the main
agent's live answers on a bench of the node's own files — the content card → `content-factory`, the own-agents card → `own-agents`, a tax
declaration → a reminder of the deep memory and no element, a dietitian → an element with its own bot, and the two negative controls (the
integrator card and «жена и сын») → `integrator`. The cost of the proof session: seven runs of Opus on the subscription, about $1.67 by
Claude Code's own count.

**Found on the way:** no guard compared root's card lists across languages (658-3's negative control did not fail) → step 659, by the
owner's «fix it».

**Not in it:** a publishing tool of the node; an element of the content factory or an own agent born for real (that is the person's
order); the guard over `_data/<lang>.json` (659).

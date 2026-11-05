# 658 — six ways to use a node: the content factory and own agents beside the four (plan, approved 2026-11-05; built after 654)

## 1. Retelling and decisions

The owner, 2026-11-05 16:40 UTC, verbatim («one more for next after finish base»; at its end «Переноси в план»): «Сейчас у нас на
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
(16:46 UTC): «Отдельный шаг 658 (Рекомендую)»; the order of the base: «4+5, затем 6 и 7 (Рекомендую)» — 658 is built after 654 closes.

**Retold:** the node's front door names four ways to use it; two more are real and missing. (5) **A content factory:** an element per
channel (social networks, blogs, boards, forums), an element of author portraits (the most popular authors digitised and adapted to the
person's product), publications in different authors' voices, the numbers of every publication read back to learn what works on each
platform, and a scout of social networks, Telegram channels, YouTube and news portals that catches a hot topic first. (6) **Own agents
for one's own effectiveness:** a coach, a dietitian, an economist, an investor, a keeper of life's dates (a tax declaration, a car's
service) — the person says what they need in Telegram, the agent researches the best way, proposes it, and then works in Telegram or on
a page of its own, on the deep memory, the object storage and the other tools. Where it goes: the root page (two new cards, two rows),
the main instruction, the soul and the deeper descriptions, the README — and the main agent's skills that make the work happen.

**Measured (2026-11-05, read only):**
- root v3.0.22, the home: four cards `swarm`, `fullstack`, `factory`, `integrator` (`app/[lang]/(publicLayer)/_data/en.json`, `ru.json` →
  `rootHome.cards`); the grid `sm:grid-cols-2 lg:grid-cols-4` and the icons `CARD_ICONS` in `widget-static-root-home/root-prompt.client.tsx`
  (239 lines of the 250 allowed); root's README says «three compact cards» (stale since 649), the widget README «four».
- The core's README, «Three things people build with it»: full-stack, the app factory, the Web4 swarm — **the integrator (649) is not
  there**; the swarm item says «a coach or a nutritionist for yourself», which is case 6.
- `CLAUDE.md` §1 «Why a node is built» — four (a Web4 node, the integrator, a high-load Web2 site, the app factory); §4 the integrator's
  scenario line; §8 the pointers to skills. **§3 calls the tool `socials-ai` «social posts by AI» — the tool proposes social PROFILE
  LINKS from a phrase (`_tools/TOOLS.json`); no tool of the node posts.**
- `lib/agent-kit/soul.md`: «The creator's dream» is the integrator; «A thousand hands» names «an author's style inside the content
  creator» as a route. The four ways are not listed in the soul.
- Skills: `integrator` (649 — the pattern of a skill for a way of use: why, the order, what to propose, the laws); `shape-the-need` holds
  pieces of case 5 (an author's style as a route of a «content creator» element, one element per social network) and a hint of case 6
  («becoming a trainer or a dietitian» — for earning, not for oneself); no numbers loop, no scout, no «agents for yourself».
- The core's project types (`config/project-types.ts`, 22 directions with `media` and `ai-coach`) are kinds of a product, not the node's
  purposes — not touched.

**Decisions:**
- **D1 (mine):** the six ways live in ONE list — `CLAUDE.md` §1 — and the two faces follow it: the root cards (the person's first screen)
  and the README (GitHub). Each new way gets its own skill of the main agent, as the integrator did in 649: the instruction names it in
  one line, the skill carries the order.
- **D2 (mine, the owner may choose otherwise in the window):** the soul gets no new section: it holds the missions and the character,
  a copy of §1 there would drift, and «A thousand hands» already shows the content creator's route.
- **D3 (mine):** the swarm card and the README's swarm item give «a coach or a nutritionist for yourself» to case 6; the swarm keeps the
  earning side (a driver, a cook) and Lagrix.
- **D4 (mine):** the content factory publishes and watches only through each platform's official API or public feed, with the person's
  own accounts; every publication, every posting rhythm and every round of the scout starts after the person's yes, with the price of
  a resident process named. The skill says plainly that no tool of the node posts today: each channel's element builds its own
  publishing on its platform's API.
- **D5 (mine):** own agents take the lightest shape that holds the need: a date to remember is a reminder of the deep memory (`npm run
  remember -- … --remind-at`, steps 636 and 656), not an element; a field with data and a rhythm (meals, training, a budget, a portfolio,
  a car's service book) is an element with its own bot; a page only when the work needs a view. A dietitian, an economist or an investor
  agent is not a doctor or a licensed adviser — the agent says so, and decisions of health and money stay the person's.
- **D6 (mine):** §3's tool line is corrected («social profile links from a phrase») in the same seal as the content factory's lines — a
  factory must not be planned on a tool that does not post.
- **D7 (mine):** the card ids `content` and `personal`, icons `Megaphone` and `Target` (lucide, already a dependency of root); the grid
  three from `lg` (two rows of three), two from `sm`, one on a phone.

I assume that «after finish base» means after step 654 closes (654-4 … 654-7), and that «добавить необходимые навыки» means the main
agent's skills in the core, as in 649 — not the element instruction (a line there costs every session of every element).

## 2. What is reused (paths that open)

- root: `app/[lang]/(publicLayer)/_data/en.json`, `ru.json` (`rootHome.cards`, type `RootHomeCard { id, title, text, task, more }` in
  `widget-static-root-home/words.ts`), `root-prompt.client.tsx` (`CARD_ICONS`, the grid), `widget-static-root-home/README.md`,
  `markdown.ts` (the machine copy maps every card by itself), root `README.md`; the path of 649 (`5171bc0`, v3.0.21): the clone →
  prebuild, `tsc`, `next build` → tag → pin → `node:update`.
- A card's task reaches the main agent: root `app/api/first-task/route.ts` → the core's `/api/node/first-task`.
- The core: `CLAUDE.md` §1, §3, §4, §8 and `npm run check:instruction -- --seal` (`lib/main-agent/instruction.seal`); guards
  `check-instruction`, `check-instruction-skills`, `check-skill-headers`; skills `.claude/skills/integrator/SKILL.md` (the pattern),
  `shape-the-need`, `create-element`, `route-to-element` (i2i between the channel elements and the portraits), `study-for-element` (an
  author or an analog studied), `use-deep-memory`, `core-schedule`, `provider-rules`; the tool `skills_find` (the catalog of community
  skills — social posting and analytics skills are looked for there first).
- The stores of 654 — the element's own tables, files, vectors and graph space — keep a channel's numbers and an own agent's data; the
  deep memory's reminder at a time and its calendar (636, 656) keep life's dates.
- The core's `README.md`, section «Three things people build with it».
- Eyes: `~/fractera-dev/_tools/page-shot.cjs`, `overflow.cjs`, `dark-shot.cjs` (`PW_PATH=<core>/node_modules/playwright`).

## 3. Known limits (what must not break, and what breaks if it does)

- `CLAUDE.md` §8: sections 1–8 change only by the owner's word and are resealed; no tombstones. The yes to this plan is that word for
  the lines named in 658-1 and 658-2 — any other line of the instruction stays.
- §6 «Published texts go through `humanizer`», «texts only through translations» (`check:i18n`, en and ru), «an indexed page never says
  «not working yet»»: the cards say what the node builds with its agents, as the four do.
- §6 «Behaviour nobody ordered is never built», «a new resident process — with its price in memory»: a posting rhythm and the scout's
  rounds are clocks — the skill puts them after the person's yes, with their price.
- §6 «A request against a provider's rules…», «A claim about a foreign service — only from the primary source», «Site rules … the agent
  only reads»: the scout and the channels go through official APIs and feeds; a platform's rules (automation, spam, limits) are read on
  its own pages, never told from memory.
- The law of skill `integrator`: «Nothing is offered as working that the node cannot do today» — the skills say what is built and how.
- root: a component up to 250 lines — `root-prompt.client.tsx` has 239; the change edits lines and adds none of size. The home is
  prerendered (`check:static`), the cards stay an island.
- The element instruction is not touched (649's reason).

## 4. Observable results

- The root home on the owner's node: six cards — two rows of three on a wide screen, two per row from `sm`, one on a phone; «Создать
  контент-завод» and «Создать своих агентов» with their stories; a chosen card puts its task above the field.
- The main agent, given either new card's task, answers in the shape of its skill (the channels, the portraits, the numbers and the
  scout — or the lightest shape of the person's own agent) and asks one question; given the integrator's task it still takes
  `integrator`.
- `CLAUDE.md` §1 names six ways; §3 names `socials-ai` for what it does.
- The README: «Six things people build with it», the integrator among them.

## 5–6. Substeps, order, address

| # | Substep | Repository (`main`) |
|---|---|---|
| 1 | `658-1.md` — the content factory: the main agent's skill, the instruction's lines, the tool's true word | core |
| 2 | `658-2.md` — own agents: the main agent's skill, the instruction's lines | core |
| 3 | `658-3.md` — the root page: six cards in two rows | root (the next tag after 654-6's), the core's pin |
| 4 | `658-4.md` — the core's README: six things people build | core |

**Order and delivery.** After 654 closes. The skills come before the cards: a card sends its task to the main agent, which must already
know the way. 658-1 … 658-4 are delivered in one `node:update` (the core's commits and root's pin together), then the proofs on the
owner's node.

## 7. Substep files

`658-1.md` … `658-4.md` in this folder: what is built, done when, how proven (two planes named in advance, one with a negative control),
what it rests on, what is not in it.

## 8. Acceptance of this plan

Every substep has its file; each result can be shown; two planes per substep, one with a negative control; the repositories are named;
the limits name what breaks. **Not in the step:** building any channel, portraits, scout or own-agent element (the person's own build,
after their yes); a posting tool in the core; the core's panel glossary (no page uses the new words yet); the project types; the custom
template; the element instruction; Lagrix pages.

## 9. The owner's approval

2026-11-05 ~17:45 UTC, in the choice window (the plan of four substeps, the decisions D1–D7, what is not in it), verbatim: «Да, душа
без строки (Рекомендую)» — the plan as written, D2 as written (the soul gets no line). Built after 654 closes (his order «4+5, затем 6 и
7 (Рекомендую)»).

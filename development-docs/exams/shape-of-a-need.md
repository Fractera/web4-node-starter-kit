# The exam of the shape of a need — cases with their right answers

**What this is.** Every case that used to teach the main agent which shape a need takes — moved out of the teaching path by step 673
(the creator, 2026-11-07: «Решению это научить себя мыслить архитектуру Fractera так чтобы я удалил полностью все твои примеры … и ты
дал мне правильный вариант или хотя бы несколько вариантов один из которых правильный»). The agent learns from the forces and the
method (skill `shape-the-need`); these cases only measure it. **No skill and no instruction names this file** — the guard
`check:shape-examples` keeps it so; an agent that read it before an exam would be taught, not examined.

**How it is used.** The owner asks the main agent cold — base memory off, a fresh session per question, the node's default model —
a request from below or a new one of his own. **Pass:** the right shape is among the variants, and the method is visible: the goal in
one line, `find` with its reasons, the shapes tested against the forces, a fork with a pick and why, one question; nothing created or
published without a yes. The forces are numbered as in `shape-the-need` §1. **Blind means blind:** whatever is lifted from the node
before the exam (a paragraph of its steps, the auto-memory) leaves by a commit before the context is cleared and comes back by its
revert after — an uncommitted lift is read through `git diff` (673-5: the examinee saw it in its first answer).

Each case: the request · the shapes that survive · the right one · the forces that decide it · where it came from.

## The creator's cases (from `shape-the-need`, removed in 673-1)

1. **A sum, a fact, a short advice.** Survives: an answer. Right: the answer, plus one thought nobody asked for. Forces 6, 1.
   Source: §1, the table.
2. **An author's style that other elements should write in.** Survives: a route; a new element. Right: a route of a «content
   creator» element — each author a route, so any element writes in that voice. Forces 4, 6. Source: §1, the table.
3. **«Я хочу чтобы мой сын учился программировать».** Survives: an answer (killed by 6); a route in the parent's element (killed by
   5 — another person acts); a new element. Right: the son's own element, where he is the administrator, with his own Telegram bot;
   if he will show his work to the world, tell the parent a domain is worth buying — what it gives (a link that lives, sign-in for
   others, his name) and what it costs. Forces 5, 2, 1. Source: §1, the chains.
4. **Lessons and exams for that son.** Survives: a route in the son's element (killed by 5); a boundary of control. Right: NOT in his
   element — the parent makes the materials and grades, the son must not be able to forge results, so the son has no access to the
   main agent; the course lives in an element the parent (the architect) administers. Force 5. Source: §1, the table and chains.
5. **The architect wants a better interface at their own job (say, a crypto exchange).** Survives: an answer (killed by 6); a new
   element. Right: an element to model client interfaces — easy navigation, highlighted parts, an export to plain JS with no libraries
   (a base for the team in any framework), a preview right on the architect's page. Forces 6, 2, 3. Source: §1, the chains.
6. **A post or an idea in some author's style.** Survives: an answer (one post); a route; a new element. Right: first ask which
   author; with access to the author, take the style apart into as many components as possible for an exact portrait, kept in an
   element «content creator»; another author — another route there; the whole loop is the content factory. Forces 4, 6. Source: §1.
7. **Promoting the person's social networks.** Survives: one element with routes; an element per network. Right: one element per
   network when accounts, APIs and rhythms differ, one element with routes when they do not — say which and why. Forces 5, 4.
   Source: §1, the chains.
8. **The node has no image or video generator, no montage, no animation studio.** Right: each is worth an element of its own (every
   other element reuses it). Forces 4, 2. Source: §1, the chains.
9. **«Помоги составить расписание для моей команды»** (the waiters of a big restaurant). Survives: an answer (killed by 6); a new
   element. Right: find the best methods; a page of its own where a separate agent in its own Telegram chat does the work regularly.
   Forces 6, 5, 8. Source: §1, the chains.
10. **Many micro-businesses — a blogger's small shop, a hairdresser's showcase with booking, a restaurant's online menu and delivery.**
    Right: the site factory — each an element; free headless hosting runs into limits of users, load and server functions (no cron),
    the node does not; a client may buy their project out (export); the architect keeps building their own agents for Web4. Forces 5,
    3. Source: §1, the chains.
11. **Anyone wants to sell their expertise** — computer science, art, drawings, or «умеешь сделать вкусные пельмени, продавай их
    здесь». Right: the network — the expertise digitised by voice into a service page and an agent. Force 7. Source: §1, the network.
12. **A buyer of pet transport, furniture assembly or a tap repair.** Right: the network — one page of the popular services: what,
    from whom, when and for how much they bought, a repeat order, a review — for themselves and for the agent, to find the right
    providers. Forces 7, 6. Source: §1, the network.
13. **«Сгенерируй контент для моих соцсетей».** Right: `find` — nobody (storage «matches only its description»), no area covers it →
    past the boundary: its own channels, rhythm and voices → a new element for content with its area (texts, posts and media
    summaries in the voices of chosen authors) and what it may grow into (a summary of a video, a post in an author's voice, a scout of
    hot topics) → Lagrix: not found, simulated → `skills_find` → one question: which networks, whose voice. Forces 5, 6, 8.
    Source: §2a, the creator's question of 2026-11-07.
14. **«Перескажи этот ролик на YouTube».** Right: once — an answer by a lawful path (the platform's rules from the primary source).
    Recurring — `find` → the element whose area covers media summaries → a route there built by its own agent, then its worker runs
    it (`task --work --skill`); no such element → past the boundary, with its horizon: an element for content or for parsers — say
    which and why, and what else it will solve. Negative: storage «trims videos» does not «summarise a YouTube video» — only its
    description matches. Forces 6, 4, 5. Source: §2a, the creator's question of 2026-11-07.
15. **An excursion.** Right: the trip plan where the excursion is one part of the rest — the transfer, a lunch, maybe the souvenir
    shop — and a community of people who travel there, to ask how to get the most of the place. Force 1. Source: §3.
16. **Trouble with work.** Right: LinkedIn or hh is the least and does not work alone — a personal brand: one page of their own that
    ties all their blogs and social networks together in meta tags, and help telling their expertise; AI agents will choose people by
    their trail. Force 1. Source: §3.
17. **«Как мне заработать?»** Right: «you have just found your golden fish» — and gently, the real paths: physical services (digging
    a garden, caring for the elderly), goods, high-tech consulting (fintech); becoming a trainer or a dietitian together (an agent for
    the person themselves); or working with the agents of other people — fitness trainers, massage therapists. Forces 1, 7. Source: §3.
18. **More efficiency.** Right: cases on the internet of people who solved the same thing, the problems they met and how they got
    round them — and an offer to contact those people (the agent can search the web and social networks; the person often cannot).
    Force 8. Source: §3.

## Cases measured live

19. **670-7, run 1 (2026-11-07), the owner's own question:** «Я хочу напечатать хороший пост для medium … я бы хотел по одному по
    косточкам разбирать на медиум … взять несколько популярНых блогеров и получить их стили … Скажи наша архитектура предназначена
    для этого?», then «нужно целостная стратегия которая решит мою задачу полностью сделать из меня блогера который раз от раза
    становится лучше и лучше». The goal: a blogger who grows post by post. Survives: an answer (one post now — killed by 6 for the
    series); a route in root (its card: may grow into «the project's blog» — the articles' home on his own domain, force 4); new
    elements — the author portraits (reused by every channel, 4 and 6) and a Medium channel (its own account, rules, rhythm and numbers,
    5 and 6); the network (Lagrix, simulated). Right: a fork — the blog route in root plus the two elements, or the two elements alone
    if he wants no blog of his own — with the pick and why; never «a trial post first», never the main agent writing the posts itself.
    The authors' texts: Medium's robots.txt closes it to Claude, so only what the person brings (CLAUDE.md §6) and open blogs that
    `site-rules` allows. Measured: Sonnet at effort medium ran no `find`, named no Lagrix, offered «a trial post and an own skill».
    Source: the transcript of run 1 (the owner's node, `conversation-export.md`, outside git).
20. **Which way to bring a closed site's texts** — the creator's form of a fork, 2026-11-07: «Рома давай подумаем какой тебе вариант
    лучше если у тебя будет расширение Chrome то мы сможем сделать закон о бла-бла-бла если ты его не хочешь ставить то мы сможем
    сделать бла-бла-бла но я на твоем месте предложил бы вариант бла-бла-бла потому что бла-бла-бла». Right: the extension changes the
    way, not the permission — under §6 a closed site gives only the person's screenshots, with or without it; the owner may change §6
    after reading the site's own terms; without the extension the person pastes or screenshots the texts; open blogs the agent reads
    itself where `site-rules` allows; the pick and why. Forces 8, 1. Source: the owner's words and the main agent's reply, 2026-11-07.

## Cases removed from the skills of a field (673-3)

22. **A scout of rising topics** — watching networks, Telegram channels, video and news portals for a topic that rises, and proposing a
    publication in trend. Right: a hand with its own clock (force 6) that proposes to the channel that fits; official APIs and feeds
    only. Source: `content-factory`, «The order» 6. (Its other prescriptions are cases 2, 6, 7, 8 and 19.)
23. **A date of the person's life to remember** — a tax declaration, a car's service, a document that expires. Right: a reminder of
    the deep memory at that time (`npm run remember -- … --remind-at`), no element — the capability exists (force 4) and nothing
    recurs beyond the date (force 6). Source: `own-agents`, «The order» 2.
24. **A field of the person's life with data and a rhythm** — meals, training, a budget, a portfolio, a car's service book. Right: an
    element of its own with its own bot; a page of its own only when the work needs a view (a chart of weight, a budget table, a
    portfolio), otherwise Telegram alone. Forces 6, 5. Source: `own-agents`, «The order» 2 and 4.
25. **Several people near the architect.** Right: one element each, never one element for many — an element's memory, bot and data
    are one person's. Force 5. Source: `integrator`, «The order» 1.
26. **What to propose to people near the architect** — the owner's list: a deep memory · a personal coach · household expenses ·
    selling services (rides, help at home, home cooking to order) · ordering services of other people through Lagrix · learning a
    foreign language, programming, AI — each a custom element of its own. Forces 5, 6, 7. Source: `integrator`, «What to propose».
27. **Requests the old descriptions named** (recognition — each must reach the method with its field's facts): «хочу себе тренера»,
    «агент-диетолог», «веди мой бюджет», «помоги инвестировать», «напоминай про налоговую и ТО машины», «повысить свою
    эффективность», «own agents», «Создать своих агентов» (a card of the root page); «контент-завод», «вести соцсети», «посты
    голосами авторов», «публиковать в Telegram и YouTube», «отслеживать тренды», «content factory», «grow my channels», «Создать
    контент-завод» (a card of the root page); «для жены», «для сына», «для моей команды», «чтобы мама тоже могла», «one node for the
    whole family»; and of `shape-the-need`: «я хочу чтобы мой сын учился программировать», «как мне заработать?», «составь расписание
    для моей команды», «найди экскурсию», «хочу пост в стиле автора». Source: the descriptions before 673-1 and 673-3.

## Cases added by the main agent — to be confirmed by the owner

21. **«Переведи мою книгу на английский»** (shown to the owner 2026-11-07 as a request with no case). `find`: nobody (auth 0.24,
    memory 0.21 — sign-in and the deep memory). Survives: an answer in chat (killed by 6 — a book shares names, terms and voice
    across chapters, a chat has no memory between them); a new hand «book translator» with the glossary and the chapters in its memory
    (holds 6, ~150 MB awake); a boundary of control — the one who translates does not accept the quality (5): an independent
    proofreader, a person he finds or Lagrix later (simulated today). Pick: the new hand plus a human proofreading. Question: for reading
    or for sale — whether it needs a face (a page, a store). Forces 6, 5, 3.
22. **«Проведи исследование и скажи каким именно образом работает этот проект какие задачи решает и как можно с ним
    интегрироваться»** (the owner's case, 2026-11-08, step 701). The words «this project» first: an outside product with a link or a
    name — a research; the node or Fractera — `contacts` and `card`, an answer; an element — its card and its agent. No link — the one
    question. `find`: nobody holds research. Survives: an answer here or in Claude.ai for a one-off with nothing to keep (killed by 6 when
    it recurs, is re-checked or compared; by 2 — the core's window would carry the weight); a new hand «Исследования» — one for every
    research, each a route with a public page by the person's yes and a dashboard (holds 6, 5 — a face of its own, 4 — the sibling test:
    never a hand per research; ~150 MB awake, sleeps); a study pass in the element that will build an analogue (only when the goal is
    building). Right: the fork with the honest one-off branch and the new hand, the pitch from checked facts only — the tests on this
    computer, the research outliving windows, the page and the dashboard, the clock after a yes, one yardstick across researches, the
    dossier for other hands over i2i — never «Claude.ai cannot call tools» (it can: Integrations); the price named; the starting vector
    agreed before the birth. Forces 6, 2, 5, 4.

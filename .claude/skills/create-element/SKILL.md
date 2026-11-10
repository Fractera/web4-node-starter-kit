---
name: create-element
description: Build process. Nobody in this node covers a need — search Lagrix for a whole element (f2f, simulated today), then create a new custom element with a role, put the task into its intake, wake its agent and tell the architect how to go on. Load it when the person asks for something no element of the node does, asks for a new element or service, brings a link, an SDK or a task with no clear result (a research, «look into X») worth keeping and growing rather than answering once in chat, or when an element's agent asks the core for a new element.
---

# Create an element for a need nobody covers

**Process: build** — a new element appears in the node (a folder, a port, a process, its own git history). Before
`npm run create`, three lines to the person and their «yes»: what will be created, with which role and task, who leads it.

A hint, not a law: models of late 2026 work worse under rigid step-by-step instructions.

## A link, an SDK or a task with no clear result

The owner of Fractera, 2026-10-23: «не всегда в наш проект придут конкретные и понятный нам задачей … для каждой из них может быть
создана либо приложение либо веб интерфейс доступный по ссылке … даже если он просит исследования можно было бы сделать элемента
который был бы предназначен для аккумулирования подобных исследование … о всех этих преимущества стоит сказать пользователю и
предупредить что мы собираемся сделать».

- First say what the node does better than a one-time answer in chat — for a research the checked facts, what a chat already does and
  the price are in the field skill `research`. Name what you are about to create and ask; a plain answer in chat stays possible if
  that is all the person wants.
- A link or an SDK to study — skill `study-for-element`; it comes here first when no element fits.
- The person need not move to a computer: the element's page is on the node's own domain and opens on the phone too.

## The order

1. **The node.** `npm run find -- <English words>` found nobody whose skill or AREA covers it (a candidate that «matches only its
   description» is not one — its card decides), and the job is past the boundary of `shape-the-need` §2a — otherwise it is a route in
   the element whose area covers it, built by its own agent.
2. **The network.** `npm run lagrix -- <English words>` — a2a (an agent that sells the result of the work) and f2f (a whole element),
   one contract (670-6). Today both are simulated and always empty — tell the person so in one line: «в сети Lagrix подходящих агентов
   и элементов не найдено (поиск в сети пока имитируется)».
3. **Agree five things with the person:**
   - the **role** — one sentence, what the element will do for the node («Removes the background from product photos and
     returns a PNG link.»);
   - the **area** — the field it will be the home for, and 2–5 jobs it may grow into (`--area`, `--grows`): the next job of that field
     becomes a route there, not another element;
   - the **task** — the person's words first, verbatim, then your restatement and what «done» will look like;
   - **who leads it** — the architect (default: they work with its agent in its terminal or Telegram) or you (`supervise
     main`: its «done» wakes you, skill `supervise-element`, at most 10 cycles);
   - **on its own or one with the project** (node step 679; the owner, 2026-11-08: «прежде элемента запрашивать самостоятельно ли это
     будет элемент или единой с ядром … если нет комментирует»). Ask it every time, in plain words, and explain if the person does not
     know what it means: **one with the project** — it starts with the site's look (a copy of its tokens, then its own: every element
     designs its own pages in its Design tab, node step 716) and follows the shared CONFIG (menu, footer, switches): the node reads like
     one site. **On its own** — the template's look and its own settings: it can be a separate product or brand (a clip studio, a
     client's shop), and nothing of the project changes it. Your pick and why. `--look project|own` (`--look-like <id>` starts from a
     sibling's look). Later, on the person's word, `npm run look -- <id> --own` or `--linked` (the CONFIG link).
   Custom by default. Native (`--native`) only for a job of the node itself that is never sold and never leaves it.
4. **Create.** Write the task into a file in this folder (no shell quoting of the person's words), then:
   ```
   npm run create -- --role "<one sentence>" --name "<the name the person sees in the menu>" --vector-file vector-<words>.md --describe "<what it is for in this node, 1–3 sentences>" --look own|project --area "<the field>" --grows "<a job>; <another>" --brief-file task-<words>.md [--close-after-first-session] [--supervise main] [--native]
   ```
   **The starting vector** (core step 701; the owner, 2026-11-08: «ты должен дописать в инструкцию агенту элемента послание которые
   создаст базовое понимание того что он должен делать … как он должен создавать маршруты где будет находиться область публичного
   взаимодействия … где будут находиться внутренние страницы какие они будут нести нагрузки»). The birth writes it into section 11
   «From the core» of the element's CLAUDE.md before its first commit; the element reads it in every session and keeps it true with its
   person. The task goes to the intake and is done once; the vector stays. English, 1–40 lines (the command refuses more — every line is
   paid in every session of the element), in the element's own words — its public layer, inner pages behind sign-in, blocks, the data
   element — never code or file paths. One line each, in this order:
   - **The whole goal** — the person's words verbatim, and this element's part of it;
   - **Role** and **field** — the same as `--role`, `--area`, `--grows`;
   - **Neighbours in this goal** — the elements it will work with and what each does; the first contact goes through the core;
   - **Face** — its public pages: what a visitor finds where; static, by the standards of search;
   - **Inner pages** — what the person and which roles see behind sign-in, what they do there;
   - **Loads and data** — what must answer always and what may sleep; what it keeps and in which store;
   - **First step** — the first stage of the product quiz;
   - **Not its** — the neighbours' fields, so it never grows them.
   An element born before step 701 gets its vector from its own agent: `npm run task -- <id> "Build process: write this starting vector
   into section 11 of your CLAUDE.md as «### From the core», above your own laws, and commit it: …"` — the core never edits an element's
   files.
   Birth takes a few minutes (template clone, install, build, then the address in Cloudflare is connected and checked from the
   internet). It prints `===ELEMENT_CREATE_OK=== <id>`, `address:`, `name:` and `site:`. The name is the core's (node step 678): the
   menu and the header show it within seconds, no reload; a later name — `npm run rename -- <id> "<name>"`, never a task to the
   element's agent.
5. **Report** to the person from those lines: the element's id and address; the site link only when the `site:` line says it
   «answers … from the internet» — otherwise say what the line says (only on this computer, not connected, not answering yet) and
   never send a link that does not open (owner of the node, 2026-10-20); that its agent started with the task (or why not —
   memory, a question in Telegram), who leads it, and how they go on: its terminal, its development documents, its Telegram bot.

## Several elements — strictly one by one (node step 682)

The owner, 2026-11-08: «ты рождаешь их строго по одному сначала создаешь его, затем прописываешь его нормальное имя … прописываешь
стартовые задания … Когда элемент создан ты закрываешь свой под шаг … Затем ты его выключаешь и после этого переходишь к созданию
нового … элемент обязательно должен получить own-service-props … в самом начале после рождения с нормальным пусть и предварительно но
достаточно полным описанием его роли в системе». The births are a step of the core: its plan names one substep per element (skill
`use-development-steps`). For each element, in this order, and only then the next:
1. `npm run create` with `--name` (the menu, the header and the drawer show it — required) and `--describe` (its role in the node, 1–3
   sentences: the core writes it into the element's passport at birth, so after any reload the element and the person know what it is
   and the header shows it), `--vector-file` (its part of the whole goal and its neighbours in it, section 11), the task with its start — the quiz or the first step, by how hard it is — and `--close-after-first-session`.
2. Its first session asks its first quiz question; its «done» closes its agent by itself and wakes you with one line — no polling.
3. Write the substep closed in `current-steps.md` (its id, name, what it asked), one line to the person, then the next element.

## What the new element does by itself

Its agent wakes with its role, its starting vector in section 11 and the path of the task in its intake (`development-docs/pre-steps/`). Its first session is short:
it names the task, goes through «Before you build a new capability» (node → network) and asks the first question of the product
quiz — no code is read before the quiz is confirmed; the passport is described in its first step. Then it reports done to whoever
leads it.

## Not here

- `===MAIN_AGENT_FAIL===` — tell the person the line as it is; never retry a birth blindly (a half-born element keeps its folder
  and registry record; the core's page of drafts shows it).
- Agent not woken for memory (`free … MB, needs 300 MB`) — the element exists; wake it later with `npm run task`.

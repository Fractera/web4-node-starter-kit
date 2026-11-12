# Audit 2026-11-12 — root's privileges and the equality of elements

Asked by the owner, 2026-11-12 ~17:05, all work stopped until it is done. His words, verbatim (voice, as typed):

> Даже здесь ты мыслишь неправильно корень это не страница корень это домашняя страница корень это вообще ничего общего это сервер это
> элемент. Ты чудовищно съехал с правильного вектора поэтому я останавливаюсь все работаю на этом месте до тех пор пока ты не проведёшь
> аудит к своей архитектуры и не закрепи шь жесточайшая правило воспринимать все кастомные элементы равными и вообще из всех элементов
> выделять ядро как особую сущность. Элементы разделяется на нативные и кастомные просто по принципу того что нативный может обеспечивать
> работу нескольких кастомных но это только для удобства ушей степени даже они оба смысла принимать их как предустановленные не более. Что
> же касается элемента руут то это не из страницы тебе вообще запрещено где-либо так думать потому что как только ты начнёшь так думать вся
> архитектура посыпется так же как и сейчас. Поэтому кроме прочего нужно запретить себя называть элементы страницами и если автор
> договорился или архитектора договорился это нельзя воспринимать как призыв к действиям на уровне архитектуры нужно жёстко прописать
> элемент это микро service полностью автономный который может содержать себе любую количество страниц выполнять любые из серверной или
> клиентские или комбинированный функции, и даже если он стоит всего из одной страницы это ничего не меняет это всё равно сервер. Исходя из
> этого проверю вообще в чем сейчас корневую элемента отличается от стартового Cast нова шаблона затем возвращайся не мешать как надолго ты
> сломал и когда мы откатим то что ты сломал и перепишем инструкцию и для ядра и для всех элементов а также проверим навыки тогда только
> вернёмся к нашей работе

## The rule (draft for the instructions — sealed only after the owner's yes)

- The core is the only special entity of the node. Every other part is an element.
- An element is a fully autonomous microservice — a server: its own folder, repository, port, process and agent; any number of pages;
  any server, client or combined function. One page or none changes nothing: it is still a server. An element is never called a page,
  «the home page», «the main site» or «the site at the root of the domain».
- All custom elements are equal. Native and custom differ only by convenience: a native element may serve several custom ones; both
  are preinstalled, no more. No element — native or custom — is required by the core's code, copied from by the core, or reserved a
  place (an address, an order in a menu, a power state) by its id.
- A word of the author or the architect about one element («the home page», «one header everywhere») is a wish for that element, never
  an order to change the architecture. Before a sentence or code about an element: «would this hold for every custom element?» — if
  not, it is a privilege; name it, never build on it.

## Findings

### 1. Instructions
- `CLAUDE.md` §3:113 «The required auth, data and root can be replaced but not deleted» — root required (the registry says
  `required: false` since earlier; the instruction contradicts it). All ten native entries are `required: true` in the registry.
- `CLAUDE.md` §3:115 «Root is the project's home page, the AI agent's first screen; today it is custom (step 606 makes it native…)».
- `CLAUDE.md` §4:200 «The first task typed on the root home page goes to you».
- `CLAUDE.md` §3:108 «An element … is a site, an app or a bot» — not «a server»; §1:38 «like a site on a hosting».
- Element instruction `lib/instructions/element/element-instruction.src.md`: line 6 already says «a microservice» (keep); lines 12, 14
  call native elements «the root ones of every node» (a word that meets the element `root`).
- The element instruction has a separate **root variant**: `lib/instructions/element/build.mjs` `TEMPLATES.root` (the element's folder
  `WEB4-ITEMS/user/root` as a template), `TAGS.root`, `variantOf()` returns `root` by the folder name; 6 `@R` lines in the source.

### 2. Skills
- Core: `fractera-vs-anthropic` :52 «root | the main site; its home is the first screen…», :107 «the task window on root's home»;
  `element-power` :21, :75 — root among the elements «never» turned off.
- Templates (custom and native): `.claude/node-knowledge/cloudflare-connection.md`:24 «the main site at the domain»;
  `.claude/node-knowledge/project-origin.md`:22 «the root site».

### 3. The core's code — about 40 places treat the id `root` specially
- **The core depends on root for its own look** (285-3, 2026-09-24): the core's header and footer are a byte copy of root's
  `components/shell/`; `npm run check:shell-kits` fails the CORE's build when they differ («ядро … обязано быть видом сайта»);
  `kits/_shell/install.mjs` copies root's shell into native services; `lib/shell/core-shell-where.ts` takes the shell door and the
  «home» link from root (`app/[lang]/(architectLayer)/layout.tsx`:54); `scripts/serve.mjs` refreshes the core's pages after root
  answers.
- **Birth copies from root:** `scripts/item-birth.mjs`:193-210 — a new element with the project look gets root's `DESIGN-CONFIG` and
  root's copy of the project settings; `scripts/services-install.mjs`:862 and `scripts/sync-site-design.mjs` copy root's design.
- **The domain apex belongs to root by id:** `app/api/domain/activate/route.ts`:119-168, `app/api/node/reach`, `app/api/node/preview-url`,
  `lib/web4-items/dashboard-rows.ts`:78, `scripts/check-addresses.mjs`, `scripts/main-agent-cli.mjs`:125, `scripts/services-install.mjs`:377.
- **Design door defaults to root:** `app/api/architect/design-config/route.ts`:52-97.
- **Menus, dashboard, passport, names:** root first and apart (`main-agent-elements.tsx`, `draft-menu.tsx`, `menu-stamp.ts`,
  `menu-state.cjs` `withRoot`, `dashboard-rows.ts`:199-320, `element-address.ts`, `built-in-elements.ts`), its own name
  (`element-name.ts` `rootSite`), its own eyebrow (`node-passport.client.tsx`:203), `node-passport.ts`:61.
- **Look rules by id:** `scripts/main-agent-cli.mjs`:237-294 («the root site keeps its own look», no CONFIG link).
- **Power:** root's passport `switch: "never"`, `wakeOnCall: false`.
- Smaller: `lib/a2a/self-description.cjs`:136 (root forced «custom»); the reserved id `root` (`drafts.ts`, `main-agent-cli.mjs`:1123);
  a comment «`root` есть у каждого узла» (`kits/_agent-kit/core/server/telegram.cjs`:1104).

### 4. Root against the custom template
Root's repository `Fractera/fractera-root-starter` was born 2026-09-23 (280: «the node's site as its own element»); the custom template
was cut FROM it on 2026-09-26 (root v1.7.30 → custom v0.1.0). Today root v3.0.54 against custom v0.3.199: 1154 files identical, 42
different, 17 only in root, 20 only in custom.
- Only root has: the home widget `widget-static-root-home` (a prompt and a reply) with the door `app/api/first-task` (a task to the core's
  `/api/node/first-task`); its own voice tool `_tools/tool-voice-input` with its door and `components/form/mic-icon.tsx`.
- Only custom has: the core's «Project shell» stub (727: `components/shell-kit/*`, `app/shell-kit/[file]`) — root still draws and
  serves the shell the core copies; the OpenAI error words and the usage ledger (726); `_tools/.gitkeep` (733-6); and more of the
  template's later steps.
- Different: root's passport (`id root`, «The main site of the project…», `switch never`), its port 24683, its home data, and files where
  root lags the template (714-1, 714-3, 733-9 parts code, the starter banner, the menus).
So root is the custom template plus three own features (a first-task prompt with its door, its own voice tool) and minus the template's
later steps — and the core leans on it for the shell, the design, the birth of others and the domain apex.

## Since when

- 2026-09-23 `cd5ada93` 280-1: «сайт root — третий обязательный элемент узла; сторож required-present».
- 2026-09-24 `1f026357` 285-3: the core on the project shell — `components/shell` a copy of the site. The owner's words then: «если мы
  говорим что мы пере используем один и тот же компонент везде то почему у нас корень и ядро имеет правильное представление для хедер и
  футер» — a wish for one header everywhere, taken as an order to make root the source of the core's look (exactly what the rule above
  forbids).
- 2026-09-27 `8f74a2e7` 325-8 and later: the apex address by the id `root`; 553, 606 (the plan to make root native).
- 2026-11-11/12 727: the core's «Project shell» for custom elements — the right direction, left half-done: the core and the natives still
  copy root.
- 2026-11-12, this session: 733-7 released root v3.0.54 as its own template line (its own voice tool kept and offered to neighbours);
  in chat I called root «главная», asked whether root's voice should be the node's source and drew a core voice 2.0.0 for root's rules
  (withdrawn, nothing built). No root privilege was added to the code in this session.

## Rollback and rewrite — proposed substeps (nothing done before the owner's yes)

1. **The rule in both instructions** — `CLAUDE.md` §3 (lines 108, 113, 115), §4 (200), §7 glossary (element = a server); the element
   instruction source (microservice line kept, «root ones» → «preinstalled»), its root variant removed (root gets the custom variant);
   seal both; regenerate the element instructions.
2. **Skills** — `fractera-vs-anthropic`, `element-power`, the templates' `node-knowledge` (two files), the `telegram.cjs` comment.
3. **The core's code without root** — the core's shell is the core's own (the 727 tool; `check:shell-kits` checks copies against the
   core, never root); natives take the core's shell like custom elements; a new element's design and settings come from CONFIG, never
   from root's folder; the apex address is a setting that names any element (or the core), not the id `root`; menus, dashboard,
   passport and names list root like every custom element; no `never` power and no default design door by id; the reserved id stays
   only as a name taken.
4. **Root an ordinary custom element** — rebased on the custom template (95% already the same): its home widget, first-task door and
   voice tool become its own code; the separate template line `fractera-root-starter` — the owner decides: retire it (root keeps its
   repository as any element does) or keep it as a starter like any other.
5. **Proofs** — a node with root turned off and with root absent: the core's panel draws its header and footer, a new element is born,
   the domain activates, the menus list everything (the negative control: today each of these breaks or reads root).
Questions for the owner: the `required: true` of the ten native elements in the registry — keep as «preinstalled» or drop; whether the
first-task prompt stays in root or becomes a tool any element may take.

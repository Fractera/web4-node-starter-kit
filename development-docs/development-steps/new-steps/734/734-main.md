# 734 — all elements are equal, the core alone is special (the rollback of root's privileges)

The owner, 2026-11-12 ~17:05 (the stop and the rule, verbatim in `development-docs/reports/audit-2026-11-12-root-and-element-equality.md`),
then ~17:35: «да, утверждаю, начинай с правила». The audit is the plan; its five steps are the substeps.

## Substeps and state

- **734-1 the rule in both instructions — BUILT.** CLAUDE.md §1, §3, §4, §6, §7, resealed (`06304cd7`); the element instruction source
  §1, §7, §9 and «preinstalled» for natives; the builder has two variants only — root gets the custom one. Templates custom v0.3.200,
  native v0.1.67, root v3.0.55 — pinned (`1ba240d7`, `fbe6eb3e`, `38ec07ef`). NEXT on the node: the node update, then the instruction
  into the born elements (`npm run instruction:element -- element …`, then `template -- rollout … --also CLAUDE.md,scripts/instruction.seal`).
- **734-2 skills — BUILT** (`188771df`): fractera-vs-anthropic, element-power; the templates' node-knowledge (two files, in the releases
  above). Left for 734-3: the comment «`root` есть у каждого узла» in the agent kit's `telegram.cjs` (twelve guarded copies).
- **734-1 on the node (2026-11-12 17:46, core `5dc3e344`):** CLAUDE.md carries the rule; root at v3.0.55; Клип's folder got the new
  instruction and seal by `instruction:element -- element` (uncommitted — the rollout leaves Клип alone: its HEAD `7001737` is past its pin
  v0.3.171, the element's own work; its agent commits the two files).
- **734-3 the core's code without root — substeps for the owner's yes:**
  - 3a-1 BUILT (`b38b4111`, the owner's yes 2026-11-12 ~18:00): the core is the shell's master — check:shell-kits compares every
    element with the core (root like any element, a drift is a debt), shell-kit:add copies from the core, the shell-kit GET draws
    coreShellData, the lock's «home» → the bare domain; negative control: no master → FAILED. PROVEN on the node (core `4ea8dcd4`,
    2026-11-12 18:01): the update built although root's copy now differs (the old guard failed the core's build on that); `check:shell-kits`
    — the core ✓ master, root, Клип and the ten natives listed alike as debts; root's process stopped → the panel's header (y 30, 57 px)
    and footer («© 2026 Fractera», y 3225) drawn, no console errors (`logs/eyes/2026-11-12T18-01-47-605Z.png`); root started again, 200.
  - 3a-2 BUILT (CONFIG v1.2.43 `53ec40e`, installer `546b568c`, pin `c6dc8871`) and LIVE on the node (core `6c2e4023`, 2026-11-12
    18:25). Proven so far with root running: CONFIG's `/api/shell/ru` answers (top 2, footer, languages); its editor's sign-in link is its
    own `/login?lang=ru` (was root's). Waiting: the proof with root's process stopped (the auto-mode guard refuses `pm2 stop` without the
    owner's word) and the signed-in editor (eyes has no session — the owner's Chrome). ROOT STOPPED (the owner's yes, 18:3x): root's
    health 000; CONFIG's `/api/shell/ru` still answers — top «Нативные элементы | Кастомные элементы», the languages; in the owner's
    Chrome `/ru/architect/header` and `/ru/architect/languages` render 200 with the shell, no console errors; root started again, 200.
    Found then (the owner: localhost must not ask sign-in): config's own doors used the cookie-only `sessionOf` since v1.0.0 —
    `/api/me` 200 as architect, `/api/settings/app` 401. FIXED in config v1.2.44 (`809fddc`: `lib/config-store/architect-of.ts`, the
    owner at the machine first, in five doors), pinned (`ccc1d4bf`), LIVE (core `1ed36613`, 18:53). Proven: `curl
    localhost:24685/api/settings/app` 200; negative control with `cf-connecting-ip` / `x-forwarded-host: example.com` → 401
    `no-session` (`cf-ray` → 400 `no-session`); the owner's Chrome, no sign-in — «Языки» (2 chosen, the list) and «Шапка» (the menu
    items with their addresses) drawn, no console errors. Not repeated: the editors' content with root stopped (the guard refused a
    second `pm2 stop`); the shell door and the pages were proven without root before. Found for 3d: CONFIG's menu «Кастомные элементы»
    names root «Главный сайт».
  - 3a-2 (as found measuring 3a): CONFIG — a native element — reads «the menus as now» and the languages from root's `/api/shell`
    (`loadProjectShell`, `PROJECT_SHELL_URL`), and the installer gives every element `PROJECT_SHELL_URL`, `PROJECT_MENU_URL`,
    `PROJECT_SITE_URL` as root's doors. A native depending on a custom element. Measured: root's `/api/shell` is only root's OWN shell
    data (its app config, its copy of CONFIG's settings, the node's catalogue) — every custom element computes the same for itself.
    CONFIG takes from it the menus «as now», the languages, and its login and policy links point at root. Variants for the owner: (B, my
    pick) CONFIG reads the menus and languages from its own store, links sign-in to the auth element, the installer hands out no root
    address — a CONFIG release + the installer; (A) the core computes a project shell door from CONFIG's settings for everyone.
  - 3a (as planned) the shell: the core's `components/shell` is the master; `check:shell-kits` and `shell-kit:add` compare and copy from the core,
    never root; the core's panel draws its shell data itself (CONFIG and its own catalogue), not root's `/api/shell`; the panel's «home»
    link is the core's own. Proof: root turned off — the panel keeps its header and footer.
  - 3b birth: a new element with the project look takes design and settings from CONFIG, never root's folder. Proof: a dry birth with
    root absent. MEASURED 2026-11-12 ~19:05 (plan for the owner's yes):
    - found: `scripts/item-birth.mjs`:192-208 (`look === 'project'`) copies root's `DESIGN-CONFIG/design-config.json` into the newborn
      and root's copy `data/services/root/project-settings.json` into `data/services/<id>/`; `scripts/sync-site-design.mjs` (every core
      build) takes the core's design from root's `/api/settings/design`. CONFIG already holds all three kinds (app 21 keys, platform 12,
      design colors/fonts/type/shape/blocks) and serves them by MCP `get_project_settings` with the node key; the registry names it by
      `provides: ["project-settings"]`.
    - 3b-1 birth: the core asks the element that provides `project-settings` (`get_project_settings`, node key) and writes the newborn's
      copy in the element's own shape (`receivedAt, from, version, patches, catalog`); no file from root's folder — the template's
      DESIGN-CONFIG stays and CONFIG's design patch lies over it (the element's readers already do that). CONFIG silent → born with the
      template's files, catches up at its start (printed, as before). `--like <id>` (the person's own pick) unchanged.
    - 3b-2 the core's design: `sync-site-design.mjs` reads the design from the `project-settings` provider, never root; the empty-answer
      guard stays.
    - proofs: a guard line — neither script names root (negative control: put it back → the guard fails); a real test birth with
      root's process stopped (its copy `from` = CONFIG, its first page drawn in the project's colours — eyes), then the test element
      removed after the owner's yes; a core build with root stopped prints the design taken from CONFIG.
    - the owner: «да, B, начинай» (~19:25). MEASURED while building: CONFIG's project «design» kind is EMPTY and has no writer
      (`/api/settings/design` is every element's door to ITS OWN design, it shadows `/api/settings/[kind]` for design; MCP never
      writes) — and the core always took root's OWN design too. CONFIG's own design is byte-equal to root's (= the core's copy,
      #2563eb), and every running element is already #2563eb/#60a5fa. So B needs no data write: the project's look = the own look of
      the `project-settings` provider. BUILT (working copy): `lib/web4-items/project-settings-source.mjs` (`projectSettingsProvider`,
      `projectSettingsCopy` by MCP, `projectDesign` by the provider's design door, the node key never printed; live: ok), the birth
      writes the newborn's DESIGN-CONFIG and settings copy from it (3b-1), `sync-site-design.mjs` reads it (3b-2), guard
      `check:element-equality` (in the prebuild; negative control: the old code → FAILED naming item-birth :193 :201 and
      sync-site-design :30; `--self-test` catches a planted `x.id === 'root'`). The core's chain (without the install-only
      check-local/check-origin) 55 guards green + next build. LIVE (core `ca3ad41e`, 2026-11-12 19:20) and PROVEN with root's
      process stopped (the owner stopped it, `npm run power` reason «1»): the update's core chain printed `ELEMENT_EQUALITY_OK` and
      «[sync-site-design] оформление ядра уже совпадает с оформлением проекта («config»)» (3b-2); a test birth `pm990` («Проба рождения
      734», `--look project --no-wake`) — its settings copy `from http://127.0.0.1:24685/mcp`, version `2490a7aaa9f8` ≠ root's copy
      `7d1437bf1cba`, received 19:23:43 with root down; its page 200 with the project shell, #2563eb, no console errors
      (`logs/eyes/2026-11-12T19-24-03-746Z.png`). LIMIT said aloud: the template's DESIGN-CONFIG is byte-equal to the project's, so
      the colour cannot tell the source, and the create command swallows the birth's stage lines; the static guard and the 3b-2 live
      line carry that part. Root back by `npm run power -- root on` (200). The test element waits for the owner's «удаляй».
  - 3c the bare domain: a setting in the node's domain record names the element (or the core) that answers it; every reader
    (activate, reach, preview-url, dashboard, check-addresses, main-agent-cli, services-install) reads the setting, never the id. Today's
    node keeps root there by the setting.
  - 3d lists and names: menus, dashboard, passport, names list root like every custom element (no `withRoot`, no `rootSite`, no eyebrow).
  - 3e the rest: the design door has no default element; the a2a self-description takes the kind from the passport; the agent kit's
    comment «`root` есть у каждого узла» fixed in its twelve copies.
- **734-4 root an ordinary custom element** — the owner decides the fate of `fractera-root-starter`.
- **734-5 proofs** — root off and absent: the core's panel shell, a birth, the domain, the menus.

Also by the owner's word the same day (not 734): README — «108 design skills compete for your element» first among the killer
features (`bca65e54`), and root named an ordinary custom element there.

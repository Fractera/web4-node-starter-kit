# 845 — A research of defect classes, not single defects

The owner, 2026-11-23 (Telegram 1174): «Попробуй усилить размышления ведь мы же не можем по одной микроскопической ошибки решать такие
задачи может быть ты проведёшь исследование и найдёшь больше подобных проблем?»

Five defects of one day (1156 install button, 1164 the Pult button, 1170 refused tasks, 1172 the favicon, 1154 no pull) are five classes.
Each class is searched over the whole core mechanically; every finding has its proof and its fix; one build and one server update for all.

## Classes and findings (2026-11-23 14:00–14:20 UTC)

A. **Promised, not built** — a door or a button named in code that does not exist. Audit: every `api/…` reference in lib, app,
   components, scripts, proxy against the 187 route files (scratch script `doors-audit.mjs`; element doors, external APIs and file names
   filtered by hand).
   - A1 LIVE: `api/architect/icons` (lib/site-settings/fields.ts:224) — no door; the iconSet field is drawn disabled; `POST
     /media/generate-icons` has no caller → step 844.
   - A2 dead: `api/node/reminder` named for elements in lib/main-agent-cron/reminders.mjs:6 — never existed (git history); no element
     skill tells to call it → fix the comment (the notice door and the deep memory's calendar are the ways).
   - A3 dead: components/request/pre-step-request.client.tsx and page-text-request.server.tsx post to `api/architect/pre-step`, removed in
     229 (c3885c84); nothing mounts them → delete the orphans.
   - Next: the same audit in the custom and native template workshops.
B. **State that depends on the address or a bot, refreshed on some events only.**
   - B1 (the aifa.dev letter, verified): the main bot's web_app button is refreshed at the build end, an element deploy and a tunnel
     address change — not at domain activation (`app/api/domain/activate`, `lib/hosting/server-domain-switch.ts`), not when the main bot
     admits the architect (telegram.cjs build branch: `applyMenu` = setMyCommands only), not on a new bot token → step 843.
   - B2 (found by code, verify on a server): an element's bot button (its `PROJECT_SITE_URL` + `/tg`) is refreshed when its bot admits a
     person and on its deploy — not at domain activation.
   - B3 (found by code, verify on a server): element rename (`app/api/architect/items/[id]/address` → `scripts/element-move.mjs`) rewrites
     only absolute PATHS in `.env.local`; `PROJECT_SITE_URL` (`https://<address>.<zone>`, its sign-in links and its bot button) keeps the
     OLD address while `moveSubdomain` removes the old name → sign-in and the Mini App of a renamed element may lead nowhere until its next
     install. Ask the server agent: `grep PROJECT_SITE_URL` in a renamed element's `.env.local`.
C. **A screen decides from a measurement taken before the act.**
   - C1 fixed 1ce046ec: the install button after a finished install (strategyOf).
   - C2 same cause: `server-launch.client.tsx:248` hides the danger zone (clear, reinstall) after a fresh install, because the probe
     taken before it saw no Fractera. Root fix: re-probe once the launch is done (launch.mjs readState), not only the button.
D. **A law with no path on a server.**
   - D1 (1170): «lent fuel» (an element's session on the node's subscription) is forbidden behind the wall (811-5b) → the main agent
     refuses a task given to it personally → the §1 law proposed in 1171 (do it through the element's repository).
   - Next: every «the node's X for the element» rule (OpenAI key, GitHub key, Telegram tokens) against the wall.
E. **The order of a fresh server.** The bot, the domain and the keys come after the first build; everything set «at the build end»
   misses them. B1 is one; next: list every «at the build end» action and replay the fresh-server timeline of aifa.dev (13:03 build, 13:11
   bot token, 13:12 bot admitted, 13:13 domain).

## State

- 2026-11-23 14:20 UTC — A done for the core; B, C, D, E started; first report to the owner (1176).
- 14:30 UTC — D: the doors a walled element may call (`lib/node/element-doors.mjs`: agents, needs, notice, person-asks, browser, a2a,
  elements, skills, shell-kit, transcribe …) — OpenAI goes through the core's own doors (transcribe, the kit's translate run by the
  core), GitHub pushes and element bots are the core's acts: no second D defect found; D1 stays. E: at the build end the core refreshes
  the bot button (tg-build-notice) and revalidates its pages and root's (serve.mjs refreshPages); on a fresh server the bot (13:11),
  the admission (13:12) and the domain (13:13) come after it — B1/B2 are the E cases; nothing else set «at the build end» depends on
  the bot or the domain.
- THE BATCH (one build, one server update, after the owner's yes): 843 (B1 + B2: refresh at domain activation — both paths — at the
  main bot's admission and new token, the element bots too; a test; a final-check line), 844 (A1), B3 after the server's line (rename
  rewrites the element's own URLs and refreshes its bot), C2 (re-probe after a finished launch), D1 (the §1 law + a skill), A2/A3
  (dead references removed).

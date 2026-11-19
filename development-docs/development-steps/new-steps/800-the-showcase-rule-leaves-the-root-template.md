# 800 — the showcase rule leaves the root template

State: APPROVED for root (2026-11-19, terminal). The native and custom templates — asked, waits his word.

## Decided by the owner (verbatim)

- «Итак я понимаю проблему. Насколько глубоко интегрированный это правило витрины и как сложно его убрать … чтобы Fractera или любой
  другой домен работали одинаково?» → road B (no showcase anywhere), not A (real session first).
- «давай тогда нативные шаблоны не трогаем а у root аккуратно вычистим это всё безобразие» → the FULL removal in the root template,
  carefully; native templates untouched (decided before the security finding below — asked again).

## Facts measured

- Fresh server at fractera.ai (root v3.0.68): a never signed-in visitor gets «Личный кабинет» = `visitor@showcase` with ALL roles;
  «Выйти» returns to the same panel (Chrome, 2026-11-19). Cause: `lib/showcase.ts` SHOWCASE_ORIGIN https://fractera.ai.
- The rule in root: 2 own files (`lib/showcase.ts`, `lib/showcase.server.ts`) + consumers `lib/auth/get-session.ts`, `proxy.ts`,
  `lib/db/index.ts`, `app/robots.ts`, `components/auth/access-gate.client.tsx`, `components/shell/quick-nav.client.tsx`,
  `components/shell/quick-nav-visibility.ts` (+ its test), `scripts/check-seo-html.mjs`; comments in `scripts/check-case.mjs`,
  `development-docs/glossary.md`. Other «витрина» words in root mean a storefront or a specimen — not this rule, untouched.
- ⚠ SECURITY: the templates' `isShowcaseRequest` reads `X-Forwarded-Host` first (the core's 741-3 two-facts fix never reached them).
  https://throughsongs.com/api/me: 401 → with `X-Forwarded-Host: fractera.ai` 200 `visitor@showcase`; the same on auth, data,
  storage, config, memory, graph, vectors .throughsongs.com (the Cloudflare tunnel passes the header). The server (nginx) stays 401.
  `/api/users` with the forged header stays 401; other doors not measured.

## Substeps (root)

- 800-1 Workshop `data/workshop/fractera-root-starter`: delete `lib/showcase.ts`, `lib/showcase.server.ts`; remove every branch,
  import, type field (`viaShowcase`), the read-only DB wrapper, the proxy's GET pass and write barrier, robots' showcase paths, the
  client gate's and quick nav's showcase sign, the guard's copy; the comments that describe the rule. A test proves fractera.ai is an
  ordinary name (negative control: the same test fails on v3.0.68).
- 800-2 The template's prebuild green → commit → annotated tag v3.0.69 → push main + tag (Fractera/fractera-root-starter).
- 800-3 Pin root v3.0.69 in the core (`WEB4-ITEMS-REGISTRY/web4-items.json`, one file, one commit).
- 800-4 The core's push (fork + Fractera) — the owner's act through a window; the 33 waiting commits ride along.
- 800-5 The server updates (its updater moves root to the pinned tag: root has no own work there) → live checks.
- This computer's root is not moved by the pin while it carries its own work (the Mini App, 789); its agent takes v3.0.69 by «Обновить».

## Test checklist (run and marked by me)

- [x] root workshop: no `isShowcase`, `SHOWCASE_`, `viaShowcase`, `visitor@showcase`, `ReadOnlyShowcase`, `lib/showcase` left
      (git grep RC=1, 2026-11-19); both files deleted; 10 files edited (staged by name)
- [x] `npm run test:quick-nav` — ===QUICK_NAV_OK=== (the showcase case removed with the type field)
- [x] the whole prebuild green — RC=0 (after: the touched quick-nav left clean with the shadcn Tooltip, PARTS.json regenerated); tsc RC=0
- [ ] the behavioural proof is LIVE, with the negative control measured before: https://fractera.ai/api/me answered 200
      `visitor@showcase` on v3.0.68 (2026-11-19, this session) → must answer 401 on v3.0.69. A unit test of `getSession` was
      dropped: the template's tests run in bare Node without the `@/` alias.
- [x] server: https://fractera.ai/api/me 401 since 11:41:57 (was 200 visitor@showcase at 11:36:54); a guest sees «Войти» (eyes 11:44)
- [x] server: POST /api/revalidate → 401 Unauthorized, no ReadOnlyShowcase; forged X-Forwarded-Host → 401
- [ ] this computer: the panel and root unchanged (no rebuild of root here)

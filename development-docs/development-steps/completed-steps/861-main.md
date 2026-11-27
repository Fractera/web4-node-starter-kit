# 861 — a quiz wish reaches the chat, the PDF carries the tree, the element reads its own quiz, the quiz speaks the person's language (closed 2026-11-27)

## Roma's words
- 1467 (gist): «Продолжить квиз» → a wish → the window closed with no sign where it went; he expected «ваше пожелание к квизу добавлено,
  перейдите в чат» and a button to the chat.
- 1475: 853 had promised the model and effort switch; only a grey line was built (owned) → 861-5. 08:35: «чтобы можно было …
  перемещать усилия». 1477: yes to the code.
- 1547 (2026-11-27 11:23 UTC), closing it: «Давай из нашей работы сейчас полностью уберём aifa.dev … работаем между Fractera и тобой» —
  the server check that 861 waited for is dropped; the step closes on the Mac's proofs.

## Where it lives
- Core: 20f621da (the wish through the node with a notice and the way to the chat; the PDF prints the tree with marks), 40d11558 (the
  gate lets an element's keyed call reach `/api/node/product-quiz/pdf` — guard 847 caught it), be44457b (the window's wording, the quiz
  language on the page), aff5fe65 (861-6: `POST /api/node/github-push` with the element's own key, `npm run github:self`), bf5b7136
  (agent-kit manifests by `agent-kit:update` per group), 6f61153b (review: «limit reached» only while the reset is ahead; «—» for a quiz
  with no language). Pins 7e4c4df6 (custom v0.3.247), 512fdd07 (native v0.1.86).
- Templates: custom eb78957 + 44d5a03 → **v0.3.247**; native d5dec40 + 108fe32 → **v0.1.86** (861-4: the quiz in the person's
  language, `npm run quiz:pdf`; 861-5: the native Mini App model and effort card; 861-6: `github:self`, a person's act is a window).
- Fractera main carried all of it from 512fdd07 / 6f61153b on; fractera.ai built it at 10:18:59 UTC (core 2c9a3c27).

## Proofs (the Mac, build 33d6d34a)
1. **Doors, with negatives:** `quiz/pdf` and `quiz` with a bogus `X-Node-Key` → 401; with no key at the machine → 200 (the panel's
   rule); an empty wish → 400; quiz-feedback tests 5 passed (empty and too-long wishes refused).
2. **The eye:** Playwright on `/ru/fc4vk/product-design/quiz` — «Продолжить квиз» → window → send → the notice «Пожелание передано
   агенту»; fc4vk has no bot → «Открыть терминал»; console clean (`logs/eyes/861-wish-notice.png`); the wish's task line ARRIVED to the
   main agent (door → wake → line), not passed on to fc4vk on purpose; the test wish removed. The PDF fixture
   (`logs/eyes/2026-11-27T08-43-09-636Z.png`): shapes, legend, counts per level, «Язык квиза: русский»; a quiz without a tree prints
   the old modules and no empty table (negative). The native Mini App card with a stubbed state (`…08-45-46-172Z.png`).
3. **Releases:** dry releases of both templates green before the real ones; tags v0.3.247 / v0.1.86 on GitHub, pinned; full core
   prebuild RC=0 on 6f61153b.

## Not proven — named, not claimed
- On a server: the aifa.dev check (brief `logs/for-aifa-check-861.md`) was dropped by Roma's 1547; on fractera.ai the live card switch
  on lidt5, its PDF marks (109 ✓ · 47 ◇ · 5 ○) and `npm run quiz:pdf` there were never reported back.
- The Mac's own build still runs 33d6d34a: be44457b … 6f61153b ride the next Mac core build (owed, asked before it).

## Mistakes
- The first wish window opened the terminal drawer — invisible from a phone; the person had no sign the wish went anywhere (the defect
  861 fixed).
- 853 promised the model and effort switch and delivered a grey line (Roma 1475) — built in 861-5.
- I copied the master `telegram.cjs` into the 12 agent-kit groups with `cp`; Roma's release pushed it to Fractera while my prebuild ran,
  and `check:agent-kits` failed on the manifest fingerprints right before his server update (fixed bf5b7136).

## Evolution of skills
Memory `prebuild-before-fractera-push`: a core commit reaches Fractera only after a green prebuild on that HEAD; agent-kit copies change
only by `agent-kit:update -- <group>`. The templates' `product-quiz` skill: the quiz is written in the person's language.

## Parts born here
None new: the native Mini App card reuses the core's `lib/node/tg-app/model-choice.cjs`; the wish notice lives in the existing quiz island.

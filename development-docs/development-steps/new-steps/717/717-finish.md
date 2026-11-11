# 717 — finishing the move of the whole architecture to sections (PLAN — the owner's yes before code)

The owner, 2026-11-11 ~10:20: «забудь про тесты … сделай работу для которых мы начинали недельный лимит. Моя архитектура должна работать на
секциях а не на блоках … построй план чтобы завершить переезд все архитектуры на секции удали свой тест YouTube». The 717-7 test is
dropped (both test elements deleted 10:15); its summary is not written.

## Measured 2026-11-11 10:18 (git grep in every workshop repository, the word in the section sense, the container address excluded)

| Repository | Tag | Section-sense lines | State |
|---|---|---|---|
| fractera-custom-item-starter | v0.3.186 | 0 (336 allowed: address, other trades) | ✅ moved (717-2…717-6) |
| fractera-native-item-starter | v0.1.59 | ≈1,030 | ❌ components/blocks + .card.json cards + admin «Blocks» pages |
| 10 native starters: auth, data, storage, vectors, embeddings, config, graph, cache, memory, stripe | own tags | ≈1,000–1,150 each | ❌ the native template's shape plus their own pages |
| fractera-root-starter | v3.0.44 | ≈855 | ❌ |
| web4-node-starter-kit (the core) | — | ≈2,500 (most: its own catalogue `sections/blocks`) | ❌ |
| fractera-blocks-starter, fractera-design-starter | — | — | retired in 716 — out of scope |

On this node: the 10 native elements and root are installed from those starters by tag; «Клип» was born from custom v0.3.185 and
holds its own code.

## Substeps — one script carries everything (the owner's 15:05 idea of 717-2)

- **717-8 The native template.** Teach `migrate-sections` the native shape: each `block-*.tsx` with its `.card.json` → one folder
  `components/sections/section-*/` (the card's words into its README); `block-cta-button`, `block-hero-centered` too; the admin
  «Blocks» pages (`admin/_pages/blocks/*`, `element-blocks-pages.tsx`, `element-blocks.ts`). **Owner's choice:** (A) remove them as the
  custom template did in 706 — the sections are the element's own code, no catalogue (my pick: one architecture for both templates);
  (B) rename to «Sections» and list only the element's own sections. Words, guards (`check:words`, `check:sections`), the
  instruction from the core's source, the 717-3 prototype rules if the native has prototypes. Release the native tag.
- **717-9 The ten native starters.** The same script in each, then its own pages and words by its report; prebuild + CI three-os;
  a tag each; the core's pins. Mechanical — the script does the bulk.
- **717-10 The root starter** — the same script, its own sections into folders; tag; pin.
- **717-11 The core.** README.md (line 150), the core's skills that speak of elements' blocks, the pin task text, §2 «port block» →
  «range» and §7 «Block (section)» → «Section» of CLAUDE.md (only by the owner's word, then the seal). The core's own catalogue
  `sections/blocks` (its own interface): **owner's choice** — rename now or later.
- **717-12 This node.** Fork sync + `node:update` brings the new tags of the natives and root (a core build — warned first). «Клип»:
  its agent runs `npm run migrate:sections -- --apply` in its own folder after the custom rollout — by the owner's word.

## Done when

No repository of the workshop and no element of this node names a section «block»: `check:words` green in each, every element
builds, its pages draw as before (the 717-2 before/after HTML diff on each template).

## Dangerous places

The 12 of 717-main hold. Plus: a native starter may keep pages of its own that the script lists for the eye — read its report, never a
blind replace; `services:install` never re-clones a born element — natives and root move by their tags, «Клип» only by its own agent.

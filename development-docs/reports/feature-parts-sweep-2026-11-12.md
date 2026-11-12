# The parts sweep of the core — 2026-11-12 (node step 725-6, `npm run parts -- --audit`)

Model-free: every client component read against the parts map (`lib/parts/PARTS.json`). Nothing is rebuilt here — the owner chooses.

## R1 — textarea + bare microphone (0)

- none


## R2 — input + bare microphone (0)

- none


## R3 — table with a hand search (0)

- none


## R4 — second copies (7)

- `app/[lang]/(architectLayer)/_components/element-github.client.tsx + components/domain/domain-list.client.tsx + components/wallet/node-wallet.client.tsx` → one part for «bg-destructive/5 border border-destructive/40 flex flex-col gap-2 p-3 …» · medium — 3 copies
- `components/official/official-account.client.tsx + components/super-node/super-node-status.client.tsx` → one part for «bg-destructive/5 border border-destructive/40 flex flex-wrap gap-3 ite…» · medium — 2 copies
- `app/[lang]/(architectLayer)/architect/build/github/_connect/panel/default-template/step-3/page.tsx + app/[lang]/(architectLayer)/architect/build/github/_connect/panel/default-template/step-4/page.tsx + app/[lang]/(architectLayer)/architect/build/github/_connect/ui/step-form.client.tsx` → one part for «bg-emerald-500/[0.06] border border-emerald-500/40 flex gap-2.5 items-…» · medium — 3 copies
- `app/[lang]/(architectLayer)/architect/build/github/_github/client/element-repos.client.tsx + components/domain/static-copy.client.tsx` → one part for «bg-primary/5 border border-primary/40 flex flex-col gap-3 p-4 rounded-…» · medium — 2 copies
- `app/[lang]/(architectLayer)/_components/cron-calendar.client.tsx + app/[lang]/(architectLayer)/_components/element-passport.tsx + app/[lang]/(architectLayer)/architect/build/github/_github/client/github-binding.client.tsx` → one part for «border border-border flex flex-col gap-2 px-4 py-3 rounded-lg» · medium — 3 copies
- `_tools/socials-ai/client/socials-ai-dialog.client.tsx + components/deploy/core-deploy.client.tsx` → one part for «border border-border flex gap-3 items-center justify-between px-3 py-2…» · medium — 2 copies
- `components/dialog/dialog-sample.client.tsx + components/request/pre-step-request.client.tsx` → one part for «border border-border hover:text-foreground px-4 py-2 rounded-md text-[…» · medium — 2 copies

## R5 — unused parts (8)

- `_tools/code-view/client/code-view.client.tsx` → Code view — imported by nobody outside its own folder in the core · a decision, no code
- `_tools/fact-draft/client/fact-draft.client.tsx` → Typed draft from words — imported by nobody outside its own folder in the core · a decision, no code
- `_tools/image-crop/client/image-cropper.client.tsx` → Image cropping — imported by nobody outside its own folder in the core · a decision, no code
- `_tools/socials-ai/client/socials-ai-dialog.client.tsx` → Social links from a phrase — imported by nobody outside its own folder in the core · a decision, no code
- `_tools/translations-dialog/client/translations-dialog.client.tsx` → Translations dialog — imported by nobody outside its own folder in the core · a decision, no code
- `_tools/video-trim/client/video-trimmer.client.tsx` → Video trimming — imported by nobody outside its own folder in the core · a decision, no code
- `components/workspace/tabs-scroll.client.tsx` → TabsScroll — imported by nobody outside its own folder in the core · a decision, no code
- `components/form/voice-field.client.tsx` → VoiceField — imported by nobody outside its own folder in the core · a decision, no code

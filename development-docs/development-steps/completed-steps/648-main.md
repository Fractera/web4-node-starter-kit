# 648 — the eyes for root and the custom template (closed)

**Commits:** `Fractera/fractera-custom-item-starter` `85e715b`, tag v0.3.156; `Fractera/fractera-root-starter` `1d533ec`, tag v3.0.20;
`Fractera/web4-node-starter-kit` `b6f9e48e` (the element instruction source, pins). The plan was deleted in the closing commit.

**The owner, verbatim:** «linux task now to cancel»; «Давай добавим возможность play Wing для для рут и стартового кастомного шаблона»;
«Разумеется с обновлением текущих навыков как мы это сделали и при необходимости они знают дела или нет при обновлении инструкции».
Native template and native elements — not in it; Linux root `install-deps` — cancelled.

**What and how.** The existing pattern of `npm run study`: ONE browser in the core. In both repositories: `scripts/eyes.mjs` calls the
core's `scripts/eyes.mjs` (cwd the node, `NEXT_`/`AGI_` labels stripped) with `--out <element>/logs/eyes/<time>.png` (outside git);
`npm run eyes`; skill `build-skills/use-eyes` (Process: build); `use-tests-before-dev-finish` — a third kind of evidence «the eye»;
`connect-own-domain` — Chrome with the Claude extension named with both links, else lead by words, `eyes` no help in a foreign
interface; `.claude/modes/build.md` lists `use-eyes`. The element instruction §7 gets an `@C` line (custom and root, not native):
«A built surface is seen before it is shown …»; `npm run instruction:element -- templates` → custom and root CLAUDE.md + seal, native
«nothing to change».

**Proofs.**
1. The whole prebuild of both repositories — exit 0 (first run: `===SKILL_PROCESS_FAIL=== use-eyes: … «**Process: …**»` — the negative
   control of a guard; fixed); `check:instruction` OK in custom, root and native; CI three-os green on both tags.
2. The owner's node: root v3.0.20 installed (`services:install -- --only root` → `===SERVICES_INSTALL_OK===`); in
   `WEB4-ITEMS/user/root`: `npm run eyes -- http://localhost:24683/ru --top --measure header --measure 'main h1' --measure footer` →
   `chrome 150 · 200 · «Что вы хотите построить? | Fractera»`, header and h1 «виден», footer «вне экрана», no console errors; the PNG in
   root's own `logs/eyes/`, looked at; not in `git status`. Root's CLAUDE.md carries the new line.

**Mistakes.** The skill was written without the process line the template's guard requires — caught by the guard, not by me.

**Owed / not in it:** native template and native elements; existing custom elements other than root (none on the owner's node) get it
by `npm run template -- rollout custom v0.3.156 …` when the owner asks; Linux `install-deps`.

**Evolution of skills.** `use-eyes` (new), `use-tests-before-dev-finish`, `connect-own-domain` in both repositories.

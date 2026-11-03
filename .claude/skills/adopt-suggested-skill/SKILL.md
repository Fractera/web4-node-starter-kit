---
name: adopt-suggested-skill
description: "Build process. The person names a skill they heard of — in an ad, a post, a video, from a friend («I heard about replica-skill») — or gives its link: find it, judge it the catalog's way, answer with curiosity, and after their yes hand the checked copy to the element's own agent, marked «suggested by the person»."
---

# A skill the person suggests

**Process: build** — it ends with a commit in an element, made by that element's own agent; you find, judge, ask and hand over.

A hint, not a law: models of late 2026 work worse under rigid step-by-step instructions.

## Why

The owner of the node, 2026-11-03: «я услышал бы рекламе про навык, например replica-skill для продвинутого реверса инжиниринга с
дополнительными возможностями. И должен уметь найти этот навык дать ему оценку и добавить в проект пользователя … с пометкой навык по
предложению пользователя»; «можно найти навыки которых много с похожим названием» — so ask for the link where they saw it. Who installs:
«Агент элемента» — the element's own agent, never you. The judging is the catalog's (627): the whole folder, scripts read, risks,
value, use, quality, the partners' audits — and the repository's own history, because a skill from an ad can be loud and young.

## How

1. **Find it:** `npm run skills -- adopt "<name or link>" --said "<their words>"`.
   - `===SKILLS_ADOPT_CANDIDATES===` — several repositories answer to the name: show the two to four likeliest (stars, installs, last
     update) and ask where they heard of it — the link to the ad, the post, the video or the repository. A post you read yourself; a
     video only by its page and description. Then the same command with `--pick <owner/repo>`.
   - `===SKILLS_ADOPT_NONE===` — ask for the link; never guess a repository.
   - `===SKILLS_ADOPT_MANY===` — a large repository: ask which skills (`--skill <name>`), or judge them all with `--all` after their yes
     (each skill is one marker call on their subscription).
2. **Answer** (`===SKILLS_ADOPT_JUDGED===`) in the instruction's «curiosity first» voice — short and living, in their language:
   - the trust signals first when there are flags («31 days old, one commit, 7,203 stars in a month — loud from an ad, not proven by
     time»);
   - each skill worth a look in one line: its name, the stars of its repository, its installs, what it brings, how it is used; the
     outside service or key it needs, if any;
   - what the node already has («the node already has: …») — say plainly when the skill repeats it;
   - what is not taken and why: risks (named), a cloud place to keep or run things («against the node's local-first rule»), no value;
   - your recommendation — which skills, into which element — and the question.
3. **After their yes**, for each approved skill: `npm run skills -- adopt-hand <owner/repo>@<skill> --to <element> --send`. A skill
   with scripts — name the scripts and get a separate yes first. `===SKILLS_ADOPT_HAND_FAIL===`: «the folder changed after the check» —
   judge it again; «skip» — it is not installed, say why.
4. **Tell them** where it went: the element's agent takes the checked copy from the core, installs it with its `SOURCE.md` («Origin:
   suggested by the person») and commits; its report comes back to you (`npm run state -- <element>`).

## Never

- write into an element's folder yourself — its own agent installs from the checked copy;
- install a skill with risks, or a copy whose fingerprint changed after the check;
- send the person's words or files anywhere but the searches and the marker.

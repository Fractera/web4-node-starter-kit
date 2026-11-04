# A closed substep and a closed step — the pattern, on step 1 of a fresh node

Copy the form, not the words: every line below is filled from YOUR work, your commits, your proofs. The names of the files are the law
(`completed-steps/<N>-<k>.md`, `completed-steps/<N>-main.md`); the headings are the pattern (skill `use-development-steps`, §5–§6).

---

## `completed-steps/1-2.md` — a closed substep

```markdown
# 1-2 — The architect's account, made on this computer before the domain (closed 2026-11-05)

## The person, verbatim
«давай создадим аккаунт» (2026-11-05 10:12 UTC, in the terminal).

## Where it lives
Core of this node, `main`, commit `a1b2c3d` (this summary and `current-steps.md`); the account itself is node data (auth's database),
outside git.

## What was done
The person opened «Sign in» on the home page at http://localhost:24680 and registered with their email; I said before it that the
first account is the architect for good and its password cannot be recovered, and named the later way back (Google or the Resend
magic link, skill `use-auth-providers`).

## Proof
1. The live answer: the panel opened at `/ru/architect` signed in as that email (the person's screenshot / words «я внутри»).
2. The door: `GET /api/auth/session` → `{"user":{"email":"…","role":"architect"}}`. Negative control: the same request from a private
   window (signed out) → `{}` and the panel asks to sign in on the temporary address.

## Mistakes
- I first sent the person to the temporary address, where registration is closed — they got «registration closed»; the plan says
  localhost, and I now say the address in full.

## Evolution of skills
Nothing to improve.
```

---

## `completed-steps/1-main.md` — the step closed (its last substep closed)

```markdown
# 1 — The first launch: node up, first account, domain, Telegram, the first task (closed 2026-11-06)

## The person, verbatim
The start: the link to their fork and «go» (2026-11-05 09:40 UTC). Decisions on the way: «домен потом» (1-3 postponed, 2026-11-05),
«бот готов» (1-4).

## Substeps
- 1-1 the node is up (`completed-steps/1-1.md`) · 1-2 the architect's account (`1-2.md`) · 1-3 the own domain — **postponed by the
  person**, moved to step 2 (`new-steps/2-own-domain.md`) · 1-4 the Telegram bot (`1-4.md`) · 1-5 the first task routed (`1-5.md`).

## What the step gives now
The node runs; the architect signs in; the main agent answers in Telegram; the first task «магазин для свечей» lives in the element
`shop` (step 3).

## What is not done
The own domain — step 2.

## The plan
Deleted in this commit; recover it:
`git log --diff-filter=D --format=%H -1 -- development-docs/development-steps/new-steps/1-first-launch-first-account-domain-telegram-task.md`
then `git show <hash>^:<that path>`.
```

---

## The four checks before you call it closed
1. Every substep of the plan has its own file — or a line in `<N>-main.md` saying where it went (postponed, cancelled, moved).
2. Every summary names a commit hash; the proofs are quoted, one of them a negative control.
3. The plan left `new-steps/` in the same commit as `<N>-main.md`.
4. `current-steps.md` says what is next — written in the same commit.

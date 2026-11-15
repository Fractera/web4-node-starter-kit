# 1 — The first launch: node up, Claude Code sign-in, a Telegram bot, the first task

## Why
A person who has never set up a server pasted the link to their fork and said «go». From here they must reach their first task without
a single question they cannot answer.

## Substeps
- **1-1 — the node is up.** Done by `npm run launch` on 2026-11-15: packages, fork check, build, start, the browser opened on the first screen.
  Proof: `npm run serve:status` answers, `===PUBLIC_URL===` opens.
- **1-2 — the first account, on this computer, before 1-3.** On localhost the panel opens without sign-in (the owner at the
  machine), on the temporary address sign-in and registration are closed, on an own domain registration is open to everyone and
  the first to register becomes the architect — so the person registers here, now, through «Sign in» on the home page. The first
  account is the architect for good and cannot be recovered — say it in the chat; the register form shows it too (auth v2.4.9). Later: Google or the
  Resend magic link for the architect (skill `use-auth-providers`), so the password can be restored by email. Proof: the person is in
  the control panel.
- **1-3 — the own domain.** The temporary Cloudflare address is only for a look. Serious intentions — a domain (for example porkbun.com,
  a .com about $12 a year, the price checked on the site); the person keeps the Claude Code chat open and you make the records that join
  the project, the registrar and Cloudflare (skill `use-domain`). Proof: the home page opens on the own domain.
- **1-4 — the Telegram bot.** @BotFather (https://t.me/BotFather), the token on the node's Telegram page. Proof: the bot answers the
  person's first message.
- **1-5 — the first task.** The person writes what they want to build, on the home page or to the bot (`/api/node/first-task`). Proof:
  the main agent answers and the task is routed (`npm run find` → an element, or `npm run create`). Any question about the
  architecture — skill `explain-this-project`.

## Closing
Close each substep with its own file in `completed-steps/` and the step with `1-main.md`; then this plan leaves `new-steps/`
in the same commit. The form of both — skill `use-development-steps`, `references/closed-step-example.md` (a closed 1-2 and 1-main).

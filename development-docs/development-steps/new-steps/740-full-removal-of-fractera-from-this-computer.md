# 740 — «Опасная зона»: full removal of Fractera from this computer (draft plan, not approved)

Queued 2026-11-14 at the owner's word (verbatim): «Обязательно запланируй в настройках ядра добавить опцию: опасная зона полная удаление
Fractera с этого компьютера нам это нужно будет для того чтобы пройти полный цикл тестирования». Step 739 (sign-in on an own domain) goes
first; this plan is unfolded into substeps and shown to the owner before any code.

## What «full» must mean (to measure before the plan is final)
- The node's processes: every `fractera-*` pm2 process deleted and `pm2 save`; the autostart pm2 wrote (launchd / systemd / Windows).
- The node's folder whole: the core, `WEB4-ITEMS/*` with every element's own git and data, `data/`, `logs/` — irreversible.
- Outside the folder, made by the node: the quick tunnel (dies with its process); a named tunnel's credentials in `~/.cloudflared/`; the
  Claude Code journals of the node's agents `~/.claude/projects/<the node folder…>`; the eyes' Chromium cache; the build reader port.
- NOT removed, said aloud: the person's GitHub fork and the elements' repositories, their domain and its DNS records, servers launched
  from this computer (each lives on), Node.js, pm2, Claude Code itself (the person's tools, used by other projects too).

## Design to verify
- In the core's Settings, a section «Опасная зона» (shadcn, red, closed by default); only at this computer's keyboard (`localhost`),
  never on a temporary address, a domain or a server node.
- Before the act: what will be deleted, with sizes; whether every element's work is pushed to GitHub (unpushed commits named); an offer to
  keep a copy of `data/` first.
- The confirmation: AppDialog, the person types the folder's name; the door checks it.
- The act runs from a copy of its runner OUTSIDE the folder (it deletes the folder it lives in), detached; the page shows a last static
  status; at the end the browser tab has nothing to talk to — the runner leaves a report file in the home folder.
- Proof (two planes): `pm2 jlist` has no `fractera-*`, the folder and the outside traces are gone; negative: the fork and a launched
  server still answer. The full cycle the owner wants: remove → `git clone` of the fork → `npm run launch` from scratch.

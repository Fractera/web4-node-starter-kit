# 746 — «Core → Settings → Danger zone»: remove the whole Fractera project from this computer

## 1. Retelling and decisions

The owner, 2026-11-15 00:52 UTC (voice, as typed): «Я хочу сделать однажды более глубокое тестирование и для этого мне да в принципе или
любому пользователю может понадобится полное удаление внимание только с локальной машины всего проекта и для этого на вкладке ядро
стройки нужно сделать разделение на два раздела тот который сейчас будет называться главный провайдер добавить раздел который будет
называтьсяопасной зоны полное удаление с компьютера проект фактора. Конечно же с подтверждением что пользует тюль понимает о всей
ответственности и этих данных которые потеряет без возвратно в общем нужна мне такая кнопка».

My plan was sent with one question (offer an archive of the node's data before the removal?). His answer, 2026-11-15 ~01:05 UTC:
**«Да, с архивом, начинай 746»** — the plan is approved.

Decisions (mine, said in the plan he approved):
- The core's «Настройки» accordion (`components/panel-design/node-settings.tsx`) gets a third item, last: «Опасная зона».
- Only THIS computer: the project folder and the agents' session journals of this folder in `~/.claude/projects/`. Never the fork on
  GitHub, a launched dedicated server, the tunnel and DNS in the Cloudflare account, the Claude subscription, keys at providers.
  Shared programs stay: `~/.local/bin/cloudflared`, pm2 itself (`~/.pm2`).
- Only the architect, only at this machine's keyboard (`isOwnerAtMachine`), only on a person's computer (`placeKind === "home"`): on a
  temporary address, an own domain or a server the door refuses and the dialog says why.
- Confirmation: the folder's name typed letter for letter + a tick «I understand it cannot be undone»; the door checks both again.
- The archive (his yes): a download of the node's own data before the removal — `data/` (keys of elements, bots, memory, domains, the
  elements' stores in `data/services/<id>`) without what comes back by itself (`data/workshop` template clones, the embeddings model,
  the skills catalog), plus `.env.local` (the node's keys — into the person's own download, never read by an agent) and the registry.
  Elements' code is not in it: the dialog lists the elements whose work is not on GitHub.
- A running core cannot delete its own folder: the door copies the remover to the system's temp folder and starts it outside the core's
  process tree (`spawn-free`); it waits for the door's answer, removes the node's processes (`serve.mjs remove --yes`, 371-3), deletes the
  journals and the folder, and leaves one report `~/Fractera-removed-<date>.txt` (the folder that would hold a log is gone).

## 2. What is reused

`scripts/serve.mjs remove` (371-3: the node's pm2 processes by folder, `pm2 save --force`, the Windows autostart) ·
`scripts/spawn-free.mjs` · `lib/auth/owner-at-machine.ts` `isOwnerAtMachine` · `lib/hosting/place.mjs` `placeKind` ·
`lib/auth/require-roles` · the cross-site wall (744-2) · `lib/web4-items/element-delete.ts` `deletionRisk` (unpushed work per element) ·
`app/[lang]/(architectLayer)/_components/delete-element-button.client.tsx` (the dialog's pattern) · `components/dialog/app-dialog.client`
(the one modal) · `components/ui` (Accordion, Button, Input, Label, Checkbox).

## 3. Known limits

- `ANTI-PATTERNS`: no blocking operation in a door (325-6: a `rmSync` of a folder froze the whole site) — the door only spawns.
- The removal must survive the core's death: a child of the core dies with the pm2 tree — `spawn-free`, the script outside the folder.
- §6: never read `.env.local` — the archive streams it by code into the person's download; no agent reads it.
- §6: a number about the machine is never printed into a prebuilt page — the dialog asks the door on a click.
- Windows: a folder held by a running process is not deleted (EBUSY) — processes first, `rm` with retries.
- The owner's Mac also holds `~/fractera-dev`: the remover deletes exactly the node's folder and the journals whose names derive from it.

## 4. Observable results

1. A scratch node folder with a fake pm2 process inside it is gone after `node scripts/node-remove.mjs --yes --confirm <name>`, its
   process and journal too, the report file exists; with a wrong name nothing changes.
2. `GET /api/architect/node-remove/archive` from this computer downloads a `.tar.gz` with `data/` and `.env.local`, without
   `data/workshop`; through the tunnel's host — 403.
3. «Ядро → Настройки» shows the third item «Опасная зона»; its dialog lists what is lost and what stays, the archive link, the name
   field and the tick; the button stays disabled until both match.

## 5–6. Substeps, order, address

All in the core: `~/fractera-dev/web4-node-starter-kit`, branch `main`, pushed to Fractera; this node gets it by the fork sync and
`npm run node:update` (one build, the batch rule).

- **746-1** the remover script `scripts/node-remove.mjs` (preview + `--yes`) and its test.
- **746-2** the doors: `/api/architect/node-remove` (GET preview, POST start) and `/archive` (GET stream).
- **746-3** the screen: «Опасная зона» in the core's settings, the dialog.
- **746-4** live: push, the fork sync, this node's update, the screen seen by eyes, the doors' refusals proven; the summary.

## 7. Not in this step

Removing the fork, a server, Cloudflare objects, pm2 or cloudflared themselves; a restore from the archive (the archive is a file the
person keeps; a «restore» button is a separate step if he wants one).

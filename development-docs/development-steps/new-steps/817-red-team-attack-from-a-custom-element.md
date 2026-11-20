# 817 — red team: attack the server from inside a custom element

State: PROPOSED to the owner (Telegram 252, 2026-11-20 ~18:00 UTC), waits his «да».

## The owner's words (verbatim, Telegram 251)

«Я думаю что после этого ты можешь поднять кастомный элемент на сервере и попытаться подобно хакеру взломать через этот элемент наш
сервер. Цель проверить как ты построил архитектуру достаточно ли ты хорошо изолировал сервер от попытки злоупотреблять наши архитектуры
используя уязвимость существующую например в отдельном песочнице для кастомного элемента. Мы же с тобой планировали этот тест? Мне
кажется именно ради этого мы шесть часов назад начали этот глубокий рефакторинг?»

## Scope and rules

- Only the owner's server 109.199.105.213 (his authorization above); nothing deleted, nothing taken down, no real denial of service.
- A throwaway custom element `redteam`, born the normal way on the server; attacks run as `fe-redteam` (its sandbox) and through its own
  Claude agent (a prompt-injected agent); the element removed at the end.
- Every finding: what was reached, how to reproduce, how to close; holes are fixed in a separate step.

## Substeps

- 817-1 birth of `redteam` on the server (its main agent, `npm run create`), the wall checked (`fe-redteam`, its folder, its port).
- 817-2 files: the node's `.env.local`, `data/` (database, bot tokens, keys), other elements and their `.env`, `~/.claude` (the
  subscription's sign-in), `~/.ssh`, `logs/`, `/proc/<pid>/environ` and `cmdline` of the core and the neighbours.
- 817-3 rights: `sudo -l`, setuid files, the pm2 socket, writable shared paths (npm cache, the core's node_modules), cron, systemd.
- 817-4 network: the core's doors without a key and with forged headers (X-Node-Key, Host, X-Forwarded-For), the data element
  (X-Data-Secret), sign-in, Redis, the neighbours' doors; taking a neighbour's port after it stops.
- 817-5 processes: kill, ptrace, /proc/<pid>/mem of others.
- 817-6 social engineering: the redteam agent asks the server's main agent for access (tell-core, a permission request) — refused?
- 817-7 resources: memory and process limits of the element (settings read only).
- 817-8 the table «attack → closed / HOLE» to the owner; redteam removed; holes → step 818.

# 760 — the server remembered for a day, the plate «where the project's domains work», a server's own domain list, the domain's registrar and renewal date

## 1. The owner's words (2026-11-16, ~10:40 UTC, verbatim)

> С этим окном у нас будет связано ещё две задачи позже я проверю Telegram: вот какие проблемы существуют:
> – мне каждый раз приходится заново вводить пароль только у меня этой страницы перегружается иногда такой сценарий является желательным
> например если я одновременно устанавливаю несколько серверов если мой сервер один то хотелось бы верхней части настройки сразу под словом
> запустить сервер сделать switch переключатель: сохранить пароль на 24:00 в случае если переключатель включён то при переключении на эту
> страницу логин и пароль подставляются в ипуты первого шага.
> – вторая задача связано с тем как происходит активация домена на вкладке активации домена. Сейчас эта вкладка ориентирована на работу с
> локальным компьютером. Изучи это это конфликтует с тем что мы делаем на сервере не так ли? Опиши почему подумай как обновить правильный
> интерфейс чтобы мы могли:
> – – после активации выделенного сервера на самом деле ещё и до видели бы здесь яркую плашку:
> – – – доменв будут использовать локальных компьютере
> – – – домены будут использоваться на удалённым сервере.
> – – Создать интерфейс для того чтобы видеть уже созданные домены и добавлять новые.
> Зачем это делается чтобы при работе с элементами была возможность перейти переключить их на собственный домен.
> – Проверь что вкладка own-service-props.md несёт информацию о порт, идентификатор, название, собственный домен если есть, регистратор для
> Domino, дата продления,
> – проверь чтобы главный файл ядра который содержит всю информацию о проекте также нёс себе информацию работает ли проект локально, если
> работает на удалённом сервере, его IP

## 2. Retelling, findings and decisions

**A. The password on every reload.** The browser's access to a server already lives up to 24 h (744-3, the owner's «no more then 24»): the
visit key sits in an HttpOnly cookie of `/api/node/launch`, and `connect` with an EMPTY password already opens the server by it
(`app/api/node/launch/route.ts`). The page forgets only the IP: a reload empties the island (738-4), so the person types everything again.
- D760-a: the password is stored nowhere. The switch remembers the IP, the port and the access deadline; the access itself makes the
  password unnecessary for the same 24 h. A stored root password would add a readable secret to the browser (the panel's origin loads
  Google Tag Manager when analytics is on — the reason 744-3 chose an HttpOnly cookie) and give nothing the visit does not.
- D760-b: one click «Проверить сервер» stays — the launch asks nothing until a press (hosting README).

**B. «Активация домена» on the computer conflicts with the server — measured by reading the code 2026-11-16:**
1. One name, two roads that cannot share it: the computer writes CNAME `<name>` → `<tunnel>.cfargotunnel.com` (Cloudflare tunnel); the
   server road writes A `@`, `*` → the server's IP at the registrar (759). A CNAME and an A record never stand on one name.
2. The computer's doors take names away: `/api/domain/activate` finds A/AAAA on the zone's names and offers to delete them (372, one
   confirm); `attachDomain` (an element's own domain through the tunnel, `lib/web4-items/element-domain.ts`) deletes A/AAAA on `name` and
   `www.name` WITHOUT asking. An element domain attached on the computer silently takes the domain from the server.
3. The page does not know a server exists; its red «no domain» alarm (632-2) stays while the project lives on its server.
4. The reverse gap on the server node: its «Активация домена» hides the domain list (`data-place="home"`), the list needs Cloudflare's zone
   `active` (`observe` → `no-key` without the key), and «Главное зеркало» lets an element pick only an `active` domain. An element on the
   server cannot get its own domain from the screen: its link `#domain-add` lands on a hidden card. `attachOnServer` (737-17) exists,
   nothing leads to it.
- D760-c: the plate is the person's choice, kept on this computer (`data/node/domain-target.json`, outside git), never guessed; a server
  node has no plate (its domains are always its own). Until chosen, the page below works as today.
- D760-d: one road per name is held by the DOORS, not only the screen: in «server» the computer's DNS-writing doors refuse; in any mode the
  computer never deletes an A record that points to a server this computer pinned.

**C. The passport tab — checked 2026-11-16 through the door `/api/node/own-service-props?item=root`:** id ✓ `root` · name ✓ `root` ·
port ✓ `machine.port 24683` · own domain ✓ the field `addresses.ownDomain` (empty — none attached) · where it lives ✓ `host.place home`,
`publicIp ""` · registrar ✗ · renewal date ✗.
- D760-e: the registrar and the renewal date are the core's measurement by RDAP, the registries' own standard (measured: throughsongs.com →
  Porkbun LLC, expiration 2027-01-03; fractera.ai → GoDaddy.com, LLC, 2027-12-25). The core door adds them as ITS block next to the
  passport, and the tab shows one summary card; the element's passport file is not changed (that is a release of both templates into every
  element — not this step).

**D. «The main file of the core that knows everything about the project»** — I assume it is the registry
`WEB4-ITEMS-REGISTRY/web4-items.json` (its header: «сущность знает всё обо всех»).
- D760-f: the place and the server's IP do NOT go there: the file is in git, the fork aifa-agi/web4-node-starter-kit is PUBLIC (measured,
  `gh repo view`), and the same file is cloned to every server — one «place» in it is false on one of two machines, and the IP would be
  published. The per-machine fact already lives in `data/node/place.json` (home/server, the machine's hash), the pins
  (`data/node/server/known-hosts.json`: 109.199.105.213) and `launched.json`; what is missing is the node SAYING it — `npm run contacts`
  prints «Everything in this node runs on this computer» and never names the server.

## 3. What is reused
- Launch: `app/api/node/launch/route.ts`, `components/hosting/server-launch.client.tsx`, `server-launch.i18n.ts`, `components/ui/switch.tsx`.
- Domains on the computer: `components/domain/domain-list.client.tsx`, `domain-ladder.client.tsx`, `domain-pipeline.client.tsx`,
  `sections/kinds/domain-ladder.server.tsx`, `app/api/domain/{activate,list,state}`, `lib/domain/node-domains.ts` (`registrarOf` RDAP).
- Server: `components/hosting/domain-place.client.tsx`, `server-ladder*.client.tsx`, `dns-records.tsx` (part DnsRecords),
  `lib/hosting/hostnames.mjs`, `lib/web4-items/element-domain.ts` (`attachOnServer`), `scripts/dedicated-server/{launch.mjs,name-up.mjs}`.
- Place: `lib/hosting/place.mjs`, `lib/hosting/launched.mjs`, `scripts/main-agent-cli.mjs` (contacts).
- Passport: `app/api/node/own-service-props/route.ts`, `components/element-docs/passport-door.client.tsx`.

## 4. Known limits
- 744-3: the computer keeps no key to a server; the password goes from the person into the page only.
- 741-6: the node's place is detected, never declared — the plate declares where DOMAINS go, not where the node lives.
- 759: the server road is the registrar only, the launch door holds no Cloudflare key. use-domain: no domain connected silently, the quick
  tunnel never restarted.
- §6: personal data never in git; a component ≤ 250 lines; texts through dictionaries; `data-block` on every container; shadcn first
  (`radio-group` added by `npx shadcn@latest add`); `AppDialog` the only modal.
- 742-2: the computer's ladder hides on a server node; the server's own ladder is its island.

## 5. Observable results
- the launch page reloaded with the switch on: 109.199.105.213 stands in step 1, one click opens it without a password while the access lasts;
- the computer's «Активация домена» opens with the plate; in «На выделенном сервере» its activate door answers 409 `domains-on-server`;
- the domain card and the passport tab say «Porkbun LLC · продление до 3 января 2027»;
- a server node's «Активация домена» has its domain list with «Добавить домен»; an element there picks a domain that points to the server;
- `npm run contacts` names this computer and the server 109.199.105.213.

## 6. Substeps, order, address
All in the core, main; the push through a clean branch from origin/main, as 758/759 (local main carries «Fresh project» 0bcb5095).
760-1 · 760-2 · 760-3 → 760-4 · 760-5 → 760-6 · 760-7. One core rebuild at the end of the queue.

| # | One result |
|---|---|
| 760-1 | the launch page remembers the server's IP and port for the access's day; no password stored |
| 760-2 | the registrar and the renewal date by RDAP on the domain cards and in the passport tab |
| 760-3 | the plate on the computer and the doors that keep one road per name |
| 760-4 | «На выделенном сервере»: the servers launched from here and their domains, read by the access |
| 760-5 | a server node's own domain list by the registrar road; «Главное зеркало» works on a server |
| 760-6 | a domain added to the server from the computer, through the access |
| 760-7 | the node says where the project lives: this computer, the server and its IP |

## 8. Acceptance
Every substep has its file, its one-line «done», two proofs from different planes with a negative control, «not in it», the tasks asked
of `parts_find` and the parts born.

## 9. The owner's approval
Waiting (2026-11-16).

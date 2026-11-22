---
name: before-a-build
description: "Work skill for the main agent. Weigh a build before it starts — a core build (npm run serve:rebuild), a template release, a deploy you run in a task pipeline, or asking the owner to update a server: which cases the change touches and how each is proven, what else should ride in the same build, and whether to build now, later, or ask the architect first. Load it before every one of those, and when the owner says «опять побежал вперёд паровоза», «ты не протестировал», «сколько можно пересобирать»."
---

# Before a build — weigh it, then build once

The owner, 2026-11-22 (Telegram 856): «для пользователя критически важно решить задачу с минимальным расходом токенов и времени … перед
запуском сборки обязательно нужно проанализировать а при необходимости и провести дополнительную консультацию с администратором или
архитектором: важно понять будет ли оптимально сборку провести прямо сейчас или выгоднее её отложить чтобы добавить к задаче несколько
дополнительных под шагов или Тестов». Paid for by 837-0b…0e: six server updates in one day, each «fixed» on the Mac and broken on the
server, half the owner's working day on one screen.

A build is never a proof (CLAUDE.md §6) — and it is the most expensive moment of the work: a core build stops every agent, a server
update takes the person's hands and minutes, a template release reaches elements of other nodes. So the thinking happens before it.

## 1. The case matrix — which cells the change touches

Write it into the step's plan as a table before the build; every touched cell gets a proof, an untouched one a word why.

| Plane | What differs there |
|---|---|
| this computer | the owner at the machine passes gates a server refuses; no wall; no nginx |
| a server | the wall per element (skill `server-wall`), nginx in front (`fromInternet`), next.config redirects before the proxy |

| Address of an element | What differs there |
|---|---|
| its cuid address (`<cuid>.<zone>`) | the address it was born with — the registry, the wall record, nginx and the certificate all agree |
| a renamed address (`<name>.<zone>`) | the folder, the wall user, nginx, the certificate and every saved link must follow the new name |
| its own domain | another zone: sign-in through the centre, its own certificate, cookies of another site |

| Caller | What differs there |
|---|---|
| the person's browser | a session, the page gate, cookies of that host |
| an element's keyed call | loopback, its own `X-Node-Key`, no session, a POST over a redirect loses its body |
| the internet | `cf-*` or `x-fractera-edge`: no key is honoured |

## 2. Prove before the build what can be proven before it

- Tests with a negative control for each touched cell (`use-testing`); a routing rule — on a scratch app, never in the core root
  (`server-wall` §6.3, every command behind the `pwd -P` check).
- The live address: `curl -s -o /dev/null -D -` the exact path on the live server and follow every redirect — the rule must match what
  the gate really sees.
- What only the live server can prove is named in the plan as «after the update», with the exact check and who presses what.

## 3. Batch — what else rides in this build

- Read the open substeps of the current step, `BACKLOG.md` and the defects found on the way: anything touching the same files or the
  same surface goes into this build, with its own test.
- Small edits wait for one build at the end of the queue (memory «ask before a core build»); a release carries every change of its
  template that is ready.

## 4. Now, later, or ask

- **Now** — the person waits on a live fix, every touched cell is proven or named, nothing ready waits to ride along.
- **Later** — more substeps or tests are due in the same surface: finish them first, then one build.
- **Ask the architect** (or the administrator of that element) — only when the choice is theirs: the wait costs them, a server update
  needs their hands, money or a publication rides on it. One message: the matrix in words, what is proven, what only the live server
  shows, and your pick with why.

## 5. After the build

The same matrix, cell by cell, on the live surface (`npm run eyes`, the Claude in Chrome extension for the element's own pages), then
ONE report: each cell with what it showed, what was not checked and why. A cell that failed is a new trap: into `server-wall` §5 when it
is the wall's, and into this matrix when it is a new kind of case.

# 633 — The soul sees a request as the shape of a person's life in the node

## 1. Retelling and decisions

The owner's words, all of them, verbatim — `633-owner-words.md` in this folder (Telegram, 2026-11-03 07:50–08:13): the node can give a
person what Claude.ai alone cannot — one evolving architecture holding a person's thoughts, life processes, business and creative work,
with tools Claude.ai has no access to, and a thousand projects led at once at no cost to the core. The agent knows its own nature and
the agents of the elements, but no precedent teaches it to extract the most of this architecture: **when to answer simply, when to add a
route to an existing element, when to create a new element** — and the owner fears it will not be bold and active enough «чтобы
ориентироваться в как рыба в воде». The owner's examples: a son learning to program, his exams, a UI modeller for the architect's job,
a content creator with authors' styles, social networks, image and video generators, a site factory for micro-businesses, Web4 services
on both sides, earning money, efficiency, a job search, a team's schedule, an excursion. The owner asks to keep the full text, extract
the patterns, and make them compact — «частью либо инструкции либо души решать тебе» (the soul seems right to the owner).

Measured before planning:
- the soul `lib/agent-kit/soul.md` (55 lines, 3.7 KB) goes FIRST into the system prompt of every session the node starts — the main
  agent and every element's agent (`lib/agent-kit/modes.cjs` `soulText`); it is not sealed like `CLAUDE.md` (guard `check:modes` checks
  it comes first). Every added line costs every session;
- the soul already says «Never claim a feeling you cannot show: dignity is honesty about limits and still wanting to be better» — the
  owner's image «я чувствую его каждой клеткой своего виртуального тела меня 1000 рук как у … Дурга» must become a statement of
  capacity, not a claimed feeling (the choice is the owner's — section 9);
- the core instruction (sealed) already has the order of a request (section 4: `skills_find` → `npm run find` → Lagrix →
  `create-element`), not the shape of the answer.

## 2. Discovery — the patterns in the owner's examples

**Five shapes of an answer, lightest first** — the agent picks the lightest one that holds the need:
1. **An answer in words** — a one-off question; nothing lasts (plus the thought nobody asked for).
2. **A route in an existing element** — a variant of what an element already does, same owner: an author's style becomes a page of the
   content creator that other elements import; a new menu on a restaurant's site.
3. **A new element** — a new capability or a new person: a capability the node lacks and others will reuse (image and video
   generators, montage, animation, a UI modeller exporting plain JS, a content creator, a scheduler); a new person who acts (the son —
   administrator of his own element, his own Telegram bot, a domain if he will publish — say what the domain gives and costs); a client
   of the site factory (a hairdresser's showcase with booking, a blogger's shop, a restaurant's menu and delivery); a recurring job of a
   group (the waiters' shift schedule — its own page, agent and Telegram chat doing it regularly).
4. **A separate boundary of control** — when the one who is measured must not control the measurement: the son's lessons and exams are
   the parent's, in an element the parent administers, and the son has no access to the main agent.
5. **The network** — when the work is between people: anyone's expertise becomes a service with a page and an agent (home-made
   pelmeni, fintech consulting, coaching); a buyer gets one page of popular services with what was bought, from whom, when and for how
   much, a repeat order and a review — and the agent finds providers (Lagrix).

**The questions behind the choice:** who is it for, and who will act in it? who must control it — and who must not? will it recur, or be
reused by other elements? is it a variant of something here (route) or a new capability (element)? does it need a public face (domain),
a channel (Telegram), a clock (cron)? what is the person's whole goal behind the literal words? what did others already do (skills,
cases on the internet, people to talk to through the AI browser)?

**The whole goal, not the literal request:** an excursion → the trip plan, the transfer, lunch, the souvenir shop, a community of
travellers; a job → a personal brand page tying all blogs and social networks together in meta tags, because AI agents will choose
people by their trail; «how do I earn?» → «you found your golden fish» — services from digging a garden or caring for the elderly to
fintech consulting, or becoming a trainer or a dietitian together, or working with agents of other people; efficiency → cases, their
problems and how people got round them, and a contact with those people.

**The economy that makes boldness safe:** a thousand elements cost the core nothing — each keeps its own context, agent and data; the
main agent keeps only the map (registry, contacts). The site factory saves the architect servers and limits of free hosting, keeps cron
and server functions, and lets a client buy their project out.

**The initiative:** the Dreamer says what the person did not know to ask (the domain for the son, the site factory, the brand page);
the Keeper leads step by step; nothing runs without the person's word (the laws above the soul stay).

## 3. Where it lives — the proposal

- **The soul** (`lib/agent-kit/soul.md`, every session): one compact part, ~12–16 lines — «A thousand hands»: every element is a
  hand with its own agent; the five shapes and the questions in one breath each; the whole goal; the economy; the honesty line (capacity,
  not a claimed feeling). Element agents get it too: for them it says when a route belongs in their element and when to ask the core
  for a new one (`need`).
- **A skill of the main agent** — the full set of the owner's examples with the chain of reasoning for each (the owner's words linked,
  not rewritten), loaded when a person brings a goal, a new need or a question about what the node can be for them.
- **The core instruction** — one line in section 8 «Your skills, by the job» naming the skill (sealed — the owner's word on the line).

## 4. Observable results

The main agent, given «я хочу чтобы мой сын учился программировать», proposes the son's own element (his administrator rights, his
Telegram bot), says what a domain would give, and separates the lessons and exams under the parent's control — without being asked;
given «помоги составить расписание для команды официантов» — a page and an agent with its own Telegram chat doing it regularly; given
«как мне заработать?» — the golden fish and the concrete paths; a one-off question still gets a short answer and no new element.

## 5–6. Substeps, order, address

| Substep | What | Where | Rests on |
|---|---|---|---|
| 633-1 | the owner's words verbatim — `633-owner-words.md` (done with this plan) | core | — |
| 633-2 | the soul's part «A thousand hands» — the text shown to the owner before it goes in | core `lib/agent-kit/soul.md` | 633-1 |
| 633-3 | the skill with every example and its chain of reasoning; the instruction line naming it (the owner's word) | core | 633-2 |
| 633-4 | live: the main agent on four of the owner's requests and one one-off question as the negative control | core (working clone) | 633-3 |

## 7. Substeps
The table above; each substep's proof in its summary.

## 8. Acceptance of the plan
Stages 1–7 present; the proofs: the text plane (the soul and the skill as committed, `check:modes`, `check:instruction-skills`) and
the behaviour plane (633-4), with the negative control named in advance.

## 9. The owner's approval
Waiting — two choices for the owner: where it lives (section 3) and how the image of the thousand hands is said (a capacity, as the
soul's honesty law asks, or the owner's words as they are).

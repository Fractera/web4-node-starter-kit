# 626 — Local vectors: the native element `embeddings`, and the whole node moves to it

Group «The node without OpenAI vectors»: 626 (this step) and 627 (the skills catalog graph shipped ready).

## 1. Retelling and decisions

The owner, 2026-11-02, verbatim: «Запускай планирование в результате которого наш проект перестанет использовать OpenAI для размётки
вектора, уберет бессмысленную работу когда в глубокой память делает записи при помощи Anthropic без вектора, и создаст граф на основе
вектора для навыков».

Decisions in the choice window, verbatim:
- where the local model lives: «Новый нативный элемент»;
- which model: «Взять MiniLM-L12 сразу»;
- the vectors already stored on running nodes: «Нет, начать с чистого листа»;
- the deep memory when `embeddings` does not answer: «Я не понимаю по какой причине он может не работать? … мне кажется ты немножко
  начинаешь загоняться на очень редкие кейсы?» → one check before the thinking call, no queue (my decision, shown with the plan);
- the plan: «Да, верно, показывай второй шаг».

Retold: every vector of the node is counted by one local model, `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`
(384 numbers, 220 MB), inside a new native element `embeddings`. OpenAI counts no vector anywhere, and nothing needs an OpenAI key to
store or to find by meaning. With vectors always available, the deep memory's thinking call (Claude by the subscription when there is
no OpenAI key) is never wasted again.

Who calls whom after the step:
```
core (agents' memory, npm run find) ─┐ texts
deep memory (memory)                ─┴──────► vectors ──┐
graph (LightRAG, per call)          ─────────────────────┼──► embeddings (MiniLM-L12, 384) — resident, ~0.5–0.8 GB
                                                          ┘
```
The core and the deep memory send TEXTS to the vectors element (its contract already takes `text` and `query` without a vector); only
the vectors element and the graph ask `embeddings` for raw vectors.

I assume that:
- the element loads the model at its start and keeps it — a resident process like the other elements under pm2;
- «clean slate» sets the old files aside (renamed, never read again), it deletes nothing — nothing irreversible;
- OpenAI stays for what is not vectors: the deep memory's thinking when a key exists (`gpt-6-luna`), `whisper-1`, translations,
  fact drafts — outside this step.

## 2. What is reused
- Native birth: `scripts/item-birth.mjs --native` with `WEB4-ITEMS-REGISTRY/native-template.json` (the button «Create a native element»).
- Ports `lib/server-port.cjs`; registry `WEB4-ITEMS-REGISTRY/web4-items.json`; install `scripts/services-install.mjs` (today it writes
  `EMBED_MODEL=text-embedding-3-large`, `EMBED_DIMS=3072`).
- The vectors element's contract (its README): `POST /vectors { text, embedding? }`, `POST /vectors/search { query | embedding }`,
  `GET /vectors/status` names the model and the size; the core already takes the kind from there (`lib/agent-kit/memory/embed.cjs`).
- Ledgers that already rebuild on a new model: `lib/a2a/self-description.cjs` (`ledger.model !== kind.model`),
  `data/node/memory/vectors.json` with `npm run memory -- vectors`, `scripts/skills.mjs base-load` («an emptied graph — load the base again»).
- The graph element: spaces `<SERVICE_DATA_DIR>/spaces/<name>/`, one Python run per call (`services/graph/graph.py`, `lib/graph/run.mjs`).
- Measured on 2026-11-02 (scratch, not a repository): fastembed 0.9.1 + onnxruntime 1.19.2 on Python 3.11 runs MiniLM-L12 on the Intel Mac.

## 3. Known limits — what must not break
- Law 6, «a new resident process — with its price in memory»: ~0.8 GB measured in Python; the exact price comes from 626-1 and is named
  on the element's passport and README.
- «Behaviour nobody ordered is never built»: no idle-unload timer, no reprocessing queue, no polling.
- «If Fractera disappeared tomorrow, nothing would break»: an installed node keeps its model file; a new install downloads it from the
  element's own GitHub release (pinned tag, sha256), not from a third party at run time.
- Element boundary: element code changes in each element's own repository (a workshop or scratch clone), with the owner's yes — this
  plan; the core folder never edits `WEB4-ITEMS/**`.
- Changing the embedding model of a live store or graph is the owner's decision (the READMEs of vectors, graph, memory) — taken: clean slate.
- `ANTI-PATTERNS.md`, «All systems» and the sections of the systems touched — read before 626-2 (processes, ports) and 626-8 (core rebuild).
- macOS on Intel: onnxruntime above 1.20 has no x86_64 wheel (measured) — the runtime must cover it.
- The instruction is sealed: CLAUDE.md line 62 («OpenAI — for vectors, …») and line 96 («vectors are computed by OpenAI») change by the
  owner's word (this step) and a new seal.
- A core rebuild only with its line in `current-steps.md` first.

## 4. Observable results
- `GET` the element's status → `{ model: "paraphrase-multilingual-MiniLM-L12-v2", dims: 384, ready: true }`; `POST` texts → 384-number vectors.
- On a node with NO OpenAI key: `graph-status` no longer answers `no_key`; `skills_find` returns the base's fragments; «запомни …» then
  «напомни …» in Telegram finds the phrase by meaning; `npm run find` finds an element by meaning.
- `git grep "api.openai.com/v1/embeddings"` over the core and the four element repositories → nothing.

## 5–6. Substeps, order, address
| # | Result (one thing to show) | Repository | Rests on |
|---|---|---|---|
| 626-1 | the runtime chosen by measurement on this Mac (Windows later — the owner, 2026-11-03); the same text gives the same vector in both runtimes | scratch, no repository | — |
| 626-2 | `embeddings` born, installed with its model; two doors answer | new `Fractera/fractera-embeddings-starter`; core registry | 626-1 |
| 626-3 | the vectors element counts texts through `embeddings`; the old store set aside | `Fractera/fractera-vectors-starter`; core installer | 626-2 |
| 626-4 | the core's agents' memory and element search send texts, count nothing | core | 626-3 |
| 626-5 | the graph counts through `embeddings`, works with no OpenAI key; old data set aside | `Fractera/fractera-graph-lightrag-starter` | 626-2 |
| 626-6 | the deep memory sends texts; no thinking call when `embeddings` is down | `Fractera/fractera-memory-starter` | 626-3, 626-5 |
| 626-7 | the skills base back in the graph; the «close enough» threshold re-measured for MiniLM | core + memory element | 626-5, 626-6 |
| 626-8 | release: tags, pins, core rebuild, texts and instruction; live on the Mac and the owner's Windows | core + 4 element repositories | all |

Branch `main` in every repository; each element releases a tag; the core pins the tags.

## 7. Substeps
`626-1.md` … `626-8.md` in this folder.

## 8. Acceptance of the plan
Stages 1–7 present; every substep names what is built, what counts as done, two proofs from different planes with a negative control
named in advance, what it rests on and what is not in it; 8 substeps.

## 9. The owner's approval
«Да, верно, показывай второй шаг» (2026-11-02), given on the outline of the eight substeps in the conversation; the written plan is
shown to him before the first line of code.

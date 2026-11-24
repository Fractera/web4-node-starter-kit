# 850 — a core task never stalls a person's live chat

Repository: the core (Fractera/web4-node-starter-kit and the fork aifa-agi), branch main; live on the Mac from the core build 549ac246 (builtAt 2026-11-24T14:16Z), pushed 15:32–15:33 UTC (e08ab8c5). The server proofs wait for the servers' update.
Commits: 99a3f1ad.

## Done
- lib/agent-kit/journal-since.cjs: took only from a prompt after the paste, waiting = enqueue without dequeue, unreadable = unknown; read as the element behind the wall (node -e via asWalled).
- The bridge never pastes a main agent's task into a running turn (spinner + printed within 3 s, up to 30 min); a held queue is told to the main agent with the way back and to the person in the element's own bot (telegram.tellHeld, ru/en).

## Proofs
- Plane 1: test journal-since 10 checks — the marketplace's morning replayed: the old rule (file time) said started, the content says waiting (negative); unreadable → unknown; the inline form agrees; the spinner frame is a running turn, an idle prompt is not.
- Plane 2: live on the Mac after the build: task to fc4vk 14:20 → core log «[agents/start] fc4vk--work: работа началась (задача 14:20, запись журнала 14:20)».

## Mistakes
- A standing watcher of held queues without a core task was not built (polling nobody ordered); a stand names itself on the next task.

## Evolution of skills
Nothing to change: server-wall §5 837-0f and §6 already named both traps met here.

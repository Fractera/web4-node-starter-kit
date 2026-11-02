// СБОРКА ЯДРА ПО КНОПКЕ «РАЗВЕРНУТЬ» (узел, шаг 555). Запускает дверь `POST /api/node/deploy { core: true }` через
// `scripts/spawn-free.mjs` — вне дерева процессов ядра: `serve:rebuild` закрывает крышку и останавливает само ядро, а этот процесс
// должен дожить до конца и записать итог.
//
// 🎯 Владелец 2026-10-21: «чтобы выполнить сборку перейди туда туда нажми кнопку развернуть? И тогда нажатие эту кнопки автоматически
// приводит к подсказке проверьте какие терминалы сейчас открыты … после этого вы выполните развёртывания».
// Ход — в `logs/core-deploy.log`, итог — в `data/node/core-deploy.json` (`running` → `done` | `failed`, код выхода). Страница ядра,
// поднявшись после сборки, читает итог дверью развёртываний.
// 🛑 Окружение очищается: родитель — сервер Next ядра, и метка `__NEXT_PROCESSED_ENV` заставила бы сборку не читать свой `.env.local`
// (ANTI-PATTERNS, «Процесс, запущенный из сервера Next…»).
import { spawn } from "node:child_process"
import { mkdirSync, openSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"

const ROOT = process.cwd()
const STATE = join(ROOT, "data", "node", "core-deploy.json")
const LOG = join(ROOT, "logs", "core-deploy.log")
const startedAt = new Date().toISOString()
const write = (s) => { mkdirSync(dirname(STATE), { recursive: true }); writeFileSync(STATE, JSON.stringify({ ...s, pid: process.pid, startedAt }, null, 2)) }

const env = { ...process.env }
for (const k of Object.keys(env)) if (/^(__NEXT|NEXT_|AGI_|WEB4_COMMIT)/.test(k) || ["PORT", "HOSTNAME", "NODE_ENV"].includes(k)) delete env[k]

mkdirSync(dirname(LOG), { recursive: true })
write({ state: "running" })
const out = openSync(LOG, "w")
const child = spawn(process.execPath, [join(ROOT, "scripts", "serve.mjs"), "rebuild"], { cwd: ROOT, env, stdio: ["ignore", out, out], windowsHide: true })
child.on("exit", (code) => write({ state: code === 0 ? "done" : "failed", rc: code, finishedAt: new Date().toISOString() }))
child.on("error", (e) => write({ state: "failed", rc: null, error: String(e), finishedAt: new Date().toISOString() }))

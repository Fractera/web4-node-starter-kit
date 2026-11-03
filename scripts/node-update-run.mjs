// ЗАПУСК ОБНОВЛЕНИЯ УЗЛА ПО КНОПКЕ (узел, шаг 632-4): дверь `POST /api/node/update { action: "update" }` запускает этот файл через
// `scripts/spawn-free.mjs` — вне дерева процессов ядра; он пишет ход `scripts/node-update.mjs` в `logs/node-update.log` (у отсоединённого
// процесса вывода нет — тот же приём, что `scripts/core-deploy.mjs`) и ждёт его до конца: итог пишет сам `node-update.mjs`.
import { spawn } from 'node:child_process'
import { mkdirSync, openSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = process.cwd()
mkdirSync(join(ROOT, 'logs'), { recursive: true })
const out = openSync(join(ROOT, 'logs', 'node-update.log'), 'w')
const child = spawn(process.execPath, [join(ROOT, 'scripts', 'node-update.mjs')], { cwd: ROOT, stdio: ['ignore', out, out], windowsHide: true })
child.on('exit', (code) => process.exit(code ?? 1))
child.on('error', () => process.exit(1))

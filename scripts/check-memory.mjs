// ХВАТИТ ЛИ ЭТОМУ КОМПЬЮТЕРУ ПАМЯТИ ДЛЯ УЗЛА (узел, шаг 663-7). Шаг 1 `npm run launch`, сразу после `check-local`.
// `node scripts/check-memory.mjs [--memory-ok] [--total <МБ>] [--free <МБ>]` — `--total`/`--free` только для прибора.
//
// 🎯 Владелец 2026-11-06: «… компьютер у которого 4 ГБ оперативной памяти прямо на таком компьютере лучше даже не начинать установку …
// На компьютере у которого есть шесть или 8 ГБ нужно предупредить что для работы архитектуры придётся жёстко ограничить использование
// любых других приложений одновременно. Придётся закрыть браузер и другие активные процессы. Если это сделать невозможно то лучше
// прервать установку. На архитектуре 16 ГБ также в начале установки следует проверить достаточно ли свободный оперативной памяти и если её
// меньше 3 ГБ то порекомендовать в процессе установки ограничить или прекратить использование избыточных приложений.»
// Замер на его Mac 16 ГБ: узел держит ~2 ГБ в 28 процессах (до общего сторожа 663-6), первая сборка — больше.
//
// Выход: 0 — можно ставить (возможно, с предупреждением строкой `===PROGRESS===`); 1 — отказ (`launch` печатает `===LAUNCH_FAILED===`);
// 2 — нужен ответ человека (`===LAUNCH_ASK===`): агент установки передаёт слова и ждёт одного слова — «готово» → `npm run launch --
// --memory-ok`, «невозможно» → остановиться.
import os from 'node:os'
import { createRequire } from 'node:module'
import { progress } from './progress.mjs'
const require = createRequire(import.meta.url)
const { availableMb, LIMITS } = require('../lib/free-memory.cjs')

const args = process.argv.slice(2)
const opt = (k) => (args.includes(k) ? Number(args[args.indexOf(k) + 1]) : null)
const totalMb = opt('--total') ?? Math.floor(os.totalmem() / 1048576)
const freeMb = opt('--free') ?? availableMb()
const gb = (mb) => (mb / 1024).toFixed(1).replace(/\.0$/, '')
const гб = (mb) => gb(mb).replace('.', ',') // русская десятичная запятая

if (totalMb < LIMITS.installRefuseMb) {
  console.log(`На этом компьютере ${гб(totalMb)} ГБ оперативной памяти — узлу Fractera этого мало, установку лучше не начинать.`)
  console.log('Нужен компьютер или сервер (VPS) от 8 ГБ памяти; на 16 ГБ узел работает свободно.')
  console.log(`This computer has ${gb(totalMb)} GB of memory — too little for a Fractera node; better not to start. A computer or a VPS with 8 GB or more is needed; 16 GB runs it freely.`)
  console.log(`===MEMORY_FAILED=== total ${totalMb} MB < ${LIMITS.installRefuseMb} MB`)
  process.exit(1)
}

if (totalMb < LIMITS.installAskMb && !args.includes('--memory-ok')) {
  console.log(`На этом компьютере ${гб(totalMb)} ГБ памяти (свободно ${гб(freeMb)} ГБ). Узел будет работать, но только если жёстко ограничить другие`)
  console.log('приложения: на время установки и работы узла закройте браузер и другие активные программы. Если это невозможно — установку лучше прервать.')
  console.log(`This computer has ${gb(totalMb)} GB of memory (${gb(freeMb)} GB free). The node will run only if other apps are strictly limited: close the browser and other active programs for the install and while the node works. If that is impossible, better stop the install.`)
  console.log('Ответ человека: «готово» → npm run launch -- --memory-ok · «невозможно» → остановиться. Answer: ready → npm run launch -- --memory-ok · impossible → stop.')
  console.log(`===LAUNCH_ASK=== memory ${totalMb} MB < ${LIMITS.installAskMb} MB: close the browser and other apps, or stop`)
  process.exit(2)
}

if (totalMb >= LIMITS.installAskMb && freeMb < LIMITS.installFreeWarnMb) {
  progress('local', `⚠ свободно ${гб(freeMb)} ГБ памяти из ${гб(totalMb)} — на время установки закройте лишние приложения · ${gb(freeMb)} GB free of ${gb(totalMb)} — close needless apps during the install`)
  console.log(`⚠ свободно ${гб(freeMb)} ГБ из ${гб(totalMb)} — на время установки ограничьте или закройте лишние приложения (браузер, редакторы, видео).`)
}
console.log(`===MEMORY_OK=== total ${totalMb} MB, free ${freeMb} MB`)

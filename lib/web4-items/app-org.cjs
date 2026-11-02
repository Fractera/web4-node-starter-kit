// ОРГАНИЗАЦИЯ-ПРИЛОЖЕНИЕ ПРИ РОЖДЕНИИ ЭЛЕМЕНТА НА ЗАВОДЕ (узел, шаг 554-1). Владелец 2026-10-22: «Когда создается новый элемент в
// случае если переключатель находится в состоянии завод приложений у нас создается для авторизации новой организации». Скрипт рождения —
// отдельный процесс: зовёт дверь ядра `POST /api/node/users/apps` по петле (хозяин за клавиатурой проходит ворота), ядро — дверь
// элемента входа ключом архитектора. Ошибка не роняет рождение: строка в выводе говорит, создана ли организация, и как создать её снова.
const fs = require('node:fs')
const path = require('node:path')

async function ensureAppOrg(element, root = process.cwd()) {
  let port = 24680
  try { port = JSON.parse(fs.readFileSync(path.join(root, 'logs', 'runtime.json'), 'utf8')).port ?? port } catch { /* порт по умолчанию */ }
  try {
    const r = await fetch(`http://localhost:${port}/api/node/users/apps`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ element }),
      signal: AbortSignal.timeout(30_000),
    })
    const b = await r.json().catch(() => ({}))
    return r.ok && b.ok ? { ok: true, org: b.organization } : { ok: false, reason: b.error ?? String(r.status) }
  } catch (e) {
    return { ok: false, reason: e instanceof Error ? e.message : String(e) }
  }
}

module.exports = { ensureAppOrg }

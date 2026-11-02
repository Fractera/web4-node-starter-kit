// КАТАЛОГ «ВСЕ ПРОЕКТЫ» — ЗОВ ИЗ СКРИПТА УЗЛА (553-5). Скрипты рождения, «Принять», «Развернуть» и установки — отдельные процессы:
// каталог считает сервер ядра (`POST /api/node/catalog`, хозяин за клавиатурой проходит ворота по петле). Ошибки молчат — действие
// человека уже сделано; строка в вывод скрипта говорит, ушёл ли каталог.
const fs = require('node:fs')
const path = require('node:path')

// `waitPort` — порт элемента, который только что перезапущен: каталог берёт только ответившие главные, поэтому сначала ждём его
// `/api/health` (до 60 с), иначе свежий элемент выпал бы из списка.
async function notifyCatalog(reason, root = process.cwd(), { waitPort = null } = {}) {
  if (waitPort) {
    for (let i = 0; i < 30; i++) {
      try { if ((await fetch(`http://127.0.0.1:${waitPort}/api/health`, { signal: AbortSignal.timeout(3000) })).ok) break } catch { /* ещё стартует */ }
      await new Promise((r) => setTimeout(r, 2000))
    }
  }
  let port = 24680
  try { port = JSON.parse(fs.readFileSync(path.join(root, 'logs', 'runtime.json'), 'utf8')).port ?? port } catch { /* ядро ещё не писало — порт по умолчанию */ }
  try {
    const r = await fetch(`http://localhost:${port}/api/node/catalog`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ reason }),
      signal: AbortSignal.timeout(60_000),
    })
    const b = await r.json().catch(() => ({}))
    console.log(b.ok ? `  каталог «Все проекты» обновлён (${reason}): ${b.en ?? '?'} en, ${b.ru ?? '?'} ru` : `  каталог «Все проекты» не обновлён (${reason}): ${b.reason ?? r.status}`)
    return b
  } catch (e) {
    console.log(`  каталог «Все проекты» не обновлён (${reason}): ядро не ответило — npm run catalog:refresh`)
    return { ok: false, reason: e instanceof Error ? e.message : String(e) }
  }
}

module.exports = { notifyCatalog }

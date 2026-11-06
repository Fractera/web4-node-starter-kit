// КАТАЛОГ «ВСЕ ПРОЕКТЫ» — ЗОВ ИЗ СКРИПТА УЗЛА (553-5). Скрипты рождения, «Принять», «Развернуть» и установки — отдельные процессы:
// каталог считает сервер ядра (`POST /api/node/catalog`, хозяин за клавиатурой проходит ворота по петле). Ошибки молчат — действие
// человека уже сделано; строка в вывод скрипта говорит, ушёл ли каталог.
const fs = require('node:fs')
const path = require('node:path')

// `waitPort` — порт элемента, который только что перезапущен: каталог берёт только ответившие главные, поэтому сначала ждём его
// `/api/health` (до 60 с), иначе свежий элемент выпал бы из списка.
// 662-1: `waitAll` — после установки узла: ждать `/api/health` каждого включённого элемента реестра (до 120 с на всех), чтобы сигнал ядра
// (`/api/settings/changed`) застал их живыми. ✗ Замерено на узле владельца 2026-11-06: каталог уходил, пока часть элементов
// перезапускалась, и до них не доходил.
async function waitAllUp(root) {
  let ports = []
  try {
    const reg = JSON.parse(fs.readFileSync(path.join(root, 'WEB4-ITEMS-REGISTRY', 'web4-items.json'), 'utf8'))
    const list = Array.isArray(reg) ? reg : reg.items ?? reg.services ?? []
    const power = require('./element-power.cjs')
    ports = list.filter((e) => e && typeof e.port === 'number' && !power.offOf(e)).map((e) => e.port)
  } catch { return }
  const until = Date.now() + 120_000
  let left = ports
  while (left.length && Date.now() < until) {
    const up = await Promise.all(left.map(async (p) => { try { return (await fetch(`http://127.0.0.1:${p}/api/health`, { signal: AbortSignal.timeout(3000) })).ok } catch { return false } }))
    left = left.filter((_, i) => !up[i])
    if (left.length) await new Promise((r) => setTimeout(r, 2000))
  }
  if (left.length) console.log(`  не ответили за 120 с (порты ${left.join(', ')}) — их карточки всё равно в каталоге, копию они возьмут при своём старте`)
}

async function notifyCatalog(reason, root = process.cwd(), { waitPort = null, waitAll = false } = {}) {
  if (waitAll) await waitAllUp(root)
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

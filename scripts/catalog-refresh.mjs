// КАТАЛОГ «ВСЕ ПРОЕКТЫ» — РУЧНОЙ ПЕРЕСЧЁТ (553-5). Запуск из корня узла: `npm run catalog:refresh`.
// Ядро считает карточки главных страниц работающих элементов и кладёт их в CONFIG; элементы, подключённые к CONFIG, перерисуют вкладку.
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { notifyCatalog } = require('../lib/web4-items/catalog-notify.cjs')

const r = await notifyCatalog('manual')
if (r?.ok) {
  console.log(`version ${r.version}; signalled: ${(r.notified ?? []).map((n) => `${n.who ?? n.url}:${n.ok ? 'ok' : n.status || n.reason}`).join(' ')}`)
  console.log('===CATALOG_OK===')
} else {
  console.log(`CATALOG_FAILED: ${r?.reason ?? 'unknown'}`)
  process.exit(1)
}

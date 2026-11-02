import "server-only"
import { serviceUrl } from "@/lib/microservices/registry"
import { catalogEntries } from "@/lib/web4-items/dashboard-rows"

// КАТАЛОГ «ВСЕ ПРОЕКТЫ» → CONFIG (узел, шаг 553). Ядро считает карточки главных страниц элементов и кладёт их в элемент config
// дверью `PUT /api/settings/catalog` ключом узла; config шлёт подписчикам сигнал, и каждый элемент, подключённый к CONFIG,
// перерисовывает вкладку из своей копии.
// 🔒 ТОЛЬКО ПО ДЕЙСТВИЮ ЧЕЛОВЕКА (закон 2026-09-25 «незаказанное поведение»): рождение, удаление, адрес, свой домен, описание,
// «Принять», «Развернуть», установка узла и ручная команда `npm run catalog:refresh`. Таймеров и опроса нет.
// Ошибку не бросает: тот, кто зовёт после своего действия, не должен падать из-за каталога.

export type CatalogPush = { ok: boolean; version?: string; notified?: unknown[]; reason?: string; en?: number; ru?: number }

export async function refreshCatalog(reason: string): Promise<CatalogPush> {
  const base = serviceUrl("config")
  const key = process.env.SETTINGS_SECRET?.trim()
  if (!base) return { ok: false, reason: "no-config" }
  if (!key) return { ok: false, reason: "no-key" }
  try {
    const [en, ru] = await Promise.all([catalogEntries("en"), catalogEntries("ru")])
    const r = await fetch(`${base}/api/settings/catalog`, {
      method: "PUT",
      headers: { "content-type": "application/json", "x-settings-key": key },
      body: JSON.stringify({ byLang: { en, ru } }),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    })
    const b = (await r.json().catch(() => ({}))) as { ok?: boolean; version?: string; notified?: unknown[]; reason?: string }
    const out: CatalogPush = r.ok && b.ok ? { ok: true, version: b.version, notified: b.notified, en: en.length, ru: ru.length } : { ok: false, reason: b.reason ?? `http-${r.status}` }
    console.log(`[catalog] ${reason}: ${en.length} en, ${ru.length} ru → ${out.ok ? `принят, версия ${out.version}` : `отказ (${out.reason})`}`)
    return out
  } catch (e) {
    const why = e instanceof Error ? e.message : String(e)
    console.warn(`[catalog] ${reason}: не отправлен — ${why}`)
    return { ok: false, reason: why }
  }
}

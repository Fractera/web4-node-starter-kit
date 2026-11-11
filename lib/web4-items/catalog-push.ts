import "server-only"
import { serviceUrl, listServices } from "@/lib/microservices/registry"
import power from "@/lib/web4-items/element-power.cjs"
import { catalogEntries } from "@/lib/web4-items/dashboard-rows"

// КАТАЛОГ «ВСЕ ПРОЕКТЫ» → CONFIG (узел, шаг 553). Ядро считает карточки главных страниц элементов и кладёт их в элемент config
// дверью `PUT /api/settings/catalog` ключом узла; config шлёт подписчикам сигнал, и каждый элемент, подключённый к CONFIG,
// перерисовывает вкладку из своей копии.
// 🔒 ТОЛЬКО ПО ДЕЙСТВИЮ ЧЕЛОВЕКА (закон 2026-09-25 «незаказанное поведение»): рождение, удаление, адрес, свой домен, описание,
// «Принять», «Развернуть», установка узла и ручная команда `npm run catalog:refresh`. Таймеров и опроса нет.
// Ошибку не бросает: тот, кто зовёт после своего действия, не должен падать из-за каталога.

export type CatalogPush = { ok: boolean; version?: string; notified?: unknown[]; reason?: string; en?: number; ru?: number; signalled?: string[] }

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
    if (out.ok) out.signalled = await signalTheRest(key, out.version ?? "", b.notified)
    console.log(`[catalog] ${reason}: ${en.length} en, ${ru.length} ru → ${out.ok ? `принят, версия ${out.version}${out.signalled?.length ? `; сигнал ядра: ${out.signalled.join(", ")}` : ""}` : `отказ (${out.reason})`}`)
    return out
  } catch (e) {
    const why = e instanceof Error ? e.message : String(e)
    console.warn(`[catalog] ${reason}: не отправлен — ${why}`)
    return { ok: false, reason: why }
  }
}

// 662-1: CONFIG шлёт сигнал только своим подписчикам. ✗ Замерено на узле владельца 2026-11-06: root, design, graph, cache, memory и
// stripe в списке не было (стартовали, пока CONFIG перезапускался, а повторов подписки нет), sections стоял на пробном порту 25679 —
// каталог до них не доходил. Ядро после принятого каталога зовёт ту же дверь `/api/settings/changed` у каждого включённого элемента
// реестра, которого CONFIG не достал; элемент забирает копию, перерисовывает страницы и подписывается снова. Только по действию
// человека — там же, где сам каталог.
async function signalTheRest(key: string, version: string, notified: unknown): Promise<string[]> {
  const reached = new Set(
    (Array.isArray(notified) ? notified : [])
      .filter((n): n is { who?: string; url?: string; ok?: boolean } => typeof n === "object" && n !== null && (n as { ok?: boolean }).ok === true)
      .map((n) => n.url ?? ""),
  )
  const jobs = listServices()
    .filter((s) => typeof s.port === "number" && !power.offOf(s))
    .map(async (s) => {
      const url = `http://127.0.0.1:${s.port}/api/settings/changed`
      if (reached.has(url)) return null
      try {
        const r = await fetch(url, {
          method: "POST",
          headers: { "content-type": "application/json", "x-settings-key": key },
          body: JSON.stringify({ version }),
          cache: "no-store",
          signal: AbortSignal.timeout(15_000),
        })
        return r.ok ? s.id : `${s.id} (${r.status})`
      } catch {
        return `${s.id} (молчит)`
      }
    })
  return (await Promise.all(jobs)).filter((x): x is string => x !== null)
}

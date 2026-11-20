import "server-only"

import { serviceUrl } from "@/lib/microservices/registry"
import { keyFor } from "@/lib/node/element-call-key.cjs"

// ВЫЗОВ ДВЕРИ НАСТРОЕК ЭЛЕМЕНТА ИЗ ЯДРА (280-6; узел, шаг 712-2 — пульт вкладок «Дизайн» и «Настройки сайта»).
// 🔒 ЯДРО НЕ ХРАНИТ НАСТРОЙКИ ЭЛЕМЕНТА — ОНО ДОТЯГИВАЕТСЯ ДО НИХ (закон направления потока, слово владельца 2026-09-23). Двери элемента
// `/api/settings/*` стерегут себя его `SETTINGS_SECRET`; адрес элемента — его порт из реестра узла (`serviceUrl`), только петля 127.0.0.1.
// 🔒 818-7b (817 H6): у кастомного элемента там его СОБСТВЕННЫЙ ключ, у нативного — ключ узла; ядро несёт каждому его ключ
// (`lib/node/element-call-key.cjs`), ключ узла кастомному элементу не уходит никогда. Ключ живёт только на сервере ядра.

export type ElementAnswer =
  | { status: number; body: Record<string, unknown> | null }
  | { unavailable: "no-element" | "no-settings-key" | "not-answering" }

/** Позвать дверь элемента его ключом; ответ — код и тело, или почему позвать не вышло. */
export async function callElementDoor(id: string, door: string, init: RequestInit = {}): Promise<ElementAnswer> {
  const base = serviceUrl(id)
  if (!base) return { unavailable: "no-element" }
  const key = keyFor(id)
  if (!key) return { unavailable: "no-settings-key" }
  try {
    const r = await fetch(`${base}${door}`, {
      ...init,
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
      headers: { ...(init.headers ?? {}), "x-settings-key": key, "content-type": "application/json" },
    })
    const body = (await r.json().catch(() => null)) as Record<string, unknown> | null
    return { status: r.status, body }
  } catch {
    return { unavailable: "not-answering" }
  }
}

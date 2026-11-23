import "server-only"

import { serviceUrl } from "@/lib/microservices/registry"
import { keyFor } from "@/lib/node/element-call-key.cjs"
import settingsSchema from "@/lib/web4-items/element-settings-schema.cjs"

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

/** Ответ элемента, который не стал значениями, — причина словом. */
export function stateOf(a: ElementAnswer): { ok: false; reason: string } | null {
  if ("unavailable" in a) return { ok: false, reason: a.unavailable }
  if (a.status === 404) return { ok: false, reason: "template-older" }
  if (a.status === 401) return { ok: false, reason: "bad-key" }
  if (a.status === 409) return { ok: false, reason: String(a.body?.reason ?? "config-connected") }
  if (a.status !== 200 || a.body?.ok !== true) return { ok: false, reason: String(a.body?.reason ?? `element-${a.status}`) }
  return null
}

export type PatchResult =
  | { ok: true; config: Record<string, unknown>; pruned?: true }
  | { ok: false; reason: string; status: number; key?: unknown }

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v)

/**
 * Записать заплату в файл настроек элемента (712-4; 844 — та же запись для двери значков).
 * 🔒 ОТСЕЧЕНИЕ ЗДЕСЬ, НА СЕРВЕРЕ ЯДРА: сначала объявление элемента, в файл — только объявленные пути верного типа (`prunePatch`); пустая
 * после отсечения заплата не уходит.
 */
export async function patchElementSettings(id: string, door: string, patch: Record<string, unknown>): Promise<PatchResult> {
  const read = await callElementDoor(id, door)
  const bad = stateOf(read)
  if (bad) return { ...bad, status: 200 }
  const current = (read as { body: Record<string, unknown> }).body
  if (!isObj(current.schema)) return { ok: false, reason: "template-older", status: 200 }
  const pruned = settingsSchema.prunePatch(patch, settingsSchema.declaredFields(current.schema))
  if (!pruned) return { ok: true, config: isObj(current.config) ? current.config : {}, pruned: true }
  const a = await callElementDoor(id, door, { method: "PATCH", body: JSON.stringify(pruned) })
  const refused = stateOf(a)
  if (refused) {
    const status = "status" in a && [400, 409].includes(a.status) ? a.status : 200
    return { ...refused, status, ...("status" in a && a.body?.key ? { key: a.body.key } : {}) }
  }
  const answer = (a as { body: Record<string, unknown> }).body
  return { ok: true, config: isObj(answer.config) ? answer.config : {} }
}

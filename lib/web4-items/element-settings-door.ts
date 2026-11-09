import "server-only"
import { readFileSync } from "node:fs"
import { join } from "node:path"

import { serviceUrl } from "@/lib/microservices/registry"

// ВЫЗОВ ДВЕРИ НАСТРОЕК ЭЛЕМЕНТА ИЗ ЯДРА (280-6; узел, шаг 712-2 — пульт вкладок «Дизайн» и «Настройки сайта»).
// 🔒 ЯДРО НЕ ХРАНИТ НАСТРОЙКИ ЭЛЕМЕНТА — ОНО ДОТЯГИВАЕТСЯ ДО НИХ (закон направления потока, слово владельца 2026-09-23). Двери элемента
// `/api/settings/*` стерегут себя ключом `SETTINGS_SECRET`, который установщик кладёт в оба конца; ключ живёт только на сервере ядра и
// никогда не уходит в браузер. Адрес элемента — его порт из реестра узла (`serviceUrl`), только петля 127.0.0.1.

/** Ключ двери элемента — из окружения узла, куда его положил установщик. */
export function settingsKey(): string {
  const fromEnv = process.env.SETTINGS_SECRET?.trim()
  if (fromEnv) return fromEnv
  try {
    const m = readFileSync(join(process.cwd(), ".env.local"), "utf8").match(/^SETTINGS_SECRET=(.*)$/m)
    return m ? m[1].trim() : ""
  } catch {
    return ""
  }
}

export type ElementAnswer =
  | { status: number; body: Record<string, unknown> | null }
  | { unavailable: "no-element" | "no-settings-key" | "not-answering" }

/** Позвать дверь элемента с ключом узла; ответ — код и тело, или почему позвать не вышло. */
export async function callElementDoor(id: string, door: string, init: RequestInit = {}): Promise<ElementAnswer> {
  const base = serviceUrl(id)
  if (!base) return { unavailable: "no-element" }
  const key = settingsKey()
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

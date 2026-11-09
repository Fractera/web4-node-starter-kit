"use client"

import { useCallback, useEffect, useState } from "react"
import { isLoopbackHostname } from "@/lib/auth/owner-at-machine"
import { DOOR, type ActResult, type DesignState } from "./types"

// СОСТОЯНИЕ ДИЗАЙНА ЭЛЕМЕНТА ИЗ ДВЕРИ 711 — ОДНО НА ВСЮ ВКЛАДКУ (узел, шаг 713-1). Путь шагов, навыки, пробы и закрепление читают его
// отсюда, а не каждый своё. Таймеров нет: состояние спрашивается при открытии, при смене шага, кнопкой «Обновить» и после действия.
export function useDesignState(item: string, port: number | null, publicUrl: string | null) {
  const [state, setState] = useState<DesignState | null>(null)
  const [error, setError] = useState("")
  const [base, setBase] = useState<string | null>(null)
  const load = useCallback(async () => {
    const j = await fetch(`${DOOR}?item=${encodeURIComponent(item)}`, { cache: "no-store" }).then((r) => r.json()).catch(() => null)
    if (j?.ok) { setState(j as DesignState); setError("") } else setError(String(j?.error ?? "network"))
  }, [item])
  useEffect(() => { void load() }, [load])
  // A trial page lives on the element itself: on this computer — its port, on an own domain — its address (chosen by the browser).
  useEffect(() => {
    const local = isLoopbackHostname(window.location.hostname)
    setBase((local && port ? `http://127.0.0.1:${port}` : publicUrl)?.replace(/\/+$/, "") ?? null)
  }, [port, publicUrl])
  const act = useCallback(async (payload: Record<string, unknown>): Promise<ActResult> => {
    const j = (await fetch(DOOR, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ item, ...payload }) })
      .then((r) => r.json())
      .catch(() => null)) as ActResult | null
    if (j?.ok) setState(j)
    return j ?? { ok: false, error: "network" }
  }, [item])
  return { state, error, base, load, act }
}

export type DesignApi = ReturnType<typeof useDesignState>

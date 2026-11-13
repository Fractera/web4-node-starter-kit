"use client"
// @local — where the project is hosted, as the node detects it (read-only since 737-18)

import { useEffect, useState } from "react"
import { Small } from "@/components/ui/typography"
import type { NodePlaceWords } from "@/components/node-state/node-place.i18n"

// ГДЕ СТОИТ УЗЕЛ — ПОКАЗ, НЕ ВЫБОР (737-18; был экраном объявления 276-3). Владелец 2026-11-13: «до сих пор у нас существует вкладка
// где мы все это переключали руками. Больше этого быть не должно». Островок спрашивает узел (`/api/node/place`) и называет, как узел
// это знает — запись переезда или замер машины (`lib/hosting/place.mjs`). Кнопок нет: дверь отказывает объявлению (410).

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

type Kind = "home" | "server" | "unknown"
type Answer = { ok?: boolean; place?: { kind?: Kind; detail?: string } }

export function NodePlace({ words }: { lang?: string; words: NodePlaceWords }) {
  const [answer, setAnswer] = useState<Answer["place"] | null>(null)
  const [silent, setSilent] = useState(false)

  useEffect(() => {
    let alive = true
    fetch(`${BASE}/api/node/place`, { cache: "no-store" })
      .then((r) => (r.ok ? (r.json() as Promise<Answer>) : Promise.reject(new Error(String(r.status)))))
      .then((a) => { if (alive) setAnswer(a.place ?? {}) })
      .catch(() => alive && setSilent(true))
    return () => { alive = false }
  }, [])

  if (silent) return <p className="my-6 text-foreground text-sm" data-block="node-place-silent">{words.doorSilent}</p>
  if (!answer) return <p className="my-6 text-muted-foreground text-sm" data-block="node-place-loading">{words.loading}</p>
  const kind = answer.kind ?? "unknown"
  const how = String(answer.detail ?? "").split(" ")[0] as keyof NodePlaceWords["how"]
  return (
    <div className="my-6 flex flex-col gap-2" data-block="node-place" data-node-place={kind}>
      <p className="font-medium text-foreground text-sm">{words.title}</p>
      <p className="text-foreground text-sm">{kind === "home" ? words.currentHome : kind === "server" ? words.currentServer : words.currentUnknown}</p>
      {words.how[how] ? <Small className="text-muted-foreground">{words.how[how]}</Small> : null}
      <Small className="text-muted-foreground">{words.note}</Small>
    </div>
  )
}

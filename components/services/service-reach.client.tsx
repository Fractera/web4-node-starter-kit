"use client"

import { useCallback, useEffect, useState } from "react"
import { StarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Small } from "@/components/ui/typography"
import type { ServicePortWords } from "@/components/services/service-port.i18n"

// АДРЕС СЛУЖБЫ В ИНТЕРНЕТЕ — секция главной вкладки службы (шаг 289-3, готовое решение «Адрес службы»).
//
// Слово владельца 2026-09-24: «что стал бы делать пользователь если бы он с этим столкнулся? Где интуитивно он стал
// искать бы решение проблемы? … здесь нужна кнопка проверить подключение». Здесь: режим узла (Cloudflare или только
// эта машина), адрес ссылкой, его состояние и две кнопки — «Проверить подключение» и, если имени нет, «Подключить».
// Всё спрашивается у двери ядра `/api/node/reach` при заходе: адрес — факт машины, а страница предрендерена (264).
// 749-3 (владелец 2026-11-15, aifa.dev: «нереальный адрес … адрес Local хост и ошибочную надпись узел работает на этой машине своего
// Домина у него нет. Что за бред?»): третий режим — «server». Домен держит nginx выделенного сервера: имя ссылкой, «есть ли запись A» и
// ответ из интернета; «Подключить» пишет запись (или называет её для регистратора — строка `add`) и учит nginx имени. Сервер ещё без
// домена — своя фраза, без localhost: на сервере «эта машина» — не машина человека.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

type Reach = {
  ok?: boolean
  mode?: "local" | "cloudflare" | "server"
  /** 749-3: у режима «server» — подключён ли уже домен узла. */
  domain?: boolean
  port?: number | null
  hostname?: string
  url?: string
  dns?: boolean | null
  routed?: boolean | null
  answers?: number | null
  reason?: string
}

type State = { phase: "asking" } | { phase: "denied" } | { phase: "failed" } | { phase: "known"; reach: Reach }
/** 749-3: запись, которую человек добавляет у регистратора, когда у узла нет ключа Cloudflare (`serverReach`). */
type Added = { type: string; name: string; value: string }

export function ServiceReach({ serviceId, words }: { serviceId: string; words: ServicePortWords["reach"] }) {
  const [state, setState] = useState<State>({ phase: "asking" })
  const [connecting, setConnecting] = useState(false)
  const [connectError, setConnectError] = useState<string | null>(null)
  // 2026-10-01 (dhndy): отказ ключа на туннеле — не код ответа, а путь к экрану ключа.
  const [keyProblem, setKeyProblem] = useState(false)
  const [add, setAdd] = useState<Added | null>(null)

  const load = useCallback(() => {
    setState({ phase: "asking" })
    fetch(`${BASE}/api/node/reach?service=${encodeURIComponent(serviceId)}`, { cache: "no-store" })
      .then(async (r) => {
        if (r.status === 401 || r.status === 403) return setState({ phase: "denied" })
        if (!r.ok) return setState({ phase: "failed" })
        setState({ phase: "known", reach: (await r.json()) as Reach })
      })
      .catch(() => setState({ phase: "failed" }))
  }, [serviceId])

  useEffect(() => { load() }, [load])

  const connect = async () => {
    setConnecting(true)
    setConnectError(null)
    setKeyProblem(false)
    try {
      const r = await fetch(`${BASE}/api/node/reach`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ service: serviceId }),
      })
      const body = (await r.json().catch(() => ({}))) as Reach & { server?: boolean; add?: Added }
      // 749-3: узел на выделенном сервере — запись A написана (или названа для регистратора), nginx узнаёт имя, сертификат догонит сам.
      if (body.server) {
        if (!r.ok || !body.ok) setConnectError(words.connectFailed.replace("{reason}", body.reason ?? String(r.status)))
        else { setAdd(body.add ?? null); load() }
        return
      }
      const noTunnel = !body.ok && /not authorized|1001/i.test(body.reason ?? "")
      setKeyProblem(noTunnel)
      if (noTunnel) setConnectError(words.connectNoTunnel)
      else if (!r.ok || !body.ok) setConnectError(words.connectFailed.replace("{reason}", body.reason ?? String(r.status)))
      else {
        setState({ phase: "known", reach: body })
        // 551-6: сразу после записи DNS адрес снаружи ещё не отвечает, и единственный замер оставлял карточку красной до «Проверить».
        // Проверка — продолжение нажатия человека: по факту, не дольше 30 × 3 с, и ничего не остаётся работать после.
        let m = body
        const answering = (x: Reach) => typeof x.answers === "number" && x.answers > 0 && x.answers < 400
        for (let i = 0; i < 30 && !answering(m); i++) {
          await new Promise((res) => setTimeout(res, 3000))
          const g = await fetch(`${BASE}/api/node/reach?service=${encodeURIComponent(serviceId)}`, { cache: "no-store" }).catch(() => null)
          if (g?.ok) { m = (await g.json()) as Reach; setState({ phase: "known", reach: m }) }
        }
      }
    } catch {
      setConnectError(words.connectFailed.replace("{reason}", "network"))
    } finally {
      setConnecting(false)
    }
  }

  // 289-6: карточка в стиле индикатора узла. Адрес отвечает — подсветка и закрашенная звезда; иначе — предупреждение
  // (незакрашенная звезда) и причина словами. Домен — крупно: это главное, что человек ищет на этой вкладке.
  const r = state.phase === "known" ? state.reach : null
  const cloud = r?.mode === "cloudflare"
  const server = r?.mode === "server"
  // 749-3: своё имя в интернете есть у туннеля Cloudflare и у сервера с доменом; его и проверяют.
  const named = cloud || (server && r?.domain !== false)
  const missing = r && named ? [r.dns === false ? words.noDns : null, cloud && r.routed === false ? words.noRoute : null].filter(Boolean) : []
  const live = !!r && named && !r.reason && missing.length === 0 && typeof r.answers === "number" && r.answers > 0 && r.answers < 400
  const big = named ? r?.hostname : !server && r?.port ? `localhost:${r.port}` : null

  let line: React.ReactNode
  if (state.phase === "asking") line = words.asking
  else if (state.phase === "denied") line = words.notAllowed
  else if (state.phase === "failed") line = words.cannotCheck.replace("{reason}", "—")
  else if (server && !named) line = words.serverNoDomain
  else if (!named) line = words.local.replace("{url}", r?.port ? `http://localhost:${r.port}` : "—")
  else if (r?.reason) line = words.cannotCheck.replace("{reason}", r.reason)
  else if (missing.length > 0) line = `${words.notConnected} ${missing.join(", ")}.`
  else if (live) line = words.live
  else line = words.notAnswering.replace("{code}", String(r?.answers ?? "—"))

  return (
    <Card
      size="sm"
      data-service-reach={serviceId}
      data-phase={state.phase}
      data-active={String(live)}
      className={cn(live ? "bg-primary/10 ring-primary/40" : "bg-destructive/10 ring-destructive/40")}
    >
      <CardHeader>
        <CardTitle className="font-semibold">{words.title}</CardTitle>
        <CardAction>
          <StarIcon role="img" aria-hidden className={cn("size-5", live ? "fill-primary text-primary" : "text-destructive")} />
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {big ? (
          named && r?.url ? (
            <a href={r.url} target="_blank" rel="noopener noreferrer" className="font-mono text-2xl font-black tracking-tight break-all text-foreground underline-offset-4 hover:underline md:text-3xl" data-service-reach-url>
              {big}
            </a>
          ) : (
            <p className="font-mono text-2xl font-black tracking-tight break-all text-foreground md:text-3xl">{big}</p>
          )
        ) : null}
        {named ? <p className="text-muted-foreground text-sm">{cloud ? words.cloudflare : words.server}</p> : null}
        <p className={cn("text-sm", live ? "text-foreground" : "text-destructive")} data-service-reach-line>{line}</p>
        {state.phase === "known" && named ? (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={load}>{words.check}</Button>
            {missing.length > 0 && !r?.reason ? (
              <Button size="sm" onClick={connect} disabled={connecting}>{connecting ? words.connecting : words.connect}</Button>
            ) : null}
          </div>
        ) : null}
        {add ? <Small className="text-foreground" data-service-reach-add>{words.addRecord.replace("{type}", add.type).replace("{name}", add.name).replace("{value}", add.value)}</Small> : null}
        {connectError ? <Small className="text-destructive">{connectError}</Small> : null}
        {keyProblem ? (
          <a className="w-fit text-sm underline" href={`${BASE}/${location.pathname.split("/")[1] || "en"}/architect/hosting/domain`} data-reach-key-link>
            {words.connectKeyLink}
          </a>
        ) : null}
      </CardContent>
    </Card>
  )
}

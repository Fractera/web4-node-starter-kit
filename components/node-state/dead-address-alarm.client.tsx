"use client"

import { useEffect, useState } from "react"
import { ExternalLink, Siren } from "lucide-react"
import type { DeadAddressAlarmWords } from "./dead-address-alarm.i18n"
import { isTemporaryHostname } from "@/lib/auth/temporary-address"

// ПОЛОСА «ВРЕМЕННЫЙ АДРЕС УМЕР» НАД СЛОЕМ АРХИТЕКТОРА (узел, шаг 632-5). Владелец 2026-11-03: «Похоже для этого нужно делать баннер,
// который будет предупреждать об этой проблеме и кнопка которую этой проблемы будет решать?» ✗ Замерено в тот же день: адрес был мёртв
// с 2026-11-02 19:05, дозорный записал это в `logs/tunnel.json`, а страницы молчали — `/api/domain/state` отдавал вместо мёртвого
// адреса `null`, и полоса «временный адрес» просто исчезала.
// Источник — `/api/domain/state` (`quickTunnelDead`, `quickTunnelDeadSince`): один запрос при открытии, таймеров нет. Кнопка — дверь
// `POST /api/domain/new-address` (только при мёртвом адресе). Не сворачивается: это поломка, а не справка. Свой домен — полосы нет.
// 651-2 (владелец 2026-11-05: «когда я перешёл по этой ссылке и попал на эту же страницу то снова увидел информацию о том что у нас
// проблема с доменом»): страница, пришедшая по временному адресу, сама доказывает, что быстрый туннель узла жив — мёртвый адрес её
// не отдал бы, а копии страниц живут в Cloudflare Workers, не на trycloudflare. Там полосы нет, как бы ни отстал дозорный.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

type State = { dead: boolean; since: string | null }

export function DeadAddressAlarm({ words, lang }: { words: DeadAddressAlarmWords; lang: string }) {
  const [state, setState] = useState<State | null>(null)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<{ url?: string; error?: string } | null>(null)

  useEffect(() => {
    if (isTemporaryHostname(window.location.hostname)) return
    fetch(`${BASE}/api/domain/state`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { active?: boolean; quickTunnelDead?: boolean; quickTunnelDeadSince?: string | null } | null) =>
        setState(d && !d.active && d.quickTunnelDead ? { dead: true, since: d.quickTunnelDeadSince ?? null } : null),
      )
      .catch(() => setState(null))
  }, [])

  if (!state?.dead) return null
  const since = state.since ? new Date(state.since).toLocaleString(lang === "ru" ? "ru-RU" : "en-GB", { dateStyle: "short", timeStyle: "short" }) : ""

  const raise = async () => {
    setBusy(true)
    setResult(null)
    try {
      const r = await fetch(`${BASE}/api/domain/new-address`, { method: "POST", cache: "no-store" })
      const d = (await r.json().catch(() => ({}))) as { ok?: boolean; url?: string; detail?: string; reason?: string }
      setResult(d.ok && d.url ? { url: d.url } : { error: d.detail ?? d.reason ?? String(r.status) })
    } catch (e) {
      setResult({ error: String(e) })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-4 mt-2 flex flex-wrap items-start gap-x-3 gap-y-1 rounded-md border-2 border-destructive/60 bg-destructive/10 px-3 py-2 text-sm text-foreground" role="alert" data-dead-address>
      <Siren className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
      <div className="flex flex-1 flex-col gap-1">
        <p className="font-medium">{words.lead.replace("{since}", since)}</p>
        <p>{words.body}</p>
        <p className="text-muted-foreground">{words.note}</p>
        {result?.url && (
          <p>
            {words.raised}{" "}
            <a href={result.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 break-all underline">
              {result.url}
              <ExternalLink className="size-3" aria-hidden />
            </a>
          </p>
        )}
        {result?.error && <p className="text-destructive">{words.failed} {result.error}</p>}
      </div>
      <div className="flex flex-col items-start gap-2 self-center">
        {!result?.url && (
          <button type="button" onClick={raise} disabled={busy} className="rounded-md bg-destructive px-3 py-1.5 font-medium text-white disabled:opacity-60" data-dead-address-raise>
            {busy ? words.raising : words.raise}
          </button>
        )}
        <a href={`${BASE}/${lang}/architect/hosting/domain`} className="font-medium underline">
          {words.connect}
        </a>
      </div>
    </div>
  )
}

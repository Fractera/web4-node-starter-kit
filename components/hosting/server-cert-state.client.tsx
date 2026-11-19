"use client"
// @part server-cert-state — the certificate of some names of a server node: «being issued» followed live, or «HTTPS works · valid until <date>», with the names' own list below

import { useCallback, useEffect, useState } from "react"
import { CertsStep, certDate, type CertRow, type CertsRun } from "@/components/hosting/server-domain-certs.client"
import type { ServerDomainWords } from "@/components/hosting/server-domain.i18n"
import { Spinner } from "@/components/ui/spinner"
import { Small } from "@/components/ui/typography"

// 801-2/801-3 (the owner, 2026-11-19: «я смог подключить домен, но открыть его всё равно не могу сразу … нужно, чтобы всплыло какое-то
// уведомление … идёт установка сертификата … должен видеть, когда он устаревает»). One door, the server's own `/api/node/server/domain`
// (the same rows «Сертификаты безопасности» reads); the caller says which names are its own.
// 🔒 THE FOLLOW IS THE OWNER'S ORDER AND HAS AN END: while one of the names waits for its certificate or HTTPS, the part asks the server
// every 5 s, at most 20 minutes; an answered name ends it. No timer otherwise.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
const FOLLOW_MS = 5000
const FOLLOW_MAX = 20 * 60_000

export type CertStateWords = { loading: string; issuing: string; ready: string }

/** Whose names: `hosts` (a domain and its www), `service` (an element's own subdomain), `apex` (the node's root and www).
 *  🔒 DATA, NEVER A FILTER FUNCTION: an inline function in the effect's deps fetched in a loop once (796, ~1 call/s) — the key is a string. */
export type CertOwner = { hosts?: string[]; service?: string | null; apex?: boolean }
const owns = (o: CertOwner, r: CertRow) =>
  (o.hosts ?? []).includes(r.host) || (!!o.service && r.service === o.service) || (!!o.apex && (r.kind === "apex" || r.kind === "www"))

/** `expect` — a name was connected, so «none yet» means «being issued». */
export function ServerCertState({ owner, expect, words, domainWords, list = true }: {
  owner: CertOwner; expect: boolean; words: CertStateWords; domainWords?: ServerDomainWords; list?: boolean
}) {
  const door = `${BASE}/api/node/server/domain`
  const [rows, setRows] = useState<CertRow[] | null>(null)
  const [run, setRun] = useState<CertsRun>(null)
  const [helper, setHelper] = useState(true)
  const [busy, setBusy] = useState(false)
  const key = JSON.stringify([owner.hosts ?? [], owner.service ?? null, !!owner.apex])

  const load = useCallback(async () => {
    const o = JSON.parse(key) as [string[], string | null, boolean]
    try {
      const r = await fetch(door, { cache: "no-store" })
      const a = r.ok ? ((await r.json()) as Record<string, unknown>) : null
      const all = a && a.phase === "live" && Array.isArray(a.rows) ? (a.rows as CertRow[]) : []
      setRows(all.filter((row) => owns({ hosts: o[0], service: o[1], apex: o[2] }, row)))
      setRun((a?.certsRun as CertsRun) ?? null)
      setHelper(a?.helper !== false)
    } catch { setRows([]) }
  }, [door, key])

  useEffect(() => { void load() }, [load])

  const needed = (rows ?? []).filter((r) => !r.optional)
  const waiting = rows !== null && expect && (needed.length === 0 || needed.some((r) => r.cert === "missing" || r.cert === "unknown" || r.https === false))
  useEffect(() => {
    if (!waiting) return
    const started = Date.now()
    const t = setInterval(() => { if (Date.now() - started > FOLLOW_MAX) clearInterval(t); else void load() }, FOLLOW_MS)
    return () => clearInterval(t)
  }, [waiting, load])

  async function act(action: string, extra: Record<string, unknown> = {}) {
    setBusy(true)
    try { await fetch(door, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action, ...extra }) }) } catch { /* the list below says what the server holds */ } finally {
      setBusy(false)
      await load()
    }
  }

  if (rows === null) return <Small className="text-muted-foreground" data-block="server-cert-state-loading">{words.loading}</Small>
  const end = certDate(needed.find((r) => r.notAfter)?.notAfter)
  return (
    <div className="flex flex-col gap-3" data-block="server-cert-state">
      {waiting ? (
        <p className="flex items-center gap-2 text-sm text-warning" data-block="server-cert-state-issuing" role="status">
          <Spinner className="size-4 shrink-0" />
          {words.issuing}
        </p>
      ) : needed.length ? (
        <p className="text-sm text-success" data-block="server-cert-state-ready" role="status">{words.ready.replace("{date}", end || "—")}</p>
      ) : null}
      {list && domainWords && rows.length ? <CertsStep busy={busy} helper={helper} onAct={act} readOnly={false} rows={rows} run={run} words={domainWords} /> : null}
    </div>
  )
}

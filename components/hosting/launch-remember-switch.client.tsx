"use client"
// @local — the switch «Запомнить сервер на 24 часа» of one route («Активация выделенного сервера») and its hook; the memory itself is lib/hosting/launch-remember.mjs

import { useCallback, useEffect, useRef, useState } from "react"
import { Field, FieldContent, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"
import type { ServerLaunchWords } from "@/components/hosting/server-launch.i18n"
import { forgetServer, readServer, rememberOn, saveServer, setRememberOn } from "@/lib/hosting/launch-remember.mjs"

// 760-1 (the owner, 2026-11-16: «сразу под словом запустить сервер сделать switch переключатель … по умолчанию включённым»): a quiet setting
// right under the title, never the focus of the page — the ladder is. Its note says what the page keeps in each state, so «on» never reads
// as «the password is saved»: the password is kept nowhere (the browser's access to the server is its HttpOnly cookie, 744-3).

type Kept = { host: string; port: number; until: string }
type Current = { host: string; port: number; until: string | null } | null

/** This browser's storage, or `null` where the browser refuses it (a private window): then nothing is remembered. */
const store = () => {
  try { return window.localStorage } catch { return null }
}

/** The page's memory of the last server: read once on opening (and handed to `onKept`), kept after a connect, forgotten when the access ends. */
export function useLaunchRemember(onKept: (k: Kept) => void) {
  const [on, setOn] = useState(true)
  const [kept, setKept] = useState<Kept | null>(null)
  const handOver = useRef(onKept)
  useEffect(() => {
    setOn(rememberOn(store()))
    const k = readServer(store()) as Kept | null
    if (k) { setKept(k); handOver.current(k) }
  }, [])
  const keep = useCallback((host: string, port: number, until: string | null) => {
    if (saveServer(store(), { host, port, until })) setKept(readServer(store()) as Kept | null)
  }, [])
  const forget = useCallback(() => { forgetServer(store()); setKept(null) }, [])
  const toggle = useCallback((next: boolean, current: Current) => {
    setRememberOn(store(), next)
    setOn(next)
    if (!next) setKept(null)
    else if (current) keep(current.host, current.port, current.until)
  }, [keep])
  return { on, kept, keep, forget, toggle }
}

export function LaunchRememberSwitch({ on, onChange, words }: { on: boolean; onChange: (on: boolean) => void; words: ServerLaunchWords["remember"] }) {
  return (
    <Field className="max-w-prose" data-block="server-launch-remember" orientation="horizontal">
      <Switch checked={on} id="launch-remember" onCheckedChange={onChange} />
      <FieldContent>
        <FieldLabel htmlFor="launch-remember">{words.label}</FieldLabel>
        <FieldDescription>{on ? words.on : words.off}</FieldDescription>
      </FieldContent>
    </Field>
  )
}

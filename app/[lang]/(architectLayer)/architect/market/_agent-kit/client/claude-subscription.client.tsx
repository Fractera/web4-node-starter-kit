"use client"

import { kitApi, kitSocket } from "./kit-place"
import { type ReactNode, useCallback, useEffect, useRef, useState } from "react"
import { ForbiddenWithExit } from "@/components/node-state/open-on-this-computer.client"
import { ChevronDown, KeyRound, RotateCw, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Spinner } from "@/components/ui/spinner"
import { Ladder, type Rung } from "@/components/hosting/ladder-step"
import { AuthModal } from "./claude-auth-modal.client"
import type { ClaudeSubscriptionWords } from "../words/claude-subscription.i18n"
import { createMouseFilter, MOUSE_OFF } from "./mouse-filter.mjs"
import { extractAuthUrl } from "./terminal-auth.mjs"
import { type XtermHandle, XtermTerminal } from "./xterm-terminal.client"

// ПОДПИСКА CLAUDE CODE: СОСТОЯНИЕ ВХОДА И САМ ВХОД (267-2).
//
// Состояние сперва спрашивается дверью `claude-auth` — без оболочки и процесса; терминал входа рождается только кнопкой.
// 🔒 ССЫЛКУ ИЩЕМ В СЫРОМ ПОТОКЕ (`terminal-auth.mjs`, ждём паузу); 🔒 после кода состояние спрашивается заново, а не объявляется.

// 🔒 ДВЕРИ И СОКЕТ — В МАРШРУТЕ СЛУЖБЫ (271): `/{lang}/architect/<служба>/agent-api/*` и `/pty/<служба>`.

const BUFFER_LIMIT = 8000
const DETECT_DELAY_MS = 300

// 689: `own` — своя папка Claude Code элемента; 833-3: `walledNone` — on a server no account of its own, never the node's login.
type Auth = { loggedIn: boolean | null; email: string | null; plan: string | null; own?: boolean; walledNone?: boolean; canOwn?: boolean }

// 840-3 (the owner, Telegram 905 «да», phrases 8–12): one status line, then ONE ladder (the part of «Активация домена») — «Подписка» (done by
// itself where there is no choice, never an empty number), «Вход в Claude» with the terminal inside, «Разговор с агентом»; «Подробнее» folded.
export function ClaudeSubscription({ service, lang, words, ownable = false, choice = null, next = null }: { service: string; lang: string; words: ClaudeSubscriptionWords; ownable?: boolean; choice?: ReactNode; next?: ReactNode }) {
  const api = kitApi(lang, service)
  const [auth, setAuth] = useState<Auth | "checking" | "forbidden">("checking")
  const [open, setOpen] = useState(false)
  const [authUrl, setAuthUrl] = useState<string | null>(null)
  const termRef = useRef<XtermHandle>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const bufRef = useRef("")
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const modalRef = useRef(false)
  const sizeRef = useRef({ cols: 100, rows: 24 })
  const mouseRef = useRef(createMouseFilter())

  const check = useCallback(async () => {
    setAuth("checking")
    try {
      const res = await fetch(`${api}/claude-auth`, { cache: "no-store" })
      if (res.status === 401 || res.status === 403) return setAuth("forbidden")
      const d = (await res.json()) as Auth
      setAuth({ loggedIn: d.loggedIn ?? null, email: d.email ?? null, plan: d.plan ?? null, own: d.own === true, walledNone: d.walledNone === true, canOwn: d.canOwn === true })
    } catch {
      setAuth({ loggedIn: null, email: null, plan: null })
    }
  }, [api])

  useEffect(() => {
    check()
    // 689: переключатель «чья подписка» (`claude-own-login.client.tsx`) просит проверить вход заново — без таймера, по событию.
    window.addEventListener("claude-own-changed", check)
    return () => window.removeEventListener("claude-own-changed", check)
  }, [check])

  const send = useCallback((payload: unknown) => {
    const ws = wsRef.current
    if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(payload))
  }, [])

  const scan = useCallback(() => {
    if (modalRef.current) return
    const found = extractAuthUrl(bufRef.current)
    if (found) {
      modalRef.current = true
      setAuthUrl(found.url)
    }
  }, [])

  const closeTerminal = useCallback(() => {
    wsRef.current?.close()
    wsRef.current = null
    setOpen(false)
    setAuthUrl(null)
    modalRef.current = false
    bufRef.current = ""
    startingRef.current = false
    setStarting(false)
    check()
  }, [check])

  // 🛑 ОДНО НАЖАТИЕ — ОДИН ВХОД (владелец 2026-09-22: «сразу открывается много вкладок»): ref отсекает повтор мгновенно, `starting` виден.
  const startingRef = useRef(false)
  const [starting, setStarting] = useState(false)

  const startLogin = useCallback(async () => {
    if (startingRef.current || wsRef.current) return
    startingRef.current = true
    setStarting(true)
    let ticket = ""
    let socketUrl: string | null = null
    try {
      const res = await fetch(`${api}/ticket`, { method: "POST" })
      if (res.status === 401 || res.status === 403) {
        startingRef.current = false
        setStarting(false)
        return setAuth("forbidden")
      }
      const issued = (await res.json()) as { ticket?: string; socket?: string }
      ticket = issued.ticket ?? ""
      socketUrl = issued.socket ?? null
    } catch {
      startingRef.current = false
      setStarting(false)
      return
    }
    setOpen(true)
    bufRef.current = ""
    modalRef.current = false
    const ws = new WebSocket(kitSocket(service, socketUrl))
    wsRef.current = ws
    ws.onopen = () => {
      // 🛑 `init` ПЕРВЫМ ДЕЙСТВИЕМ — см. островок терминала.
      ws.send(JSON.stringify({ mode: "login", ticket, type: "init" }))
      ws.send(JSON.stringify({ type: "resize", ...sizeRef.current }))
      mouseRef.current = createMouseFilter()
      termRef.current?.reset()
      termRef.current?.write(MOUSE_OFF)
      termRef.current?.focus()
    }
    ws.onmessage = (event) => {
      const chunk = typeof event.data === "string" ? event.data : new TextDecoder().decode(event.data)
      termRef.current?.write(mouseRef.current(chunk))
      bufRef.current = (bufRef.current + chunk).slice(-BUFFER_LIMIT)
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(scan, DETECT_DELAY_MS)
    }
    // Отказ моста называется в самом терминале, а не оставляет пустой чёрный прямоугольник.
    ws.onclose = (event) => {
      if (wsRef.current === ws) wsRef.current = null
      if (event.reason) termRef.current?.write(`\r\n[${event.reason}]\r\n`)
    }
  }, [api, scan, service])

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); wsRef.current?.close() }, [])

  const handleData = useCallback((data: string) => send({ data, type: "stdin" }), [send])
  const handleResize = useCallback(
    (size: { cols: number; rows: number }) => {
      sizeRef.current = size
      send({ type: "resize", ...size })
    },
    [send],
  )

  if (auth === "forbidden") return <ForbiddenWithExit reason={words.forbidden} why={words.exitWhy} open={words.exitOpen} />

  const state = auth === "checking" ? null : auth
  const on = state?.loggedIn === true
  const unknown = state !== null && state.loggedIn === null
  const own = state?.own === true || state?.walledNone === true
  const terminal = open ? (
    <div data-block="uo9pj" className="flex flex-col gap-2">
      <div data-block="ja4m0" className="flex items-center gap-2">
        <p data-block="l5ooo" className="flex-1 text-muted-foreground text-xs">{words.terminalNote}</p>
        <Button type="button" size="sm" variant="outline" onClick={closeTerminal}>
          <X className="size-4" aria-hidden />
          {words.close}
        </Button>
      </div>
      <div data-block="kukcu" className="h-[45dvh] min-h-[320px] overflow-hidden rounded-lg bg-[#0b0b0c] p-2">
        <XtermTerminal onData={handleData} onResize={handleResize} ref={termRef} />
      </div>
    </div>
  ) : null
  const loginButton = (
    <Button type="button" onClick={startLogin} disabled={starting} aria-busy={starting} variant={on ? "outline" : "default"} data-claude-login>
      {starting ? <Spinner className="size-4" /> : <KeyRound className="size-4" aria-hidden />}
      {starting ? words.starting : on ? words.relogin : words.login}
    </Button>
  )
  const rungs: Rung[] = [
    ...(ownable ? [{
      id: "plan", title: words.stepPlan, done: state !== null, summary: own ? words.ownStep : words.ownNode,
      body: <>{state?.canOwn && choice ? choice : <p data-block="cs840p" className="text-muted-foreground text-sm">{own ? words.ownStep : words.ownNode}</p>}</>,
    }] : []),
    {
      id: "sign-in", title: words.stepSignIn, done: on, error: unknown, summary: words.signedIn,
      body: (
        <>
          <p data-block="cs840s" className="text-muted-foreground text-sm">{on ? words.signedIn : unknown ? words.unknownText : ownable ? words.signInHint : words.offText}</p>
          {!open && !on ? <div data-block="cs840b" className="flex flex-wrap gap-2">{loginButton}</div> : null}
          {terminal}
        </>
      ),
    },
    { id: "talk", title: words.stepTalk, done: false, body: next },
  ]

  return (
    <div data-block="tn46c" className="my-6 flex flex-col gap-3" data-claude-subscription data-state={auth === "checking" ? "checking" : on ? "on" : unknown ? "unknown" : "off"}>
      <div data-block="enet0" className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-4">
        {auth === "checking" ? (
          <p data-block="q9cen" className="text-muted-foreground text-sm">{words.checking}</p>
        ) : (
          <>
            <p data-block="vcyqo" className="flex min-w-0 flex-wrap items-center gap-2 text-sm" data-claude-walled={state?.walledNone ? "none" : undefined}>
              <span data-block="cs840a" className="font-medium text-foreground">{[state?.email, own ? words.accOwn : words.accNode].filter(Boolean).join(" · ")}</span>
              <Badge variant={on ? "default" : "destructive"} data-claude-badge={on ? "on" : "off"}>{on ? words.badgeOn : words.badgeOff}</Badge>
            </p>
            <div data-block="mc8wn" className="flex flex-wrap gap-2">
              {on && !open ? loginButton : null}
              <Button type="button" variant="ghost" onClick={check}>
                <RotateCw className="size-4" aria-hidden />
                {words.recheck}
              </Button>
            </div>
          </>
        )}
      </div>

      {state ? <Ladder id="claude-sub" rungs={rungs} locked={words.lockedTalk} focus={open ? "sign-in" : null} /> : null}

      <Collapsible data-block="cs840m">
        <CollapsibleTrigger className="group flex items-center gap-1 text-muted-foreground text-sm hover:text-foreground">
          {words.more}
          <ChevronDown className="size-4 transition-transform group-data-[state=open]:rotate-180" aria-hidden />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2 text-muted-foreground text-sm">{words.moreText} {own ? words.ownQuota : words.quota}</CollapsibleContent>
      </Collapsible>

      {authUrl && (
        <AuthModal
          url={authUrl}
          words={words}
          onClose={() => {
            modalRef.current = false
            setAuthUrl(null)
            bufRef.current = ""
          }}
          onSend={(code) => {
            send({ data: `${code}\r`, type: "stdin" })
            setTimeout(check, 4000)
          }}
        />
      )}
    </div>
  )
}

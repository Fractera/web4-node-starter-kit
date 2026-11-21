"use client"
// @part action-button — one button rule for a step's actions: main dark, pressed pale with a spinner and its «…» word, secondary outline

import { useState, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

// 831 (the owner, 2026-11-21, Telegram 605–606: «если кнопка кликабельная она тёмно-синие если я её нажимаю она становится голубой и в ней
// появляется индикатор загрузки … на каждом шаге кнопки разного цвета»; «кнопка … включить … тёмно-синие на старте становится голубой с
// текстом включаю… единственное не хватает индикатора загрузки»).
// 🔒 A MAIN BUTTON IS NEVER PALE FOR AN EMPTY FIELD: it stays dark and the press says what is missing (the caller's `onAction` returns
// early and shows the reason under its field). Pale means only «not now»: this press runs (spinner + `pendingText`) or another action of
// the page runs (`disabled`).
// 🔒 THE PRESSED BUTTON KNOWS IT IS PRESSED BY ITS OWN PROMISE: `onAction` returning a promise keeps this button pending until it settles,
// so a page needs no «which action runs» wiring; `pending` from outside — an action that outlives the press (a launch, a certificate run).
export type ActionKind = "main" | "second" | "danger"
const VARIANT = { main: "default", second: "outline", danger: "destructive" } as const

export function ActionButton({ kind = "main", onAction, pending = false, pendingText, disabled = false, size = "sm", type = "button", className, children, ...rest }: {
  kind?: ActionKind
  onAction?: () => unknown
  /** an action this button started that is still running outside its press */
  pending?: boolean
  /** the word while it runs — «Подключаю…»; none — the button's own label stays */
  pendingText?: ReactNode
  /** another action of the page runs — not now */
  disabled?: boolean
  size?: "sm" | "default"
  type?: "button" | "submit"
  className?: string
  children: ReactNode
  "data-block"?: string
}) {
  const [running, setRunning] = useState(false)
  const busy = pending || running
  async function press() {
    if (busy || disabled || !onAction) return
    const r = onAction()
    if (!(r instanceof Promise)) return
    setRunning(true)
    try { await r } finally { setRunning(false) }
  }
  return (
    <Button
      aria-busy={busy || undefined}
      className={className}
      data-action-kind={kind}
      data-pending={busy ? "" : undefined}
      disabled={busy || disabled}
      onClick={type === "submit" ? undefined : () => void press()}
      size={size}
      type={type}
      variant={VARIANT[kind]}
      {...rest}
    >
      {busy ? <Spinner className="size-4" /> : null}
      {busy && pendingText ? pendingText : children}
    </Button>
  )
}

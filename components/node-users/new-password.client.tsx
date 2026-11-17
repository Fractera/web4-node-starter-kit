"use client"
// @local — the row «Новый пароль» of the user window (778-3): a masked field, «Сохранить», the confirmation in the same row

import { useState } from "react"
import { toast } from "sonner"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"

// НОВЫЙ ПАРОЛЬ (узел, шаг 778-3). Карточка решения, «1 да» владельца 2026-11-17: «строка «Новый пароль» — поле со «Показать»,
// «Сохранить» и подтверждение в том же окне». Окно поверх окна не открывается (закон `check-dialogs`): подтверждение встаёт на место
// поля. Дверь ядра `PUT /api/node/users/<id>/password` → элемент входа: только архитектор, свой пароль так не меняется, 8–200 знаков.
// 🔒 Пароль живёт только в этом поле до ответа и стирается сразу после; в ответе двери его нет.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

export type NewPasswordWords = { label: string; save: string; ask: string; confirm: string; cancel: string; done: string; show: string; hide: string; rule: string; failed: string; reasons: Record<string, string> }

export function NewPassword({ userId, who, words }: { userId: string; who: string; words: NewPasswordWords }) {
  const [value, setValue] = useState("")
  const [shown, setShown] = useState(false)
  const [asking, setAsking] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fits = value.length >= 8 && value.length <= 200 && !/[\r\n]/.test(value)
  const field = `nu-password-${userId}`

  async function save() {
    setBusy(true)
    setError(null)
    try {
      const r = await fetch(`${BASE}/api/node/users/${encodeURIComponent(userId)}/password`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password: value }),
      })
      const j = (await r.json().catch(() => ({}))) as { ok?: boolean; error?: string; reason?: string }
      if (!r.ok || !j.ok) throw new Error(j.error ?? j.reason ?? String(r.status))
      setValue("")
      toast.success(words.done)
    } catch (e) {
      const reason = e instanceof Error ? e.message : String(e)
      setError(words.reasons[reason] ?? words.failed.replace("{reason}", reason))
    } finally {
      setBusy(false)
      setAsking(false)
    }
  }

  return (
    <div className="flex flex-col gap-1.5" data-block="new-password">
      <Label htmlFor={field}>{words.label}</Label>
      {asking ? (
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-border px-3 py-2 text-sm" data-new-password="confirm">
          <span className="min-w-0 flex-1 text-pretty">{words.ask.replace("{who}", who)}</span>
          <Button type="button" size="sm" variant="outline" onClick={() => setAsking(false)} disabled={busy}>{words.cancel}</Button>
          <Button type="button" size="sm" onClick={() => void save()} disabled={busy} data-action="confirm-password">
            {busy && <Spinner data-icon="inline-start" />}{words.confirm}
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <InputGroup>
            <InputGroupInput id={field} type={shown ? "text" : "password"} autoComplete="new-password" spellCheck={false} value={value}
              onChange={(e) => { setValue(e.target.value); setError(null) }} onKeyDown={(e) => { if (e.key === "Enter" && fits) setAsking(true) }} />
            <InputGroupAddon align="inline-end">
              <InputGroupButton size="icon-xs" aria-label={shown ? words.hide : words.show} onClick={() => setShown((v) => !v)}>
                {shown ? <EyeOff data-icon aria-hidden /> : <Eye data-icon aria-hidden />}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          <Button type="button" variant="outline" disabled={!fits} onClick={() => setAsking(true)} data-action="save-password">{words.save}</Button>
        </div>
      )}
      {value && !fits && !asking && <p className="text-xs text-muted-foreground">{words.rule}</p>}
      {error && <p className="text-xs text-destructive" role="alert">{error}</p>}
    </div>
  )
}

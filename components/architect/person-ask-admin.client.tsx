"use client"
// @local — the two fields of the birth window «the element's admin» (node step 778-3); only the beacon's card uses it

import { useState } from "react"
import { toast } from "sonner"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import type { Ask } from "./person-ask-card.client"
import type { PersonAskUi } from "./person-ask.i18n"

// АДМИНИСТРАТОР НОВОГО ЭЛЕМЕНТА (узел, шаг 778-3). Владелец 2026-11-17 (Telegram 470): «При рождении элемента просим ввести e-mail и
// пароль»; (471) «Если пользователь проигнорировал ведение имейла, то значит только архитектор может получить эту роль по умолчанию».
// `/api/node/person-asks` `{ id, admin: { email, password? } }` — ядро отдаёт их элементу входа (новый e-mail — аккаунт с ролью элемента,
// знакомый — только роль, пароль прежний); `{ id, skip: true }` — ничего не уходит, роль остаётся только у архитектора.
// 🔒 Пароль живёт только в этом поле до нажатия и стирается сразу после ответа; в ответе двери его нет, в журнал он не пишется.

type Props = { ask: Ask; ui: PersonAskUi; url: string; onSaved: (a: Ask) => void }

export function PersonAskAdmin({ ask, ui, url, onSaved }: Props) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [shown, setShown] = useState(false)
  const [busy, setBusy] = useState<"save" | "skip" | null>(null)
  const [error, setError] = useState<string | null>(null)
  const field = `person-ask-admin-${ask.id}`

  const send = async (skip: boolean) => {
    if (busy || (!skip && !email.trim())) return
    setBusy(skip ? "skip" : "save")
    setError(null)
    try {
      const body = skip ? { id: ask.id, skip: true } : { id: ask.id, admin: { email: email.trim(), password } }
      const r = await fetch(url, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      const d = (await r.json().catch(() => null)) as { ok?: boolean; reason?: string; admin?: string } | null
      if (!r.ok || !d?.ok) throw new Error(d?.reason ?? (r.status === 403 ? "Forbidden" : String(r.status)))
      setPassword("")
      toast.success(d.admin === "skipped" ? ui.adminSkipped : d.admin === "created" ? ui.adminCreated : ui.adminAdded)
      onSaved(ask)
    } catch (e) {
      const reason = e instanceof Error ? e.message : String(e)
      setError(ui.adminErrors[reason] ?? ui.secretFailed.replace("{reason}", reason))
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="flex flex-col gap-2" data-block="person-ask-admin" data-person-ask-admin={ask.secret?.element}>
      <Label htmlFor={`${field}-email`} className="text-xs">{ui.adminEmail}</Label>
      <Input id={`${field}-email`} type="email" inputMode="email" autoComplete="off" spellCheck={false} value={email}
        onChange={(e) => setEmail(e.target.value)} aria-invalid={error ? true : undefined} />
      <Label htmlFor={`${field}-password`} className="text-xs">{ui.adminPassword}</Label>
      <InputGroup>
        <InputGroupInput id={`${field}-password`} type={shown ? "text" : "password"} autoComplete="new-password" spellCheck={false} value={password}
          onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") void send(false) }} />
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="icon-xs" aria-label={shown ? ui.hide : ui.show} onClick={() => setShown((v) => !v)}>
            {shown ? <EyeOff data-icon aria-hidden /> : <Eye data-icon aria-hidden />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      {error && <span className="text-xs text-destructive" role="alert" data-person-ask-admin-error>{error}</span>}
      <span className="text-xs text-muted-foreground text-pretty">{ui.adminNote} {ui.secretChrome}</span>
      <div className="flex flex-wrap items-center justify-end gap-2" data-block="person-ask-admin-actions">
        <Button type="button" size="sm" variant="outline" disabled={busy !== null} onClick={() => { void send(true) }} data-person-ask-skip>
          {busy === "skip" && <Spinner data-icon="inline-start" />}{ui.adminSkip}
        </Button>
        <Button type="button" size="sm" disabled={busy !== null || !email.trim()} onClick={() => { void send(false) }} data-person-ask-save>
          {busy === "save" && <Spinner data-icon="inline-start" />}{ui.save}
        </Button>
      </div>
    </div>
  )
}

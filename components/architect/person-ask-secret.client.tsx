"use client"
// @local — the masked field of an action request that asks the person for a secret (node step 768); only the beacon's card uses it

import { useState } from "react"
import { toast } from "sonner"
import { Eye, EyeOff, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Label } from "@/components/ui/label"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import type { Ask } from "./person-ask-card.client"
import type { PersonAskUi } from "./person-ask.i18n"

// ТАЙНА ЧЕЛОВЕКА В ОКНЕ (узел, шаг 768). Владелец 2026-11-16: «показал мне прямо в этом всплывающем окне область для ввода данных в
// данном случае пароля»; «если элемент требует от меня везти например API … я могу сделать этот ввод в этом окне».
// env — ключ своего аккаунта для ЭЛЕМЕНТА: `/api/node/person-asks` `{ id, secret }` — ядро пишет его в файл ключей этого элемента и
//   перезапускает его; server-root — пароль root сервера: браузер сам несёт его в дверь запуска (`/api/node/launch` connect), как форма
//   страницы «Активация выделенного сервера», — визит на сутки в HttpOnly cookie, затем запрос закрывается обычным «Готово».
// 🔒 Значение живёт только в этом поле до нажатия и стирается сразу после ответа; в ответе двери его нет, в журнал оно не пишется.

type Props = { ask: Ask; ui: PersonAskUi; url: string; onSaved: (a: Ask) => void }

export function PersonAskSecret({ ask, ui, url, onSaved }: Props) {
  const [value, setValue] = useState("")
  const [shown, setShown] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // 769: «Проверяю сервер…» while the long check runs; a reinstalled server — its new key shown, trusted only by the person's press
  const [checking, setChecking] = useState(false)
  const [seen, setSeen] = useState<string | null>(null)
  const s = ask.secret
  if (!s) return null
  const root = s.kind === "server-root"
  const label = root ? ui.secretRoot.replace("{host}", s.host ?? "") : ui.secretKey.replace("{name}", s.name ?? "")
  const fieldId = `person-ask-secret-${ask.id}`

  const launch = async (body: Record<string, unknown>) => {
    const r = await fetch("/api/node/launch", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ host: s.host, port: s.port ?? 22, ...body }) })
    return (await r.json().catch(() => null)) as { ok?: boolean; reason?: string; state?: unknown; seen?: string | null } | null
  }

  const save = async (trust: string | null = null) => {
    if (!value.trim() || busy) return
    setBusy(true)
    setError(null)
    try {
      if (root) {
        // the same road as the page's form: the launch door opens the visit and keeps it in this browser's cookie; 769 — the request
        // closes only when the server's check answered with its state (`ok && state`), as the page's own connect
        const d = await launch({ action: "connect", password: value, ...(trust ? { trust } : {}) })
        if (d?.reason === "host-key-changed" && d.seen) { setSeen(d.seen); throw new Error(d.reason) }
        if (!d?.ok) throw new Error(d?.reason ?? "unreachable")
        setSeen(null)
        if (!d.state) {
          setChecking(true)
          const p = await launch({ action: "probe" })
          if (!p?.ok || !p.state) throw new Error(`!${ui.secretCheckFailed.replace("{reason}", p?.reason ?? "timeout")}`)
        }
      }
      const r = await fetch(url, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(root ? { id: ask.id } : { id: ask.id, secret: value }) })
      const d = (await r.json().catch(() => null)) as { ok?: boolean; reason?: string } | null
      if (!r.ok || !d?.ok) throw new Error(d?.reason ?? String(r.status))
      setValue("")
      toast.success(ui.saved)
      onSaved(ask)
    } catch (e) {
      const reason = e instanceof Error ? e.message : String(e)
      setError(reason.startsWith("!") ? reason.slice(1) : reason === "host-key-changed" ? ui.secretKeyChanged : ["space", "quote", "line-break", "not-ascii", "empty"].includes(reason) ? ui.secretBad : ui.secretFailed.replace("{reason}", reason))
    } finally {
      setBusy(false)
      setChecking(false)
    }
  }

  return (
    <div className="flex flex-col gap-2" data-block="person-ask-secret" data-person-ask-secret={s.kind}>
      <Label htmlFor={fieldId} className="flex items-center gap-1.5 text-xs"><Lock data-icon aria-hidden className="size-3.5" />{label}</Label>
      <InputGroup>
        <InputGroupInput id={fieldId} type={shown ? "text" : "password"} value={value} autoComplete={root ? "current-password" : "off"} spellCheck={false}
          onChange={(e) => setValue(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") void save() }} aria-invalid={error ? true : undefined} />
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="icon-xs" aria-label={shown ? ui.hide : ui.show} onClick={() => setShown((v) => !v)}>
            {shown ? <EyeOff data-icon aria-hidden /> : <Eye data-icon aria-hidden />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      {error && <span className="text-xs text-destructive" role="alert" data-person-ask-secret-error>{error}</span>}
      {seen && <span className="break-all text-xs text-muted-foreground" data-person-ask-secret-seen>{ui.secretSeen.replace("{fp}", seen)}</span>}
      {seen && <Button type="button" size="sm" variant="destructive" className="self-start" disabled={busy || !value.trim()} onClick={() => { void save(seen) }}>{ui.secretTrust}</Button>}
      <span className="text-xs text-muted-foreground text-pretty">{root ? ui.secretRootNote : s.kind === "openai" ? ui.secretOpenaiNote : ui.secretEnvNote.replace("{element}", ask.byName ?? "")} {ui.secretChrome}</span>
      {!root && s.where && <a href={s.where} target="_blank" rel="noreferrer" className="self-start text-xs font-medium underline underline-offset-4">{ui.secretWhere}</a>}
      <Button type="button" size="sm" className="self-end" disabled={busy || !value.trim()} onClick={() => { void save() }} data-person-ask-save>{busy && <Spinner data-icon="inline-start" />}{checking ? ui.secretChecking : ui.save}</Button>
    </div>
  )
}

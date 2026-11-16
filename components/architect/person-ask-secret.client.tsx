"use client"
// @local — the masked field of an action request that asks the person for a secret (node step 768); only the beacon's card uses it

import { useState } from "react"
import { toast } from "sonner"
import { Eye, EyeOff, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
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
  const s = ask.secret
  if (!s) return null
  const root = s.kind === "server-root"
  const label = root ? ui.secretRoot.replace("{host}", s.host ?? "") : ui.secretKey.replace("{name}", s.name ?? "")
  const fieldId = `person-ask-secret-${ask.id}`

  const save = async () => {
    if (!value.trim() || busy) return
    setBusy(true)
    setError(null)
    try {
      if (root) {
        // the same road as the page's form: the launch door opens the visit and keeps it in this browser's cookie
        const r = await fetch("/api/node/launch", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "connect", host: s.host, port: s.port ?? 22, password: value }) })
        const d = (await r.json().catch(() => null)) as { ok?: boolean; reason?: string } | null
        if (!r.ok || !d?.ok) throw new Error(d?.reason ?? String(r.status))
      }
      const r = await fetch(url, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(root ? { id: ask.id } : { id: ask.id, secret: value }) })
      const d = (await r.json().catch(() => null)) as { ok?: boolean; reason?: string } | null
      if (!r.ok || !d?.ok) throw new Error(d?.reason ?? String(r.status))
      setValue("")
      toast.success(ui.saved)
      onSaved(ask)
    } catch (e) {
      const reason = e instanceof Error ? e.message : String(e)
      setError(["space", "quote", "line-break", "not-ascii", "empty"].includes(reason) ? ui.secretBad : ui.secretFailed.replace("{reason}", reason))
    } finally {
      setBusy(false)
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
      <span className="text-xs text-muted-foreground text-pretty">{root ? ui.secretRootNote : ui.secretEnvNote.replace("{element}", ask.byName ?? "")} {ui.secretChrome}</span>
      {!root && s.where && <a href={s.where} target="_blank" rel="noreferrer" className="self-start text-xs font-medium underline underline-offset-4">{ui.secretWhere}</a>}
      <Button type="button" size="sm" className="self-end" disabled={busy || !value.trim()} onClick={() => { void save() }} data-person-ask-save>{ui.save}</Button>
    </div>
  )
}

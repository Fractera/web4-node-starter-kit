"use client"
// @local — «+ Создать пользователя» of the Users tab (778-3): the button right of the filters and its one window

import { useState } from "react"
import { toast } from "sonner"
import { Eye, EyeOff, Plus } from "lucide-react"
import { AppDialog } from "@/components/dialog/app-dialog.client"
import type { AppDialogUi } from "@/components/dialog/app-dialog.i18n"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { ALL_ROLES } from "@/lib/roles"
import type { NodeUsersUi } from "./node-users.i18n"
import { ElementAdminPicker } from "./element-admin-picker.client"
import { isElementAdminRole, type ElementAdmin } from "./use-element-admins.client"

// СОЗДАТЬ ПОЛЬЗОВАТЕЛЯ (узел, шаг 778-3). Карточка решения, «1 да» владельца 2026-11-17: «Справа от фильтров кнопка «+ Создать
// пользователя» → одно окно: e-mail, пароль (скрыт, «Показать»), роли и «Админ элементов» — выбор элементов по названию → «Создать»».
// Дорога: `POST /api/node/users` `{ email, password, roles }` (элемент входа: только архитектор, e-mail занят — 409), затем каждая роль
// админа элемента — пакетом `addRole` этому человеку. Окно одно: роли элементов выбираются внутри него, без второго окна поверх.
// 🔒 Пароль живёт только в поле до ответа; в ответе двери его нет.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
const START = ["user"]

type Props = { ui: NodeUsersUi; dialogUi: AppDialogUi; admins: ElementAdmin[]; onCreated: () => void }

export function CreateUser({ ui, dialogUi, admins, onCreated }: Props) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [shown, setShown] = useState(false)
  const [roles, setRoles] = useState<string[]>(START)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const w = ui.create
  const fits = !!email.trim() && password.length >= 8 && password.length <= 200 && roles.some((r) => !isElementAdminRole(r))
  const reset = () => { setEmail(""); setPassword(""); setShown(false); setRoles(START); setError(null) }
  const why = (reason: string) => ui.reasons[reason] ?? w.reasons[reason] ?? ui.failed

  async function create() {
    setBusy(true)
    setError(null)
    try {
      const plain = roles.filter((r) => !isElementAdminRole(r))
      const r = await fetch(`${BASE}/api/node/users`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: email.trim(), password, roles: plain }) })
      const j = (await r.json().catch(() => ({}))) as { ok?: boolean; id?: string; error?: string; reason?: string }
      if (!r.ok || !j.ok || !j.id) throw new Error(j.error ?? j.reason ?? (r.status === 409 ? "email-taken" : String(r.status)))
      const missed: string[] = []
      for (const role of roles.filter(isElementAdminRole)) {
        const g = await fetch(`${BASE}/api/node/users/batch`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "addRole", ids: [j.id], value: role }) })
        const gj = (await g.json().catch(() => ({}))) as { ok?: boolean; error?: string; skipped?: { reason: string }[] }
        if (!g.ok || !gj.ok || gj.skipped?.length) missed.push(`${admins.find((a) => a.role === role)?.name ?? role} — ${why(gj.error ?? gj.skipped?.[0]?.reason ?? String(g.status))}`)
      }
      setPassword("")
      onCreated()
      if (missed.length) { setError(w.partly.replace("{missed}", missed.join("; "))); return }
      toast.success(w.done.replace("{email}", email.trim()))
      reset()
      setOpen(false)
    } catch (e) {
      setError(why(e instanceof Error ? e.message : String(e)))
    } finally {
      setBusy(false)
    }
  }

  const footer = (
    <>
      <Button variant="outline" onClick={() => { reset(); setOpen(false) }} disabled={busy}>{ui.cancel}</Button>
      <Button onClick={() => void create()} disabled={busy || !fits} data-action="create-user">{busy && <Spinner data-icon="inline-start" />}{w.submit}</Button>
    </>
  )

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)} data-create-user><Plus data-icon aria-hidden />{w.button}</Button>
      {open && (
        <AppDialog open onOpenChange={(o) => { if (!o && !busy) { reset(); setOpen(false) } }} title={w.title} ui={dialogUi} size="lg" footer={footer}>
          <div className="flex flex-col gap-4 px-5 py-4" data-create-user-dialog>
            {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cu-email">{ui.fields.email}</Label>
                <Input id="cu-email" type="email" inputMode="email" autoComplete="off" spellCheck={false} value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cu-password">{w.password}</Label>
                <InputGroup>
                  <InputGroupInput id="cu-password" type={shown ? "text" : "password"} autoComplete="new-password" spellCheck={false} value={password} onChange={(e) => setPassword(e.target.value)} />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton size="icon-xs" aria-label={shown ? w.hide : w.show} onClick={() => setShown((v) => !v)}>
                      {shown ? <EyeOff data-icon aria-hidden /> : <Eye data-icon aria-hidden />}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
                <span className="text-xs text-muted-foreground">{w.rule}</span>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>{ui.fields.roles}</Label>
              <div className="flex flex-wrap gap-x-4 gap-y-2" data-field="roles">
                {ALL_ROLES.filter((r) => r !== "guest").map((role) => (
                  <label key={role} className="inline-flex items-center gap-2 text-sm">
                    <Checkbox checked={roles.includes(role)} onCheckedChange={() => setRoles((x) => (x.includes(role) ? x.filter((v) => v !== role) : [...x, role]))} />
                    {role}
                  </label>
                ))}
              </div>
            </div>
            <ElementAdminPicker admins={admins} roles={roles} onChange={setRoles} words={ui.admins} />
          </div>
        </AppDialog>
      )}
    </>
  )
}

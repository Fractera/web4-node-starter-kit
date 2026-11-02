"use client"

import { type ReactNode, useEffect, useState } from "react"
import { AppDialog } from "@/components/dialog/app-dialog.client"
import type { AppDialogUi } from "@/components/dialog/app-dialog.i18n"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ALL_ROLES } from "@/lib/roles"
import type { NodeUsersUi } from "./node-users.i18n"
import type { NodeUserRow, Org } from "./node-users.client"

// ОКНО ПОЛЬЗОВАТЕЛЯ (узел, шаг 559-5). Карандаш в строке открывает его. Слово владельца: «Можно нажать карандашик когда выпадет
// модельное окно и можно по каждому пользователю внести изменения. Можно выбрать участие в вне нескольких организациях или
// использовании нескольких ролей. Любое действие пакетное … после дополнительного подтверждения.»
// 🔒 Одно окно, несколько видов: правка → подтверждение, история свойства, обезличивание. Окна поверх окон не открываются (закон
// `check-dialogs`: два окна друг на друге перехватывают нажатия).
// Запись — та же дверь пакета (`update` одного человека, `anonymize`): правила проверяет элемент входа, отказ приходит с причиной.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
const WALLET = /^0x[0-9a-fA-F]{40}$/
type Tri = "unset" | "yes" | "no"
type View = { kind: "edit" } | { kind: "confirm" } | { kind: "anonymize" } | { kind: "history"; of: HistoryKind }
export type HistoryKind = "roles" | "methods" | "marketing" | "tracking" | "log" | "messenger"
type Draft = {
  nickname: string; firstName: string; lastName: string; email: string; avatar: string; wallet: string
  roles: string[]; orgs: string[]; blocked: boolean; marketing: Tri; tracking: Tri
}

const triOf = (c: { granted: boolean } | null, refuse = false): Tri => (c ? ((refuse ? !c.granted : c.granted) ? "yes" : "no") : "unset")
const draftOf = (u: NodeUserRow): Draft => ({
  nickname: u.nickname ?? "", firstName: u.firstName ?? "", lastName: u.lastName ?? "", email: u.email, avatar: u.avatar ?? "", wallet: u.wallet ?? "",
  roles: u.roles, orgs: u.orgs.map((o) => o.id), blocked: u.status === "blocked", marketing: triOf(u.marketing), tracking: triOf(u.tracking, true),
})

export function UserDialog({ user, orgs, ui, dialogUi, lang, onClose, onChanged, onOrgsChanged }: {
  user: NodeUserRow; orgs: Org[]; ui: NodeUsersUi; dialogUi: AppDialogUi; lang: string
  onClose: () => void; onChanged: () => void; onOrgsChanged: () => void
}) {
  const [view, setView] = useState<View>({ kind: "edit" })
  const [draft, setDraft] = useState<Draft>(() => draftOf(user))
  const [newOrg, setNewOrg] = useState("")
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  useEffect(() => { setDraft(draftOf(user)); setView({ kind: "edit" }); setError(null) }, [user])

  const set = (p: Partial<Draft>) => setDraft((d) => ({ ...d, ...p }))
  const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v])
  const walletBad = !!draft.wallet && !WALLET.test(draft.wallet)

  // Заплата — только то, что изменилось: история человека не засоряется строками «без изменений».
  function patch(): Record<string, unknown> {
    const was = draftOf(user)
    const p: Record<string, unknown> = {}
    for (const k of ["nickname", "firstName", "lastName", "email", "avatar", "wallet"] as const) if (draft[k] !== was[k]) p[k] = draft[k]
    if (JSON.stringify([...draft.roles].sort()) !== JSON.stringify([...was.roles].sort())) p.roles = draft.roles
    if (JSON.stringify([...draft.orgs].sort()) !== JSON.stringify([...was.orgs].sort())) p.orgs = draft.orgs
    if (draft.blocked !== was.blocked) p.blocked = draft.blocked
    if (draft.marketing !== was.marketing && draft.marketing !== "unset") p.marketing = draft.marketing === "yes"
    if (draft.tracking !== was.tracking && draft.tracking !== "unset") p.tracking = draft.tracking !== "yes"
    return p
  }

  async function send(action: "update" | "anonymize") {
    setSending(true)
    setError(null)
    try {
      const r = await fetch(`${BASE}/api/node/users/batch`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action, ids: [user.id], value: action === "update" ? patch() : undefined }),
      })
      const j = (await r.json().catch(() => ({}))) as { ok?: boolean; error?: string; skipped?: { reason: string }[] }
      const why = j.error ?? j.skipped?.[0]?.reason
      if (!r.ok || !j.ok || why) {
        setError(ui.reasons[why ?? ""] ?? why ?? ui.failed)
        setView({ kind: action === "update" ? "edit" : "anonymize" })
        return
      }
      onChanged()
      onClose()
    } catch {
      setError(ui.unreachable)
    } finally {
      setSending(false)
    }
  }

  async function upload(file: File) {
    setUploading(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append("file", file)
      const r = await fetch(`${BASE}/api/media/upload`, { method: "POST", body: fd })
      const j = (await r.json().catch(() => ({}))) as { ok?: boolean; item?: { id: string } }
      // Адрес — дверь `/api/media/<id>/file`, она есть у ядра и у каждого элемента; по нему элемент входа узнаёт свой файл и удаляет его.
      if (j.ok && j.item?.id) set({ avatar: `/api/media/${j.item.id}/file` })
      else setError(ui.failed)
    } catch {
      setError(ui.unreachable)
    } finally {
      setUploading(false)
    }
  }

  async function addOrg() {
    const name = newOrg.trim()
    if (!name) return
    const r = await fetch(`${BASE}/api/node/users/organizations`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name }) })
    const j = (await r.json().catch(() => ({}))) as { organization?: { id: string } }
    if (j.organization?.id) {
      set({ orgs: [...new Set([...draft.orgs, j.organization.id])] })
      setNewOrg("")
      onOrgsChanged()
    } else setError(ui.failed)
  }

  const history = (of: HistoryKind) => (
    <button className="text-xs text-primary underline-offset-4 hover:underline" onClick={() => setView({ kind: "history", of })} type="button" data-history={of}>
      {ui.historyLink}
    </button>
  )
  const field = (id: keyof Draft, label: string, extra?: ReactNode) => (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={`nu-${id}`}>{label}</Label>
      <Input id={`nu-${id}`} value={String(draft[id])} onChange={(e) => set({ [id]: e.target.value } as Partial<Draft>)} />
      {extra}
    </div>
  )
  const tri = (id: "marketing" | "tracking", label: string, kind: HistoryKind) => (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2"><Label>{label}</Label>{history(kind)}</div>
      <Select value={draft[id]} onValueChange={(v) => set({ [id]: v as Tri } as Partial<Draft>)}>
        <SelectTrigger className="h-9" aria-label={label}><SelectValue /></SelectTrigger>
        <SelectContent>
          {draft[id] === "unset" && <SelectItem value="unset">{ui.tri.unset}</SelectItem>}
          <SelectItem value="yes">{ui.tri.yes}</SelectItem>
          <SelectItem value="no">{ui.tri.no}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )

  const title =
    view.kind === "confirm" ? ui.confirmSaveTitle
    : view.kind === "anonymize" ? ui.anonymizeTitle
    : view.kind === "history" ? `${ui.history[view.of]} — ${user.nickname ?? user.id}`
    : `${ui.editTitle} — ${user.nickname ?? user.id}`

  const footer =
    view.kind === "edit" ? (
      <>
        <Button variant="destructive" onClick={() => setView({ kind: "anonymize" })} disabled={sending} data-action="anonymize">{ui.actions.anonymize}</Button>
        <Button variant="outline" onClick={onClose}>{ui.cancel}</Button>
        <Button onClick={() => setView({ kind: "confirm" })} disabled={walletBad || uploading || Object.keys(patch()).length === 0} data-action="save">{ui.save}</Button>
      </>
    ) : view.kind === "confirm" ? (
      <>
        <Button variant="outline" onClick={() => setView({ kind: "edit" })} disabled={sending}>{ui.cancel}</Button>
        <Button onClick={() => void send("update")} disabled={sending} data-action="confirm-save">{ui.confirm}</Button>
      </>
    ) : view.kind === "anonymize" ? (
      <>
        <Button variant="outline" onClick={() => setView({ kind: "edit" })} disabled={sending}>{ui.cancel}</Button>
        <Button variant="destructive" onClick={() => void send("anonymize")} disabled={sending} data-action="confirm-anonymize">{ui.anonymizeDo}</Button>
      </>
    ) : (
      <Button variant="outline" onClick={() => setView({ kind: "edit" })}>← {ui.editTitle}</Button>
    )

  return (
    <AppDialog open onOpenChange={(o) => { if (!o) onClose() }} title={title} ui={dialogUi} size="lg" footer={footer}>
      <div className="flex flex-col gap-4 px-5 py-4" data-user-dialog={view.kind}>
        {error && <p className="text-sm text-destructive" role="alert">{error}</p>}

        {view.kind === "edit" && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              {field("nickname", ui.fields.nickname)}
              {field("email", ui.fields.email)}
              {field("firstName", ui.fields.firstName)}
              {field("lastName", ui.fields.lastName)}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>{ui.fields.avatar}</Label>
              <div className="flex flex-wrap items-center gap-3">
                {draft.avatar
                  ? <img alt="" className="size-12 rounded-full object-cover" referrerPolicy="no-referrer" src={draft.avatar} />
                  : <span aria-hidden className="flex size-12 items-center justify-center rounded-full bg-muted text-sm font-medium">{(draft.nickname || "?").slice(0, 1).toUpperCase()}</span>}
                <Label className="cursor-pointer rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted">
                  {uploading ? ui.avatarUploading : ui.avatarUpload}
                  <input accept="image/*" className="sr-only" type="file" onChange={(e) => { const f = e.target.files?.[0]; if (f) void upload(f) }} />
                </Label>
                {draft.avatar && <Button size="sm" variant="ghost" onClick={() => set({ avatar: "" })}>{ui.avatarRemove}</Button>}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2"><Label>{ui.fields.roles}</Label>{history("roles")}</div>
              <div className="flex flex-wrap gap-x-4 gap-y-2" data-field="roles">
                {ALL_ROLES.filter((r) => r !== "guest" || draft.roles.includes("guest")).map((role) => (
                  <label key={role} className="inline-flex items-center gap-2 text-sm">
                    <Checkbox checked={draft.roles.includes(role)} onCheckedChange={() => set({ roles: toggle(draft.roles, role) })} />
                    {role}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>{ui.fields.orgs}</Label>
              <div className="flex flex-wrap gap-x-4 gap-y-2" data-field="orgs">
                {orgs.map((o) => (
                  <label key={o.id} className="inline-flex items-center gap-2 text-sm">
                    <Checkbox checked={draft.orgs.includes(o.id)} onCheckedChange={() => set({ orgs: toggle(draft.orgs, o.id) })} />
                    {o.name}
                  </label>
                ))}
              </div>
              <div className="flex gap-2">
                <Input aria-label={ui.newOrg} placeholder={ui.newOrg} value={newOrg} onChange={(e) => setNewOrg(e.target.value)} />
                <Button variant="outline" onClick={() => void addOrg()} disabled={!newOrg.trim()}>{ui.newOrgAdd}</Button>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {tri("marketing", ui.fields.marketing, "marketing")}
              {tri("tracking", ui.fields.tracking, "tracking")}
            </div>
            <p className="text-xs text-muted-foreground">{ui.trackingHint}</p>
            {field("wallet", ui.fields.wallet, walletBad ? <p className="text-xs text-destructive">{ui.walletBad}</p> : null)}
            <div className="flex items-center justify-between gap-3">
              <label className="inline-flex items-center gap-3 text-sm">
                <Switch checked={draft.blocked} onCheckedChange={(v) => set({ blocked: v })} />
                {ui.fields.blocked}
              </label>
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className="text-muted-foreground">{ui.cols.methods}: {user.methods.map((m) => ui.methods[m] ?? m).join(", ") || ui.noName}</span>
                {history("methods")}
                {history("log")}
                <span className="text-muted-foreground">{ui.history.messenger}: {user.messengerCount}</span>
                {history("messenger")}
              </div>
            </div>
          </>
        )}

        {view.kind === "confirm" && (
          <div className="flex flex-col gap-2 text-sm">
            <p>{ui.confirmSaveText}</p>
            <div className="flex flex-wrap gap-1">{Object.keys(patch()).map((k) => <Badge key={k} variant="outline">{ui.fields[k as keyof NodeUsersUi["fields"]] ?? k}</Badge>)}</div>
          </div>
        )}

        {view.kind === "anonymize" && (
          <div className="flex flex-col gap-2 text-sm">
            <p>{ui.anonymizeErased}</p>
            <p>{ui.anonymizeKept}</p>
            <p className="font-medium">{ui.anonymizeNickname.replace("{nickname}", user.nickname ?? user.id)}</p>
          </div>
        )}

        {view.kind === "history" && <HistoryTable userId={user.id} kind={view.of} ui={ui} lang={lang} />}
      </div>
    </AppDialog>
  )
}

type HistoryRow = Record<string, unknown>

/** История одного свойства — страницы с сервера, новые сверху. */
function HistoryTable({ userId, kind, ui, lang }: { userId: string; kind: HistoryKind; ui: NodeUsersUi; lang: string }) {
  const [page, setPage] = useState(1)
  const [data, setData] = useState<{ rows: HistoryRow[]; total: number; perPage: number } | "loading" | "failed">("loading")
  useEffect(() => {
    let live = true
    setData("loading")
    fetch(`${BASE}/api/node/users/${encodeURIComponent(userId)}/history/${kind}?page=${page}&perPage=10`, { cache: "no-store" })
      .then((r) => r.json())
      .then((j: { ok?: boolean; rows?: HistoryRow[]; total?: number; perPage?: number }) => { if (live) setData(j.ok ? { rows: j.rows ?? [], total: j.total ?? 0, perPage: j.perPage ?? 10 } : "failed") })
      .catch(() => { if (live) setData("failed") })
    return () => { live = false }
  }, [userId, kind, page])

  if (data === "loading") return <p className="text-sm text-muted-foreground">{ui.loading}</p>
  if (data === "failed") return <p className="text-sm text-destructive" role="alert">{ui.failed}</p>
  if (data.rows.length === 0) return <p className="text-sm text-muted-foreground" data-history-empty>{kind === "messenger" ? ui.messengerEmpty : ui.historyEmpty}</p>

  const when = (s: unknown) => (typeof s === "string" && s ? new Date(s.replace(" ", "T") + "Z").toLocaleString(lang === "ru" ? "ru-RU" : "en-GB", { dateStyle: "short", timeStyle: "short" }) : ui.noName)
  const roles = (s: unknown) => { try { return (JSON.parse(String(s)) as string[]).join(", ") } catch { return ui.noName } }
  const what = (r: HistoryRow): string => {
    if (kind === "roles") return `${r.before ? roles(r.before) : ui.noName} → ${roles(r.after)}`
    if (kind === "methods") return ui.methods[String(r.method)] ?? String(r.method)
    if (kind === "marketing") return r.granted ? ui.tri.yes : ui.tri.no
    if (kind === "tracking") return r.granted ? ui.tri.no : ui.tri.yes
    if (kind === "messenger") return `${r.amount ?? ui.noName} ${r.currency ?? ""}`.trim()
    const action = ui.logActions[String(r.action)] ?? String(r.action)
    let d = ""
    try {
      const j = JSON.parse(String(r.details ?? "null"))
      if (Array.isArray(j)) d = j.map((f) => ui.fields[f as keyof NodeUsersUi["fields"]] ?? f).join(", ")
      else if (j && typeof j === "object" && "method" in j) d = ui.methods[String((j as { method: string }).method)] ?? String((j as { method: string }).method)
    } catch { /* без подробностей */ }
    return d ? `${action}: ${d}` : action
  }
  const cell = "px-3 py-2 align-top"
  const pages = Math.max(1, Math.ceil(data.total / data.perPage))
  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className={cell} scope="col">{ui.historyCols.at}</th>
              <th className={cell} scope="col">{ui.historyCols.what}</th>
              {kind !== "methods" && kind !== "messenger" && <th className={cell} scope="col">{ui.historyCols.who}</th>}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((r, i) => (
              <tr key={String(r.id ?? i)} className="border-b border-border last:border-0 text-muted-foreground">
                <td className={`${cell} whitespace-nowrap`}>{when(r.at ?? r.sharedAt ?? r.firstAt)}{kind === "methods" && r.lastAt ? ` … ${when(r.lastAt)}` : ""}</td>
                <td className={`${cell} text-foreground`}>{what(r)}</td>
                {kind !== "methods" && kind !== "messenger" && <td className={cell}>{String(r.actor ?? ui.noName)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <div className="flex items-center justify-end gap-2 text-sm">
          <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>‹</Button>
          <span className="text-muted-foreground">{page} / {pages}</span>
          <Button size="sm" variant="outline" disabled={page >= pages} onClick={() => setPage(page + 1)}>›</Button>
        </div>
      )}
    </div>
  )
}

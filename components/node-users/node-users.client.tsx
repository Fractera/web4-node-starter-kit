"use client"

import { useCallback, useEffect, useState } from "react"
import { Pencil } from "lucide-react"
import type { AppDialogUi } from "@/components/dialog/app-dialog.i18n"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { ServerTableTools, SERVER_PER_PAGE, type ServerTableQuery } from "@/components/table/server-table-tools.client"
import { ALL_ROLES } from "@/lib/roles"
import type { TableUi } from "@/sections/table.i18n"
import type { NodeUsersUi } from "./node-users.i18n"
import { BatchBar } from "./batch-bar.client"
import { ClampedChips } from "./clamped-chips.client"
import { UserDialog } from "./user-dialog.client"

// ВКЛАДКА «ПОЛЬЗОВАТЕЛИ» ЭЛЕМЕНТА ВХОДА (узел, шаг 559). Страница ядра предрендерена; людей островок спрашивает в браузере у двери
// ядра `/api/node/users`, а та — у элемента входа, владельца людей. Каждое изменение поиска, отбора, сортировки или страницы — запрос.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

export type NodeUserRow = {
  id: string; email: string; nickname: string | null; firstName: string | null; lastName: string | null; avatar: string | null
  roles: string[]; orgs: { id: string; name: string; element?: string | null }[]; methods: string[]; status: "active" | "blocked" | "anonymized"
  createdAt: string; lastLoginAt: string | null; wallet: string | null; guest: boolean
  marketing: { granted: boolean; at: string } | null; tracking: { granted: boolean; at: string } | null; messengerCount: number
}
export type Org = { id: string; name: string; members: number }
type Filters = { org: string; role: string; sort: "created_desc" | "created_asc" }
type State = { kind: "loading" } | { kind: "error"; why: "forbidden" | "unreachable" | "failed" } | { kind: "ok"; rows: NodeUserRow[]; total: number }

export const ANY = "all"
export const fullName = (r: Pick<NodeUserRow, "firstName" | "lastName">) => [r.firstName, r.lastName].filter(Boolean).join(" ")

export function NodeUsers({ lang, ui, table, dialogUi }: { lang: string; ui: NodeUsersUi; table: TableUi; dialogUi: AppDialogUi }) {
  const [selected, setSelected] = useState<string[]>([])
  const [editing, setEditing] = useState<NodeUserRow | null>(null)
  const [query, setQuery] = useState<ServerTableQuery>({ q: "", page: 1, perPage: SERVER_PER_PAGE[0] })
  const [filters, setFilters] = useState<Filters>({ org: ANY, role: ANY, sort: "created_desc" })
  const [state, setState] = useState<State>({ kind: "loading" })
  const [orgs, setOrgs] = useState<Org[]>([])
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setBusy(true)
    const p = new URLSearchParams({ page: String(query.page), perPage: String(query.perPage), sort: filters.sort })
    if (query.q) p.set("q", query.q)
    if (filters.org !== ANY) p.set("org", filters.org)
    if (filters.role !== ANY) p.set("role", filters.role)
    try {
      const r = await fetch(`${BASE}/api/node/users?${p}`, { cache: "no-store" })
      const j = (await r.json().catch(() => ({}))) as { ok?: boolean; rows?: NodeUserRow[]; total?: number }
      if (r.status === 401 || r.status === 403) setState({ kind: "error", why: "forbidden" })
      else if (r.status === 502 || r.status === 503) setState({ kind: "error", why: "unreachable" })
      else if (!j.ok || !j.rows) setState({ kind: "error", why: "failed" })
      else setState({ kind: "ok", rows: j.rows, total: j.total ?? 0 })
    } catch {
      setState({ kind: "error", why: "unreachable" })
    } finally {
      setBusy(false)
    }
  }, [query, filters])

  const loadOrgs = useCallback(async () => {
    try {
      const r = await fetch(`${BASE}/api/node/users/organizations`, { cache: "no-store" })
      const j = (await r.json().catch(() => ({}))) as { organizations?: Org[] }
      setOrgs(j.organizations ?? [])
    } catch { /* отборы без организаций — таблица всё равно работает */ }
  }, [])

  useEffect(() => { void load() }, [load])
  useEffect(() => { void loadOrgs() }, [loadOrgs])

  const date = (s: string) => new Date(s.replace(" ", "T") + "Z").toLocaleDateString(lang === "ru" ? "ru-RU" : "en-GB", { dateStyle: "medium" })
  const cell = "px-4 py-3 align-top"
  const setFilter = (next: Partial<Filters>) => { setFilters((f) => ({ ...f, ...next })); setQuery((q) => ({ ...q, page: 1 })) }

  if (state.kind === "loading") return <p className="inline-flex items-center gap-2 text-sm text-muted-foreground"><Spinner /> {ui.loading}</p>
  if (state.kind === "error") return <p className="text-sm text-destructive" role="alert" data-node-users-error={state.why}>{ui[state.why]}</p>

  // Выбор живёт по id на текущей странице: обезличенных не выбирают — с ними ничего сделать нельзя.
  const pickable = state.rows.filter((r) => r.status !== "anonymized").map((r) => r.id)
  const allPicked = pickable.length > 0 && pickable.every((id) => selected.includes(id))
  const head = (
    <tr className="border-b border-border">
      <th scope="col" className={`${cell} w-10`}>
        <Checkbox aria-label={ui.cols.selectPage} checked={allPicked} onCheckedChange={() => setSelected(allPicked ? [] : pickable)} data-select-page />
      </th>
      {[ui.cols.user, ui.cols.email, ui.cols.roles, ui.cols.orgs, ui.cols.methods, ui.cols.status, ui.cols.created].map((h) => (
        <th key={h} scope="col" className={`${cell} font-semibold whitespace-nowrap text-foreground`}>{h}</th>
      ))}
      <th scope="col" className={`${cell} w-12`}><span className="sr-only">{ui.cols.edit}</span></th>
    </tr>
  )

  const rows = state.rows.map((r) => {
    const gone = r.status === "anonymized"
    return (
      <tr key={r.id} className="border-b border-border last:border-0 text-muted-foreground" data-user-row={r.id} data-status={r.status}>
        <td className={cell}>
          {!gone && <Checkbox aria-label={ui.cols.select} checked={selected.includes(r.id)} onCheckedChange={() => setSelected((s) => (s.includes(r.id) ? s.filter((x) => x !== r.id) : [...s, r.id]))} />}
        </td>
        {/* 559-7 (владелец 2026-10-22): «Для каждого пользователя установи максимальное количество строк две добавь ширину для электронного
            адреса а если поля не помещаются поставь три точки». Строка человека — не выше двух строк текста: имя и подпись по одной строке. */}
        <td className={`${cell} min-w-[180px] max-w-[240px]`}>
          <div className="flex items-center gap-3">
            {r.avatar && !gone
              ? <img alt="" className="size-8 shrink-0 rounded-full object-cover" referrerPolicy="no-referrer" src={r.avatar} />
              : <span aria-hidden className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-foreground">{(r.nickname ?? "?").slice(0, 1).toUpperCase()}</span>}
            <div className="flex min-w-0 flex-col">
              <span className="truncate font-medium text-foreground">{r.nickname || ui.noName}</span>
              <span className="truncate text-xs">{gone ? ui.anonymizedName : fullName(r) || (r.guest ? ui.guest : "")}</span>
            </div>
          </div>
        </td>
        {/* ✗ Было `break-all` без ширины: таблица шире экрана, колонка сжималась до 4 знаков, и адрес гостя вставал столбиком в 10 строк.
            Теперь своя ширина, одна строка, хвост — «…», полный адрес — в подсказке. */}
        <td className={`${cell} w-[280px] min-w-[280px] max-w-[280px]`} data-col="email">
          <div className="truncate" title={gone ? undefined : r.email ?? undefined}>{gone ? ui.noName : r.email}</div>
        </td>
        {/* 554-5, ширины по слову владельца: роли — до 200 px, две строки; организации — колонка 400 px, плашка до 180 px, две строки
            (приложение завода — первой); способы входа — до 200 px, одна строка. */}
        {/* 559-7: своя ширина = пределу плашек. ✗ Без неё широкая таблица сжимала колонку до 97 px, и роли вставали в 4 ряда. */}
        <td className={`${cell} w-[200px] min-w-[200px]`} data-col="roles"><ClampedChips items={r.roles} maxWidth={200} chipMaxWidth={200} /></td>
        <td className={`${cell} w-[400px] min-w-[400px] max-w-[400px]`} data-col="orgs">
          {r.orgs.length
            ? <ClampedChips items={[...r.orgs].sort((a, b) => Number(!!b.element) - Number(!!a.element)).map((o) => o.name)} maxWidth={400} chipMaxWidth={180} />
            : ui.noName}
        </td>
        <td className={`${cell} whitespace-nowrap`} data-col="methods">
          {r.methods.length
            ? <div className="max-w-[200px] truncate" title={r.methods.map((m) => ui.methods[m] ?? m).join(", ")}>{r.methods.map((m) => ui.methods[m] ?? m).join(", ")}</div>
            : ui.noName}
        </td>
        <td className={`${cell} whitespace-nowrap`}>
          <Badge variant={r.status === "active" ? "secondary" : r.status === "blocked" ? "destructive" : "outline"}>{ui.status[r.status]}</Badge>
        </td>
        <td className={`${cell} whitespace-nowrap`}>{date(r.createdAt)}</td>
        <td className={cell}>
          {!gone && (
            <Button size="icon-sm" variant="ghost" aria-label={`${ui.cols.edit}: ${r.nickname ?? r.id}`} onClick={() => setEditing(r)} data-edit={r.id}>
              <Pencil />
            </Button>
          )}
        </td>
      </tr>
    )
  })

  const filterBar = (
    <>
      <Select value={filters.org} onValueChange={(v) => setFilter({ org: v })}>
        <SelectTrigger className="h-9 w-48" aria-label={ui.filterOrg} data-filter="org">
          <SelectValue placeholder={ui.filterOrg} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ANY}>{ui.filterOrg}: {ui.any}</SelectItem>
          {orgs.map((o) => <SelectItem key={o.id} value={o.id}>{o.name} ({o.members})</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={filters.role} onValueChange={(v) => setFilter({ role: v })}>
        <SelectTrigger className="h-9 w-48" aria-label={ui.filterRole} data-filter="role">
          <SelectValue placeholder={ui.filterRole} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ANY}>{ui.filterRole}: {ui.any}</SelectItem>
          {ALL_ROLES.map((role) => <SelectItem key={role} value={role}>{role}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={filters.sort} onValueChange={(v) => setFilter({ sort: v as Filters["sort"] })}>
        <SelectTrigger className="h-9 w-44" aria-label={ui.cols.created} data-filter="sort">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="created_desc">{ui.sortNewest}</SelectItem>
          <SelectItem value="created_asc">{ui.sortOldest}</SelectItem>
        </SelectContent>
      </Select>
    </>
  )

  return (
    <div className="flex max-w-6xl flex-col" data-node-users={state.total}>
      <ServerTableTools
        above={selected.length > 0
          ? <BatchBar ids={selected} orgs={orgs} ui={ui} dialogUi={dialogUi} onClear={() => setSelected([])} onDone={() => { setSelected([]); void load(); void loadOrgs() }} />
          : null}
        columns={9}
        filters={filterBar}
        head={head}
        loading={busy}
        onQuery={setQuery}
        onReset={() => {
          setFilters({ org: ANY, role: ANY, sort: "created_desc" })
          setQuery({ q: "", page: 1, perPage: SERVER_PER_PAGE[0] })
        }}
        query={query}
        rows={rows}
        total={state.total}
        words={table}
      />
      {editing && (
        <UserDialog
          user={editing}
          orgs={orgs}
          ui={ui}
          dialogUi={dialogUi}
          lang={lang}
          onClose={() => setEditing(null)}
          onChanged={() => { void load(); void loadOrgs() }}
          onOrgsChanged={() => void loadOrgs()}
        />
      )}
    </div>
  )
}

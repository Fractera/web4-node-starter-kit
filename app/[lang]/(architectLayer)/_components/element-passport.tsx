import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import type { A2ADoor, ElementPassport as Passport } from "@/lib/a2a/element-passport"
import type { ElementPassportUi } from "../_i18n/element-passport.i18n"
import { SubscriptionsView } from "./subscriptions-view.client"
import { CronCalendar } from "./cron-calendar.client"
import { CronSwitch } from "./cron-switch.client"
import { cronSwitchUi } from "../_i18n/cron-switch.i18n"

// СТРАНИЦЫ МЕНЮ ЭЛЕМЕНТА ПОКАЗЫВАЮТ ЕГО ПАСПОРТ (шаг 406-4; карта меню 406-2 — решение владельца «удалить всё предложенное,
// остальное как предложил»). Серверный компонент: читает уже прочитанный паспорт, своих данных не держит.

export type PassportView = "api" | "mcp" | "catalog" | "publish" | "find" | "subscriptions" | "cron"

function Example({ label, value }: { label: string; value: unknown }) {
  if (value === undefined) return null
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <pre className="overflow-x-auto rounded-md bg-muted px-3 py-2 font-mono text-xs">{typeof value === "string" ? value : JSON.stringify(value, null, 2)}</pre>
    </div>
  )
}

function Door({ d, ui }: { d: A2ADoor; ui: ElementPassportUi }) {
  const callers = d.callers.includes("*") ? ui.everyone : d.callers.join(", ")
  const errors = d.errors && Object.keys(d.errors).length ? Object.entries(d.errors).map(([c, w]) => `${c} — ${w}`).join(" · ") : null
  return (
    <section className="flex flex-col gap-2 rounded-lg border border-border px-4 py-3" data-passport-door={`${d.method ?? "MCP"} ${d.path}`}>
      <p className="flex flex-wrap items-center gap-2 font-mono text-sm">
        {d.method && <Badge variant="outline">{d.method}</Badge>}
        <span className="font-medium">{d.path}</span>
      </p>
      <p className="text-sm text-muted-foreground">
        {ui.capability}: <span className="text-foreground">{d.skill}</span> · {ui.key}: <span className="text-foreground">{d.key}</span> · {ui.callers}: <span className="text-foreground">{callers}</span>
      </p>
      <Example label={ui.input} value={d.input} />
      <Example label={ui.output} value={d.output} />
      {errors && <p className="text-xs text-muted-foreground">{ui.errors}: {errors}</p>}
    </section>
  )
}

export type NodeElementRow = { id: string; address: string; name: string; description: string; self: boolean }

// 435-3, выбор владельца «Показать оба»: сверху элементы узла из реестра ядра, ниже — каталог самого элемента.
function NodeElements({ rows, ui }: { rows: NodeElementRow[]; ui: ElementPassportUi }) {
  return (
    <section className="flex flex-col gap-2" data-node-elements={rows.length}>
      <p className="text-sm font-medium">{ui.nodeElements}</p>
      <p className="text-xs text-muted-foreground">{ui.nodeElementsLead}</p>
      <ul className="flex flex-col gap-1.5">
        {rows.map((r) => (
          <li key={r.id} className="text-sm">
            <span className="font-medium">{r.name}</span> <span className="font-mono text-xs text-muted-foreground">{r.address}</span>
            {r.self ? <Badge variant="secondary" className="ml-2">{ui.thisElement}</Badge> : null}
            <span className="text-muted-foreground"> — {r.description || ui.noDescription}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function ElementPassport({ view, passport, ui, lang = "en", nodeElements, service, subscriptionsHref, item }: { view: PassportView; passport: Passport | null; ui: ElementPassportUi; lang?: string; nodeElements?: NodeElementRow[]; service?: string; subscriptionsHref?: string; item?: string }) {
  if (view === "find") return <p className="my-4 text-sm text-muted-foreground" data-passport-view="find">{ui.networkSoon}</p>
  // 465: календарь крона не зависит от визитки A2A — он про рабочий процесс элемента (CRON.json), а не про его описание для сети.
  // 🪦 Владелец 2026-10-12: здесь стоял список `process` паспорта («что элемент делает сам») — заменён календарём.
  if (view === "cron") {
    return (
      <div className="my-4 flex flex-col gap-3" data-passport-view="cron">
        {/* 551-3: «Использовать автоматизацию» — поле `automation.cron` паспорта; у черновика (без паспорта) переключателя нет. */}
        {item && passport ? <CronSwitch item={item} ui={cronSwitchUi(lang)} /> : null}
        {passport?.cron
          ? <CronCalendar plan={passport.cron} lang={lang} ui={ui.cron} />
          : <p className="text-sm text-muted-foreground" data-cron-empty>{ui.cron.empty}</p>}
      </div>
    )
  }
  const card = passport?.card
  const x = passport?.ext
  const nodeList = view === "catalog" && nodeElements?.length ? <NodeElements rows={nodeElements} ui={ui} /> : null
  if (!card || !x) return <div className="my-4 flex flex-col gap-4">{nodeList}<p className="text-sm text-muted-foreground" data-passport-view="none">{ui.none} {ui.describeHint}</p></div>

  const notes = passport!.warnings.length ? (
    <p className="text-xs text-muted-foreground" data-passport-warnings>{ui.warnings} {passport!.warnings.join(" · ")}</p>
  ) : null
  const problems = passport!.problems.length ? (
    <div className="my-3 rounded-md border-2 border-destructive/60 bg-destructive/10 px-3 py-2 text-sm" role="alert" data-passport-problems>
      <p className="font-medium">{ui.problems}</p>
      <ul className="ml-5 list-disc">{passport!.problems.map((p) => <li key={p}>{p}</li>)}</ul>
      <p className="mt-1 text-muted-foreground">{ui.describeHint}</p>
    </div>
  ) : null

  let body: React.ReactNode = null
  if (view === "api" || view === "mcp") {
    const doors = (x.doors ?? []).filter((d) => d.protocol === (view === "api" ? "http" : "mcp"))
    body = doors.length
      ? <div className="flex flex-col gap-3"><p className="text-sm font-medium">{ui.doors}</p>{doors.map((d) => <Door key={`${d.method} ${d.path}`} d={d} ui={ui} />)}</div>
      : <p className="text-sm text-muted-foreground">{view === "api" ? ui.noHttp : ui.noMcp}</p>
  } else if (view === "catalog") {
    const own = x.catalog
      ? (
        <div className="flex flex-col gap-1 text-sm">
          <p className="font-medium">{ui.ownCatalog} · {ui.catalogDoors}</p>
          <p>{ui.find}: <span className="font-mono">{x.catalog.find}</span></p>
          <p>{ui.get}: <span className="font-mono">{x.catalog.get}</span></p>
          <p>{ui.contribute}: {x.catalog.contribute ? <span className="font-mono">{x.catalog.contribute}</span> : <span className="text-muted-foreground">{ui.noContribute}</span>}</p>
        </div>
      )
      : <p className="text-sm text-muted-foreground">{ui.catalogNone}</p>
    body = <div className="flex flex-col gap-5">{nodeList}{own}</div>
  } else if (view === "publish") {
    body = (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">{ui.notSent}</p>
        <Example label={`${ui.published} — ${ui.publishedLead}`} value={passport!.published} />
        <Example label={`${ui.registry} — ${ui.cardLead}`} value={passport!.registry} />
      </div>
    )
  } else if (view === "subscriptions") {
    // 463: внешние платные сервисы элемента — список, описание, ключи, «Проверить», платежи (SUBSCRIPTIONS.json).
    // 🪦 Владелец 2026-10-12 («to trush»): здесь стояли список нужд из паспорта («sign-in у auth …») и раздел «Внешние сервисы —
    // Нет…» по `process` вида `integration` (412-7) — сняты: вкладка показывает только подписки элемента.
    // 463 (владелец 2026-10-12: «…отдельные страницы а не валить в одну кучу»): корень «Подписок» — список сервисов ссылками,
    // страница сервиса (`service`) — только он: описание, ключи, «Проверить», платежи. В левом меню каждый сервис — свой пункт.
    const subs = passport?.subscriptions
    const one = subs && service ? subs.services.find((s) => s.id === service) : undefined
    body = !subs
      ? <p className="text-sm text-muted-foreground">{ui.noIntegrations}</p>
      : one
        ? <SubscriptionsView service={one} example={subs.example} ui={ui.subscriptions} />
        : (
          <ul className="flex flex-col gap-2" data-subscriptions={subs.services.length}>
            {subs.services.map((s) => (
              <li key={s.id} className="rounded-lg border border-border px-4 py-3">
                <Link className="font-medium underline" href={`${subscriptionsHref}/${s.id}`}>{s.name}</Link>
                {subs.example ? <Badge variant="outline" className="ml-2">{ui.subscriptions.example}</Badge> : null}
                <p className="text-sm text-muted-foreground">{s.description}</p>
              </li>
            ))}
          </ul>
        )
  }
  return (
    <div className="my-4 flex flex-col gap-3" data-passport-view={view}>
      {problems}
      {body}
      {notes}
    </div>
  )
}

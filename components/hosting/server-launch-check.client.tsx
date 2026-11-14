"use client"
// @local — step 2 of the launch ladder (one route: «Активация выделенного сервера»): the server measured, its Fractera and the strategy

import type { AppDialogUi } from "@/components/dialog/app-dialog.i18n"
import { ServerBusy } from "@/components/hosting/server-busy.client"
import type { LaunchState } from "@/components/hosting/server-launch.client"
import type { ServerLaunchWords } from "@/components/hosting/server-launch.i18n"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Small } from "@/components/ui/typography"

// THE CHECK OF A SERVER (node step 738-3). The owner, 2026-11-14: «ты получишь состояние установлено ли уже Fractera …, если установлена то
// какая версия … насколько она отстает. От этого строится стратегия». The numbers are the server's own (`probe.sh`, kept there); the verdict
// is the node's judge (`lib/hosting/judge.mjs`): a refusal only where a node cannot live, a warning with numbers everywhere else.

export type Strategy = "install" | "update" | "latest" | "running" | "clear"

/** What the next step does on this server: a fresh install, an update of an older one, nothing, a launch already running there — or,
 *  744-4, the previous state deleted first when the server is not related to this node. */
export function strategyOf(s: LaunchState): Strategy {
  if (s.launch?.state === "running" || s.probe?.fractera?.launching) return "running"
  if (s.relation?.kind === "unrelated") return "clear"
  const f = s.probe?.fractera
  if (!f?.head) return "install"
  if (f.behind === 0 && s.mark?.phase === "live") return "latest"
  return "update"
}

export function CheckStep({ state, words, dialogUi, busy, onAct }: { state: LaunchState; words: ServerLaunchWords; dialogUi: AppDialogUi; busy: boolean; onAct: (action: string, extra?: Record<string, unknown>) => Promise<void> }) {
  const v = state.verdict
  const f = state.probe?.fractera ?? null
  const strategy = strategyOf(state)
  const items = v?.items ?? []
  // 744-4: the clear follows the verdict — the node itself when it is not related, only the strangers beside a related one.
  const rel = state.relation ?? null
  const why = (id: string) => rel?.reasons.find((r) => r.id === id)
  const taken = rel?.kind === "unrelated"
    ? { host: state.host, sites: why("foreign-sites")?.sites ?? [], programs: why("root-programs")?.count ?? 0, nodes: rel.nodes ?? [], clear: state.cleared ?? undefined }
    : null
  const reasonText = (r: NonNullable<typeof rel>["reasons"][number]) => (words.reason[r.id as keyof typeof words.reason] ?? r.id)
    .replace("{from}", r.from ?? "?").replace("{date}", r.at ? new Date(r.at).toLocaleDateString(undefined, { day: "numeric", month: "long" }) : "?")
    .replace("{origin}", r.origin ?? "?").replace("{folders}", (r.folders ?? []).join(", ")).replace("{sites}", (r.sites ?? []).join(", ")).replace("{n}", String(r.count ?? 0))
  return (
    <div className="flex flex-col gap-3" data-block="server-launch-check">
      {rel ? (
        <div className="flex flex-col gap-1" data-block="server-launch-relation" data-relation={rel.kind}>
          <p className="font-medium text-foreground text-sm">{words.relation[rel.kind]}</p>
          {rel.reasons.length ? <ul className="flex list-disc flex-col gap-0.5 pl-5 text-muted-foreground text-sm">{rel.reasons.map((r) => <li key={r.id}>{reasonText(r)}</li>)}</ul> : null}
        </div>
      ) : null}
      {v ? <p className="text-foreground text-sm">{words.verdict[v.level]}</p> : null}
      <ul className="flex flex-col gap-1" data-block="server-launch-verdict">
        {items.filter((i) => i.id !== "sites" && i.id !== "others").map((i) => (
          <li className="flex flex-wrap items-center gap-2 text-sm" data-item={i.id} key={i.id}>
            <Badge variant={i.level === "ok" ? "default" : i.level === "warn" ? "secondary" : "destructive"}>{i.level}</Badge>
            <span className="text-foreground">{words.item[i.id] ?? i.id}</span>
            {i.value !== undefined && i.value !== null ? <span className="text-muted-foreground">{String(i.value)}{i.need !== undefined ? ` (${String(i.need)})` : ""}</span> : null}
          </li>
        ))}
      </ul>
      <div className="flex flex-col gap-1 rounded-md bg-muted/40 p-3" data-block="server-launch-fractera">
        {f?.head ? (
          <>
            <Small className="text-foreground">{words.fractera.there.replace("{head}", f.head.slice(0, 8))}</Small>
            <Small className="text-foreground">{f.behind === null ? words.fractera.unknown : f.behind === 0 ? words.fractera.latest : words.fractera.behind.replace("{n}", String(f.behind))}</Small>
          </>
        ) : <Small className="text-foreground">{words.fractera.none}</Small>}
        {strategy === "running" ? <Small className="text-foreground">{words.fractera.launching}</Small> : null}
        <Small className="font-medium text-foreground" data-strategy={strategy}>{words.strategy[strategy].replace("{n}", String(f?.behind ?? "?"))}</Small>
        {strategy === "update" && state.preflight ? (
          <Small className={state.preflight.verdict && !state.preflight.verdict.ok ? "text-destructive" : "text-muted-foreground"} data-preflight={state.preflight.verdict ? (state.preflight.verdict.ok ? "ok" : "stop") : "unknown"}>
            {!state.preflight.verdict ? words.preflight.unknown : state.preflight.verdict.ok ? words.preflight.ok : words.preflight.stop.replace("{files}", (state.preflight.verdict.conflicts ?? []).join(", ") || state.preflight.verdict.reason || "?")}
          </Small>
        ) : null}
      </div>
      {taken ? <ServerBusy busy={taken} dialogUi={dialogUi} disabled={busy} onStart={onAct} words={words.busy} /> : null}
      <div>
        <Button disabled={busy} onClick={() => void onAct("probe")} size="sm" variant="ghost">{words.recheckServer}</Button>
      </div>
    </div>
  )
}

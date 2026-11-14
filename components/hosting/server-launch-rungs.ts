// THE RUNGS OF «АКТИВАЦИЯ ВЫДЕЛЕННОГО СЕРВЕРА» (node step 744-7) — what each of the seven steps has done and its one line, read from the
// server's own answer. Which step is open is not decided here: the part `ladder-step` (`Ladder`) does it by the one rule of every ladder
// (`lib/hosting/ladder-rule.mjs`).
// 🔒 D46 — the owner, 2026-11-14: «ты конечно имел право показать мне что домен к серверу уже подключён и какой именно режим выбрали и
// только тогда открыть четвёртый шаг». The installation stands after the domain: step 3 is done when its own ladder is (`domainDone`).
// ✗ Measured before (738): «install» opened right after the check while step 3 stood empty. The second check of the records stands after
// the installation AND the server's node answering: an installed Fractera whose node is silent is not a done installation.
import type { Strategy } from "@/components/hosting/server-launch-check.client"
import type { LaunchState } from "@/components/hosting/server-launch.client"
import type { LadderView } from "@/components/hosting/server-ladder.client"
import type { LaunchStep, ServerLaunchWords } from "@/components/hosting/server-launch.i18n"
import type { ServerLadderWords } from "@/components/hosting/server-ladder.i18n"

export const LAUNCH_ORDER: LaunchStep[] = ["server", "check", "domain", "install", "recheck", "certs", "ready"]

/** The end of this browser's access to the server, in the person's own clock. */
export const untilText = (iso: string) => new Date(iso).toLocaleString(undefined, { weekday: "short", hour: "2-digit", minute: "2-digit" })
const fill = (t: string, map: Record<string, string>) => Object.entries(map).reduce((s, [k, v]) => s.split(`{${k}}`).join(v), t)

/** Fractera stands on the server: launched by this page, or already the latest version there. */
export function installedOf(s: LaunchState, strategy: Strategy) {
  return s.launch?.state === "done" || strategy === "latest"
}

/** The launch state as the 737-19 steps read it — one shape for every door (`server-ladder.client.tsx`). */
export function launchView(s: LaunchState, key: boolean): LadderView {
  const d = s.domain ?? {}
  const ip = /^\d{1,3}(\.\d{1,3}){3}$/.test(s.host ?? "") ? (s.host as string) : s.probe?.publicIp ?? null
  return {
    zone: d.domain ?? null, ip, readOnly: false, own: false, canType: s.mark?.domainActive !== true, detect: d.detect ?? null, way: d.way ?? null, key,
    records: s.records ?? [], dns: Object.fromEntries((d.check?.results ?? []).map((r) => [r.host, r.state])), dnsAt: d.check?.at ?? null,
    run: null, names: null, server: null,
  }
}

/** What each rung of step 3's own ladder has done (`server-launch-domain.client.tsx`) — and step 3 is done when all four are. */
export function domainDone(view: LadderView) {
  return {
    domain: Boolean(view.zone),
    where: Boolean(view.detect && view.detect.dnsHost !== "none"),
    who: Boolean(view.way && view.way !== "none"),
    records: Object.keys(view.dns).length > 0,
  }
}

export function launchDone(s: LaunchState, strategy: Strategy, key: boolean): Record<LaunchStep, boolean> {
  return {
    server: true,
    // 744-4: nothing goes on while the server holds a state not related to this node — only its clear is open.
    check: Boolean(s.verdict) && s.verdict?.level !== "fail" && s.relation?.kind !== "unrelated",
    domain: Object.values(domainDone(launchView(s, key))).every(Boolean),
    install: installedOf(s, strategy) && Boolean(s.core),
    recheck: Boolean(s.core?.steps.dns),
    certs: Boolean(s.core?.steps.certs && s.core?.steps.check),
    ready: Boolean(s.core?.steps.active && s.domain?.signin?.ok),
  }
}

/** One line of what each done step did — the server's own facts, never «готово». The last step has none: it is open when done. */
export function launchSummary(s: LaunchState, target: { host: string; until: string | null }, words: ServerLaunchWords, ladderWords: ServerLadderWords) {
  const w = words.summary
  const head = (s.launch?.version?.head ?? s.probe?.fractera?.head ?? "").slice(0, 8)
  const need = (s.core?.rows ?? []).filter((r) => !r.optional)
  const count = (ok: (r: (typeof need)[number]) => boolean) => ({ ok: String(need.filter(ok).length), all: String(need.length) })
  const way = s.domain?.way
  const summary: Partial<Record<LaunchStep, string>> = {
    server: target.until ? fill(w.server, { host: target.host, time: untilText(target.until) }) : target.host,
    check: [s.relation?.kind === "related" ? fill(w.related, { head }) : w.clean, s.verdict?.level === "warn" ? w.warn : ""].filter(Boolean).join(" · "),
    domain: s.domain?.domain ? [s.domain.domain, way ? ladderWords.who.option[way] : ""].filter(Boolean).join(" · ") : undefined,
    install: fill(w.install, { head }),
    recheck: fill(w.recheck, count((r) => r.dns === "ok")),
    certs: fill(w.certs, count((r) => (r.cert === "ok" || r.cert === "expiring") && r.https === true)),
  }
  return summary
}

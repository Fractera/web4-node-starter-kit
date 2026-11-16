// THE RUNGS OF «АКТИВАЦИЯ ВЫДЕЛЕННОГО СЕРВЕРА» (node step 744-7) — what each of the seven steps has done and its one line, read from the
// server's own answer. Which step is open is not decided here: the part `ladder-step` (`Ladder`) does it by the one rule of every ladder
// (`lib/hosting/ladder-rule.mjs`).
// 🔒 D46 — the owner, 2026-11-14: «ты конечно имел право показать мне что домен к серверу уже подключён и какой именно режим выбрали и
// только тогда открыть четвёртый шаг». The installation stands after the domain: step 3 is done when its four facts are (`domainSteps`,
// `lib/hosting/launch-domain.mjs` — the runner refuses `install` by the same reading).
// ✗ Measured before (738): «install» opened right after the check while step 3 stood empty. The second check of the records stands after
// the installation AND the server's node answering: an installed Fractera whose node is silent is not a done installation.
import type { Strategy } from "@/components/hosting/server-launch-check.client"
import type { LaunchState } from "@/components/hosting/server-launch.client"
import type { LadderView } from "@/components/hosting/server-ladder.client"
import type { LaunchStep, ServerLaunchWords } from "@/components/hosting/server-launch.i18n"
import type { ServerLadderWords } from "@/components/hosting/server-ladder.i18n"
import { finalCheck, httpsDue, namesReady } from "@/lib/hosting/final-check.mjs"
import { domainSteps, normalWay } from "@/lib/hosting/launch-domain.mjs"
import { telegramSettled } from "@/lib/hosting/server-telegram.mjs"

// 758 (the owner, 2026-11-16: «Telegram может быть в пятым шагом то есть в тот момент когда идёт установка сервера у пользователя есть
// время подключить Telegram»): step 4 is done once the installation RUNS, so step 5 opens beside it; step 5 is done when the bot is set
// (or waits, or «later») AND the installation answers — so the records' second check still stands after a living node.
export const LAUNCH_ORDER: LaunchStep[] = ["server", "check", "domain", "install", "telegram", "recheck", "certs", "ready"]

/** The end of this browser's access to the server, in the person's own clock. */
export const untilText = (iso: string) => new Date(iso).toLocaleString(undefined, { weekday: "short", hour: "2-digit", minute: "2-digit" })
const fill = (t: string, map: Record<string, string>) => Object.entries(map).reduce((s, [k, v]) => s.split(`{${k}}`).join(v), t)
const dayText = (iso: string) => new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "long" })

/** Fractera stands on the server: launched by this page, or already the latest version there. */
export function installedOf(s: LaunchState, strategy: Strategy) {
  return s.launch?.state === "done" || strategy === "latest"
}

/** The launch state as the 737-19 steps read it — one shape for every door (`server-ladder.client.tsx`). */
export function launchView(s: LaunchState): LadderView {
  const d = s.domain ?? {}
  const ip = /^\d{1,3}(\.\d{1,3}){3}$/.test(s.host ?? "") ? (s.host as string) : s.probe?.publicIp ?? null
  return {
    zone: d.domain ?? null, ip, readOnly: false, own: false, canType: s.mark?.domainActive !== true, detect: d.detect ?? null, way: (normalWay(d.way) as LadderView["way"]) ?? null,
    records: s.records ?? [], dns: Object.fromEntries((d.check?.results ?? []).map((r) => [r.host, r.state])), dnsAt: d.check?.at ?? null,
    run: null, names: null, server: null,
  }
}

export function launchDone(s: LaunchState, strategy: Strategy): Record<LaunchStep, boolean> {
  return {
    server: true,
    // 744-4: nothing goes on while the server holds a state not related to this node — only its clear is open.
    check: Boolean(s.verdict) && s.verdict?.level !== "fail" && s.relation?.kind !== "unrelated",
    domain: Object.values(domainSteps(s.domain)).every(Boolean),
    install: s.launch?.state === "running" || (installedOf(s, strategy) && Boolean(s.core)),
    telegram: installedOf(s, strategy) && Boolean(s.core) && telegramSettled(s.telegram),
    recheck: Boolean(s.core?.steps.dns),
    // 744-9: one reading with the runner's gate — a certificate for every required name, HTTPS where it is due (`httpsDue`)
    certs: namesReady(s).ok,
    // 744-6: the last step is done only by the final check (every required name: a certificate and HTTPS; the domain on; sign-in)
    ready: finalCheck(s).ok,
  }
}

/** ✗ 2026-11-16 (fractera.ai): step 3 closes after ANY first check (D46 — the install never waits for DNS) and its line named only the
 * domain and the way, so «checked» read as «ready» while every name still led to Vercel. The line now says how many names lead to the
 * server at that check; the gate stays step 5. */
function pointed(results: Array<{ state?: string }> | undefined, words: { pointed: string }) {
  return results?.length ? fill(words.pointed, { ok: String(results.filter((r) => r.state === "ok").length), all: String(results.length) }) : ""
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
    // 744-5: domain · its way in the person's words · where it came from (a domain the server already held: when it was written there)
    domain: s.domain?.domain
      ? [s.domain.domain, way ? ladderWords.who.option[normalWay(way) as "dns" | "none"] : "", s.domain.from === "server" && s.domain.since ? fill(w.since, { date: dayText(s.domain.since) }) : "", pointed(s.domain.check?.results, w)].filter(Boolean).join(" · ")
      : undefined,
    install: s.launch?.state === "running" ? w.installing : fill(w.install, { head }),
    telegram: s.telegram?.configured ? fill(w.botOn, { bot: s.telegram.username ? `@${s.telegram.username}` : "" }) : s.telegram?.pending ? fill(w.botWaits, { tail: s.telegram.tail ?? "" }) : s.telegram?.skipped ? w.botLater : undefined,
    recheck: fill(w.recheck, count((r) => r.dns === "ok")),
    certs: fill(w.certs, count((r) => (r.cert === "ok" || r.cert === "expiring") && (r.https === true || !httpsDue(r)))),
  }
  return summary
}

// THE NODE WRITES ITS SERVER'S RECORDS WITH ITS CLOUDFLARE KEY — WHEN THE KEY SEES THE ZONE (node step 760-8). The owner, 2026-11-16: «если ты
// определил что домен привязан к Cloud Flyer … тебе нужен Token и значит ты автоматически показываешь другой сценарий входа … через Token. А
// если … на регистратор то ты и требуешь от пользователя вход через регистратор? … её недостаток был в ручном выборе» — approved with 760.
// It brings back what 759 removed (`f5503a75`: this file, the door's `cloudflare-write`), without the question: the measurement decides.
// 🔒 THE KEY STAYS IN THE CORE: the launch door reads it and hands it here; nothing of it leaves in an answer.
// 🔒 READ, SHOW, THEN WRITE: `readPlan` reads the zone and returns the plan (`lib/hosting/server-records-plan.mjs`); `writePlan` removes only
// the records the person's confirm named (the door checks it against a fresh plan), then writes A `<base>`, A `*.<base>` and every switched
// name to the server's IP, DNS only. The old refusal on a foreign CNAME became «remove it — in the confirm» (the Vercel `www` of fractera.ai).
// No `server-only` marker: like `lib/domain/cloudflare.ts`, it is imported only by doors, and the door tests load them in plain node.
import { deleteRecord, recordsOnNames, upsertServerRecord, zoneByName } from "@/lib/domain/cloudflare"
import { planServerRecords } from "@/lib/hosting/server-records-plan.mjs"

export type RecordsPlan = ReturnType<typeof planServerRecords>
export type PlanRead = { ok: true; visible: false } | { ok: true; visible: true; zoneId: string; plan: RecordsPlan } | { ok: false; reason: string }

/** Whether this key sees the zone and, when it does, what it would change for the server at `ip`. */
export async function readPlan(opts: { token: string; dnsZone: string; base: string; hosts: string[]; ip: string }): Promise<PlanRead> {
  const zone = await zoneByName(opts.token, opts.dnsZone)
  if (!zone.ok) return { ok: false, reason: zone.reason }
  if (!zone.result) return { ok: true, visible: false }
  const names = [...new Set([opts.base, `*.${opts.base}`, ...opts.hosts])]
  const recs = await recordsOnNames(opts.token, zone.result.id, names)
  if (!recs.ok) return { ok: false, reason: recs.reason }
  return { ok: true, visible: true, zoneId: zone.result.id, plan: planServerRecords({ base: opts.base, hosts: opts.hosts, ip: opts.ip, records: recs.result }) }
}

/** Carry out a confirmed plan: removals first (an A cannot stand beside a CNAME), then the A records, DNS only. */
export async function writePlan(opts: { token: string; zoneId: string; base: string; ip: string; plan: RecordsPlan }) {
  const results: Array<{ host: string; act: "remove" | "write"; ok: boolean; reason?: string }> = []
  for (const r of opts.plan.remove) {
    const d = await deleteRecord(opts.token, opts.zoneId, r.id)
    results.push({ host: r.host, act: "remove", ok: d.ok, ...(d.ok ? {} : { reason: d.reason }) })
  }
  if (results.some((x) => !x.ok)) return { ok: false, results }
  for (const host of [...new Set([opts.base, `*.${opts.base}`, ...opts.plan.add.map((x) => x.host), ...opts.plan.change.map((c) => c.host)])]) {
    const w = await upsertServerRecord(opts.token, opts.zoneId, host, opts.ip, null)
    results.push({ host, act: "write", ok: w.ok, ...(w.ok ? {} : { reason: (w as { reason?: string }).reason }) })
  }
  return { ok: results.every((x) => x.ok), results }
}

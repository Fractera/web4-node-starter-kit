// THE NODE WRITES ITS SERVER'S RECORDS ITSELF, WITH ITS CLOUDFLARE KEY (node step 737-19, D18). One function for both doors of the domain
// ladder — this computer before the move (`app/api/node/server/records`) and the server after it (`app/api/node/server/domain`).
// The owner, 2026-11-13: «путь который мы уже построили в самом приложении для получения какого-то токена через который ты управляешь
// Cloud player чтобы самому внести все записи». Every name of the node's zone and `*` → an A record to the server, DNS ONLY (737-19b);
// a foreign CNAME on a name is reported, never removed (only this node's own tunnel CNAME goes).
import { upsertServerRecord, zoneByName } from "@/lib/domain/cloudflare"

export type PointResult = { ok: boolean; reason?: string; results?: Array<{ host: string; ok: boolean; reason?: string }> }

export async function pointNamesAtServer(opts: { token: string; dnsZone: string; base: string; hosts: string[]; ip: string; tunnelId: string | null }): Promise<PointResult> {
  const zone = await zoneByName(opts.token, opts.dnsZone)
  if (!zone.ok || !zone.result) return { ok: false, reason: zone.ok ? "zone-not-on-cloudflare" : zone.reason }
  const results: Array<{ host: string; ok: boolean; reason?: string }> = []
  for (const host of [...opts.hosts, `*.${opts.base}`]) {
    const r = await upsertServerRecord(opts.token, zone.result.id, host, opts.ip, opts.tunnelId)
    results.push({ host, ok: r.ok, ...(r.ok ? {} : { reason: (r as { reason?: string }).reason }) })
  }
  return { ok: results.every((x) => x.ok), results }
}

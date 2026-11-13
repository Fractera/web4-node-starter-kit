// @part dns-records — the DNS records a person writes at the registrar, grouped by domain, each name with its measured state
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Small } from "@/components/ui/typography"

// THE RECORDS TO WRITE AT THE REGISTRAR (node step 737-8). The owner, 2026-11-13: «Внизу появится требования прописать записи ко всем
// существующим доменам на регистраторе». One table per domain (a domain's records live at its own registrar), the values copyable as
// they are, the state of each name from the node's own check — never a guess of this part. No server code here: a server file and an
// island both render it.

export type DnsRecord = { type: string; name: string; value: string; host: string; kind?: string; optional?: boolean }
export type DnsZone = { zone: string; records: DnsRecord[]; wildcard?: { type: string; name: string; value: string } | null }
export type DnsRecordState = { text: string; tone: "default" | "secondary" | "destructive" | "outline" }
export type DnsRecordsWords = { zone: string; type: string; name: string; value: string; state: string; optional: string; wildcard: string }

export function DnsRecords({ zones, states, words }: { zones: DnsZone[]; states?: Record<string, DnsRecordState>; words: DnsRecordsWords }) {
  return (
    <div className="flex flex-col gap-4" data-block="dns-records">
      {zones.map((z) => (
        <div className="flex flex-col gap-2" data-block="dns-records-zone" key={z.zone}>
          <Small className="font-medium text-foreground">{words.zone.replace("{zone}", z.zone)}</Small>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{words.type}</TableHead>
                <TableHead>{words.name}</TableHead>
                <TableHead>{words.value}</TableHead>
                {states ? <TableHead>{words.state}</TableHead> : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {z.records.map((r) => {
                const s = states?.[r.host]
                return (
                  <TableRow data-host={r.host} key={r.host}>
                    <TableCell className="font-mono">{r.type}</TableCell>
                    <TableCell className="font-mono">
                      {r.name}
                      {r.optional ? <span className="ml-2 font-sans text-muted-foreground text-xs">{words.optional}</span> : null}
                    </TableCell>
                    <TableCell className="font-mono">{r.value}</TableCell>
                    {states ? <TableCell>{s ? <Badge variant={s.tone}>{s.text}</Badge> : null}</TableCell> : null}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          {z.wildcard ? (
            <Small className="text-muted-foreground">
              {words.wildcard} <code className="font-mono text-foreground">{`${z.wildcard.type} ${z.wildcard.name} ${z.wildcard.value}`}</code>
            </Small>
          ) : null}
        </div>
      ))}
    </div>
  )
}

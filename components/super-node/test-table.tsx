import { Badge } from "@/components/ui/badge"
import type { SuperNodeWords } from "./super-node.i18n"

// ИТОГ ТЕСТА СЕРВЕРА СУПЕР-УЗЛА (531): строки, которые посчитал сервер ядра (`runTest` — оборудование машины супер-узла по API оператора
// против профиля Tier-2, документ Lagrix 14 §14.2). Один вид для «Статуса» и «Уведомлений Lagrix»; сравнение здесь не повторяется.

export type TestRow = { name: keyof SuperNodeWords["machine"]["rows"]; need: string; have: string; verdict: "ok" | "short" | "unknown" }
export type SuperNodeTest = { at: string; verdict: "ok" | "short"; rows: TestRow[]; platform: string }

export function TestTable({ test, words, lang }: { test: SuperNodeTest; words: SuperNodeWords; lang: string }) {
  const m = words.machine
  const date = new Date(test.at).toLocaleString(lang === "ru" ? "ru-RU" : "en-GB", { dateStyle: "medium", timeStyle: "short" })
  const short = test.rows.filter((r) => r.verdict === "short").map((r) => m.rows[r.name])
  const cell = "px-3 py-2 align-top"
  const badge = (v: TestRow["verdict"]) =>
    v === "ok" ? <Badge variant="secondary" data-verdict="ok">{m.ok}</Badge>
      : v === "short" ? <Badge variant="destructive" data-verdict="short">{m.short}</Badge>
        : <Badge variant="outline" data-verdict="unknown">{m.notMeasured}</Badge>
  return (
    <div className="flex flex-col gap-3" data-super-node-test={test.verdict}>
      <p className="text-sm font-medium text-foreground">{words.test.title.replace("{date}", date)}</p>
      <p className={short.length ? "text-sm font-medium text-destructive" : "text-sm font-medium text-foreground"}>
        {short.length ? words.test.short.replace("{list}", short.join(", ")) : words.test.ok}
      </p>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/40">
            <tr>{m.head.map((h) => <th key={h} scope="col" className={`${cell} font-semibold text-foreground`}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {test.rows.map((r) => (
              <tr key={r.name} className="border-b border-border last:border-0" data-test-row={r.verdict}>
                <td className={`${cell} text-foreground`}>{m.rows[r.name]}</td>
                <td className={`${cell} text-muted-foreground`}>{r.need}</td>
                <td className={`${cell} text-foreground`}>{r.have}</td>
                <td className={cell}>{badge(r.verdict)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {test.platform && <p className="text-[length:var(--fs-small)] text-muted-foreground">{m.measured.replace("{platform}", test.platform).replace("{date}", date)}</p>}
    </div>
  )
}

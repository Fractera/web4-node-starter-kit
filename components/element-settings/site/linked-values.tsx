import { atPath } from "@/lib/site-settings/fields"
import { visibleSections, type Visible } from "./remote-fields"
import type { SiteRemoteWords } from "./words"

// ЗНАЧЕНИЯ ЭЛЕМЕНТА, СВЯЗАННОГО С CONFIG УЗЛА — ТОЛЬКО ЧТЕНИЕ (узел, шаг 712-4; вид 713-3). Пока связь включена, настройки приходят копией
// общего CONFIG и легли бы поверх любой правки; поэтому раздел «Из CONFIG» показывает, что действует. Что это и где меняется, говорят
// строка связи над вкладкой и шапка раздела — здесь только значения, одним списком с линиями между строками.
const shown = (v: unknown): string =>
  typeof v === "string" ? v : typeof v === "number" ? String(v) : typeof v === "boolean" ? (v ? "✓" : "—") : Array.isArray(v) ? String(v.length) : ""

export function LinkedValues({ app, features, site, visible }: { app: Record<string, unknown>; features: Record<string, unknown>; site: SiteRemoteWords; visible: Visible }) {
  const rows = (["basics", "seo"] as const).flatMap((g) => visibleSections(g, visible).flatMap((s) => s.fields))
    .map((f) => ({ key: f.path, label: site.fields.fields[f.path]?.label ?? f.path, value: shown(atPath(app, f.path)), field: true }))
    .filter((r) => r.value !== "")
  const switches = site.editors.features.filter((f) => visible("features", f.key, "boolean"))
    .map((f) => ({ key: f.key, label: f.label, value: features[f.key] === true ? "✓" : "—", field: false }))
  return (
    <dl data-block="erl01" data-site-linked className="flex flex-col divide-y divide-border rounded-lg border border-border">
      {[...rows, ...switches].map((r) => (
        <div key={r.key} data-block="erl02" className="grid gap-1 px-4 py-2.5 sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] sm:gap-6" {...(r.field ? { "data-linked-field": r.key } : { "data-linked-switch": r.key })}>
          <dt className="text-[length:var(--fs-small)] text-muted-foreground">{r.label}</dt>
          <dd className="break-words text-[length:var(--fs-small)] text-foreground">{r.value}</dd>
        </div>
      ))}
    </dl>
  )
}

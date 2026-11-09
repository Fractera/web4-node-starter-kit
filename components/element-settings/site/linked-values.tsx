import { Small } from "@/components/ui/typography"
import { atPath } from "@/lib/site-settings/fields"
import type { ElementRemoteWords } from "@/app/[lang]/(architectLayer)/_i18n/element-remote.i18n"
import { visibleSections, type Visible } from "./remote-fields"
import type { SiteRemoteWords } from "./words"

// ЗНАЧЕНИЯ ЭЛЕМЕНТА, СВЯЗАННОГО С CONFIG УЗЛА — ТОЛЬКО ЧТЕНИЕ (узел, шаг 712-4). Пока связь включена, настройки приходят копией общего
// CONFIG и легли бы поверх любой правки; поэтому вкладка показывает, что действует, и говорит, где это меняется.
const shown = (v: unknown): string =>
  typeof v === "string" ? v : typeof v === "number" ? String(v) : typeof v === "boolean" ? (v ? "✓" : "—") : Array.isArray(v) ? String(v.length) : ""

export function LinkedValues({ app, features, words, site, visible }: { app: Record<string, unknown>; features: Record<string, unknown>; words: ElementRemoteWords; site: SiteRemoteWords; visible: Visible }) {
  const rows = (["basics", "seo"] as const).flatMap((g) => visibleSections(g, visible).flatMap((s) => s.fields))
    .map((f) => ({ path: f.path, label: site.fields.fields[f.path]?.label ?? f.path, value: shown(atPath(app, f.path)) }))
    .filter((r) => r.value !== "")
  const switches = site.editors.features.filter((f) => visible("features", f.key, "boolean"))
  return (
    <div data-block="erl01" data-site-linked className="flex flex-col gap-4">
      <Small data-block="erl02" className="rounded-md border border-warning/50 bg-warning/10 px-3 py-2 text-foreground">{words.linked}</Small>
      <dl data-block="erl03" className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)]">
        {rows.map((r) => (
          <div key={r.path} data-block="erl04" className="contents" data-linked-field={r.path}>
            <dt className="text-sm text-muted-foreground">{r.label}</dt>
            <dd className="text-sm text-foreground break-words">{r.value}</dd>
          </div>
        ))}
        {switches.map((f) => (
          <div key={f.key} data-block="erl05" className="contents" data-linked-switch={f.key}>
            <dt className="text-sm text-muted-foreground">{f.label}</dt>
            <dd className="text-sm text-foreground">{features[f.key] === true ? "✓" : "—"}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

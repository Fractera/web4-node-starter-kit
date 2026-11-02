import { lagrixDocHref, lagrixDocLabel, type DocItem, type LagrixDoc } from "@/lib/lagrix-docs"

// ПУНКТЫ СО ССЫЛКАМИ НА ДОКУМЕНТЫ LAGRIX (531). Владелец 2026-10-18: «Все вещи которые ты рассказываешь должны ссылаться на
// соответствующую страницу документации Lagrix». Каждый пункт — текст и ссылки на документы, на которые он опирается. Без «use client»:
// годится и серверной странице, и островку.

export function DocLinks({ lang, docs, className }: { lang: string; docs: LagrixDoc[]; className?: string }) {
  if (!docs.length) return null
  return (
    <span className={className ?? "text-[length:var(--fs-small)] text-muted-foreground"}>
      {docs.map((d, i) => (
        <span key={d}>
          {i > 0 ? " · " : ""}
          <a href={lagrixDocHref(lang, d)} target="_blank" rel="noopener noreferrer" className="text-primary underline-offset-4 hover:underline" data-lagrix-doc={d}>
            {lagrixDocLabel(lang, d)}
          </a>
        </span>
      ))}
    </span>
  )
}

export function DocItems({ lang, items, ordered = false }: { lang: string; items: DocItem[]; ordered?: boolean }) {
  const Tag = ordered ? "ol" : "ul"
  return (
    <Tag className={`${ordered ? "list-decimal" : "list-disc"} flex flex-col gap-2 pl-5 text-sm leading-relaxed text-foreground`}>
      {items.map((it) => (
        <li key={it.text.slice(0, 48)}>
          <span>{it.text}</span> <DocLinks lang={lang} docs={it.docs} />
        </li>
      ))}
    </Tag>
  )
}

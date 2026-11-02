"use client"

import { Search } from "lucide-react"
import { type FormEvent, type ReactNode, useEffect, useState } from "react"
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination"
import { Small } from "@/components/ui/typography"
import type { TableUi } from "@/sections/table.i18n"

// ПОЛНЫЙ НАБОР ТАБЛИЦЫ С СЕРВЕРА: ПОИСК СВЕРХУ, СТРАНИЦЫ СНИЗУ (узел, шаг 559-4).
//
// 🎯 Слово владельца 2026-10-21: «стандартную таблицу с pagina нацией и серверными запросами а также с поиском». Вид — один в один
// `table-tools.client.tsx` (классы, порядок, слова `sections/table.i18n`, шаги 10 · 25 · 50 · 100). Механизм — другой, и в этом весь
// смысл файла: `TableTools` получает ВСЕ строки и листает их в браузере (так надо статическим публичным страницам), а здесь строк
// ровно на одну страницу — поиск, фильтр, сортировку и страницу считает сервер, а таблица только сообщает, чего хочет человек.
// 🔒 Когда брать какую: строк мало и они в HTML страницы — `TableTools`; строки за дверью, их много или они личные — эта.

export const SERVER_PER_PAGE = [10, 25, 50, 100] as const
export type ServerTableQuery = { q: string; page: number; perPage: number }

export function ServerTableTools({
  head,
  rows,
  columns,
  words,
  total,
  query,
  onQuery,
  onReset,
  loading,
  filters,
  above,
}: {
  head: ReactNode
  /** Готовые строки `<tr>` текущей страницы. */
  rows: ReactNode[]
  columns: number
  words: TableUi
  /** Сколько строк подходит всего — по ответу сервера. */
  total: number
  query: ServerTableQuery
  onQuery: (next: ServerTableQuery) => void
  /** «Сбросить»: снять и свои отборы. Не передан — сбрасываются поиск, страница и размер. */
  onReset?: () => void
  loading?: boolean
  /** Отборы над таблицей (выпадающие списки, переключатели) — рядом с «Сбросить». */
  filters?: ReactNode
  /** Полоса между панелью и таблицей (действия над выбранными строками). */
  above?: ReactNode
}) {
  const [draft, setDraft] = useState(query.q)
  useEffect(() => setDraft(query.q), [query.q])

  const pages = Math.max(1, Math.ceil(total / query.perPage))
  const current = Math.min(query.page, pages)
  const from = total === 0 ? 0 : (current - 1) * query.perPage + 1
  const to = Math.min(total, (current - 1) * query.perPage + rows.length)
  const atFirst = current <= 1
  const atLast = current >= pages

  const navLink =
    "inline-flex items-center rounded-md border border-border px-2.5 py-1.5 text-[length:var(--fs-small)] transition-colors hover:bg-muted"
  const navOff = "pointer-events-none opacity-40"

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    onQuery({ ...query, q: draft.trim(), page: 1 })
  }

  return (
    <div className="my-6 flex flex-col gap-4" data-server-table={total} aria-busy={loading || undefined}>
      {/* ── ПАНЕЛЬ УПРАВЛЕНИЯ ТАБЛИЦЕЙ ─────────────────────────────────────── */}
      <div className="flex flex-col gap-3 rounded-md border border-border p-3">
        <form className="flex flex-wrap items-center gap-2" onSubmit={onSubmit} role="search">
          <div className="relative min-w-[16rem] flex-1">
            <Search aria-hidden className="-translate-y-1/2 absolute top-1/2 left-2.5 size-4 text-muted-foreground" />
            <input
              aria-label={words.search}
              className="h-9 w-full rounded-md border border-border bg-background pr-3 pl-8 text-[length:var(--fs-small)] text-foreground placeholder:text-muted-foreground"
              data-table-search
              onChange={(e) => setDraft(e.target.value)}
              placeholder={words.search}
              type="search"
              value={draft}
            />
          </div>
          <button className={navLink} type="submit">
            {words.searchDo}
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2">
          {filters}
          <button
            className="ml-auto text-[length:var(--fs-small)] text-muted-foreground underline-offset-4 hover:underline"
            onClick={() => (onReset ? onReset() : onQuery({ q: "", page: 1, perPage: SERVER_PER_PAGE[0] }))}
            type="button"
          >
            {words.reset}
          </button>
        </div>
      </div>

      {above}

      {/* ── ТАБЛИЦА ───────────────────────────────────────────────────────── */}
      <figure className={`overflow-x-auto rounded-2xl border border-border ${loading ? "opacity-60" : ""}`}>
        <table className="w-full border-collapse text-left text-sm">
          <thead>{head}</thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="px-4 py-3" colSpan={columns}>
                  <Small className="text-muted-foreground" data-table-empty>
                    {words.empty}
                  </Small>
                </td>
              </tr>
            ) : (
              rows
            )}
          </tbody>
        </table>
      </figure>

      {/* ── СТРАНИЦЫ ───────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Small className="text-muted-foreground" data-table-shown>
          {words.shown.replace("{from}", String(from)).replace("{to}", String(to)).replace("{total}", String(total))}
        </Small>

        <div className="flex items-center gap-2">
          <Small className="text-muted-foreground">{words.perPage}</Small>
          <div className="flex items-center gap-1 rounded-md border border-border p-0.5" data-filter="per">
            {SERVER_PER_PAGE.map((n) => (
              <button
                aria-current={n === query.perPage ? "true" : undefined}
                className={
                  n === query.perPage
                    ? "rounded px-2 py-1 text-[length:var(--fs-small)] bg-muted font-medium text-foreground"
                    : "rounded px-2 py-1 text-[length:var(--fs-small)] text-muted-foreground transition-colors hover:text-foreground"
                }
                key={n}
                onClick={() => onQuery({ ...query, perPage: n, page: 1 })}
                type="button"
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <Pagination className="mx-0 w-auto">
          <PaginationContent data-table-pager={`${current}/${pages}`}>
            <PaginationItem>
              <button aria-label={words.first} className={`${navLink} ${atFirst ? navOff : ""}`} onClick={() => onQuery({ ...query, page: 1 })} type="button">
                ««
              </button>
            </PaginationItem>
            <PaginationItem>
              <button aria-label={words.prev} className={`${navLink} ${atFirst ? navOff : ""}`} onClick={() => onQuery({ ...query, page: Math.max(1, current - 1) })} type="button">
                {words.prev}
              </button>
            </PaginationItem>
            <PaginationItem>
              <Small className="px-2 text-muted-foreground">{words.page.replace("{n}", String(current)).replace("{of}", String(pages))}</Small>
            </PaginationItem>
            <PaginationItem>
              <button aria-label={words.next} className={`${navLink} ${atLast ? navOff : ""}`} onClick={() => onQuery({ ...query, page: Math.min(pages, current + 1) })} type="button">
                {words.next}
              </button>
            </PaginationItem>
            <PaginationItem>
              <button aria-label={words.last} className={`${navLink} ${atLast ? navOff : ""}`} onClick={() => onQuery({ ...query, page: pages })} type="button">
                »»
              </button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}

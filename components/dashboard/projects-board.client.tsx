"use client"

import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { TableTools } from "@/components/table/table-tools.client"
import type { TableUi } from "@/sections/table.i18n"

// ТАБЛИЦА «Dashboard → Проекты» (339). Страница предрендерена — строки спрашиваются у `/api/node/projects` один раз при
// открытии (опроса нет: его не заказывали). Таблица — стандартная `TableTools`: поиск сверху, страницы снизу, горизонтальная
// прокрутка; над ней два чекбокса «нативные» и «кастомные». Поиск идёт по служебному адресу, своему домену, заголовку и описанию.

type Status = "running" | "stopped" | "building" | "unborn" | "off"
type Row = {
  id: string
  custom: boolean
  service: string
  title: string | null
  description: string | null
  domain: string | null
  commit: { hash: string; subject: string } | null
  status: Status
  offReason?: string | null
  web4?: boolean
  date: string | null
  commits: number | null
  link: string | null
  open: string
}

export type ProjectsBoardWords = {
  loading: string
  unavailable: string
  native: string
  custom: string
  /** 567-6: кастомные в сети Web4 — свой чекбокс (владелец 2026-10-22). */
  customWeb4: string
  head: string[]
  status: Record<Status, string>
  openLabel: string
  table: TableUi
}

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
const DASH = "—"
const TONE: Record<Status, string> = {
  running: "text-foreground",
  stopped: "text-destructive",
  building: "text-primary",
  unborn: "text-muted-foreground",
  off: "text-muted-foreground",
}

export function ProjectsBoard({ words, lang }: { words: ProjectsBoardWords; lang: string }) {
  const [rows, setRows] = useState<Row[] | "loading" | "failed">("loading")

  useEffect(() => {
    fetch(`${BASE}/api/node/projects?lang=${lang}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: { rows: Row[] }) => setRows(d.rows))
      .catch(() => setRows("failed"))
  }, [lang])

  if (rows === "loading") {
    // 567-7 (владелец 2026-10-22): «таблицу в виде скелетона 10 записей» — настоящие заголовки колонок и десять пустых строк.
    return (
      <figure className="overflow-x-auto rounded-2xl border border-border" role="status" aria-label={words.loading} data-projects-skeleton>
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border">
              {words.head.map((h) => (
                <th key={h} scope="col" className="px-4 py-3 align-bottom font-semibold whitespace-nowrap text-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 10 }, (_, i) => (
              <tr key={i} className="border-b border-border last:border-0">
                {words.head.map((h, j) => (
                  <td key={h} className="px-4 py-3"><Skeleton className={j === 2 || j === 3 || j === 6 ? "h-4 w-48" : "h-4 w-16"} /></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </figure>
    )
  }
  if (rows === "failed") return <p className="my-6 text-sm text-destructive" role="alert">{words.unavailable}</p>

  const cell = "px-4 py-3 align-top whitespace-nowrap"
  const wide = "group/cell px-4 py-3 align-top min-w-[16rem] max-w-[24rem] whitespace-normal"
  const link = "text-primary underline-offset-4 hover:underline"
  // 584 (владелец 2026-10-24): «таблица должна содержать не более двух строк для ячейки при наведении … show all texts» —
  // длинная ячейка показывает две строки, наведение раскрывает весь текст; чистый CSS, без скрипта.
  const clamp = "line-clamp-2 group-hover/cell:line-clamp-none"

  const head = (
    <tr className="border-b border-border">
      {words.head.map((h) => (
        <th key={h} scope="col" className="px-4 py-3 align-bottom font-semibold whitespace-nowrap text-foreground">{h}</th>
      ))}
    </tr>
  )

  const body = rows.map((r, i) => (
    <tr key={r.id} className="border-b border-border last:border-0 text-muted-foreground" data-project={r.id}>
      <td className={`${cell} font-medium text-foreground`}>{i + 1}</td>
      <td className={`${cell} text-foreground`}>{r.service}</td>
      <td className={wide}><div className={clamp}>{r.title ?? DASH}</div></td>
      <td className={wide}><div className={clamp}>{r.description ?? DASH}</div></td>
      <td className={cell}>{r.domain ?? DASH}</td>
      <td className={cell}>{DASH}</td>
      <td className={wide}><div className={clamp}>{r.commit ? <><code className="text-foreground">{r.commit.hash}</code> {r.commit.subject}</> : DASH}</div></td>
      <td className={`${cell} ${TONE[r.status]}`} data-status={r.status}>
        {words.status[r.status]}
        {/* 567: выключенный — с причиной, чтобы «не работает» не читалось как поломка. */}
        {r.status === "off" && r.offReason ? <span className="block text-xs">{r.offReason}</span> : null}
      </td>
      <td className={cell}>{r.date ? new Date(r.date).toLocaleString(lang) : DASH}</td>
      <td className={cell}>{r.commits ?? DASH}</td>
      <td className={cell}>{r.link ? <a className={link} href={r.link} rel="noopener noreferrer" target="_blank">{r.link.replace(/^https?:\/\//, "")}</a> : DASH}</td>
      <td className={cell}><a className={link} href={`${BASE}/${lang}${r.open}`}>{words.openLabel}</a></td>
      <td className={cell}>{DASH}</td>
    </tr>
  ))

  return (
    <TableTools
      columns={words.head.length}
      head={head}
      rows={body}
      texts={rows.map((r) => [r.service, r.domain, r.title, r.description].filter(Boolean).join(" "))}
      toggles={[
        { label: words.native, match: rows.map((r) => !r.custom) },
        // 567-6: строка видна, если её отмечает хоть один включённый чекбокс — поэтому кастомные делятся на два непересекающихся отбора.
        { label: words.custom, match: rows.map((r) => r.custom && !r.web4) },
        { label: words.customWeb4, match: rows.map((r) => r.custom && !!r.web4) },
      ]}
      words={words.table}
    />
  )
}

"use client"

import { useEffect, useState } from "react"
import { Switch } from "@/components/ui/switch"
import { isTemporaryHostname } from "@/components/shell/temporary-host"

// 657-1: ПЕРЕКЛЮЧАТЕЛЬ РЕЖИМА ЛЕВОГО МЕНЮ — первая строка «Основного». Слово владельца 2026-11-05: «Рекомендуемый режим минимальные
// настройки по умолчанию, полные для глубокого управления настройки»; затем: «Название кнопок компактной или полное выполни в виде свеч
// переключателя слева и текста который меняется справа или компактная или полная». Включён — полное меню, выключен — компактное.
//
// 🔒 ПОСЛЕ ЗАПИСИ — ПЕРЕЗАГРУЗКА СТРАНИЦЫ, А НЕ `router.refresh()`. ✗ Замерено глазами 2026-11-05 на узле владельца: «Полная»
// применилась за 1 с, а «Компактная» не применилась и за 181 с, хотя сервер сразу после записи отдавал новый режим (HTML проверен
// curl'ом). Свежая загрузка страницы слоя берёт её из кеша сервера, уже перерисованного дверью, — около 0,3 с.
// На временном адресе панель только читает: переключатель неактивен, и это сказано.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

type Mode = "compact" | "full"
type Words = { title: string; compact: string; full: string; failed: string; readOnly: string }

export function MenuModeSwitch({ mode, words }: { mode: Mode; words: Words }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)
  // Признак адреса — только в браузере и после первой отрисовки: сервер его не знает, и разметка обязана совпасть.
  const [readOnly, setReadOnly] = useState(false)
  useEffect(() => { setReadOnly(isTemporaryHostname(window.location.hostname)) }, [])

  async function pick(next: Mode) {
    if (busy || readOnly || next === mode) return
    setBusy(true)
    setError(false)
    try {
      const r = await fetch(`${BASE}/api/node/menu-mode`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ mode: next }),
      })
      if (!r.ok) throw new Error(String(r.status))
      window.location.reload()
    } catch {
      setError(true)
      setBusy(false)
    }
  }

  return (
    <div data-block="mmsw1" className="flex flex-col gap-1" data-menu-mode={mode}>
      <label data-block="mmsw2" className="flex cursor-pointer items-center gap-3 rounded-md px-[9px] py-2 text-[length:var(--fs-body)] text-foreground transition-colors hover:bg-muted/60">
        <Switch
          checked={mode === "full"}
          disabled={busy || readOnly}
          onCheckedChange={(on) => pick(on ? "full" : "compact")}
          aria-label={words.title}
        />
        <span data-block="mmsw3" className="truncate">{mode === "full" ? words.full : words.compact}</span>
      </label>
      {readOnly ? <p data-block="mmsw4" className="px-[9px] text-[length:var(--fs-small)] text-muted-foreground">{words.readOnly}</p> : null}
      {error ? <p data-block="mmsw5" className="px-[9px] text-[length:var(--fs-small)] text-destructive" role="alert">{words.failed}</p> : null}
    </div>
  )
}

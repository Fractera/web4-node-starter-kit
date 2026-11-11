import { StateDot, type MenuStateKind } from "@/components/workspace/menu-state-dot"

// СТРОКА ЭЛЕМЕНТА: ТОЧКА СОСТОЯНИЯ, ИМЯ-ССЫЛКА, НЕОБЯЗАТЕЛЬНАЯ ПОМЕТКА (722-8). Вынесена, когда одна и та же строка появилась в третий раз:
// порции левого меню (`menu-more`), «Найти» (`menu-search`), «ИИ» (`menu-ai`). ✗ 2026-11-11: три ручные копии одной разметки, и окно
// «ИИ» вышло уродливым — владелец: «вместо того чтобы взять готовые инструмент ты … полез создавать новый». Одна часть — один вид.
// `menu` — строка левого меню (подпись приглушена до наведения, размер пункта меню); `list` — строка списка в окне (имя 500, пометка
// мелким приглушённым под ним). Без JavaScript — обычная ссылка. Несёт `data-state`: флажок «Только работающие» прячет её чистым CSS.
export function ElementRow({
  href,
  label,
  state,
  note,
  variant = "list",
}: {
  href: string
  label: string
  state?: { kind: MenuStateKind; label: string }
  /** Почему элемент здесь — одна-две строки под именем (только `list`). */
  note?: string
  variant?: "menu" | "list"
}) {
  if (variant === "menu") {
    return (
      <a href={href} data-block="element-row" data-state={state?.kind} className="flex min-w-0 items-center gap-2 rounded-md px-[9px] py-2 text-[length:var(--fs-body)] text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <StateDot state={state} />
        <span className="truncate">{label}</span>
      </a>
    )
  }
  return (
    <a href={href} data-block="element-row" data-state={state?.kind} className="flex min-w-0 items-start gap-2.5 rounded-md px-2 py-2 transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <span className="mt-[0.4rem] flex shrink-0"><StateDot state={state} /></span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate text-[length:var(--fs-body)] font-medium text-foreground">{label}</span>
        {note && <span className="line-clamp-2 text-[length:var(--fs-small)] text-muted-foreground">{note}</span>}
      </span>
    </a>
  )
}

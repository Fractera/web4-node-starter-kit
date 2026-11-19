"use client"
// @part page-anchors — a long page's own top menu: one link per part under the site header, and a thin strip at the bottom with an arrow while a part lies below

import { ChevronDown } from "lucide-react"
import { type ReactNode, useCallback, useEffect, useState } from "react"
import { Button, buttonVariants } from "@/components/ui/button"

// 801 (the owner, 2026-11-19, the element's «Настройки → Домен» on the server: «у нас отсутствует верхнее меню, я даже не догадался
// прокрутить вниз … во-первых должно быть верхнее меню … во-вторых в нижней части страницы должна моргать стрелочка, при нажатии на
// которую страница прокрутится вниз … в-третьих карточки расположи по одной в ряд»). The page names its parts by `id`; this part draws
// the menu of them, the page's own content between, and the arrow, nothing else.
// ✗ 2026-11-19 13:26 (eyes of root's «Домен»): the arrow was a floating round button with a shadow in the middle of the screen — it lay
// over «Переименовать адрес». 803-4 (the decision card the owner approved: «тонкая полоса внизу окна … содержимое уходит под полосу и
// никогда не оказывается под кнопкой … без теней»): the arrow lives in a strip that sticks to the bottom of the content column
// (`sticky bottom-0`, the page's background, a border on top), so the content passes under the strip and never under a button.
// 🔒 THE SCROLL IS `scrollIntoView`, NEVER THE BARE `#anchor`: on these pages a hash link changes the address and does not move the page
// (measured in 264-4, `components/workspace/tabs-scroll.client.tsx`); the links stay real `<a href="#…">` for a page without JavaScript.
// 🔒 THE MENU STANDS UNDER THE SITE HEADER (`sticky top-14`, the header is `h-14`); a part gives itself `scroll-mt-32` so its title is
// not hidden under both. The arrow shows only while something lies below the screen and moves only with the person's consent to motion.

export type Anchor = { id: string; label: string }

export function PageAnchors({ items, label, down, onGo, children }: {
  items: Anchor[]; label: string; down: string
  /** a part is chosen in the menu or by the arrow — the page may open it (an accordion row) */
  onGo?: (id: string) => void
  children: ReactNode
}) {
  // the next part below the screen; "" — no part below, but the page goes on; null — nothing below, the strip hides
  const [next, setNext] = useState<string | null>(null)

  const measure = useCallback(() => {
    const below = items.find(({ id }) => (document.getElementById(id)?.getBoundingClientRect().top ?? 0) > window.innerHeight - 96)
    const more = document.documentElement.scrollHeight - window.scrollY - window.innerHeight > 48
    setNext(below ? below.id : more ? "" : null)
  }, [items])

  useEffect(() => {
    measure()
    window.addEventListener("scroll", measure, { passive: true })
    window.addEventListener("resize", measure)
    return () => {
      window.removeEventListener("scroll", measure)
      window.removeEventListener("resize", measure)
    }
  }, [measure])

  const go = (id: string) => {
    onGo?.(id)
    requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }))
  }
  const onward = () => (next ? go(next) : window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" }))

  return (
    <>
      <nav aria-label={label} className="sticky top-14 z-20 flex flex-wrap gap-1 border-b border-border bg-background/95 py-2 backdrop-blur" data-block="page-anchors">
        {items.map((a) => (
          <a className={buttonVariants({ variant: "ghost", size: "sm" })} data-block="page-anchors-link" href={`#${a.id}`} key={a.id} onClick={(e) => { e.preventDefault(); go(a.id) }}>{a.label}</a>
        ))}
      </nav>
      {children}
      {next !== null ? (
        <div className="sticky bottom-0 z-20 mt-6 flex justify-center border-t border-border bg-background/95 py-1.5 backdrop-blur" data-block="page-anchors-down">
          <Button aria-label={down} className="motion-safe:animate-bounce" onClick={onward} size="icon-sm" type="button" variant="ghost">
            <ChevronDown aria-hidden className="size-5" />
          </Button>
        </div>
      ) : null}
    </>
  )
}

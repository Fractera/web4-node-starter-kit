"use client"
// @part page-anchors — a long page's own top menu: one link per part under the site header, and a blinking arrow at the bottom while a part lies below

import { ChevronDown } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { Button, buttonVariants } from "@/components/ui/button"

// 801 (the owner, 2026-11-19, the element's «Настройки → Домен» on the server: «у нас отсутствует верхнее меню, я даже не догадался
// прокрутить вниз … во-первых должно быть верхнее меню … во-вторых в нижней части страницы должна моргать стрелочка, при нажатии на
// которую страница прокрутится вниз … в-третьих карточки расположи по одной в ряд»). The page names its parts by `id`; this part draws
// the menu of them and the arrow, nothing else.
// 🔒 THE SCROLL IS `scrollIntoView`, NEVER THE BARE `#anchor`: on these pages a hash link changes the address and does not move the page
// (measured in 264-4, `components/workspace/tabs-scroll.client.tsx`); the links stay real `<a href="#…">` for a page without JavaScript.
// 🔒 THE MENU STANDS UNDER THE SITE HEADER (`sticky top-14`, the header is `h-14`); a part gives itself `scroll-mt-32` so its title is
// not hidden under both. The arrow shows only while something lies below the screen and moves only with the person's consent to motion.

export type Anchor = { id: string; label: string }

export function PageAnchors({ items, label, down }: { items: Anchor[]; label: string; down: string }) {
  // the next part below the screen; "" — no part below, but the page goes on; null — nothing below, the arrow hides
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

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
  const onward = () => (next ? go(next) : window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" }))

  return (
    <>
      <nav aria-label={label} className="sticky top-14 z-20 flex flex-wrap gap-1 border-b border-border bg-background/95 py-2 backdrop-blur" data-block="page-anchors">
        {items.map((a) => (
          <a className={buttonVariants({ variant: "ghost", size: "sm" })} data-block="page-anchors-link" href={`#${a.id}`} key={a.id} onClick={(e) => { e.preventDefault(); go(a.id) }}>{a.label}</a>
        ))}
      </nav>
      {next !== null ? (
        <Button
          aria-label={down}
          className="fixed bottom-24 left-1/2 z-30 -translate-x-1/2 rounded-full shadow-md motion-safe:animate-bounce"
          data-block="page-anchors-down"
          onClick={onward}
          size="icon"
          type="button"
          variant="outline"
        >
          <ChevronDown aria-hidden className="size-5" />
        </Button>
      ) : null}
    </>
  )
}

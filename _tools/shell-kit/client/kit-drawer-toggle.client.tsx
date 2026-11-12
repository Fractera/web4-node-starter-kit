"use client"

import { useEffect, useState } from "react"
import { PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DRAWER_STATE_EVENT,
  DRAWER_TOGGLE_EVENT,
  type DrawerSide,
  type DrawerStateDetail,
  type DrawerToggleDetail,
} from "../types/drawer-events"
import type { ShellKitDrawerLabels } from "../types/shell-kit"

// КНОПКА БОКОВОГО ЯЩИКА ЭЛЕМЕНТА В ШАПКЕ ИНСТРУМЕНТА (727-2). Тот же вид, что `DrawerToggle` элемента (shadcn Button + четыре значка
// lucide), но ящик живёт в другом React: кнопка шлёт событие окна, состояние приходит обратным событием (`drawer-events.ts`).
export function KitDrawerToggle({ side, labels }: { side: DrawerSide; labels: ShellKitDrawerLabels }) {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const on = (e: Event) => setOpen(!!(e as CustomEvent<DrawerStateDetail>).detail?.[side])
    window.addEventListener(DRAWER_STATE_EVENT, on)
    return () => window.removeEventListener(DRAWER_STATE_EVENT, on)
  }, [side])
  const Icon = side === "left" ? (open ? PanelLeftClose : PanelLeftOpen) : open ? PanelRightClose : PanelRightOpen
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      data-block={`shell-kit-drawer-toggle-${side}`}
      onClick={() => window.dispatchEvent(new CustomEvent<DrawerToggleDetail>(DRAWER_TOGGLE_EVENT, { detail: { side } }))}
      aria-label={open ? labels.close : labels.open}
      aria-expanded={open}
    >
      <Icon />
    </Button>
  )
}

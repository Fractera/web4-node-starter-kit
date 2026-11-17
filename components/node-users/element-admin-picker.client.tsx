"use client"
// @local — the part «Админ элементов» of the Users tab (778-3): chips by element name with ×, «+» adds one; the create and the edit windows use it

import { Plus, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { isElementAdminRole, type ElementAdmin } from "./use-element-admins.client"

// АДМИН ЭЛЕМЕНТОВ (узел, шаг 778-3). Карточка решения, «1 да» владельца 2026-11-17: в окне пользователя (карандаш) — «Админ
// элементов»: фишки с «+» и «×»; «Создать пользователя» — «выбор элементов по названию». Значение — роли человека целиком: часть меняет
// только роли семейства elementAdmin001…980, остальные проходят как есть. Выдать или снять такую роль может только архитектор — это
// правило элемента входа, отказ приходит с причиной.

export type AdminPickerWords = { label: string; none: string; add: string; remove: string; chip: string }

type Props = { admins: ElementAdmin[]; roles: string[]; onChange: (roles: string[]) => void; words: AdminPickerWords }

export function ElementAdminPicker({ admins, roles, onChange, words }: Props) {
  const held = roles.filter(isElementAdminRole)
  const free = admins.filter((a) => !held.includes(a.role))
  const nameOf = (role: string) => admins.find((a) => a.role === role)?.name ?? role
  return (
    <div className="flex flex-col gap-1.5" data-block="element-admin-picker" data-field="element-admins">
      <Label>{words.label}</Label>
      <div className="flex flex-wrap items-center gap-2">
        {held.length === 0 && <span className="text-sm text-muted-foreground">{words.none}</span>}
        {held.map((role) => (
          <Badge key={role} variant="secondary" className="gap-1 pr-0.5" data-element-admin-chip={role}>
            {words.chip.replace("{name}", nameOf(role))}
            <Button type="button" variant="ghost" size="icon-xs" aria-label={`${words.remove}: ${nameOf(role)}`} onClick={() => onChange(roles.filter((r) => r !== role))}>
              <X data-icon aria-hidden />
            </Button>
          </Badge>
        ))}
        {free.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" size="xs" data-element-admin-add><Plus data-icon aria-hidden />{words.add}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {free.map((a) => <DropdownMenuItem key={a.role} onSelect={() => onChange([...roles, a.role])}>{a.name}</DropdownMenuItem>)}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  )
}

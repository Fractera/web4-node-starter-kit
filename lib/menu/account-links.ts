import type { ShellLink as DrawerLink } from "@/components/shell/shell-types"
import { wordsOf, type WorkspacePageData } from "@/lib/collection/types"
import { ARCHITECT_HOME } from "@/app/[lang]/(architectLayer)/_lib/architect-menu"
import { ARCHITECT_LAYER_ROLES } from "@/lib/roles"
import { data as messenger } from "@/app/[lang]/(architectLayer)/architect/build/messenger/_data"
import { data as h2h } from "@/app/[lang]/(architectLayer)/architect/build/messenger/h2h/_data"
import { data as h2a } from "@/app/[lang]/(architectLayer)/architect/build/messenger/h2a/_data"
import { data as orders } from "@/app/[lang]/(architectLayer)/architect/build/workflow/a2a-orders/_data"
import { data as work } from "@/app/[lang]/(architectLayer)/architect/build/workflow/a2a-work/_data"
import { data as reviews } from "@/app/[lang]/(architectLayer)/architect/build/workflow/reviews/_data"

// СВОИ ПУНКТЫ ЯЩИКА КАБИНЕТА ЯДРА (528-4).
//
// Владелец 2026-10-18: «нам сюда нужно в рабочее пространство добавить А2а Ваши заказы А2а Ваша работа Оставить отзывы»; и о «Главном
// агенте»: «добраться до этих страниц можно двумя способами: первые открыть левое меню … А второй способ попасть туда же это если нажать
// на кнопку личный кабинет и выдвинуть правый ящик … открывать будет одни и те же страницы».
//
// 🔒 ЯЩИК ЯДРА — ОБОЛОЧКА ПРОЕКТА, И ЕЁ ДАННЫЕ ПРИХОДЯТ ОТ САЙТА (285-3): пункты «Группа страниц архитектора» и «Пользователи» отдаёт
// root (`/api/shell/<язык>`, его `lib/menu/account-links.ts`). Этот файл — только то, что знает одно ядро: пять сводных страниц
// «Главного агента». Шапка ядра (`components/menu/top/top-menu.server.tsx`) ставит их перед пунктами сайта.
// 🪦 До 528-4 здесь стоял пункт «Группа страниц архитектора» (268) — копия пункта root, которую не читал никто: шапка ядра с 285-3
// берёт ящик у сайта, и этот файл не был импортирован ни разу (замерено поиском 2026-10-18).
//
// 🔒 АДРЕС И ПОДПИСЬ — У САМОЙ СТРАНИЦЫ (её `_data`), роли — у слоя: копия разошлась бы с дверью, которую открывает пункт.
// Видимость — вежливость, а не защита: замок стоит на слое архитектора.
const page = (lang: string, path: string, p: WorkspacePageData, label?: string): DrawerLink => ({
  href: `/${lang}${ARCHITECT_HOME}/build/${path}`,
  label: label ?? wordsOf(p, lang).title,
  roles: ARCHITECT_LAYER_ROLES,
})

export function accountLinks(lang: string): DrawerLink[] {
  const m = wordsOf(messenger, lang).title
  return [
    page(lang, "messenger/h2h", h2h, `${wordsOf(h2h, lang).title} ${m}`),
    page(lang, "messenger/h2a", h2a, `${wordsOf(h2a, lang).title} ${m}`),
    page(lang, "workflow/a2a-orders", orders),
    page(lang, "workflow/a2a-work", work),
    page(lang, "workflow/reviews", reviews),
  ]
}

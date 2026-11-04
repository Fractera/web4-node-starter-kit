import type { ShellLink as DrawerLink } from "@/components/shell/shell-types"
import { wordsOf, type WorkspacePageData } from "@/lib/collection/types"
import { ARCHITECT_HOME } from "@/app/[lang]/(architectLayer)/_lib/architect-menu"
import { ARCHITECT_LAYER_ROLES } from "@/lib/roles"
import { topMenuUi } from "@/components/menu/top/top-menu.i18n"
import { data as howItWorks } from "@/app/[lang]/(architectLayer)/architect/passport/how-it-works/_data"
import { data as subscription } from "@/app/[lang]/(architectLayer)/architect/build/subscription/_data"
import { data as terminal } from "@/app/[lang]/(architectLayer)/architect/build/terminal/_data"
import { data as telegram } from "@/app/[lang]/(architectLayer)/architect/build/telegram/_data"

// СВОИ ПУНКТЫ ЯЩИКА КАБИНЕТА ЯДРА.
//
// 645-2. Владелец 2026-11-04, после первой установки глазами нового человека: «в нём сейчас огромное количество мусора который мы
// ещё не используем: нужно скрыть все вкладки, а вместо них создать: – как это работает – подписка Cloud Code – терминал – активация
// Telegram». Четыре пункта ведут на страницы, которые уже есть в ядре; пятым остаётся «Группа страниц архитектора»
// (`lib/shell/core-shell-data.ts`, ответ владельца «Оставить пятым»). Тот же набор — в ящике сайта (`fractera-root-starter`, 645-3).
//
// 🪦 СКРЫТО, НЕ УДАЛЕНО (645-2): пять сводных страниц «Главного агента» из 528-4 — H2H и H2A мессенджер, A2A ваши заказы,
// A2A ваша работа, отзывы (`build/messenger/h2h`, `build/messenger/h2a`, `build/workflow/a2a-orders`, `build/workflow/a2a-work`,
// `build/workflow/reviews`). Страницы живы и открываются из левого меню группы; вернуть в ящик — строкой сюда, по слову владельца.
//
// 🔒 АДРЕС И ПОДПИСЬ — У САМОЙ СТРАНИЦЫ (её `_data`), роли — у слоя: копия разошлась бы с дверью, которую открывает пункт. Одно
// исключение — Telegram: страница зовётся «Telegram-бот», а пункт ящика — словами владельца «Активация Telegram» (`top-menu.i18n.ts`).
// Видимость — вежливость, а не защита: замок стоит на слое архитектора.
const page = (lang: string, path: string, p: WorkspacePageData, label?: string): DrawerLink => ({
  href: `/${lang}${ARCHITECT_HOME}/${path}`,
  label: label ?? wordsOf(p, lang).title,
  roles: ARCHITECT_LAYER_ROLES,
})

export function accountLinks(lang: string): DrawerLink[] {
  return [
    page(lang, "passport/how-it-works", howItWorks),
    page(lang, "build/subscription", subscription),
    page(lang, "build/terminal", terminal),
    page(lang, "build/telegram", telegram, topMenuUi(lang).telegramActivation),
  ]
}

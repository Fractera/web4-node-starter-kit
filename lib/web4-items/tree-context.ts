import "server-only"
import { elementMessengers, hasCatalog, isNativeElement } from "@/lib/a2a/element-passport"
import type { TreeContext } from "@/lib/web4-items/item-tree"
import elementApp from "@/lib/web4-items/element-app.cjs"
import { AUTH_ELEMENT, MEMORY_ELEMENTS } from "@/lib/web4-items/built-in-elements"
import web4 from "@/lib/web4-items/element-web4.cjs"
import { paymentOf } from "@/lib/web4-items/payment-elements"
import { holdsApex } from "@/lib/hosting/hostnames.mjs"
import { getService } from "@/lib/microservices/registry"

// КОНТЕКСТ ДЕРЕВА ЭЛЕМЕНТА — ОДНА СБОРКА ДЛЯ МЕНЮ, МАРШРУТА И СПИСКОВ (узел, шаг 553-6; прежде — четыре копии одной строки).
//
// 🎯 Слово владельца 2026-10-21: «А во всех элементах имеет смысл я имею в виду левая меню скрыть вкладки Messenger» — на едином
// проекте. 804-3 (типа узла больше нет): у элемента — части проекта (`app: project`, lib/web4-items/element-app.cjs). Раздел
// «Messenger» помечен в дереве `project: false`; H2A и H2H у части проекта считаются выключенными — Telegram-бот элемента виден в
// «Строительстве» (правило 472, `unless: "h2a"`). Ответ читается из реестра на каждый запрос.

/** Флаги мессенджеров, которые узел учитывает: у части проекта H2A и H2H выключены, A2A — как в паспорте. */
export function effectiveMessengers(id: string): TreeContext["messengers"] {
  const m = elementMessengers(id)
  return elementApp.appOf(id, process.cwd()) === "project" ? { ...m, h2a: false, h2h: false } : m
}

export function treeContextOf(id: string): TreeContext {
  const native = isNativeElement(id)
  return {
    catalog: hasCatalog(id),
    messengers: effectiveMessengers(id),
    native,
    // 854: a native element born on this node with «Создать нативный элемент» (registry `born`) — only it offers itself in a marketplace.
    ownNative: native && !!(getService(id) as { born?: unknown } | null)?.born,
    app: elementApp.appOf(id, process.cwd()) as "project" | "own",
    memory: MEMORY_ELEMENTS.includes(id),
    auth: id === AUTH_ELEMENT,
    // 567-6: вне сети Web4 (паспорт `visibility: node`) меню прячет A2A и «Отзывы»; нет поля — как прежде.
    web4: web4.visibilityOf(id, process.cwd()) !== "node",
    // 573-4: платёжный элемент (паспорт `payment`) — у него «Платежи → Web2» с его ключами, даже у нативного Stripe.
    payment: !!paymentOf(id),
    // 802: the element on the node's apex has no «Домен» page — its domain is the node's, set on «Активация домена».
    apex: holdsApex(id),
  }
}

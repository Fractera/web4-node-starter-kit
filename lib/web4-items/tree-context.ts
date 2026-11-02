import "server-only"
import { elementMessengers, hasCatalog, isNativeElement } from "@/lib/a2a/element-passport"
import type { TreeContext } from "@/lib/web4-items/item-tree"
import nodeType from "@/lib/web4-items/node-type.cjs"
import { AUTH_ELEMENT, MEMORY_ELEMENTS } from "@/lib/web4-items/built-in-elements"
import web4 from "@/lib/web4-items/element-web4.cjs"
import { paymentOf } from "@/lib/web4-items/payment-elements"

// КОНТЕКСТ ДЕРЕВА ЭЛЕМЕНТА — ОДНА СБОРКА ДЛЯ МЕНЮ, МАРШРУТА И СПИСКОВ (узел, шаг 553-6; прежде — четыре копии одной строки).
//
// 🎯 Слово владельца 2026-10-21: «А во всех элементах имеет смысл я имею в виду левая меню скрыть вкладки Messenger» — на едином
// проекте (`nodeType: project`). Раздел «Messenger» помечен в дереве `project: false`; H2A и H2H на едином проекте считаются
// выключенными — Telegram-бот элемента виден в «Строительстве» (правило 472, `unless: "h2a"`). Тип читается на каждый запрос.

/** Флаги мессенджеров, которые узел учитывает: на едином проекте H2A и H2H выключены, A2A — как в паспорте. */
export function effectiveMessengers(id: string): TreeContext["messengers"] {
  const m = elementMessengers(id)
  return nodeType.readNodeType(process.cwd()) === "project" ? { ...m, h2a: false, h2h: false } : m
}

export function treeContextOf(id: string): TreeContext {
  return {
    catalog: hasCatalog(id),
    messengers: effectiveMessengers(id),
    native: isNativeElement(id),
    nodeType: nodeType.readNodeType(process.cwd()) as "project" | "factory",
    memory: MEMORY_ELEMENTS.includes(id),
    auth: id === AUTH_ELEMENT,
    // 567-6: вне сети Web4 (паспорт `visibility: node`) меню прячет A2A и «Отзывы»; нет поля — как прежде.
    web4: web4.visibilityOf(id, process.cwd()) !== "node",
    // 573-4: платёжный элемент (паспорт `payment`) — у него «Платежи → Web2» с его ключами, даже у нативного Stripe.
    payment: !!paymentOf(id),
  }
}

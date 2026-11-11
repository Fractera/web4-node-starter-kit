import type { PageItem } from '@/lib/content/sections/types'

// 280-11b: кнопка развёртывания и список элементов узла (слово владельца 2026-09-24: «именно здесь я
// предлагаю разместить кнопку повторить развёртывание … выборочно … либо одного из сервисов либо сразу
// всех одной кнопкой»). История версий — позже.
export function content(lang: string): PageItem[] {
  return [{ kind: 'deployBoard', lang }]
}

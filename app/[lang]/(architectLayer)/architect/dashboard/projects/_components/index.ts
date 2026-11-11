import type { PageItem } from '@/lib/content/sections/types'

// СОДЕРЖИМОЕ СТРАНИЦЫ «Проекты» (339). Таблица всех WEB4 ITEMS узла — вид каталога `projectsBoard`: страница предрендерена,
// поэтому строки спрашиваются в браузере у двери `/api/node/projects`, а не читаются здесь при сборке.
export function content(lang: string): PageItem[] {
  return [{ kind: 'projectsBoard', lang }]
}

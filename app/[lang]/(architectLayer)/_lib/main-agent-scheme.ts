// МЕНЮ «ГЛАВНОГО АГЕНТА» = МЕНЮ ЭЛЕМЕНТА (шаг 528-6). Владелец 2026-10-18: «Подвергни критическому анализу соответствия и отставание
// меню главного агента меню элементы. Приведи в соответствие»; раньше: «core it is main agent - need similar scheme».
//
// 🔒 АДРЕСА СТРАНИЦ ЯДРА НЕ МЕНЯЮТСЯ — МЕНЯЕТСЯ ИХ МЕСТО В МЕНЮ. Подписку Claude Code, Терминал и Telegram-бот ставит общий комплект
// агента строго в `build/<имя>` (его шаблоны завязаны на глубину папки), у GitHub внутри папки живут двери `build/github/api/*`, ссылку на
// `build/environment` несут копии комплекта всех служб. Переезд папок задел бы общий комплект (закон 2026-10-06: только с вопросом
// владельцу) и двери. Поэтому страница остаётся по своему адресу, а здесь сказано, под каким пунктом меню она стоит.
// 🔒 КЛЮЧ — имя папки в `architect/build/`, ЗНАЧЕНИЕ — путь пункта-родителя от `architect/build/` (сам родитель — настоящая страница
// со своим адресом: оглавление `build/construction`, `build/i2i`, `build/documents` или `build/messenger/h2a`). Порядок внутри
// родителя — `meta.order` страниц, как везде в слое.
// 🔒 ПОЛНОТУ СТЕРЕЖЁТ `scripts/check-main-agent-menu.mjs` (prebuild): страница главного агента без места и место без страницы — отказ
// сборки; Messenger и Рабочий процесс сверяются с деревом элемента `lib/web4-items/item-tree.ts`.
// Законные различия с элементом (не отставание): «Живой сайт» — у ядра нет своего сайта (сайт узла — root); «Настройки» элемента — у ядра
// это группа «Домен и хостинг», а удалить ядро нельзя; f2f и «Проектирование продукта» — ядро не элемент.

export const MAIN_AGENT = 'build'

/** Пункты верхнего уровня главного агента — как разделы элемента; всё остальное обязано иметь место ниже. */
// 558-3 (владелец 2026-10-21): «Автоматизированное управление» — свой раздел главного агента (у элемента его нет: это не страница дерева).
export const MAIN_AGENT_TOP = ['messenger', 'workflow', 'automation', 'construction', 'settings'] as const

export const MAIN_AGENT_PLACE: Record<string, string> = {
  // «Строительство» — как у элемента: GitHub, подписка, терминал, развёртывание, переменные, i2i, Документы.
  github: 'construction',
  subscription: 'construction',
  terminal: 'construction',
  deployments: 'construction',
  environment: 'construction',
  i2i: 'construction',
  documents: 'construction',
  // i2i главного агента — его двери: карта API и MCP.
  'api-map': 'i2i',
  mcp: 'i2i',
  // «Документы» — в порядке документов элемента.
  instruction: 'documents',
  skills: 'documents',
  'docs-registry': 'documents',
  'step-current': 'documents',
  'steps-new': 'documents',
  'steps-done': 'documents',
  glossary: 'documents',
  backlog: 'documents',
  cancelled: 'documents',
  'anti-patterns': 'documents',
  'translation-debt': 'documents',
  'task-add': 'documents',
  // 472: у элемента с H2A Telegram-бот живёт в Messenger → H2A; бот главного агента — там же.
  telegram: 'messenger/h2a',
}

/**
 * Путь страницы ядра в дереве элемента, когда это та же страница (Messenger и Рабочий процесс главного агента ведут к ней у каждого
 * элемента); `null` — своя страница ядра. Сторож сверяет эти пути с деревом элемента.
 */
export function elementPathOf(rel: string): string | null {
  // 530-1: и «Настройки → Платежи» — та же страница у элемента.
  return rel.startsWith('messenger') || rel.startsWith('workflow') || rel.startsWith('settings') ? rel : null
}

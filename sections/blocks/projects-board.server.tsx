import type { SectionRenderer } from '@/sections/contract'
import { tableUi } from '@/sections/table.i18n'
import { ProjectsBoard, type ProjectsBoardWords } from '@/components/dashboard/projects-board.client'

// ТАБЛИЦА ПРОЕКТОВ УЗЛА (339): слова берутся здесь, на сервере, и уходят островку пропсами. Порядок колонок — слово владельца.
const WORDS: Record<string, Omit<ProjectsBoardWords, 'table'>> = {
  en: {
    loading: 'Asking the node about its WEB4 ITEMS…',
    unavailable: 'The node did not answer, so the table is not shown.',
    native: 'Show native ITEMS',
    custom: 'Show custom ITEMS',
    customWeb4: 'Show custom WEB4 ITEMS',
    head: ['#', 'Service address', 'Meta title', 'Meta description', 'Own domain', 'For sale in web4', 'Last commit', 'Status', 'Date', 'Commits', 'Link', 'Open', 'Users online'],
    status: { running: 'running', stopped: 'stopped', building: 'building', unborn: 'not born yet', off: 'turned off' },
    openLabel: 'Open',
  },
  ru: {
    loading: 'Спрашиваю узел о его WEB4 ITEMS…',
    unavailable: 'Узел не ответил, поэтому таблица не показана.',
    native: 'Показывать нативные ITEMS',
    custom: 'Показывать кастомные ITEMS',
    customWeb4: 'Показывать кастомные WEB4 ITEMS',
    head: ['№', 'Служебный адрес', 'Заголовок из мета', 'Описание из мета', 'Свой домен', 'На продаже в web4', 'Последний коммит', 'Статус', 'Дата', 'Коммитов', 'Ссылка', 'Открыть', 'Пользователи онлайн'],
    status: { running: 'работает', stopped: 'остановлен', building: 'идёт сборка', unborn: 'ещё не рождён', off: 'выключен' },
    openLabel: 'Открыть',
  },
}

export const projectsBoard: SectionRenderer<'projectsBoard'> = (b, { key: k }) => (
  <ProjectsBoard key={k} lang={b.lang} words={{ ...(WORDS[b.lang] ?? WORDS.en), table: tableUi(b.lang) }} />
)

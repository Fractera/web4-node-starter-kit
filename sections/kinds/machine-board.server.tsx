import type { SectionRenderer } from '@/sections/contract'
import { superNodeUi } from '@/components/super-node/super-node.i18n'
import { MachineBoard, type MachineBoardWords } from '@/components/dashboard/machine-board.client'

// «ЭТОТ КОМПЬЮТЕР» (572): слова берутся здесь, на сервере, и уходят островку пропсами (словарь в браузер не уезжает).
const WORDS: Record<string, Omit<MachineBoardWords, 'superNode'>> = {
  en: {
    loading: 'Measuring this computer…',
    unavailable: 'The node did not answer, so the measurements are not shown.',
    refresh: 'Refresh',
    machineTitle: 'This computer',
    machineLead: 'The machine the node runs on, measured when the page opens and when you press Refresh.',
    facts: { platform: 'System', cpu: 'Processor', cores: 'Cores', ram: 'Memory', disk: 'Disk of the node folder', uptime: 'Running without a restart', node: 'Node.js' },
    free: 'free',
    hours: 'h',
    notMeasured: 'not measured',
    memoryTitle: 'What uses the memory',
    memoryLead: 'How much memory each element of the node holds right now: its process and its watcher, by pm2. A turned-off element holds none.',
    memoryUnavailable: 'pm2 did not answer, so the memory per element is not known.',
    memoryHead: ['Element', 'Process', 'Watcher', 'Total', 'State'],
    kinds: { core: 'core of the node', resident: 'node resident' },
    status: { online: 'running', stopped: 'stopped', errored: 'error', off: 'turned off', 'not-running': 'not running' },
    total: 'Total',
    tier2Title: 'This computer and the super-node profile',
    tier2Lead: 'Lagrix Tier-2 is the starting point for a super-node server (document 14). A super-node runs on its own machine; this is only a comparison.',
    tier2: { title: 'Measured {date}', ok: 'This computer satisfies the measured part of the Tier-2 profile.', short: 'Below the Tier-2 profile: {list}.', head: ['Parameter', 'Tier-2', 'This computer', 'Lagrix'] },
  },
  ru: {
    loading: 'Меряю этот компьютер…',
    unavailable: 'Узел не ответил, поэтому замер не показан.',
    refresh: 'Обновить',
    machineTitle: 'Этот компьютер',
    machineLead: 'Машина, на которой работает узел: замер при открытии страницы и по кнопке «Обновить».',
    facts: { platform: 'Система', cpu: 'Процессор', cores: 'Ядра', ram: 'Память', disk: 'Диск папки узла', uptime: 'Работает без перезагрузки', node: 'Node.js' },
    free: 'свободно',
    hours: 'ч',
    notMeasured: 'не измерено',
    memoryTitle: 'Что ест память',
    memoryLead: 'Сколько памяти держит каждый элемент узла прямо сейчас: его процесс и сторож, по данным pm2. Выключенный элемент не держит ничего.',
    memoryUnavailable: 'pm2 не ответил, поэтому память по элементам неизвестна.',
    memoryHead: ['Элемент', 'Процесс', 'Сторож', 'Всего', 'Состояние'],
    kinds: { core: 'ядро узла', resident: 'житель узла' },
    status: { online: 'работает', stopped: 'остановлен', errored: 'ошибка', off: 'выключен', 'not-running': 'не запущен' },
    total: 'Итого',
    tier2Title: 'Этот компьютер и профиль супер-узла',
    tier2Lead: 'Lagrix Tier-2 — отправная точка для сервера супер-узла (документ 14). Супер-узел работает на своей машине; здесь только сравнение.',
    tier2: { title: 'Замер {date}', ok: 'Этот компьютер удовлетворяет измеренной части профиля Tier-2.', short: 'Ниже профиля Tier-2: {list}.', head: ['Параметр', 'Tier-2', 'Этот компьютер', 'Lagrix'] },
  },
}

export const machineBoard: SectionRenderer<'machineBoard'> = (b, { key: k }) => (
  <MachineBoard key={k} lang={b.lang} words={{ ...(WORDS[b.lang] ?? WORDS.en), superNode: superNodeUi(b.lang) }} />
)

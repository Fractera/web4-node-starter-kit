import ItemPage, { generateMetadata as itemMetadata } from '../../[item]/[[...page]]/page'

// 557: СТРАНИЦЫ ДЕРЕВА ЭЛЕМЕНТА У ВСТРОЕННОГО «blocks» — Строительство, Документы, GitHub, Развёртывания, Настройки… Папка службы
// статическая и перехватывает адрес раньше страницы элемента `[item]`; её свои страницы (Живой сайт, Терминал, Подписка, Telegram) остаются
// на месте, а всё остальное дерево отдаёт та же страница элемента ядра. Устройство — `lib/web4-items/built-in-elements.ts`.
type Params = { lang: string; page: string[] }
const as = (params: Promise<Params>) => params.then((p) => ({ ...p, item: 'blocks' }))

export const generateMetadata = ({ params }: { params: Promise<Params> }) => itemMetadata({ params: as(params) })

export default function Page({ params }: { params: Promise<Params> }) {
  return ItemPage({ params: as(params) })
}

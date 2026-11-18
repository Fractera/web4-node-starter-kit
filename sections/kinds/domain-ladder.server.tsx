import type { SectionRenderer } from '@/sections/contract'
import { DomainList } from '@/components/domain/domain-list.client'
import { appDialogUi } from '@/components/dialog/app-dialog.i18n'
import { domainListWords } from '@/components/domain/domain-list.i18n'
import { DomainRegistrars } from '@/components/domain/domain-registrars.client'

// Лестница подключения своего домена (259-1).
//
// 🔒 ВИД БЛОКА, А НЕ ПРАВКА СТРАНИЦЫ. Страницы коллекции собираются из секций
// каталога; работающая часть входит туда своим видом, как `chat` или `voiceField`.
// Вставь мы островок мимо каталога — появился бы второй способ класть на страницу
// живое, и панель, читающая `SECTIONS.json`, о нём бы не знала.
//
// 🔒 СЛОВА ПРИХОДЯТ В БЛОКЕ, А НЕ БЕРУТСЯ ЗДЕСЬ: рисовальщик серверный, язык
// известен странице, и словарь остаётся на сервере целиком.
// 324-1: ДОМЕНЫ УЗЛА СПИСКОМ — лестница стала первой карточкой аккордеона (основной домен), за ней дополнительные домены и
// «Добавить домен». Вид секции тот же: второй вид ради одной обёртки завёл бы вторую точку входа того же знания.
// 742-2: the computer's ladder (Cloudflare, a tunnel, a copy for an offline computer) and its notes live only on a person's computer —
// `data-place="home"` hides them on a server node, whose own ladder the page's island shows instead (`styles/globals.css`, `NodeAlerts`).
// ✗ Measured 2026-11-14 on aifa.dev: a server with its domain on showed «Ключ Cloudflare узла требует внимания» and «Адрес узла:
// http://localhost:24680».
// 775 (the owner, 2026-11-17: «информация как зарегистрировать … должна быть вынесено вниз после воздуха после второго элемента про
// дополнительные домены … отдельной карточкой аккордеона где зарегистрировать»): the two sections, real air, then the cards that
// explain rather than act — where to register a domain, and the computer's notes.
// 775 (the owner, 2026-11-17, Telegram 406–411; the skill interface-design, card 409): three parts in ONE rhythm — 48 px from the page's
// lead to the first and between all of them: the main domain, the additional domains, «Где зарегистрировать домен». No «Подробнее», no
// page topics, no notes («Слишком много мусора»).
// 799 (the owner, 2026-11-18): the additional domains show on a server too — only the main domain's section and the registrars card stay
// this computer's (`data-place="home"` moved onto them).
export const domainLadder: SectionRenderer<'domainLadder'> = (b, { key: k }) => (
  <div key={k} data-block="domain-ladder-home" className="mt-8 flex flex-col gap-12">
    <DomainList lang={b.lang} dialogUi={appDialogUi(b.lang)} words={domainListWords(b.lang)} ladderWords={b.words} />
    <div data-block="domain-registrars-home" data-place="home"><DomainRegistrars words={b.words} /></div>
  </div>
)

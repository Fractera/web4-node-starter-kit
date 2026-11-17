import type { SectionRenderer } from '@/sections/contract'
import { DomainLadder } from '@/components/domain/domain-ladder.client'
import { DomainList } from '@/components/domain/domain-list.client'
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
// 775 (the owner, after the first try: «не было выполнено ни на 1%»): the page holds the two sections and the registrars' card — nothing
// else. The page's topics and the computer's notes are folded inside the main domain section's «Подробнее» (rendered here, on the server).
export const domainLadder: SectionRenderer<'domainLadder'> = (b, { key: k, lang, ui, renderPage }) => (
  <div key={k} data-block="domain-ladder-home" data-place="home" className="flex flex-col gap-16">
    <DomainList
      lang={b.lang}
      words={domainListWords(b.lang)}
      ladderWords={b.words}
      ladder={<DomainLadder lang={b.lang} words={b.words} />}
      topics={b.topics?.length ? renderPage(b.topics, lang, ui, `${k}-topics`) : null}
      notes={b.notes?.length ? renderPage(b.notes, lang, ui, `${k}-notes`) : null}
    />
    <DomainRegistrars words={b.words} />
  </div>
)

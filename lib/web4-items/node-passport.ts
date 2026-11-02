import "server-only"

import { diskPassport } from "@/lib/web4-items/dashboard-rows"
import { registryDescription, TASK as DESCRIBE_TASK } from "@/lib/web4-items/element-describe"
import { addressOf } from "@/lib/web4-items/address-file.mjs"
import { listServices } from "@/lib/microservices/registry"
import { listDrafts } from "@/lib/web4-items/drafts"
import power from "@/lib/web4-items/element-power.cjs"
import paths from "@/lib/web4-items/paths.cjs"
import elementProps from "@/lib/web4-items/element-props.cjs"
import { terminalLink } from "@/app/[lang]/(architectLayer)/architect/kits/_agent-kit/core/client/terminal-paste.mjs"

// КАРТОЧКИ ЭЛЕМЕНТОВ «ПАСПОРТА» УЗЛА (478-1). Слово владельца 2026-10-14: «для каждого элемента покажи его название, и …
// описание которое отображает первые несколько строк, чтобы оно раскрывалось как аккордеон … если описание ещё не существует …
// красную кнопку сгенерировать описание … на самой карточке слева отрисовать красную точку».
//
// 🔒 «ОПИСАНИЕ ЕСТЬ» = В РЕЕСТРЕ СТОИТ `described`: её ставит только «Забрать в ядро» (325) после проверки, что текст не шаблонный.
// Начало описания до этого — короткое описание из паспорта элемента или мета его главной (как в «Проектах»), полный текст — из реестра.
// 🔒 КНОПКА ВЕДЁТ В УЖЕ РАБОТАЮЩУЮ ГЕНЕРАЦИЮ (выбор владельца 2026-10-14: «Вести в генерацию»): терминал элемента с задачей
// `TASK` из `element-describe`, та же ссылка, что в «Настройках». Новой генерации нет.
// 🔒 В ПАСПОРТЕ — ROOT И КАСТОМНЫЕ ЭЛЕМЕНТЫ: нативные службы узла (auth, data, config, design, blocks) рейтинга не несут.
// 🛑 Репутация элемента (исполнитель и заказчик, вес лайков и дизлайков) — источника нет, пока нет сети Lagrix: `null` = «не знаю».

export type PassportCard = {
  id: string
  custom: boolean
  name: string
  /** Начало описания: описание из реестра, иначе короткое из паспорта элемента или мета главной. */
  lead: string | null
  /** Полный текст описания и что элемент даёт — только когда описание забрано в ядро. */
  summary: string | null
  provides: string[]
  described: boolean
  /** Страница элемента в ядре, без языка. */
  open: string
  /** Терминал элемента с задачей «опиши себя»; у нерождённого черновика — `null`. */
  generate: string | null
  /** 567: причина, если элемент выключен (признак узла); включён — `null`. */
  off: string | null
  /** 566: элемент в сети Web4 — паспорт `visibility: network`. */
  web4: boolean
  reputation: null
}

// 567-7 (владелец 2026-10-22: «каждый раз когда в паспорте подгружаются элементы … это занимает слишком много времени … Подтверди что
// никакие лишние данные не загружаются»). ✗ До 567-7 карточки строились из `projectRows` — всей таблицы «Проектов»: на каждый элемент узла,
// и нативный, который паспорт тут же отбрасывал, — два `git`, полная главная страница и паспорт по HTTP; дверь отвечала ~3 с. Паспорту
// из этого нужны только адрес, описание, тип и признак выключения — всё лежит на диске узла, поэтому здесь ни одного запроса к элементам.
// Порядок тот же, что в «Проектах»: службы реестра, затем черновики — новые сверху.
export async function passportCards(lang: string): Promise<PassportCard[]> {
  const services = listServices()
  const byId = new Map(services.map((s) => [s.id, s]))
  const drafts = listDrafts()
  const customIds = new Set(drafts.map((x) => x.id))
  const ids = [...services.filter((s) => !customIds.has(s.id)).map((s) => s.id), ...drafts.map((x) => x.id)]
  // 478-1, владелец 2026-10-14: «Кроме root, нативные элементы должны быть скрыты … мы показываем там рут, и все кастомные элементы».
  return ids.flatMap((id) => {
    const entry = byId.get(id) ?? null
    const own = entry ? diskPassport(entry) : { short: null, native: false }
    const custom = customIds.has(id) && !own.native
    if (!custom && id !== "root") return []
    const d = registryDescription(id)
    const slug = addressOf(id)
    const off = entry ? power.offOf(entry) : null
    return [{
      id,
      custom,
      name: slug,
      lead: d?.summary ?? own.short,
      summary: d?.summary ?? null,
      provides: d?.provides ?? [],
      described: d !== null,
      open: `/architect/${slug}`,
      generate: entry ? terminalLink({ lang, service: `${slug}/build`, text: DESCRIBE_TASK }) : null,
      off: off ? power.reasonIn(off, lang) ?? "" : null,
      web4: entry ? elementProps.readElementProps(paths.entryDir(entry))?.visibility === "network" : false,
      reputation: null,
    }]
  })
}

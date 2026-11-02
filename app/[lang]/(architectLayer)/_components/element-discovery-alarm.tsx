import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import type { ElementHomeUi } from "../_i18n/element-home.i18n"

// ТРЕВОГА «ЭЛЕМЕНТ НЕ НАЙДУТ» (551-2). Владелец 2026-10-20: «это же вкладка должна возвращать тревожную информацию если для элемента
// до сих пор не создано описание и карточка a2a. С подсказкой пока не будет создана карточка протокола 2а2 этот элемент будет
// недоступен для обнаружения в web4 сети».
// Горит, пока нет одного из двух фактов: описание забрано в ядро (`described` реестра — его ставит только «Забрать в ядро» или
// `npm run describe:publish` агента) и визитка A2A собирается из паспорта без ошибок (`published`). Под словами владельца — какого
// факта нет; кнопка — та же задача «опиши себя», что в «Опасной зоне» и в Паспорте узла.
export function ElementDiscoveryAlarm({ ui, described, card, orderHref }: { ui: ElementHomeUi; described: boolean; card: boolean; orderHref: string }) {
  if (described && card) return null
  return (
    <div role="alert" className="flex flex-col gap-3 rounded-lg border-2 border-destructive/60 bg-destructive/10 px-4 py-3 text-sm" data-discovery-alarm>
      <p className="font-medium text-foreground">{ui.alarmTitle}</p>
      <ul className="ml-5 list-disc text-muted-foreground">
        {!described && <li data-alarm-reason="description">{ui.noDescription}</li>}
        {!card && <li data-alarm-reason="card">{ui.noCard}</li>}
      </ul>
      <Link href={orderHref} className={buttonVariants({ variant: "destructive", size: "sm", className: "self-start" })}>{ui.order}</Link>
    </div>
  )
}

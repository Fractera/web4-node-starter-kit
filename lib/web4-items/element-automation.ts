import "server-only"
import { readPassport, writePassportField } from "@/lib/web4-items/passport-file"

// АВТОМАТИЗАЦИЯ ЭЛЕМЕНТА: ВКЛЮЧЕНА ИЛИ НЕТ (551-3). Владелец 2026-10-20: «На вкладкеКрон автоматизации нужен switch переключатель
// использовать автоматизацию или не использовать … В own-service-props должно существовать запись о том используется ли в данный
// момент в элементе автоматизация имеется в виду включена она или нет».
// 🔒 ПОЛЕ `automation.cron` ПАСПОРТА: `false` — сервер элемента не выполняет ни одной записи расписания (исполнитель читает поле раз в
// минуту); поля нет — включено, как у элементов до 551. Сами записи расписания (`data/cron.json`, вне git) переключатель не трогает.
// 🔒 НАРУЖУ НЕ ИДЁТ: публичная дверь паспорта элемента отдаёт поля поимённо, этого среди них нет.

export type ElementAutomation = { cron: boolean }

/** Проверка тела двери: `{ cron: true|false }`, иначе `bad-switch`. */
export function parseAutomation(body: unknown): { ok: true; value: ElementAutomation } | { ok: false; error: "bad-switch" } {
  const cron = (body as { cron?: unknown } | null)?.cron
  return typeof cron === "boolean" ? { ok: true, value: { cron } } : { ok: false, error: "bad-switch" }
}

/** Состояние из паспорта; `saved` — записано ли поле. Паспорта нет — `null`. */
export async function readAutomation(id: string): Promise<{ automation: ElementAutomation; saved: boolean } | null> {
  const raw = await readPassport(id)
  if (!raw) return null
  const got = parseAutomation(raw.automation)
  return got.ok ? { automation: got.value, saved: true } : { automation: { cron: true }, saved: false }
}

export async function saveAutomation(id: string, value: ElementAutomation): Promise<boolean> {
  return writePassportField(id, "automation", value)
}

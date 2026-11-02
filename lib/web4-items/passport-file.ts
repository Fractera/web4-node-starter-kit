import "server-only"
import { existsSync } from "node:fs"
import { readFile, rename, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { elementDir } from "@/lib/web4-items/element-github"
import elementProps from "@/lib/web4-items/element-props.cjs"

// ЗАПИСЬ ПОЛЯ ПАСПОРТА ЭЛЕМЕНТА ИЗ ЯДРА — ОДНО МЕСТО (551-3; прежде жила внутри настроек Messenger, 528-2). Писатели: настройки
// Messenger (`messengerSettings`), автоматизация (`automation`), платежи (`payments`). Три копии одного правила разошлись бы молча.
// 🔒 Остальные поля и их порядок не трогаются; переводы строк файла (CRLF) сохраняются; запись — через временный файл и `rename`,
// асинхронно (дверь ядра не держит цикл событий, 325-6).
// 🔒 Файл паспорта — в git элемента: до следующего коммита «Развёртывания» покажут его незакоммиченным. Сервер элемента читает паспорт
// на каждый запрос, исполнитель крона — раз в минуту: правка действует без сборки.

/** Файл паспорта элемента: новая раскладка (`OWN-SERVICE-PROPS/OWN-SERVICE-PROPS.json`), иначе прежний файл в корне. */
export function passportFile(id: string): string | null {
  const dir = elementDir(id)
  if (!dir) return null
  for (const rel of [elementProps.PASSPORT, elementProps.OLD]) {
    const p = join(dir, rel)
    if (existsSync(p)) return p
  }
  return null
}

/** Паспорт как объект; нет файла или он не читается — `null`. */
export async function readPassport(id: string): Promise<Record<string, unknown> | null> {
  const file = passportFile(id)
  if (!file) return null
  try {
    return JSON.parse(await readFile(file, "utf8")) as Record<string, unknown>
  } catch {
    return null
  }
}

/** Записать одно поле паспорта; `undefined` снимает поле. Паспорта нет или он не читается — `false`. */
export async function writePassportField(id: string, field: string, value: unknown): Promise<boolean> {
  const file = passportFile(id)
  if (!file) return false
  let text: string
  let raw: Record<string, unknown>
  try {
    text = await readFile(file, "utf8")
    raw = JSON.parse(text) as Record<string, unknown>
  } catch {
    return false
  }
  if (value === undefined) delete raw[field]
  else raw[field] = value
  let out = `${JSON.stringify(raw, null, 2)}\n`
  if (text.includes("\r\n")) out = out.replace(/\n/g, "\r\n")
  const tmp = `${file}.tmp-${process.pid}`
  await writeFile(tmp, out, "utf8")
  await rename(tmp, file)
  return true
}

import "server-only"
import { existsSync, mkdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"

// ПЕРВОЕ ЗАДАНИЕ УЗЛА (шаг 587-4). Владелец 2026-10-24: человек пишет задание на главной root, входит — и задание ждёт его агента:
// «в терминале срабатывает логика если есть такая запись то подставить её как в техническое задание в терминал, сразу после
// подтверждения папки. Если же пользователь активировать Telegram … сразу же отправляются это задание».
// 🔒 ОДНО задание на узел, на диске узла (`data/node/first-task.json`), запись атомарная. Кто его забрал (терминал главного агента или
// Telegram, 587-5) — тот удаляет запись: второй его уже не видит.

export type FirstTask = { text: string; from: string | null; at: string }

const FILE = () => join(process.cwd(), "data", "node", "first-task.json")

export function readFirstTask(): FirstTask | null {
  if (!existsSync(FILE())) return null
  try {
    const j = JSON.parse(readFileSync(FILE(), "utf8")) as Partial<FirstTask>
    return typeof j.text === "string" && j.text.trim() ? { text: j.text, from: j.from ?? null, at: j.at ?? "" } : null
  } catch {
    return null
  }
}

export function writeFirstTask(text: string, from: string | null): FirstTask {
  const task: FirstTask = { text: text.trim().slice(0, 4000), from, at: new Date().toISOString() }
  mkdirSync(dirname(FILE()), { recursive: true })
  const tmp = `${FILE()}.${process.pid}.${Date.now()}.tmp`
  writeFileSync(tmp, JSON.stringify(task, null, 2) + "\n", "utf8")
  renameSync(tmp, FILE())
  return task
}

/** Забрать задание: вернуть и удалить. Нет задания — null. */
export function takeFirstTask(): FirstTask | null {
  const task = readFirstTask()
  if (task) try { unlinkSync(FILE()) } catch { /* уже забрано */ }
  return task
}

import "server-only"
import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"

// РЕЖИМ ЛЕВОГО МЕНЮ ЯДРА (шаг 657). Слово владельца 2026-11-05: «Изменить интерфейс левого меню ядра так как он сейчас выглядит
// слишком перегруженным а наш фокус: пользователь должен работать только через Telegram … Рекомендуемый режим минимальные настройки
// по умолчанию, полные для глубокого управления настройки»; где хранится — «Один на весь узел (Рекомендую)».
//
// 🔒 ОДИН НА УЗЕЛ, А НЕ НА БРАУЗЕР: архитектор видит одно и то же меню на компьютере и в телефоне. Файл — данные узла
// (`data/node/menu.json`, вне git, переживает пересборку); нет файла или чужое значение — `compact`, рекомендованный режим.
// Меню читает его при отрисовке страницы (как черновики, `draft-menu.tsx`) — без опроса: страницы архитектора ничего не спрашивают
// без щелчка. Пишет его только дверь `/api/node/menu-mode`, после записи она перерисовывает слой.

export type MenuMode = "compact" | "full"

const fileOf = (root: string) => join(root, "data", "node", "menu.json")

/** Режим меню узла: `full` — только когда так записано; всё остальное — `compact`. */
export function readMenuMode(root: string = process.cwd()): MenuMode {
  try {
    return (JSON.parse(readFileSync(fileOf(root), "utf8")) as { mode?: unknown }).mode === "full" ? "full" : "compact"
  } catch {
    return "compact"
  }
}

/** Записать режим целиком через временный файл: прерванная запись не оставляет половину JSON. */
export function writeMenuMode(mode: MenuMode, root: string = process.cwd()): void {
  const file = fileOf(root)
  mkdirSync(dirname(file), { recursive: true })
  const tmp = `${file}.${process.pid}.tmp`
  writeFileSync(tmp, JSON.stringify({ mode, at: new Date().toISOString() }, null, 2) + "\n")
  renameSync(tmp, file)
}

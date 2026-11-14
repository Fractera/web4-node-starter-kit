// 🔒 ОБХОД ВХОДА ДЛЯ `proxy.ts` — ТО ЖЕ ПРАВИЛО, ЧТО В `auth-bypass.ts` (шаг 520; 741-3).
//
// Только режим разработки. 🪦 741-3 (владелец утвердил 2026-11-14): флаг старой серверной линии `FRACTERA_IP_NODOMAIN_MODE` убран — он
// пропускал `/api/*` без сессии, если кто-то вписывал его в окружение; узел его не ставит никогда.
// 🪦 Прежнее объяснение отдельного файла — «прокси исполняется в Edge, где нет `node:fs`» — неверно для Next.js 16.2: прокси работает в
// Node.js (`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md:219`). Файл оставлен ради импортов прокси.
//
// 🚫 НЕ ИМПОРТИРОВАТЬ ЭТОТ ФАЙЛ НИГДЕ, КРОМЕ `proxy.ts`. Любое место, где решается доступ по существу, берёт `shouldBypassAuth` из
// `auth-bypass.ts`.
export function shouldBypassAuthEdge(): boolean {
  return process.env.NODE_ENV === "development"
}

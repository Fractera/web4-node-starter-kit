import { readFileSync, statSync } from "node:fs"
import { join } from "node:path"
import type { NextRequest } from "next/server"
import { isShowcaseHostname, isShowcaseOrigin } from "./showcase"
import { requestHostname, showcaseFor } from "@/lib/auth/request-signs.mjs"

// СЕРВЕРНАЯ ПОЛОВИНА ПРИЗНАКА ВИТРИНЫ (256-1, 741-3).
//
// 🔒 ПРАВИЛО ОДНО и живёт в `lib/showcase.ts`: адрес целиком равен `SHOWCASE_ORIGIN`. Здесь — ответ на вопрос «чей адрес брать»: из
// настроек этого узла на диске (`APP-CONFIG/app-config.json`, тот же файл, что читает `getAppConfig()`).
//
// 🔒 741-3 (владелец утвердил 2026-11-14: «да, утверждаю 741 и D31–D37 -> go») — ВИТРИНА ТРЕБУЕТ ДВУХ ФАКТОВ: узел НАСТРОЕН как
// fractera.ai и запрос пришёл по этому имени. ✗ Прежде запрос «спрашивал себя сам» по одному `Host`: через nginx сервера любой присылал
// `Host: fractera.ai` и получал на ЧУЖОМ узле сессию витрины со всеми ролями (измерено на тестовом сервере 2026-11-14). Настройки гостя
// никогда не равны fractera.ai — значит, никакое имя не включит витрину у гостя. Цена названа: узел витрины обязан нести в своих
// настройках адрес `https://fractera.ai` (в репозитории ядра там стоит другой адрес — его меняют при запуске витрины, шаг 738-9).
//
// 🪦 Разделение «прокси спрашивает запрос, сборка — настройки» держалось на том, что `proxy.ts` будто бы работает в среде Edge без
// диска. ✗ Неверно для Next.js 16.2: прокси исполняется в Node.js (`node_modules/next/dist/docs/…/proxy.md:219`), и `mirror-redirect.ts`
// уже читал в нём файлы. Поэтому адрес читается здесь простым чтением с кэшем по времени правки — без `react` (`getAppConfig` обёрнут в
// `cache` из React и прокси его не ввозит).

const CONFIG = process.env.APP_CONFIG_PATH ?? join(process.cwd(), "APP-CONFIG", "app-config.json")
let cached: { mtime: number; url: string } | null = null

/** Адрес сайта из настроек этого узла (пустая строка — настроек нет). */
export function configuredSiteUrl(): string {
  try {
    const mtime = statSync(CONFIG).mtimeMs
    if (cached?.mtime === mtime) return cached.url
    const raw = (JSON.parse(readFileSync(CONFIG, "utf8")) as { url?: unknown }).url
    cached = { mtime, url: typeof raw === "string" ? raw : "" }
    return cached.url
  } catch {
    return ""
  }
}

/**
 * Собран ли этот экземпляр КАК ВИТРИНА — его настройки называют fractera.ai.
 *
 * Спрашивают метаданные страниц, карта сайта, `robots.txt`, запрет записи в базу — у них нет запроса.
 */
export function isShowcaseBuild(): boolean {
  return isShowcaseOrigin(configuredSiteUrl())
}

/**
 * Пришёл ли запрос НА витрину: узел настроен как витрина И запрос пришёл по её имени (741-3).
 *
 * Запроса нет (серверный вызов внутри процесса) — `false`: молчаливая выдача прав тому, чьё происхождение неизвестно, и есть тот класс
 * дефекта, которым оплачен `auth-bypass.ts`.
 */
export function isShowcaseRequest(req?: NextRequest): boolean {
  if (!req) return false
  return showcaseFor(configuredSiteUrl(), requestHostname((name: string) => req.headers.get(name)), isShowcaseOrigin, isShowcaseHostname)
}

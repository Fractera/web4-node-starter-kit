// THE PROXY OF A PERSON'S COMPUTER (node step 744-1; the owner, 2026-11-14: «прокси для сервера и прокси для локальной машины это
// разные файлы»). Chosen by `proxy.ts` when the place record says «home». What only a computer has: the quick tunnel's TEMPORARY
// ADDRESS — the panel read-only to anyone with the link (243, 372-1), its sign-in links answered by a warning page (257-8). The owner
// at the keyboard (loopback, no Cloudflare headers) and everything else are the common jobs (`proxy/common.ts`).
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isTemporaryPublicAddress } from "@/lib/auth/temporary-address";
import { temporaryAddressPage } from "@/lib/auth/temporary-address.page";
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from "@/config/translations/translations.config";
import { AUTH_FORM_PATHS, LOCALE_COOKIE, apiAuthGate, architectPagesGate, authFormRedirect, beforeDoors, languageRouter } from "./common";

// 372-1: двери, которым на временном адресе разрешена запись, — их зовут службы со своим ключом или подписью, а не человек
// по ссылке. Всё остальное `/api` на временном адресе — только чтение.
const TEMPORARY_WRITE_ALLOWED = ["/api/settings/changed", "/api/telegram/hook", "/api/telegram/tick", "/api/intake", "/api/node/secret-entry"];

export async function computerProxy(request: NextRequest): Promise<NextResponse> {
  const early = beforeDoors(request);
  if (early) return early;
  const { pathname } = request.nextUrl;
  const temporary = isTemporaryPublicAddress(request);

  // ── Job −1б: ВРЕМЕННЫЙ АДРЕС НЕ ПРИНИМАЕТ ЗАПИСЬ (372-1) ─────────────────
  //
  // Та же природа, что у витрины выше, и стоит рядом по той же причине: запись приходит не только в `/api/*` (серверные
  // действия, двери комплекта `…/build/github/api/connect/*`). На временном адресе пульт открыт любому со ссылкой и любой
  // получает роль архитектора (`get-session.ts`) — решение владельца 2026-10-02 «на старте … без авторизации». ✗ Аудит того
  // же дня: 14 дверей `/api` и 5 дверей GitHub не проверяли признак — по ссылке можно было родить элемент (клон и установка
  // кода), удалить черновики, сменить роли, загрузить файлы, пересобрать элементы, тратить ключ OpenAI. Ответ — тот же, что
  // уже дают защищённые двери (`reason: "temporary-address"`), его понимают экраны отказа. Исключения — двери, которые зовут
  // службы со своим ключом или подписью (`TEMPORARY_WRITE_ALLOWED`). Работа — на самом компьютере (localhost) или на своём домене.
  if (
    temporary &&
    !["GET", "HEAD", "OPTIONS"].includes(request.method.toUpperCase()) &&
    !TEMPORARY_WRITE_ALLOWED.some((p) => pathname === p || pathname.startsWith(p + "/"))
  ) {
    return NextResponse.json({ ok: false, reason: "temporary-address" }, { status: 403 });
  }

  // Job 0 — the sign-in links. On the temporary address: the warning page (below); elsewhere the common redirect.
  if (AUTH_FORM_PATHS.has(pathname)) return temporary ? temporaryAuthForm(request) : authFormRedirect(request);

  // Job 1 — the API gate.
  // 🔒 ТО ЖЕ ПРАВИЛО ДЛЯ ВРЕМЕННОГО АДРЕСА (243) — И ЗДЕСЬ ОНО НЕ ПОВТОРЕНИЕ, А
  // ВТОРАЯ ПОЛОВИНА. ✗ увидено глазами в браузере: ворота страниц я открыл, они
  // отдавали 200, а человек упирался в окно «Эта страница вам недоступна.
  // Требуется одна из этих ролей: architect». Замок слоя клиентский, он
  // спрашивает `/api/me` — и запрос рубился ЗДЕСЬ, раньше обработчика. Открытая
  // страница с закрытой дверью выглядит как поломка продукта, а не как защита.
  // 🔒 Сюда доходит только чтение: запись на временном адресе отрезана выше (372-1). ✗ Аудит 2026-10-02: пульт там
  // открыт любому со ссылкой (решение владельца того же дня), а 14 дверей не проверяли признак сами — по ссылке можно было
  // родить элемент (клон и установка кода), удалить черновики, сменить роли, загрузить файлы, пересобрать элементы,
  // тратить ключ OpenAI. Работа — на самом компьютере (localhost) или на своём домене.
  if (pathname.startsWith("/api")) return temporary ? NextResponse.next() : apiAuthGate(request);

  // Job 1.5 — the architect pages' gate; the temporary address is its third exception (242: «на вот этом самом временном домене
  // Cloud Flyer … нужно проигнорировать защиту»).
  if (!temporary) {
    const architectGate = await architectPagesGate(request);
    if (architectGate) return architectGate;
  }

  // Job 2 — language routing for everything else.
  return languageRouter(request);
}

// The temporary address has no sign-in (256-11) — and says so (257-8).
function temporaryAuthForm(request: NextRequest): NextResponse {
  // 🔒 ВРЕМЕННЫЙ ПУБЛИЧНЫЙ АДРЕС — ВХОДА НЕТ, НО ОТКАЗ ТЕПЕРЬ ГОВОРЯЩИЙ (257-8).
  //
  // Решение 256-11 (вход только на настоящем домене) остаётся в силе. Менялся
  // не запрет, а его ФОРМА: слово владельца 2026-09-21 — «need warning
  // notification for .trycloudflare.com for all actions».
  //
  // 🛑 ЧЕМ БЫЛ ПЛОХ ПУСТОЙ 404. Человек нажимал «Выйти» и получал страницу
  // ошибки браузера без единого слова. Это читается как «сайт сломан», хотя
  // сайт цел, — то есть отказ врал о причине. Отказ обязан называть причину и
  // следующий шаг; отказ без адреса есть тупик.
  //
  // Код ответа остался 404: на этом адресе такой страницы действительно нет.
  const warnLangRaw = new URLSearchParams(request.nextUrl.search).get("lang")
    ?? request.cookies.get(LOCALE_COOKIE)?.value
    ?? DEFAULT_LANGUAGE;
  const warnLang = SUPPORTED_LANGUAGES.includes(warnLangRaw) ? warnLangRaw : DEFAULT_LANGUAGE;
  return new NextResponse(temporaryAddressPage(warnLang, `/${warnLang}`), {
    status: 404,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

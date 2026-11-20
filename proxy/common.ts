// WHAT BOTH PLACES DO — the common half of the proxy (node step 744-1). The entry `proxy.ts` chooses `proxy/computer.ts` or
// `proxy/server.ts` once per process by the place record (`lib/hosting/place.mjs`); both call the jobs below in the same order:
// `beforeDoors` (the cross-site wall, an element's mirror, the showcase's read-only) → the sign-in links → the `/api` gate → the
// architect pages' gate → language routing. 🛑 NO PLACE CHECK HERE (the guard `check:place-readers` refuses one): a rule that differs
// between a computer and a server lives in the file of its place. The code and its history below moved here unchanged from `proxy.ts`.
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prefCookieDomain } from "@/lib/shared-prefs";
import { shouldBypassAuthEdge } from "@/lib/auth/auth-bypass.edge";
import { isOwnerAtMachine } from "@/lib/auth/owner-at-machine";
import { isShowcaseRequest } from "@/lib/showcase.server";
import { mirrorTarget } from "@/lib/domain/mirror-redirect";
import { getSession } from "@/lib/auth/get-session";
import { authBaseFromHost, connectedDomainAuthBase, publicAuthBaseFor } from "@/lib/auth-base-server";
import { authUrl as nodeAuthUrl } from "@/lib/microservices/urls";
import { signInClosedPage } from "@/lib/auth/sign-in-closed.mjs";
import { crossSiteRefusal } from "@/lib/auth/cross-site-wall";
import {
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  SINGLE_LANG_MODE,
} from "@/config/translations/translations.config";

// Auth-service routes that must NEVER be served by this app. The login /
// registration / guest forms belong to the auth service (auth.<domain> in Secure
// mode, <ip>:3001 in IP mode). If anything navigates the browser to a relative
// "/login" or "/register" on the app domain, the language router below would
// rewrite it to "/<lang>/register" — a page this app does not have → white
// screen. This guard rescues any such stray link by redirecting to the auth host
// (a different host, so there is no redirect loop). See
// reports/errors/relative-auth-path-langprefix-whitescreen.md.
// /logout (step 169): the account drawer's sign-out is a relative /logout link, routed to the
// auth service the same way — the auth service clears the session cookie and redirects back
// here (Job 0 attaches the absolute redirectUrl, since the auth host can't guess this origin).
export const AUTH_FORM_PATHS = new Set(["/login", "/register", "/guest-login", "/logout"]);

// The architect SERVICE pages and their APIs moved out of this slot into the admin
// app (:3002/service/*) in step 170 — the slot no longer serves any admin-only API
// namespace. The APIs that remain here are shared/product ones any signed-in (or IP
// mode) user reaches: /api/health, /api/me, /api/media/*, the Dashboard's
// /api/project/default/products, and /api/revalidate. So no path needs the extra
// architect-role gate; a valid session (or x-agent-identity / IP bypass) is enough.
const ADMIN_API_PREFIXES: string[] = [];

// 🔒 ПУБЛИЧНЫЕ ДВЕРИ — ИХ НАДО НАЗЫВАТЬ, ИНАЧЕ ИХ ЗАКРОЕТ ГЕЙТ (найдено 2026-08-19).
//
// Гейт ниже закрывает /api/* целиком, и в режиме обхода это незаметно: локально и
// на голом IP вход отключён, всё отвечает. На домене та же дверь отдаёт 401 —
// проверено живьём: кнопка «показать ещё» в каталоге получала Unauthorized, то
// есть каталог за первой партией товаров переставал существовать для посетителя.
//
// Признак публичной двери один: она отдаёт то, что и так лежит в разметке
// публичной страницы. Прятать за сессией нечего, а прятать — значит ломать.
//
// Дверь, работающая для гостя, обязана быть НАЗВАНА здесь. Забыли назвать —
// возможность работает у разработчика и падает у покупателя.
const PUBLIC_API_PREFIXES = [
  "/api/health",
  // Сигнал узла «настройки сменились» (конец сборки ядра, каталог элементов) — у службы нет сессии; дверь стережёт ключ узла
  // (X-Settings-Key), а не роль.
  "/api/settings/changed",
  "/api/catalogue",   // догрузка витрины: те же товары, что в статическом HTML
  "/api/i18n",        // строки интерфейса — они и так в разметке
  "/api/project-types",
  // Служба каналов толкает сюда сообщение бота: у неё нет сессии, поэтому дверь
  // стережёт общий секрет, а не роль. Без этой строки гейт закрыл бы её от самой платформы.
  "/api/telegram/hook",
  // Часовая стрелка: та же служба, тот же секрет. ✗ префикс сначала забыли, и
  // дверь честно отвечала 401 самой платформе — гейт закрывает /api/* целиком,
  // а «соседний маршрут» для него не родня: сверка идёт по точному префиксу.
  "/api/telegram/tick",
  // Дверь ПРИЁМА первой волны (133): принимает сообщение во все хранилища и
  // возвращает текст для агента, не сочиняя ответа. Стучится машина — предзагрузчик
  // MCP, — и стережёт её тот же общий секрет, что и две двери выше.
  "/api/intake",
  // Заявка на разработку от агента автоматизации (133): та же машина, тот же
  // секрет. Соседняя api/architect/pre-step закрыта РОЛЬЮ — у машины сессии нет.
  "/api/intake/request",
  // 768-4: the Telegram form for an element's key — opened by the person's phone over the node's HTTPS address, so no session; the door
  // stands on Telegram's signature (the asker's bot token) and a one-time token of one request, never on a role.
  "/api/node/secret-entry",
  // 771: «Пульт узла» in Telegram — the same nature: the phone opens it with no session, the door stands on the main bot's signature.
  "/api/node/tg-app",
];

// Non-content root pages that live at the ROOT and never take a language prefix
// (an operator visits /dashboard, not /en/dashboard). The language router below
// skips any path whose first segment is one of these. The architect service pages
// (architecture, glossary, documents, …) moved to the admin app in step 170; only
// the Dashboard and per-project workspaces remain rooted in the slot. Only
// user-facing CONTENT (the home page and pages the user builds) goes under [lang].
// Keep in sync with the app/(service) folders.
// 🪦 EMPTY SINCE 2026-08-11 — and the emptiness is the decision.
//
// `dashboard` moved into the protected layer under `[lang]`, so it takes a
// language prefix like every other page: a signed-in person reads their own
// language, and there is no reason their dashboard should be the one screen in
// the product that is English-only. `project` had already stopped existing as a
// page; the entry outlived it.
//
// Keep the mechanism: a root page that genuinely must never be prefixed (a
// webhook landing, a health page) belongs here. Adding a normal page to this set
// is how a surface silently loses its languages.
const SERVICE_ROOTS = new Set<string>([]);

export const LOCALE_COOKIE = "NEXT_LOCALE";
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60;

// 🔒 285-2: ЯЗЫК — ВЫБОР ПОСЕТИТЕЛЯ НА ВЕСЬ ПРОЕКТ, cookie ставится на домен проекта (`.<зона>`), как тема и
// ширина (`lib/shared-prefs.ts`). Прежний cookie без домена стирается тем же ответом: иначе браузер пришлёт оба,
// и победит старый, видимый одному адресу.
function withLangCookie(response: NextResponse, lang: string, request: NextRequest): NextResponse {
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "";
  const domain = prefCookieDomain(host);
  response.cookies.set(LOCALE_COOKIE, lang, {
    maxAge: COOKIE_MAX_AGE,
    path: "/",
    sameSite: "lax",
    ...(domain ? { domain } : {}),
  });
  if (domain) response.headers.append("Set-Cookie", `${LOCALE_COOKIE}=; Path=/; Max-Age=0`);
  return response;
}

function detectLang(request: NextRequest): string {
  // Priority 1: cookie
  const cookie = request.cookies.get(LOCALE_COOKIE)?.value;
  if (cookie && SUPPORTED_LANGUAGES.includes(cookie)) return cookie;

  // Priority 2: Accept-Language header
  const acceptLang = request.headers.get("accept-language") ?? "";
  const matched = acceptLang
    .split(",")
    .map((l) => ({
      code: l.split(";")[0].trim().split("-")[0].toLowerCase(),
      q: parseFloat(l.split(";q=")[1] ?? "1"),
    }))
    .sort((a, b) => b.q - a.q)
    .find((l) => SUPPORTED_LANGUAGES.includes(l.code));

  return matched?.code ?? DEFAULT_LANGUAGE;
}

// ── Job 1: API auth gate (unchanged behavior) ──────────────────────────────
export async function apiAuthGate(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // Generated favicon / PWA icon assets are public brand files referenced by the
  // manifest and <head> (fetched by the browser before login) — never gate them.
  if (pathname.startsWith("/api/media/icons/")) {
    return NextResponse.next();
  }

  // 🔒 ЧТЕНИЕ ФАЙЛА МЕДИА — ПУБЛИЧНО (найдено владельцем на живом сайте 2026-08-13).
  //
  // Картинки товаров и материалов живут в хранилище, а посетитель каталога — не
  // авторизован по определению. Пока этот путь был закрыт, ЛЮБОЕ изображение из
  // хранилища отвечало посетителю 401, оптимизатор поверх него 400, и на странице
  // оставались пустые квадраты. Не всплывало это лишь потому, что показывали
  // статические файлы из `public/`; в тот день, когда каталог перевели на
  // хранилище, витрина осталась без картинок.
  //
  // Открыт РОВНО ОДИН глагол — чтение конкретного файла по его идентификатору
  // (`/api/media/<id>/file`). Ни список хранилища, ни загрузка, ни удаление,
  // ни правка сюда не попадают: они остаются за сессией, как и были. Тот, кто
  // знает идентификатор, и так получает картинку через страницу, на которой она
  // стоит, — прятать её содержимое, показывая его же на публичной витрине, значит
  // защищать не тайну, а собственную видимость.
  if (/^\/api\/media\/[^/]+\/file\/?$/.test(pathname)) {
    return NextResponse.next();
  }

  // 🔒 КАРТИНКА СТРАНИЦЫ-ЗАГЛУШКИ — ПУБЛИЧНА, И ИНАЧЕ БЫТЬ НЕ МОЖЕТ (2026-08-15).
  //
  // Тот же класс дефекта, что абзацем выше, и найден он тем же способом — живым
  // запросом, а не чтением кода: дверь отвечала 401 всем, включая посетителя,
  // ради которого её и завели. Границы ошибок Next обязаны быть клиентскими,
  // читать настройки они не могут и берут картинку по этому адресу; человек,
  // попавший на страницу «что-то пошло не так», по определению не авторизован —
  // а чаще всего именно СЛОМАВШАЯСЯ авторизация его туда и привела. Закрытая
  // дверь означала бы: на экране ошибки ещё и битая картинка.
  //
  // Открыто РОВНО чтение слота по имени. Отдаётся при этом не файл, а
  // перенаправление на него; сами файлы — заглушки из `public/` или картинки
  // хранилища, чьё чтение уже публично по правилу выше.
  if (/^\/api\/config-image\/[A-Za-z0-9-]+\/?$/.test(pathname)) {
    return NextResponse.next();
  }

  // 🔒 ОПИСАНИЕ НАПРАВЛЕНИЯ — ПУБЛИЧНО, И ЭТО ТРЕТИЙ СЛУЧАЙ ТОГО ЖЕ КЛАССА
  // (найдено живым запросом 2026-08-17, сразу после включения домена).
  //
  // Лента направлений стоит на ГЛАВНОЙ, где посетитель не авторизован по
  // определению, а тело окна она берёт по нажатию с этого адреса. Пока путь был
  // закрыт, окно открывалось и показывало «описание не загрузилось» — каждому,
  // ради кого лента и сделана.
  //
  // 🔒 ПОЧЕМУ ЭТОГО НЕ БЫЛО ВИДНО ДО СЕГОДНЯ. Сервер работал в режиме без домена,
  // где авторизация обходится целиком (`shouldBypassAuth`), и адрес отвечал 200 —
  // я проверил его живьём и увидел зелёное. С включением HTTPS и домена режим
  // сменился на строгий, и та же проверка стала давать 401. Пруф, снятый в режиме
  // обхода, ничего не говорит о защищённом режиме — вот дословный пример.
  //
  // Отдаётся статический файл, собранный на сборке из корпуса, который целиком
  // лежит в разметке публичной страницы: прятать за сессией нечего.
  if (/^\/api\/project-types\/[a-z]{2}\/[a-z0-9-]+\/?$/.test(pathname)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/") && !PUBLIC_API_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    // 🔒 ХОЗЯИН ЗА КЛАВИАТУРОЙ ЭТОЙ МАШИНЫ ПРОХОДИТ ВОРОТА (2026-09-19).
    //
    // 🛑 ПРАВИЛО ОБЯЗАНО СТОЯТЬ В ДВУХ МЕСТАХ, И ЭТО НЕ ДУБЛИРОВАНИЕ, А ЗАКОН
    // ПРОЕКТА: «двухслойный bypass обязателен — `proxy.ts` блокирует `/api/*` ДО
    // route handler, поэтому правило в `getSession()` одно недостаточно».
    // ✗ проверено живьём в тот же день: `getSession()` уже знал о хозяине, а
    // `/api/me` с самой машины всё равно отвечал 401 — ворота рубили запрос
    // раньше, чем обработчик успевал спросить, кто пришёл.
    //
    // Признак и доказательство его безопасности — `lib/auth/owner-at-machine.ts`.
    if (isOwnerAtMachine(request)) {
      return NextResponse.next();
    }

    // 🔒 ВИТРИНА FRACTERA — ТРЕТЬЕ ИСКЛЮЧЕНИЕ ТОЙ ЖЕ ПРИРОДЫ (256-2).
    //
    // Решение владельца 2026-09-20, дословно: «я собираюсь использовать страницы
    // архитектора на сайте Fractera.ai как демонстрационные страницы, которым
    // нужен обязательный индекс… проиндексируем слой архитектора и одновременно
    // индексируемый слой приватных страниц… только у Fractera».
    //
    // 🔒 ПОЧЕМУ ЭТО ЗДЕСЬ, А НЕ ТОЛЬКО У СТРАНИЦ. Замок приватного слоя и слоя
    // архитектора — КЛИЕНТСКИЙ: островок спрашивает `/api/me`. Открой мы страницы
    // и оставь ворота — человек увидел бы окно «Эта страница вам недоступна»
    // поверх открытой страницы. Это уже оплачено дважды (243 и 252), и цена
    // каждый раз была одна: открытая страница с закрытой дверью выглядит как
    // поломка продукта, а не как защита.
    //
    // 🛑 ЧТЕНИЕ, И ТОЛЬКО ЧТЕНИЕ — ПРОВЕРКА МЕТОДА СТОИТ ЗДЕСЬ ЖЕ, А НЕ «ПОТОМ».
    //
    // ✗ ОПЛАЧЕНО ИЗМЕРЕНИЕМ В ТОТ ЖЕ ЧАС. Сперва здесь стояло голое
    // `isShowcaseRequest(request)`, и я собирался запретить запись отдельным
    // барьером следующим подшагом. Замер показал цену такого порядка:
    // `POST /api/revalidate` с витринным хостом вернул **200**, а до моей правки
    // тот же запрос получал 401. То есть подшаг, открывавший ЧТЕНИЕ, на полчаса
    // открыл и ЗАПИСЬ.
    //
    // 🔒 ЗАКОН, КОТОРЫЙ ИЗ ЭТОГО СЛЕДУЕТ: послабление вводится сразу в своих
    // границах. «Сузим в следующем подшаге» означает, что между подшагами
    // существует состояние, которого никто не проектировал, — а именно оно и
    // попадёт в сборку, если работу прервут.
    if (isShowcaseRequest(request) && (request.method === "GET" || request.method === "HEAD")) {
      return NextResponse.next();
    }

    if (!shouldBypassAuthEdge()) {
      // 818-2: the self-written agent label never opens the gate (817 H1: it did, from the internet too); the node's own scripts on this
      // machine are the owner at it and passed above.
      const sessionToken =
        request.cookies.get("authjs.session-token") ??
        request.cookies.get("__Secure-authjs.session-token");

      if (!sessionToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Admin-gate the service-page API namespaces (role, not just a cookie).
      if (ADMIN_API_PREFIXES.some((p) => pathname.startsWith(p))) {
        const session = await getSession(request);
        if (!session?.roles?.includes("architect")) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
      }
    }
  }

  return NextResponse.next();
}

// ── Job 2: language routing for content pages ──────────────────────────────
export function languageRouter(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const firstSegment = pathname.split("/")[1];

  // Service pages stay at the root — never prefixed with a language.
  if (SERVICE_ROOTS.has(firstSegment)) return NextResponse.next();

  // Single-language mode: hide the lang prefix from public URLs.
  // /en/about → 301 /about ; internally rewrite /about → /en/about.
  if (SINGLE_LANG_MODE) {
    const singleLang = SUPPORTED_LANGUAGES[0];
    if (SUPPORTED_LANGUAGES.includes(firstSegment)) {
      const without = pathname.replace(`/${singleLang}`, "") || "/";
      const url = request.nextUrl.clone();
      url.pathname = without;
      return withLangCookie(NextResponse.redirect(url, 301), singleLang, request);
    }
    const url = request.nextUrl.clone();
    url.pathname = `/${singleLang}${pathname}`;
    return withLangCookie(NextResponse.rewrite(url), singleLang, request);
  }

  // Multi-language mode: language already present in the URL → pass through.
  if (SUPPORTED_LANGUAGES.includes(firstSegment)) {
    const res = NextResponse.next();
    res.headers.set("x-lang", firstSegment);
    return withLangCookie(res, firstSegment, request);
  }

  // No language prefix → detect and route.
  const lang = detectLang(request);

  // Keep the bare root `/` REWRITING (not redirecting) to `/<DEFAULT_LANGUAGE>`
  // when the detected lang IS the default, so crawlers and direct links to `/`
  // receive real HTML at the root instead of a redirect.
  if (pathname === "/" || pathname === "") {
    if (lang === DEFAULT_LANGUAGE) {
      const url = request.nextUrl.clone();
      url.pathname = `/${DEFAULT_LANGUAGE}`;
      const res = NextResponse.rewrite(url);
      res.headers.set("x-lang", lang);
      res.headers.set("Vary", "Cookie, Accept-Language");
      return withLangCookie(res, lang, request);
    }
    const url = request.nextUrl.clone();
    url.pathname = `/${lang}`;
    return withLangCookie(NextResponse.redirect(url), lang, request);
  }

  // Non-root content path without a language prefix → redirect to /<lang>/… .
  const url = request.nextUrl.clone();
  url.pathname = `/${lang}${pathname}`;
  return withLangCookie(NextResponse.redirect(url), lang, request);
}

// ── Jobs −3…−1: before any door — the same on a computer and on a server ───────────────────────────────────────────────────────
export function beforeDoors(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;

  // ── Job −3: THE CROSS-SITE WALL (744-2) — first of all, on every path and every state-changing method ─────────────────────────────
  // A page of another site open in the same browser must not press the node's buttons: the owner at the keyboard passes every gate
  // without sign-in. ✗ Measured 2026-11-14: a text/plain POST from a foreign page ran SSH as root through /api/node/launch. Server actions
  // and the architect's kit doors are POSTs to page addresses — so the wall stands before every job, not inside the `/api` gate.
  const crossSite = crossSiteRefusal(request);
  if (crossSite) return NextResponse.json({ ok: false, reason: "cross-site", site: crossSite }, { status: 403 });

  // ── Job −2: ГЛАВНОЕ ЗЕРКАЛО ЭЛЕМЕНТА — 301 НА ЕГО ДОМЕН (324-4) ─────────────
  // `www.<домен>` и прежний поддомен элемента туннель ведёт сюда, а не на элемент; здесь они уходят на `https://<домен>`
  // с тем же путём и запросом. Раньше всего остального: этот хост не страница ядра. Не GET/HEAD — 308, чтобы не потерять тело.
  const mirror = mirrorTarget(request.headers.get("host"));
  if (mirror) {
    const to = `https://${mirror}${pathname}${request.nextUrl.search}`;
    return NextResponse.redirect(to, request.method === "GET" || request.method === "HEAD" ? 301 : 308);
  }

  // ── Job −1: ВИТРИНА НЕ ПРИНИМАЕТ ЗАПИСЬ (256-3) ──────────────────────────
  //
  // 🔒 РЕШЕНИЕ ВЛАДЕЛЬЦА 2026-09-20, дословно: «если это Fractera — то индексацию
  // открыть, изменения в базу данных не сохранять. Пусть базы данных будут
  // доступны, пусть хранилища будут доступны на чтение».
  //
  // 🔒 ПОЧЕМУ САМЫМ ПЕРВЫМ, ДО ВСЕХ ОСТАЛЬНЫХ РАБОТ. Запись приходит не только в
  // `/api/*`: серверные действия Next отправляются `POST`-ом на адрес ОБЫЧНОЙ
  // СТРАНИЦЫ, и правило, стоящее внутри ворот `/api`, их не увидит вовсе. Одно
  // правило о методе выше всех остальных закрывает разом мутирующие маршруты,
  // загрузку файлов, серверные действия, вход в сессию и все маршруты ИИ — они
  // тоже `POST`, то есть ключ в окружении витрины не станет бесплатной
  // генерацией для прохожего.
  //
  // 🛑 ОТКАЗ ОБЪЯСНЯЕТ СЕБЯ, А НЕ МОЛЧИТ. Голый 403 читается как поломка и стоит
  // часа разбирательств — собственный закон проекта о третьем состоянии (252).
  //
  // 🛑 ЭТО КАСАЕТСЯ И ВЛАДЕЛЬЦА: барьер не знает, кто пришёл. Управлять узлом с
  // адреса витрины нельзя; управление остаётся на его машине, где действует
  // правило хозяина за клавиатурой. Цена названа ему до согласования и принята.
  if (isShowcaseRequest(request) && request.method !== "GET" && request.method !== "HEAD") {
    return NextResponse.json(
      {
        error: "ReadOnlyShowcase",
        message:
          "Это витрина Fractera — демонстрационный узел, работающий только на чтение. " +
          "Изменения здесь не сохраняются намеренно. Поставьте свой узел из репозитория: " +
          "он ваш целиком, и в нём эти страницы закрыты и доступны только вам.",
      },
      { status: 403 },
    );
  }
  return null;
}

// ── Job 0: the sign-in links (/login, /register, /guest-login, /logout) — the common part; a computer answers its temporary
// address first (`proxy/computer.ts`) ─────────────────────────────────────────────────────────────────────────────────────────
export function authFormRedirect(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  // Job 0 — rescue stray auth-form links to the auth host (before language
  // routing, which would otherwise rewrite "/register" → "/<lang>/register").
  // 🔒 АВТОРИЗАЦИЯ СУЩЕСТВУЕТ ТОЛЬКО НА НАСТОЯЩЕМ ДОМЕНЕ (256-11).
  //
  // Слово владельца 2026-09-20, дословно: «неправильно, что временный
  // trycloudflare домен запрашивает редирект на авторизацию — как мы говорили
  // раньше, авторизация только на настоящем домене».
  //
  // ✗ ИЗМЕРЕНО: `/login` на туннеле отвечал `307` и уводил на
  // `https://auth.<четыре-случайных-слова>.trycloudflare.com/login` — поддомен
  // быстрого туннеля, которого НЕ СУЩЕСТВУЕТ и не может существовать: Cloudflare
  // раздаёт одно имя, а не зону. То есть кнопка входа вела в никуда.
  //
  // 🔒 ОТВЕТ — 404, А НЕ МОЛЧАЛИВЫЙ ПРОПУСК ДАЛЬШЕ. На этих адресах двери входа
  // нет: её либо заменяет правило хозяина за клавиатурой, либо (на туннеле)
  // открытый режим. «Страницы здесь не существует» — тот же ответ, каким ворота
  // слоя встречают чужого, и он честнее переадресации на мёртвое имя.
  // Признак хозяина берётся готовым (`isOwnerAtMachine`), а не переписывается
  // списком петлевых имён: третья копия того же знания разошлась бы молча.
  const proto = request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol.replace(":", "");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  // 🔒 ХОЗЯИН ЗА КЛАВИАТУРОЙ ПОЛУЧАЕТ НАСТОЯЩУЮ ДВЕРЬ, А НЕ 404 (257-8).
  //
  // Решение владельца 2026-09-20 изменило посылку: авторизация больше не чужая
  // служба на субдомене, а ЧАСТЬ УЗЛА, приезжающая вместе с ним. Реестр знает
  // её порт, значит дверь существует — и отвечать «страницы нет» о живой
  // странице было бы ложью. Прежний 404 писался тогда, когда вести было некуда.
  //
  // 🛑 ИМЯ ХОСТА БЕРЁТСЯ ИЗ ЗАПРОСА, А ПОРТ ИЗ РЕЕСТРА, И ЭТО НЕ ПРИДИРКА.
  // Cookie не различает порты, но различает ИМЯ: сессия, выданная на
  // `127.0.0.1`, не придёт на `localhost`. Уведи мы человека с его же имени —
  // он зарегистрируется, вернётся и окажется неузнанным.
  // 🔒 259-8: ДОМЕН ПОДКЛЮЧЁН — ВХОД ЖИВЁТ ТОЛЬКО НА НЁМ, И ДЛЯ ХОЗЯИНА ТОЖЕ.
  // Служба входа ставит cookie на `.<зона>` с флагом Secure; на `localhost` браузер
  // такой cookie не примет, и вход на петле «прошёл бы», оставив человека
  // неузнанным. Хозяину за клавиатурой вход не нужен (его узнаёт правило
  // хозяина), но если он пошёл входить — ведём туда, где вход работает.
  const domainAuth = connectedDomainAuthBase();
  if (domainAuth && isOwnerAtMachine(request)) {
    return NextResponse.redirect(`${domainAuth}${pathname}${request.nextUrl.search}`);
  }

  const assignedAuth = nodeAuthUrl();
  if (assignedAuth && isOwnerAtMachine(request)) {
    const authPort = new URL(assignedAuth).port;
    const ownHost = (host ?? "localhost").split(":")[0];
    const qsOwn = request.nextUrl.search;
    return NextResponse.redirect(`${proto}://${ownHost}:${authPort}${pathname}${qsOwn}`);
  }

  if (isOwnerAtMachine(request)) {
    return new NextResponse(null, { status: 404 });
  }

  const search = new URLSearchParams(request.nextUrl.search);
  // /logout (step 169): the auth service clears the cookie and then must land the visitor
  // BACK on this site — but it cannot derive this origin (IP mode: different port; secure
  // mode: different subdomain). Attach the absolute return URL for it, language-aware.
  if (pathname === "/logout" && !search.has("redirectUrl") && host) {
    const lang = search.get("lang")
      ?? request.cookies.get(LOCALE_COOKIE)?.value
      ?? DEFAULT_LANGUAGE;
    const backLang = SUPPORTED_LANGUAGES.includes(lang) ? lang : DEFAULT_LANGUAGE;
    search.set("redirectUrl", `${proto === "https" ? "https" : "http"}://${host}/${backLang}`);
  }
  // 🔒 259-8: НА СВОЁМ ДОМЕНЕ ВХОД ВОЗВРАЩАЕТ ЧЕЛОВЕКА НА САЙТ. Служба входа живёт
  // на `auth.<зона>` и без адреса возврата оставляет вошедшего у себя. Роль
  // `user`: по умолчанию служба ждёт архитектора и показала бы обычному
  // посетителю «доступ запрещён» сразу после успешной регистрации.
  if ((pathname === "/login" || pathname === "/register") && host && publicAuthBaseFor(host) && !search.has("callbackUrl")) {
    const lang = search.get("lang") ?? request.cookies.get(LOCALE_COOKIE)?.value ?? DEFAULT_LANGUAGE;
    const backLang = SUPPORTED_LANGUAGES.includes(lang) ? lang : DEFAULT_LANGUAGE;
    // `signed-in` — метка для плашки на сайте (260-3); островок убирает её сам.
    search.set("callbackUrl", `https://${host}/${backLang}?signed-in=1`);
    if (!search.has("requireRole")) search.set("requireRole", "user");
  }
  const qs = search.toString();
  const base = authBaseFromHost(host, proto);
  // 🔒 739-4: no sign-in address for this public name yet (the domain is not switched on) — one honest page, never a redirect to the
  // machine's loopback or to a relative path that would come back here.
  if (!base) {
    const langRaw = search.get("lang") ?? request.cookies.get(LOCALE_COOKIE)?.value ?? DEFAULT_LANGUAGE;
    return new NextResponse(signInClosedPage(SUPPORTED_LANGUAGES.includes(langRaw) ? langRaw : DEFAULT_LANGUAGE), { status: 503, headers: { "content-type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
  }
  const target = `${base}${pathname}${qs ? `?${qs}` : ""}`;
  return NextResponse.redirect(target);
}

// 🪦 Job 0.5 (the `/projects` bridge of step 211) removed in 741-3: it sent `/projects` and `/<lang>/projects` to a separate Projects
// service of the old server line (`<host>:3003` / `projects.<apex>`), which a node does not have. ✗ Measured 2026-11-14 on this node:
// `/ru/projects` → 307 `http://localhost:3003/projects`, a dead address. The node's projects live under «Дашборд → Проекты».

// ── Job 1.5: ворота страниц слоя архитектора (242) ─────────────────────────
//
// ✗ ОПЛАЧЕНО ИЗМЕРЕНИЕМ 2026-09-19: слой архитектора не был защищён НИЧЕМ. Ворота
// выше закрывают только `/api/*`, а страницы `/{lang}/architect/*` отдавались
// любому — я снял их через публичный туннель и получил ту же разметку байт в
// байт, что и с самой машины. Правило хозяина (`owner-at-machine.ts`) при этом
// было написано, объявлено в инструкции и **никем не звалось для страниц**: тот
// самый класс «построено, но никем не зовётся».
//
// 🔒 ПО УМОЛЧАНИЮ — ЗАПРЕТ. Решение владельца 2026-09-19: «по умолчанию страницы
// архитектора должны быть защищены авторизацией». Исключения три, и каждое
// названо:
//
//   1. ХОЗЯИН ЗА КЛАВИАТУРОЙ — запрос пришёл с самой машины (признак измерен);
//   2. РЕЖИМ БЕЗ ДОМЕНА / РАЗРАБОТКИ — `shouldBypassAuthEdge()`, общий для узла;
//   3. ВРЕМЕННЫЙ АДРЕС быстрого туннеля — его слова: «если мы находимся на режиме
//      разработки или на вот этом самом временном домене Cloud Flyer, то нам
//      нужно проигнорировать защиту». 744-1: это исключение живёт в `proxy/computer.ts` —
//      у сервера временного адреса нет, и его файл этих ворот не открывает.
//
// 🛑 ЦЕНА ТРЕТЬЕГО ИСКЛЮЧЕНИЯ НАЗВАНА ВЛАДЕЛЬЦУ И ПОВТОРЕНА ЗДЕСЬ: пока туннель
// открыт, слой архитектора видит каждый, кто знает ссылку. Это сознательный
// размен ради того, чтобы человек смотрел свой узел с телефона и из чужой сети.
// На СВОЁМ домене (235-2) исключение не действует — там работает запрет.
//
// 🛑 ЧЕГО ЗДЕСЬ ПОКА НЕТ, И ЭТО ДОЛГ, А НЕ УМОЛЧАНИЕ: проверки роли `architect`
// по сессии. У узла линии WEB4 своей службы входа нет — `NEXT_PUBLIC_AUTH_URL`
// показывает на адрес, которого на этой машине не существует. Посылать человека
// в несуществующую дверь хуже, чем честно ответить «страницы нет»: дверь без
// ключа выглядит как непослушание продукта. Поэтому чужой получает 404, а не
// перенаправление на вход. День, когда у узла появится вход, — день, когда здесь
// появится проверка роли.
//
// 🔒 ВОРОТА ОДНИ, И ЭТО НЕ НАРУШЕНИЕ ЗАКОНА «ПРАВИЛО В ДВУХ МЕСТАХ». Тот закон о
// дверях `/api/*`, которые прокси рубит ДО обработчика. Страницы слоя —
// статические, и вторая проверка внутри страницы означала бы чтение запроса в
// `layout`/`page`, то есть перевод всего слоя в динамику. Статика здесь дороже
// второго замка: замок один, зато названный.
// 🔒 285-6: СТРАНИЦЫ АРХИТЕКТОРА ЖИВУТ ОТ КОРНЯ ЯДРА (`/<язык>/…`), и перезапись `next.config.ts` отдаёт их папкой
// `architect/` ПОСЛЕ прокси — прокси видит чистый адрес. Других страниц у ядра нет (280-2b), поэтому ворота
// закрывают ЛЮБОЙ путь с языком. ✗ Узнавай они по `/architect` в пути — чистые адреса прошли бы мимо входа.
const ARCHITECT_PAGE = /^\/[a-z]{2}(?:\/|$)/;

export async function architectPagesGate(request: NextRequest): Promise<NextResponse | null> {
  if (!ARCHITECT_PAGE.test(request.nextUrl.pathname)) return null;

  if (isOwnerAtMachine(request)) return null;
  if (shouldBypassAuthEdge()) return null;

  // 🔒 ЧЕТВЁРТОЕ ИСКЛЮЧЕНИЕ — ВИТРИНА FRACTERA (256-2), И ОНО ОТЛИЧАЕТСЯ ОТ ТРЁХ
  // ПРЕДЫДУЩИХ ТЕМ, ЧТО ПОСТОЯННО.
  //
  // Решение владельца 2026-09-20, дословно: «Я всего один разработчик, не могу
  // тянуть отдельно разработку своего демонстрационного сайта и отдельно версию
  // для копирования. Я хочу, чтоб всё, что я буду делать в своём сайте,
  // автоматически появлялось у каждого нового гостя, когда он будет копировать
  // наш репозиторий, при этом я не хочу каждый раз нагружать себя требованием
  // создания отдельных прав».
  //
  // 🔒 ГОСТЯ ЭТО НЕ ЗАДЕВАЕТ, И В ЭТОМ ВЕСЬ ЗАМЫСЕЛ: признак — точное совпадение
  // домена с `fractera.ai` (`lib/showcase.ts`), а у гостя домен другой, поэтому
  // тот же код закрывает его слой по умолчанию. Витрина не форк и не стенд —
  // это тот же продукт в режиме, который включается адресом.
  if (isShowcaseRequest(request)) return null;

  // 🔒 ПЯТОЕ — ВОШЕДШИЙ АРХИТЕКТОР НА СВОЁМ ДОМЕНЕ (2026-09-21). Долг, названный
  // выше («день, когда у узла появится вход, — день, когда здесь появится проверка
  // роли»), наступил в 259-8/260 и не был закрыт: вход на `auth.<зона>` работал, а
  // ворота по-прежнему отвечали 404 всем. ✗ увидено владельцем: «Начать строить» на
  // главной → страница ошибки браузера на `throughsongs.com/ru/architect/...`.
  //
  // 🔒 ОТКАЗ ГОВОРИТ ОКНО ЗАМКА, А НЕ ПРОКСИ. Слово владельца 2026-09-21: «как это было
  // реализовано на образцовой странице… всплывало модальное окно, которое говорило, какая
  // роль потребуется… отсутствие страницы или отсутствие защиты страницы не должно
  // приводить никаким подобным ошибкам». Поэтому на домене со входом страница проходит к
  // `AccessGate` (`(architectLayer)/layout.tsx`): он спрашивает `/api/me` и сам показывает
  // «Эта страница вам недоступна. Требуется роль architect» с кнопкой входа и возвратом.
  // 🛑 Цена названа: каркас страницы (статический, без данных) виден и не вошедшему; данные
  // остаются за дверями `/api/*`, которые требуют сессию — ворота выше не тронуты.
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (publicAuthBaseFor(host)) return null;

  // Чужой на постоянном адресе без подключённого входа: страницы для него не существует.
  return new NextResponse(null, { status: 404 });
}

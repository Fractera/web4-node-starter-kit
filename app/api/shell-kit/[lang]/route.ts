// @api render the project header and footer for an element
import { timingSafeEqual } from "node:crypto"
import { NextRequest, NextResponse } from "next/server"
import { loadProjectShell } from "@/components/shell/remote-shell"
import { coreShellWhere } from "@/lib/shell/core-shell-where"
import { kitManifest, kitRender } from "@/lib/shell-kit/kit"
import type { ShellData } from "@/components/shell/shell-types"
import type { ShellKitDrawerLabels, ShellKitProps, ShellKitSurface } from "@/_tools/shell-kit/types/shell-kit"

// ИНСТРУМЕНТ ЯДРА «ОБОЛОЧКА ПРОЕКТА» (шаг 727-1). Слово владельца 2026-11-11: «мы только в одном месте должны делать обновления а все
// остальные элементы должны получить его нативно». Сервер элемента спрашивает эту дверь по петле при отрисовке своей статической
// страницы (заглушка `components/shell-kit/` шаблона): ответ — готовый HTML шапки и подвала проекта, пропсы для оживления и имена
// файлов пакета (их элемент отдаёт браузеру через свою же дверь `/shell-kit/*`, браузер к ядру не ходит).
// Данные — оболочка проекта, которую сайт уже отдаёт всем (`/api/shell/<язык>`); адреса входа — свои у поверхности, в запросе.
// 727-2 (план 727: «код общий, данные у каждого элемента свои»): POST несёт ДАННЫЕ САМОГО ЭЛЕМЕНТА — его `siteShellData(язык)`, его
// поверхность и подписи его боковых ящиков; ядро рисует их своим кодом. GET — оболочка проекта с сайта (так её видит ядро).
// 🔒 КЛЮЧ УЗЛА (`X-Node-Key`): дверь между элементами по петле; наружу двери ядра закрыты (`proxy.ts`).
export const dynamic = "force-dynamic"

const HEADERS = { "Cache-Control": "no-store" }
const LANG = /^[a-z]{2,3}(-[A-Za-z0-9]{2,8})?$/
const HREF = /^\/[A-Za-z0-9/_\-.?=&{}%]{0,200}$/

function nodeKeyOk(given: string | null): boolean {
  const expected = process.env.SETTINGS_SECRET ?? ""
  if (!expected || !given) return false
  const a = Buffer.from(given)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

const MAX_BODY = 256 * 1024

function surfaceFrom(get: (k: string) => unknown, langList: unknown): ShellKitSurface {
  const href = (k: string) => {
    const v = get(k)
    return typeof v === "string" && HREF.test(v) ? v : undefined
  }
  const raw = Array.isArray(langList) ? langList : typeof langList === "string" ? langList.split(",") : []
  const langs = raw.filter((l): l is string => typeof l === "string" && LANG.test(l)).slice(0, 100)
  return { meUrl: href("meUrl"), loginHref: href("loginHref"), logoutHref: href("logoutHref"), languages: langs.length ? langs : undefined }
}

function labelsOf(v: unknown): ShellKitDrawerLabels | undefined {
  const o = v as { open?: unknown; close?: unknown } | null
  return o && typeof o.open === "string" && typeof o.close === "string" ? { open: o.open.slice(0, 80), close: o.close.slice(0, 80) } : undefined
}

async function render(props: ShellKitProps) {
  const manifest = await kitManifest()
  if (!manifest) {
    return NextResponse.json({ ok: false, error: "shell kit is not built (npm run build:shell-kit)" }, { status: 503, headers: HEADERS })
  }
  try {
    const html = (await kitRender(manifest))(props)
    return NextResponse.json(
      { ok: true, version: manifest.version, html, props, assets: { js: manifest.js, css: manifest.css } },
      { headers: HEADERS },
    )
  } catch (err) {
    console.error(`[shell-kit] render failed: ${err instanceof Error ? err.message : err}`)
    return NextResponse.json({ ok: false, error: "render failed" }, { status: 500, headers: HEADERS })
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ lang: string }> }) {
  if (!nodeKeyOk(req.headers.get("x-node-key"))) {
    return NextResponse.json({ ok: false, error: "node key required (X-Node-Key)" }, { status: 401, headers: HEADERS })
  }
  const { lang } = await params
  if (!LANG.test(lang)) return NextResponse.json({ ok: false, error: "bad language" }, { status: 400, headers: HEADERS })
  const text = await req.text()
  if (text.length > MAX_BODY) return NextResponse.json({ ok: false, error: "body too large" }, { status: 413, headers: HEADERS })
  let body: { data?: ShellData; surface?: Record<string, unknown>; path?: unknown; drawers?: { left?: unknown; right?: unknown } }
  try {
    body = JSON.parse(text)
  } catch {
    return NextResponse.json({ ok: false, error: "body is not JSON" }, { status: 400, headers: HEADERS })
  }
  const data = body.data
  if (!data || typeof data !== "object" || !Array.isArray(data.top) || !Array.isArray(data.footer)) {
    return NextResponse.json({ ok: false, error: "data must be the element's ShellData (top and footer arrays)" }, { status: 400, headers: HEADERS })
  }
  const s = body.surface ?? {}
  const path = typeof body.path === "string" && HREF.test(body.path) ? body.path : `/${lang}`
  const left = labelsOf(body.drawers?.left)
  const right = labelsOf(body.drawers?.right)
  return render({
    data,
    surface: surfaceFrom((k) => s[k], s.languages),
    path,
    ...(left || right ? { drawers: { left, right } } : {}),
  })
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ lang: string }> }) {
  if (!nodeKeyOk(req.headers.get("x-node-key"))) {
    return NextResponse.json({ ok: false, error: "node key required (X-Node-Key)" }, { status: 401, headers: HEADERS })
  }
  const { lang } = await params
  if (!LANG.test(lang)) return NextResponse.json({ ok: false, error: "bad language" }, { status: 400, headers: HEADERS })

  const data = await loadProjectShell(lang, coreShellWhere())
  if (!data) return NextResponse.json({ ok: false, error: "the site gave no project shell" }, { status: 502, headers: HEADERS })

  const q = req.nextUrl.searchParams
  const path = q.get("path")
  return render({ data, surface: surfaceFrom((k) => q.get(k), q.get("languages")), path: path && HREF.test(path) ? path : `/${lang}` })
}

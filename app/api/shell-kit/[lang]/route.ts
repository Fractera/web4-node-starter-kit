// @api render the project header and footer for an element
import { timingSafeEqual } from "node:crypto"
import { NextRequest, NextResponse } from "next/server"
import { loadProjectShell } from "@/components/shell/remote-shell"
import { coreShellWhere } from "@/lib/shell/core-shell-where"
import { kitManifest, kitRender } from "@/lib/shell-kit/kit"
import type { ShellKitProps, ShellKitSurface } from "@/_tools/shell-kit/types/shell-kit"

// ИНСТРУМЕНТ ЯДРА «ОБОЛОЧКА ПРОЕКТА» (шаг 727-1). Слово владельца 2026-11-11: «мы только в одном месте должны делать обновления а все
// остальные элементы должны получить его нативно». Сервер элемента спрашивает эту дверь по петле при отрисовке своей статической
// страницы (заглушка `components/shell-kit/` шаблона): ответ — готовый HTML шапки и подвала проекта, пропсы для оживления и имена
// файлов пакета (их элемент отдаёт браузеру через свою же дверь `/shell-kit/*`, браузер к ядру не ходит).
// Данные — оболочка проекта, которую сайт уже отдаёт всем (`/api/shell/<язык>`); адреса входа — свои у поверхности, в запросе.
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

function surfaceOf(q: URLSearchParams): ShellKitSurface {
  const href = (k: string) => {
    const v = q.get(k)
    return v && HREF.test(v) ? v : undefined
  }
  const langs = q.get("languages")?.split(",").filter((l) => LANG.test(l)).slice(0, 100)
  return { meUrl: href("meUrl"), loginHref: href("loginHref"), logoutHref: href("logoutHref"), languages: langs?.length ? langs : undefined }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ lang: string }> }) {
  if (!nodeKeyOk(req.headers.get("x-node-key"))) {
    return NextResponse.json({ ok: false, error: "node key required (X-Node-Key)" }, { status: 401, headers: HEADERS })
  }
  const { lang } = await params
  if (!LANG.test(lang)) return NextResponse.json({ ok: false, error: "bad language" }, { status: 400, headers: HEADERS })

  const manifest = await kitManifest()
  if (!manifest) {
    return NextResponse.json({ ok: false, error: "shell kit is not built (npm run build:shell-kit)" }, { status: 503, headers: HEADERS })
  }
  const data = await loadProjectShell(lang, coreShellWhere())
  if (!data) return NextResponse.json({ ok: false, error: "the site gave no project shell" }, { status: 502, headers: HEADERS })

  const q = req.nextUrl.searchParams
  const path = q.get("path")
  const props: ShellKitProps = { data, surface: surfaceOf(q), path: path && HREF.test(path) ? path : `/${lang}` }
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

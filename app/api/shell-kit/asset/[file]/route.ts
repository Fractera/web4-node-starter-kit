// @api give the shell kit browser files by hashed name
import { timingSafeEqual } from "node:crypto"
import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { NextRequest, NextResponse } from "next/server"
import { ASSET, KIT_DIR } from "@/lib/shell-kit/kit"

// ФАЙЛЫ ИНСТРУМЕНТА «ОБОЛОЧКА ПРОЕКТА» (727-1). Имя несёт хэш содержимого — ответ неизменен навсегда, элемент и браузер кэшируют его
// без срока. Только имена из `.shell-kit/` по образцу `shell-kit.<hash>.js|css`; ключ узла, как у двери фрагмента.
export const dynamic = "force-dynamic"

function nodeKeyOk(given: string | null): boolean {
  const expected = process.env.SETTINGS_SECRET ?? ""
  if (!expected || !given) return false
  const a = Buffer.from(given)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ file: string }> }) {
  if (!nodeKeyOk(req.headers.get("x-node-key"))) {
    return NextResponse.json({ ok: false, error: "node key required (X-Node-Key)" }, { status: 401 })
  }
  const { file } = await params
  if (!ASSET.test(file)) return NextResponse.json({ ok: false, error: "unknown file" }, { status: 404 })
  try {
    const body = await readFile(join(KIT_DIR, file))
    const type = file.endsWith(".js") ? "text/javascript; charset=utf-8" : "text/css; charset=utf-8"
    return new NextResponse(body, { headers: { "Content-Type": type, "Cache-Control": "public, max-age=31536000, immutable" } })
  } catch {
    return NextResponse.json({ ok: false, error: "unknown file" }, { status: 404 })
  }
}

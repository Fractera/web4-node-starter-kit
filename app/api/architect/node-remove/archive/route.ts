// @api download an archive of the node's data before removing it
import { spawn } from "node:child_process"
import { existsSync } from "node:fs"
import { join } from "node:path"
import { Readable } from "node:stream"
import { NextRequest, NextResponse } from "next/server"
import { childEnv, nodeRemoveDenied } from "@/lib/node-remove"

// АРХИВ ДАННЫХ УЗЛА ПЕРЕД УДАЛЕНИЕМ (шаг 746-2; владелец 2026-11-15: «Да, с архивом, начинай 746»).
// В архиве — то, чего нигде больше нет: `data/` (инструкции и душа человека, боты, память, домены, хранилища элементов в
// `data/services/<id>`), `.env.local` (ключи узла) и реестр элементов. Без того, что приходит само: копии шаблонов (`data/workshop`),
// модель векторов, каталог навыков. Код элементов — не здесь: окно называет элементы, чья работа есть только на этом компьютере.
// 🔒 `.env.local` уходит потоком в загрузку самого человека с его клавиатуры (`nodeRemoveDenied`); ни дверь, ни агент его не читают.
// 🔒 ПОТОК, А НЕ ФАЙЛ: `tar -czf -` (есть на macOS, Linux и Windows 10+) отдаётся по мере сжатия — ни места на диске, ни ожидания.
export const dynamic = "force-dynamic"

const PARTS = ["data", ".env.local", join("WEB4-ITEMS-REGISTRY", "web4-items.json")]
const SKIP = ["data/workshop", "data/services/embeddings/model", "data/node/skills-catalog"]

export async function GET(req: NextRequest) {
  const denied = await nodeRemoveDenied(req)
  if (denied) return denied
  const root = process.cwd()
  const parts = PARTS.filter((p) => existsSync(join(root, p)))
  if (!parts.length) return NextResponse.json({ ok: false, error: "nothing" }, { status: 404 })
  const tar = spawn("tar", ["-czf", "-", ...SKIP.map((s) => `--exclude=${s}`), ...parts], { cwd: root, env: childEnv(), windowsHide: true, stdio: ["ignore", "pipe", "ignore"] })
  req.signal.addEventListener("abort", () => tar.kill())
  const name = `fractera-node-data-${new Date().toISOString().slice(0, 10)}.tar.gz`
  return new Response(Readable.toWeb(tar.stdout) as ReadableStream, {
    headers: { "Content-Type": "application/gzip", "Content-Disposition": `attachment; filename="${name}"`, "Cache-Control": "no-store" },
  })
}

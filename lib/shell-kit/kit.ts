import "server-only"
import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { pathToFileURL } from "node:url"
import type { ShellKitProps } from "@/_tools/shell-kit/types/shell-kit"

// ГДЕ ЛЕЖИТ СОБРАННЫЙ ИНСТРУМЕНТ «ОБОЛОЧКА ПРОЕКТА» (727-1): `.shell-kit/` корня ядра, его кладёт `scripts/build-shell-kit.mjs` в
// prebuild. Пакет сервера грузится в обход сборщика Next (`turbopackIgnore`): у него свой React, и Next не должен его трогать.
// 🔒 Манифест читается на каждый запрос (байты), пакет — один раз на версию: новая сборка инструмента видна без перезапуска ядра.
export const KIT_DIR = join(process.cwd(), ".shell-kit")

export type KitManifest = { version: string; builtAt: string; js: string; css: string }
type Render = (p: ShellKitProps) => { header: string; footer: string }

let loaded: { version: string; render: Render } | null = null

export async function kitManifest(): Promise<KitManifest | null> {
  try {
    return JSON.parse(await readFile(join(KIT_DIR, "manifest.json"), "utf8")) as KitManifest
  } catch {
    return null
  }
}

export async function kitRender(m: KitManifest): Promise<Render> {
  if (loaded?.version === m.version) return loaded.render
  const url = `${pathToFileURL(join(KIT_DIR, "render.mjs")).href}?v=${m.version}`
  const mod = (await import(/* turbopackIgnore: true */ /* webpackIgnore: true */ url)) as { renderShellKit: Render }
  loaded = { version: m.version, render: mod.renderShellKit }
  return mod.renderShellKit
}

export const ASSET = /^shell-kit\.[0-9a-f]{10}\.(js|css)$/

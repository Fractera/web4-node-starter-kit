import { ProjectHeader } from "@/components/shell/project-header"
import { ProjectFooter } from "@/components/shell/project-footer"
import { ThemeProvider } from "@/components/shell/theme-provider.client"
import type { ShellSurface } from "@/components/shell/shell-types"
import { setShellKitPath } from "../shims/next-navigation"
import { KitDrawerToggle } from "./kit-drawer-toggle.client"
import type { ShellKitPart, ShellKitProps, ShellKitSurface } from "../types/shell-kit"

// ОДНО ДЕРЕВО ДЛЯ СЕРВЕРА ЯДРА И ДЛЯ БРАУЗЕРА (727-1): сервер рисует его в HTML, браузер оживляет то же самое дерево. Вид —
// `components/shell/` без единой правки; инструмент только переводит строки поверхности в её функции.
const withLang = (tpl: string) => (lang: string) => tpl.replace(/\{lang\}/g, lang)

function surfaceOf(s: ShellKitSurface): ShellSurface {
  return {
    meUrl: s.meUrl,
    loginHref: s.loginHref ? withLang(s.loginHref) : undefined,
    logoutHref: s.logoutHref ? withLang(s.logoutHref) : undefined,
    languages: s.languages,
  }
}

export function ShellKitRoot({ part, props }: { part: ShellKitPart; props: ShellKitProps }) {
  setShellKitPath(props.path)
  const surface = surfaceOf(props.surface)
  const left = props.drawers?.left
  const right = props.drawers?.right
  return (
    <ThemeProvider>
      {part === "header" ? (
        <ProjectHeader
          data={props.data}
          surface={surface}
          leftSlot={left ? <KitDrawerToggle side="left" labels={left} /> : undefined}
          rightSlot={right ? <KitDrawerToggle side="right" labels={right} /> : undefined}
        />
      ) : (
        <ProjectFooter data={props.data} surface={surface} />
      )}
    </ThemeProvider>
  )
}

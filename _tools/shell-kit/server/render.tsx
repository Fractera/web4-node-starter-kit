import { renderToString } from "react-dom/server"
import { ShellKitRoot } from "../client/shell-kit-root"
import type { ShellKitProps } from "../types/shell-kit"

// СЕРВЕРНЫЙ ВХОД ПАКЕТА (727-1): дверь ядра `/api/shell-kit/<язык>` грузит собранный `.shell-kit/render.mjs` и зовёт эту функцию.
// Свой React внутри пакета — тот же, что оживит фрагмент в браузере (одна версия на обе стороны).
export function renderShellKit(props: ShellKitProps): { header: string; footer: string } {
  return {
    header: renderToString(<ShellKitRoot part="header" props={props} />),
    footer: renderToString(<ShellKitRoot part="footer" props={props} />),
  }
}

import { hydrateRoot } from "react-dom/client"
import { ShellKitRoot } from "./shell-kit-root"
import type { ShellKitPart, ShellKitProps } from "../types/shell-kit"

// ВХОД ПАКЕТА В БРАУЗЕРЕ (727-1). Заглушка элемента кладёт на страницу фрагменты `[data-shell-kit="header|footer"]` и один
// `<script type="application/json" id="shell-kit-props">`; пакет оживляет каждый фрагмент своим React — React элемента их не трогает.
function boot() {
  const raw = document.getElementById("shell-kit-props")?.textContent
  if (!raw) return
  let props: ShellKitProps
  try {
    props = JSON.parse(raw) as ShellKitProps
  } catch {
    console.warn("[shell-kit] props are not JSON — the header stays static")
    return
  }
  for (const el of document.querySelectorAll<HTMLElement>("[data-shell-kit]")) {
    const part = el.dataset.shellKit as ShellKitPart
    if ((part === "header" || part === "footer") && !el.dataset.shellKitLive) {
      el.dataset.shellKitLive = "1"
      hydrateRoot(el, <ShellKitRoot part={part} props={props} />)
    }
  }
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot)
else boot()

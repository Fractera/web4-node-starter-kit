import { useSyncExternalStore } from "react"

// `next/navigation` ВНЕ NEXT (727-1). Путь до первого кадра — тот, для которого сервер ядра рисовал фрагмент (иначе гидрация
// разойдётся), после — настоящий путь страницы. Переход — обычная навигация браузера.
let serverPath = "/"
export function setShellKitPath(path: string) {
  serverPath = path
}

const subscribe = (cb: () => void) => {
  window.addEventListener("popstate", cb)
  return () => window.removeEventListener("popstate", cb)
}

export function usePathname(): string {
  return useSyncExternalStore(subscribe, () => window.location.pathname, () => serverPath)
}

export function useRouter() {
  return {
    push: (href: string) => window.location.assign(href),
    replace: (href: string) => window.location.replace(href),
    refresh: () => window.location.reload(),
    back: () => window.history.back(),
    forward: () => window.history.forward(),
    prefetch: () => {},
  }
}

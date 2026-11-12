import { forwardRef, type AnchorHTMLAttributes } from "react"

// `next/link` ВНЕ NEXT (727-1). Пакет инструмента живёт на чужой странице, где роутера ядра нет: ссылка — обычный `<a>`.
type Props = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; prefetch?: boolean | null; replace?: boolean; scroll?: boolean }

const Link = forwardRef<HTMLAnchorElement, Props>(function Link({ prefetch: _p, replace: _r, scroll: _s, ...rest }, ref) {
  return <a ref={ref} {...rest} />
})

export default Link

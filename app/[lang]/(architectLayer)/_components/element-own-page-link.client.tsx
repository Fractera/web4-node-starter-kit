'use client'
import { useEffect, useState } from 'react'
import { buttonVariants } from '@/components/ui/button'
import { isLoopbackHostname } from '@/lib/auth/owner-at-machine'

// ССЫЛКА НА СОБСТВЕННУЮ СТРАНИЦУ ЭЛЕМЕНТА (706-1). Адрес выбирает БРАУЗЕР, а не сервер: слой архитектора статичен и не знает, на
// какой адрес пришёл человек (`headers()` здесь запрещён — README слоя). На этой машине — локальный порт элемента; иначе — его свой
// домен; нет ни того ни другого — одна строка, почему страница открывается только на этой машине.
// ✗ Прежде кнопки «Блоки», «Дизайн», «Настройки сайта» переадресовывали на `https://<адрес элемента>`, а без своего домена элемент
// живёт только на этой машине — переход уходил в пустоту (владелец 2026-11-09: «Эти кнопки сейчас у нас не реализуют ничего»).
export function ElementOwnPageLink({ lang, path, port, publicUrl, label, localOnly }: {
  lang: string; path: string; port: number | null; publicUrl: string | null; label: string; localOnly: string
}) {
  const [href, setHref] = useState<string | null | undefined>(undefined)
  useEffect(() => {
    const local = isLoopbackHostname(window.location.hostname)
    const base = local && port ? `http://127.0.0.1:${port}` : publicUrl
    setHref(base ? `${base.replace(/\/+$/, '')}/${lang}/${path}` : null)
  }, [lang, path, port, publicUrl])
  if (href === undefined) return <div className="h-9" data-own-page-link="checking" />
  if (href === null) return <p className="text-sm text-muted-foreground" data-own-page-link="local-only">{localOnly}</p>
  return (
    <div className="flex flex-col gap-1.5" data-own-page-link="ready">
      <a href={href} target="_blank" rel="noopener noreferrer" className={buttonVariants({ className: 'w-fit' })} data-block="own-page-link">{label}</a>
      <p className="font-mono text-[length:var(--fs-small)] text-muted-foreground">{href}</p>
    </div>
  )
}

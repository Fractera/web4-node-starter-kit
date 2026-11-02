import "server-only"
import { getAppConfig } from "@/config/app-config"
import { featureOn } from "@/config/platform-config"
import { getAvailableLanguages, DEFAULT_LANGUAGE } from "@/config/translations/translations.config"
import { LANGUAGE_REGIONS } from "@/config/translations/language-metadata"
import { accountLinks } from "@/lib/menu/account-links"
import { ARCHITECT_LAYER_ROLES } from "@/lib/roles"
import { appShellAuthSide } from "@/components/menu/account/account-config"
import { accountLabels } from "@/components/menu/account/account-menu.i18n"
import { topMenuUi } from "@/components/menu/top/top-menu.i18n"
import { footerLabels, widthLabels } from "@/components/menu/footer/footer-menu.i18n"
import type { ShellData } from "@/components/shell/shell-types"

// ДАННЫЕ ШАПКИ И ПОДВАЛА СТРАНИЦ АРХИТЕКТОРА (узел, шаг 553). Вид — копия оболочки сайта (`components/shell/`, сторож
// `check:shell-kits`); данные ядро собирает само, а не спрашивает у сайта.
//
// 🎯 Слово владельца 2026-10-21: «единственное что нам нужно это та самая кнопка войти, которая превращается в кнопку мой аккаунт и
// содержит оранжевую точку … я бы предпочёл иметь собственное меню для страницы архитектора». Отсюда: меню проекта из CONFIG здесь
// не показывается (`top: []`), вкладку «Все проекты» ставит островок (`navSlot`), кнопка кабинета есть ВСЕГДА — сторона из
// настроек, иначе справа. Подвал — только переключатели темы, ширины и языка (владелец: «Только переключатели (Рекомендую)»).
// 🪦 285-3 «шапка ядра = шапка проекта» (данные — дверь сайта `/api/shell/<язык>` на сборке) снята шагом 553.
export function coreShellData(lang: string): ShellData {
  const cfg = getAppConfig()
  const acc = accountLabels(lang)
  const ui = footerLabels(lang)
  const width = widthLabels(lang)
  const top = topMenuUi(lang)

  return {
    lang,
    brand: cfg.short_name ?? "Fractera",
    logo: cfg.logo || null,
    home: `/${lang}/architect`,
    menuOn: true,
    top: [],
    footer: [],
    account: {
      side: appShellAuthSide() ?? "right",
      labels: { signIn: acc.signIn, account: acc.account, signOut: acc.signOut },
      // Пять страниц «Главного агента» (528-4) и вход в группу страниц архитектора — на нём список «что ждёт архитектора» (356-1).
      links: [
        ...accountLinks(lang).map((l) => ({ href: l.href, label: l.label, ...(l.roles ? { roles: [...l.roles] } : {}) })),
        { href: `/${lang}/architect`, label: top.architectGroup, roles: [...ARCHITECT_LAYER_ROLES] },
      ],
    },
    toggles: { theme: featureOn("themeToggle"), width: featureOn("widthToggle"), language: featureOn("languageSwitcher") },
    words: {
      menu: top.menu,
      footerPages: ui.footerPages,
      rights: ui.rights,
      system: ui.system,
      light: ui.light,
      dark: ui.dark,
      social: ui.social,
      wide: width.wide,
      normal: width.normal,
    },
    socials: [],
    address: null,
    languages: getAvailableLanguages().map((l) => ({
      code: l.code,
      nativeName: l.nativeName,
      englishName: l.englishName,
      flag: l.flag,
      regions: [...l.regions],
      ...(l.regionFlags ? { regionFlags: { ...(l.regionFlags as Record<string, string>) } } : {}),
    })),
    regions: [...LANGUAGE_REGIONS],
    defaultLang: DEFAULT_LANGUAGE,
  }
}

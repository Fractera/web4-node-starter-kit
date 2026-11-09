"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { H2, P, Small } from "@/components/ui/typography"
import { isLoopbackHostname } from "@/lib/auth/owner-at-machine"
import { ALL_LANGUAGE_METADATA } from "@/lib/site-settings/language-metadata"
import type { ShellGroup } from "@/components/shell/shell-types"
import type { ElementRemoteWords } from "@/app/[lang]/(architectLayer)/_i18n/element-remote.i18n"
import { RemoteSettings, shellUrl, useRemote } from "./remote.client"
import { RemoteState } from "./remote-state"
import { SettingsEditorIsland } from "./site/config/settings-editor.client"
import { LanguagesIsland } from "./site/config/languages-island.client"
import { SettingsToaster } from "./site/config/toast"
import { MenuEditorIsland } from "./site/editors/menu-editor.client"
import { CookieBannerIsland } from "./site/editors/cookie-banner.client"
import { FeatureSwitchesIsland } from "./site/editors/feature-switches.client"
import { visibleSections } from "./site/remote-fields"
import { shellMenu } from "./site/menu-data"
import { LinkedValues } from "./site/linked-values"
import type { SiteRemoteWords } from "./site/words"

// ВКЛАДКА «СТРОИТЕЛЬСТВО → НАСТРОЙКИ САЙТА» ЦЕЛИКОМ (узел, шаг 712-4). Владелец 2026-11-09: «для CONFIG и для дизайна мы должны
// избавиться от внешних страниц которые уводят нас из вкладки работы с элементом». Редакторы — копии страниц самого элемента
// (`site/config/*` — основное, поиск, мета и медиа, языки; `site/editors/*` — шапка, подвал, баннер cookie, выключатели); пишут
// они через пульт ядра в файлы элемента. Раздел виден, только если элемент объявляет его поля; связан с CONFIG — только чтение.

type Props = { item: string; slug: string; lang: string; port: number | null; publicUrl: string | null; words: ElementRemoteWords; site: SiteRemoteWords }
type Shell = { top?: ShellGroup[]; footer?: ShellGroup[] }
type Built = { langs?: string[]; def?: string; unlocked?: string[] } | null

const GROUPS = ["basics", "seo", "metaMedia"] as const
const CATALOGUE = Object.values(ALL_LANGUAGE_METADATA)
  .map((m) => ({ code: m.code, flag: m.flag, nativeName: m.nativeName, englishName: m.englishName, tier: m.aiTier }))
  .sort((a, b) => a.englishName.localeCompare(b.englishName))

function Body({ item, slug, lang, port, publicUrl, words, site }: Props) {
  const { files, visible } = useRemote()
  const [shell, setShell] = useState<Shell | null>(null)
  const [links, setLinks] = useState<{ label: string; url: string }[]>([])
  const f = site.editors.features_words
  useEffect(() => {
    const local = isLoopbackHostname(window.location.hostname)
    const base = (local && port ? `http://127.0.0.1:${port}` : publicUrl)?.replace(/\/+$/, "")
    const own = base ? [{ label: f.linkSite, url: `${base}/${lang}` }, { label: f.linkAdmin, url: `${base}/${lang}/admin` }] : []
    setLinks([...own, { label: f.linkCore, url: `${window.location.origin}/${lang}/architect` }])
  }, [port, publicUrl, lang, f.linkSite, f.linkAdmin, f.linkCore])
  useEffect(() => {
    let live = true
    fetch(shellUrl(item, lang), { cache: "no-store" }).then((r) => r.json()).catch(() => null)
      .then((b) => { if (live && b?.ok) setShell(b.shell as Shell) })
    return () => { live = false }
  }, [item, lang])

  const app = files.app
  const features = files.features
  if (app?.state !== "ok") return <RemoteState loaded={app} words={words} />
  if (features?.state !== "ok") return <RemoteState loaded={features} words={words} />
  if (app.linked) return <LinkedValues app={app.config} features={features.config} words={words} site={site} visible={visible} />

  const built = app.built as Built
  const langs = built?.langs?.length ? built.langs : [lang]
  const def = built?.def ?? langs[0]
  const hrefs = { configHref: `/${lang}/architect/config`, settingsHref: `/${lang}/architect/${slug}/build/site-settings` }
  const deployHref = `/${lang}/architect/${slug}/build/deployments`
  const switches = site.editors.features.filter((x) => visible("features", x.key, "boolean"))
  const menu = (slot: "top" | "footer") => shell && visible("features", slot === "top" ? "topMenu" : "footerPages", "boolean") && visible("app", `nav.${slot}`, "array")
  const tabs = [
    ...GROUPS.filter((g) => visibleSections(g, visible).length > 0),
    ...(visible("app", "languages.supported", "array") && visible("app", "languages.default", "string") ? ["languages" as const] : []),
    ...(menu("top") ? ["header" as const] : []),
    ...(menu("footer") ? ["footer" as const] : []),
    ...(visible("features", "cookieBanner", "boolean") ? ["cookies" as const] : []),
    ...(switches.length ? ["features" as const] : []),
  ]
  if (!tabs.length) return <RemoteState loaded={{ state: "off", reason: "template-older" }} words={words} />

  return (
    <>
      <Tabs defaultValue={tabs[0]} className="flex flex-col gap-4">
        <TabsList className="flex-wrap">
          {tabs.map((t) => <TabsTrigger key={t} value={t} data-site-tab={t}>{words.siteTabs[t]}</TabsTrigger>)}
        </TabsList>
        {GROUPS.filter((g) => tabs.includes(g)).map((g) => (
          <TabsContent key={g} value={g}>
            <SettingsEditorIsland group={g} lang={lang} langs={langs} defaultLang={def} editLangLabel={site.site.editLang} ui={site.fields} words={site.site.access} />
          </TabsContent>
        ))}
        <TabsContent value="languages">
          <div data-block="ess01" className="flex flex-col gap-3">
            <Small data-block="ess02" className="text-muted-foreground">{site.site.languagesNote}</Small>
            <LanguagesIsland catalogue={CATALOGUE} built={langs} builtDefault={def} builtUnlocked={built?.unlocked ?? []} ui={site.groups} search={site.search} deployHref={deployHref} words={site.site.access} />
          </div>
        </TabsContent>
        {shell && (["top", "footer"] as const).map((slot) => {
          const { current, candidates } = shellMenu(shell, lang, slot)
          return (
            <TabsContent key={slot} value={slot === "top" ? "header" : "footer"}>
              <MenuEditorIsland slot={slot} editLang={lang} current={current} candidates={candidates} ui={site.groups} words={site.editors.access} {...hrefs} />
            </TabsContent>
          )
        })}
        <TabsContent value="cookies">
          <CookieBannerIsland ui={site.groups} words={site.editors.access} policyHref={`/${lang}/cookies`} {...hrefs} />
        </TabsContent>
        <TabsContent value="features">
          <FeatureSwitchesIsland title="" note={site.editors.note} features={switches} words={{ ...site.editors.access, ...f }} links={links} dialogUi={site.dialog} {...hrefs} />
        </TabsContent>
      </Tabs>
      <Small data-block="ess03" className="text-muted-foreground">{words.imagesNote}</Small>
      <SettingsToaster deployHref={deployHref} deployLabel={site.search.toDeployments} closeLabel={site.search.closeToast} />
    </>
  )
}

export function ElementSiteSettingsRemote(props: Props) {
  return (
    <RemoteSettings item={props.item} files={["app", "features"]}>
      <section data-block="ess04" data-element-site-settings data-remote-item={props.item} className="my-6 flex flex-col gap-4">
        <H2 data-block="ess05" variant="ui">{props.words.siteTitle}</H2>
        <P data-block="ess06" className="text-muted-foreground">{props.words.siteLead}</P>
        <Body {...props} />
      </section>
    </RemoteSettings>
  )
}

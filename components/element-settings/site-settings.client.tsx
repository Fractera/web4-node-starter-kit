"use client"

import { useEffect, useState, type ReactNode } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Small } from "@/components/ui/typography"
import { isLoopbackHostname } from "@/lib/auth/owner-at-machine"
import { ALL_LANGUAGE_METADATA } from "@/lib/site-settings/language-metadata"
import type { ShellGroup } from "@/components/shell/shell-types"
import type { ElementRemoteWords } from "@/app/[lang]/(architectLayer)/_i18n/element-remote.i18n"
import { StepHead } from "@/components/element-design/step-parts"
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
import { SectionNav } from "./site/section-nav.client"
import type { SiteRemoteWords } from "./site/words"

// ВКЛАДКА «СТРОИТЕЛЬСТВО → НАСТРОЙКИ САЙТА» ЦЕЛИКОМ (узел, шаги 712-4, 713-3). Владелец 2026-11-09: «для CONFIG и для дизайна мы должны
// избавиться от внешних страниц»; затем — «не спагетти дизайн»: сверху одна строка о связи с CONFIG, ниже — список разделов и один
// открытый раздел со своей шапкой и своим сохранением, «Сеть Web4» — последним разделом. Редакторы — копии страниц самого элемента
// (`site/config/*`, `site/editors/*`), пишут через пульт ядра в его файлы; раздел виден, только если элемент объявляет его поля.
// Разделы не размонтируются — несохранённое переживает переход; открытый раздел живёт в адресе (`#seo`).
type Props = { item: string; slug: string; lang: string; port: number | null; publicUrl: string | null; words: ElementRemoteWords; site: SiteRemoteWords }
type Shell = { top?: ShellGroup[]; footer?: ShellGroup[] }
type Built = { langs?: string[]; def?: string; unlocked?: string[] } | null
type Section = keyof ElementRemoteWords["siteTabs"]

const GROUPS = ["basics", "seo", "metaMedia"] as const
const CATALOGUE = Object.values(ALL_LANGUAGE_METADATA)
  .map((m) => ({ code: m.code, flag: m.flag, nativeName: m.nativeName, englishName: m.englishName, tier: m.aiTier }))
  .sort((a, b) => a.englishName.localeCompare(b.englishName))

function Body({ item, slug, lang, port, publicUrl, words, site, web4 }: Props & { web4: ReactNode }) {
  const { files, visible } = useRemote()
  const [shell, setShell] = useState<Shell | null>(null)
  const [links, setLinks] = useState<{ label: string; url: string }[]>([])
  const [picked, setPicked] = useState<Section | null>(null)
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
  const ready = app?.state === "ok" && features?.state === "ok"
  const switches = site.editors.features.filter((x) => visible("features", x.key, "boolean"))
  const menu = (slot: "top" | "footer") => Boolean(shell) && visible("features", slot === "top" ? "topMenu" : "footerPages", "boolean") && visible("app", `nav.${slot}`, "array")
  const own: Section[] = !ready ? [] : app.linked ? ["linked"] : [
    ...GROUPS.filter((g) => visibleSections(g, visible).length > 0),
    ...(visible("app", "languages.supported", "array") && visible("app", "languages.default", "string") ? ["languages" as const] : []),
    ...(menu("top") ? ["header" as const] : []),
    ...(menu("footer") ? ["footer" as const] : []),
    ...(visible("features", "cookieBanner", "boolean") ? ["cookies" as const] : []),
    ...(switches.length ? ["features" as const] : []),
  ]
  const sections: Section[] = [...own, ...(web4 ? ["web4" as const] : [])]
  const asked = typeof window === "undefined" ? "" : window.location.hash.slice(1)
  const current: Section | undefined = picked && sections.includes(picked) ? picked : sections.find((s) => s === asked) ?? sections[0]
  const pick = (s: Section) => { setPicked(s); window.history.replaceState(null, "", `#${s}`) }

  if (!app || !features || app.state === "loading" || features.state === "loading") return <Skeleton data-block="ess01" className="h-72 w-full rounded-lg" />
  const notice = app.state !== "ok" ? <RemoteState loaded={app} words={words} />
    : features.state !== "ok" ? <RemoteState loaded={features} words={words} />
    : own.length === 0 ? <RemoteState loaded={{ state: "off", reason: "template-older" }} words={words} /> : null
  if (!current) return notice

  const built = (app.state === "ok" ? app.built : null) as Built
  const langs = built?.langs?.length ? built.langs : [lang]
  const def = built?.def ?? langs[0]
  const hrefs = { configHref: `/${lang}/architect/config`, settingsHref: `/${lang}/architect/${slug}/build/site-settings` }
  const deployHref = `/${lang}/architect/${slug}/build/deployments`
  const panel = (s: Section): ReactNode => {
    if (s === "web4") return web4
    if (s === "linked") return app.state === "ok" && features.state === "ok" ? <LinkedValues app={app.config} features={features.config} site={site} visible={visible} /> : null
    if (s === "basics" || s === "seo" || s === "metaMedia") {
      return (
        <div data-block="ess02" className="flex flex-col gap-6">
          <SettingsEditorIsland group={s} lang={lang} langs={langs} defaultLang={def} editLangLabel={site.site.editLang} ui={site.fields} words={site.site.access} />
          {s === "metaMedia" ? <Small data-block="ess03" className="max-w-prose">{words.imagesNote}</Small> : null}
        </div>
      )
    }
    if (s === "languages") {
      return (
        <div data-block="ess09" className="flex flex-col gap-4">
          <Small data-block="ess10" className="max-w-prose">{site.site.languagesNote}</Small>
          <LanguagesIsland catalogue={CATALOGUE} built={langs} builtDefault={def} builtUnlocked={built?.unlocked ?? []} ui={site.groups} search={site.search} deployHref={deployHref} words={site.site.access} />
        </div>
      )
    }
    if ((s === "header" || s === "footer") && shell) {
      const slot = s === "header" ? "top" : "footer"
      const { current: now, candidates } = shellMenu(shell, lang, slot)
      return <MenuEditorIsland slot={slot} editLang={lang} current={now} candidates={candidates} ui={site.groups} words={site.editors.access} {...hrefs} />
    }
    if (s === "cookies") return <CookieBannerIsland ui={site.groups} words={site.editors.access} policyHref={`/${lang}/cookies`} {...hrefs} />
    if (s === "features") return <FeatureSwitchesIsland title="" note={site.editors.note} features={switches} words={{ ...site.editors.access, ...f }} links={links} dialogUi={site.dialog} {...hrefs} />
    return null
  }
  return (
    <div data-block="ess04" className="flex flex-col gap-6">
      {notice}
      <div data-block="ess05" className={sections.length > 1 ? "grid gap-8 lg:grid-cols-[11rem_minmax(0,1fr)]" : "grid"}>
        {sections.length > 1 ? <SectionNav sections={sections} current={current} onPick={pick} label={words.siteNav} names={words.siteTabs} apart={web4 ? "web4" : undefined} /> : null}
        <div data-block="ess06" className="flex min-w-0 flex-col">
          {sections.map((s) => (
            <section key={s} data-block="ess07" data-site-panel={s} hidden={s !== current} className="flex flex-col gap-6">
              <StepHead title={words.siteTabs[s]} lead={words.siteLeads[s]} />
              {panel(s)}
            </section>
          ))}
        </div>
      </div>
      <SettingsToaster deployHref={deployHref} deployLabel={site.search.toDeployments} closeLabel={site.search.closeToast} />
    </div>
  )
}

export function ElementSiteSettingsRemote({ configLine, web4, ...props }: Props & { configLine: ReactNode; web4: ReactNode }) {
  return (
    <RemoteSettings item={props.item} files={["app", "features"]}>
      <div data-block="ess08" data-element-site-settings data-remote-item={props.item} className="my-6 flex flex-col gap-8">
        {configLine}
        <Body {...props} web4={web4} />
      </div>
    </RemoteSettings>
  )
}

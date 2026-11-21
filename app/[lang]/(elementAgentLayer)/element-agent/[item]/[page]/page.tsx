// @local — one element's agent page in the bare frame for its own admin (node step 834-4); the widgets are the panel's own
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { AccessGate } from "@/components/auth/access-gate.client"
import { accessGateUi } from "@/components/auth/access-gate.i18n"
import { appDialogUi } from "@/components/dialog/app-dialog.i18n"
import { EnvironmentPanel } from "@/components/environment/environment-panel"
import { buttonVariants } from "@/components/ui/button"
import { H1, Small } from "@/components/ui/typography"
import elementAgentRoles from "@/lib/auth/element-agent-roles.cjs"
import { cn } from "@/lib/utils"
import { elementName } from "@/lib/web4-items/dashboard-rows"
import { agentKitWidget, type AgentKitPage } from "@/app/[lang]/(architectLayer)/architect/[item]/_agent-kit/widgets"
import { elementAgentWords, PAGES, type ElementAgentPage } from "./element-agent.i18n"

// THE FRAME'S PAGE (834-4): `/<lang>/element-agent/<id or address>/<subscription|terminal|telegram|openai>`. The same widgets as the
// node's panel (`architect/[item]` — the agent kit and the environment panel), around them only the element's name and four tabs.
type Params = { lang: string; item: string; page: string }

const KIT: Record<Exclude<ElementAgentPage, "openai">, AgentKitPage> = { subscription: "claude-code", terminal: "terminal", telegram: "telegram" }

/** Its own title — the element and the page; never indexed (the layout says so too). */
export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { lang, item, page } = await params
  const id = elementAgentRoles.elementIdOf(process.cwd(), item) as string | null
  const l = lang === "ru" ? "ru" : "en"
  const label = (PAGES as readonly string[]).includes(page) ? elementAgentWords(l).page[page as ElementAgentPage] : ""
  return { title: id ? `${elementName(id, l)} · ${label}` : label, robots: { index: false, follow: false } }
}

export default async function ElementAgentPage({ params }: { params: Promise<Params> }) {
  const { lang, item, page } = await params
  const root = process.cwd()
  const id = elementAgentRoles.elementIdOf(root, item) as string | null
  if (!id || !(PAGES as readonly string[]).includes(page)) notFound()
  const l = lang === "ru" ? "ru" : "en"
  const w = elementAgentWords(l)
  const here = page as ElementAgentPage
  const base = `/${lang}/element-agent/${item}`
  const widget = here === "openai"
    ? <EnvironmentPanel target={id} lang={lang} />
    : agentKitWidget(KIT[here], id, lang, undefined, { terminal: `${base}/terminal`, telegram: `${base}/telegram` })
  return (
    <AccessGate roles={elementAgentRoles.agentRoles(root, id)} lang={lang} ui={accessGateUi(lang)} dialogUi={appDialogUi(lang)}>
      <main data-block="element-agent" data-app-column="" className="mx-auto flex w-full flex-col gap-6 px-4 py-8">
        <div data-block="element-agent-head" className="flex flex-col gap-1">
          <Small className="text-muted-foreground">{w.eyebrow}</Small>
          <H1>{elementName(id, l)}</H1>
        </div>
        <nav data-block="element-agent-tabs" aria-label={w.tabs} className="flex flex-wrap gap-2">
          {PAGES.map((p) => (
            <Link key={p} href={`${base}/${p}`} aria-current={p === here ? "page" : undefined}
              className={cn(buttonVariants({ variant: p === here ? "default" : "outline", size: "sm" }))}>
              {w.page[p]}
            </Link>
          ))}
        </nav>
        <section data-block="element-agent-body" className="min-w-0">{widget}</section>
      </main>
    </AccessGate>
  )
}

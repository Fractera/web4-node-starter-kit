"use client"
// @local — «Claude сделает это в вашем Chrome» of the launch (one route: «Активация выделенного сервера»): the records rung (760-9) and the bot (760-10)

import { terminalLink } from "@/app/[lang]/(architectLayer)/architect/kits/_agent-kit/core/client/terminal-paste.mjs"
import type { ServerLaunchWords } from "@/components/hosting/server-launch.i18n"
import { buttonVariants } from "@/components/ui/button"
import { Small } from "@/components/ui/typography"

export { chromeTask, telegramTask } from "@/lib/hosting/chrome-task.mjs"

// 760-9 (the owner, 2026-11-16: «На каждом шаге где мы заполняем эти записи сделать кнопку которая отправит в Claude Code Agent готовый
// запрос и пользователь сможет просто наблюдать как одновременно происходит настройки в регистраторе»). The button opens the main agent's
// terminal (`build`) with the task waiting in its paste window, the same road as «Сгенерировать описание» of the passport: the person
// sends it — that send is the yes for exactly these records — and watches the tab. The agent works by its skill `help-in-browser`:
// settings it finishes, signing in, codes and a deletion stay the person's. The task names the cabinet by the name servers (760-8).

const fill = (t: string, map: Record<string, string>) => Object.entries(map).reduce((s, [k, v]) => s.split(`{${k}}`).join(v), t)

type HelpWords = Pick<ServerLaunchWords["chrome"], "title" | "steps" | "note" | "button">

/** The card and its button; `map` fills the steps (`{cabinet}`), `task` waits in the main agent's paste window. */
export function ChromeHelp({ lang, words, map, task }: { lang: string; words: HelpWords; map: Record<string, string>; task: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-md border border-border bg-muted/40 p-3" data-block="server-launch-chrome">
      <Small className="font-medium text-foreground">{words.title}</Small>
      <ol className="flex list-decimal flex-col gap-1 pl-5 text-foreground text-sm" data-block="server-launch-chrome-steps">
        {words.steps.map((s) => <li key={s}>{fill(s, map)}</li>)}
      </ol>
      <Small className="text-muted-foreground">{words.note}</Small>
      <div data-block="server-launch-chrome-action">
        <a className={buttonVariants({ size: "sm", variant: "outline" })} href={terminalLink({ lang, service: "build", text: task })} rel="noopener" target="_blank">{words.button}</a>
      </div>
    </div>
  )
}

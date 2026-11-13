"use client"
// @local — the rung «Telegram» of the move ladder (one route: the tab «Выделенный сервер»); the bot's own set-up is the agent kit's TelegramChannel

import { useState } from "react"
import { TelegramChannel } from "@/app/[lang]/(architectLayer)/architect/kits/_agent-kit/core/client/telegram-channel.client"
import type { TelegramChannelWords } from "@/app/[lang]/(architectLayer)/architect/kits/_agent-kit/core/words/telegram-channel.i18n"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Small } from "@/components/ui/typography"
import type { MoveState } from "@/components/hosting/server-move-rung.client"
import type { ServerMoveWords } from "@/components/hosting/server-move.i18n"

// THE NODE'S MAIN BOT ON THE SERVER (node step 737-11a). The owner, 2026-11-13: «если уже подключён Telegram то спросить: переносить этот
// Telegram на сервер или создать другой … если нет то значит вызываем процедуру создание нового телеграмм бота прямо в этом окне как
// опциональное решение размещённое в аккордеоне».
// 🔒 THE CHOICE IS THE NODE'S STATE (`move.json` through `/api/node/server`), never this island's: «move» and «later» are recorded by the
// ladder's door; «new» is recorded by the server's own channel door when the person is admitted there.
// 🔒 ONE SET-UP OF A BOT IN THE WHOLE NODE: the accordion holds the agent kit's own `TelegramChannel` pointed at the server
// (`remote`), the same three steps as on every Telegram page of the node — BotFather, the token, the activation link.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
type Start = (rung: string, extra?: Record<string, unknown>) => Promise<void>
export type HomeBot = { username: string; allowed: number } | null

export function ServerTelegram({ state, homeBot, canMove = true, origin, lang, text, words, channelWords, busy, onStart }: {
  state: MoveState
  homeBot: HomeBot
  // 737-11b: an independent server never takes this node's bot (two readers of one bot split the person's messages).
  canMove?: boolean
  origin: string | null
  lang: string
  text: string
  words: ServerMoveWords["telegram"]
  channelWords: TelegramChannelWords
  busy: boolean
  onStart: Start
}) {
  const t = state.telegram ?? {}
  const done = state.rungs?.telegram?.state === "done"
  // Without a bot here the new one is the main road: its accordion stands open.
  const [open, setOpen] = useState(t.choice === "new" || !homeBot || !canMove ? "new" : "")

  if (done) {
    const line = t.choice === "move"
      ? words.doneMove.replace("{bot}", `@${t.bot ?? ""}`)
      : t.choice === "new"
        ? words.doneNew.replace("{bot}", `@${t.bot ?? ""}`).replace("{n}", String(t.allowed ?? 1))
        : words.doneLater
    return (
      <div className="flex flex-col gap-2" data-block="server-move-telegram" data-choice={t.choice ?? ""}>
        <p className="text-muted-foreground text-sm">{text}</p>
        <p className="text-foreground text-sm">{line}</p>
        {state.rungs?.move?.state !== "done" ? (
          <Button className="w-fit" disabled={busy} onClick={() => onStart("telegram", { choice: "reset" })} size="sm" variant="outline">
            {words.change}
          </Button>
        ) : null}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3" data-block="server-move-telegram">
      <p className="text-muted-foreground text-sm">{text}</p>
      {homeBot && canMove ? (
        <div className="flex flex-col gap-1" data-block="server-move-telegram-move">
          <Button className="w-fit" disabled={busy} onClick={() => onStart("telegram", { choice: "move" })} size="sm">
            {words.moveBot.replace("{bot}", `@${homeBot.username}`)}
          </Button>
          <Small className="text-muted-foreground">{words.moveNote}</Small>
        </div>
      ) : null}
      <Accordion collapsible onValueChange={setOpen} type="single" value={open}>
        <AccordionItem value="new">
          <AccordionTrigger>{words.newTitle}</AccordionTrigger>
          <AccordionContent>
            <Small className="text-muted-foreground">{homeBot ? words.newNoteHome.replace("{bot}", `@${homeBot.username}`) : words.newNote}</Small>
            {open === "new" ? (
              <TelegramChannel
                lang={lang}
                remote={{ door: `${BASE}/api/node/server/telegram?lang=${encodeURIComponent(lang)}`, origin: origin ?? "", doneText: words.remoteDone }}
                service="build"
                words={channelWords}
              />
            ) : null}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      {!homeBot || !canMove ? (
        <div className="flex flex-col gap-1" data-block="server-move-telegram-later">
          <Button className="w-fit" disabled={busy} onClick={() => onStart("telegram", { choice: "later" })} size="sm" variant="outline">
            {words.later}
          </Button>
          <Small className="text-muted-foreground">{words.laterNote}</Small>
        </div>
      ) : null}
    </div>
  )
}

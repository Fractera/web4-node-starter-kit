"use client"
// @local — the orange «Почему не Cloudflare?» of the server's domain ladder (one route: the tab «Выделенный сервер»), a shadcn Popover

import { CircleHelp } from "lucide-react"
import type { ServerLadderWords } from "@/components/hosting/server-ladder.i18n"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/components/ui/popover"

// 737-19. The owner, 2026-11-13: «мы убираем всю информацию о Cloud Flyer но вместо этого можем сделать небольшой оранжевый кнопку вопрос
// почему мы не используем Cloud флеер и там ты дашь развёрнуто ответ исходя из нашей переписки». Orange is the theme's `warning` token.

export function WhyNotCloudflare({ words }: { words: ServerLadderWords["records"]["why"] }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="w-fit border-warning/50 bg-warning/10 text-foreground hover:bg-warning/20" data-block="why-not-cloudflare" size="sm" variant="outline">
          <CircleHelp className="text-warning" data-icon="inline-start" />
          {words.button}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[min(32rem,calc(100vw-2rem))]">
        <PopoverHeader>
          <PopoverTitle>{words.title}</PopoverTitle>
          <ul className="flex list-disc flex-col gap-2 pl-5 text-muted-foreground">
            {words.points.map((p) => <li key={p}>{p}</li>)}
          </ul>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  )
}

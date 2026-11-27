"use client"
// @local — the notice after a wish for one element's product quiz (861-1); nothing else sends quiz wishes

import { AppDialog } from "@/components/dialog/app-dialog.client"
import type { AppDialogUi } from "@/components/dialog/app-dialog.i18n"
import { Button, buttonVariants } from "@/components/ui/button"
import { P } from "@/components/ui/typography"

// ОКНО ПОСЛЕ ПОЖЕЛАНИЯ К КВИЗУ (шаг 861-1; Рома 2026-11-27, Telegram 1467: «всплыть уведомление … ваше пожелание к квизу добавлено,
// перейдите в чат … кнопка перейти в чат»). Пожелание уже у главного агента (дверь `/api/node/product-quiz/wish`); окно говорит, где
// разговор продолжится: в боте элемента, а без бота — в его терминале. Одно окно на проект — `AppDialog`.

export type QuizWishWords = {
  title: string
  text: string
  noWake: string
  failedTitle: string
  errors: { empty: string; "too-long": string; other: string }
  toChat: string
  toTerminal: string
  close: string
}

export type QuizWishResult = { ok: true; chat: string | null; woke: boolean } | { ok: false; error: string }

export function QuizWishNotice({ result, words, dialogUi, onClose, onTerminal }: {
  result: QuizWishResult | null
  words: QuizWishWords
  dialogUi: AppDialogUi
  onClose: () => void
  onTerminal: () => void
}) {
  const ok = result?.ok === true
  const text = !result ? "" : result.ok ? (result.woke ? words.text : words.noWake) : words.errors[result.error as keyof QuizWishWords["errors"]] ?? `${words.errors.other} ${result.error}`
  const chat = result?.ok ? result.chat : null
  return (
    <AppDialog
      open={result !== null}
      onOpenChange={(v) => { if (!v) onClose() }}
      title={ok ? words.title : words.failedTitle}
      ui={dialogUi}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>{words.close}</Button>
          {ok && chat && (
            <a href={chat} target="_blank" rel="noopener noreferrer" className={buttonVariants()} onClick={onClose} data-quiz-wish-chat>
              {words.toChat}
            </a>
          )}
          {ok && !chat && <Button onClick={() => { onClose(); onTerminal() }} data-quiz-wish-terminal>{words.toTerminal}</Button>}
        </>
      }
    >
      <P className={ok ? undefined : "text-destructive"} role={ok ? "status" : "alert"} data-block="quiz-wish-notice" data-quiz-wish={ok ? "sent" : "refused"}>
        {text}
      </P>
    </AppDialog>
  )
}

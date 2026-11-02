"use client"

// «НАСТРОЙКИ» РАЗДЕЛА С РАСПИСАНИЕМ (узел, шаг 558) — «Резервное копирование» элементов памяти и «Автоматизированное управление» главного
// агента. Слова владельца 2026-10-21: «вкладка настройки где пользователю будет предполагаться возможность с помощью текстового поля
// надиктовать как именно нужно делать резервное копирование например каждую неделю или каждые 5 минут что именно копировать … пользователь
// нажимает кнопку добавить в разработку и происходит процесс который сначала подтвердит папку в терминале затем активирует сам терминал
// отправит туда задание и пользуйтесь будешь ждать завершение разработки».
// 🔒 Нового пути нет: кнопка — переход на страницу терминала с `?paste=` (551-7): спящий терминал запускается сам, вопрос доверия папке
// отвечает узел, задача уходит агенту первым поручением. Текст задачи = готовая первая часть (`taskLead`) + слова человека.
import { useState } from "react"
import { VoiceTextarea } from "@/components/form/voice-textarea.client"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { terminalLink } from "@/app/[lang]/(architectLayer)/architect/kits/_agent-kit/core/client/terminal-paste.mjs"

export type ScheduleTaskWords = {
  title: string
  hint: string
  placeholder: string
  comment: string
  button: string
  /** Первая часть задачи агенту — что строить и по каким законам; к ней дописываются слова человека. */
  taskLead: string
}

export function ScheduleTask({ lang, service, words }: { lang: string; service: string; words: ScheduleTaskWords }) {
  const [text, setText] = useState("")
  const ready = text.trim().length > 0
  const href = ready ? terminalLink({ lang, service, text: `${words.taskLead}\n\n${text.trim()}` }) : undefined
  return (
    <div className="my-6 flex max-w-3xl flex-col gap-4" data-schedule-task>
      <VoiceTextarea value={text} onChange={setText} lang={lang} title={words.title} hint={words.hint} comment={words.comment} placeholder={words.placeholder} rows={5} />
      <a
        href={href}
        aria-disabled={!ready}
        className={cn(buttonVariants({ size: "sm" }), "self-start", !ready && "pointer-events-none opacity-50")}
        data-schedule-task-send
      >
        {words.button}
      </a>
    </div>
  )
}

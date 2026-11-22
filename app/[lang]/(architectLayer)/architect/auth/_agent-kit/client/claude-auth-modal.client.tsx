"use client"
// @local — the sign-in window of «Подписка Claude Code» (267-2): the link Claude Code printed and the field for Anthropic's code; moved out of
// claude-subscription.client.tsx in 840-3 so the page's island stays under the 250-line limit.

import { useState } from "react"
import { Check, Copy, ExternalLink, KeyRound } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { AppDialog } from "@/components/dialog/app-dialog.client"
import { Input } from "@/components/ui/input"
import type { ClaudeSubscriptionWords } from "../words/claude-subscription.i18n"

export function AuthModal({
  url,
  words,
  onClose,
  onSend,
}: {
  url: string
  words: ClaudeSubscriptionWords
  onClose: () => void
  onSend: (code: string) => void
}) {
  const [copied, setCopied] = useState(false)
  const [code, setCode] = useState("")
  const [sent, setSent] = useState(false)

  const submit = () => {
    const v = code.trim()
    if (!v) return
    onSend(v)
    setSent(true)
    setTimeout(onClose, 1200)
  }

  // 🔒 ОКНО ПРОДУКТА ОДНО — `AppDialog` (сторож `check:dialogs`): у примитива нет предела высоты и
  // прокручиваемого тела, и длинная ссылка вытолкнула бы поле кода за край экрана.
  return (
    <AppDialog
      open
      onOpenChange={(o) => !o && onClose()}
      size="md"
      ui={{ close: words.close }}
      titleClassName="flex items-center gap-2"
      title={<><KeyRound className="size-4 shrink-0" aria-hidden /> {words.modalTitle}</>}
      description={words.modalText}
      footer={
        <div data-block="dprzv" className="flex w-full flex-col gap-2">
          <Input
            autoComplete="off"
            disabled={sent}
            value={code}
            placeholder={words.codePlaceholder}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
          <Button type="button" className="w-full" disabled={sent || !code.trim()} onClick={submit}>
            {sent ? words.codeSent : words.sendCode}
          </Button>
        </div>
      }
    >
      <div data-block="wb4kk" className="flex flex-col gap-3">
        <div data-block="qi4rh" className="max-h-[110px] select-text overflow-y-auto break-all rounded-lg border border-border bg-muted/50 px-3 py-2 font-mono text-xs">
          {url}
        </div>
        <div data-block="ytj2f" className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(url)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              } catch {
                /* буфер закрыт политикой браузера — ссылка видна и выделяется */
              }
            }}
          >
            {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
            {copied ? words.copied : words.copyLink}
          </Button>
          {/* Ссылка, а не кнопка-обёртка: `Button` узла не умеет `asChild`. */}
          <a href={url} target="_blank" rel="noopener noreferrer" className={buttonVariants({ size: "sm", variant: "outline" })}>
            <ExternalLink className="size-4" aria-hidden />
            {words.openLink}
          </a>
        </div>
      </div>
    </AppDialog>
  )
}

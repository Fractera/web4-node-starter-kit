"use client"
// @part tool-looks — each tool that can run on samples, shown as itself; a look never spends money and never writes (733-8b-1)

import dynamic from "next/dynamic"
import { type ComponentProps, useState } from "react"
import { AppDialog } from "@/components/dialog/app-dialog.client"
import type { AppDialogUi } from "@/components/dialog/app-dialog.i18n"
import { TableTools } from "@/components/table/table-tools.client"
import { VoiceControl } from "@/components/form/voice-control.client"
import { VoiceField } from "@/components/form/voice-field.client"
import { VoiceTextarea } from "@/components/form/voice-textarea.client"
import { Button } from "@/components/ui/button"
import { P, Small } from "@/components/ui/typography"
import type { ChatMessage, ChatUi } from "@/_tools/chat/types/chat"
import type { ToolRow } from "@/lib/parts/tools-catalog"
import type { TableUi } from "@/sections/table.i18n"
import type { TranslationsUi } from "@/_tools/translations-dialog/types/translations-dialog.i18n"
import type { TranslationsDialog as TranslationsDialogType } from "@/_tools/translations-dialog/client/translations-dialog.client"
import type { ToolLooksWords } from "./tool-looks.i18n"
import type { ToolsTabWords } from "./tools-tab.i18n"

// THE LAW OF A LOOK (733-8b): it never spends money and never writes — no model call on the node's key, no file saved, no agent started.
// Each tool here is the tool itself, unchanged: its action is held by its own props — the voice tools post to the look door
// (`/api/node/tools/look`, a refusal in the page's words), the crop hands its result to a note, the table shows the tab's own list.
const Chat = dynamic(() => import("@/_tools/chat/client/chat.client"), { ssr: false })
const CodeView = dynamic(() => import("@/_tools/code-view/client/code-view.client").then((m) => m.CodeView), { ssr: false })
const ImageCropper = dynamic(() => import("@/_tools/image-crop/client/image-cropper.client").then((m) => m.ImageCropper), { ssr: false })
const FactDraft = dynamic(() => import("@/_tools/fact-draft/client/fact-draft.client").then((m) => m.FactDraft), { ssr: false })
const SocialsAiDialog = dynamic(() => import("@/_tools/socials-ai/client/socials-ai-dialog.client").then((m) => m.SocialsAiDialog), { ssr: false })
const TranslationsDialog = dynamic(() => import("@/_tools/translations-dialog/client/translations-dialog.client").then((m) => m.TranslationsDialog), { ssr: false })
const VideoTrimmer = dynamic(() => import("@/_tools/video-trim/client/video-trimmer.client").then((m) => m.VideoTrimmer), { ssr: false })

export type ToolDemoKit = {
  chatUi: ChatUi; chatSample: ChatMessage[]; codeSample: string; tableUi: TableUi
  looks: ToolLooksWords; translationsUi: TranslationsUi; platformErrors: ComponentProps<typeof TranslationsDialogType>["errors"]; billingUrl: string
}

/** The tools that have a live look here. */
export const LIVE_LOOKS = new Set(["chat", "code-view", "app-dialog", "table-tools", "image-crop", "voice-control", "voice-field", "voice-textarea",
  "fact-draft", "socials-ai", "translations-dialog", "video-trim"])

const SAMPLE_PICTURE = "/images/readme/one-billion-tokens.jpg"
const SAMPLE_VIDEO = "/video/tool-look-sample.mp4"
const cell = "px-4 py-3"

export function ToolLook({ tool, tools, lang, words, ui, kit }: {
  tool: ToolRow
  tools: ToolRow[]
  lang: string
  words: ToolsTabWords
  ui: AppDialogUi
  kit: ToolDemoKit
}) {
  const [text, setText] = useState("")
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState("")
  const needs = tool.needs.filter((n) => n !== "browser")
  const lookDoor = `/api/node/tools/look?lang=${lang}&needs=${needs.join(",")}`
  const title = (t: ToolRow) => (lang === "ru" ? t.ru.title : t.en.title)

  switch (tool.key) {
    case "chat":
      return <Chat messages={kit.chatSample} ui={kit.chatUi} className="max-h-80" />
    case "code-view":
      return <CodeView code={kit.codeSample} filename="example.ts" />
    case "app-dialog":
      return (
        <div data-block="tool-look-dialog" className="flex flex-col gap-2">
          <Button type="button" variant="outline" className="self-start" onClick={() => setOpen(true)} data-look-open>{words.demoSampleOpen}</Button>
          <AppDialog open={open} onOpenChange={setOpen} title={words.demoSampleTitle} ui={ui} size="sm">
            <P>{words.demoSampleBody}</P>
          </AppDialog>
        </div>
      )
    case "table-tools": {
      const head = (
        <tr className="border-b border-border">
          {[words.demoColTool, words.demoColScope, words.demoColVersion].map((h) => (
            <th key={h} scope="col" className="px-4 py-3 align-bottom font-semibold whitespace-nowrap text-foreground">{h}</th>
          ))}
        </tr>
      )
      const rows = tools.map((t) => (
        <tr key={t.key} className="border-b border-border last:border-0 text-muted-foreground">
          <td className={`${cell} font-medium text-foreground`}>{title(t)}</td>
          <td className={cell}>{t.scope === "panel" ? words.scopePanel : words.demoScopeAny}</td>
          <td className={`${cell} font-mono`}>{t.version ? `v${t.version}` : "—"}</td>
        </tr>
      ))
      return (
        <TableTools caption={words.demoTableCaption} columns={3} head={head} rows={rows}
          texts={tools.map((t) => `${title(t)} ${t.key} ${t.version ?? ""}`)} words={kit.tableUi} />
      )
    }
    case "image-crop":
      return (
        <div data-block="tool-look-crop" className="flex flex-col gap-2">
          <Button type="button" variant="outline" className="self-start" onClick={() => { setNote(""); setOpen(true) }} data-look-open>{words.demoCropOpen}</Button>
          {note && <Small data-look-note>{note}</Small>}
          {open && (
            <ImageCropper src={SAMPLE_PICTURE} dialogUi={ui}
              onDone={() => { setOpen(false); setNote(words.demoCropDone) }} onCancel={() => setOpen(false)} />
          )}
        </div>
      )
    case "voice-control":
      return <VoiceControl id="tool-look-voice" variant="textarea" value={text} onChange={setText} lang={lang} placeholder={words.demoVoicePlaceholder} apiUrl={lookDoor} />
    case "voice-field":
      return <VoiceField value={text} onChange={setText} lang={lang} title={words.demoVoiceTitle} hint={words.demoVoiceHint} placeholder={words.demoVoicePlaceholder} apiUrl={lookDoor} />
    case "voice-textarea":
      return <VoiceTextarea value={text} onChange={setText} lang={lang} title={words.demoVoiceTitle} hint={words.demoVoiceHint} placeholder={words.demoVoicePlaceholder} apiUrl={lookDoor} />
    case "fact-draft":
      return (
        <div data-block="tool-look-fact" className="flex flex-col gap-2">
          <FactDraft lang={lang} labels={kit.looks.factDraft} lookDoor={lookDoor} onDraft={() => undefined} />
        </div>
      )
    case "socials-ai":
      return (
        <div data-block="tool-look-socials" className="flex flex-col gap-2">
          <SocialsAiDialog lang={lang} ui={kit.looks.socials} dialogUi={ui} lookDoor={lookDoor} onAdd={() => setNote(words.demoCropDone)} />
          {note && <Small data-look-note>{note}</Small>}
        </div>
      )
    case "translations-dialog":
      return (
        <div data-block="tool-look-translations" className="flex flex-col gap-2">
          <Button type="button" variant="outline" className="self-start" onClick={() => setOpen(true)} data-look-open>{words.demoSampleOpen}</Button>
          <TranslationsDialog open={open} lang={lang} fields={kit.looks.fields} ui={kit.translationsUi} dialogUi={ui} errors={kit.platformErrors}
            billingUrl={kit.billingUrl} lookDoor={lookDoor} onSave={async () => true} onSkip={() => setOpen(false)} />
        </div>
      )
    case "video-trim":
      return (
        <div data-block="tool-look-video" className="flex flex-col gap-2">
          <Button type="button" variant="outline" className="self-start" onClick={() => setOpen(true)} data-look-open>{words.demoSampleOpen}</Button>
          {open && (
            <VideoTrimmer mediaBase="" itemId="sample" name={kit.looks.trimmerName} labels={kit.looks.trimmer} dialogUi={ui}
              sampleSrc={SAMPLE_VIDEO} onClose={() => setOpen(false)} />
          )}
        </div>
      )
    default:
      return null
  }
}

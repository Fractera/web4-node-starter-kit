"use client"
// @local — the node ID on the Passport, one place (core step 862-11): read on the architect's click from the core's door, never printed
// into the prebuilt page (CLAUDE.md §6: the architect's pages ask nothing without a click); one copy button.

import { useState } from "react"
import { Check, Copy, Fingerprint } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { Small } from "@/components/ui/typography"
import type { NodeIdentityWords } from "./node-identity.i18n"

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

type State = { kind: "idle" } | { kind: "loading" } | { kind: "shown"; id: string } | { kind: "failed" }

export function NodeIdentity({ words }: { words: NodeIdentityWords }) {
  const [state, setState] = useState<State>({ kind: "idle" })
  const [copied, setCopied] = useState(false)

  async function show() {
    setState({ kind: "loading" })
    try {
      const r = await fetch(`${BASE}/api/node/identity`, { cache: "no-store" })
      const j = (await r.json()) as { ok?: boolean; id?: string }
      setState(j.ok && j.id ? { kind: "shown", id: j.id } : { kind: "failed" })
    } catch {
      setState({ kind: "failed" })
    }
  }

  async function copy(id: string) {
    try {
      await navigator.clipboard.writeText(id)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <Card data-block="node-identity">
      <CardHeader data-block="node-identity-head">
        <CardTitle className="flex items-center gap-2">
          <Fingerprint className="size-4 text-muted-foreground" aria-hidden />
          {words.title}
        </CardTitle>
        <CardDescription>{words.text}</CardDescription>
      </CardHeader>
      <CardContent data-block="node-identity-body" className="flex flex-wrap items-center gap-3">
        {state.kind === "shown" ? (
          <div data-block="node-identity-value" className="flex items-center gap-1 rounded-md border border-border bg-muted/40 py-1 pr-1 pl-3">
            <code className="font-mono text-sm tabular-nums text-foreground">{state.id}</code>
            <Button type="button" variant="ghost" size="sm" onClick={() => copy(state.id)} aria-label={`${copied ? words.copied : words.copy}: ${state.id}`}>
              {copied ? <Check data-icon="inline-start" /> : <Copy data-icon="inline-start" />}
              {copied ? words.copied : words.copy}
            </Button>
          </div>
        ) : (
          <Button type="button" variant="outline" size="sm" onClick={show} disabled={state.kind === "loading"}>
            {state.kind === "loading" ? <Spinner data-icon="inline-start" /> : <Fingerprint data-icon="inline-start" />}
            {state.kind === "loading" ? words.loading : words.show}
          </Button>
        )}
        {state.kind === "failed" && (
          <Small data-block="node-identity-failed" className="text-destructive">
            {words.failed}
          </Small>
        )}
      </CardContent>
    </Card>
  )
}

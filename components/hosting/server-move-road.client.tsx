"use client"
// @local — the two roads of the tab «Выделенный сервер» (one route): the move of this node or a new independent server, and the new server's copy plan

import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Small } from "@/components/ui/typography"
import type { ServerMoveWords } from "@/components/hosting/server-move.i18n"

// 737-11b. The owner, 2026-11-13: «пользователи однажды устанавливают на свой домашний компьютер Fractera и в будущем поднимает множество
// независящих от него серверов»; D5: «both variant for choose. and if it will clon need second question - replace data or not».
// 🔒 THE ROAD IS THE NODE'S STATE (`move.json` → `road`), chosen through the ladder's door; it may change only until the server is prepared.
// The copy plan is this island's until the person presses the copy rung — then it goes with that press and is kept by the door.

export type Road = "move" | "new"
export type CopyPlan = { variant: "clone" | "fresh"; data: boolean }

export function RoadChoice({ road, open, busy, words, onChoose }: { road: Road; open: boolean; busy: boolean; words: ServerMoveWords["road"]; onChoose: (road: Road) => void }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border p-4" data-block="server-move-road" data-road={road}>
      <p className="font-medium text-foreground text-sm">{words.title}</p>
      {open ? (
        <ButtonGroup>
          <Button disabled={busy} onClick={() => onChoose("move")} size="sm" variant={road === "move" ? "default" : "outline"}>{words.move}</Button>
          <Button disabled={busy} onClick={() => onChoose("new")} size="sm" variant={road === "new" ? "default" : "outline"}>{words.new}</Button>
        </ButtonGroup>
      ) : null}
      <Small className="text-muted-foreground">{road === "new" ? words.newNote : words.moveNote}</Small>
    </div>
  )
}

export function CopyPlanChoice({ plan, busy, words, onChange }: { plan: CopyPlan; busy: boolean; words: ServerMoveWords["plan"]; onChange: (plan: CopyPlan) => void }) {
  return (
    <div className="flex flex-col gap-2" data-block="server-move-copy-plan" data-variant={plan.variant}>
      <ButtonGroup>
        <Button disabled={busy} onClick={() => onChange({ ...plan, variant: "clone" })} size="sm" variant={plan.variant === "clone" ? "default" : "outline"}>{words.clone}</Button>
        <Button disabled={busy} onClick={() => onChange({ variant: "fresh", data: false })} size="sm" variant={plan.variant === "fresh" ? "default" : "outline"}>{words.fresh}</Button>
      </ButtonGroup>
      <Small className="text-muted-foreground">{plan.variant === "fresh" ? words.freshNote : words.cloneNote}</Small>
      {plan.variant === "clone" ? (
        <div className="flex items-start gap-2" data-block="server-move-copy-data">
          <Checkbox checked={plan.data} disabled={busy} id="server-move-copy-data" onCheckedChange={(v) => onChange({ ...plan, data: v === true })} />
          <div className="flex flex-col gap-1" data-block="server-move-copy-data-text">
            <Label htmlFor="server-move-copy-data">{words.data}</Label>
            <Small className="text-muted-foreground">{plan.data ? words.dataYes : words.dataNo}</Small>
          </div>
        </div>
      ) : null}
    </div>
  )
}

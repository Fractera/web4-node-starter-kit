// @part danger-confirm — the destructive confirmation box: what will happen, «Да, …» and «Отмена», in one place
import { Button } from "@/components/ui/button"

// 775: born when the domain page's two sections both needed it (detaching a domain from an element, disconnecting the main domain) —
// the guard `check:parts-dup` saw the same box twice. An irreversible act names its consequence first, and the «yes» is the red one.
export function DangerConfirm({ id, text, yes, cancel, busy, onYes, onCancel }: {
  id: string
  text: string
  yes: string
  cancel: string
  busy: boolean
  onYes: () => void
  onCancel: () => void
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-3" role="alert" data-block={`danger-confirm-${id}`} data-danger-confirm={id}>
      <p className="text-sm text-foreground text-pretty">{text}</p>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="destructive" size="sm" onClick={onYes} disabled={busy} data-danger-confirm-yes={id}>{yes}</Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={busy}>{cancel}</Button>
      </div>
    </div>
  )
}

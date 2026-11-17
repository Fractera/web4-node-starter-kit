"use client"

import { useState } from "react"
import { useNodePlace } from "@/components/node-state/use-node-place.client"
import signIn from "@/lib/auth/sign-in-link.cjs"
import { Check, Plus, X } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { DomainListWords } from "./domain-list.i18n"
import type { DomainLadderWords } from "./domain-ladder.i18n"
import { TokenHowTo } from "./token-how-to.client"
import { keyReasonText } from "./key-reason"

// КОНВЕЙЕР ДОПОЛНИТЕЛЬНОГО ДОМЕНА (324-1). Слово владельца 2026-09-27: «если … у нас есть доступ к API … просто иди и подключай
// этот домен через API если это невозможно то значит создавай нормальный конвейер с пошаговым подключением».
// Устройство лестницы 259: ступень открывается после предыдущей, на месте закрытой — серая строка «откроется после…»,
// у каждого действия виден ответ. 1 — узел создаёт зону сам (нет права у ключа — замена ключа в строке «Ключ узла» над
// списком, 324-1: ключ — свойство узла, а не домена); 2 — серверы имён: назначенные и замеренные у регистратора рядом; 3 — активна (совпали — узел сам просит
// Cloudflare перепроверить). Всё по кнопке.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

/** Имена серверов имён сравниваются без регистра и точки в конце (`NS1.Example.com.` == `ns1.example.com`). */
const nsKey = (s: string) => s.trim().toLowerCase().replace(/\.$/, "")
const sameNs = (a: string, b: string) => nsKey(a) === nsKey(b)

type AddressRecord = { name: string; type: string; content: string }

export type PipelineDomain = {
  name: string; state: string; status?: string; nameServers?: string[]; registrarNs?: string[]; nsMatch?: boolean
  activationAsked?: boolean; checkedAt?: string; registrar?: string | null
}

function Step({ title, done, children }: { title: string; done: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-md border border-border p-3" data-pipe-step={done ? "done" : "open"}>
      <p className="flex items-center gap-1.5 font-medium text-foreground">
        {done && <Check className="size-4" aria-hidden />}
        {title}
      </p>
      {children}
    </div>
  )
}

export function DomainPipeline({ lang, role = "element", domain: d, words: w, ladderWords, onChanged, hasPrimary, forItem, architect = null }: {
  lang: string
  /** 775: the section the domain lives in — the main domain's candidate ends in «Сделать основным», an element's domain in «готов к элементу» */
  role?: "main" | "element"
  /** 775: the node has its architect — only then may a domain become the main one; `null` — the sign-in did not answer */
  architect?: boolean | null
  /** 443-4: элемент, из настроек которого пришли (`?for=`) — ссылка «Главное зеркало» ведёт к нему. */
  forItem?: string | null
  domain: PipelineDomain
  /** 324-2: у узла уже есть основной домен — «Сделать основным» не предлагается. */
  hasPrimary: boolean
  words: DomainListWords
  ladderWords: DomainLadderWords
  onChanged: () => Promise<void>
}) {
  const p = w.pipe
  // 777: the architect's sign-in — the node's one link builder (here, before the main domain, it leads to this computer's sign-in).
  const place = useNodePlace()
  const signInHref = place?.signIn && typeof window !== "undefined"
    ? signIn.architectSignIn(place.signIn, `${window.location.pathname}${window.location.search}`, window.location.origin)
    : null
  const [busy, setBusy] = useState<string | null>(null)
  const [conflicts, setConflicts] = useState<AddressRecord[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [noPermission, setNoPermission] = useState(false)
  const [noKey, setNoKey] = useState(false)
  const [note, setNote] = useState<string | null>(null)
  const [key, setKey] = useState("")
  // 324-2: первый домен — аккаунт Cloudflare узнаётся у ключа; не узнан — запасное поле (слово владельца: «если нажатие
  // вернёт ошибку, то подсунешь вторую кнопку и напишешь попробуй снова»).
  const [needAccount, setNeedAccount] = useState(false)
  const [account, setAccount] = useState("")

  const time = (iso?: string) => iso ? new Date(iso).toLocaleTimeString(lang === "ru" ? "ru-RU" : "en-GB") : ""

  async function call(method: "POST" | "PUT", body: Record<string, string | undefined>, slot: string): Promise<PipelineDomain | null> {
    setBusy(slot)
    setError(null)
    try {
      const r = await fetch(`${BASE}/api/domain/list`, { method, headers: { "content-type": "application/json" }, body: JSON.stringify(body) })
      const j = (await r.json().catch(() => null)) as { ok?: boolean; error?: string; domain?: PipelineDomain } | null
      if (j?.ok && j.domain) { await onChanged(); setBusy(null); return j.domain }
      const code = j?.error ?? String(r.status)
      if (code === "no-zone-permission") { setNoPermission(true); await onChanged() }
      // 775: no key at all — the same key field opens right here, in this domain's own step (no pointer to another section).
      if (code === "no-key") { setNoPermission(true); setNoKey(true) }
      if (code === "no-account" || code === "bad-account-id") setNeedAccount(true)
      setError(w.errors[code] ?? `${w.errors.unknown} ${code}`)
    } catch { setError(w.errors.unknown) }
    setBusy(null)
    return null
  }

  function describe(x: PipelineDomain): string {
    if (x.state === "active") return role === "main" ? p.step3DoneMain : p.step3Done
    if (x.state === "not-visible") return w.state["not-visible"]
    if (x.nsMatch) return x.activationAsked ? p.step3Asked : p.match
    return p.noMatch
  }

  async function check() {
    const x = await call("PUT", { name: d.name }, "check")
    if (x) setNote(p.lastCheck.replace("{time}", time(x.checkedAt)).replace("{what}", describe(x)))
  }

  async function createZone() {
    const x = await call("POST", { name: d.name, action: "create-zone", accountId: needAccount ? account.trim() : undefined }, "zone")
    if (x) { setNoPermission(false); setNoKey(false); setNeedAccount(false); setNote(p.lastCheck.replace("{time}", time(x.checkedAt)).replace("{what}", p.step1Done)) }
  }

  // 324-2: «Сделать основным доменом узла» — прежний шаг 5 лестницы (дверь activate): туннель, записи DNS, вход, адрес сайта.
  // 372: чужие A/AAAA на именах узла дверь не сносит молча — отдаёт список (409 `address-records`); человек видит его и
  // подтверждает удаление второй кнопкой (`removeAddressRecords: true`).
  async function makePrimary(removeAddressRecords: boolean) {
    setBusy("primary")
    setError(null)
    try {
      const r = await fetch(`${BASE}/api/domain/activate`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ hostname: d.name, removeAddressRecords }) })
      const j = (await r.json().catch(() => null)) as { ok?: boolean; reason?: string; records?: AddressRecord[] } | null
      if (j?.ok) { window.location.reload(); return }
      if (j?.reason === "address-records" && j.records?.length) { setConflicts(j.records); setBusy(null); return }
      setError(`${p.makePrimaryFailed} ${j?.reason ?? r.status}`)
    } catch { setError(p.makePrimaryFailed) }
    setBusy(null)
  }

  // Отказ ключа выясняется в момент действия и чинится здесь же: ключ → дверь лестницы → узел повторяет «Создать зону».
  async function saveKeyAndCreate() {
    setBusy("key")
    setError(null)
    try {
      const r = await fetch(`${BASE}/api/domain/key`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token: key.trim() }) })
      const j = (await r.json().catch(() => null)) as { ok?: boolean; reason?: string } | null
      if (!j?.ok) {
        // 372: одна функция перевода причин на все экраны ключа — голого кода (`no-zones`) человек больше не видит.
        const why = j?.reason ? keyReasonText(ladderWords, j.reason) : `${w.key.failed} ${r.status}`
        setError(why); setBusy(null); return
      }
      setKey("")
    } catch { setError(w.key.failed); setBusy(null); return }
    setBusy(null)
    await createZone()
  }

  const zoneReady = d.state === "pending" || d.state === "active"
  const nsReady = zoneReady && (d.state === "active" || !!d.nsMatch)
  // 372: домен активен, основного у узла ещё нет — главное действие шага — «Сделать основным доменом узла».
  const primaryReady = role === "main" && d.state === "active" && !hasPrimary

  return (
    <div className="flex flex-col gap-2" data-domain-pipeline={d.name}>
      <Step title={p.step1} done={zoneReady}>
        {zoneReady ? <p className="text-sm text-muted-foreground">{p.step1Done}</p> : (
          <>
            <p className="text-sm text-foreground">{p.step1Todo}</p>
            <Button type="button" size="sm" className="w-fit" onClick={createZone} disabled={busy !== null} data-pipe-create-zone>
              {busy === "zone" ? p.creating : p.createZone}
            </Button>
            {needAccount && (
              <div className="flex flex-col gap-2 rounded-md border border-warning/50 bg-warning/10 p-3" data-pipe-need-account>
                <p className="text-sm text-foreground">{p.accountHint}</p>
                <Label htmlFor={`pipe-account-${d.name}`}>{p.accountLabel}</Label>
                <div className="flex flex-wrap gap-2">
                  <Input id={`pipe-account-${d.name}`} className="max-w-80 font-mono" value={account} onChange={(e) => setAccount(e.target.value)} placeholder="0123456789abcdef0123456789abcdef" autoComplete="off" spellCheck={false} />
                  <Button type="button" size="sm" onClick={createZone} disabled={!/^[0-9a-fA-F]{32}$/.test(account.trim()) || busy !== null} data-pipe-account-retry>
                    {busy === "zone" ? p.creating : p.accountRetry}
                  </Button>
                </div>
              </div>
            )}
            {noPermission && (
              <div className="flex flex-col gap-2 rounded-md border border-destructive bg-destructive/5 p-3" data-pipe-no-permission>
                <p className="text-sm text-foreground">{noKey ? w.key.none : p.noPermission}</p>
                <TokenHowTo words={ladderWords} />
                    <Label htmlFor={`pipe-key-${d.name}`}>{w.key.label}</Label>
                    <div className="flex flex-wrap gap-2">
                      <Input id={`pipe-key-${d.name}`} type="password" placeholder=" " className="field-pulse max-w-80 font-mono" value={key} onChange={(e) => setKey(e.target.value)} autoComplete="off" spellCheck={false} />
                      <Button type="button" size="sm" onClick={saveKeyAndCreate} disabled={!key.trim() || busy !== null} data-pipe-key-save>
                        {busy === "key" ? w.key.saving : p.keySaveAndCreate}
                      </Button>
                    </div>
              </div>
            )}
          </>
        )}
      </Step>

      <Step title={p.step2} done={nsReady}>
        {!zoneReady ? <p className="text-sm text-muted-foreground">{p.step2Wait}</p> : (
          <>
            {d.state !== "active" && <p className="text-sm text-foreground">{p.step2Text}</p>}
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <p className="text-[length:var(--fs-small)] text-muted-foreground">{p.assigned}</p>
                {/* 372 (владелец 2026-10-02): цвет говорит, что делать со строкой. Нужный сервер, которого ещё нет у
                    регистратора, — оранжевый «+» (добавить); есть — зелёная галочка. Видимый сейчас лишний — красный
                    крестик (убрать). Сравнение без регистра и точки в конце. */}
                <ul className="flex flex-col gap-0.5 font-mono text-sm select-all">
                  {(d.nameServers ?? []).map((n) => {
                    const here = (d.registrarNs ?? []).some((r) => sameNs(r, n))
                    return (
                      <li key={n} className={`flex items-center gap-1.5 ${here ? "text-success" : "text-warning"}`} data-ns-state={here ? "ok" : "add"}>
                        {here ? <Check className="size-4 shrink-0" aria-hidden /> : <Plus className="size-4 shrink-0" aria-hidden />}
                        {n}
                      </li>
                    )
                  })}
                </ul>
              </div>
              <div>
                <p className="text-[length:var(--fs-small)] text-muted-foreground">{p.atRegistrar}</p>
                {d.registrarNs && d.registrarNs.length > 0
                  ? (
                    <ul className="flex flex-col gap-0.5 font-mono text-sm">
                      {d.registrarNs.map((n) => {
                        const wanted = (d.nameServers ?? []).some((a) => sameNs(a, n))
                        return (
                          <li key={n} className={`flex items-center gap-1.5 ${wanted ? "text-success" : "text-destructive"}`} data-ns-state={wanted ? "ok" : "remove"}>
                            {wanted ? <Check className="size-4 shrink-0" aria-hidden /> : <X className="size-4 shrink-0" aria-hidden />}
                            {n}
                          </li>
                        )
                      })}
                    </ul>
                  )
                  : <p className="text-sm text-muted-foreground">{p.nothingYet}</p>}
              </div>
            </div>
            {d.registrar && <p className="text-sm text-foreground" data-pipe-registrar>{p.registrar} <span className="font-medium">{d.registrar}</span></p>}
            <p className="text-sm text-foreground" data-pipe-ns-match={d.nsMatch ? "yes" : "no"}>{d.state === "active" || d.nsMatch ? p.match : p.noMatch}</p>
          </>
        )}
      </Step>

      <Step title={p.step3} done={d.state === "active"}>
        {!nsReady ? <p className="text-sm text-muted-foreground">{p.step3Wait}</p>
          : <p className="text-sm text-foreground">{d.state === "active" ? (role === "main" ? p.step3DoneMain : p.step3Done) : p.step3Asked}</p>}
        {d.state === "active" && role === "element" && forItem && (
          <a className="w-fit text-sm font-medium text-primary underline-offset-4 hover:underline" href={`/${lang}/architect/${forItem}/settings/domain#main-mirror`} data-pipe-open-mirror={forItem}>
            {p.openMirror.replace("{item}", forItem)}
          </a>
        )}
        {/* 775 (✗ 2026-11-17: throughsongs.com went main with no account on the node — sign-up open to the internet): until the node has
            its architect the step shows why it is closed and the one way to fix it — the architect's sign-in (the node's one builder) */}
        {primaryReady && architect !== true && (
          <div className="mt-2 flex flex-col gap-2 rounded-md border border-warning bg-warning/10 p-3" role="alert" data-block="pipe-locked" data-pipe-locked={architect === null ? "no-sign-in" : "no-architect"}>
            <p className="text-sm text-foreground text-pretty">{architect === null ? p.lockedNoSignIn : p.lockedNoArchitect}</p>
            {architect === false && signInHref && <a href={signInHref} className={cn(buttonVariants({ size: "sm" }), "w-fit")} data-pipe-locked-signin>{p.lockedButton}</a>}
          </div>
        )}
        {primaryReady && architect === true && (
          <div className="mt-2 flex flex-col gap-1.5" data-pipe-make-primary>
            <p className="text-sm text-foreground">{p.makePrimaryNote}</p>
            {/* 372 (владелец 2026-10-02): после подтверждённой проверки главное действие — «Сделать основным», на всю ширину;
                «Проверить снова» — ссылкой ниже. */}
            {!conflicts && (
              <Button type="button" size="lg" className="w-full" onClick={() => makePrimary(false)} disabled={busy !== null}>
                {busy === "primary" ? p.makingPrimary : p.makePrimary}
              </Button>
            )}
            {conflicts && (
              <div className="flex flex-col gap-2 rounded-md border border-destructive/50 bg-destructive/5 p-3" data-pipe-conflicts>
                <p className="text-sm text-foreground">{p.conflictsTitle}</p>
                <ul className="flex flex-col gap-0.5 font-mono text-sm text-destructive">
                  {conflicts.map((c) => (
                    <li key={`${c.name}-${c.type}-${c.content}`} className="flex items-center gap-1.5">
                      <X className="size-4 shrink-0" aria-hidden />
                      {c.name} · {c.type} · {c.content}
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-muted-foreground">{p.conflictsNote}</p>
                <Button type="button" size="lg" variant="destructive" className="w-full" onClick={() => makePrimary(true)} disabled={busy !== null} data-pipe-remove-and-connect>
                  {busy === "primary" ? p.makingPrimary : p.removeAndConnect}
                </Button>
              </div>
            )}
          </div>
        )}
      </Step>

      {/* Кнопка на всю ширину (слово владельца: «сделай её больше шире … всю ширину»); до ступени 1 проверять нечего —
          зоны нет, и ключ, который её создаст, ещё не сохранён. Когда главное действие — «Сделать основным», проверка
          уходит в ссылку «Проверить снова» (372). */}
      {primaryReady ? (
        <Button type="button" variant="link" size="sm" className="self-start px-0 underline" onClick={check} disabled={busy !== null} data-pipe-check>
          {busy === "check" ? p.checking : p.checkAgain}
        </Button>
      ) : (
        <Button type="button" size="lg" className="w-full" onClick={check} disabled={!zoneReady || busy !== null} data-pipe-check>
          {busy === "check" ? p.checking : p.check}
        </Button>
      )}
      {!zoneReady && <p className="text-sm text-muted-foreground" data-pipe-check-locked>{p.checkLocked}</p>}
      {note && <p className="text-sm text-foreground" role="status" data-pipe-note>{note}</p>}
      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
    </div>
  )
}

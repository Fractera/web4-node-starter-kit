// @api the element's design tab skills references prototypes and pin
import { spawnSync } from "node:child_process"
import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { NextRequest, NextResponse } from "next/server"

import { requireRoles } from "@/lib/auth/require-roles"
import { idOfAddress } from "@/lib/web4-items/element-address"
import { searchDesignSkills } from "@/lib/main-agent/design-skills.mjs"
import { addRef, addRun, addSkill, readDesign, removeRef, removeSkill, setTest } from "@/lib/main-agent/element-design-store"
import { elementHasSkill, elementPrototypes, prototypeShot } from "@/lib/main-agent/element-prototypes"

// ВКЛАДКА «СТРОИТЕЛЬСТВО → ДИЗАЙН» ЭЛЕМЕНТА (узел, шаг 711). Владелец 2026-11-09: навыки дизайна — живым поиском (своя коллекция,
// база узла в графе, проверенный каталог; списка в коде нет), кандидаты элемента, кандидаты на тест со своими референсами, кнопка
// «Сгенерировать тестовую страницу» и «Закрепить». Выбор лежит в пространстве самого элемента в базе узла
// (`lib/main-agent/element-design-store.ts`); прототипы пишет агент элемента в своей папке, ядро их только читает. Генерацию и
// закрепление делает агент элемента — нажатие человека будит его с заданием прохода дизайна (`Build process, design:`), по одному.
// 🔒 ЗАКРЫТА РОЛЬЮ: архитектор и администратор.
export const dynamic = "force-dynamic"

const ROLES = ["architect", "admin"] as const
const NO_STORE = { "Cache-Control": "no-store" }
const MARK = /^[a-zA-Z0-9][a-zA-Z0-9._:/@-]{0,119}$/
const ORIGINS = new Set(["own", "base", "catalog"])
/** Генерация считается идущей, пока её папки нет, не дольше двух часов. */
const RUN_TTL_MS = 2 * 3600_000

type Wake = (service: string, opts: { text?: string; confirmed?: boolean }) => Promise<Record<string, unknown> & { ok: boolean }>
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: NO_STORE })
const str = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "")

/** Остаток лимита подписки, на которой работает агент элемента (`lib/agent-kit/limits.cjs` пишет его на каждой строке состояния). */
function limitsOf(element: string): { fiveHour: number | null; sevenDay: number | null; own: boolean } {
  const own = existsSync(join(process.cwd(), "data", "services", element, "claude"))
  try {
    const rec = JSON.parse(readFileSync(join(process.cwd(), "data", "node", "limits", own ? `own-${element}.json` : "node.json"), "utf8")) as { fiveHour?: { used?: number } | null; sevenDay?: { used?: number } | null }
    return { fiveHour: rec.fiveHour?.used ?? null, sevenDay: rec.sevenDay?.used ?? null, own }
  } catch {
    return { fiveHour: null, sevenDay: null, own }
  }
}

async function state(element: string) {
  const [design, protos] = [await readDesign(element), elementPrototypes(element)]
  const now = Date.now()
  const pending = design.runs.filter((r) => r.kind === "generate" && now - Date.parse(r.requestedAt) < RUN_TTL_MS && !protos.list.some((p) => p.id === r.prototype))
  const busy = pending.length > 0 || protos.list.some((p) => !p.archived && p.status === "draft")
  return { ok: true, ...design, prototypes: protos.list, supported: protos.supported, pending: pending.map((r) => r.prototype), busy, limits: limitsOf(element) }
}

export async function GET(req: NextRequest) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  const q = req.nextUrl.searchParams
  const element = idOfAddress(q.get("item") ?? "")
  if (!element) return json({ ok: false, error: "unknown element" }, 404)
  const shot = q.get("shot")
  if (shot) {
    const png = prototypeShot(element, shot, q.get("size") === "mobile" ? "mobile" : "desktop")
    return png ? new NextResponse(new Uint8Array(png), { headers: { "Content-Type": "image/png", ...NO_STORE } }) : json({ ok: false }, 404)
  }
  try {
    if (q.has("q")) return json({ ok: true, ...(await searchDesignSkills(process.cwd(), q.get("q") ?? "")) })
    return json(await state(element))
  } catch (e) {
    return json({ ok: false, error: String(e instanceof Error ? e.message : e).slice(0, 300) }, 502)
  }
}

/** Имя прототипа из имени навыка: `design-dna-k9x2`. */
const prototypeId = (name: string) => `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 38) || "prototype"}-${Date.now().toString(36).slice(-4)}`

/** Передать навык элементу (`npm run skills -- hand`): текст задания на установку или причина отказа. */
function hand(mark: string, element: string, scriptsYes: boolean): { task: string } | { reason: string } {
  const r = spawnSync(process.execPath, [join(process.cwd(), "scripts", "skills.mjs"), "hand", mark, "--to", element, ...(scriptsYes ? ["--scripts-yes"] : [])], { cwd: process.cwd(), encoding: "utf8", timeout: 180_000 })
  const out = String(r.stdout ?? "")
  const fail = out.match(/===SKILLS_HAND_FAIL=== (.*)/)
  if (fail || r.status !== 0) return { reason: fail?.[1] ?? `skills hand ended with ${r.status}` }
  return { task: out.split("===SKILLS_HANDED===")[0].trim() }
}

export async function POST(req: NextRequest) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null
  const element = idOfAddress(str(body?.item, 60))
  if (!body || !element) return json({ ok: false, error: "unknown element" }, 404)
  const action = str(body.action, 20)
  const mark = str(body.mark, 120)
  try {
    if (action === "add-skill") {
      const s = (body.skill ?? {}) as Record<string, unknown>
      const m = str(s.mark, 120)
      if (!MARK.test(m) || !ORIGINS.has(str(s.origin, 10))) return json({ ok: false, error: "bad skill" }, 400)
      const n = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null)
      await addSkill(element, { mark: m, name: str(s.name, 80) || m, origin: str(s.origin, 10), source: str(s.source, 120) || null, summary: str(s.summary, 600) || null, licence: str(s.licence, 40) || null, stars: n(s.stars), installs: n(s.installs), scripts: n(s.scripts) ?? 0 })
    } else if (action === "remove-skill" && MARK.test(mark)) {
      await removeSkill(element, mark)
    } else if (action === "set-test" && MARK.test(mark)) {
      await setTest(element, mark, body.test === true)
    } else if (action === "add-ref" && MARK.test(mark)) {
      const url = str(body.url, 500)
      if (!/^(https?:\/\/|\/api\/media\/)/.test(url)) return json({ ok: false, error: "a reference is a link or an uploaded image" }, 400)
      await addRef(element, mark, url, str(body.mediaId, 80) || null, str(body.caption, 300) || null)
    } else if (action === "remove-ref" && typeof body.id === "number") {
      await removeRef(element, body.id)
    } else if (action === "generate" && MARK.test(mark)) {
      return json(await generate(req, element, mark, body.scriptsYes === true, str(body.from, 48) || "home"))
    } else if (action === "pin") {
      return json(await pin(element, str(body.prototype, 48)))
    } else if (action === "build") {
      // 711-8 ✗ found live on qfx9w: a prototype's sections are code — the element's running server shows them only after a build, so the
      // link opened an empty page. The press builds the element (a model-free act of the core, `services:install --only`), detached from
      // the core's process tree; the public pages do not change — a prototype is the architect's page until the pin.
      spawnSync(process.execPath, [join(process.cwd(), "scripts", "spawn-free.mjs"), join("scripts", "services-install.mjs"), "--only", element], { cwd: process.cwd(), timeout: 15_000 })
      return json({ ...(await state(element)), building: true })
    } else {
      return json({ ok: false, error: "unknown action" }, 400)
    }
    return json(await state(element))
  } catch (e) {
    return json({ ok: false, error: String(e instanceof Error ? e.message : e).slice(0, 300) }, 502)
  }
}

const wakeFn = () => (globalThis as { __web4AgentWake?: Wake }).__web4AgentWake

async function generate(req: NextRequest, element: string, mark: string, scriptsYes: boolean, from: string) {
  const now = await state(element)
  if (!now.supported) return { ok: false, reason: "template", error: "this element's template has no design prototypes yet — it needs the custom template v0.3.179 or newer" }
  if (now.busy) return { ok: false, reason: "busy", error: "a prototype of this element is being built — one at a time" }
  const skill = now.skills.find((s) => s.mark === mark && s.test)
  if (!skill) return { ok: false, error: "the skill is not a test candidate of this element" }
  const wake = wakeFn()
  if (typeof wake !== "function") return { ok: false, error: "agent kits are not mounted in this process" }
  // Навык — в папку элемента: базовые навыки узла приходят с шаблоном, свои и каталожные передаёт `skills hand` (его проверки и отпечаток).
  let install = ""
  if (!elementHasSkill(element, skill.name)) {
    if (skill.origin === "base") return { ok: false, reason: "base-missing", error: `${skill.name} is a skill of the node's base that this element's template does not carry` }
    const h = hand(skill.mark, element, scriptsYes)
    if ("reason" in h) return { ok: false, reason: /scripts/.test(h.reason) ? "scripts" : "hand", error: h.reason }
    install = `${h.task}\n\n`
  }
  const id = prototypeId(skill.name)
  const origin = req.nextUrl.origin
  const refs = now.refs.filter((r) => r.mark === mark)
  const refArgs = refs.map((r) => `--ref "${r.url.startsWith("/") ? `${origin}${r.url}` : r.url}"${r.caption ? ` --ref-caption "${r.caption.replace(/"/g, "'")}"` : ""}`).join(" ")
  const text = `Build process, design: generate the design prototype ${id} (node step 711; the person pressed «Generate a test page» in the core's Build → Design tab).
${install}Skill: ${skill.name} (${skill.mark}). Source page: ${from}. References: ${refs.length ? refs.map((r) => `${r.url.startsWith("/") ? `${origin}${r.url}` : r.url}${r.caption ? ` — ${r.caption}` : ""}`).join("; ") : "none"}.
Do, in order (.claude/modes/build-design.md, «A design prototype — the order»): npm run prototype -- new ${id} --skill "${skill.mark}" --from ${from} ${refArgs}
then tokens.json first, DESIGN.md, the page; npm run prototype -- done ${id}; the two screenshots into its shots/; commit. Then answer the core: npm run reply-core "prototype ${id} is ready".`
  const r = await wake(element, { text, confirmed: true })
  if (!r.ok) return { ok: false, reason: String(r.reason ?? "wake"), error: `the element's agent did not start: ${String(r.reason ?? "unknown")}` }
  await addRun(element, id, mark, "generate")
  return { ...(await state(element)), started: id }
}

async function pin(element: string, prototype: string) {
  const now = await state(element)
  const p = now.prototypes.find((x) => x.id === prototype && !x.archived)
  if (!p || p.status !== "ready") return { ok: false, error: "only a ready prototype is pinned" }
  if (now.busy) return { ok: false, reason: "busy", error: "a prototype of this element is being built — pin after it" }
  const wake = wakeFn()
  if (typeof wake !== "function") return { ok: false, error: "agent kits are not mounted in this process" }
  const text = `Build process, design: pin the design prototype ${prototype} (node step 711; the person pressed «Pin» in the core's Build → Design tab).
Do: npm run design:pin -- ${prototype}; remove any section code written only for the prototypes that lost; npm run describe:publish; commit; then «Preview & Deploy». Then answer the core: npm run reply-core "pinned ${prototype}".`
  const r = await wake(element, { text, confirmed: true })
  if (!r.ok) return { ok: false, reason: String(r.reason ?? "wake"), error: `the element's agent did not start: ${String(r.reason ?? "unknown")}` }
  await addRun(element, prototype, p.skill, "pin")
  return { ...(await state(element)), pinning: prototype }
}

import "server-only"
import { execFile } from "node:child_process"
import { readFile, statfs } from "node:fs/promises"
import os from "node:os"

import { listServices } from "@/lib/microservices/registry"
import { addressOf } from "@/lib/web4-items/address-file.mjs"
import power from "@/lib/web4-items/element-power.cjs"
import { tier2Rows, type TestRow } from "@/lib/web4-items/super-node"

// «ЭТОТ КОМПЬЮТЕР» В DASHBOARD (572). Владелец 2026-10-22: «У нас в проекте есть дашборд, покажи в нём технические характеристики
// компьютера … давай продублируем в … дашборд это более очевидно»; поля — «Машина + что ест память (Рекомендую)», супер-узел — «Да, строкой
// сравнения».
// 🔒 ЧИСЛО О МАШИНЕ: страница спрашивает его в браузере у двери `/api/node/machine` (закон 264), сборка его не печатает. Замер — при открытии и
// по кнопке «Обновить»: таймеров нет (2026-09-25).
// 🔒 ИЗМЕРЯЕТСЯ ТОЛЬКО ТО, ЧТО МАШИНА ЗНАЕТ О СЕБЕ (замер 530-3, `machine-facts.ts`, снят из супер-узла в 531 и возвращён сюда): ядра, AES-NI
// (Linux — флаги процессора), память, диск папки узла, время работы. Канал, NVMe и публичные адреса отсюда не меряются — «—», не догадка.
// 🛑 Супер-узел — своя машина (531): строки Tier-2 здесь — сравнение ЭТОГО компьютера с профилем, а не тест супер-узла.

export type MachineFacts = {
  platform: string
  cpus: number
  cpuModel: string
  aes: boolean | null
  ramGb: number
  ramFreeGb: number
  diskTotalGb: number | null
  diskFreeGb: number | null
  uptimeHours: number
  node: string
  measuredAt: string
}

/** Память элемента: его процесс и сторож (pm2), МБ; ядро и прочие жители узла — отдельными строками. */
export type MemoryRow = { id: string; name: string; kind: "core" | "element" | "resident"; mb: number; watchMb: number; status: string }

const gb = (bytes: number) => Math.round((bytes / 1024 ** 3) * 10) / 10
const mb = (bytes: unknown) => (typeof bytes === "number" ? Math.round(bytes / 1048576) : 0)
const IS_WIN = process.platform === "win32"

async function aesFlag(): Promise<boolean | null> {
  if (process.platform !== "linux") return null
  try {
    return /\baes\b/.test(await readFile("/proc/cpuinfo", "utf8"))
  } catch {
    return null
  }
}

export async function machineFacts(): Promise<MachineFacts> {
  const cpus = os.cpus()
  let diskTotalGb: number | null = null
  let diskFreeGb: number | null = null
  try {
    const s = await statfs(process.cwd())
    diskTotalGb = gb(s.blocks * s.bsize)
    diskFreeGb = gb(s.bavail * s.bsize)
  } catch { /* нет statfs — размер диска не измерен */ }
  return {
    platform: `${os.type()} ${os.release()} (${process.arch})`,
    cpus: cpus.length,
    cpuModel: cpus[0]?.model?.trim() ?? "",
    aes: await aesFlag(),
    ramGb: gb(os.totalmem()),
    ramFreeGb: gb(os.freemem()),
    diskTotalGb,
    diskFreeGb,
    uptimeHours: Math.round((os.uptime() / 3600) * 10) / 10,
    node: process.version,
    measuredAt: new Date().toISOString(),
  }
}

type Pm2App = { name?: string; monit?: { memory?: number }; pm2_env?: { status?: string } }

// Асинхронно: ✗ синхронный вызов держит сервер ядра (567-7). На Windows `pm2.cmd` идёт только через оболочку, аргументы — константы.
function pm2List(): Promise<Pm2App[] | null> {
  return new Promise((done) => {
    execFile(IS_WIN ? "pm2.cmd" : "pm2", ["jlist"], { shell: IS_WIN, windowsHide: true, timeout: 20_000, maxBuffer: 32 * 1024 * 1024 }, (err, out) => {
      if (err) return done(null)
      try { done(JSON.parse(String(out)) as Pm2App[]) } catch { done(null) }
    })
  })
}

/** Сколько памяти держит каждый элемент узла и ядро; `null` — pm2 не ответил (не знаю, а не «ноль»). */
export async function elementMemory(): Promise<MemoryRow[] | null> {
  const apps = await pm2List()
  if (!apps) return null
  const byName = new Map(apps.map((a) => [a.name ?? "", a]))
  const used = new Set<string>()
  const take = (name: string) => { const a = byName.get(name); if (a) used.add(name); return a }
  const rows: MemoryRow[] = []
  const core = take("fractera-web4")
  const coreWatch = take("fractera-web4-watch")
  if (core || coreWatch) rows.push({ id: "core", name: "core", kind: "core", mb: mb(core?.monit?.memory), watchMb: mb(coreWatch?.monit?.memory), status: core?.pm2_env?.status ?? "—" })
  for (const s of listServices()) {
    const app = take(`fractera-svc-${s.id}`)
    const watch = take(`fractera-svc-${s.id}-watch`)
    const status = power.offOf(s) ? "off" : app?.pm2_env?.status ?? "not-running"
    rows.push({ id: s.id, name: addressOf(s.id), kind: "element", mb: mb(app?.monit?.memory), watchMb: mb(watch?.monit?.memory), status })
  }
  for (const a of apps) {
    if (!a.name || used.has(a.name)) continue
    rows.push({ id: a.name, name: a.name, kind: "resident", mb: mb(a.monit?.memory), watchMb: 0, status: a.pm2_env?.status ?? "—" })
  }
  return rows
}

/** Три части страницы: машина, память по элементам, этот компьютер против профиля супер-узла Tier-2. */
export async function machineReport(): Promise<{ machine: MachineFacts; memory: MemoryRow[] | null; tier2: TestRow[] }> {
  const [machine, memory] = await Promise.all([machineFacts(), elementMemory()])
  const tier2 = tier2Rows({
    cpus: machine.cpus, cpuModel: machine.cpuModel, aes: machine.aes, ramGb: machine.ramGb, diskTotalGb: machine.diskTotalGb,
    diskFreeGb: machine.diskFreeGb, nvme: null, bandwidthMbps: null, publicIPv4: null, ipv6: null, measuredAt: machine.measuredAt,
  })
  return { machine, memory, tier2 }
}

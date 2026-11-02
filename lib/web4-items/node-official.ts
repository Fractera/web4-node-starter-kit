import "server-only"
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { readWallet } from "@/lib/web4-items/node-wallet"

// ОФИЦИАЛЬНЫЙ АККАУНТ УЗЛА (530-2). Владелец 2026-10-18: «на вкладке паспорт мы добавляем две новые вкладки это официальный аккаунт, и
// главный кошелёк». Метка «Официальный» — документ Lagrix 24, запись 49: заявка от узла с кошельком; не меньше трёх официальных
// источников, уже проверивших человека или организацию, и в каждом — пост с адресом кошелька узла; свой домен — не источник; $100 USDC;
// решает случайная панель из девяти супер-узлов (≥ 8 «да»); процедура начинается, когда десять супер-узлов прошли минимум качества.
//
// 🔒 УЗЕЛ ХРАНИТ ПОДГОТОВЛЕННУЮ ЗАЯВКУ, И ТОЛЬКО: сети ещё нет — заявка никуда не уходит, плата не берётся, голосования нет. Это говорится
// словами на странице, а не прячется за состоянием «подана».
// 🔒 ФАЙЛ ВНЕ GIT (`data/*`): имя и источники человека — сведения о нём, а не код.

export type OfficialDraft = { name: string; knownFor: string; sources: string[]; wallet: string; savedAt: string }

const FILE = join(process.cwd(), "data", "node", "official.json")
const MIN_SOURCES = 3
const MAX_SOURCES = 10

export function readOfficial(): OfficialDraft | null {
  try {
    const d = JSON.parse(readFileSync(FILE, "utf8")) as Partial<OfficialDraft>
    return typeof d.name === "string" && Array.isArray(d.sources) ? (d as OfficialDraft) : null
  } catch {
    return null
  }
}

/** Проверка заявки; отказ называет род: `bad-name`, `bad-known-for`, `bad-sources`, `same-platform`, `no-wallet`. */
export function parseOfficial(body: unknown): { ok: true; value: Omit<OfficialDraft, "wallet" | "savedAt"> } | { ok: false; error: string } {
  const b = (body ?? {}) as { name?: unknown; knownFor?: unknown; sources?: unknown }
  const name = typeof b.name === "string" ? b.name.trim() : ""
  if (name.length < 2 || name.length > 120) return { ok: false, error: "bad-name" }
  const knownFor = typeof b.knownFor === "string" ? b.knownFor.trim() : ""
  if (knownFor.length < 2 || knownFor.length > 300) return { ok: false, error: "bad-known-for" }
  if (!Array.isArray(b.sources)) return { ok: false, error: "bad-sources" }
  const sources = b.sources.map((x) => (typeof x === "string" ? x.trim() : "")).filter(Boolean)
  if (sources.length < MIN_SOURCES || sources.length > MAX_SOURCES) return { ok: false, error: "bad-sources" }
  const hosts = new Set<string>()
  for (const s of sources) {
    let u: URL
    try { u = new URL(s) } catch { return { ok: false, error: "bad-sources" } }
    if (u.protocol !== "https:") return { ok: false, error: "bad-sources" }
    hosts.add(u.hostname.replace(/^www\./, ""))
  }
  // Три источника — три разные площадки (документ 24: «accounts on platforms that have themselves confirmed whose they are»).
  if (hosts.size < MIN_SOURCES) return { ok: false, error: "same-platform" }
  return { ok: true, value: { name, knownFor, sources } }
}

export function saveOfficial(v: Omit<OfficialDraft, "wallet" | "savedAt">): OfficialDraft | "no-wallet" {
  const wallet = readWallet()
  if (!wallet) return "no-wallet"
  const d: OfficialDraft = { ...v, wallet: wallet.address, savedAt: new Date().toISOString() }
  mkdirSync(dirname(FILE), { recursive: true })
  writeFileSync(FILE, `${JSON.stringify(d, null, 2)}\n`)
  return d
}

export function removeOfficial(): void {
  if (existsSync(FILE)) rmSync(FILE)
}

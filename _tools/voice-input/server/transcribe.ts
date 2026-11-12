import { readFileSync } from "node:fs";
import { join } from "node:path";
import { readOpenAiResponse, readOpenAiException, logOpenAiError } from "@/lib/openai-error.cjs";
import { recordOk, recordRefusal } from "@/lib/usage-ledger.cjs";
import { TRANSCRIBE_FALLBACK_MODEL, TRANSCRIBE_MODEL, type TranscribeResult } from "../types/voice-input";

// СЕРВЕРНАЯ ФУНКЦИЯ микросервиса «голосовой ввод» — расшифровка аудио. Живёт РЯДОМ со своим клиентом
// (микросервис: `client/` + `server/` + `types/` в одной папке), а не разбросана по `api/`. Дверь
// `api/transcribe` — тонкая обёртка: проверяет входящего и зовёт эту функцию.
//
// КЛЮЧ — глобальный ключ рабочего пространства (шаг 208): сначала окружение, потом `.env.local` процесса.
// Единственная внешняя зависимость, и она не код, а среда: своего ключа автоматизация не заводит. Нет
// ключа — честный `no-key`, и клиент показывает владельцу свою 10-языковую подсказку, где его добавить.
const OPENAI_URL = "https://api.openai.com/v1/audio/transcriptions";
const MODEL = TRANSCRIBE_MODEL;
const MAX_BYTES = 25 * 1024 * 1024; // предел самого API — отказываем раньше и понятной строкой

function openAiKey(): string {
  if (process.env.OPENAI_API_KEY) return process.env.OPENAI_API_KEY;
  try {
    const raw = readFileSync(join(process.cwd(), ".env.local"), "utf8");
    return (raw.match(/^OPENAI_API_KEY=(.+)$/m) ?? [])[1]?.trim() ?? "";
  } catch {
    return "";
  }
}

/** Язык, на котором владелец диктует: язык страницы по умолчанию — модель не гадает. */
const defaultLanguage = () => (process.env.NEXT_PUBLIC_DEFAULT_LOCALE ?? "en").toLowerCase().slice(0, 2);

/** Расшифровать записанное аудио. Возвращает структурный результат; маппинг в HTTP — забота двери.
 *  617: `language` — язык говорящего, если он известен (голосовое в Telegram — язык человека из `person.json`), иначе язык страницы. */
export async function transcribeAudio(audio: unknown, language?: string): Promise<TranscribeResult> {
  const key = openAiKey();
  if (!key) return { ok: false, status: 400, error: "voice input needs the OpenAI key", reason: "no-key" };
  if (!(audio instanceof File) || audio.size === 0) return { ok: false, status: 400, error: "no audio was recorded" };
  if (audio.size > MAX_BYTES) return { ok: false, status: 413, error: "the recording is too long — record it in shorter pieces" };

  const lang = language && /^[a-z]{2}$/.test(language) ? language : defaultLanguage();
  // The owner, 2026-11-12: «if this model will not available use gpt-transcribe». The main model is a snapshot OpenAI marks
  // Deprecated; when OpenAI no longer knows it, the same recording goes once to the fallback, and the ledger names the model that ran.
  const first = await callModel(key, audio, lang, MODEL);
  if (first.ok || !first.modelGone) return first.result;
  return (await callModel(key, audio, lang, TRANSCRIBE_FALLBACK_MODEL)).result;
}

type Attempt = { ok: boolean; modelGone: boolean; result: TranscribeResult };

/** OpenAI no longer knows the model: its own «not found», the code `model_not_found`, or a refused request that names the model. */
export function isModelGone(info: { reason?: string; code?: string; message?: string }): boolean {
  return info.reason === "not-found" || info.code === "model_not_found" || (info.reason === "bad-request" && /model/i.test(info.message ?? ""));
}

async function callModel(key: string, audio: File, language: string, model: string): Promise<Attempt> {
  const upstream = new FormData();
  upstream.append("file", audio, audio.name || "speech.webm");
  upstream.append("model", model);
  upstream.append("language", language);

  // 726-0: the refusal is read by the node's ONE reader of OpenAI's errors (`lib/openai-error.cjs`, the list from OpenAI's guide) —
  // «no money», «a spend limit», «the key» and «slow down» ask the person for different actions; OpenAI's own words go to the log.
  // 726-1: and every call writes one line of the node's ledger (`npm run money`) — never the audio, never the text.
  const call = { who: "voice-input", endpoint: "audio/transcriptions", model, started: Date.now() };
  let r: Response;
  try {
    r = await fetch(OPENAI_URL, { method: "POST", headers: { Authorization: `Bearer ${key}` }, body: upstream, signal: AbortSignal.timeout(120_000) });
  } catch (e) {
    const info = readOpenAiException(e);
    logOpenAiError("voice-input", info);
    recordRefusal({ ...call, info });
    return { ok: false, modelGone: false, result: { ok: false, status: 502, error: `transcription failed (${info.reason})`, reason: info.reason, link: info.link } };
  }
  if (!r.ok) {
    const info = await readOpenAiResponse(r);
    logOpenAiError("voice-input", info);
    recordRefusal({ ...call, info });
    return { ok: false, modelGone: isModelGone(info), result: { ok: false, status: 502, error: `transcription failed (${r.status})`, reason: info.reason, link: info.link } };
  }
  const d = (await r.json()) as { text?: string; usage?: unknown };
  recordOk({ ...call, status: r.status, usage: d.usage });
  return { ok: true, modelGone: false, result: { ok: true, text: (d.text ?? "").trim() } };
}

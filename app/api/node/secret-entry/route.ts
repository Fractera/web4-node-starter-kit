// @api the Telegram form where the person types an element's key
import { NextRequest, NextResponse } from "next/server"

import asks from "@/lib/node/person-asks.cjs"
import asksTg from "@/lib/node/person-asks-telegram.cjs"
import webapp from "@/lib/node/telegram-webapp.cjs"
import { closeAsk, saveEnvSecret, type Ask } from "@/lib/node/person-secret-save"
import { elementName } from "@/lib/web4-items/dashboard-rows"

// КЛЮЧ, ВВЕДЁННЫЙ В TELEGRAM (узел, шаг 768-4). Владелец, 2026-11-16: «если я говорю в Telegram ты мне показываешь возможность ввести
// пароль в Telegram»; «активацию сервера ограничим формы через браузер». Просьба элемента о ключе приходит в Telegram с кнопкой web_app;
// Telegram открывает ЭТУ дверь над чатом (GET — маленькая форма со скрытым полем), форма шлёт ключ сюда же (POST) — мимо чата, мимо
// обновлений бота и мимо агента. Дальше та же дорога, что у окна пульта (`lib/node/person-secret-save.ts`).
// 🔒 Дверь публичная (её открывает телефон по HTTPS-адресу узла — своему домену или временному), поэтому два замка, оба обязательны:
// подпись Telegram (`initData` из хэша страницы, HMAC токеном бота того, кто спросил; человек — из его разрешённых чатов; не старше часа)
// и одноразовый токен в адресе кнопки (в просьбе хранится только его sha256; умирает с закрытием просьбы или через сутки).
// Пароль сервера сюда не приходит никогда: он вводится только в окне на компьютере.
export const dynamic = "force-dynamic"

const ROOT = process.cwd()
const TOKEN = /^[A-Za-z0-9_-]{16,64}$/
const HEADERS = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow", "Referrer-Policy": "no-referrer" }

const WORDS = {
  en: {
    title: "A key for the node", label: "Key {name}", lead: "{who} asks for it. The key goes straight to your node, not through the chat.",
    save: "Save", saving: "Saving…", show: "Show", hide: "Hide", saved: "Saved{tail}. The form closes now.",
    gone: "This form is no longer valid: the request is closed or a day has passed. Ask the agent to send it again.",
    errors: { forged: "Telegram's signature did not match. Open the form from the bot's message again.", stale: "The form was opened too long ago. Open it again from the bot's message.", "not-allowed": "This Telegram account is not allowed for this bot.", "no-data": "Open this form from the button in Telegram.", space: "A key has no spaces.", quote: "A key has no quotes.", "line-break": "A key is one line.", "not-ascii": "A key has only Latin letters, digits and signs.", empty: "Type the key.", "not-written": "The node could not write the key. Try again in the panel's window on the computer." } as Record<string, string>,
    failed: "Not saved: {reason}",
  },
  ru: {
    title: "Ключ для узла", label: "Ключ {name}", lead: "Его просит {who}. Ключ уйдёт прямо в ваш узел, мимо чата.",
    save: "Сохранить", saving: "Сохраняю…", show: "Показать", hide: "Скрыть", saved: "Сохранено{tail}. Форма сейчас закроется.",
    gone: "Эта форма больше не действует: просьба закрыта или прошли сутки. Попросите агента прислать её заново.",
    errors: { forged: "Подпись Telegram не совпала. Откройте форму заново из сообщения бота.", stale: "Форма открыта слишком давно. Откройте её заново из сообщения бота.", "not-allowed": "Этот аккаунт Telegram не допущен к этому боту.", "no-data": "Откройте эту форму кнопкой в Telegram.", space: "В ключе не бывает пробелов.", quote: "В ключе не бывает кавычек.", "line-break": "Ключ — одна строка.", "not-ascii": "В ключе только латинские буквы, цифры и знаки.", empty: "Введите ключ.", "not-written": "Узел не смог записать ключ. Попробуйте в окне пульта на компьютере." } as Record<string, string>,
    failed: "Не сохранено: {reason}",
  },
}
type Words = (typeof WORDS)["en"]

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
const langOf = (req: NextRequest): "en" | "ru" => (req.nextUrl.searchParams.get("lang") === "ru" ? "ru" : "en")

/** The page: plain HTML, one masked field, no telegram.org script — the launch data and the theme come in the hash. */
function page(w: Words, ask: Ask | null, token: string, lang: string): string {
  const body = ask
    ? `<h1>${esc(w.title)}</h1>
<p class="lead">${esc(w.lead.replace("{who}", ask.by ? elementName(ask.by, lang === "ru" ? "ru" : "en") : ""))}</p>
<label for="k">${esc(w.label.replace("{name}", ask.secret?.name ?? ""))}</label>
<div class="row"><input id="k" type="password" autocomplete="off" spellcheck="false" autocapitalize="off" autofocus><button type="button" id="eye" class="ghost">${esc(w.show)}</button></div>
<p id="err" class="err" role="alert"></p>
<button type="button" id="save" disabled>${esc(w.save)}</button>
<p id="ok" class="ok" role="status"></p>`
    : `<h1>${esc(w.title)}</h1><p class="err">${esc(w.gone)}</p>`
  const cfg = JSON.stringify({ t: token, w: { save: w.save, saving: w.saving, show: w.show, hide: w.hide, saved: w.saved, failed: w.failed, errors: w.errors } }).replace(/</g, "\\u003c")
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>${esc(w.title)}</title>
<style>
:root{color-scheme:light dark;--bg:#fff;--fg:#111;--hint:#6b7280;--btn:#2481cc;--btnfg:#fff;--field:#f3f4f6}
@media (prefers-color-scheme:dark){:root{--bg:#17212b;--fg:#f5f5f5;--hint:#8b9aa7;--field:#242f3d}}
*{box-sizing:border-box}body{margin:0;padding:20px 16px;font:16px/1.45 system-ui,-apple-system,sans-serif;background:var(--bg);color:var(--fg)}
h1{font-size:20px;margin:0 0 8px}.lead{color:var(--hint);margin:0 0 16px}label{display:block;font-size:14px;margin:0 0 6px}
.row{display:flex;gap:8px}input{flex:1;min-width:0;font:inherit;padding:12px;border-radius:10px;border:1px solid transparent;background:var(--field);color:var(--fg)}
button{font:inherit;font-weight:600;padding:12px 16px;border:0;border-radius:10px;background:var(--btn);color:var(--btnfg);width:100%;margin-top:16px}
button:disabled{opacity:.5}.ghost{width:auto;margin:0;background:var(--field);color:var(--fg);font-weight:500}
.err{color:#e5484d;min-height:1.2em;margin:8px 0 0}.ok{color:#30a46c;margin:12px 0 0}
</style></head><body data-block="secret-entry">${body}
<script>
(function(){
var C=${cfg};var h=new URLSearchParams(location.hash.slice(1));var init=h.get('tgWebAppData')||'';
function post(t,d){try{if(window.TelegramWebviewProxy)return window.TelegramWebviewProxy.postEvent(t,JSON.stringify(d||{}));if(window.external&&'notify'in window.external)return window.external.notify(JSON.stringify({eventType:t,eventData:d||{}}));window.parent.postMessage(JSON.stringify({eventType:t,eventData:d||{}}),'*')}catch(e){}}
try{var th=JSON.parse(h.get('tgWebAppThemeParams')||'{}');var r=document.documentElement.style;if(th.bg_color)r.setProperty('--bg',th.bg_color);if(th.text_color)r.setProperty('--fg',th.text_color);if(th.hint_color)r.setProperty('--hint',th.hint_color);if(th.button_color)r.setProperty('--btn',th.button_color);if(th.button_text_color)r.setProperty('--btnfg',th.button_text_color);if(th.secondary_bg_color)r.setProperty('--field',th.secondary_bg_color)}catch(e){}
post('web_app_ready');post('web_app_expand');
var k=document.getElementById('k');if(!k)return;var s=document.getElementById('save'),e=document.getElementById('err'),o=document.getElementById('ok'),eye=document.getElementById('eye');
k.addEventListener('input',function(){s.disabled=!k.value.trim();e.textContent=''});
eye.addEventListener('click',function(){var v=k.type==='password';k.type=v?'text':'password';eye.textContent=v?C.w.hide:C.w.show});
k.addEventListener('keydown',function(ev){if(ev.key==='Enter'&&!s.disabled)s.click()});
s.addEventListener('click',function(){
  s.disabled=true;s.textContent=C.w.saving;e.textContent='';
  fetch(location.pathname,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({t:C.t,initData:init,secret:k.value})})
  .then(function(r){return r.json().catch(function(){return{ok:false,reason:String(r.status)}})})
  .then(function(d){
    if(d&&d.ok){k.value='';k.disabled=true;eye.disabled=true;s.style.display='none';o.textContent=C.w.saved.replace('{tail}',d.tail?' (…'+d.tail+')':'');setTimeout(function(){post('web_app_close')},1800);return}
    var why=d&&d.reason||'?';e.textContent=C.w.errors[why]||C.w.failed.replace('{reason}',why);s.disabled=!k.value.trim();s.textContent=C.w.save})
  .catch(function(x){e.textContent=C.w.failed.replace('{reason}',String(x&&x.message||x));s.disabled=false;s.textContent=C.w.save})
})})();
</script></body></html>`
}

export async function GET(req: NextRequest) {
  const lang = langOf(req)
  const token = req.nextUrl.searchParams.get("t") ?? ""
  const ask = TOKEN.test(token) ? (asks.byToken(ROOT, token) as Ask | null) : null
  return new NextResponse(page(WORDS[lang], ask, ask ? token : "", lang), { status: ask ? 200 : 410, headers: { ...HEADERS, "Content-Type": "text/html; charset=utf-8" } })
}

export async function POST(req: NextRequest) {
  const no = (reason: string, status: number) => NextResponse.json({ ok: false, reason }, { status, headers: HEADERS })
  if (!(req.headers.get("content-type") ?? "").toLowerCase().startsWith("application/json")) return no("json-only", 415)
  const body = (await req.json().catch(() => null)) as { t?: unknown; initData?: unknown; secret?: unknown } | null
  const token = typeof body?.t === "string" && TOKEN.test(body.t) ? body.t : ""
  const ask = token ? (asks.byToken(ROOT, token) as Ask | null) : null
  if (!ask) return no("gone", 410)
  // the bot the button came from (the asker's own, or the main agent's for an element without one)
  const bot = (ask.tg?.via ? asksTg.bot(ROOT, ask.tg.via) : null) ?? asksTg.botFor(ROOT, ask.by ?? "build")
  if (!bot) return no("no-bot", 409)
  const signed = webapp.check(typeof body?.initData === "string" ? body.initData : "", bot.token, { allow: bot.chats })
  if (!signed.ok) {
    console.log(`[node/secret-entry] ${ask.id}: refused — ${signed.reason}`)
    return no(signed.reason ?? "refused", 401)
  }
  const r = saveEnvSecret(ask, body?.secret)
  if (!r.ok) return no(r.reason, r.status)
  await closeAsk(ask.id, { saved: r.saved, via: "telegram" })
  return NextResponse.json({ ok: true, tail: r.saved.tail }, { headers: HEADERS })
}

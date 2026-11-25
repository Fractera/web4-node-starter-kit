'use strict'
// A NATIVE ELEMENT'S MINI APP — THE PAGE ITS BOT'S MENU BUTTON OPENS (node step 853; Roma 2026-11-24 through the fractera.ai server's agent,
// approved 1296: «Mini App без раздела проектов — только просмотр расхода токенов, «Перейти на сайт» и «Перейти в чат»»). Drawn by the
// core, the same family as the Pult (lib/node/tg-app/page.cjs): plain HTML and a little JavaScript, Telegram's theme, no session — every
// call carries the launch data signed by THIS element's bot. Intent — the person between other things: how much of the agent's fuel is
// gone, and a way to the element's site or back to its chat. Focal — the context window's percent; under it the account's two limits.
// Words from the node — textContent only.

const WORDS = {
  en: { title: 'Mini App', loading: 'Loading…', ctx: 'Context window', ctxNone: 'No turn yet — the window fills with the first one', fiveHour: 'Current session', sevenDay: 'This week', resets: 'resets {t}', noLimits: 'The account\'s limits appear after the agent\'s first turn', modes: { coding: 'working', waiting: 'waiting', sleeping: 'asleep' }, own: 'its own subscription', node: 'the node\'s subscription', quiz: 'Product quiz · {p}% · level {l}', site: 'Go to the site', noSite: 'No site of its own on the node\'s domain yet', chat: 'Go to the chat', chatHint: 'The Mini App closes, the agent hears you came from here', failed: 'Not loaded: {reason}', errors: { forged: 'The launch is not this bot\'s', stale: 'The launch is old — reopen the Mini App', 'not-allowed': 'This bot has not admitted you', 'not-native': 'This element has its own Mini App', 'no-bot': 'This element has no bot yet — it is made on its «Telegram bot» page', 'no-data': 'Open it from the element\'s bot in Telegram' } },
  ru: { title: 'Мини-приложение', loading: 'Загрузка…', ctx: 'Окно контекста', ctxNone: 'Хода ещё не было — окно заполнится с первым', fiveHour: 'Текущая сессия', sevenDay: 'Неделя', resets: 'сброс {t}', noLimits: 'Лимиты аккаунта появятся после первого хода агента', modes: { coding: 'работает', waiting: 'ждёт', sleeping: 'спит' }, own: 'своя подписка', node: 'подписка узла', quiz: 'Продуктовый квиз · {p}% · уровень {l}', site: 'Перейти на сайт', noSite: 'Своего сайта на домене узла пока нет', chat: 'Перейти в чат', chatHint: 'Мини-приложение закроется, агент узнает, что вы пришли отсюда', failed: 'Не загрузилось: {reason}', errors: { forged: 'Запуск не от этого бота', stale: 'Запуск устарел — откройте мини-приложение заново', 'not-allowed': 'Этот бот вас не допустил', 'not-native': 'У этого элемента своё мини-приложение', 'no-bot': 'У этого элемента ещё нет бота — он создаётся на его странице «Telegram-бот»', 'no-data': 'Откройте его из бота элемента в Telegram' } },
}

/** The words of the chat line the bot writes when the person goes back to the chat (`came-from` hears the same section). */
const CHAT_LINE = { en: '📍 You came from the Mini App. Write — I answer.', ru: '📍 Вы пришли из мини-приложения. Пишите — отвечу.' }

function html(lang, id) {
  const w = WORDS[lang] ?? WORDS.en
  const cfg = JSON.stringify({ w, id }).replace(/</g, '\\u003c')
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex,nofollow"><title>${w.title}</title>
<style>
:root{color-scheme:light dark;--bg:#efeff4;--fg:#000;--hint:#8e8e93;--btn:#2481cc;--btnfg:#fff;--card:#fff;--link:#2481cc;--warn:#e5484d;--line:rgba(0,0,0,.08)}
@media (prefers-color-scheme:dark){:root{--bg:#0f1720;--fg:#f5f5f5;--hint:#7d8b99;--card:#1c2733;--line:rgba(255,255,255,.07)}}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}html{-webkit-font-smoothing:antialiased}
body{margin:0;padding:14px 14px 40px;font:15px/1.4 system-ui,-apple-system,"SF Pro Text",Roboto,sans-serif;background:var(--bg);color:var(--fg)}
h1{font-size:22px;line-height:1.2;font-weight:700;letter-spacing:-.02em;margin:2px 4px}.sub{margin:2px 4px 14px;color:var(--hint);font-size:13px}
.card{background:var(--card);border-radius:14px;padding:14px;margin-bottom:12px}.k{font-size:12px;color:var(--hint)}
.big{font-size:34px;font-weight:700;letter-spacing:-.02em;font-variant-numeric:tabular-nums;line-height:1.1;margin:2px 0 8px}
.bar{height:6px;border-radius:3px;background:var(--line);overflow:hidden}.bar i{display:block;height:100%;background:var(--btn)}.bar.hot i{background:var(--warn)}
.two{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:14px;padding-top:12px;border-top:1px solid var(--line)}
.v{font-size:22px;font-weight:700;font-variant-numeric:tabular-nums;margin:2px 0 6px}.r{font-size:11px;color:var(--hint);margin-top:4px}
.note{font-size:13px;color:var(--hint);margin-top:12px}
.b{display:block;width:100%;height:48px;border:0;border-radius:12px;font:600 16px/48px system-ui,-apple-system,sans-serif;margin-bottom:8px}
.b.main{background:var(--btn);color:var(--btnfg)}.b.alt{background:var(--card);color:var(--link)}.b:disabled{opacity:.45}
.hint{font-size:12px;color:var(--hint);text-align:center;margin:0 8px 14px}
</style></head><body data-block="tg-element-app">
<h1 id="t" data-block="tg-element-title"></h1><div class="sub" id="s" data-block="tg-element-sub"></div><div id="m" data-block="tg-element-main"></div>
<script>
(function(){
var C=${cfg},W=C.w;var h=new URLSearchParams(location.hash.slice(1));var init=h.get('tgWebAppData')||'';var lang=document.documentElement.lang||'en';
function post(t,d){try{if(window.TelegramWebviewProxy)return window.TelegramWebviewProxy.postEvent(t,JSON.stringify(d||{}));if(window.external&&'notify'in window.external)return window.external.notify(JSON.stringify({eventType:t,eventData:d||{}}));window.parent.postMessage(JSON.stringify({eventType:t,eventData:d||{}}),'*')}catch(e){}}
try{var th=JSON.parse(h.get('tgWebAppThemeParams')||'{}'),r=document.documentElement.style,m={secondary_bg_color:'--bg',text_color:'--fg',hint_color:'--hint',button_color:'--btn',button_text_color:'--btnfg',section_bg_color:'--card',link_color:'--link',destructive_text_color:'--warn'};for(var k in m)if(th[k])r.setProperty(m[k],th[k]);if(!th.section_bg_color&&th.bg_color)r.setProperty('--card',th.bg_color)}catch(e){}
post('web_app_ready');post('web_app_expand');
function el(tag,cls,text){var x=document.createElement(tag);if(cls)x.className=cls;if(text!=null)x.textContent=text;return x}
function bar(p){var b=el('div','bar'+(p>=90?' hot':''));var i=el('i');i.style.width=Math.max(0,Math.min(100,p))+'%';b.appendChild(i);return b}
function tm(iso){try{return new Date(iso).toLocaleString(lang,{hour:'2-digit',minute:'2-digit',day:'2-digit',month:'2-digit'})}catch(e){return iso}}
function call(body){return fetch(location.pathname+'?lang='+lang+'&el='+encodeURIComponent(C.id),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.assign({initData:init},body))}).then(function(r){return r.json().catch(function(){return{ok:false,reason:String(r.status)}})}).catch(function(e){return{ok:false,reason:String(e&&e.message||e)}})}
var M=document.getElementById('m');M.appendChild(el('div','sub',W.loading));
call({action:'state'}).then(function(res){
  M.textContent='';if(!res.ok){M.appendChild(el('div','card',W.errors[res.reason]||W.failed.replace('{reason}',res.reason||'?')));return}
  var a=res.app,g=a.agent;document.getElementById('t').textContent=a.name;
  var sub=[W.modes[g.mode]||g.mode];if(g.model)sub.push(g.model+(g.effort?' · '+g.effort:''));if(g.account)sub.push(W[g.account]||g.account);document.getElementById('s').textContent=sub.join(' · ');
  var c=el('div','card');c.setAttribute('data-block','tg-element-fuel');c.appendChild(el('div','k',W.ctx));
  if(a.context){c.appendChild(el('div','big',a.context.percent+'%'));c.appendChild(bar(a.context.percent))}else c.appendChild(el('div','note',W.ctxNone));
  var l=a.limits;if(l&&(l.fiveHour||l.sevenDay)){var two=el('div','two');[['fiveHour',W.fiveHour],['sevenDay',W.sevenDay]].forEach(function(p){var x=l[p[0]],box=el('div');box.appendChild(el('div','k',p[1]));if(x){box.appendChild(el('div','v',x.used+'%'));box.appendChild(bar(x.used));if(x.resetsAt)box.appendChild(el('div','r',W.resets.replace('{t}',tm(x.resetsAt))))}else box.appendChild(el('div','v','—'));two.appendChild(box)});c.appendChild(two)}else c.appendChild(el('div','note',W.noLimits));
  M.appendChild(c);
  if(a.quiz&&a.quiz.href){var q=el('button','b alt',W.quiz.replace('{p}',a.quiz.percent).replace('{l}',a.quiz.level));q.type='button';q.setAttribute('data-block','tg-element-quiz');q.onclick=function(){post('web_app_open_link',{url:a.quiz.href})};M.appendChild(q)}
  var s=el('button','b alt',W.site);s.type='button';s.setAttribute('data-block','tg-element-site');if(a.site)s.onclick=function(){post('web_app_open_link',{url:a.site})};else s.disabled=true;M.appendChild(s);
  if(!a.site)M.appendChild(el('div','hint',W.noSite));
  var b=el('button','b main',W.chat);b.type='button';b.setAttribute('data-block','tg-element-chat');b.onclick=function(){b.disabled=true;var done=false,go=function(){if(!done){done=true;post('web_app_close')}};setTimeout(go,2000);call({action:'chat'}).then(go,go)};M.appendChild(b);
  M.appendChild(el('div','hint',W.chatHint));
});
})();
</script></body></html>`
}

module.exports = { html, WORDS, CHAT_LINE }

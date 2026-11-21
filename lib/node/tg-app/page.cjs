'use strict'
// «ПУЛЬТ УЗЛА» — THE PAGE TELEGRAM OPENS (node step 771-2; redesigned 2026-11-17 by the skill interface-design after the owner: «возможно
// всё-таки нужно было использовать навык? Вот и идея правильная дизайн не хватает … при нажатии … красные подтверждение но отменить его
// никак нельзя»). Plain HTML and a little JavaScript, no React bundle and no session: Telegram opens it over the chat from the main bot's
// menu button; the launch data and the theme come in the page's hash; every call to the door carries the signed launch data (771-1).
// Design: Intent — the architect on the phone, between other things: «does anything wait for me, is anything broken, how much fuel is
// left» — glance and act. Feel — Telegram-native and calm: inset grouped lists like Telegram's own settings, its theme colours, one
// accent. Focal — «Ждёт вас», ringed by the accent; nothing waits — one quiet line. Signature — the subscription's FUEL gauge under the
// title (the node runs its agents on lent fuel). Elements — rows that open on a tap: the step, the last turn and the switch live inside,
// and turning off asks once with «Отмена» beside it. Built-in elements fold under «Показать все». Words from the node — textContent only.
// 2026-11-17 (the owner): under the title — the main agent's model, effort, account and state; inside every element — its agent (coding ·
// waiting · asleep), account, model and effort, and «Telegram-бот агента»: active when the element has its own bot, grey but present when not.
const WORDS = require('./words.cjs')
const { SOURCE: CONTEXT_COLOR_SOURCE } = require('./context-color.cjs')

function html(lang) {
  // 788-2: the gauge's colour — context-color.cjs's SOURCE text (never `.toString()`: the build minifies it, 14:08), so page and test cannot drift.
  const CONTEXT_COLOR = CONTEXT_COLOR_SOURCE
  // 779: the Ultracode warning — the same text as the bot's (lib/agent-kit/ultracode-warning.cjs)
  const w = { ...(WORDS[lang] ?? WORDS.en), ultraWarn: require('../../agent-kit/ultracode-warning.cjs').warning(lang) }
  const cfg = JSON.stringify({ w }).replace(/</g, '\\u003c')
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex,nofollow"><title>${w.title}</title>
<style>
:root{color-scheme:light dark;--bg:#efeff4;--fg:#000;--hint:#8e8e93;--btn:#2481cc;--btnfg:#fff;--card:#fff;--link:#2481cc;--warn:#e5484d;--ok:#30a46c;--line:rgba(0,0,0,.08)}
@media (prefers-color-scheme:dark){:root{--bg:#0f1720;--fg:#f5f5f5;--hint:#7d8b99;--card:#1c2733;--line:rgba(255,255,255,.07)}}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}html{-webkit-font-smoothing:antialiased}
body{margin:0;padding:14px 14px 40px;font:15px/1.4 system-ui,-apple-system,"SF Pro Text",Roboto,sans-serif;background:var(--bg);color:var(--fg)}
.top{display:flex;align-items:center;justify-content:space-between;margin:2px 4px 2px}h1{font-size:22px;line-height:1.2;font-weight:700;letter-spacing:-.02em;margin:0}
.ic{width:36px;height:36px;border-radius:18px;border:0;background:var(--card);color:var(--link);font-size:18px;line-height:36px;padding:0}
.sub{margin:2px 4px 12px;color:var(--hint);font-size:13px}.live{display:inline-block;width:7px;height:7px;border-radius:50%;background:var(--ok);margin-right:6px;vertical-align:1px}
.ctx{background:var(--card);border-radius:14px;padding:12px 14px;margin-bottom:10px}.ctx .k{font-size:12px;color:var(--hint)}.ctx .v{font-size:28px;font-weight:700;letter-spacing:-.02em;font-variant-numeric:tabular-nums;line-height:1.15}.ctx .r{font-size:12px;color:var(--hint);font-variant-numeric:tabular-nums}.ctx .bar{height:8px;border-radius:4px;background:var(--line);overflow:hidden;margin:8px 0 6px}.ctx .bar i{display:block;height:100%;border-radius:4px}
.fuel{background:var(--card);border-radius:14px;padding:12px 14px;display:grid;grid-template-columns:1fr 1fr;gap:14px}
.fuel .k{font-size:12px;color:var(--hint)}.fuel .v{font-size:24px;font-weight:700;letter-spacing:-.02em;font-variant-numeric:tabular-nums;line-height:1.15}
.fuel .r{font-size:11px;color:var(--hint);margin-top:2px}.fuel.stale .v,.fuel.stale .bar{opacity:.35}.fuel .acc{grid-column:1/-1;font-size:12px;color:var(--hint);overflow-wrap:anywhere}.fuel .note{grid-column:1/-1;font-size:12px;color:var(--warn)}
.fuel.out{background:var(--warn);color:#fff;grid-template-columns:1fr;gap:6px;padding:16px}.fuel.out .acc{color:rgba(255,255,255,.85)}.fuel.out .big{font-size:28px;font-weight:800;letter-spacing:-.02em;line-height:1.1}.fuel.out .why{font-size:14px;font-weight:600}.fuel.out .cd{font-size:22px;font-weight:700;font-variant-numeric:tabular-nums}
.st.building{color:var(--btnfg);background:var(--warn)}.st.queued{color:var(--warn)}
.builds{background:var(--card);border-radius:14px;padding:11px 14px;margin-top:10px;box-shadow:inset 3px 0 0 var(--warn);font-size:14px}.bar{height:4px;border-radius:2px;background:var(--line);overflow:hidden;margin-top:6px}
.bar i{display:block;height:100%;background:var(--btn);border-radius:2px}.bar i.hot{background:var(--warn)}
h2{font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:var(--hint);margin:22px 16px 7px}
.group{background:var(--card);border-radius:14px;overflow:hidden}
.ask{background:var(--card);border-radius:14px;padding:13px 14px;margin-bottom:8px;box-shadow:inset 3px 0 0 var(--btn)}
.ask .t{font-weight:600;text-wrap:pretty}.ask .s{color:var(--hint);font-size:13px;margin-top:4px;text-wrap:pretty}
.calm{background:var(--card);border-radius:14px;padding:13px 14px;color:var(--hint)}
.row{display:flex;align-items:center;gap:12px;padding:11px 14px;position:relative;cursor:pointer}
.row+.row::before,.detail+.row::before{content:"";position:absolute;left:34px;right:0;top:0;height:1px;background:var(--line)}
.dot{flex:none;width:8px;height:8px;border-radius:50%;background:var(--hint)}.dot.on{background:var(--ok)}.dot.run{background:var(--btn);box-shadow:0 0 0 3px color-mix(in srgb,var(--btn) 25%,transparent)}
.mid{flex:1;min-width:0}.nm{font-weight:600}.ln{color:var(--hint);font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.chev{color:var(--hint);font-size:18px;transition:transform .18s cubic-bezier(.23,1,.32,1)}.open .chev{transform:rotate(90deg)}
.detail{padding:0 14px 12px 34px;font-size:13px}.detail .k{color:var(--hint);margin-top:6px}.detail .x{text-wrap:pretty}
.acts{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap}
.oc-head{padding:2px 0 10px}.oc-name{font-size:17px;font-weight:600;letter-spacing:-.01em}.oc-desc{font-size:15px;color:var(--fg);margin-top:0;text-wrap:pretty;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}.oc-desc.none{font-style:italic}
.oc-two{display:grid;grid-template-columns:1fr 1fr;gap:8px}.oc-two button.b{min-height:44px;width:100%;font-size:15px;font-weight:600;background:var(--btn);color:var(--btnfg)}.oc-two button.b.off{background:var(--bg);color:var(--hint)}
.oc-why{font-size:12px;color:var(--hint);margin-top:6px;text-wrap:pretty}.oc-kv{margin-top:12px;background:var(--bg);border-radius:12px;overflow:hidden}.oc-row{display:flex;justify-content:space-between;align-items:center;gap:12px;min-height:40px;padding:8px 12px;font-size:14px}.oc-row+.oc-row{border-top:1px solid var(--line)}.oc-row .k{color:var(--hint);flex:none}.oc-row .v{text-align:right;min-width:0;text-wrap:pretty;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.open-card{padding:4px 14px 14px 34px}.oc-foot{margin-top:14px;justify-content:flex-end}

button.b{font:inherit;font-size:14px;font-weight:600;padding:9px 14px;border:0;border-radius:10px;background:var(--btn);color:var(--btnfg)}
button.b:active{transform:scale(.97)}button.b:disabled{opacity:.5}button.soft{background:var(--bg);color:var(--link)}button.red{background:var(--warn);color:#fff}
.field{display:flex;gap:8px;margin-top:10px}.field input{flex:1;min-width:0;font:inherit;font-size:16px;padding:9px 11px;border-radius:10px;border:0;background:var(--bg);color:var(--fg)}
pre{white-space:pre-wrap;word-break:break-all;font-size:12px;background:var(--bg);border-radius:8px;padding:8px;margin:8px 0 0}
.more{display:block;width:100%;text-align:left;font:inherit;font-size:15px;color:var(--link);background:none;border:0;padding:11px 14px;position:relative}
.more::before{content:"";position:absolute;left:14px;right:0;top:0;height:1px;background:var(--line)}
.agent{background:var(--card);border-radius:14px;padding:11px 14px;margin-top:10px;display:flex;align-items:center;gap:10px}.agent .nm{font-size:13px;color:var(--hint);font-weight:500}.agent .v{font-weight:600}
.abox{background:var(--card);border-radius:14px;margin-top:10px;overflow:hidden}.abox .agent{margin-top:0;cursor:pointer}.abox.open .chev{transform:rotate(90deg)}
.pick{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:2px 14px 14px}.lst{display:flex;flex-direction:column;gap:4px;min-width:0}.lst .k{font-size:12px;color:var(--hint);margin:0 2px 2px}
.opt{font:inherit;font-size:14px;text-align:left;padding:9px 11px;border-radius:10px;border:1px solid transparent;background:var(--bg);color:var(--fg);position:relative}
.opt.on{border-color:var(--btn);color:var(--btn);font-weight:600}.opt:disabled{opacity:.45}.opt:active{transform:scale(.97)}
.opt.ultra{border-color:var(--btn)}.opt.ultra::after{content:"";position:absolute;inset:-3px;border-radius:12px;pointer-events:none;box-shadow:0 0 12px 2px color-mix(in srgb,var(--btn) 55%,transparent);opacity:.35;animation:glow 2.4s cubic-bezier(.77,0,.175,1) infinite}
@keyframes glow{50%{opacity:1}}.pick .wide{grid-column:1/-1}
.abox .chan{padding:2px 14px 14px}.abox .chan .acts{margin-top:8px}.chan.bad .note{color:var(--warn);font-weight:600}.pick .note{grid-column:1/-1;font-size:13px;color:var(--hint);text-wrap:pretty}
@media (prefers-reduced-motion:reduce){.opt.ultra::after{animation:none;opacity:.7}}
.st{display:inline-block;font-size:12px;font-weight:600;border-radius:8px;padding:1px 7px;background:var(--bg);color:var(--hint)}.st.coding{color:var(--btnfg);background:var(--btn)}.st.waiting{color:var(--ok)}
button.b.off{background:var(--bg);color:var(--hint)}
.err{color:var(--warn);font-size:13px;margin-top:6px}.okl{color:var(--ok);font-size:13px;margin-top:6px}
@media (prefers-reduced-motion:reduce){.chev{transition:none}}
</style></head><body data-block="tg-app">
<div class="top" data-block="tg-app-header"><h1 id="title">${w.title}</h1><button class="ic" id="refresh" aria-label="${w.refresh}">↻</button></div>
<div class="sub" id="where" data-block="tg-app-where"></div><div class="sub" id="meta">${w.loading}</div><div id="err" class="err" role="alert"></div><main id="main" data-block="tg-app-main"></main>
<script>
(function(){
var W=${cfg}.w;var h=new URLSearchParams(location.hash.slice(1));var init=h.get('tgWebAppData')||'';var lang=document.documentElement.lang||'en';var openId=null,showNative=false;
function post(t,d){try{if(window.TelegramWebviewProxy)return window.TelegramWebviewProxy.postEvent(t,JSON.stringify(d||{}));if(window.external&&'notify'in window.external)return window.external.notify(JSON.stringify({eventType:t,eventData:d||{}}));window.parent.postMessage(JSON.stringify({eventType:t,eventData:d||{}}),'*')}catch(e){}}
function tap(){post('web_app_trigger_haptic_feedback',{type:'impact',impact_style:'light'})}
try{var th=JSON.parse(h.get('tgWebAppThemeParams')||'{}'),r=document.documentElement.style,m={secondary_bg_color:'--bg',text_color:'--fg',hint_color:'--hint',button_color:'--btn',button_text_color:'--btnfg',section_bg_color:'--card',link_color:'--link',destructive_text_color:'--warn'};for(var k in m)if(th[k])r.setProperty(m[k],th[k]);if(!th.section_bg_color&&th.bg_color)r.setProperty('--card',th.bg_color)}catch(e){}
post('web_app_ready');post('web_app_expand');
function el(tag,cls,text){var x=document.createElement(tag);if(cls)x.className=cls;if(text!=null)x.textContent=text;return x}
function btn(cls,text,fn){var b=el('button','b '+(cls||''),text);b.type='button';b.onclick=function(ev){ev.stopPropagation();fn(b)};return b}
function tm(iso){try{return new Date(iso).toLocaleString(lang,{hour:'2-digit',minute:'2-digit',day:'2-digit',month:'2-digit'})}catch(e){return iso}}
function hm(iso){try{return new Date(iso).toLocaleTimeString(lang,{hour:'2-digit',minute:'2-digit'})}catch(e){return iso}}
function why(r){return W.errors[r]||W.failed.replace('{reason}',r||'?')}
function call(body){return fetch(location.pathname+'?lang='+lang,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.assign({initData:init},body))}).then(function(r){return r.json().catch(function(){return{ok:false,reason:String(r.status)}})}).catch(function(e){return{ok:false,reason:String(e&&e.message||e)}})}
var tick=null;
function left(ms,week){var s=Math.max(0,Math.floor(ms/1000)),d=Math.floor(s/86400),h=Math.floor(s%86400/3600),m=Math.floor(s%3600/60),x=s%60,p=function(n){return(n<10?'0':'')+n};
  return week?d+' '+W.dd+' '+p(h)+' '+W.hh+' '+p(m)+' '+W.mm+' '+p(x)+' '+W.ss:(h?h+' '+W.hh+' ':'')+p(m)+' '+W.mm+' '+p(x)+' '+W.ss}
// 2026-11-17 (the owner: «в случае окончания лимита подкрашивалось в алый цвет … крупным исчерпан лимит … сброс через … обратного отсчёта …
// карточка на этот момент теряет текущие индикаторы»): the account logged in now has used up a window — the card turns crimson, the gauges
// give way to the window and a live countdown to its reset (the weekly one first: it is the longer wait); at zero the panel asks again.
function outOf(l){var foreign=l.account&&l.current&&l.account!==l.current;if(foreign)return null;var now=Date.now();
  var full=function(x){return x&&x.used>=100&&x.resetsAt&&Date.parse(x.resetsAt)>now?x:null};var w=full(l.sevenDay);if(w)return{week:true,at:Date.parse(w.resetsAt)};var f=full(l.fiveHour);return f?{week:false,at:Date.parse(f.resetsAt)}:null}
function outCard(l,o){var c=el('div','fuel out');c.setAttribute('data-block','tg-app-fuel');c.setAttribute('data-fuel-out',o.week?'week':'five');
  c.appendChild(el('div','acc',l.current||l.account||W.unknown));c.appendChild(el('div','big',W.limitOut));c.appendChild(el('div','why',o.week?W.weekOut:W.fiveOut));
  var cd=el('div','cd',left(o.at-Date.now(),o.week));c.appendChild(cd);
  tick=setInterval(function(){var ms=o.at-Date.now();if(ms<=0){clearInterval(tick);tick=null;cd.textContent=W.refilled;setTimeout(load,3000);return}cd.textContent=left(ms,o.week)},1000);
  return c}
// 788-2 (the owner, 2026-11-18): «третий индикатор … выше … расход контекстного окна … краснеть … максимально красный … 75% … дальше тёмно
// бордовым … общий контекстный окно модели 1 000 000 токенов. И процент заполнения». The colour — the one function of context-color.cjs.
${CONTEXT_COLOR}
function num(n){var t=String(n),o='';while(t.length>3){o='\u00a0'+t.slice(-3)+o;t=t.slice(0,-3)}return t+o}
function ctxCard(c){var box=el('div','ctx');box.setAttribute('data-block','tg-app-context');
  box.appendChild(el('div','k',W.ctxTitle+(c&&c.window?' · '+W.ctxWindow.replace('{window}',num(c.window)):'')));
  if(!c){box.appendChild(el('div','r',W.ctxNone));return box}
  if(c.percent==null){box.appendChild(el('div','v',num(c.used)));box.appendChild(el('div','r',W.ctxUnknown.replace('{model}',c.model)));return box}
  var col=contextColor(c.percent);box.setAttribute('data-context-percent',String(c.percent));var v=el('div','v',c.percent+' %');v.style.color=col;box.appendChild(v);
  var bar=el('div','bar'),i=el('i');i.style.width=Math.min(100,c.percent)+'%';i.style.background=col;bar.appendChild(i);box.appendChild(bar);
  box.appendChild(el('div','r',W.ctxUsed.replace('{used}',num(c.used)).replace('{window}',num(c.window))));return box}
function fuel(lims){
  if(tick){clearInterval(tick);tick=null}
  var l=lims.filter(function(x){return x.who==='node'})[0]||lims[0];if(!l)return null;var o=outOf(l);if(o)return outCard(l,o);var c=el('div','fuel'+(l.stale?' stale':''));c.setAttribute('data-block','tg-app-fuel');c.setAttribute('data-fuel-stale',l.stale?'yes':'no');
  c.appendChild(el('div','acc',(l.current||l.account||W.unknown)+(l.at?' · '+W.measured.replace('{time}',tm(l.at)):'')));if(l.stale)c.appendChild(el('div','note',W.stale));
  [['fiveHour',W.fiveHour],['sevenDay',W.sevenDay]].forEach(function(p){var x=l[p[0]],box=el('div');box.appendChild(el('div','k',p[1]));
    if(!x){box.appendChild(el('div','v','—'));c.appendChild(box);return}
    box.appendChild(el('div','v',x.used+' %'));var bar=el('div','bar'),i=el('i',x.used>=85?'hot':null);i.style.width=Math.min(100,x.used)+'%';bar.appendChild(i);box.appendChild(bar);
    if(x.resetsAt)box.appendChild(el('div','r',W.resets.replace('{time}',tm(x.resetsAt))));c.appendChild(box)});
  return c}
function askCard(a){
  var c=el('div','ask');c.setAttribute('data-block','tg-app-ask');c.appendChild(el('div','t',a.text));
  if(a.byName)c.appendChild(el('div','s',W.from.replace('{name}',a.byName)));if(a.why)c.appendChild(el('div','s',W.why+': '+a.why));if(a.hint)c.appendChild(el('div','s',W.hint+': '+a.hint));
  if(a.copy){c.appendChild(el('pre',null,a.copy));var acts0=el('div','acts');acts0.appendChild(btn('soft',W.copy,function(b){try{navigator.clipboard.writeText(a.copy);b.textContent=W.copied}catch(e){}}));c.appendChild(acts0)}
  var msg=el('div');
  // 781-5: the request's button does the act, then the request closes (it wakes the agent)
  if(a.action==='autostart'){var aa=el('div','acts');aa.appendChild(btn('',W.autoOn,function(b){tap();b.disabled=true;b.textContent=W.chanWorking;call({action:'autostart'}).then(function(d){if(d&&d.ok)return call({action:'done',id:a.id}).then(function(){b.textContent=W.autoDone;setTimeout(load,1500)});b.disabled=false;b.textContent=W.autoOn;msg.className='err';msg.textContent=why(d&&d.reason)})}));c.appendChild(aa);c.appendChild(msg);return c}
  if(a.secret&&a.secret.kind==='server-root'){c.appendChild(el('div','s',W.rootOnly.replace('{host}',a.secret.host||'')));return c}
  if(a.secret&&a.secret.kind==='element-admin')return adminAsk(c,a,msg);
  if(a.secret){var f=el('div','field'),inp=el('input');inp.type='password';inp.autocomplete='off';inp.spellcheck=false;inp.setAttribute('autocapitalize','off');
    inp.placeholder=a.secret.kind==='openai'?W.openaiLabel:W.keyLabel.replace('{name}',a.secret.name||'');f.appendChild(inp);
    f.appendChild(btn('soft',W.show,function(b){var v=inp.type==='password';inp.type=v?'text':'password';b.textContent=v?W.hide:W.show}));c.appendChild(f);
    var acts=el('div','acts');acts.appendChild(btn('',W.save,function(b){if(!inp.value.trim())return;tap();b.disabled=true;b.textContent=W.saving;msg.className='';msg.textContent='';
      call({action:'secret',id:a.id,secret:inp.value}).then(function(d){if(d&&d.ok){inp.value='';f.remove();acts.remove();msg.className='okl';msg.textContent=W.saved.replace('{tail}',d.tail?' (…'+d.tail+')':'');setTimeout(load,1500)}else{msg.className='err';msg.textContent=why(d&&d.reason);b.disabled=false;b.textContent=W.save}})}));
    c.appendChild(acts);c.appendChild(msg);return c}
  var acts2=el('div','acts');acts2.appendChild(btn('',W.done,function(b){tap();b.disabled=true;call({action:'done',id:a.id}).then(function(d){if(d&&d.ok){acts2.remove();msg.className='okl';msg.textContent=W.doneOk;setTimeout(load,1500)}else{msg.className='err';msg.textContent=why(d&&d.reason);b.disabled=false}})}));
  c.appendChild(acts2);c.appendChild(msg);return c}
// 778-3: a newborn element's admin — e-mail, password and «Пропустить»; the values go straight to the node's sign-in (the door → auth)
function adminAsk(c,a,msg){
  var m=el('input');m.type='email';m.autocomplete='off';m.spellcheck=false;m.setAttribute('autocapitalize','off');m.placeholder=W.emailLabel;
  var f0=el('div','field');f0.appendChild(m);c.appendChild(f0);
  var f=el('div','field'),k=el('input');k.type='password';k.autocomplete='new-password';k.spellcheck=false;k.setAttribute('autocapitalize','off');k.placeholder=W.passwordLabel;f.appendChild(k);
  f.appendChild(btn('soft',W.show,function(b){var v=k.type==='password';k.type=v?'text':'password';b.textContent=v?W.hide:W.show}));c.appendChild(f);
  c.appendChild(el('div','s',W.adminNote));
  var acts=el('div','acts');
  var send=function(body,b,label){tap();b.disabled=true;b.textContent=W.saving;msg.className='';msg.textContent='';
    call(Object.assign({action:'secret',id:a.id},body)).then(function(d){if(d&&d.ok){k.value='';f0.remove();f.remove();acts.remove();msg.className='okl';msg.textContent=d.admin==='skipped'?W.adminSkipped:d.admin==='created'?W.adminCreated:W.adminAdded;setTimeout(load,1500)}
      else{msg.className='err';msg.textContent=why(d&&d.reason);b.disabled=false;b.textContent=label}})};
  acts.appendChild(btn('',W.save,function(b){if(!m.value.trim())return;send({admin:{email:m.value.trim(),password:k.value}},b,W.save)}));
  acts.appendChild(btn('soft',W.skip,function(b){send({skip:true},b,W.skip)}));
  c.appendChild(acts);c.appendChild(msg);return c}
function modeTag(a){var t=el('span','st '+a.mode,W[a.mode]);t.setAttribute('data-agent-mode',a.mode);return t}
function modelLine(a){var m=a.model?a.model.charAt(0).toUpperCase()+a.model.slice(1):W.modelDefault;return m+(a.effort?' · '+W.effort.replace('{e}',a.effort):'')+(a.ultracode?' · Ultracode':'')}
function accLine(a){return a.account==='node'?W.accNode:a.account==='own'?W.accOwn:W.unknown}
// 779 (the owner, 2026-11-17, Telegram 462: «при нажатии на эту карточку она раскрывается вниз и там два выпадающих списка левый список
// модели правый список усилий … ультраКод … выдели её сияющей обводкой … информационное окно»): the card folds open into two own lists;
// Ultracode glows and asks in Telegram's own popup (an inline window outside Telegram or before 6.2); the switch waits for the turn's end.
var pickOpen=false,pick=null,switched=null,target=null,popupCb=null;
function onTg(t,d){if(t==='popup_closed'&&popupCb){var cb=popupCb;popupCb=null;cb(d&&d.button_id)}}
window.Telegram=window.Telegram||{};window.Telegram.WebView=window.Telegram.WebView||{};window.Telegram.WebView.receiveEvent=onTg;window.TelegramGameProxy={receiveEvent:onTg};window.TelegramGameProxy_receiveEvent=onTg;
window.addEventListener('message',function(ev){try{var m=typeof ev.data==='string'?JSON.parse(ev.data):null;if(m&&m.eventType)onTg(m.eventType,m.eventData)}catch(e){}});
function popupOk(){var v=(h.get('tgWebAppVersion')||'0').split('.').map(Number);return !!init&&(v[0]>6||(v[0]===6&&(v[1]||0)>=2))}
function mainAgent(a,busy){if(target&&a.model===target.model&&a.effort===target.effort&&!!a.ultracode===!!target.ultracode||target&&Date.now()-target.at>600000){switched=null;target=null}
  var box=el('div','abox'+(pickOpen?' open':''));box.setAttribute('data-block','tg-app-main-agent');var c=el('div','agent');c.setAttribute('role','button');c.setAttribute('aria-expanded',pickOpen?'true':'false');
  var mid=el('div','mid');mid.appendChild(el('div','nm',W.mainAgent));mid.appendChild(el('div','v',modelLine(a)));mid.appendChild(el('div','ln',switched||a.email||accLine(a)));c.appendChild(mid);c.appendChild(modeTag(a));c.appendChild(el('span','chev','›'));
  c.onclick=function(){tap();pickOpen=!pickOpen;pick=pickOpen?{model:a.ultracode?'ultracode':(a.model||'opus'),effort:a.ultracode?'max':(a.effort||'high')}:null;render(last)};box.appendChild(c);
  var cr=busy?null:chanRow(a);if(cr)box.appendChild(cr);var ar=autoRow(a);if(ar)box.appendChild(ar);
  if(pickOpen&&pick)box.appendChild(picker(a));return box}
// 781-4 (the owner, 2026-11-18: «в пульте телеграмма … сейчас бот спит. Разбудить бота нужно это сделать?»): asleep → «Разбудить»; the bot
// deaf, reconnecting or failed twice → the red line and «Переподключить» / «Разбудить». Works while the plugin is down: the Pult talks to the node.
// 781-5: the node does not start with the computer — said under the agent, with the one button that fixes it.
function autoRow(a){if(a.autostart!==false)return null;var box=el('div','wide chan bad');box.setAttribute('data-block','tg-app-autostart');box.appendChild(el('div','note',W.autoOff));var row=el('div','acts');
  row.appendChild(btn('red',W.autoOn,function(b){tap();b.disabled=true;b.textContent=W.chanWorking;call({action:'autostart'}).then(function(d){if(d&&d.ok){b.textContent=W.autoDone;setTimeout(load,1500);return}b.disabled=false;b.textContent=W.autoOn;box.appendChild(el('div','err',why(d&&d.reason)))})}));box.appendChild(row);return box}
function chanRow(a){var c=a.channel;if(!c||!c.bot)return null;var st=c.state,asleep=a.mode==='sleeping'&&st!=='failed';if(st==='hears'&&!asleep)return null;
  var bad=st==='deaf'||st==='healing'||st==='failed',wake=asleep||st==='failed';var box=el('div','wide chan'+(bad?' bad':''));box.setAttribute('data-block','tg-app-main-channel');box.setAttribute('data-channel-state',asleep?'asleep':st);
  box.appendChild(el('div','note',asleep?W.chanAsleep:st==='failed'?W.chanFailed:st==='healing'?W.chanHealing:W.chanDeaf));var row=el('div','acts');
  row.appendChild(btn(bad?'red':'',wake?W.chanWake:W.chanReconnect,function(b){tap();b.disabled=true;b.textContent=W.chanWorking;call({action:'channel',do:wake?'wake':'reconnect'}).then(function(d){if(d&&d.ok){b.textContent=W.chanDone;setTimeout(load,8000);return}
    b.disabled=false;b.textContent=wake?W.chanWake:W.chanReconnect;box.appendChild(el('div','err',why(d&&d.reason)))})}));box.appendChild(row);return box}
function picker(a){var g=el('div','pick');g.setAttribute('data-block','tg-app-model-pick');var cur=a.ultracode?'ultracode':(a.model||'opus'),curE=a.ultracode?'max':(a.effort||'');
  var ml=el('div','lst');ml.appendChild(el('div','k',W.modelPick));
  [['opus','Opus'],['sonnet','Sonnet'],['haiku','Haiku'],['ultracode','Ultracode']].forEach(function(o){var b=el('button','opt'+(pick.model===o[0]?' on':'')+(o[0]==='ultracode'?' ultra':''),o[1]);b.type='button';b.setAttribute('data-model',o[0]);
    b.onclick=function(ev){ev.stopPropagation();tap();if(o[0]==='ultracode')return cur==='ultracode'?null:askUltra(g);pick={model:o[0],effort:o[0]==='opus'?(pick.effort&&pick.model==='opus'?pick.effort:(a.model==='opus'&&!a.ultracode&&a.effort)||'high'):'medium'};render(last)};ml.appendChild(b)});
  var el2=el('div','lst');el2.appendChild(el('div','k',W.effortPick));var fixed=pick.model!=='opus';
  ['low','medium','high','xhigh','max'].forEach(function(e){var b=el('button','opt'+(pick.effort===e?' on':''),e);b.type='button';b.setAttribute('data-effort',e);b.disabled=fixed;
    b.onclick=function(ev){ev.stopPropagation();tap();pick.effort=e;render(last)};el2.appendChild(b)});
  g.appendChild(ml);g.appendChild(el2);
  if(fixed)g.appendChild(el('div','note',W.effortFixed.replace('{e}',pick.model==='ultracode'?'max':'medium')));
  var differs=pick.model!==cur||(pick.model==='opus'&&pick.effort!==curE);
  if(differs&&pick.model!=='ultracode'){var row=el('div','acts wide');row.appendChild(btn('',W.switchTo,function(b){doSwitch(b,{model:pick.model,effort:pick.effort})}));g.appendChild(row)}
  var msg=el('div','wide');msg.setAttribute('id','pick-msg');g.appendChild(msg);return g}
function doSwitch(b,body){tap();if(b){b.disabled=true;b.textContent=W.switching}var m=document.getElementById('pick-msg');if(m){m.className='wide';m.textContent=''}
  call(Object.assign({action:'model'},body)).then(function(d){if(d&&d.ok){var name=(d.ultracode?'Opus · max · Ultracode':d.model.charAt(0).toUpperCase()+d.model.slice(1)+' · '+W.effort.replace('{e}',d.effort));switched=W.willSwitch.replace('{m}',name);target={model:d.model,effort:d.effort,ultracode:!!d.ultracode,at:Date.now()};pickOpen=false;pick=null;render(last);setTimeout(load,20000);return}
    var x=document.getElementById('pick-msg');if(x){x.className='wide err';x.textContent=why(d&&d.reason)}if(b){b.disabled=false;b.textContent=W.switchTo}})}
function askUltra(g){var go=function(){doSwitch(null,{model:'opus',ultracode:true,confirmed:true})};
  if(popupOk()){popupCb=function(id){if(id==='ultra')go()};post('web_app_open_popup',{title:'Ultracode',message:W.ultraWarn,buttons:[{id:'cancel',type:'cancel'},{id:'ultra',type:'destructive',text:W.ultraOn}]});return}
  var w=document.getElementById('ultra-ask');if(w)return;w=el('div','wide');w.id='ultra-ask';w.setAttribute('data-block','tg-app-ultra-ask');w.appendChild(el('div','note',W.ultraWarn));
  var two=el('div','acts');two.appendChild(btn('soft',W.cancel,function(){w.remove()}));two.appendChild(btn('red',W.ultraOn,function(){w.remove();go()}));w.appendChild(two);g.appendChild(w)}
function botBtn(a){var b=btn(a.bot?'soft':'off',W.bot+(a.bot?' · @'+a.bot:''),function(){if(!a.bot)return;tap();post('web_app_open_tg_link',{path_full:'/'+a.bot})});b.setAttribute('data-agent-bot',a.bot?'yes':'no');
  if(!a.bot){b.disabled=true;b.setAttribute('aria-label',W.bot+' — '+W.noBot)}return b}
function buildTag(e){if(!e.build)return null;var t=el('span','st '+e.build,W[e.build]);t.setAttribute('data-element-build',e.build);return t}
function updating(u){if(!u||!u.running)return null;var c=el('div','builds');c.setAttribute('data-block','tg-app-node-update');var t=u.since?new Date(u.since):null;
  c.appendChild(el('div','v',W.updating.replace('{stage}',u.stage?W.updStage.replace('{s}',u.stage):'').replace('{time}',t&&!isNaN(t)?t.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}):'—')));return c}
function builds(b,els){if(!b||!b.running)return null;var c=el('div','builds');c.setAttribute('data-block','tg-app-builds');var n=b.queue.length;
  c.appendChild(el('div','v',W.builds.replace('{done}',String(Math.min(n,b.done.length))).replace('{n}',String(n))));
  if(b.current){var x=els.filter(function(e){return e.id===b.current})[0];c.appendChild(el('div','ln',W.buildingNow.replace('{name}',x?x.name:b.current)))}return c}
function turnLine(t){if(!t)return null;var k=t.event==='turn-end'?W.turnEnd:t.event==='turn-error'?W.turnError:t.event==='turn-start'?W.turnStart:null;return k?k.replace('{time}',tm(t.at))+(t.last?' — '+t.last:''):null}
function elRows(list,group){
  list.forEach(function(e){
    var row=el('div','row'+(openId===e.id?' open':''));row.setAttribute('data-block','tg-app-element');row.setAttribute('role','button');
    row.appendChild(el('span','dot'+(e.live?' run':e.on?' on':'')));var mid=el('div','mid');var nm=el('div','nm',e.name);var bt=buildTag(e);if(bt){nm.appendChild(document.createTextNode(' '));nm.appendChild(bt)}mid.appendChild(nm);
    mid.appendChild(el('div','ln',e.live?W.live:!e.on?W.off+(e.offReason?' — '+e.offReason:''):(e.step||turnLine(e.turn)||W.on)));row.appendChild(mid);row.appendChild(el('span','chev','›'));
    row.onclick=function(){tap();openId=openId===e.id?null:e.id;render(last)};group.appendChild(row);
    if(openId!==e.id)return;
    // 787 (the owner, 2026-11-18: «при раскрытии показать его название и описание … кнопка сайт элемента и кнопка Bot элемента … каждая
    // открытая карточка это дикий ужас»): the head says what it is, two big actions in the thumb zone, then facts as Telegram's own
    // settings rows (label left, value right, one line), the on/off apart at the bottom. The step is not repeated — the row shows it.
    var d=el('div','detail open-card');d.setAttribute('data-block','tg-app-element-detail');
    var head=el('div','oc-head');head.appendChild(el('div','oc-desc'+(e.description?'':' none'),e.description||W.noDescription2));d.appendChild(head);
    var two=el('div','oc-two');two.setAttribute('data-block','tg-app-element-links');
    var site=btn(e.site?'':'off',W.site,function(){if(!e.site)return;tap();post('web_app_open_link',{url:e.site})});site.setAttribute('data-element-site',e.site?'yes':'no');if(!e.site)site.disabled=true;
    var bot=btn(e.botLink?'':'off',W.botShort,function(){if(!e.agent.bot)return;tap();post('web_app_open_tg_link',{path_full:'/'+e.agent.bot})});bot.setAttribute('data-agent-bot',e.agent.bot?'yes':'no');if(!e.agent.bot)bot.disabled=true;
    two.appendChild(site);two.appendChild(bot);d.appendChild(two);
    var whyNot=[];if(!e.site)whyNot.push(W.noSite);if(!e.agent.bot)whyNot.push(W.noBotYet);if(whyNot.length)d.appendChild(el('div','oc-why',whyNot.join(' ')));
    var kv=el('div','oc-kv');var row=function(k,v){var r=el('div','oc-row');r.appendChild(el('span','k',k));if(typeof v==='string')r.appendChild(el('span','v',v));else{var w=el('span','v');w.appendChild(v);r.appendChild(w)}kv.appendChild(r)};
    row(W.agent,modeTag(e.agent));row(W.model,modelLine(e.agent));row(W.account,accLine(e.agent));
    var lt=turnLine(e.turn);row(W.lastTurn,lt||W.noTurns);if(!e.on)row(W.state,W.off+(e.offReason?' — '+e.offReason:''));
    if(e.agent.bot)row(W.bot,'@'+e.agent.bot);
    d.appendChild(kv);
    var msg=el('div');
    if(!e.required){var acts=el('div','acts oc-foot');
      var go=function(b,want){tap();b.disabled=true;b.textContent=W.working;call({action:'power',id:e.id,power:want,reason:W.offReason}).then(function(x){if(x&&x.ok){load()}else{msg.className='err';msg.textContent=why(x&&x.reason);showMain()}})};
      var showMain=function(){acts.textContent='';acts.appendChild(btn(e.on?'soft':'',e.on?W.turnOff:W.turnOn,function(b){if(!e.on)return go(b,'on');acts.textContent='';
        acts.appendChild(el('div','x',W.confirmOff.replace('{name}',e.name)));var two2=el('div','acts');
        two2.appendChild(btn('soft',W.cancel,function(){showMain()}));two2.appendChild(btn('red',W.confirmYes,function(b2){go(b2,'off')}));acts.appendChild(two2)}))};
      showMain();d.appendChild(acts)}
    d.appendChild(msg);group.appendChild(d)})}
// 780 (the owner, 2026-11-17, «Да» to variant A): «+ Новый элемент» — the last row of «Ваши»; one field «Что должен делать новый элемент?»,
// the words go to the main agent as the person's request, its answer comes in the chat, so the Pult closes after sending.
var newOpen=false;
function newRow(){var w=el('div');w.setAttribute('data-block','tg-app-new-element');
  if(!newOpen){var b=el('button','more','+ '+W.newElement);b.type='button';b.onclick=function(){tap();newOpen=true;render(last)};w.appendChild(b);return w}
  var d=el('div','detail');d.style.paddingLeft='14px';d.appendChild(el('div','x',W.newAsk));var f=el('div','field'),t=el('textarea');t.rows=3;t.maxLength=1000;t.placeholder=W.newHint;t.style.cssText='flex:1;min-width:0;font:inherit;font-size:16px;padding:9px 11px;border-radius:10px;border:0;background:var(--bg);color:var(--fg);resize:vertical';f.appendChild(t);d.appendChild(f);
  var msg=el('div'),acts=el('div','acts');acts.appendChild(btn('soft',W.cancel,function(){newOpen=false;render(last)}));
  acts.appendChild(btn('',W.send,function(b){var v=t.value.trim();if(v.length<3)return;tap();b.disabled=true;b.textContent=W.saving;
    call({action:'newElement',text:v}).then(function(x){if(x&&x.ok){t.value='';f.remove();acts.remove();msg.className='okl';msg.textContent=W.newSent;newOpen=false;setTimeout(function(){post('web_app_close')},2200)}else{msg.className='err';msg.textContent=why(x&&x.reason);b.disabled=false;b.textContent=W.send}})}));
  d.appendChild(acts);d.appendChild(msg);w.appendChild(d);return w}
var last=null;
function render(s){
  last=s;var main=document.getElementById('main');main.textContent='';var up=updating(s.update);if(up)main.appendChild(up);if(s.main)main.appendChild(mainAgent(s.main,!!up));var bl=builds(s.builds,s.elements);if(bl)main.appendChild(bl);var f=fuel(s.limits);
  if(f||s.context!==undefined){main.appendChild(el('h2',null,W.fuel));main.appendChild(ctxCard(s.context||null));if(f)main.appendChild(f)}
  main.appendChild(el('h2',null,W.asks+(s.asks.length?' · '+s.asks.length:'')));
  if(!s.asks.length)main.appendChild(el('div','calm',W.asksNone));s.asks.forEach(function(a){main.appendChild(askCard(a))});
  var mine=s.elements.filter(function(e){return!e.native}),nat=s.elements.filter(function(e){return e.native});
  main.appendChild(el('h2',null,W.elements+' · '+W.custom));var g1=el('div','group');elRows(mine,g1);g1.appendChild(newRow());main.appendChild(g1);
  main.appendChild(el('h2',null,W.elements+' · '+W.native));var g2=el('div','group');
  var shown=showNative?nat:nat.filter(function(e){return!e.on||e.live||e.build||openId===e.id});elRows(shown,g2);
  var mb=el('button','more',showNative?W.less:W.more.replace('{n}',nat.length));mb.type='button';mb.onclick=function(){tap();showNative=!showNative;render(last)};g2.appendChild(mb);main.appendChild(g2);
  var nd=s.node||{};document.getElementById('title').textContent=nd.name?W.title+' · '+nd.name:W.title;var host='';try{host=nd.web?new URL(nd.web).host:''}catch(x){}document.getElementById('where').textContent=nd.place==='server'?(host?W.placeServer.replace('{host}',host):W.placeServerBare):nd.place==='home'?W.placeHome:'';
  var meta=document.getElementById('meta');meta.textContent='';meta.appendChild(el('span','live'));meta.appendChild(document.createTextNode(W.inNet+' · '+W.count.replace('{n}',s.elements.length)+' · '+W.updated.replace('{time}',hm(s.at))))}
function load(){var e=document.getElementById('err');call({action:'state'}).then(function(d){if(d&&d.ok&&d.state){e.textContent='';render(d.state)}else{e.textContent=why(d&&d.reason);document.getElementById('meta').textContent=''}})}
document.getElementById('refresh').onclick=function(){tap();load()};load();
})();
</script></body></html>`
}

module.exports = { html }

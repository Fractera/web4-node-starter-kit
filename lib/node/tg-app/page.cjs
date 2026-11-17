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
const WORDS = require('./words.cjs')

function html(lang) {
  const w = WORDS[lang] ?? WORDS.en
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
.fuel{background:var(--card);border-radius:14px;padding:12px 14px;display:grid;grid-template-columns:1fr 1fr;gap:14px}
.fuel .k{font-size:12px;color:var(--hint)}.fuel .v{font-size:24px;font-weight:700;letter-spacing:-.02em;font-variant-numeric:tabular-nums;line-height:1.15}
.fuel .r{font-size:11px;color:var(--hint);margin-top:2px}.bar{height:4px;border-radius:2px;background:var(--line);overflow:hidden;margin-top:6px}
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
button.b{font:inherit;font-size:14px;font-weight:600;padding:9px 14px;border:0;border-radius:10px;background:var(--btn);color:var(--btnfg)}
button.b:active{transform:scale(.97)}button.b:disabled{opacity:.5}button.soft{background:var(--bg);color:var(--link)}button.red{background:var(--warn);color:#fff}
.field{display:flex;gap:8px;margin-top:10px}.field input{flex:1;min-width:0;font:inherit;font-size:16px;padding:9px 11px;border-radius:10px;border:0;background:var(--bg);color:var(--fg)}
pre{white-space:pre-wrap;word-break:break-all;font-size:12px;background:var(--bg);border-radius:8px;padding:8px;margin:8px 0 0}
.more{display:block;width:100%;text-align:left;font:inherit;font-size:15px;color:var(--link);background:none;border:0;padding:11px 14px;position:relative}
.more::before{content:"";position:absolute;left:14px;right:0;top:0;height:1px;background:var(--line)}
.err{color:var(--warn);font-size:13px;margin-top:6px}.okl{color:var(--ok);font-size:13px;margin-top:6px}
@media (prefers-reduced-motion:reduce){.chev{transition:none}}
</style></head><body data-block="tg-app">
<div class="top" data-block="tg-app-header"><h1>${w.title}</h1><button class="ic" id="refresh" aria-label="${w.refresh}">↻</button></div>
<div class="sub" id="meta">${w.loading}</div><div id="err" class="err" role="alert"></div><main id="main" data-block="tg-app-main"></main>
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
function fuel(lims){
  var l=lims.filter(function(x){return x.who==='node'})[0]||lims[0];if(!l)return null;var c=el('div','fuel');c.setAttribute('data-block','tg-app-fuel');
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
  if(a.secret&&a.secret.kind==='server-root'){c.appendChild(el('div','s',W.rootOnly.replace('{host}',a.secret.host||'')));return c}
  if(a.secret){var f=el('div','field'),inp=el('input');inp.type='password';inp.autocomplete='off';inp.spellcheck=false;inp.setAttribute('autocapitalize','off');
    inp.placeholder=a.secret.kind==='openai'?W.openaiLabel:W.keyLabel.replace('{name}',a.secret.name||'');f.appendChild(inp);
    f.appendChild(btn('soft',W.show,function(b){var v=inp.type==='password';inp.type=v?'text':'password';b.textContent=v?W.hide:W.show}));c.appendChild(f);
    var acts=el('div','acts');acts.appendChild(btn('',W.save,function(b){if(!inp.value.trim())return;tap();b.disabled=true;b.textContent=W.saving;msg.className='';msg.textContent='';
      call({action:'secret',id:a.id,secret:inp.value}).then(function(d){if(d&&d.ok){inp.value='';f.remove();acts.remove();msg.className='okl';msg.textContent=W.saved.replace('{tail}',d.tail?' (…'+d.tail+')':'');setTimeout(load,1500)}else{msg.className='err';msg.textContent=why(d&&d.reason);b.disabled=false;b.textContent=W.save}})}));
    c.appendChild(acts);c.appendChild(msg);return c}
  var acts2=el('div','acts');acts2.appendChild(btn('',W.done,function(b){tap();b.disabled=true;call({action:'done',id:a.id}).then(function(d){if(d&&d.ok){acts2.remove();msg.className='okl';msg.textContent=W.doneOk;setTimeout(load,1500)}else{msg.className='err';msg.textContent=why(d&&d.reason);b.disabled=false}})}));
  c.appendChild(acts2);c.appendChild(msg);return c}
function turnLine(t){if(!t)return null;var k=t.event==='turn-end'?W.turnEnd:t.event==='turn-error'?W.turnError:t.event==='turn-start'?W.turnStart:null;return k?k.replace('{time}',tm(t.at))+(t.last?' — '+t.last:''):null}
function elRows(list,group){
  list.forEach(function(e){
    var row=el('div','row'+(openId===e.id?' open':''));row.setAttribute('data-block','tg-app-element');row.setAttribute('role','button');
    row.appendChild(el('span','dot'+(e.live?' run':e.on?' on':'')));var mid=el('div','mid');mid.appendChild(el('div','nm',e.name));
    mid.appendChild(el('div','ln',e.live?W.live:!e.on?W.off+(e.offReason?' — '+e.offReason:''):(e.step||turnLine(e.turn)||W.on)));row.appendChild(mid);row.appendChild(el('span','chev','›'));
    row.onclick=function(){tap();openId=openId===e.id?null:e.id;render(last)};group.appendChild(row);
    if(openId!==e.id)return;
    var d=el('div','detail');d.setAttribute('data-block','tg-app-element-detail');
    d.appendChild(el('div','k',W.state));d.appendChild(el('div','x',(e.on?W.on:W.off+(e.offReason?' — '+e.offReason:''))+(e.live?' · '+W.live:'')));
    if(e.step){d.appendChild(el('div','k',W.step));d.appendChild(el('div','x',e.step))}
    d.appendChild(el('div','k',W.lastTurn));d.appendChild(el('div','x',turnLine(e.turn)||W.noTurns));
    var msg=el('div');
    if(!e.required){var acts=el('div','acts');
      var go=function(b,want){tap();b.disabled=true;b.textContent=W.working;call({action:'power',id:e.id,power:want,reason:W.offReason}).then(function(x){if(x&&x.ok){load()}else{msg.className='err';msg.textContent=why(x&&x.reason);showMain()}})};
      var showMain=function(){acts.textContent='';acts.appendChild(btn(e.on?'soft':'',e.on?W.turnOff:W.turnOn,function(b){if(!e.on)return go(b,'on');acts.textContent='';
        acts.appendChild(el('div','x',W.confirmOff.replace('{name}',e.name)));var two=el('div','acts');
        two.appendChild(btn('soft',W.cancel,function(){showMain()}));two.appendChild(btn('red',W.confirmYes,function(b2){go(b2,'off')}));acts.appendChild(two)}))};
      showMain();d.appendChild(acts)}
    d.appendChild(msg);group.appendChild(d)})}
var last=null;
function render(s){
  last=s;var main=document.getElementById('main');main.textContent='';var f=fuel(s.limits);
  if(f){main.appendChild(el('h2',null,W.fuel));main.appendChild(f)}
  main.appendChild(el('h2',null,W.asks+(s.asks.length?' · '+s.asks.length:'')));
  if(!s.asks.length)main.appendChild(el('div','calm',W.asksNone));s.asks.forEach(function(a){main.appendChild(askCard(a))});
  var mine=s.elements.filter(function(e){return!e.native}),nat=s.elements.filter(function(e){return e.native});
  main.appendChild(el('h2',null,W.elements+' · '+W.custom));var g1=el('div','group');elRows(mine,g1);main.appendChild(g1);
  main.appendChild(el('h2',null,W.elements+' · '+W.native));var g2=el('div','group');
  var shown=showNative?nat:nat.filter(function(e){return!e.on||e.live||openId===e.id});elRows(shown,g2);
  var mb=el('button','more',showNative?W.less:W.more.replace('{n}',nat.length));mb.type='button';mb.onclick=function(){tap();showNative=!showNative;render(last)};g2.appendChild(mb);main.appendChild(g2);
  var meta=document.getElementById('meta');meta.textContent='';meta.appendChild(el('span','live'));meta.appendChild(document.createTextNode(W.inNet+' · '+W.count.replace('{n}',s.elements.length)+' · '+W.updated.replace('{time}',hm(s.at))))}
function load(){var e=document.getElementById('err');call({action:'state'}).then(function(d){if(d&&d.ok&&d.state){e.textContent='';render(d.state)}else{e.textContent=why(d&&d.reason);document.getElementById('meta').textContent=''}})}
document.getElementById('refresh').onclick=function(){tap();load()};load();
})();
</script></body></html>`
}

module.exports = { html }

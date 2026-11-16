'use strict'
// «ПУЛЬТ УЗЛА» — THE PAGE TELEGRAM OPENS (node step 771-2). Plain HTML and a little JavaScript, no React bundle and no session: Telegram
// opens it over the chat from the main bot's menu button, the launch data and the theme come in the page's hash (`tgWebAppData`,
// `tgWebAppThemeParams`), and every call to the door carries that signed launch data (771-1). A Telegram surface wears Telegram's own
// look — its theme colours; the panel on the computer keeps the core's primitives. Everything from the node is put with textContent:
// a request's words never become markup.
const WORDS = require('./words.cjs')

function html(lang) {
  const w = WORDS[lang] ?? WORDS.en
  const cfg = JSON.stringify({ w }).replace(/</g, '\\u003c')
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex,nofollow"><title>${w.title}</title>
<style>
:root{color-scheme:light dark;--bg:#fff;--fg:#111;--hint:#6b7280;--btn:#2481cc;--btnfg:#fff;--card:#f3f4f6;--link:#2481cc;--warn:#e5484d;--ok:#30a46c}
@media (prefers-color-scheme:dark){:root{--bg:#17212b;--fg:#f5f5f5;--hint:#8b9aa7;--card:#232e3c}}
*{box-sizing:border-box}body{margin:0;padding:16px 14px 32px;font:15px/1.45 system-ui,-apple-system,sans-serif;background:var(--bg);color:var(--fg);-webkit-font-smoothing:antialiased}
header{display:flex;align-items:baseline;justify-content:space-between;gap:8px;margin-bottom:14px}h1{font-size:20px;margin:0;letter-spacing:-.01em}
.meta{color:var(--hint);font-size:12px}h2{font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;color:var(--hint);margin:22px 0 8px}
.card{background:var(--card);border-radius:12px;padding:12px;margin-bottom:8px}.t{font-weight:600}.s{color:var(--hint);font-size:13px;margin-top:4px}
.row{display:flex;gap:8px;align-items:center;margin-top:10px}.row input{flex:1;min-width:0;font:inherit;font-size:16px;padding:10px;border-radius:10px;border:0;background:var(--bg);color:var(--fg)}
button{font:inherit;font-weight:600;padding:10px 14px;border:0;border-radius:10px;background:var(--btn);color:var(--btnfg)}button:disabled{opacity:.5}
button.ghost{background:transparent;color:var(--link);padding:6px 0;font-weight:500}button.danger{background:var(--warn);color:#fff}button.small{padding:7px 12px;font-size:14px}
pre{white-space:pre-wrap;word-break:break-all;font-size:13px;background:var(--bg);border-radius:8px;padding:8px;margin:8px 0 0}
.el{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.dot{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:6px;background:var(--hint)}
.dot.on{background:var(--ok)}.dot.live{background:var(--btn)}.bar{height:6px;border-radius:3px;background:var(--bg);overflow:hidden;margin-top:6px}.bar i{display:block;height:100%;background:var(--btn)}
.bar i.hot{background:var(--warn)}.err{color:var(--warn);font-size:13px;margin-top:6px}.okline{color:var(--ok);font-size:13px;margin-top:6px}
</style></head><body data-block="tg-app"><header data-block="tg-app-header"><h1>${w.title}</h1><button class="ghost" id="refresh">${w.refresh}</button></header>
<div class="meta" id="meta">${w.loading}</div><div id="err" class="err" role="alert"></div><main id="main" data-block="tg-app-main"></main>
<script>
(function(){
var W=${cfg}.w;var h=new URLSearchParams(location.hash.slice(1));var init=h.get('tgWebAppData')||'';
var lang=document.documentElement.lang||'en';
function post(t,d){try{if(window.TelegramWebviewProxy)return window.TelegramWebviewProxy.postEvent(t,JSON.stringify(d||{}));if(window.external&&'notify'in window.external)return window.external.notify(JSON.stringify({eventType:t,eventData:d||{}}));window.parent.postMessage(JSON.stringify({eventType:t,eventData:d||{}}),'*')}catch(e){}}
try{var th=JSON.parse(h.get('tgWebAppThemeParams')||'{}'),r=document.documentElement.style,m={bg_color:'--bg',text_color:'--fg',hint_color:'--hint',button_color:'--btn',button_text_color:'--btnfg',secondary_bg_color:'--card',link_color:'--link'};for(var k in m)if(th[k])r.setProperty(m[k],th[k])}catch(e){}
post('web_app_ready');post('web_app_expand');
function el(tag,cls,text){var x=document.createElement(tag);if(cls)x.className=cls;if(text!=null)x.textContent=text;return x}
function tm(iso){try{return new Date(iso).toLocaleString(lang,{hour:'2-digit',minute:'2-digit',day:'2-digit',month:'2-digit'})}catch(e){return iso}}
function why(r){return (W.errors[r]||W.failed.replace('{reason}',r||'?'))}
function call(body){return fetch(location.pathname+'?lang='+lang,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.assign({initData:init},body))}).then(function(r){return r.json().catch(function(){return{ok:false,reason:String(r.status)}})}).catch(function(e){return{ok:false,reason:String(e&&e.message||e)}})}
function askCard(a){
  var c=el('div','card');c.setAttribute('data-block','tg-app-ask');c.appendChild(el('div','t',a.text));
  if(a.byName)c.appendChild(el('div','s',W.from.replace('{name}',a.byName)));
  if(a.why)c.appendChild(el('div','s',W.why+': '+a.why));if(a.hint)c.appendChild(el('div','s',W.hint+': '+a.hint));
  if(a.copy){c.appendChild(el('pre',null,a.copy));var cb=el('button','ghost',W.copy);cb.onclick=function(){try{navigator.clipboard.writeText(a.copy);cb.textContent=W.copied}catch(e){}};c.appendChild(cb)}
  var msg=el('div');c.appendChild(msg);
  if(a.secret&&a.secret.kind==='server-root'){c.appendChild(el('div','s',W.rootOnly.replace('{host}',a.secret.host||'')));return c}
  var row=el('div','row');c.appendChild(row);
  if(a.secret){
    var inp=el('input');inp.type='password';inp.autocomplete='off';inp.spellcheck=false;inp.setAttribute('autocapitalize','off');
    inp.placeholder=a.secret.kind==='openai'?W.openaiLabel:W.keyLabel.replace('{name}',a.secret.name||'');
    var eye=el('button','ghost small',W.show);eye.onclick=function(){var v=inp.type==='password';inp.type=v?'text':'password';eye.textContent=v?W.hide:W.show};
    var sv=el('button','small',W.save);sv.onclick=function(){if(!inp.value.trim())return;sv.disabled=true;sv.textContent=W.saving;msg.className='';msg.textContent='';
      call({action:'secret',id:a.id,secret:inp.value}).then(function(d){if(d&&d.ok){inp.value='';row.remove();msg.className='okline';msg.textContent=W.saved.replace('{tail}',d.tail?' (…'+d.tail+')':'');setTimeout(load,1500)}else{msg.className='err';msg.textContent=why(d&&d.reason);sv.disabled=false;sv.textContent=W.save}})};
    row.appendChild(inp);row.appendChild(eye);row.appendChild(sv);return c}
  var dn=el('button','small',W.done);dn.onclick=function(){dn.disabled=true;call({action:'done',id:a.id}).then(function(d){if(d&&d.ok){row.remove();msg.className='okline';msg.textContent=W.doneOk;setTimeout(load,1500)}else{msg.className='err';msg.textContent=why(d&&d.reason);dn.disabled=false}})};
  row.appendChild(dn);return c}
function turnLine(t){if(!t)return null;var k=t.event==='turn-end'?W.turnEnd:t.event==='turn-error'?W.turnError:t.event==='turn-start'?W.turnStart:null;return k?k.replace('{time}',tm(t.at))+(t.last?' — '+t.last:''):null}
function elCard(e){
  var c=el('div','card');c.setAttribute('data-block','tg-app-element');var top=el('div','el');var left=el('div');
  var name=el('div','t');var d=el('span','dot'+(e.live?' live':e.on?' on':''));name.appendChild(d);name.appendChild(document.createTextNode(e.name));left.appendChild(name);
  left.appendChild(el('div','s',(e.on?W.on:W.off+(e.offReason?' — '+e.offReason:''))+(e.live?' · '+W.live:'')));
  if(e.step)left.appendChild(el('div','s',e.step));var tl=turnLine(e.turn);if(tl)left.appendChild(el('div','s',tl));top.appendChild(left);
  var msg=el('div');
  if(!e.required){var b=el('button','small'+(e.on?' ghost':''),e.on?W.turnOff:W.turnOn);var armed=false;
    b.onclick=function(){if(e.on&&!armed){armed=true;b.className='small danger';b.textContent=W.sure;return}
      b.disabled=true;b.textContent=W.working;call({action:'power',id:e.id,power:e.on?'off':'on',reason:W.offReason}).then(function(x){if(x&&x.ok)load();else{msg.className='err';msg.textContent=why(x&&x.reason);b.disabled=false;b.textContent=e.on?W.turnOff:W.turnOn;armed=false}})};
    top.appendChild(b)}
  c.appendChild(top);c.appendChild(msg);return c}
function limCard(l){
  var c=el('div','card');c.setAttribute('data-block','tg-app-limit');c.appendChild(el('div','t',l.who==='node'?W.node:l.who));
  [['fiveHour',W.fiveHour],['sevenDay',W.sevenDay]].forEach(function(p){var x=l[p[0]];if(!x)return;
    c.appendChild(el('div','s',p[1]+': '+x.used+' %'+(x.resetsAt?' · '+W.resets.replace('{time}',tm(x.resetsAt)):'')));
    var bar=el('div','bar');var i=el('i',x.used>=85?'hot':null);i.style.width=Math.min(100,x.used)+'%';bar.appendChild(i);c.appendChild(bar)});
  return c}
function render(s){
  var main=document.getElementById('main');main.textContent='';
  main.appendChild(el('h2',null,W.asks+(s.asks.length?' · '+s.asks.length:'')));
  if(!s.asks.length)main.appendChild(el('div','card s',W.asksNone));s.asks.forEach(function(a){main.appendChild(askCard(a))});
  var mine=s.elements.filter(function(e){return!e.native}),nat=s.elements.filter(function(e){return e.native});
  main.appendChild(el('h2',null,W.elements+' · '+W.custom));mine.forEach(function(e){main.appendChild(elCard(e))});
  main.appendChild(el('h2',null,W.elements+' · '+W.native));nat.forEach(function(e){main.appendChild(elCard(e))});
  main.appendChild(el('h2',null,W.limits));if(!s.limits.length)main.appendChild(el('div','card s',W.noLimits));s.limits.forEach(function(l){main.appendChild(limCard(l))});
  document.getElementById('meta').textContent=W.updated.replace('{time}',tm(s.at))}
function load(){var e=document.getElementById('err');call({action:'state'}).then(function(d){if(d&&d.ok&&d.state){e.textContent='';render(d.state)}else{e.textContent=why(d&&d.reason);document.getElementById('meta').textContent=''}})}
document.getElementById('refresh').onclick=load;load();
})();
</script></body></html>`
}

module.exports = { html }

'use strict'
// @local — the Pult's own window, plain JS inlined into lib/node/tg-app/page.cjs (no React there); nothing else draws it
// AN ELEMENT'S BOT FROM THE PULT (node step 839). The owner, 2026-11-22 (Telegram 901): «после создания нового элемента у нас есть кнопка
// сайт которая уже работает но в пульте мы не можем создать агента … при нажатии на кнопку Bot открыть информационное окно которое обучит
// пользователь активировать бота … бот скорее всего будет активирован на чужом компьютере поэтому инструкция должна быть также доступна для
// скачивания … результаты этой инструкции также должен быть доступен для интерактивного ввода в том числе и здесь … копирование имени
// копирования название телеграмм бота возможность вставить как Токен так и всю строчку целиком а также возможность перейти по вкладке для
// активации … дизайн … похож на тот … ввести логины пароль для пользователя элемента».
// Design (skill interface-design): Intent — the architect on the phone, an element just born, its agent unreachable in Telegram; finish it
// here or hand it to someone. Focal — step 3, the one field that closes the job (the paste); steps 1–2 are quiet rows with copy buttons.
// Feel — BotFather's own order, Telegram-native: the same accented card as «Ждёт вас» (the admin window), numbered circles that turn green
// when done. The hand-off lives below a divider: «Переслать» (a Telegram message to anyone) and «Скачать» (a file).
// The server half reuses the element's own «Telegram-бот» page logic (`_agent-kit/server/telegram.cjs`: the token from the token or the
// whole BotFather message, the name rule, getMe, the activation link) — nothing of it is written twice.
// 🔒 SOURCE and CSS are string literals: the core's build minifies this file and a function's text would lose its names (✗ 788-2, 14:08).

const CSS = '.bs{margin-top:12px}.bs-step{display:grid;grid-template-columns:24px 1fr;gap:10px;margin-top:14px;align-items:start}' +
  '.bs-n{width:24px;height:24px;border-radius:12px;background:var(--bg);color:var(--link);font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center;font-variant-numeric:tabular-nums}' +
  '.bs-n.ok{background:var(--ok);color:#fff}.bs-step .x{font-weight:600;text-wrap:pretty}.bs-step .s{color:var(--hint);font-size:13px;margin-top:3px;text-wrap:pretty}' +
  '.bs-kv{margin-top:8px;background:var(--bg);border-radius:12px;overflow:hidden}.bs-row{display:flex;align-items:center;gap:10px;min-height:44px;padding:6px 6px 6px 12px}' +
  '.bs-row+.bs-row{border-top:1px solid var(--line)}.bs-row .k{font-size:12px;color:var(--hint)}.bs-row .v{font-size:15px;font-weight:600;overflow-wrap:anywhere}.bs-row .mid{flex:1;min-width:0}' +
  '.bs textarea{width:100%;margin-top:8px;font:inherit;font-size:16px;padding:9px 11px;border-radius:10px;border:0;background:var(--bg);color:var(--fg);resize:vertical;min-height:72px}' +
  '.bs-hand{margin-top:16px;padding-top:12px;border-top:1px solid var(--line)}.bs-hand .acts{margin-top:8px}'

const SOURCE = `
var botFor=null;
function bsStep(n,done,title,sub){var s=el('div','bs-step');s.appendChild(el('span','bs-n'+(done?' ok':''),done?'✓':String(n)));var m=el('div');m.appendChild(el('div','x',title));if(sub)m.appendChild(el('div','s',sub));s.appendChild(m);return {box:s,body:m}}
function bsCopyRow(kv,k,v){var r=el('div','bs-row');var m=el('div','mid');m.appendChild(el('div','k',k));m.appendChild(el('div','v',v));r.appendChild(m);
  r.appendChild(btn('soft',W.copy,function(b){tap();try{navigator.clipboard.writeText(v);b.textContent=W.copied}catch(x){}}));kv.appendChild(r)}
function bsTg(path){tap();post('web_app_open_tg_link',{path_full:path})}
function bsDownloadOk(){var v=(h.get('tgWebAppVersion')||'0').split('.').map(Number);return v[0]>=8}
function botSetup(e){var c=el('div','ask bs');c.setAttribute('data-block','tg-app-bot-setup');c.setAttribute('data-bot-setup',e.id);
  c.appendChild(el('div','t',W.bsTitle.replace('{name}',e.name)));c.appendChild(el('div','s',W.bsLead));
  var body=el('div'),msg=el('div');body.appendChild(el('div','s',W.loading));c.appendChild(body);c.appendChild(msg);
  call({action:'bot',id:e.id,do:'state'}).then(function(d){body.textContent='';if(!d||!d.ok){msg.className='err';msg.textContent=why(d&&d.reason);return}bsSteps(e,d,body,msg)});
  return c}
function bsSteps(e,d,body,msg){var connected=!!d.botUsername;
  var s1=bsStep(1,connected,W.bs1,connected?null:W.bs1s);if(!connected){var a1=el('div','acts');a1.appendChild(btn('soft',W.bsOpenFather,function(){bsTg('/BotFather')}));s1.body.appendChild(a1)}body.appendChild(s1.box);
  var s2=bsStep(2,connected,W.bs2,connected?null:W.bs2s);if(!connected){var kv=el('div','bs-kv');bsCopyRow(kv,W.bsName,d.name);bsCopyRow(kv,W.bsUser,d.username);s2.body.appendChild(kv)}body.appendChild(s2.box);
  var s3=bsStep(3,connected,connected?W.bs3done.replace('{bot}','@'+d.botUsername):W.bs3,connected?null:W.bs3s);
  if(!connected){var t=el('textarea');t.rows=3;t.spellcheck=false;t.setAttribute('autocapitalize','off');t.setAttribute('autocomplete','off');t.placeholder=W.bsPaste;s3.body.appendChild(t);
    var a3=el('div','acts');a3.appendChild(btn('',W.bsConnect,function(b){if(!t.value.trim())return;tap();b.disabled=true;b.textContent=W.bsConnecting;msg.className='';msg.textContent='';
      call({action:'bot',id:e.id,do:'token',token:t.value}).then(function(x){if(x&&x.ok){t.value='';d.botUsername=x.username;body.textContent='';bsSteps(e,d,body,msg);return}
        b.disabled=false;b.textContent=W.bsConnect;msg.className='err';msg.textContent=why(x&&x.reason)})}));s3.body.appendChild(a3)}
  body.appendChild(s3.box);
  var s4=bsStep(4,connected&&d.allowed>0,W.bs4,connected?W.bs4s:W.bs4wait);
  if(connected){var a4=el('div','acts');a4.appendChild(btn(d.allowed>0?'soft':'',W.bsActivate.replace('{bot}','@'+d.botUsername),function(b){b.disabled=true;
      call({action:'bot',id:e.id,do:'activate'}).then(function(x){b.disabled=false;if(x&&x.ok&&x.url){bsTg(x.url.replace(/^https:\\/\\/t\\.me/,''));setTimeout(load,15000);return}msg.className='err';msg.textContent=why(x&&x.reason)})}));s4.body.appendChild(a4)}
  body.appendChild(s4.box);
  if(connected)return;
  var hand=el('div','bs-hand');hand.appendChild(el('div','s',W.bsOther));var ah=el('div','acts');
  ah.appendChild(btn('soft',W.bsShare,function(){bsTg('/share/url?url='+encodeURIComponent('https://t.me/BotFather')+'&text='+encodeURIComponent(d.guide))}));
  ah.appendChild(btn('soft',W.bsDownload,function(b){tap();b.disabled=true;call({action:'bot',id:e.id,do:'guide'}).then(function(x){b.disabled=false;if(!x||!x.ok){msg.className='err';msg.textContent=why(x&&x.reason);return}
    var url=location.origin+x.url;if(bsDownloadOk())post('web_app_request_file_download',{url:url,file_name:x.file});else post('web_app_open_link',{url:url})})}));
  hand.appendChild(ah);body.appendChild(hand)}
`

const WORDS = {
  ru: {
    bsTitle: 'Бот для агента «{name}»', bsLead: 'Агент элемента будет отвечать в своём боте. Четыре шага — две минуты.',
    bs1: 'Откройте @BotFather и отправьте /newbot', bs1s: 'Это официальный бот Telegram, который создаёт ботов.', bsOpenFather: 'Открыть @BotFather',
    bs2: 'Дайте ему имя и username', bs2s: 'BotFather спросит их по очереди. Username занят — добавьте цифру перед _bot.', bsName: 'Имя', bsUser: 'Username',
    bs3: 'Вставьте ответ BotFather', bs3s: 'Токен или всё сообщение целиком — узел сам найдёт токен и проверит его в Telegram.', bs3done: 'Бот подключён: {bot}',
    bsPaste: 'Токен или сообщение BotFather', bsConnect: 'Подключить', bsConnecting: 'Проверяю в Telegram…',
    bs4: 'Нажмите Start в боте', bs4s: 'Так бот узнает вас — и будет слушать только вас.', bs4wait: 'Станет доступно, когда бот подключён.', bsActivate: 'Открыть {bot}',
    bsOther: 'Бота создаёт другой человек? Отправьте ему инструкцию — он пришлёт вам ответ BotFather, вы вставите его в шаг 3.',
    bsShare: 'Переслать в Telegram', bsDownload: 'Скачать инструкцию', bsTap: 'Нажмите «Бот» — создадим его за две минуты.', bsStart: 'Бот подключён — осталось нажать в нём Start (кнопка «Бот»).',
  },
  en: {
    bsTitle: 'A bot for the agent «{name}»', bsLead: 'The element\'s agent will answer in a bot of its own. Four steps — two minutes.',
    bs1: 'Open @BotFather and send /newbot', bs1s: 'Telegram\'s official bot that creates bots.', bsOpenFather: 'Open @BotFather',
    bs2: 'Give it a name and a username', bs2s: 'BotFather asks for them one by one. Username taken — add a digit before _bot.', bsName: 'Name', bsUser: 'Username',
    bs3: 'Paste BotFather\'s answer', bs3s: 'The token or the whole message — the node finds the token itself and checks it with Telegram.', bs3done: 'Bot connected: {bot}',
    bsPaste: 'The token or BotFather\'s message', bsConnect: 'Connect', bsConnecting: 'Checking with Telegram…',
    bs4: 'Press Start in the bot', bs4s: 'This is how the bot learns you — it listens to you alone.', bs4wait: 'Available once the bot is connected.', bsActivate: 'Open {bot}',
    bsOther: 'Someone else creates the bot? Send them the guide — they send you BotFather\'s answer, you paste it in step 3.',
    bsShare: 'Forward in Telegram', bsDownload: 'Download the guide', bsTap: 'Press «Bot» — we create it in two minutes.', bsStart: 'The bot is connected — press Start in it (the «Bot» button).',
  },
}

const ERRORS = {
  ru: {
    'empty-token': 'Вставьте токен или сообщение BotFather.', 'bad-format': 'Токена в тексте нет. Он выглядит так: 1234567890:AAH… — 35 знаков после двоеточия.',
    'token-rejected': 'Telegram не принял этот токен. Скопируйте его из BotFather заново.', 'telegram-unreachable': 'Telegram сейчас не отвечает узлу — попробуйте через минуту.',
    'not-custom': 'Бота из пульта можно подключить кастомному элементу; встроенному — на его странице «Telegram-бот».', 'no-bot-username': 'Сначала подключите бота (шаг 3).',
  },
  en: {
    'empty-token': 'Paste the token or BotFather\'s message.', 'bad-format': 'No token in the text. It looks like 1234567890:AAH… — 35 characters after the colon.',
    'token-rejected': 'Telegram did not accept this token. Copy it from BotFather again.', 'telegram-unreachable': 'Telegram does not answer the node right now — try in a minute.',
    'not-custom': 'The Pult connects a bot to a custom element; a built-in one — on its «Telegram bot» page.', 'no-bot-username': 'Connect the bot first (step 3).',
  },
}

/** The guide another person follows — no token, no secret: the names to type and where the answer goes. */
function guideText(lang, { element, node, name, username }) {
  if (lang === 'ru') {
    return [
      `Бот для агента «${element}»${node ? ` (узел ${node})` : ''}`,
      '',
      '1. Откройте в Telegram @BotFather: https://t.me/BotFather',
      '2. Отправьте ему /newbot',
      `3. Имя бота: ${name}`,
      `4. Username бота: ${username}`,
      '   (если занят — добавьте цифру перед _bot)',
      '5. BotFather пришлёт сообщение с токеном. Перешлите это сообщение целиком тому, кто прислал вам инструкцию.',
      '',
      'Токен — ключ от бота: не публикуйте его и не отправляйте никому другому.',
    ].join('\n')
  }
  return [
    `A bot for the agent «${element}»${node ? ` (node ${node})` : ''}`,
    '',
    '1. Open @BotFather in Telegram: https://t.me/BotFather',
    '2. Send it /newbot',
    `3. Bot name: ${name}`,
    `4. Bot username: ${username}`,
    '   (taken — add a digit before _bot)',
    '5. BotFather sends a message with the token. Forward that whole message to the person who sent you this guide.',
    '',
    'The token is the key to the bot: never publish it or send it to anyone else.',
  ].join('\n')
}

module.exports = { CSS, SOURCE, WORDS, ERRORS, guideText }

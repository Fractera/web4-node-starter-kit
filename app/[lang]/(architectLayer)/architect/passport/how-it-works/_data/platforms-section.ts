// РАЗДЕЛ 7 «FRACTERA ПРОТИВ ПЛАТФОРМ» — на странице «Как это работает» (шаг 688, владелец 2026-11-08: «Для раздела как это работает
// давай создадим седьмой пункт … – 7.0 Fractera против платформ Claude, GPT и тд.»; сравнение с Mercedes и BRABUS (693: прежде Mercedes-AMG — он часть Mercedes, сравнение неверно) — «можно
// сделать как раскрывашку с вопросом как вообще это можно сравнивать?» — поле `question`).
//
// 🔒 Каждое утверждение — о том, что узел умеет сегодня; чего ещё нет, сказано словами «следующий шаг ядра» и «пока не построен»
// (душа: «say what works today and what is on the way»). Лимиты подписки — support.claude.com, статья 11145838, прочитано 2026-11-08:
// «shared across Claude and Claude Code». Окно в миллион токенов — замер узла 2026-11-08 (`npm run session -- context`, Opus 5.5).
// Правило многих подписок — навык `provider-rules` (Claude Code legal and compliance: «ordinary, individual usage»).
// 7.1 — последний абзац с шага 700: сжатие выключено, узел меряет окно, агент пишет письмо и сбрасывается сам.
// Пункт 7.3 — в настоящем времени с подшага 686-7: пульс, `where`, паспорт `development`, пробуждение к сбросу лимита и долг 686-6.
// `en` основа, `ru` перевод; метки `[[форма|ключ]]` раскрывает `_components/index.ts`.
import type { PresentationSection } from './presentation'

export const PLATFORM_SECTIONS: Record<'en' | 'ru', PresentationSection[]> = {
  en: [
    {
      title: '7. Fractera versus the platforms of Claude, GPT and others',
      tab: 'Versus platforms',
      lead: 'Fractera cannot compete with Claude, GPT or any platform like them, and it does not try to: their own models run at its heart. It adds what one conversation with a model lacks, so that a large project can live for years.',
      question: {
        summary: 'How can these even be compared?',
        text: 'Think of Mercedes-Benz and BRABUS. Mercedes makes the car and its soul. BRABUS, an independent company, takes that car as its base and builds a stronger version of it, mostly with hardware of its own. Or Apple and Caviar: one makes the iPhone, the other turns it into a version of its own. Claude and GPT are the Mercedes and the Apple here, and Fractera is the BRABUS built on them.',
      },
      parts: [
        {
          title: '7.1 The context window and a project that outlives it',
          items: [
            'Start a large project on a provider’s platform and you soon reach the end of the context window. For a landing page or a piece of research that is often enough.',
            'The trouble starts when the work has to outlive many sessions, and every next session has to start more experienced than the last one. An agent of the node starts each session from the whole goal and the linked parts of it that are written down, and goes deep into the next part only.',
            'With one subscription and one project the two can still be compared. With tens or hundreds of such projects at once, one window cannot hold them: no model today has a window of a billion tokens.',
            'A node does not need one. Every [[element|element]] works in its own Claude Code window, up to a million tokens on the largest models, and its steps, its memory and its development diary carry the work from session to session. A project that needs a billion tokens of context in total can be kept and grown this way, because nothing it has learned lives only in a window. This is the node’s main architectural advantage, and the others follow from it.',
            'When a window fills up, Claude Code usually compacts it: the conversation is replaced with a summary the model writes for itself, and whatever the summary drops is gone without a trace. In a node compaction is off. The node measures how full every agent’s window is, and past 55 % it tells the agent. The agent weighs the work in front of it: a small last task it finishes first, a long one it starts in a clean window. It writes a letter to its next session (where it stands, your words exactly as you said them, what is half done, the next step), commits it, and the node clears the window and wakes the new session with that letter. Nobody has to ask you, and the work goes on from what the agent wrote down itself.',
          ],
        },
        {
          title: '7.2 A thousand elements, most of them asleep',
          items: [
            'Create as many elements as you need. The ones that must answer all the time stay awake: your main product, a dating site for example. The helpers, such as promotion in social networks or video making, sleep between jobs.',
            'When a helper’s time comes, by an entry in its own calendar, the node wakes it; it does the job and goes back to sleep. Orders from outside agents (a2a) will wake it the same way once the Lagrix network is live.',
            'A sleeping element uses no memory and no processor, only its place on the disk.',
            'So the number of elements is limited by the disk, the number awake at once by the computer’s memory, and the amount of work by your subscription’s limits. Add memory, and the node grows with it.',
          ],
        },
        {
          title: '7.3 When a subscription’s limit runs out',
          items: [
            'The limits of a Claude subscription are shared by all its sessions: Anthropic counts Claude and Claude Code against the same limits. When they run out, every element working on that subscription stops in the same minute.',
            'An element stopped in the middle of its development pauses. Claude Code itself tells the node why the turn ended, with no model involved; the node puts a wake into its calendar for the minute the limit resets, and the element goes on from its last recorded step.',
            'The [[main agent|main-agent]] knows where the development of every element stands without waking it. The element writes its steps, the current step and its state into its passport, and Claude Code’s hooks write how its last session ended. The main agent wakes only an element whose two records disagree, and it answers in three lines.',
            'Work the owner handed out that an element on its own person’s subscription cannot finish, the main agent finishes on the node’s subscription: only while the forecast leaves it 15% of the limit, with that person’s Telegram off until the debt is returned.',
          ],
        },
        {
          title: '7.4 Many subscriptions, lawfully',
          items: [
            'A node can serve a family or a team. Then each person works on their own subscription: on the page «Claude Code subscription» of their element they choose «Its own person’s subscription» and sign in themselves. The element gets its own Claude Code folder, its limit is its own, and the owner’s sign-in stays as it was. The provider’s rules do not let their work run on the owner’s subscription.',
            'Several subscriptions of one person, bought to get around the limits, are against the provider’s rules: its limits assume ordinary, individual use.',
          ],
        },
      ],
    },
  ],
  ru: [
    {
      title: '7. Fractera против платформ Claude, GPT и других',
      tab: 'Против платформ',
      lead: 'Fractera не может конкурировать ни с Claude, ни с GPT, ни с другой такой платформой и не пытается: в её сердце работают их же модели. Она добавляет то, чего не хватает одному разговору с моделью, чтобы большой проект мог жить годами.',
      question: {
        summary: 'Как это вообще можно сравнивать?',
        text: 'Вспомните Mercedes-Benz и BRABUS. Mercedes создаёт автомобиль и его душу. BRABUS — независимая компания — берёт этот автомобиль за основу и строит на нём более мощную версию, чаще всего за счёт своего железа. Или Apple и Caviar: одна делает iPhone, другая превращает его в свою версию. Claude и GPT здесь — Mercedes и Apple, а Fractera — BRABUS, построенный на них.',
      },
      parts: [
        {
          title: '7.1 Контекстное окно и проект, который его переживает',
          items: [
            'Начните большой проект на платформе поставщика, и очень скоро вы упрётесь в предел контекстного окна. Для посадочной страницы или исследования этого часто хватает.',
            'Трудности начинаются, когда работа должна пережить много сессий, и каждая следующая сессия должна начинаться опытнее прошлой. Агент узла начинает каждую сессию с общей цели и записанных частей этой цели, связанных между собой, и углубляется только в очередную.',
            'Пока подписка одна и проект один, сравнивать ещё можно. Когда таких проектов десятки или сотни одновременно, одно окно их не вместит: моделей с окном в миллиард токенов сегодня нет.',
            'Узлу оно и не нужно. Каждый [[элемент|element]] работает в своём окне Claude Code, на самых больших моделях это до миллиона токенов, а его шаги, память и дневник разработки переносят работу из сессии в сессию. Так можно держать и развивать проект, которому в сумме нужен миллиард токенов контекста: ничто из того, что он узнал, не живёт только в окне. Это главное архитектурное преимущество узла, и остальные вытекают из него.',
            'Когда окно заполняется, Claude Code обычно сжимает его: разговор заменяется пересказом, который модель пишет сама себе, и всё, что в пересказ не попало, исчезает без следа. В узле сжатие выключено. Узел измеряет, насколько заполнено окно каждого агента, и после 55 % говорит ему об этом. Агент смотрит на работу перед собой: короткую последнюю задачу доделывает, длинную начинает в чистом окне. Он пишет письмо своей следующей сессии (где стоит, ваши слова дословно, что сделано наполовину, следующий шаг), сохраняет его в истории, и узел очищает окно и будит новую сессию этим письмом. Вас ни о чём не спрашивают, а работа продолжается с того, что агент записал сам.',
          ],
        },
        {
          title: '7.2 Тысяча элементов, и почти все спят',
          items: [
            'Создайте столько элементов, сколько нужно. Те, что должны отвечать всегда, не спят: ваш основной продукт, например сайт знакомств. Помощники вроде продвижения в соцсетях или генерации видео спят между задачами.',
            'Когда приходит время помощника, по записи в его собственном календаре, узел будит его; он делает работу и снова засыпает. Заказы внешних агентов (a2a) будут будить его так же, когда заработает сеть Lagrix.',
            'Спящий элемент не тратит ни памяти, ни процессора, только место на диске.',
            'Поэтому число элементов ограничивает диск, число бодрствующих одновременно — память компьютера, а объём работы — лимиты вашей подписки. Добавьте память, и узел вырастет вместе с ней.',
          ],
        },
        {
          title: '7.3 Когда кончается лимит подписки',
          items: [
            'Лимиты подписки Claude общие для всех её сессий: Anthropic считает Claude и Claude Code по одним и тем же лимитам. Когда они кончаются, все элементы на этой подписке останавливаются в одну минуту.',
            'Элемент, остановленный посреди разработки, встаёт на паузу. Claude Code сам сообщает узлу, почему оборвался ход, без всякой модели; узел ставит пробуждение в свой календарь на минуту, когда лимит восстановится, и элемент продолжает с последнего записанного шага.',
            '[[Главный агент|main-agent]] знает, где стоит разработка каждого элемента, не пробуждая его. Шаги, текущий шаг и его состояние элемент записывает в свой паспорт, а то, чем кончилась его последняя сессия, записывают хуки Claude Code. Будит главный агент только тот элемент, у которого эти две записи расходятся, и тот отвечает в три строки.',
            'Работу, которую поручил владелец и которую элемент на подписке своего человека не может закончить, главный агент доводит на подписке узла: только пока прогноз оставляет ему 15 % лимита, а Telegram того человека выключен до возврата долга.',
          ],
        },
        {
          title: '7.4 Много подписок — законно',
          items: [
            'Узел может служить семье или команде. Тогда каждый человек работает по своей подписке: на странице «Подписка Claude Code» своего элемента он выбирает «Своя подписка человека этого элемента» и входит сам. У элемента появляется своя папка Claude Code, лимит у него свой, а вход владельца остаётся прежним. Правила поставщика не разрешают вести его работу по подписке владельца.',
            'Несколько подписок одного человека, купленные, чтобы обойти лимиты, нарушают правила поставщика: его лимиты рассчитаны на обычную личную работу.',
          ],
        },
      ],
    },
  ],
}

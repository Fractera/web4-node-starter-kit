import type { ReactNode } from 'react'
import { type AgentLinks, AgentNextLinks, TelegramAppNeeded } from './agent-links'
import { AgentTerminal } from './client/agent-terminal.client'
import { ClaudeSubscription } from './client/claude-subscription.client'
import { ClaudeOwnLogin } from './client/claude-own-login.client'
import { TelegramChannel } from './client/telegram-channel.client'
import { agentLinksWords } from './words/agent-links.i18n'
import { agentTerminalWords } from './words/agent-terminal.i18n'
import { claudeSubscriptionWords } from './words/claude-subscription.i18n'
import { telegramChannelWords } from './words/telegram-channel.i18n'
import { appDialogUi } from '@/components/dialog/app-dialog.i18n'
import { coreTerminalWords } from '@/components/deploy/core-terminal.i18n'
import { getService } from '@/lib/microservices/registry'

// ВХОД СТРАНИЦ СЛУЖБЫ В КОПИЮ КОМПЛЕКТА АГЕНТА (271).
//
// 🔒 `(страница, служба, язык) → островок`. Страница службы зовёт только эту функцию; язык выбирается здесь,
// на сервере, и в островок уходит один набор строк — словарь не едет в браузер целиком.
// 🔒 ЭТО НЕ ВИД КАТАЛОГА (до 271 были `agentTerminal`, `claudeSubscription`, `telegramChannel`): вещь живёт в
// папке своего маршрута, и удаление маршрута уносит её целиком. На страницу она встаёт полем `widget`.

// 552-4б: `terminal-work` — терминал сессии рабочего процесса элемента («Рабочий процесс → Терминал»).
export type AgentKitPage = 'claude-code' | 'terminal' | 'terminal-work' | 'telegram'

/**
 * 336-5: поле ключа OpenAI для голоса в окне вставки. Элемент (род `user`) — его вкладка «Переменные окружения» (ключ ядра, нет —
 * ключ элемента: слово владельца 2026-09-29); служба ядра — вкладка ядра.
 */
export function openAiKeyHref(service: string, lang: string): string {
  return getService(service)?.kind === 'user'
    ? `/${lang}/architect/${service}/build/environment#OPENAI_API_KEY`
    : `/${lang}/architect/build/environment#OPENAI_API_KEY`
}

/**
 * 552-6: `slot` — ещё один бот элемента для страницы `telegram` (`h2h` · `orders` · `work`); без него — бот H2A.
 * 624-4: `links` — терминал и Telegram рождённого элемента (его дерево); у служб ядра — страницы их группы.
 */
export function agentKitWidget(page: AgentKitPage, service: string, lang: string, slot?: string, links?: AgentLinks): ReactNode {
  switch (page) {
    case 'claude-code': {
      // 692-3 (владелец 2026-11-08: «элемент чья это подписка должен стоять первым сверху … слева нарисовал крупные цифры единичка это
      // чья это подписка, двоечка войти в аккаунт Троечка открыть терминал или настроить Telegram»). Своя подписка бывает только у элемента
      // узла (он есть в реестре); у главного агента шагов два — вход и разговор.
      const ownable = Boolean(getService(service))
      const steps = [
        ...(ownable ? [<ClaudeOwnLogin key="own" service={service} lang={lang} words={claudeSubscriptionWords(lang)} />] : []),
        <ClaudeSubscription key="sign-in" service={service} lang={lang} words={claudeSubscriptionWords(lang)} />,
        <AgentNextLinks key="next" links={links ?? { terminal: `/${lang}/architect/${service}/terminal`, telegram: `/${lang}/architect/${service}/telegram` }} words={agentLinksWords(lang)} />,
      ]
      return (
        <ol data-block="akst1" className="my-6 flex flex-col gap-6">
          {steps.map((step, i) => (
            <li key={i} data-block="akst2" className="flex gap-4">
              <span data-block="akst3" aria-hidden className="w-8 shrink-0 pt-3 text-center font-semibold text-[length:var(--fs-h2)] text-muted-foreground tabular-nums">{i + 1}</span>
              <div data-block="akst4" className="min-w-0 flex-1 [&>*]:my-0">{step}</div>
            </li>
          ))}
        </ol>
      )
    }
    case 'terminal':
      return <AgentTerminal service={service} lang={lang} words={agentTerminalWords(lang)} build={coreTerminalWords(lang)} dialogUi={appDialogUi(lang)} keyHref={openAiKeyHref(service, lang)} />
    case 'terminal-work':
      return <AgentTerminal service={service} lang={lang} words={agentTerminalWords(lang)} build={coreTerminalWords(lang)} dialogUi={appDialogUi(lang)} keyHref={openAiKeyHref(service, lang)} mode="work" />
    case 'telegram':
      return (
        <>
          <TelegramAppNeeded words={agentLinksWords(lang)} />
          <TelegramChannel service={service} lang={lang} words={telegramChannelWords(lang)} slot={slot} />
        </>
      )
  }
}

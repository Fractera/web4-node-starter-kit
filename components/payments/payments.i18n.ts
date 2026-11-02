// СЛОВА «НАСТРОЙКИ → ПЛАТЕЖИ» (530-1): Web2 — ключи Stripe, Web3 — кошелёк узла. Одни у элемента и у главного агента.
// `en` основа, `ru` перевод.
// 573-4: ключи живут только в нативном элементе Stripe; ключ агента — для инструментов MCP Stripe его агента. Пути панели Stripe — по
// первоисточнику (docs.stripe.com/keys, /webhooks, прочитано 2026-10-23): вебхуки теперь в Workbench, «Developers → Webhooks» устарело.

export type StripeWords = {
  title: string
  lead: string
  restartNote: string
  secretLabel: string
  secretHint: string
  publishableLabel: string
  publishableHint: string
  webhookLabel: string
  webhookHint: string
  agentLabel: string
  agentHint: string
  isSet: string
  notSet: string
  mode: Record<"test" | "live", string>
  save: string
  saving: string
  saved: string
  mcpOn: string
  mcpNoScript: string
  mcpFailed: string
  failed: string
  errors: Record<string, string>
  loading: string
  loadFailed: string
  howTitle: string
  how: string[]
}

export type PaymentsWords = { stripe: StripeWords; web3ElementNote: string; web3CoreNote: string; notBorn: string }

const UI: Record<"en" | "ru", PaymentsWords> = {
  en: {
    stripe: {
      title: "Stripe keys",
      lead: "Card payments of your node's elements go to your own Stripe account. The keys stay on this computer, in this element only; the page shows only which of them are set.",
      restartNote: "The element reads the keys when it starts: a new key works after its next start; the agent key — in the agent's next session.",
      secretLabel: "Secret key",
      secretHint: "sk_test_… or sk_live_… (a restricted key rk_… works too). Checked with Stripe before it is saved.",
      publishableLabel: "Publishable key",
      publishableHint: "pk_test_… or pk_live_… — the same mode as the secret key.",
      webhookLabel: "Webhook signing secret",
      webhookHint: "whsec_… — the signing secret of the event destination you create on dashboard.stripe.com/webhooks («Reveal secret»).",
      agentLabel: "Agent key (Stripe tools for the agent)",
      agentHint: "rk_test_… or rk_live_…: a restricted key created with «Authorizing agent access to your account», in the same mode as the secret key. It gives this element's agent the Stripe MCP tools; payouts, refunds and account changes made with it wait for a reviewer in Stripe. Checked with Stripe before it is saved.",
      isSet: "set",
      notSet: "not set",
      mode: { test: "Test mode: no real money moves.", live: "Live mode: real payments." },
      save: "Save keys",
      saving: "Checking with Stripe…",
      saved: "Saved. Fields stay empty: the values never come back to the page.",
      mcpOn: "The agent gets the Stripe tools in its next session.",
      mcpNoScript: "This version of the element has no Stripe tools for its agent yet — update the element.",
      mcpFailed: "The agent's Stripe tools were not set up — ask the element's agent to run «npm run mcp:stripe».",
      failed: "Not saved:",
      errors: {
        empty: "fill in at least one key",
        "bad-secret": "the secret key must start with sk_test_, sk_live_, rk_test_ or rk_live_",
        "bad-publishable": "the publishable key must start with pk_test_ or pk_live_",
        "bad-webhook": "the webhook secret must start with whsec_",
        "bad-agent": "the agent key must start with rk_test_ or rk_live_",
        "mode-mismatch": "the secret and publishable keys are from different modes (test and live)",
        "agent-mode-mismatch": "the agent key and the secret key are from different modes (test and live)",
        "key-rejected": "Stripe rejected the secret key",
        "agent-rejected": "Stripe rejected the agent key",
        "probe-failed": "Stripe did not answer — try again in a minute",
        "unknown-target": "this element does not keep Stripe keys",
        "temporary-address": "keys are entered only on this computer or on your own domain, not through a temporary address",
      },
      loading: "Asking which keys are set…",
      loadFailed: "Could not read the keys' state.",
      howTitle: "Where to get the keys",
      how: [
        "On dashboard.stripe.com/apikeys take the publishable and the secret key; start with the test keys of a sandbox.",
        "For payment events open dashboard.stripe.com/webhooks, create an event destination with the address https://stripe.<your domain>/api/stripe-webhook and copy its signing secret.",
        "For this element's agent: on the same API keys page create a restricted key and choose «Authorizing agent access to your account» — Stripe then holds payouts, refunds and account changes for a reviewer.",
        "The other elements of the node take payments through this element's doors: these keys never go to them.",
        "To stop a key, choose «Expire key» for it on the API keys page: it stops working at once.",
      ],
    },
    web3ElementNote: "By default the element works with the node wallet, as with the GitHub token and the OpenAI key; its own wallet takes precedence, and once it is removed the element works with the node wallet again.",
    web3CoreNote: "The same wallet is set in «Passport → Main wallet»: the node's wallet, which every element works with unless it has its own.",
    notBorn: "The element is not born yet: it has no folder to keep keys in.",
  },
  ru: {
    stripe: {
      title: "Ключи Stripe",
      lead: "Оплата картой элементов вашего узла поступает на ваш собственный аккаунт Stripe. Ключи остаются на этом компьютере, только в этом элементе; страница показывает только, какие из них заданы.",
      restartNote: "Элемент читает ключи при запуске: новый ключ действует после его следующего запуска, ключ агента — в следующей сессии агента.",
      secretLabel: "Секретный ключ",
      secretHint: "sk_test_… или sk_live_… (подойдёт и ограниченный ключ rk_…). До сохранения проверяется у Stripe.",
      publishableLabel: "Публикуемый ключ",
      publishableHint: "pk_test_… или pk_live_… — того же режима, что и секретный.",
      webhookLabel: "Секрет подписи вебхука",
      webhookHint: "whsec_… — секрет подписи адреса событий, который вы создаёте на dashboard.stripe.com/webhooks («Reveal secret»).",
      agentLabel: "Ключ агента (инструменты Stripe для агента)",
      agentHint: "rk_test_… или rk_live_…: ограниченный ключ, созданный с отметкой «Authorizing agent access to your account», того же режима, что и секретный. Даёт агенту этого элемента инструменты MCP Stripe; выплаты, возвраты и смена настроек аккаунта, сделанные им, ждут решения проверяющего в Stripe. До сохранения проверяется у Stripe.",
      isSet: "задан",
      notSet: "не задан",
      mode: { test: "Тестовый режим: настоящие деньги не движутся.", live: "Рабочий режим: настоящие платежи." },
      save: "Сохранить ключи",
      saving: "Проверяю у Stripe…",
      saved: "Сохранено. Поля остаются пустыми: значения на страницу не возвращаются никогда.",
      mcpOn: "Инструменты Stripe появятся у агента в его следующей сессии.",
      mcpNoScript: "В этой версии элемента инструментов Stripe для агента ещё нет — обновите элемент.",
      mcpFailed: "Инструменты Stripe для агента не настроены — попросите агента элемента выполнить «npm run mcp:stripe».",
      failed: "Не сохранено:",
      errors: {
        empty: "заполните хотя бы один ключ",
        "bad-secret": "секретный ключ начинается с sk_test_, sk_live_, rk_test_ или rk_live_",
        "bad-publishable": "публикуемый ключ начинается с pk_test_ или pk_live_",
        "bad-webhook": "секрет вебхука начинается с whsec_",
        "bad-agent": "ключ агента начинается с rk_test_ или rk_live_",
        "mode-mismatch": "секретный и публикуемый ключи из разных режимов (test и live)",
        "agent-mode-mismatch": "ключ агента и секретный ключ из разных режимов (test и live)",
        "key-rejected": "Stripe отверг секретный ключ",
        "agent-rejected": "Stripe отверг ключ агента",
        "probe-failed": "Stripe не ответил — попробуйте через минуту",
        "unknown-target": "этот элемент не хранит ключи Stripe",
        "temporary-address": "ключи вводятся только на этом компьютере или на вашем домене, не через временный адрес",
      },
      loading: "Спрашиваю, какие ключи заданы…",
      loadFailed: "Не удалось прочитать состояние ключей.",
      howTitle: "Где взять ключи",
      how: [
        "На dashboard.stripe.com/apikeys возьмите публикуемый и секретный ключи; начните с тестовых ключей песочницы.",
        "Для событий оплаты откройте dashboard.stripe.com/webhooks, создайте адрес событий (event destination) https://stripe.<ваш домен>/api/stripe-webhook и скопируйте его секрет подписи.",
        "Для агента этого элемента: на той же странице API keys создайте ограниченный ключ и выберите «Authorizing agent access to your account» — тогда выплаты, возвраты и смену настроек аккаунта Stripe задерживает до решения проверяющего.",
        "Другие элементы узла принимают оплату через двери этого элемента: эти ключи им не передаются никогда.",
        "Остановить ключ — «Expire key» у него на странице API keys: он перестаёт работать сразу.",
      ],
    },
    web3ElementNote: "По умолчанию элемент работает кошельком узла — так же, как токеном GitHub и ключом OpenAI; свой кошелёк элемента сильнее, а удалив его, элемент снова работает кошельком узла.",
    web3CoreNote: "Тот же кошелёк настраивается в «Паспорт → Главный кошелёк»: кошелёк узла, которым работает каждый элемент, если у него нет своего.",
    notBorn: "Элемент ещё не родился: у него нет папки, где хранить ключи.",
  },
}

export function paymentsUi(lang: string): PaymentsWords {
  return lang === "ru" ? UI.ru : UI.en
}

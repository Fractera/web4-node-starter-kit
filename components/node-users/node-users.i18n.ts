// СЛОВА ВКЛАДКИ «ПОЛЬЗОВАТЕЛИ» ЭЛЕМЕНТА ВХОДА (узел, шаг 559). `en` основа, `ru` перевод. Словарь серверный: страница зовёт
// `nodeUsersUi(lang)` и передаёт островку пропсом, клиент импортирует только тип.

export type NodeUsersUi = {
  loading: string
  forbidden: string
  unreachable: string
  failed: string
  cols: { user: string; email: string; roles: string; orgs: string; methods: string; status: string; created: string; edit: string; select: string; selectPage: string }
  filterOrg: string
  filterRole: string
  any: string
  sortNewest: string
  sortOldest: string
  status: { active: string; blocked: string; anonymized: string }
  methods: Record<string, string>
  guest: string
  noName: string
  anonymizedName: string
  // 559-5: окно правки, истории, пакет
  editTitle: string
  fields: { nickname: string; firstName: string; lastName: string; email: string; avatar: string; roles: string; orgs: string; blocked: string; tracking: string; marketing: string; wallet: string }
  avatarUpload: string
  avatarRemove: string
  avatarUploading: string
  tri: { unset: string; yes: string; no: string }
  trackingHint: string
  newOrg: string
  newOrgAdd: string
  save: string
  cancel: string
  confirm: string
  confirmSaveTitle: string
  confirmSaveText: string
  historyLink: string
  history: { roles: string; methods: string; marketing: string; tracking: string; log: string; messenger: string }
  historyCols: { at: string; who: string; what: string; source: string }
  historyEmpty: string
  messengerEmpty: string
  actions: { block: string; unblock: string; addRole: string; removeRole: string; addOrg: string; removeOrg: string; noMarketing: string; noTracking: string; anonymize: string }
  selected: string
  clear: string
  pickRole: string
  pickOrg: string
  confirmBatchTitle: string
  /** `{action}`, `{n}` */
  confirmBatchText: string
  marketingBatchNote: string
  /** `{done}`, `{skipped}` */
  result: string
  reasons: Record<string, string>
  anonymizeTitle: string
  anonymizeErased: string
  anonymizeKept: string
  /** `{nickname}` */
  anonymizeNickname: string
  anonymizeDo: string
  logActions: Record<string, string>
  walletBad: string
}

const EN: NodeUsersUi = {
  loading: "Loading the users of the node…",
  forbidden: "This table is open to the architect and the administrator.",
  unreachable: "The sign-in element does not answer. Check that it runs (Native elements → Authorization).",
  failed: "The table could not be loaded.",
  cols: { user: "User", email: "Email", roles: "Roles", orgs: "Organizations", methods: "Sign-in", status: "Status", created: "Registered", edit: "Edit", select: "Select", selectPage: "Select the page" },
  filterOrg: "Organization",
  filterRole: "Role",
  any: "All",
  sortNewest: "Newest first",
  sortOldest: "Oldest first",
  status: { active: "Active", blocked: "Blocked", anonymized: "Deleted (anonymized)" },
  methods: { password: "Password", guest: "Guest", google: "Google", "email-link": "Email link" },
  guest: "guest",
  noName: "—",
  anonymizedName: "Deleted user",
  editTitle: "Edit the user",
  fields: { nickname: "Pseudonym", firstName: "First name", lastName: "Last name", email: "Email", avatar: "Avatar", roles: "Roles", orgs: "Organizations", blocked: "Blocked", tracking: "Refused tracking", marketing: "Allowed marketing emails", wallet: "Wallet" },
  avatarUpload: "Upload",
  avatarRemove: "Remove",
  avatarUploading: "Uploading…",
  tri: { unset: "Not stated", yes: "Yes", no: "No" },
  trackingHint: "Recorded with its history. Analytics and mailings of the node will read it; nothing reads it yet.",
  newOrg: "New organization",
  newOrgAdd: "Add",
  save: "Save",
  cancel: "Cancel",
  confirm: "Confirm",
  confirmSaveTitle: "Save the changes?",
  confirmSaveText: "The changes of one user are written at once and land in their history.",
  historyLink: "table",
  history: { roles: "Role history", methods: "Sign-in methods", marketing: "Marketing consent history", tracking: "Tracking history", log: "Log", messenger: "Messenger Web4" },
  historyCols: { at: "When", who: "Who", what: "What", source: "From" },
  historyEmpty: "No records yet.",
  messengerEmpty: "No records yet: they appear when the Web4 messenger pays this user for their contact.",
  actions: { block: "Block", unblock: "Unblock", addRole: "Add a role", removeRole: "Remove a role", addOrg: "Add to an organization", removeOrg: "Remove from an organization", noMarketing: "Refuse marketing emails", noTracking: "Refuse tracking", anonymize: "Delete (anonymize)" },
  selected: "Selected: {n}",
  clear: "Clear",
  pickRole: "Role",
  pickOrg: "Organization",
  confirmBatchTitle: "Apply to the selected users?",
  confirmBatchText: "«{action}» for {n} users — one request, written at once.",
  marketingBatchNote: "Consent to marketing is given by the person; it is set one user at a time in their card.",
  result: "Done: {done}. Skipped: {skipped}.",
  reasons: { self: "your own account", "only-architect": "only an architect may change an architect", already: "already so", "last-role": "the last role cannot be removed", anonymized: "already deleted", "not-found": "not found", "bad-wallet": "the wallet is not an address 0x…", "bad-email": "the email is not valid", "email-taken": "the email belongs to another user", "bad-roles": "unknown role", "unknown-org": "unknown organization" },
  anonymizeTitle: "Delete by anonymizing?",
  anonymizeErased: "Erased: first and last name, avatar and its file, password, Google link and sign-in methods, email (replaced by a service address), wallet. The person can no longer sign in.",
  anonymizeKept: "Kept: the identifier, the pseudonym, the log and the histories of roles, organizations and consents.",
  anonymizeNickname: "The pseudonym «{nickname}» stays. If it is a real name (Google puts the name there), change it before deleting.",
  anonymizeDo: "Delete",
  logActions: { created: "created", signed_in: "signed in", roles_changed: "roles changed", blocked: "blocked", unblocked: "unblocked", anonymized: "anonymized", profile_changed: "profile changed", method_linked: "sign-in method linked", org_added: "added to an organization", org_removed: "removed from an organization", consent_changed: "consent changed", messenger_contact: "Messenger contact" },
  walletBad: "An address 0x followed by 40 hex characters.",
}

const RU: NodeUsersUi = {
  loading: "Загружаю пользователей узла…",
  forbidden: "Эта таблица открыта архитектору и администратору.",
  unreachable: "Элемент входа не отвечает. Проверьте, что он запущен (Нативные элементы → Авторизация).",
  failed: "Таблицу загрузить не удалось.",
  cols: { user: "Пользователь", email: "Email", roles: "Роли", orgs: "Организации", methods: "Способ входа", status: "Статус", created: "Регистрация", edit: "Править", select: "Выбрать", selectPage: "Выбрать страницу" },
  filterOrg: "Организация",
  filterRole: "Роль",
  any: "Все",
  sortNewest: "Сначала новые",
  sortOldest: "Сначала старые",
  status: { active: "Активен", blocked: "Заблокирован", anonymized: "Удалён (обезличен)" },
  methods: { password: "Пароль", guest: "Гость", google: "Google", "email-link": "Ссылка в письме" },
  guest: "гость",
  noName: "—",
  anonymizedName: "Удалённый пользователь",
  editTitle: "Правка пользователя",
  fields: { nickname: "Псевдоним", firstName: "Имя", lastName: "Фамилия", email: "Email", avatar: "Аватарка", roles: "Роли", orgs: "Организации", blocked: "Заблокирован", tracking: "Запретил отслеживание", marketing: "Разрешил маркетинговые рассылки", wallet: "Кошелёк" },
  avatarUpload: "Загрузить",
  avatarRemove: "Убрать",
  avatarUploading: "Загружаю…",
  tri: { unset: "Не указано", yes: "Да", no: "Нет" },
  trackingHint: "Записывается с историей. Читать отметку будут аналитика и рассылки узла; сейчас её не читает никто.",
  newOrg: "Новая организация",
  newOrgAdd: "Добавить",
  save: "Сохранить",
  cancel: "Отмена",
  confirm: "Подтвердить",
  confirmSaveTitle: "Сохранить изменения?",
  confirmSaveText: "Изменения одного пользователя записываются сразу и попадают в его историю.",
  historyLink: "таблица",
  history: { roles: "История ролей", methods: "Способы входа", marketing: "История согласий на рассылки", tracking: "История отслеживания", log: "Журнал", messenger: "Messenger Web4" },
  historyCols: { at: "Когда", who: "Кто", what: "Что", source: "Откуда" },
  historyEmpty: "Записей пока нет.",
  messengerEmpty: "Записей пока нет: они появятся, когда мессенджер Web4 заплатит этому человеку за контакт.",
  actions: { block: "Заблокировать", unblock: "Разблокировать", addRole: "Добавить роль", removeRole: "Снять роль", addOrg: "Добавить в организацию", removeOrg: "Убрать из организации", noMarketing: "Запретить рассылки", noTracking: "Запретить отслеживание", anonymize: "Удалить (обезличить)" },
  selected: "Выбрано: {n}",
  clear: "Снять выбор",
  pickRole: "Роль",
  pickOrg: "Организация",
  confirmBatchTitle: "Применить к выбранным?",
  confirmBatchText: "«{action}» для {n} пользователей — одним запросом, запишется сразу.",
  marketingBatchNote: "Согласие на рассылки даёт сам человек — его ставят по одному, в карточке пользователя.",
  result: "Сделано: {done}. Пропущено: {skipped}.",
  reasons: { self: "своя учётная запись", "only-architect": "запись архитектора меняет только архитектор", already: "уже так", "last-role": "последнюю роль снять нельзя", anonymized: "уже удалён", "not-found": "не найден", "bad-wallet": "кошелёк — не адрес 0x…", "bad-email": "неверный email", "email-taken": "email занят другим пользователем", "bad-roles": "неизвестная роль", "unknown-org": "неизвестная организация" },
  anonymizeTitle: "Удалить обезличиванием?",
  anonymizeErased: "Стираются: имя и фамилия, аватарка и её файл, пароль, связь с Google и способы входа, email (заменяется служебным), кошелёк. Войти человек больше не сможет.",
  anonymizeKept: "Остаются: идентификатор, псевдоним, журнал, истории ролей, организаций и согласий.",
  anonymizeNickname: "Псевдоним «{nickname}» останется. Если это настоящее имя (Google кладёт туда имя), замените его до удаления.",
  anonymizeDo: "Удалить",
  logActions: { created: "создан", signed_in: "вход", roles_changed: "роли изменены", blocked: "заблокирован", unblocked: "разблокирован", anonymized: "обезличен", profile_changed: "профиль изменён", method_linked: "привязан способ входа", org_added: "добавлен в организацию", org_removed: "убран из организации", consent_changed: "согласие изменено", messenger_contact: "контакт Messenger" },
  walletBad: "Адрес 0x и 40 шестнадцатеричных знаков.",
}

export function nodeUsersUi(lang: string): NodeUsersUi {
  return lang === "ru" ? RU : EN
}

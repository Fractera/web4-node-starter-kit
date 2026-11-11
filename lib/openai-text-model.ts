import "server-only"

// МОДЕЛЬ ТЕКСТА OPENAI ДЛЯ НОВОГО КОДА ЯДРА (722-4). Закон `use-ai-generation` §2.2: модель — НАСТРОЙКА человека (`OPENAI_TEXT_MODEL`,
// страница Telegram архитектора), не строка в вызове. Пустая настройка — то же умолчание, что у двенадцати старых файлов
// (`?? "gpt-4o-mini"`, долг, описанный в навыке): здесь оно названо ОДИН раз, и новый код берёт его отсюда.
export function textModelId(): string {
  return process.env.OPENAI_TEXT_MODEL?.trim() || "gpt-4o-mini"
}

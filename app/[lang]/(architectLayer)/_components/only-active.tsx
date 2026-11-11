// ФЛАЖОК АРХИТЕКТОРА «ТОЛЬКО РАБОТАЮЩИЕ» (722-2). Слово владельца 2026-11-11: «для пользователя который находится в режиме архитектора
// нам нужно сделать переключатель CheckBox рядом с поиском показывать только активные элементы или все. Обычно пользователи мы этот
// переключатель не показываем и показываем всегда все элементы»; «активный — процесс работает».
// 🔒 ЧИСТЫЙ CSS, БЕЗ JAVASCRIPT: отмеченный флажок прячет в меню каждую строку, чьё `data-state` не `running` — и серверные деревья, и
// строки, пришедшие порциями. По умолчанию снят: видны все. Живёт только в меню слоя архитектора — у посетителей его нет.
export function OnlyActive({ label }: { label: string }) {
  return (
    <label data-block="only-active" className="flex cursor-pointer items-center gap-2 px-[9px] py-1 text-[length:var(--fs-small)] text-muted-foreground hover:text-foreground">
      <input type="checkbox" data-only-active className="size-3.5 accent-primary" />
      <span>{label}</span>
      <style>{'[data-workspace-menu] ul:has(input[data-only-active]:checked) li[data-state]:not([data-state="running"]){display:none}'}</style>
    </label>
  )
}

// ТОЧКА СОСТОЯНИЯ ЭЛЕМЕНТА В МЕНЮ (722-2). Владелец 2026-11-11: «текущее состояние спит или активная?»; «активный — процесс работает».
// Серверная, без JavaScript; цвет — токеном темы: работает — `success`, спит — `warning` (проснётся сам при обращении), выключен — 
// `destructive` (722-9, владелец: «для неработающих элементов индикатор будет красный?»), черновик — пустой кружок.
// Слово состояния — подсказкой и для экранного диктора (`label` приходит переведённым с сервера).
const TONE = {
  running: 'bg-success',
  asleep: 'bg-warning',
  off: 'bg-destructive',
  draft: 'border border-muted-foreground/60 bg-transparent',
} as const

export type MenuStateKind = keyof typeof TONE

export function StateDot({ state }: { state?: { kind: MenuStateKind; label: string } }) {
  if (!state) return null
  return (
    <span
      data-block="menu-state-dot"
      data-state-dot={state.kind}
      role="img"
      aria-label={state.label}
      title={state.label}
      className={`inline-block size-2 shrink-0 rounded-full ${TONE[state.kind]}`}
    />
  )
}

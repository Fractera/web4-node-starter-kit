import type { SectionRenderer } from '@/sections/contract'
import { AppMode } from '@/components/app-mode/app-mode.client'
import { appModeUi } from '@/components/app-mode/app-mode.i18n'
import { appDialogUi } from '@/components/dialog/app-dialog.i18n'

// 782-1: «РЕЖИМ РАБОТЫ ПРИЛОЖЕНИЯ» — первая карточка «Паспорта» ядра. Слова и слова окна — на сервере, тип узла спрашивает островок
// у `/api/node/type` (страница предрендерена; число о машине в неё не запекается). Правила владельца — в карточке `appMode.md`.
export const appMode: SectionRenderer<'appMode'> = (b, { key: k }) => (
  <AppMode key={k} lang={b.lang} words={appModeUi(b.lang)} dialogUi={appDialogUi(b.lang)} />
)

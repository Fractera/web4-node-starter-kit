import { appDialogUi } from "@/components/dialog/app-dialog.i18n"
import { fieldsUi } from "./config/fields.i18n"
import { groupsUi } from "./config/groups.i18n"
import { siteSettingsWords } from "./config/site-settings.i18n"
import { searchLanguagesWords } from "./config/search-languages.i18n"
import { siteSettingsEditorWords } from "./editors/editor-words.i18n"

// СЛОВА ВКЛАДКИ «НАСТРОЙКИ САЙТА» (узел, шаг 712-4) — выбираются на сервере страницы и уходят островкам пропсами, как у страниц
// элемента: словари обоих языков в браузер не грузятся.
export function siteRemoteWords(lang: string) {
  return {
    fields: fieldsUi(lang),
    groups: groupsUi(lang),
    site: siteSettingsWords(lang),
    search: searchLanguagesWords(lang),
    editors: siteSettingsEditorWords(lang),
    dialog: appDialogUi(lang),
  }
}

export type SiteRemoteWords = ReturnType<typeof siteRemoteWords>

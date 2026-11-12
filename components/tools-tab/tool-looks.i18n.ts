import type { FactDraftLabels } from "@/_tools/fact-draft/client/fact-draft.client"
import type { CropperLabels } from "@/_tools/image-crop/client/image-cropper.client"
import type { SocialsAiUi } from "@/_tools/socials-ai/client/socials-ai-dialog.client"
import type { TrimmerLabels } from "@/_tools/video-trim/client/video-trimmer.client"
import type { TranslatableField } from "@/_tools/translations-dialog/client/use-translations"

// THE SAMPLE WORDS OF THE TOOLS' LOOKS (node step 725-8, the owner 2026-11-12: «показывается только визуально. Без возможности его
// полного использования … если не требует то показываем то что он умеет»). Every tool opens on these samples; nothing is saved.

export type ToolLooksWords = {
  blockAddress: string
  factDraft: FactDraftLabels
  cropper: CropperLabels
  socials: SocialsAiUi
  trimmer: TrimmerLabels
  trimmerName: string
  fields: TranslatableField[]
  voicePlaceholder: string
  shellNote: string
  terminalNote: string
}

const EN: ToolLooksWords = {
  blockAddress: "/en/about · hero",
  factDraft: {
    title: "Describe the fact in your own words",
    hint: "The tool turns free words into a filled record: a machine name, a human title, the shape of the value.",
    placeholder: "For example: the opening hours of the studio, every weekday from ten to six…",
    submit: "Fill in",
    submitting: "Filling in…",
    failures: { "no-key": "The OpenAI key is needed for this.", "too-short": "Say a little more.", "model-silent": "The model did not answer.", "not-understood": "The model did not understand." },
    notesPrefix: "The model assumed:",
  },
  cropper: { title: "Crop the image", scale: "Scale", cancel: "Cancel", apply: "Apply" },
  socials: {
    open: "Find profiles by a phrase", title: "Social profiles from a phrase", description: "Write a company name, a nickname or a line about yourself.",
    phraseLabel: "Phrase", phrasePlaceholder: "Fractera, the node of your own agents", recognize: "Recognise", recognizing: "Recognising…",
    proposalTitle: "Proposed profiles", valueLabel: "Value", ownValue: "My own value", add: "Add", outcomeExists: "found",
    outcomeAbsent: "not found", outcomeClosed: "the network does not answer outsiders", noKey: "The OpenAI key is needed for this.",
    unknownNetwork: "Unknown network", modelFailed: "The model did not answer.", cancel: "Cancel",
  },
  trimmer: {
    title: "Trim the video", start: "Start", end: "End", keeping: "Keeping {kept} of {total}", lossless: "Cut without re-encoding",
    previewMiddle: "Preview the middle", keepWhole: "Keep whole", apply: "Trim", reading: "Reading the video…", tooShort: "Too short", done: "Done",
  },
  trimmerName: "sample.mp4",
  fields: [
    { key: "title", label: "Title", value: "Ceramics studio by the sea" },
    { key: "about", label: "About", value: "We fire porcelain in a wood kiln and teach the craft on weekends.", multiline: true },
  ],
  voicePlaceholder: "Hold the microphone and speak — the words land where the cursor stands.",
  shellNote: "This is the header and the footer the core draws for this site — one copy for every element.",
  terminalNote: "The terminal opens beside the list — the same drawer that «Edit» and «Add a tool» use.",
}

const RU: ToolLooksWords = {
  blockAddress: "/ru/about · hero",
  factDraft: {
    title: "Опишите факт своими словами",
    hint: "Инструмент превращает свободные слова в заполненную запись: машинное имя, название для человека, форму значения.",
    placeholder: "Например: часы работы студии, по будням с десяти до шести…",
    submit: "Заполнить",
    submitting: "Заполняю…",
    failures: { "no-key": "Для этого нужен ключ OpenAI.", "too-short": "Скажите чуть больше.", "model-silent": "Модель не ответила.", "not-understood": "Модель не поняла." },
    notesPrefix: "Модель предположила:",
  },
  cropper: { title: "Обрезка изображения", scale: "Масштаб", cancel: "Отмена", apply: "Применить" },
  socials: {
    open: "Найти профили по фразе", title: "Соцсети из фразы", description: "Напишите название компании, псевдоним или строку о себе.",
    phraseLabel: "Фраза", phrasePlaceholder: "Fractera, узел своих агентов", recognize: "Распознать", recognizing: "Распознаю…",
    proposalTitle: "Предложенные профили", valueLabel: "Значение", ownValue: "Своё значение", add: "Добавить", outcomeExists: "найден",
    outcomeAbsent: "не найден", outcomeClosed: "сеть не отвечает посторонним", noKey: "Для этого нужен ключ OpenAI.",
    unknownNetwork: "Неизвестная сеть", modelFailed: "Модель не ответила.", cancel: "Отмена",
  },
  trimmer: {
    title: "Обрезка видео", start: "Начало", end: "Конец", keeping: "Остаётся {kept} из {total}", lossless: "Резать без перекодирования",
    previewMiddle: "Посмотреть середину", keepWhole: "Оставить целиком", apply: "Обрезать", reading: "Читаю видео…", tooShort: "Слишком коротко", done: "Готово",
  },
  trimmerName: "пример.mp4",
  fields: [
    { key: "title", label: "Название", value: "Керамическая студия у моря" },
    { key: "about", label: "О нас", value: "Обжигаем фарфор в дровяной печи и учим ремеслу по выходным.", multiline: true },
  ],
  voicePlaceholder: "Удерживайте микрофон и говорите — слова встанут туда, где стоит курсор.",
  shellNote: "Это шапка и подвал, которые ядро рисует для этого сайта, — одна копия на все элементы.",
  terminalNote: "Терминал открывается рядом со списком — тот же ящик, что у «Редактировать» и «Добавить инструмент».",
}

export function toolLooksUi(lang: string): ToolLooksWords {
  return lang === "ru" ? RU : EN
}

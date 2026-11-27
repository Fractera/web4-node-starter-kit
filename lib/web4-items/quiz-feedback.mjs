// THE TEAM'S RESULTS FOR AN ELEMENT'S PRODUCT QUIZ (core step 852-4; Roma 2026-11-24: «Загрузить результаты команды: файл (размеченный
// PDF, Markdown, JSON или фото страниц) и комментарий … агент разбирает их по номерам дерева … предлагает следующую версию»).
//
// The file lands in the element's OWN data folder (data/services/<id>/quiz-feedback/<UTC stamp>/), never in its code or git: the core
// does not write into an element. The door then wakes the core's main agent (only agents talk to agents), which gives the element's agent
// the task of mapping every remark to the tree's numbers. Pure checks here; the door does the writing.

export const MAX_BYTES = 10 * 1024 * 1024
export const KINDS = { pdf: 'application/pdf', md: 'text/markdown', txt: 'text/plain', json: 'application/json', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp' }

/** A file name safe on every system: letters and digits of any script, dot, dash, underscore; its extension kept; at most 80 characters. */
export function safeName(name) {
  const raw = String(name ?? '').split(/[\\/]/).pop() ?? ''
  const dot = raw.lastIndexOf('.')
  const ext = dot > 0 ? raw.slice(dot + 1).toLowerCase() : ''
  const base = (dot > 0 ? raw.slice(0, dot) : raw).normalize('NFC').replace(/[^\p{L}\p{N}_.-]+/gu, '-').replace(/^[-.]+|[-.]+$/g, '').slice(0, 70) || 'results'
  return ext ? `${base}.${ext}` : base
}

/** The upload, or `{ ok: false, error }` with the kind of refusal. */
export function checkUpload({ name, size, comment }) {
  const file = safeName(name)
  const ext = file.includes('.') ? file.split('.').pop() : ''
  if (!KINDS[ext]) return { ok: false, error: 'bad-kind' }
  if (!Number.isFinite(size) || size <= 0) return { ok: false, error: 'empty' }
  if (size > MAX_BYTES) return { ok: false, error: 'too-big' }
  const words = String(comment ?? '').trim()
  if (words.length > 2000) return { ok: false, error: 'bad-comment' }
  return { ok: true, value: { file, comment: words } }
}

/** The folder name of one upload: its UTC moment, sortable. */
export const stampOf = (at = new Date()) => at.toISOString().replace(/[:.]/g, '-').slice(0, 19) + 'Z'

/** The main agent's task line: who, where, what to do — the element's agent maps the remarks to the tree's numbers. */
export function mainAgentText({ id, rel, comment }) {
  return [
    `The architect uploaded the team's results for the product quiz of element «${id}» on its quiz page (core step 852-4): ${rel}${comment ? ` — their comment: «${comment}»` : ''}.`,
    `Give its agent the task (npm run task -- ${id} "…"): read that file in its own data folder, map every remark to the numbers of its quiz tree — add / change / remove, each with its source in the file — and propose the next version of the quiz to the person as a list of edits by number; build the version only after the person's yes (skill product-quiz). Then tell the architect in one line that the element is on it.`,
  ].join('\n')
}

// 861-1 (Roma 2026-11-27, Telegram 1467: «через страницу работы с Quiz я добавляю задание и не вижу его ожидания, не понимаю как работать
// дальше»): the person's wish for the quiz, written on its page, reaches the element's agent through the main agent (law 636) and is kept
// beside the team's results; the page then shows where the conversation goes on — the element's chat.
export const MAX_WISH = 4000

/** The wish, or `{ ok: false, error }`: empty words are refused; a wish longer than MAX_WISH is refused, never cut. */
export function checkWish(text) {
  const words = String(text ?? '').trim()
  if (!words) return { ok: false, error: 'empty' }
  if (words.length > MAX_WISH) return { ok: false, error: 'too-long' }
  return { ok: true, value: words }
}

/** The main agent's task line for a wish: the element's agent continues its quiz with these words, in its own conversation and chat. */
export function wishAgentText({ id, rel, text }) {
  return [
    `The architect added a wish to the product quiz of element «${id}» on its quiz page (core step 861-1), kept in ${rel}:`,
    `«${text}»`,
    `Give its agent the task now (npm run task -- ${id} "…"), with the wish verbatim: this is the next turn of its product quiz — take the wish into the quiz tree by its numbers (add / change / remove, each named), say what changed and ask the next question in its chat with the person (its Telegram bot when it has one). The person was told on the page that the agent continues in the chat.`,
  ].join('\n')
}

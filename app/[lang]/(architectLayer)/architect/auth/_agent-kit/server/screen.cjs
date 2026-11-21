// ЧТО СТОИТ НА ЭКРАНЕ ТЕРМИНАЛА — по потоку, который напечатала сессия (вынесено из `bridge.cjs`, шаг 829, чтобы проверяться отдельно).
//
// Признаки — из строк самой программы `claude.exe` (2026-10-07): у диалога разрешения вопрос «Do you want to …» и вариант «No, and tell
// Claude what to do differently»; «Yes, and don't ask again for» — у большинства; у вопроса доверия папке — «Is this a project you
// created or one you trust?» и «Yes, I trust this folder»; у прочих диалогов Claude Code — «Enter to confirm · Esc to cancel».
// 🛑 Ink рисует пробелы сдвигом курсора (`ESC[nC`): он заменяется пробелом до снятия управляющих последовательностей.
//
// 🔒 829 (✗ 2026-11-21 16:25–16:27, элемент j58fl: первое «Привет как дела» в бот нового элемента до агента не дошло): поток хранит всё
// напечатанное, а Claude Code без дела печатает мало — после того как узел ответил на вопрос доверия папке, слова диалога 120 с стояли
// в последних 4000 знаках, «вопрос на экране» отвечал «да», и вставка сдалась. Claude Code сам записывает доверие (`.claude.json`,
// `projects[<папка>].hasTrustDialogAccepted`): записано — диалога на экране быть не может, и поток читается только с той минуты, когда
// на него ответили (`trustEnterAt` — Enter узла; ответил человек сам — первое чтение, которое увидело запись).

const plainScreen = (raw) => String(raw)
  .replace(/\x1b\[\d*C/g, ' ')
  .replace(/\x1b\[[0-9;?]*[ -\/]*[@-~]/g, '')
  .replace(/\x1b\][^\x07\x1b]*(?:\x07|\x1b\\)/g, '')
  .replace(/\x1b[()][0-9A-Za-z]/g, '')
  .replace(/\s+/g, ' ')

/** 547: стоит ли на экране вопрос доверия папке Claude Code («Is this a project you created or one you trust?»). */
function trustOnScreen(stream) {
  const tail = plainScreen(String(stream).slice(-4000)).replace(/\s+/g, '')
  return /Isthisaprojectyoucreatedoroneyoutrust/i.test(tail) && /Yes,Itrustthisfolder/i.test(tail)
}

/** Висит ли на хвосте экрана вопрос-разрешение Claude Code. */
function promptOnScreen(stream) {
  const tail = plainScreen(String(stream).slice(-4000))
  return /Do you want to /.test(tail) && /(tell Claude what to do differently|Yes, and don't ask again|1\. ?Yes)/.test(tail)
}

/**
 * 636-7: стоит ли на экране ЛЮБОЙ вопрос — разрешение, доверие папке или диалог самого Claude Code с вариантами («Enter to confirm ·
 * Esc to cancel»). ✗ 2026-11-03 19:18: вставка узла ушла в диалог «Teach auto mode…», Enter выбрал «Yes», слова пропали.
 */
function questionOnScreen(stream) {
  if (promptOnScreen(stream) || trustOnScreen(stream)) return true
  const tail = plainScreen(String(stream).slice(-3000))
  return /Enter to confirm/.test(tail) && /Esc to (cancel|exit|go back)/.test(tail)
}

/** The words of the question on the screen, one short line — for the main agent, never a guess. */
function questionLine(stream) {
  const tail = plainScreen(String(stream).slice(-3000))
  const m = /(Do you want to [^?]{0,160}\?|Is this a project you created or one you trust\?|[^.?!]{0,120}Enter to confirm)/.exec(tail)
  return (m ? m[1] : tail.slice(-160)).trim()
}

/** How much the session has printed — `seen` keeps moving after the 256 KB buffer is full (728). */
const seenOf = (s) => (typeof s.seen === 'number' ? s.seen : String(s.buffer).length)

/**
 * 829: the stream a question is looked for in. While the trust dialog's words are in the tail and `trusted()` (Claude Code's own record
 * of the folder) says yes, the cut is fixed once: the node's Enter on the dialog (`s.trustEnterAt`), else this very read. After it only
 * what was printed since counts. `trusted()` is asked only while the dialog's words are in the tail and no cut is fixed.
 */
function liveStream(s, trusted) {
  const buffer = String(s.buffer ?? '')
  if (typeof s.trustCut !== 'number' && trustOnScreen(buffer) && trusted() === true) {
    s.trustCut = typeof s.trustEnterAt === 'number' && s.trustEnterAt <= seenOf(s) ? s.trustEnterAt : seenOf(s)
  }
  if (typeof s.trustCut !== 'number') return buffer
  const after = seenOf(s) - s.trustCut
  return after <= 0 ? '' : buffer.slice(-Math.min(after, buffer.length))
}

module.exports = { plainScreen, trustOnScreen, promptOnScreen, questionOnScreen, questionLine, liveStream, seenOf }

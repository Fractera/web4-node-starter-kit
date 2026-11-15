# Critical error, 2026-11-15: two README sections for people were put into the part the installing agent reads

**Status: critical** — the owner's word. Fixed in `cc56ebc2` the same hour; step 754 re-closed.

## The owner, verbatim (read before 18:08 UTC)
«… я тебя просил обновить информацию о том что у нас проект может работать на сервере и ещё что-то там в видимой для человека зоне. Какого
черта ты взял и разместил это в той части которые предназначено не для человека а для агента который берет и читает этот файл только один
раз для того чтобы сделать установку … ты сейчас мало того что людям не показал то что нужно показать так ты ещё и блок для установки
испортил? Ты вообще что ли не понимаешь зачем у нас файл читай меня? Я в шоке исправить. Статус критическая ошибка».

## What happened
Step 754 (`39f152c4`) added three sections to the README. The first, «What a node and an element are», went under the badges — right.
The other two, «Launch your own server whenever you want» and «Updates and rollbacks», went after «Put it on the internet — and what that
address costs», inside the part that begins with «How to install» — the part the installing agent reads once, top to bottom, to install the
node. People do not read that far for what the product can do; the agent got two sections that are not instructions for it.

## Why
I placed the text by topic — next to the section about the temporary address — and never asked who reads that part of the file. The
README has two readers and a boundary between them: above «How to install» — people (what Fractera is and can do); from «How to install»
down — the installing agent. Nothing in the file marks the boundary, and I did not look for it.

## The fix and its proof
`cc56ebc2`: both sections moved to the part people read, after «It runs on your computer as a real server». Proven on the README GitHub
serves: the part from «How to install» to the end is byte for byte the README before 754 (`5aabc485`); without the three new sections the
whole README equals that version; the three headings stand above «How to install» (#1, #6, #7 of 9). The core's chain green; the fork
synced. The owner's Mac had not updated yet — his publication carries the fix.

## So it does not come back
- My memory: a README edit is placed by its reader, never by its topic; a change for people never touches the part from «How to install»
  down, and is proven so (the agent's part byte-identical).
- Proposed to the owner, not built: an invisible marker line in the README at the boundary, so every agent sees it.

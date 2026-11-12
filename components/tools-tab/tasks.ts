// THE TASKS THE «TOOLS» TAB GIVES AN AGENT (node step 725-8). English, as every task to an agent; the person's words go inside quotes.
// `place` — «core» for the main agent's own tools, «element» for an element's.

export function createTask(place: "core" | "element", words: string): string {
  const where = place === "core" ? "a new tool of the core in `_tools/<id>/`" : "a new tool of this element in `_tools/tool-<id>/`"
  return [
    `Build process: create ${where}, from the person's words: «${words.trim()}».`,
    "First ask parts_find (or npm run parts -- <words>) whether a ready part already does it — then extend that one instead of building a second.",
    "The tool gets its card tool.json (title, what, how, value in en and ru, needs, words in en and ru), npm run build:tools-map and npm run build:parts-map;",
    "prove it by eyes and by a test, then report what was built and where it can be used.",
  ].join(" ")
}

export function editTask(place: "core" | "element", title: string, dir: string): string {
  const own = place === "core" ? "of the core" : "of this element"
  return `Build process: improve the tool «${title}» ${own} (\`${dir}/\`) — keep its card tool.json true and rebuild the maps (npm run build:tools-map, npm run build:parts-map). What to change: `
}

/** 733-8: the core's tool into an element — a task for that element's agent, copied by the person and pasted into its terminal. */
export function takeTask(id: string, title: string): string {
  return `Build process: take the core's tool «${title}» into this element: npm run tool:take -- ${id} (first with --dry to see what comes). Use the copy as it is — its body is never edited; commit what was written and report where it will be used.`
}

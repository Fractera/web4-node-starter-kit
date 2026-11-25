// @local — the tree of one element's product quiz on its quiz page (852-2); the element's own `npm run quiz:tree` prints the same in text
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Small } from "@/components/ui/typography"
import type { ProductQuiz, QuizTreeMark, QuizTreeNode } from "@/lib/web4-items/product-quiz"

// ДЕРЕВО ПРОДУКТОВОГО КВИЗА (шаг 852-2; Рома 2026-11-24: «всё дерево с номерами и отметками, текущая глубина и F, номер и дата версии»).
// Квиз проходят в ширину: уровень 1 — модули продукта, потом каждая ветвь до следующего уровня. Номер — по месту (1, 1.2, 2.3.4), чтобы
// человек правил по номеру: «для 2.3.4 добавить …». Знак — кто заполнил: ✓ человек, ◇ агент, ○ открыто. Только чтение: квиз меняет агент.

export type QuizTreeWords = {
  title: string
  lead: string
  empty: string
  meta: string
  level: string
  marks: Record<QuizTreeMark, string>
}

const SIGN: Record<QuizTreeMark, string> = { answered: "✓", agent: "◇", open: "○" }
const TONE: Record<QuizTreeMark, string> = { answered: "text-foreground", agent: "text-muted-foreground", open: "text-muted-foreground" }

const fill = (t: string, v: Record<string, string | number>) => t.replace(/\{(\w+)\}/g, (_, k: string) => String(v[k] ?? ""))

function levels(tree: QuizTreeNode[], depth = 1, out: Record<number, Record<QuizTreeMark | "nodes", number>> = {}) {
  for (const n of tree) {
    const c = (out[depth] ??= { nodes: 0, answered: 0, agent: 0, open: 0 })
    c.nodes += 1
    c[n.mark] += 1
    levels(n.children, depth + 1, out)
  }
  return out
}

function Branch({ nodes, words, root = false }: { nodes: QuizTreeNode[]; words: QuizTreeWords; root?: boolean }) {
  return (
    <ul className={root ? "flex flex-col gap-2" : "flex flex-col gap-1 border-l border-border pl-4"} data-block="quiz-tree-branch">
      {nodes.map((n) => (
        <li key={n.n} className="flex flex-col gap-1" data-quiz-node={n.n} data-quiz-mark={n.mark}>
          <div className={`flex items-baseline gap-2 ${TONE[n.mark]}`}>
            <span className="w-4 shrink-0 text-center" aria-label={words.marks[n.mark]}>{SIGN[n.mark]}</span>
            <span className="shrink-0 font-mono text-[length:var(--fs-small)] tabular-nums text-muted-foreground">{n.n}</span>
            <span className={n.mark === "answered" ? "font-medium" : ""}>{n.title}</span>
          </div>
          {n.a && <Small className="pl-6 text-muted-foreground">{n.a}</Small>}
          {n.children.length > 0 && <div className="pl-2"><Branch nodes={n.children} words={words} /></div>}
        </li>
      ))}
    </ul>
  )
}

export function QuizTree({ quiz, words }: { quiz: ProductQuiz; words: QuizTreeWords }) {
  const per = levels(quiz.tree)
  return (
    <Card data-block="quiz-tree" data-quiz-tree={quiz.tree.length ? "filled" : "empty"}>
      <CardHeader>
        <CardTitle>{words.title}</CardTitle>
        <CardDescription>{words.lead}</CardDescription>
        <Small className="text-muted-foreground tabular-nums" data-quiz-tree-meta>
          {fill(words.meta, { depth: quiz.depth, freedom: quiz.freedom, version: quiz.version ? `${quiz.version.n}${quiz.version.date ? ` · ${quiz.version.date}` : ""}` : "—" })}
        </Small>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {quiz.tree.length === 0 ? <Small className="text-muted-foreground">{words.empty}</Small> : <Branch nodes={quiz.tree} words={words} root />}
        {quiz.tree.length > 0 && (
          <div className="flex flex-wrap gap-2" data-quiz-tree-levels>
            {Object.keys(per).map(Number).sort((a, b) => a - b).map((l) => (
              <Badge key={l} variant="outline" className="tabular-nums">
                {fill(words.level, { level: l, nodes: per[l].nodes })} · ✓ {per[l].answered} · ◇ {per[l].agent} · ○ {per[l].open}
              </Badge>
            ))}
          </div>
        )}
        <ul className="flex flex-wrap gap-x-4 gap-y-1" data-quiz-tree-legend>
          {(["answered", "agent", "open"] as const).map((m) => <li key={m}><Small className="text-muted-foreground">{SIGN[m]} {words.marks[m]}</Small></li>)}
        </ul>
      </CardContent>
    </Card>
  )
}

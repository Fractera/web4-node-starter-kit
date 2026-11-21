// @local — the frame of one element's agent pages for its own admin (node step 834-4): no node menu, no panel chrome, never indexed
import type { Metadata } from "next"

// AN ELEMENT'S AGENT, SEEN BY ITS OWN ADMIN (834-4). The owner, Telegram 641/644: the element's admin manages its agent — Claude
// subscription, terminal, Telegram bot, OpenAI key — from the element's own menu. The node's panel shows every element of the node; an
// app of its own has another owner, so its admin gets this frame instead: one element, four pages, nothing else of the node.
// 🔒 The lock is the page's (`AccessGate` with `lib/auth/element-agent-roles.cjs`) and every door the widgets call asks the same roles.
export const metadata: Metadata = { robots: { index: false, follow: false } }

export default function ElementAgentLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

// @local — where each tool of the architect panel works live: its page under an element, `/<lang>/<element>/<path>` (733-8b-3)

// 733-8b-3: a panel tool lives on the node's own data (a design, a passport, a wallet), so its look never copies live data into a window —
// it names the page where it works and, in an element's own Tools tab, links there. The paths are the element menu's own
// (`lib/web4-items/item-tree.ts`); a moved page moves here too.
export const LIVES_AT: Record<string, string> = {
  "core-terminal": "build/terminal",
  "terminal-paste": "build/terminal",
  "design-colors": "build/design",
  "design-fonts": "build/design",
  "design-shape": "build/design",
  "design-type": "build/design",
  "remote-settings": "build/site-settings",
  "shell-kit": "build/site-settings",
  "environment-panel": "build/environment",
  "block-task": "build/deployments",
  "tools-tab": "build/tools",
  "demo": "build/tools",
  "looks": "build/tools",
  "element-doc": "build/documents/instruction",
  "passport-door": "build/documents/passport",
  "element-orders": "workflow/a2a-orders",
  "element-preview": "preview",
  "node-wallet": "dashboard",
  "product-quiz": "product-design/quiz",
  "terminal-drawer": "product-design/quiz",
  "reverse-engineering": "product-design/reverse-engineering",
}

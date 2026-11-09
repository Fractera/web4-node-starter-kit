# Hidden until Lagrix launches (node step 706-8)

The owner, 2026-11-09: «на вкладке строй, платежи есть платёж web3 также комментируй его до появления Lagrix». The main agent's Web3
payment page is kept here as `_hidden-until-lagrix-web3`: a folder starting with `_` is not a route in Next. To bring it back, rename it
to `web3`, uncomment its entry in `lib/web4-items/item-tree.ts` (section `settings` → `payments`), restore the Web3 line of the section's
`about` and drop its `MOVED_PAGES` entry — `check:main-agent-menu` holds both halves together.

import type { PageItem } from '@/lib/content/sections/types'
import { getPostBodyUi } from '@/lib/content/post-body-ui'
import { renderPage } from '@/lib/content/sections/registry'

// PostBody is now a thin dispatcher over the shared section registry
// (lib/content/sections/registry). The actual per-kind renderers live in the
// catalog so any content surface (news, blog, documentation, StandardContentPage)
// renders sections identically and new section kinds are added in one place.
// `headingId` is re-exported for the table-of-contents builders that import it
// from here, keeping their import paths unchanged.
export { headingId } from '@/lib/content/sections/inline'

export function PostBody({ body, lang = 'en' }: { body: PageItem[]; lang?: string }) {
  const ui = getPostBodyUi(lang)
  return <div className="flex flex-col gap-6">{renderPage(body, lang, ui)}</div>
}

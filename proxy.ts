import type { NextRequest, NextResponse } from "next/server";
import { nodePlace, placeKind } from "@/lib/hosting/place.mjs";
import { computerProxy } from "./proxy/computer";
import { serverProxy } from "./proxy/server";

// THE PROXY'S ENTRY (node step 744-1). The owner, 2026-11-14: «Конечно тот факт что прокси для сервера и прокси для локальной машины
// это разные файлы». Next.js 16 takes ONE proxy file (`proxy.ts` + `config`, never `middleware.ts`); this one only chooses, once per
// process, the file of the node's place — the record its installation wrote (`lib/hosting/place.mjs`, 741-2): `proxy/computer.ts` on
// a person's computer, `proxy/server.ts` on a dedicated server; what both do is `proxy/common.ts`. A record copied from another
// machine is not obeyed, a record the machine contradicts is obeyed — each said once in the log. Tests: `scripts/proxy-split.test.mjs`.
type Proxy = (request: NextRequest) => Promise<NextResponse>;
let chosen: Proxy | null = null;

function choose(): Proxy {
  const root = process.cwd();
  const kind = placeKind(root);
  const seen = nodePlace(root);
  if (seen.foreign) console.warn(`[proxy] the place record was written on another machine — not obeyed; this machine is «${kind}»`);
  else if (seen.mismatch) console.warn(`[proxy] the place record says «${kind}», the machine measures ${seen.mismatch} — the record is obeyed`);
  return kind === "server" ? serverProxy : computerProxy;
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  chosen ??= choose();
  return chosen(request);
}

// Match API routes (for the auth gate) AND content pages (for language routing).
// Exclude Next internals and any file with an extension (static assets, the
// webmanifest, favicons) — those are served directly.
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|.*\\..*).*)"],
};

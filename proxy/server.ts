// THE PROXY OF A DEDICATED SERVER (node step 744-1; the owner, 2026-11-14: «прокси для сервера и прокси для локальной машины это
// разные файлы»). Chosen by `proxy.ts` when the place record says «server». A server has NO quick tunnel and no temporary address
// (741-4): a tunnel name or an IP literal here is a forgery and gets no identity (741-3). nginx answers the bare IP itself with its
// card and `/api/health` (741-1) and passes only the names it matched; the own domain → sign-in everywhere; `localhost` is the owner
// only through the SSH window (741-5) — it arrives without nginx's edge mark. Every job is the common one (`proxy/common.ts`).
import type { NextRequest } from "next/server";
import type { NextResponse } from "next/server";
import { AUTH_FORM_PATHS, apiAuthGate, architectPagesGate, authFormRedirect, beforeDoors, languageRouter } from "./common";

export async function serverProxy(request: NextRequest): Promise<NextResponse> {
  const early = beforeDoors(request);
  if (early) return early;
  const { pathname } = request.nextUrl;

  // Job 0 — the sign-in links; Job 1 — the API gate.
  if (AUTH_FORM_PATHS.has(pathname)) return authFormRedirect(request);
  if (pathname.startsWith("/api")) return apiAuthGate(request);

  // Job 1.5 — the architect pages' gate.
  const architectGate = await architectPagesGate(request);
  if (architectGate) return architectGate;

  // Job 2 — language routing for everything else.
  return languageRouter(request);
}

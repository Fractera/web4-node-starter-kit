import localFont from "next/font/local";

// Shared font instances. Previously initialized in the root layout; after the
// static-rendering refactor (step 131) the root layout is a bare pass-through and
// each zone layout ([lang], (service)) owns its own <html>/<body>, so the font CSS
// variables are imported from here to avoid re-declaring the loaders.
//
// 707-4 (the owner 2026-11-09: a core build must not fail because Google Fonts did not answer — measured: a build with a dead network
// failed twice on «Failed to fetch `Geist` from Google Fonts»): Geist and Geist Mono come from npm (`@fontsource-variable/geist`,
// `@fontsource-variable/geist-mono`, 5.3.0, OFL-1.1 — the step-315 way), the latin subset as before; the build needs no network for them.
export const geistSans = localFont({
  src: "../node_modules/@fontsource-variable/geist/files/geist-latin-wght-normal.woff2",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
});
export const geistMono = localFont({
  src: "../node_modules/@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
});

// Applied on <body> (was the root layout body className).
export const bodyFontClass = `${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden`;

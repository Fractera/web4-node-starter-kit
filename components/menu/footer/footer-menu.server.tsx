import { ProjectFooter } from "@/components/shell/project-footer";
import { coreShellData } from "@/lib/shell/core-shell-data";

// ПОДВАЛ СТРАНИЦ АРХИТЕКТОРА — СВОЙ (узел, шаг 553). Вид — `components/shell/project-footer.tsx` (копия сайта), данные —
// `lib/shell/core-shell-data.ts`: только переключатели темы, ширины и языка, без ссылок проекта (владелец 2026-10-21: «Только
// переключатели (Рекомендую)»); выбор посетителя — в cookie проекта, как прежде.
// 🪦 285-3 «подвал ядра = подвал проекта» (дверь сайта `/api/shell/<язык>`) снят шагом 553 — git history этого файла.
export function FooterMenu({ lang }: { lang: string }) {
  return <ProjectFooter data={coreShellData(lang)} />;
}

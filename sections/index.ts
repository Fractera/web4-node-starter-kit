import type { SectionSet } from './contract'
import { p } from './kinds/p.server'
import { h2 } from './kinds/h2.server'
import { h3 } from './kinds/h3.server'
import { h4 } from './kinds/h4.server'
import { h5 } from './kinds/h5.server'
import { quote } from './kinds/quote.server'
import { list } from './kinds/list.server'
import { olist } from './kinds/olist.server'
import { figure } from './kinds/figure.server'
import { code } from './kinds/code.server'
import { note } from './kinds/note.server'
import { cta } from './kinds/cta.server'
import { domainLadder } from './kinds/domain-ladder.server'
import { servicePort } from './kinds/service-port.server'
import { designSection } from './kinds/design-section.server'
import { dialogSample } from './kinds/dialog-sample.server'
import { separator } from './kinds/separator.server'
import { deployBoard } from './kinds/deploy-board.server'
import { toolsTab } from './kinds/tools-tab.server'
import { projectsBoard } from './kinds/projects-board.server'
import { machineBoard } from './kinds/machine-board.server'
import { subscriptionsBoard } from './kinds/subscriptions-board.server'
import { nodePassport } from './kinds/node-passport.server'
import { a2aFeed } from './kinds/a2a-feed.server'
import { elementPreview } from './kinds/element-preview.server'
import { authGoogleSetup } from './kinds/auth-google-setup.server'
import { authResendSetup } from './kinds/auth-resend-setup.server'
import { callout } from './kinds/callout.server'
import { table } from './kinds/table.server'
import { docref } from './kinds/docref.server'
import { founder } from './kinds/founder.server'
import { columns } from './kinds/columns.server'
import { group } from './kinds/group.server'
import { heroBadge } from './kinds/hero-badge.server'
import { heroSplit } from './kinds/hero-split.server'
import { languageMarquee } from './kinds/language-marquee.server'
import { projectTypeMarquee } from './kinds/project-type-marquee.server'
import { badges } from './kinds/badges.server'
import { panel } from './kinds/panel.server'
import { metrics } from './kinds/metrics.server'
import { flow } from './kinds/flow.server'
import { personaCases } from './kinds/persona-cases.server'
import { problemSolution } from './kinds/problem-solution.server'
import { noBill } from './kinds/no-bill.server'
import { cards } from './kinds/cards.server'
import { card } from './kinds/card.server'
import { statement } from './kinds/statement.server'
import { invite } from './kinds/invite.server'
import { faq } from './kinds/faq.server'
import { toc } from './kinds/toc.server'
import { voiceField } from './kinds/voice-field.server'
import { workspace } from './kinds/workspace.server'
import { accordion, accordionItem } from './kinds/accordion.server'
import { benefitCards } from './kinds/benefit-cards.server'
import { splitPair } from './kinds/split-pair.server'
import { logoCards } from './kinds/logo-cards.server'
import { carousel } from './kinds/carousel.server'
import { support } from './kinds/support.server'
import { showcaseCarousel } from './kinds/showcase-carousel.server'
import { featureGrid } from './kinds/feature-grid.server'
import { promoBand } from './kinds/promo-band.server'
import { priceTable } from './kinds/price-table.server'
import { spotlightPair } from './kinds/spotlight-pair.server'
import { platformGrid } from './kinds/platform-grid.server'
import { chartArea } from './kinds/chart-area.server'
import { chartBar } from './kinds/chart-bar.server'
import { chartLine } from './kinds/chart-line.server'
import { chartPie } from './kinds/chart-pie.server'
import { chartRadar } from './kinds/chart-radar.server'
import { chartRadial } from './kinds/chart-radial.server'
import { chartTooltip } from './kinds/chart-tooltip.server'
import { orbitLayers } from './kinds/orbit-layers.server'
import { chat } from './kinds/chat.server'

// НАБОР СЕКЦИЙ ПРОЕКТА — единственный, и это осознанное решение (2026-08-14).
//
// 🔒 ПОЧЕМУ ЗДЕСЬ НЕТ ВЫБОРА ДИЗАЙНА. Он тут был: реестр наборов, манифест
// покрытия, наследование недостающего. Всё это обслуживало сценарий «несколько
// дизайнов на одном сервере», который владелец в обозримое время не планирует, —
// и было снесено, пока не обросло зависимостями. Машинерия под ненужный сценарий
// не бесплатна: её читает каждый, кто сюда заглянет, и обходит каждый, кто
// правит соседнее.
//
// 🔒 ЕСЛИ СЦЕНАРИЙ ВЕРНЁТСЯ, начинать надо отсюда: набор становится записью в
// карте, а `SectionSet` — частичным (`?` у ключей). Это одна правка в этом файле
// и одна в договоре; шестнадцать рендереров не трогаются вовсе — ради этого они
// и лежат по файлу на вид. Разбор того сценария сохранён в `SECTIONS.md`, чтобы
// следующая сессия не проектировала его заново.
export const SECTIONS: SectionSet = {
  p, h2, h3, h4, h5, quote, list, olist, figure, code, note, cta, callout, table, docref, founder, columns, group, heroBadge, heroSplit, badges, panel, metrics, flow, personaCases, problemSolution, cards, card, statement, invite, noBill, faq, toc, languageMarquee, projectTypeMarquee, voiceField, workspace, accordion, accordionItem, benefitCards, splitPair, logoCards, carousel, support, showcaseCarousel, featureGrid, promoBand, priceTable, spotlightPair, platformGrid, chartArea, chartBar, chartLine, chartPie, chartRadar, chartRadial, chartTooltip, orbitLayers, chat, domainLadder, servicePort, designSection, deployBoard, toolsTab, projectsBoard, machineBoard, subscriptionsBoard, nodePassport, a2aFeed, elementPreview, authGoogleSetup, authResendSetup, dialogSample, separator,
}

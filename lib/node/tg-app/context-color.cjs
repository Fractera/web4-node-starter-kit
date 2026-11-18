'use strict'
// THE COLOUR OF THE CONTEXT GAUGE (node step 788-2). The owner, 2026-11-18 (Telegram 612): «будет краснеть от начала и до конца максимально
// красный цвет достигается на отметке 75% если вдруг по какой-то причине переходит дальше то становится тёмно бордовым».
// From 0 % the hue walks from calm green toward red and reaches the brightest red exactly at 75 %; past 75 % — dark bordeaux.
// 🔒 ONE SOURCE AS TEXT: the Pult's page inlines `SOURCE` and the test runs the function made from it. ✗ 2026-11-18 14:08 (the owner's phone:
// «пульт завис»): the page inlined `contextColor.toString()` — the core's production build minifies this file, the function lost its name,
// the page's whole script failed to parse and the Pult hung on «Загружаю…». A string literal is never minified.
// HSL, not OKLCH: Telegram's web views on older phones paint HSL everywhere.

const SOURCE = "function contextColor(percent){var p=Number(percent);if(!isFinite(p)||p<0)p=0;if(p>75)return '#6e0b1e';" +
  "var hue=Math.round(140*(1-p/75));var light=Math.round(42+6*(1-p/75));return 'hsl('+hue+', 72%, '+light+'%)'}"

// eslint-disable-next-line no-new-func
const contextColor = new Function(`return (${SOURCE})`)()

module.exports = { contextColor, SOURCE }

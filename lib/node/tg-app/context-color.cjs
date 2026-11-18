'use strict'
// THE COLOUR OF THE CONTEXT GAUGE (node step 788-2). The owner, 2026-11-18 (Telegram 612): «будет краснеть от начала и до конца максимально
// красный цвет достигается на отметке 75% если вдруг по какой-то причине переходит дальше то становится тёмно бордовым».
// From 0 % the hue walks from calm green toward red and reaches the brightest red exactly at 75 %; past 75 % — dark bordeaux.
// One function: the Pult's page inlines this very text (`contextColor.toString()`), the test calls it — they cannot drift.
// HSL, not OKLCH: Telegram's web views on older phones paint HSL everywhere.

function contextColor(percent) {
  var p = Number(percent)
  if (!isFinite(p) || p < 0) p = 0
  if (p > 75) return '#6e0b1e'
  var hue = Math.round(140 * (1 - p / 75))
  var light = Math.round(42 + 6 * (1 - p / 75))
  return 'hsl(' + hue + ', 72%, ' + light + '%)'
}

module.exports = { contextColor }

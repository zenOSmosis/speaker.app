/**
 * @see https://stackoverflow.com/questions/7128675/from-green-to-red-color-depend-on-percentage
 */

const percentColors = [
  { pct: 0.0, color: { r: 0xff, g: 0x00, b: 0 } },
  { pct: 0.5, color: { r: 0xff, g: 0xff, b: 0 } },
  { pct: 1.0, color: { r: 0x00, g: 0xff, b: 0 } },
];

/**
 * Retrieves a color from red to green, depending on the given strength of the
 * float value of 0.0 - 1.0.
 *
 * @param {number} pct Integer or float value of 0.0 - 1.0
 * @param {boolean} inReverse? [optional; default = false] If set, highest
 * strength is red.
 * @return {string} rgb(...) color string
 */
export default function getPercentColor(pct, inReverse = false) {
  if (inReverse) {
    pct = 1 - pct;
  }

  for (var i = 1; i < percentColors.length - 1; i++) {
    if (pct < percentColors[i].pct) {
      break;
    }
  }
  const lower = percentColors[i - 1];
  const upper = percentColors[i];
  const range = upper.pct - lower.pct;
  const rangePct = (pct - lower.pct) / range;
  const pctLower = 1 - rangePct;
  const pctUpper = rangePct;
  const color = {
    r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
    g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
    b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper),
  };
  return "rgb(" + [color.r, color.g, color.b].join(",") + ")";
}
